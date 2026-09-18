/**
 * Tradução Meta `action_type` → etapa do funil (EtapaId)
 *
 * Este arquivo é a única fronteira entre o vocabulário da Meta e o do produto.
 * O sync traduz uma vez e grava em `metrics_daily.stage_values`; daí pra frente
 * cone, KPIs e tabelas só falam EtapaId — é o que permite um mesmo dataset
 * atender qualquer config de funil sem reprocessar nada.
 *
 * ⚠ A REGRA MAIS IMPORTANTE AQUI: quando vários `action_type` caem na mesma
 * etapa, o valor é o MÁXIMO entre eles, NUNCA a soma.
 *
 * A Meta reporta o mesmo evento em várias granularidades ao mesmo tempo. Dados
 * reais da conta da Infotráfego (diagnóstico de 18/09/2026, 12 meses):
 *
 *     lead                                181   ← total consolidado
 *     onsite_conversion.lead_grouped      125   ← parte: formulário nativo
 *     offsite_conversion.fb_pixel_lead     56   ← parte: pixel   (125+56 = 181)
 *
 *     page_engagement                  25.406   ← o mais abrangente
 *     post_engagement                  25.405   ← praticamente o mesmo
 *     post_reaction                       788   ← subconjunto
 *     comment                              26   ← subconjunto
 *
 *     landing_page_view                 1.041
 *     omni_landing_page_view            1.041   ← mesmo evento, outro nome
 *
 * Somar dobraria os leads do dashboard inteiro. O máximo devolve 181, que é o
 * número certo — e continua certo numa conta que reporte só as partes, porque
 * aí o total agregado simplesmente não vem.
 *
 * Puro de propósito: dá pra rodar contra um JSON de insight salvo e conferir o
 * resultado sem tocar na API nem no banco (`scripts/diagnostico-meta.ts`).
 */

import type { EtapaId } from '@/lib/funil';

/**
 * Etapa → `action_type` que a representam.
 *
 * Invertido em relação ao mapa antigo (action → etapa) justamente pra deixar
 * explícito que os itens de uma lista são o MESMO evento visto de ângulos
 * diferentes, não parcelas a somar.
 */
const CANDIDATOS: Partial<Record<EtapaId, string[]>> = {
  // ── Mídia ───────────────────────────────────────────────────────
  // `clique` não entra aqui: tem regra própria em `cliquesDoInsight()`.
  page_view: ['landing_page_view', 'omni_landing_page_view'],
  vis_produto: ['offsite_conversion.fb_pixel_view_content', 'view_content', 'omni_view_content'],

  // ── Captação ────────────────────────────────────────────────────
  lead: [
    'lead',
    'onsite_conversion.lead_grouped',
    'offsite_conversion.fb_pixel_lead',
    'onsite_web_lead',
  ],
  form_iniciado: ['onsite_conversion.lead_form_opened'],
  aplicacao_completa: [
    'complete_registration',
    'offsite_conversion.fb_pixel_complete_registration',
    'offsite_complete_registration_add_meta_leads',
    'omni_complete_registration',
    'submit_application',
    'offsite_conversion.fb_pixel_submit_application',
  ],
  agendamento: ['schedule', 'offsite_conversion.fb_pixel_schedule'],
  inscricao_evento: ['subscribe', 'offsite_conversion.fb_pixel_subscribe'],

  // ── Venda direta ────────────────────────────────────────────────
  add_carrinho: ['add_to_cart', 'offsite_conversion.fb_pixel_add_to_cart', 'omni_add_to_cart'],
  checkout_iniciado: [
    'initiate_checkout',
    'offsite_conversion.fb_pixel_initiate_checkout',
    'omni_initiated_checkout',
  ],
  compra: ['purchase', 'omni_purchase', 'offsite_conversion.fb_pixel_purchase'],

  // ── Distribuição / audiência ────────────────────────────────────
  // `page_engagement` primeiro porque é o mais abrangente; os outros são
  // subconjuntos dele e por isso NÃO somam.
  engajamento: ['page_engagement', 'post_engagement', 'post_reaction', 'comment'],
  compartilhamento: ['post'],
  save: ['onsite_conversion.post_save', 'onsite_conversion.post_net_save'],
  visita_perfil: ['onsite_conversion.visit_instagram_profile'],
  // `like` NÃO entra: é curtida em post/página, não seguidor novo.
  seguidores: ['follow', 'onsite_conversion.follow'],
  mensagens: [
    'onsite_conversion.messaging_conversation_started_7d',
    'onsite_conversion.total_messaging_connection',
  ],
};

/**
 * `action_type` que a conta devolve mas que NÃO viram etapa, de propósito.
 * Listados pra que o diagnóstico não os acuse como "esquecidos".
 *
 * · `video_view` é a view de 3s; os marcos do funil (25/50/75/100%) vêm dos
 *   campos `video_pXX_watched_actions`, então mapeá-lo confundiria as escalas.
 * · `post_interaction_gross/net` se sobrepõem a `page_engagement`.
 * · `*_unlike`, `*_block`, `messaging_*_reply/depth` são eventos de saída ou
 *   de profundidade de conversa, não etapas.
 * · `offsite_conversion.custom.<id>` e os `*_add_20_s_calls` são conversões
 *   customizadas da conta: só o gestor sabe a que etapa correspondem, e é pra
 *   isso que existe o parâmetro `overrides`.
 */
const IGNORADOS_DE_PROPOSITO = new Set([
  'video_view',
  'link_click',
  'post_interaction_gross',
  'post_interaction_net',
  'onsite_conversion.post_unlike',
  'onsite_conversion.post_net_like',
  'onsite_conversion.post_net_comment',
  'onsite_conversion.messaging_block',
  'onsite_conversion.messaging_first_reply',
  'onsite_conversion.messaging_conversation_replied_7d',
  'onsite_conversion.messaging_user_depth_2_message_send',
  'onsite_conversion.messaging_user_depth_3_message_send',
  'offsite_search_add_meta_leads',
  'offsite_content_view_add_meta_leads',
  'like',
]);

/** Índice inverso, só pra consulta rápida. */
const ETAPA_DE: Record<string, EtapaId> = {};
for (const [etapa, tipos] of Object.entries(CANDIDATOS)) {
  for (const tipo of tipos ?? []) ETAPA_DE[tipo] = etapa as EtapaId;
}

/**
 * Campos de insight que NÃO vêm em `actions[]` — a Meta os entrega como arrays
 * próprios, um por marco de vídeo.
 */
const CAMPOS_VIDEO: Array<[string, EtapaId]> = [
  ['video_p25_watched_actions', 'vv_25'],
  ['video_p50_watched_actions', 'vv_50'],
  ['video_p75_watched_actions', 'vv_75'],
  ['video_p100_watched_actions', 'vv_complete'],
];

export interface MetaAction {
  action_type: string;
  value: string;
}

/** Shape mínimo de um insight diário que este módulo sabe ler. */
export interface MetaInsightRow {
  campaign_id?: string;
  adset_id?: string;
  ad_id?: string;
  date_start: string;
  date_stop?: string;
  impressions?: string;
  reach?: string;
  clicks?: string;
  spend?: string;
  frequency?: string;
  ctr?: string;
  cpc?: string;
  cpm?: string;
  actions?: MetaAction[];
  action_values?: MetaAction[];
  video_p25_watched_actions?: MetaAction[];
  video_p50_watched_actions?: MetaAction[];
  video_p75_watched_actions?: MetaAction[];
  video_p100_watched_actions?: MetaAction[];
  [k: string]: unknown;
}

function num(v: string | undefined): number {
  const n = Number(v);
  return Number.isFinite(n) ? n : 0;
}

function somarActions(actions: MetaAction[] | undefined): number {
  if (!actions?.length) return 0;
  return actions.reduce((total, a) => total + num(a.value), 0);
}

/**
 * Cliques da etapa `clique` do funil.
 *
 * A Meta reporta DOIS números diferentes: o campo `clicks` (todos os cliques —
 * inclui curtida, comentário, expandir legenda) e a action `link_click` (só
 * quem clicou pro destino). Somar os dois dobra a etapa, e é errado nos dois
 * sentidos: `clicks` é largo demais pra medir intenção e `link_click` é o
 * número que casa com Page View na etapa seguinte.
 *
 * Então: `link_click` quando existe; `clicks` só como último recurso (campanha
 * de engajamento, onde não há link).
 */
export function cliquesDoInsight(row: MetaInsightRow): number {
  const linkClick = (row.actions ?? []).find((a) => a.action_type === 'link_click');
  if (linkClick) return num(linkClick.value);
  return num(row.clicks);
}

/**
 * Converte um insight da Meta no mapa EtapaId → valor.
 *
 * `overrides` cobre conversões customizadas, que chegam como
 * `offsite_conversion.custom.<id>` e só o gestor sabe a que etapa correspondem
 * (ex.: o pixel "MQL qualificado" de um cliente específico). Override tem
 * precedência: entra no mesmo grupo da etapa e concorre pelo máximo.
 */
export function etapasDoInsight(
  row: MetaInsightRow,
  overrides: Record<string, EtapaId> = {},
): Partial<Record<EtapaId, number>> {
  const stages: Partial<Record<EtapaId, number>> = {};

  /** Mantém o MAIOR valor visto para a etapa — nunca soma. */
  const maximo = (etapa: EtapaId, valor: number) => {
    if (valor <= 0) return;
    const atual = stages[etapa];
    if (atual === undefined || valor > atual) stages[etapa] = valor;
  };

  // Métricas de topo vêm como campos, não como actions.
  maximo('impressao', num(row.impressions));
  maximo('alcance', num(row.reach));
  maximo('clique', cliquesDoInsight(row));

  for (const acao of row.actions ?? []) {
    const etapa = overrides[acao.action_type] ?? ETAPA_DE[acao.action_type];
    if (etapa) maximo(etapa, num(acao.value));
  }

  // Marcos de vídeo vêm em arrays próprios; aqui a soma é correta, porque cada
  // entrada do array é um placement/ação distinta do MESMO marco.
  for (const [campo, etapa] of CAMPOS_VIDEO) {
    maximo(etapa, somarActions(row[campo] as MetaAction[] | undefined));
  }

  return stages;
}

/**
 * Receita do dia: o maior valor entre os `action_values` de compra.
 *
 * Mesma lógica das etapas — `purchase` e `omni_purchase` são o mesmo evento em
 * conta com catálogo, e somar dobraria a receita.
 */
export function receitaDoInsight(row: MetaInsightRow): number {
  const relevantes = (row.action_values ?? []).filter(
    (a) => a.action_type.includes('purchase') || a.action_type.includes('omni_purchase'),
  );
  return relevantes.reduce((maior, a) => Math.max(maior, num(a.value)), 0);
}

/**
 * Conversão primária do dia — o atalho gravado em `metrics_daily.conversions`.
 *
 * Preferência: compra > lead > agendamento. Quem precisa de precisão lê
 * `stage_values`; esta coluna existe pra consultas rápidas e compatibilidade
 * com o que já lia `conversions`.
 */
export function conversaoPrimaria(stages: Partial<Record<EtapaId, number>>): number {
  return stages.compra ?? stages.venda ?? stages.lead ?? stages.mql ?? stages.agendamento ?? 0;
}

/** A etapa que um `action_type` alimenta, ou `undefined`. */
export function etapaDoActionType(
  tipo: string,
  overrides: Record<string, EtapaId> = {},
): EtapaId | undefined {
  return overrides[tipo] ?? ETAPA_DE[tipo];
}

/**
 * `action_type` que a conta devolveu e que ninguém traduziu NEM ignorou de
 * propósito. É a lista que merece revisão humana — conversão customizada do
 * cliente costuma aparecer aqui.
 */
export function actionsNaoMapeadas(
  row: MetaInsightRow,
  overrides: Record<string, EtapaId> = {},
): string[] {
  return (row.actions ?? [])
    .map((a) => a.action_type)
    .filter((t) => !ETAPA_DE[t] && !overrides[t] && !IGNORADOS_DE_PROPOSITO.has(t));
}

/** `true` quando o tipo é conhecido mas deliberadamente fora do funil. */
export function ehIgnoradoDePropósito(tipo: string): boolean {
  return IGNORADOS_DE_PROPOSITO.has(tipo);
}
