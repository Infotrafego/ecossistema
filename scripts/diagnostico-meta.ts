/**
 * Diagnóstico do conector Meta · onde há entrega e o que a API devolve
 *
 *   node scripts/run.cjs scripts/diagnostico-meta.ts
 *   node scripts/run.cjs scripts/diagnostico-meta.ts --desde 2025-01-01 --ate 2026-09-18
 *
 * Serve pra responder duas perguntas que o sync sozinho não responde quando
 * volta vazio: (1) a conta TEM histórico de entrega em algum período? e (2) os
 * `action_type` que ela usa estão todos traduzidos em lib/meta-ads/actions.ts?
 *
 * Barato de propósito: agrega no nível de campanha e sem quebra por dia, então
 * custa 1–2 chamadas em vez das dezenas que o sync diário consome.
 */

import { createServiceClient } from '@/lib/supabase/service';
import { normalizarAdAccountId } from '@/lib/meta-ads/config';
import { metaGetAll, Orcamento } from '@/lib/meta-ads/http';
import { actionsNaoMapeadas, etapasDoInsight, type MetaInsightRow } from '@/lib/meta-ads/actions';

const args = process.argv.slice(2);
function arg(nome: string, padrao: string): string {
  const i = args.indexOf(`--${nome}`);
  return i >= 0 && args[i + 1] ? args[i + 1] : padrao;
}

const hoje = new Date().toISOString().slice(0, 10);
const desde = arg('desde', new Date(Date.now() - 365 * 86_400_000).toISOString().slice(0, 10));
const ate = arg('ate', hoje);

async function main() {
  const supabase = createServiceClient();
  const { data: clientes } = await supabase
    .from('clients')
    .select('name, meta_ad_account_id')
    .eq('active', true)
    .not('meta_ad_account_id', 'is', null);

  const orcamento = new Orcamento(20);

  for (const cliente of clientes ?? []) {
    const conta = normalizarAdAccountId(cliente.meta_ad_account_id!);
    if (conta.includes('PREENCHER')) continue;

    console.log(`\n=== ${cliente.name} · ${conta} ===`);
    console.log(`janela: ${desde} → ${ate}\n`);

    // Sem `time_increment`: um total por campanha no período inteiro.
    const linhas = await metaGetAll<MetaInsightRow>(
      `/${conta}/insights`,
      {
        level: 'campaign',
        time_range: JSON.stringify({ since: desde, until: ate }),
        fields: 'campaign_id,campaign_name,impressions,clicks,spend,actions,action_values',
        limit: 200,
      },
      orcamento,
      5,
    );

    if (linhas.length === 0) {
      console.log('Nenhum insight no período. A conta não teve entrega nesta janela.');
      continue;
    }

    let impressoes = 0;
    let spend = 0;
    const tiposVistos = new Map<string, number>();
    const naoMapeados = new Set<string>();

    for (const linha of linhas) {
      impressoes += Number(linha.impressions) || 0;
      spend += Number(linha.spend) || 0;
      for (const acao of linha.actions ?? []) {
        tiposVistos.set(acao.action_type, (tiposVistos.get(acao.action_type) ?? 0) + Number(acao.value || 0));
      }
      for (const t of actionsNaoMapeadas(linha)) naoMapeados.add(t);
    }

    console.log(`${linhas.length} campanha(s) com entrega`);
    console.log(`impressões: ${impressoes.toLocaleString('pt-BR')} · investido: R$ ${spend.toFixed(2)}`);

    const porVolume = [...linhas].sort(
      (a, b) => (Number(b.impressions) || 0) - (Number(a.impressions) || 0),
    );
    console.log('\nTop 5 campanhas por impressão:');
    for (const l of porVolume.slice(0, 5)) {
      const nome = String((l as Record<string, unknown>).campaign_name ?? l.campaign_id);
      console.log(
        `  ${Number(l.impressions).toLocaleString('pt-BR').padStart(10)} imp · ` +
          `R$ ${Number(l.spend).toFixed(2).padStart(9)} · ${nome}`,
      );
    }

    console.log('\naction_type devolvidos pela conta (total no período):');
    for (const [tipo, valor] of [...tiposVistos].sort((a, b) => b[1] - a[1])) {
      const traduzido = etapasDoInsight({ date_start: '', actions: [{ action_type: tipo, value: '1' }] });
      // `impressao`/`alcance`/`clique` vêm dos campos, não da action — só conta
      // como traduzido se a action em si virou alguma outra etapa.
      const etapa = Object.keys(traduzido).find((e) => !['impressao', 'alcance', 'clique'].includes(e));
      console.log(
        `  ${valor.toLocaleString('pt-BR').padStart(9)} · ${tipo.padEnd(52)} → ${etapa ?? '(não mapeado)'}`,
      );
    }

    if (naoMapeados.size > 0) {
      console.log(`\n⚠ ${naoMapeados.size} action_type SEM tradução em lib/meta-ads/actions.ts:`);
      for (const t of naoMapeados) console.log(`   ${t}`);
      console.log('   → se algum for etapa de funil deste cliente, adicionar ao MAPA.');
    } else {
      console.log('\n✓ Todos os action_type da conta estão mapeados.');
    }

    // Período com entrega mais recente, pra saber que janela usar no sync.
    const mensal = await metaGetAll<MetaInsightRow>(
      `/${conta}/insights`,
      {
        level: 'account',
        time_range: JSON.stringify({ since: desde, until: ate }),
        time_increment: 'monthly',
        fields: 'impressions,spend',
        limit: 50,
      },
      orcamento,
      3,
    );

    if (mensal.length > 0) {
      console.log('\nEntrega por mês:');
      for (const m of mensal) {
        console.log(
          `  ${m.date_start} → ${m.date_stop ?? ''} · ` +
            `${Number(m.impressions || 0).toLocaleString('pt-BR')} imp · R$ ${Number(m.spend || 0).toFixed(2)}`,
        );
      }
    }
  }

  console.log(`\nChamadas à Meta nesta execução: ${orcamento.chamadas}`);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
