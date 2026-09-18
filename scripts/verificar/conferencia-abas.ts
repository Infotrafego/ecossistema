/**
 * Conferência ponta a ponta contra o banco REAL.
 *
 *   node scripts/run.cjs scripts/verificar/conferencia-abas.ts
 *
 * As verificações em scripts/verificar/*.ts cobrem a lógica pura com dados
 * sintéticos. Esta aqui responde a outra pergunta, que só o dado real
 * responde: as 5 abas fecham no MESMO número?
 *
 * É o critério central do briefing — Visão Geral, Criativos, Públicos,
 * Campanhas e Otimizações são agregações da mesma base, e divergir entre elas
 * é o bug que destrói a confiança do gestor no dashboard.
 *
 * Usa service role porque roda fora de request (sem sessão). Só lê.
 */

import { createServiceClient } from '@/lib/supabase/service';
import { getDadosIntel } from '@/lib/data/intel';
import { fmtMoeda, fmtNum } from '@/lib/intel';

let falhas = 0;

function checar(nome: string, condicao: boolean, detalhe?: unknown) {
  if (condicao) console.log(`  ✓ ${nome}`);
  else {
    falhas++;
    console.log(`  ✗ ${nome}`);
    if (detalhe !== undefined) console.log(`      ${JSON.stringify(detalhe)}`);
  }
}

/** Centavos: comparar float de dinheiro com === é receita de falso negativo. */
function mesmoValor(a: number, b: number, tolerancia = 0.011): boolean {
  return Math.abs(a - b) <= tolerancia;
}

async function main() {
  const supabase = createServiceClient();

  const { data: cliente } = await supabase
    .from('clients')
    .select('id, name')
    .eq('slug', 'infotrafego')
    .single();

  if (!cliente) throw new Error('cliente piloto não encontrado');

  // Janela configuravel: o padrao cobre os ultimos 30 dias, que e o recorte
  // que o dashboard abre. `--desde/--ate` permitem conferir outro periodo.
  const arg = (n: string) => {
    const i = process.argv.indexOf(`--${n}`);
    return i >= 0 ? process.argv[i + 1] : undefined;
  };
  const hoje = new Date().toISOString().slice(0, 10);
  const filtros = {
    clientId: cliente.id,
    funilId: null,
    desde: arg('desde') ?? new Date(Date.now() - 29 * 86_400_000).toISOString().slice(0, 10),
    ate: arg('ate') ?? hoje,
  };

  const dados = await getDadosIntel(filtros, supabase as never);

  console.log(`\n${cliente.name} · ${filtros.desde} → ${filtros.ate}\n`);
  console.log(`  combos (ads)   : ${dados.combos.length}`);
  console.log(`  criativos      : ${dados.criativos.length}`);
  console.log(`  públicos       : ${dados.publicos.length}`);
  console.log(`  campanhas      : ${dados.campanhas.length}`);
  console.log(`  dias na série  : ${dados.diario.length}`);
  console.log(`  investido      : ${fmtMoeda(dados.total.spend, 2)}`);
  console.log(`  impressões     : ${fmtNum(dados.total.impressoes)}`);
  console.log(`  leads          : ${fmtNum(dados.total.leads)}`);
  console.log('');

  const soma = (xs: Array<{ spend: number }>) => xs.reduce((s, x) => s + x.spend, 0);
  const somaLeads = (xs: Array<{ leads: number }>) => xs.reduce((s, x) => s + x.leads, 0);

  checar('não veio vazio', !dados.vazio);

  checar(
    'investido: criativos = total',
    mesmoValor(soma(dados.criativos), dados.total.spend),
    { criativos: soma(dados.criativos), total: dados.total.spend },
  );
  checar(
    'investido: públicos = total',
    mesmoValor(soma(dados.publicos), dados.total.spend),
    { publicos: soma(dados.publicos), total: dados.total.spend },
  );
  checar(
    'investido: campanhas = total',
    mesmoValor(soma(dados.campanhas), dados.total.spend),
    { campanhas: soma(dados.campanhas), total: dados.total.spend },
  );
  checar(
    'investido: série diária = total',
    mesmoValor(dados.diario.reduce((s, d) => s + d.spend, 0), dados.total.spend),
    { diario: dados.diario.reduce((s, d) => s + d.spend, 0), total: dados.total.spend },
  );

  checar('leads: criativos = total', somaLeads(dados.criativos) === dados.total.leads);
  checar('leads: públicos = total', somaLeads(dados.publicos) === dados.total.leads);
  checar('leads: campanhas = total', somaLeads(dados.campanhas) === dados.total.leads);

  // Estes tres so fazem sentido na janela completa do historico REAL, onde os
  // numeros foram conferidos contra a resposta da API.
  if (filtros.desde === '2025-12-01' && filtros.ate === '2026-09-18') {
    checar(
      'investido bate com o que a Meta reportou (R$ 22.031,77)',
      mesmoValor(dados.total.spend, 22031.77),
      dados.total.spend,
    );
    checar('leads batem com o consolidado da Meta (181)', dados.total.leads === 181, dados.total.leads);
    checar('impressões batem (264.172)', dados.total.impressoes === 264172, dados.total.impressoes);
  }

  // Cada combo é um ad; nenhum pode aparecer duas vezes.
  const ids = dados.combos.map((c) => c.id);
  checar('nenhum ad duplicado entre os combos', new Set(ids).size === ids.length);

  console.log('');
  if (falhas > 0) {
    console.log(`${falhas} FALHA(S).`);
    process.exit(1);
  }
  console.log('Todas as abas fecham no mesmo número.');
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
