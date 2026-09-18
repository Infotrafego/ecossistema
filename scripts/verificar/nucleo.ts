/**
 * Verificação da lógica pura · roda de verdade, sem mock de banco nem de API
 *
 *   node scripts/run.cjs scripts/verificar/nucleo.ts
 *
 * Cobre o que o prompt de implementação exige checar executando: métricas,
 * inferência de funil, montagem do cone, tradução das actions da Meta e os
 * filtros de período. Sai com código 1 se qualquer asserção falhar, pra poder
 * entrar no CI depois.
 */

import { intervaloDoPreset, lerFiltros, periodoAnterior, diasDoPeriodo } from '@/lib/filtros';
import { montarCone, etapasEfetivas, projecoesComerciais } from '@/lib/cone';
import { reconhecer, ordenarEtapas, type ConfigFunil } from '@/lib/funil';
import { derivar, somarLinhas, totalizar, valorDaEtapa, type LinhaBruta } from '@/lib/intel';
import { etapasDoInsight, conversaoPrimaria, receitaDoInsight, actionsNaoMapeadas } from '@/lib/meta-ads/actions';
import { agregarInsights } from '@/lib/meta-ads/sync';
import { fatiarJanela } from '@/lib/meta-ads/client';
import { kpisDoFunil } from '@/lib/funil-kpis';

let falhas = 0;
let total = 0;

function ok(nome: string, condicao: boolean, detalhe?: unknown) {
  total++;
  if (condicao) {
    console.log(`  ✓ ${nome}`);
  } else {
    falhas++;
    console.log(`  ✗ ${nome}`);
    if (detalhe !== undefined) console.log(`      ${JSON.stringify(detalhe)}`);
  }
}

function eq(nome: string, recebido: unknown, esperado: unknown) {
  const a = JSON.stringify(recebido);
  const b = JSON.stringify(esperado);
  ok(nome, a === b, { recebido, esperado });
}

function secao(titulo: string) {
  console.log(`\n${titulo}`);
}

// ── Filtros ──────────────────────────────────────────────────────────────────
secao('Filtros globais');
{
  const hoje = new Date('2026-09-18T12:00:00Z');

  eq('7d inclui hoje e soma 7 datas', intervaloDoPreset('7d', hoje), {
    desde: '2026-09-12',
    ate: '2026-09-18',
  });
  eq('30d', intervaloDoPreset('30d', hoje), { desde: '2026-08-20', ate: '2026-09-18' });
  eq('mês corrente', intervaloDoPreset('mes', hoje), { desde: '2026-09-01', ate: '2026-09-18' });
  eq('mês anterior fecha no último dia', intervaloDoPreset('mes_anterior', hoje), {
    desde: '2026-08-01',
    ate: '2026-08-31',
  });

  eq('dias do período contam as pontas', diasDoPeriodo({ desde: '2026-09-12', ate: '2026-09-18' }), 7);

  eq(
    'período anterior tem a mesma duração e termina na véspera',
    periodoAnterior({ desde: '2026-09-12', ate: '2026-09-18' }),
    { desde: '2026-09-05', ate: '2026-09-11' },
  );

  const invertido = lerFiltros({ periodo: 'custom', de: '2026-09-18', ate: '2026-09-01' }, hoje);
  eq('intervalo invertido é corrigido', [invertido.desde, invertido.ate], ['2026-09-01', '2026-09-18']);

  const lixo = lerFiltros({ periodo: 'ontem-ou-sei-la', de: 'não-é-data' }, hoje);
  ok('preset inválido cai no padrão de 30d', lixo.preset === '30d' && lixo.desde === '2026-08-20');
}

// ── Reconhecimento de funil ──────────────────────────────────────────────────
secao('Reconhecimento de funil');
{
  const aquisicao = reconhecer([
    'impressao', 'clique', 'page_view', 'form_iniciado', 'aplicacao_completa',
    'mql', 'lead_qualificado', 'agendamento', 'call_realizada', 'proposta_enviada', 'venda',
  ]);
  eq('sessão estratégica', [aquisicao.familia, aquisicao.subObjetivo], ['captacao', 'sessao_estrategica']);
  eq('marcadores da sessão estratégica', [aquisicao.marcadorMkt, aquisicao.marcadorCom], ['mql', 'venda']);
  ok('confiança alta com 11 campos e 2 marcadores', aquisicao.confianca === 'alta');

  const venda = reconhecer(['impressao', 'clique', 'page_view', 'vis_produto', 'checkout_iniciado', 'compra']);
  eq('venda direta digital', [venda.familia, venda.subObjetivo], ['venda_direta', 'produto_digital']);

  const distrib = reconhecer(['impressao', 'alcance', 'vv_25', 'vv_50', 'vv_75', 'vv_complete', 'save']);
  eq('distribuição C2', [distrib.familia, distrib.subObjetivo], ['distribuicao', 'c2_nutricao']);

  const lancamento = reconhecer([
    'impressao', 'clique', 'lead', 'aquecimento_view', 'lembrete_view', 'carrinho_aberto', 'venda',
  ]);
  eq('lançamento tradicional', [lancamento.familia, lancamento.subObjetivo], [
    'lancamento', 'lancamento_tradicional_3wb',
  ]);

  eq(
    'ordenação canônica das etapas',
    ordenarEtapas(['venda', 'impressao', 'mql', 'clique']),
    ['impressao', 'clique', 'mql', 'venda'],
  );
}

// ── Actions da Meta → etapas ─────────────────────────────────────────────────
secao('Tradução das actions da Meta');
{
  const insight = {
    date_start: '2026-09-10',
    impressions: '3200',
    reach: '2400',
    clicks: '88',
    spend: '410.55',
    actions: [
      { action_type: 'link_click', value: '88' },
      { action_type: 'landing_page_view', value: '71' },
      { action_type: 'offsite_conversion.fb_pixel_lead', value: '9' },
      { action_type: 'onsite_conversion.lead_grouped', value: '3' },
      { action_type: 'offsite_conversion.fb_pixel_schedule', value: '2' },
      { action_type: 'post_engagement', value: '140' },
      { action_type: 'inventado_pela_meta', value: '5' },
    ],
    action_values: [{ action_type: 'offsite_conversion.fb_pixel_purchase', value: '1250.00' }],
    video_p75_watched_actions: [{ action_type: 'video_view', value: '420' }],
  };

  const stages = etapasDoInsight(insight);
  eq('impressões/alcance/cliques vêm dos campos', [stages.impressao, stages.alcance, stages.clique], [3200, 2400, 88]);
  eq('page view', stages.page_view, 71);
  // Máximo, não soma: quando a conta reporta pixel E formulário nativo, um é
  // subconjunto do outro (ver seção "Dupla contagem" abaixo, com dados reais).
  eq('lead usa o maior candidato, não a soma', stages.lead, 9);
  eq('agendamento', stages.agendamento, 2);
  eq('vídeo 75%', stages.vv_75, 420);
  ok('action desconhecida não vira etapa', !('inventado_pela_meta' in stages));

  eq('receita', receitaDoInsight(insight), 1250);
  eq('conversão primária prefere lead quando não há compra', conversaoPrimaria(stages), 9);

  const comOverride = etapasDoInsight(insight, { 'offsite_conversion.custom.99': 'mql' });
  ok('override não quebra o mapa padrão', comOverride.lead === 9);
}

// ── Dupla contagem (caso real da conta da Infotráfego) ───────────────────────
secao('Dupla contagem de action_type');
{
  // Números reais colhidos por scripts/diagnostico-meta.ts em 18/09/2026.
  // `lead` é o total; lead_grouped (nativo) + fb_pixel_lead (pixel) = 181.
  // Somar os três daria 362 — o dobro dos leads no dashboard inteiro.
  const real = {
    date_start: '2026-06-01',
    impressions: '264172',
    clicks: '3000',
    spend: '22031.77',
    actions: [
      { action_type: 'lead', value: '181' },
      { action_type: 'onsite_conversion.lead_grouped', value: '125' },
      { action_type: 'offsite_conversion.fb_pixel_lead', value: '56' },
      { action_type: 'onsite_web_lead', value: '56' },
      { action_type: 'page_engagement', value: '25406' },
      { action_type: 'post_engagement', value: '25405' },
      { action_type: 'post_reaction', value: '788' },
      { action_type: 'comment', value: '26' },
      { action_type: 'landing_page_view', value: '1041' },
      { action_type: 'omni_landing_page_view', value: '1041' },
      { action_type: 'link_click', value: '2536' },
      { action_type: 'onsite_conversion.post_save', value: '80' },
      { action_type: 'onsite_conversion.post_net_save', value: '80' },
      { action_type: 'video_view', value: '21892' },
      { action_type: 'like', value: '1' },
    ],
  };

  const s = etapasDoInsight(real);
  eq('lead usa o total, não a soma das partes', s.lead, 181);
  eq('engajamento usa o mais abrangente', s.engajamento, 25406);
  eq('page view não dobra com a variante omni', s.page_view, 1041);
  eq('save não dobra com a variante net', s.save, 80);
  eq('clique vem de link_click', s.clique, 2536);
  ok('video_view (3s) não vira marco de vídeo', s.vv_25 === undefined);
  ok('like não é confundido com seguidor', s.seguidores === undefined);

  ok(
    'nenhum action_type real fica órfão sem ser ignorado de propósito',
    actionsNaoMapeadas(real).length === 0,
    actionsNaoMapeadas(real),
  );

  // Conta que só reporta as partes (sem o total agregado) continua certa.
  const soPartes = {
    date_start: '2026-06-01',
    actions: [
      { action_type: 'onsite_conversion.lead_grouped', value: '125' },
      { action_type: 'offsite_conversion.fb_pixel_lead', value: '56' },
    ],
  };
  eq('sem o total, usa a maior parte disponível', etapasDoInsight(soPartes).lead, 125);

  // Conversão customizada só vira etapa via override — nunca por adivinhação.
  const custom = {
    date_start: '2026-06-01',
    actions: [{ action_type: 'offsite_conversion.custom.1994975511446879', value: '575' }],
  };
  ok('custom sem override não vira etapa', etapasDoInsight(custom).mql === undefined);
  ok('custom aparece como não mapeada pro gestor revisar',
    actionsNaoMapeadas(custom).includes('offsite_conversion.custom.1994975511446879'));
  eq('custom com override vira a etapa certa',
    etapasDoInsight(custom, { 'offsite_conversion.custom.1994975511446879': 'mql' }).mql, 575);
}

// ── Agregação do sync ────────────────────────────────────────────────────────
secao('Agregação dos insights (ad → adset/campanha/criativo)');
{
  const rows = [
    {
      date_start: '2026-09-10', ad_id: 'ad1', adset_id: 'as1', campaign_id: 'c1',
      impressions: '1000', clicks: '40', spend: '100.00', frequency: '1.5',
      actions: [{ action_type: 'offsite_conversion.fb_pixel_lead', value: '5' }],
    },
    {
      date_start: '2026-09-10', ad_id: 'ad2', adset_id: 'as1', campaign_id: 'c1',
      impressions: '3000', clicks: '60', spend: '200.00', frequency: '2.5',
      actions: [{ action_type: 'offsite_conversion.fb_pixel_lead', value: '7' }],
    },
  ];
  const criativoPorAd = new Map([['ad1', 'cr1'], ['ad2', 'cr1']]);
  const linhas = agregarInsights('cli-1', rows, criativoPorAd);

  const porChave = new Map(linhas.map((l) => [`${l.entity_type}:${l.entity_id}`, l]));

  eq('4 níveis gerados', new Set(linhas.map((l) => l.entity_type)).size, 4);
  eq('adset soma os dois ads', porChave.get('adset:as1')!.spend, 300);
  eq('campanha soma os dois ads', porChave.get('campaign:c1')!.impressions, 4000);
  eq('criativo agrega ads que o usam', porChave.get('creative:cr1')!.stage_values?.lead, 12);

  // 1000×1.5 + 3000×2.5 = 9000; 9000/4000 = 2.25 — a média simples daria 2.0.
  eq('frequência é média ponderada por impressão', porChave.get('campaign:c1')!.frequency, 2.25);

  eq('CTR do agregado', porChave.get('campaign:c1')!.ctr, 0.025);
  eq('conversões = lead quando não há compra', porChave.get('adset:as1')!.conversions, 12);
}

// ── Fatiamento da janela de insights ────────────────────────────────────────
secao('Fatiamento da janela (limite de volume da Meta)');
{
  const um = fatiarJanela('2026-09-01', '2026-09-10', 30);
  eq('janela menor que o bloco vira um bloco só', um, [{ desde: '2026-09-01', ate: '2026-09-10' }]);

  const dois = fatiarJanela('2026-09-01', '2026-10-05', 30);
  eq('janela maior é fatiada', dois, [
    { desde: '2026-09-01', ate: '2026-09-30' },
    { desde: '2026-10-01', ate: '2026-10-05' },
  ]);

  // O intervalo da Meta é inclusivo nas duas pontas: sobreposição de um dia
  // entre blocos duplicaria a linha daquele dia no upsert.
  const blocos = fatiarJanela('2025-12-01', '2026-09-18', 30);
  const datas = blocos.flatMap((b) => [b.desde, b.ate]);
  ok('blocos não se sobrepõem', new Set(datas).size === datas.length);
  eq('cobre do começo ao fim', [blocos[0].desde, blocos[blocos.length - 1].ate], [
    '2025-12-01', '2026-09-18',
  ]);
  eq('292 dias em blocos de 30 → 10 blocos', blocos.length, 10);

  eq('um único dia', fatiarJanela('2026-09-18', '2026-09-18', 30), [
    { desde: '2026-09-18', ate: '2026-09-18' },
  ]);
  eq('janela invertida devolve vazio', fatiarJanela('2026-09-18', '2026-09-01', 30), []);
}

// ── Métricas ─────────────────────────────────────────────────────────────────
secao('Métricas derivadas');
{
  const linha: LinhaBruta = {
    id: 'a', nome: 'A', status: 'active',
    spend: 1000, impressoes: 20000, cliques: 400, pageViews: 350,
    leads: 50, mqls: 30, agend: 8,
    stages: { impressao: 20000, clique: 400, page_view: 350, lead: 50, mql: 30, agendamento: 8 },
  };
  const m = derivar(linha);

  eq('CPL', m.cpl, 20);
  eq('CPMQL', m.cpmql, 1000 / 30);
  eq('conv L→M', m.convLm, 0.6);
  eq('CTR', m.ctr, 0.02);
  eq('reuniões projetadas (8 × 0,7)', m.reunioes, 6);
  eq('vendas projetadas (6 × 0,25)', m.vendas, 2);
  ok('venda é marcada como projeção', m.vendaEhReal === false);
  ok('escalar: CPL baixo e conversão acima da meta', m.alerta === 'escalar');

  const semLead = derivar({ ...linha, leads: 0, mqls: 0, agend: 0, stages: { impressao: 20000 } });
  ok('gastou sem lead → cortar', semLead.alerta === 'cortar');
  eq('CPL indefinido vira null, não zero', semLead.cpl, null);

  const comVendaReal = derivar({
    ...linha,
    stages: { ...linha.stages, compra: 4 },
    receitaReal: 32000,
  });
  ok('venda reportada pela Meta vence a projeção', comVendaReal.vendaEhReal && comVendaReal.vendas === 4);
  eq('ROAS usa receita real', comVendaReal.roas, 32);

  const soma = somarLinhas([linha, { ...linha, id: 'b', stages: { lead: 10, impressao: 5000 } }]);
  eq('somarLinhas soma o mapa de etapas', soma.stages?.lead, 60);
  eq('somarLinhas soma spend', soma.spend, 2000);

  eq('totalizar bate com a soma', totalizar([linha, linha]).leads, 100);
  eq('valorDaEtapa cai no campo legado', valorDaEtapa({ ...linha, stages: undefined }, 'lead'), 50);
  eq('etapa não medida devolve null', valorDaEtapa(linha, 'seguidores'), null);
}

// ── Cone modular ─────────────────────────────────────────────────────────────
secao('Cone renderizado a partir da config');
{
  const total: LinhaBruta = {
    id: 't', nome: 'Total', status: 'active',
    spend: 5330, impressoes: 248350, cliques: 5120, pageViews: 4380,
    leads: 287, mqls: 142, agend: 38,
    stages: {
      impressao: 248350, clique: 5120, page_view: 4380,
      form_iniciado: 412, aplicacao_completa: 287, mql: 142, agendamento: 38,
    },
  };

  const captacao: ConfigFunil = {
    cliente: 'Infotráfego', nome: 'Aquisição', familia: 'captacao',
    subObjetivo: 'sessao_estrategica', captura: 'landing_page',
    etapas: ['impressao', 'clique', 'page_view', 'form_iniciado', 'aplicacao_completa', 'mql', 'agendamento', 'venda'],
    marcadorMkt: 'mql', marcadorCom: 'venda', metas: { mql: 200 },
  };

  const cone = montarCone(captacao, total, {
    projecoes: projecoesComerciais(total, { showRate: 0.7, closeRate: 0.25 }),
  });

  eq('uma linha por etapa', cone.length, 8);
  eq('primeira etapa não tem taxa', cone[0].taxa, null);
  eq('taxa clique→page view', cone[2].taxa, 4380 / 5120);
  eq('CPM é por mil impressões', cone[0].custo, (5330 / 248350) * 1000);
  ok('pin MKT no MQL', cone[5].id === 'mql' && cone[5].marcadorMkt);
  ok('pin COM na venda', cone[7].id === 'venda' && cone[7].marcadorCom);
  eq('venda projetada = round(round(38×0,7)×0,25)', cone[7].valor, 7);
  ok('venda marcada como projeção', cone[7].projecao);
  eq('meta da etapa chega ao cone', cone[5].meta, 200);

  // Formulário nativo não tem página pra visitar.
  const nativo = { ...captacao, captura: 'formulario_nativo' as const };
  ok('formulario_nativo pula page_view', !etapasEfetivas(nativo).includes('page_view'));
  eq('cone do formulário nativo tem 7 etapas', montarCone(nativo, total).length, 7);

  // Mesma função, outra família — é o critério "cone a partir de QUALQUER config".
  const distribuicao: ConfigFunil = {
    cliente: 'Stella', nome: 'Nutrição', familia: 'distribuicao', subObjetivo: 'c2_nutricao',
    captura: 'multi',
    etapas: ['impressao', 'alcance', 'vv_25', 'vv_50', 'vv_75', 'vv_complete', 'save'],
    marcadorMkt: null, marcadorCom: null, metas: {},
  };
  const totalDist: LinhaBruta = {
    id: 't2', nome: 'T', status: 'active', spend: 900,
    impressoes: 120000, cliques: 300, pageViews: 0, leads: 0, mqls: 0, agend: 0,
    stages: { impressao: 120000, alcance: 64000, vv_25: 30000, vv_50: 18000, vv_75: 9000, vv_complete: 4000, save: 600 },
  };
  const coneDist = montarCone(distribuicao, totalDist);
  eq('cone de distribuição tem 7 etapas', coneDist.length, 7);
  eq('VV75 lido de stages', coneDist[4].valor, 9000);
  eq('custo por salvamento', coneDist[6].custo, 900 / 600);

  const vendaDireta: ConfigFunil = {
    cliente: 'Carv', nome: 'Mentoria', familia: 'venda_direta', subObjetivo: 'produto_digital',
    captura: 'landing_page',
    etapas: ['impressao', 'clique', 'page_view', 'vis_produto', 'checkout_iniciado', 'compra'],
    marcadorMkt: null, marcadorCom: 'compra', metas: {},
  };
  const coneVenda = montarCone(vendaDireta, {
    ...totalDist,
    stages: { impressao: 50000, clique: 900, page_view: 700, vis_produto: 500, checkout_iniciado: 90, compra: 31 },
  });
  eq('cone de venda direta tem 6 etapas', coneVenda.length, 6);
  eq('taxa checkout→compra', coneVenda[5].taxa, 31 / 90);
}

// ── KPIs por sub-objetivo ────────────────────────────────────────────────────
secao('KPIs derivados do par família·sub-objetivo');
{
  const kpisCaptacao = kpisDoFunil('captacao', 'sessao_estrategica', [
    'impressao', 'clique', 'aplicacao_completa', 'mql', 'agendamento', 'venda',
  ]);
  ok('captação mostra CPMQL', kpisCaptacao.some((k) => k.label === 'CPMQL'));
  ok('há exatamente um KPI primário', kpisCaptacao.filter((k) => k.primario).length === 1);

  const kpisDistribuicao = kpisDoFunil('distribuicao', 'c1_atracao', ['impressao', 'alcance', 'seguidores']);
  ok('distribuição não mostra CPL', !kpisDistribuicao.some((k) => k.label.includes('CPL')));
  ok(
    'KPI de etapa não medida some',
    !kpisDistribuicao.some((k) => k.fonte.tipo === 'etapa' && k.fonte.etapa === 'engajamento'),
  );

  const derivadasSempre = kpisDoFunil('venda_direta', 'produto_digital', ['impressao', 'compra']);
  ok('métrica derivada passa mesmo sem etapa', derivadasSempre.some((k) => k.label === 'ROAS'));
}

// ── Resultado ────────────────────────────────────────────────────────────────
console.log(`\n${total - falhas}/${total} verificações passaram.`);
if (falhas > 0) {
  console.log(`${falhas} FALHA(S).`);
  process.exit(1);
}
