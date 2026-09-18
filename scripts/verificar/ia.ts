/**
 * Verificação da lógica da Fase 2c · fadiga, regras automáticas e orçamento
 *
 *   node scripts/run.cjs scripts/verificar/ia.ts
 *
 * Nada aqui toca a API do Claude nem a da Meta: são as funções puras que
 * decidem o que fazer. É justamente essa parte que precisa estar certa antes
 * de qualquer automação encostar em verba de cliente.
 */

import { diagnosticar, type PontoDiario } from '@/lib/fadiga';
import { avaliarRegra, valorNoDia, descreverRegra, type Entidade, type RegraAvaliavel } from '@/lib/regras';
import { calcularMeta, calcularOrcamento, diasNoMes } from '@/lib/orcamento';
import { porDiaDaSemana, alertasAtivos } from '@/lib/analise';
import { derivar, type LinhaBruta } from '@/lib/intel';

let falhas = 0;
let total = 0;

function ok(nome: string, condicao: boolean, detalhe?: unknown) {
  total++;
  if (condicao) console.log(`  ✓ ${nome}`);
  else {
    falhas++;
    console.log(`  ✗ ${nome}`);
    if (detalhe !== undefined) console.log(`      ${JSON.stringify(detalhe)}`);
  }
}

function eq(nome: string, recebido: unknown, esperado: unknown) {
  ok(nome, JSON.stringify(recebido) === JSON.stringify(esperado), { recebido, esperado });
}

function secao(t: string) {
  console.log(`\n${t}`);
}

/** Série diária sintética com CTR e frequência controlados. */
function serie(
  dias: number,
  fn: (i: number) => { ctr: number; freq: number; cpc: number },
): PontoDiario[] {
  return Array.from({ length: dias }, (_, i) => {
    const { ctr, freq, cpc } = fn(i);
    const impressoes = 10_000;
    const cliques = Math.round(impressoes * ctr);
    return {
      date: `2026-09-${String(i + 1).padStart(2, '0')}`,
      impressoes,
      cliques,
      spend: cliques * cpc,
      frequencia: freq,
    };
  });
}

// ── Fadiga ───────────────────────────────────────────────────────────────────
secao('Diagnóstico de fadiga criativa');
{
  const novo = serie(3, () => ({ ctr: 0.02, freq: 1.1, cpc: 1 }));
  const dNovo = diagnosticar(novo);
  ok('criativo novo não recebe score', dNovo.score === 0 && dNovo.status === 'saudavel');
  ok('e o motivo explica que falta histórico', dNovo.motivos[0].includes('curto'));

  const estavel = serie(14, () => ({ ctr: 0.02, freq: 1.4, cpc: 1 }));
  const dEstavel = diagnosticar(estavel);
  eq('série estável → saudável', dEstavel.status, 'saudavel');
  eq('sem queda de CTR', dEstavel.quedaCtr, 0);

  // CTR cai de 3% para ~1,2% e a frequência sobe de 1,2 para 4,0.
  const saturado = serie(14, (i) => ({
    ctr: 0.03 - i * 0.0014,
    freq: 1.2 + i * 0.21,
    cpc: 1 + i * 0.06,
  }));
  const dSaturado = diagnosticar(saturado);
  eq('criativo saturado → crítico', dSaturado.status, 'critico');
  ok('score alto', dSaturado.score >= 60, dSaturado.score);
  ok('queda de CTR entra nos motivos', dSaturado.motivos.some((m) => m.includes('CTR')));
  ok('frequência entra nos motivos', dSaturado.motivos.some((m) => m.includes('Frequência')));
  ok('recomenda pausar/substituir', /Pausar|Substituir/.test(dSaturado.recomendacao));

  // Queda de CTR moderada, sem frequência alta: atenção, não crítico.
  const cansando = serie(14, (i) => ({ ctr: 0.02 - i * 0.00045, freq: 1.5, cpc: 1 }));
  const dCansando = diagnosticar(cansando);
  eq('queda moderada sem saturação → atenção', dCansando.status, 'atencao');

  // O falso positivo que o score combinado existe pra evitar: CTR normalizando
  // depois do pico de novidade, com frequência baixa e CPC estável.
  const normalizando = serie(14, (i) => ({
    ctr: i < 2 ? 0.026 : 0.021,
    freq: 1.2,
    cpc: 1,
  }));
  const dNorm = diagnosticar(normalizando);
  ok(
    'normalização pós-pico não vira crítico',
    dNorm.status !== 'critico',
    { score: dNorm.score, status: dNorm.status },
  );

  const semVolume = serie(14, () => ({ ctr: 0.02, freq: 1.2, cpc: 1 })).map((p) => ({
    ...p,
    impressoes: 30,
    cliques: 1,
  }));
  eq('amostra pequena não calcula CTR', diagnosticar(semVolume).quedaCtr, null);
}

// ── Regras automáticas ───────────────────────────────────────────────────────
secao('Regras automáticas');
{
  const dia = (date: string, over: Partial<Entidade['dias'][0]> = {}) => ({
    date,
    impressoes: 5000,
    cliques: 100,
    spend: 200,
    leads: 4,
    mqls: 2,
    frequencia: 1.5,
    ...over,
  });

  const regraCpc: RegraAvaliavel = {
    id: 'r1',
    nome: 'CPC alto por 3 dias',
    escopo: 'adset',
    condicoes: [{ metrica: 'cpc', operador: 'gt', valor: 3.5 }],
    operadorLogico: 'e',
    janelaDias: 3,
    gastoMinimo: 100,
    acao: 'pausar',
  };

  ok(
    'descrição legível da regra',
    descreverRegra(regraCpc) === 'Se CPC > 3.5 por 3 dia(s) → pausar',
    descreverRegra(regraCpc),
  );

  // CPC = spend/cliques. 500/100 = 5 → acima de 3,5 nos três dias.
  const caroSempre: Entidade = {
    id: 'as1',
    nome: 'Ad set caro',
    tipo: 'adset',
    dias: ['2026-09-10', '2026-09-11', '2026-09-12'].map((d) => dia(d, { spend: 500 })),
  };

  // Um dia muito caro puxa a MÉDIA acima de 3,5, mas dois dias estão abaixo.
  const picoIsolado: Entidade = {
    id: 'as2',
    nome: 'Ad set com pico',
    tipo: 'adset',
    dias: [
      dia('2026-09-10', { spend: 900 }),
      dia('2026-09-11', { spend: 120 }),
      dia('2026-09-12', { spend: 100 }),
    ],
  };

  const r1 = avaliarRegra(regraCpc, [caroSempre, picoIsolado]);
  eq('2 entidades avaliadas', r1.avaliados, 2);
  eq('só a que é cara em TODOS os dias casa', r1.casados.map((c) => c.entidadeId), ['as1']);
  ok('motivo cita a janela', r1.casados[0].motivo.includes('3 dia'));
  ok('evidência traz um valor por dia', r1.casados[0].evidencia[0].valoresPorDia.length === 3);

  // Escopo errado nunca é avaliado.
  const campanha: Entidade = { ...caroSempre, id: 'c1', tipo: 'campaign' };
  eq('escopo diferente é ignorado', avaliarRegra(regraCpc, [campanha]).avaliados, 0);

  // Guardas: janela incompleta e gasto abaixo do mínimo.
  const curto: Entidade = { id: 'as3', nome: 'Novo', tipo: 'adset', dias: [dia('2026-09-12', { spend: 500 })] };
  const r2 = avaliarRegra(regraCpc, [curto]);
  eq('janela incompleta não é avaliada', r2.avaliados, 0);
  ok('e o descarte diz por quê', r2.descartados[0].motivo.includes('dia(s) com entrega'));

  const barato: Entidade = {
    id: 'as4',
    nome: 'Pouca verba',
    tipo: 'adset',
    dias: ['2026-09-10', '2026-09-11', '2026-09-12'].map((d) =>
      dia(d, { spend: 10, cliques: 1 }),
    ),
  };
  const r3 = avaliarRegra(regraCpc, [barato]);
  eq('gasto abaixo do mínimo é descartado', r3.avaliados, 0);
  ok('e o descarte cita o mínimo', r3.descartados[0].motivo.includes('mínimo'));

  // `null` nunca casa: sem lead, CPL é indefinido — não infinito.
  const semLead: Entidade = {
    id: 'as5',
    nome: 'Sem lead',
    tipo: 'adset',
    dias: ['2026-09-10', '2026-09-11', '2026-09-12'].map((d) => dia(d, { leads: 0, mqls: 0 })),
  };
  const regraCpl: RegraAvaliavel = { ...regraCpc, condicoes: [{ metrica: 'cpl', operador: 'gt', valor: 50 }] };
  eq('CPL indefinido não dispara pausa', avaliarRegra(regraCpl, [semLead]).casados.length, 0);
  eq('valorNoDia devolve null pra CPL sem lead', valorNoDia(semLead.dias[0], 'cpl'), null);

  // OU: basta uma condição valer em todos os dias.
  const regraOu: RegraAvaliavel = {
    ...regraCpc,
    operadorLogico: 'ou',
    condicoes: [
      { metrica: 'cpc', operador: 'gt', valor: 99 },
      { metrica: 'frequencia', operador: 'gt', valor: 1.2 },
    ],
  };
  eq('operador OU casa com uma condição só', avaliarRegra(regraOu, [caroSempre]).casados.length, 1);

  const regraE: RegraAvaliavel = { ...regraOu, operadorLogico: 'e' };
  eq('operador E exige as duas', avaliarRegra(regraE, [caroSempre]).casados.length, 0);
}

// ── Orçamento e metas ────────────────────────────────────────────────────────
secao('Orçamento e metas');
{
  eq('dias de setembro', diasNoMes(2026, 9), 30);
  eq('fevereiro de ano bissexto', diasNoMes(2024, 2), 29);
  eq('fevereiro comum', diasNoMes(2026, 2), 28);

  // Metade do mês, metade da verba: no ritmo.
  const noRitmo = calcularOrcamento({
    tipo: 'pos_pago', verbaMensal: 12000, saldoPrepago: 0,
    gastoMtd: 6000, diasDecorridos: 15, diasDoMes: 30,
  });
  eq('forecast bate a verba', noRitmo.forecast, 12000);
  eq('status verde', noRitmo.status, 'verde');
  eq('saldo restante', noRitmo.saldo, 6000);

  const estourando = calcularOrcamento({
    tipo: 'pos_pago', verbaMensal: 12000, saldoPrepago: 0,
    gastoMtd: 9000, diasDecorridos: 15, diasDoMes: 30,
  });
  eq('forecast projeta estouro', estourando.forecast, 18000);
  eq('status vermelho', estourando.status, 'vermelho');
  ok('ação diz quanto gastar por dia', estourando.acao.includes('/dia'));

  const sobrando = calcularOrcamento({
    tipo: 'pos_pago', verbaMensal: 12000, saldoPrepago: 0,
    gastoMtd: 3000, diasDecorridos: 15, diasDoMes: 30,
  });
  eq('subutilização vira azul', sobrando.status, 'azul');

  const prepago = calcularOrcamento({
    tipo: 'pre_pago', verbaMensal: 12000, saldoPrepago: 4000,
    gastoMtd: 6000, diasDecorridos: 15, diasDoMes: 30,
  });
  eq('pré-pago calcula quando zera (4000 / 400 por dia)', prepago.diasAteZerar, 10);

  // Meta positiva: 300 leads no mês, 100 feitos em 10 dias → esperado 100.
  const metaOk = calcularMeta(
    { chave: 'lead', label: 'Leads', meta: 300, realizado: 100, tipo: 'positivo', formato: 'numero' },
    10, 30,
  );
  eq('esperado pra hoje', metaOk.esperadoHoje, 100);
  eq('meta no ritmo fica verde', metaOk.status, 'verde');
  eq('projeção fecha na meta', metaOk.projecaoFimDoMes, 300);

  const metaAtrasada = calcularMeta(
    { chave: 'lead', label: 'Leads', meta: 300, realizado: 50, tipo: 'positivo', formato: 'numero' },
    10, 30,
  );
  eq('metade do esperado fica vermelho', metaAtrasada.status, 'vermelho');

  // Investimento é 'custo': gastar MAIS que o esperado é ruim, não ótimo.
  const superinvestindo = calcularMeta(
    { chave: 'spend', label: 'Investimento', meta: 12000, realizado: 6000, tipo: 'custo', formato: 'moeda' },
    10, 30,
  );
  eq('gasto 50% acima do ritmo → vermelho', superinvestindo.status, 'vermelho');

  const mesmoNumeroComoPositivo = calcularMeta(
    { chave: 'x', label: 'X', meta: 12000, realizado: 6000, tipo: 'positivo', formato: 'numero' },
    10, 30,
  );
  ok(
    'o MESMO número é verde como métrica positiva',
    mesmoNumeroComoPositivo.status === 'verde' && superinvestindo.status === 'vermelho',
  );
}

// ── Dia da semana e alertas ──────────────────────────────────────────────────
secao('Visão por dia da semana e alertas');
{
  // 2026-09-14 é segunda; 19 e 20 são sábado e domingo.
  const diario = [
    { date: '2026-09-14', spend: 100, leads: 10, mqls: 5, agend: 2, reunioes: 1, vendas: 1 },
    { date: '2026-09-15', spend: 100, leads: 8, mqls: 4, agend: 1, reunioes: 1, vendas: 0 },
    { date: '2026-09-19', spend: 100, leads: 2, mqls: 1, agend: 0, reunioes: 0, vendas: 0 },
    { date: '2026-09-21', spend: 100, leads: 6, mqls: 3, agend: 1, reunioes: 1, vendas: 0 },
  ];
  const semana = porDiaDaSemana(diario);

  const segunda = semana.find((s) => s.dow === 1)!;
  eq('duas segundas agrupadas', segunda.dias, 2);
  eq('leads somados na segunda', segunda.leads, 16);
  ok('segunda é o melhor dia (1 venda)', segunda.melhor);

  const sabado = semana.find((s) => s.dow === 6)!;
  ok('sábado é o pior', sabado.pior);
  eq('nome em português', sabado.nome, 'sábado');

  const base: LinhaBruta = {
    id: 'x', nome: 'Criativo X', status: 'active',
    spend: 0, impressoes: 10000, cliques: 200, pageViews: 150,
    leads: 0, mqls: 0, agend: 0,
  };

  const alertas = alertasAtivos([
    derivar({ ...base, id: 'a', nome: 'Queimando verba', spend: 500 }),
    derivar({ ...base, id: 'b', nome: 'Ruído', spend: 5 }),
    derivar({ ...base, id: 'c', nome: 'Campeão', spend: 200, leads: 20, mqls: 14, agend: 3 }),
  ]);

  ok('criativo que gastou sem lead vira alerta', alertas.some((a) => a.nome === 'Queimando verba'));
  ok('item com R$ 5 não polui a lista', !alertas.some((a) => a.nome === 'Ruído'));
  ok('campeão aparece como escalar', alertas.some((a) => a.nome === 'Campeão' && a.tipo === 'escalar'));
  eq('cortar vem antes de escalar', alertas[0].tipo, 'cortar');
}

console.log(`\n${total - falhas}/${total} verificações passaram.`);
if (falhas > 0) {
  console.log(`${falhas} FALHA(S).`);
  process.exit(1);
}
