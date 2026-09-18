/**
 * Sync manual do Meta Ads · uso operacional
 *
 *   node scripts/run.cjs scripts/sync-manual.ts --acesso   # só valida token/conta (1 chamada)
 *   node scripts/run.cjs scripts/sync-manual.ts            # sync dos últimos 7 dias
 *   node scripts/run.cjs scripts/sync-manual.ts --dias 30
 *
 * Existe porque disparar o sync pela UI exige o app no ar e sessão de admin.
 * Para o primeiro run — o que valida credencial e mapeamento de actions — um
 * script direto é mais fácil de ler e de abortar.
 */

import { createServiceClient } from '@/lib/supabase/service';
import { verificarAcesso } from '@/lib/meta-ads/client';
import { Orcamento } from '@/lib/meta-ads/http';
import { normalizarAdAccountId } from '@/lib/meta-ads/config';
import { syncClient } from '@/lib/meta-ads/sync';

const args = process.argv.slice(2);
const soAcesso = args.includes('--acesso');
// Entidades mudam pouco; pular o re-sync delas economiza cota e minutos.
const soMetricas = args.includes('--so-metricas');
const dias = Number(args[args.indexOf('--dias') + 1]) || 7;

function iso(d: Date) {
  return d.toISOString().slice(0, 10);
}

function arg(nome: string): string | undefined {
  const i = args.indexOf(`--${nome}`);
  return i >= 0 ? args[i + 1] : undefined;
}

/** Janela explícita vence o atalho de dias — útil pra recuperar histórico. */
const desdeArg = arg('desde');
const ateArg = arg('ate');

async function main() {
  const supabase = createServiceClient();

  const { data: clientes, error } = await supabase
    .from('clients')
    .select('id, name, meta_ad_account_id')
    .eq('active', true)
    .not('meta_ad_account_id', 'is', null);

  if (error) throw new Error(error.message);

  const alvos = (clientes ?? []).filter(
    (c) => c.meta_ad_account_id && !c.meta_ad_account_id.includes('PREENCHER'),
  );

  if (alvos.length === 0) {
    console.log('Nenhum cliente com conta Meta configurada.');
    return;
  }

  const orcamento = new Orcamento();

  for (const cliente of alvos) {
    const conta = normalizarAdAccountId(cliente.meta_ad_account_id!);
    console.log(`\n=== ${cliente.name} · ${conta} ===`);

    try {
      const info = await verificarAcesso(conta, orcamento);
      // account_status 1 = ativa; 2 = desabilitada; 3 = unsettled.
      console.log(
        `  acesso OK · "${info.name}" · moeda ${info.currency} · account_status ${info.account_status}`,
      );
    } catch (e) {
      console.log(`  ACESSO FALHOU: ${e instanceof Error ? e.message : String(e)}`);
      continue;
    }

    if (soAcesso) continue;

    const desde = desdeArg ?? iso(new Date(Date.now() - dias * 86_400_000));
    const ate = ateArg ?? iso(new Date());
    console.log(`  sincronizando ${desde} → ${ate} …`);

    const r = await syncClient(cliente.id, conta, {
      desde,
      ate,
      orcamento,
      somenteMetricas: soMetricas,
    });
    console.log(
      `  ${r.status} · ${r.entidades} entidades · ${r.linhas} linhas · ` +
        `${r.chamadas} chamadas · pico de cota ${r.picoDeCota ?? '—'}% · ${r.duracaoMs}ms`,
    );
    if (r.erro) console.log(`  erro: ${r.erro}`);
  }

  console.log(`\nTotal de chamadas à Meta nesta execução: ${orcamento.chamadas}`);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
