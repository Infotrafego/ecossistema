/**
 * Sync Meta Ads → Supabase
 *
 * Duas decisões que valem registro, porque custaram cota:
 *
 * 1. UMA chamada de insights, no nível `ad`, e a agregação para adset,
 *    campanha e criativo acontece aqui. Pedir os quatro níveis à API custaria
 *    ~4× a cota e os números seriam os mesmos — a linha de ad já traz
 *    `adset_id` e `campaign_id`, e o vínculo ad→criativo vem do sync de
 *    entidades. O limite inicial gira em torno de 200 chamadas/hora.
 *
 * 2. Janela padrão de 7 dias corridos. A Meta reprocessa atribuição por vários
 *    dias depois do fato, então re-sincronizar a última semana corrige números
 *    que já tinham sido gravados. É seguro porque o upsert bate na PK composta
 *    (client_id, entity_type, entity_id, date) — re-rodar não duplica linha.
 */

import { createServiceClient, type ServiceClient } from '@/lib/supabase/service';
import type { EtapaId } from '@/lib/funil';
import type { MetricsDailyInsert } from '@/types/database';
import {
  cliquesDoInsight,
  conversaoPrimaria,
  etapasDoInsight,
  receitaDoInsight,
  type MetaInsightRow,
} from './actions';
import {
  buscarInsights,
  listarAdSets,
  listarAds,
  listarCampanhas,
  listarCriativos,
  verificarAcesso,
  type MetaCreative,
} from './client';
import { normalizarAdAccountId } from './config';
import { Orcamento, OrcamentoDeChamadasError } from './http';

export interface ResultadoSync {
  clientId: string;
  status: 'success' | 'partial' | 'error';
  entidades: number;
  linhas: number;
  chamadas: number;
  picoDeCota: number | null;
  erro?: string;
  duracaoMs: number;
}

export interface OpcoesSync {
  /** Data inicial (YYYY-MM-DD). Padrão: 7 dias atrás. */
  desde?: string;
  /** Data final (YYYY-MM-DD). Padrão: hoje. */
  ate?: string;
  /** Pula o sync de entidades e só atualiza métricas (mais barato). */
  somenteMetricas?: boolean;
  /** Conversões customizadas do cliente: `action_type` → EtapaId. */
  overridesDeAcao?: Record<string, EtapaId>;
  orcamento?: Orcamento;
}

function hoje(): string {
  return new Date().toISOString().slice(0, 10);
}

function diasAtras(n: number): string {
  return new Date(Date.now() - n * 86_400_000).toISOString().slice(0, 10);
}

function num(v: string | undefined): number {
  const n = Number(v);
  return Number.isFinite(n) ? n : 0;
}

// ── Sync de entidades ────────────────────────────────────────────────────────

/**
 * Espelha campanhas, ad sets, criativos e ads no banco.
 *
 * A ordem importa: ads referenciam adsets e criativos por FK, então os pais
 * precisam existir antes. Os upserts usam a UNIQUE (client_id, meta_id) para
 * que re-sincronizar preserve o `id` local — que é o que as outras tabelas
 * referenciam.
 */
async function sincronizarEntidades(
  supabase: ServiceClient,
  clientId: string,
  adAccountId: string,
  orcamento: Orcamento,
): Promise<number> {
  const [campanhas, adsets, criativos, ads] = [
    await listarCampanhas(adAccountId, orcamento),
    await listarAdSets(adAccountId, orcamento),
    await listarCriativos(adAccountId, orcamento),
    await listarAds(adAccountId, orcamento),
  ];

  if (campanhas.length) {
    const { error } = await supabase.from('campaigns').upsert(
      campanhas.map((c) => ({
        client_id: clientId,
        meta_id: c.id,
        name: c.name,
        objective: c.objective ?? null,
        status: c.effective_status ?? c.status,
        // A Meta devolve orçamento em centavos da moeda da conta.
        daily_budget: c.daily_budget ? num(c.daily_budget) / 100 : null,
      })),
      { onConflict: 'client_id,meta_id' },
    );
    if (error) throw new Error(`upsert campaigns: ${error.message}`);
  }

  // Precisa do id local das campanhas pra amarrar os ad sets.
  const { data: campanhasLocais } = await supabase
    .from('campaigns')
    .select('id, meta_id')
    .eq('client_id', clientId);
  const idPorCampanhaMeta = new Map((campanhasLocais ?? []).map((c) => [c.meta_id, c.id]));

  const adsetsValidos = adsets.filter((a) => idPorCampanhaMeta.has(a.campaign_id));
  if (adsetsValidos.length) {
    const { error } = await supabase.from('adsets').upsert(
      adsetsValidos.map((a) => ({
        client_id: clientId,
        campaign_id: idPorCampanhaMeta.get(a.campaign_id)!,
        meta_id: a.id,
        name: a.name,
        targeting: a.targeting ?? null,
        optimization_goal: a.optimization_goal ?? null,
        status: a.effective_status ?? a.status,
        daily_budget: a.daily_budget ? num(a.daily_budget) / 100 : null,
      })),
      { onConflict: 'client_id,meta_id' },
    );
    if (error) throw new Error(`upsert adsets: ${error.message}`);
  }

  if (criativos.length) {
    const { error } = await supabase.from('creatives').upsert(
      criativos.map((c) => ({
        client_id: clientId,
        meta_id: c.id,
        type: tipoDoCriativo(c),
        hash: c.image_hash ?? null,
        thumbnail_url: c.thumbnail_url ?? null,
        ig_link: c.instagram_permalink_url ?? null,
        copy: c.body ?? c.title ?? null,
      })),
      { onConflict: 'client_id,meta_id' },
    );
    if (error) throw new Error(`upsert creatives: ${error.message}`);
  }

  const { data: adsetsLocais } = await supabase
    .from('adsets')
    .select('id, meta_id')
    .eq('client_id', clientId);
  const idPorAdsetMeta = new Map((adsetsLocais ?? []).map((a) => [a.meta_id, a.id]));

  // Criativos referenciados por ads mas ausentes de /adcreatives.
  //
  // Rede de segurança barata: quando o ad traz `creative{id}` mas aquele
  // criativo não veio na listagem, registra o criativo a partir da referência,
  // sem chamada extra. Fica sem thumbnail e sem copy (esses só vêm do
  // /adcreatives), mas com identidade — que é o que o agrupamento precisa.
  //
  // ⚠ LIMITAÇÃO MEDIDA (conta da Infotráfego, 18/09/2026): isto NÃO resolve o
  // caso dela. 130 dos 204 ads com entrega — 63% do investimento — vêm da API
  // sem o campo `creative` nenhum, então não há referência pra aproveitar.
  // Para esses, `lib/data/intel.ts` agrupa pelo próprio ad e usa o nome dele
  // como rótulo, o que funciona porque a nomenclatura da agência já identifica
  // o criativo (AD101_VID_INF_ADS_…). Resolver de verdade exigiria uma chamada
  // por ad ao endpoint do criativo — caro em cota e sem ganho proporcional.
  const metaIdsJaConhecidos = new Set(criativos.map((c) => c.id));
  const faltantes = Array.from(
    new Set(
      ads
        .map((a) => a.creative?.id)
        .filter((id): id is string => Boolean(id) && !metaIdsJaConhecidos.has(id!)),
    ),
  );

  if (faltantes.length) {
    const { error } = await supabase.from('creatives').upsert(
      faltantes.map((metaId) => ({
        client_id: clientId,
        meta_id: metaId,
        // Sem o objeto do criativo não dá pra saber o formato; 'image' é o
        // default do schema e a aba de ranking trata o formato como opcional.
        type: 'image' as const,
        hash: null,
        thumbnail_url: null,
        ig_link: null,
        copy: null,
      })),
      { onConflict: 'client_id,meta_id', ignoreDuplicates: true },
    );
    if (error) throw new Error(`upsert creatives (referenciados): ${error.message}`);
  }

  const { data: criativosLocais } = await supabase
    .from('creatives')
    .select('id, meta_id')
    .eq('client_id', clientId);
  const idPorCriativoMeta = new Map((criativosLocais ?? []).map((c) => [c.meta_id, c.id]));

  const adsValidos = ads.filter((a) => idPorAdsetMeta.has(a.adset_id));
  if (adsValidos.length) {
    const { error } = await supabase.from('ads').upsert(
      adsValidos.map((a) => ({
        client_id: clientId,
        adset_id: idPorAdsetMeta.get(a.adset_id)!,
        creative_id: a.creative?.id ? idPorCriativoMeta.get(a.creative.id) ?? null : null,
        meta_id: a.id,
        name: a.name,
        status: a.effective_status ?? a.status,
      })),
      { onConflict: 'client_id,meta_id' },
    );
    if (error) throw new Error(`upsert ads: ${error.message}`);
  }

  return campanhas.length + adsetsValidos.length + criativos.length + adsValidos.length;
}

function tipoDoCriativo(c: MetaCreative): 'image' | 'video' | 'carousel' {
  if (c.video_id) return 'video';
  if (c.object_type === 'SHARE' && !c.image_hash) return 'carousel';
  return 'image';
}

// ── Agregação dos insights ───────────────────────────────────────────────────

interface Acumulado {
  impressions: number;
  clicks: number;
  spend: number;
  revenue: number;
  /** Soma ponderada de frequência × impressões — vira média no fim. */
  freqPonderada: number;
  stages: Partial<Record<EtapaId, number>>;
}

function acumuladorVazio(): Acumulado {
  return { impressions: 0, clicks: 0, spend: 0, revenue: 0, freqPonderada: 0, stages: {} };
}

function acumular(acc: Acumulado, row: MetaInsightRow, overrides: Record<string, EtapaId>): void {
  const impressions = num(row.impressions);
  acc.impressions += impressions;
  // Mesmo critério da etapa `clique` do funil (link_click, com fallback pra
  // `clicks`): se divergissem, CTR e cone mostrariam cliques diferentes.
  acc.clicks += cliquesDoInsight(row);
  acc.spend += num(row.spend);
  acc.revenue += receitaDoInsight(row);
  acc.freqPonderada += num(row.frequency) * impressions;

  for (const [etapa, valor] of Object.entries(etapasDoInsight(row, overrides))) {
    const id = etapa as EtapaId;
    acc.stages[id] = (acc.stages[id] ?? 0) + (valor ?? 0);
  }
}

function paraLinha(
  clientId: string,
  entityType: MetricsDailyInsert['entity_type'],
  entityId: string,
  date: string,
  acc: Acumulado,
): MetricsDailyInsert {
  const ctr = acc.impressions > 0 ? acc.clicks / acc.impressions : null;
  const cpc = acc.clicks > 0 ? acc.spend / acc.clicks : null;
  const cpm = acc.impressions > 0 ? (acc.spend / acc.impressions) * 1000 : null;

  return {
    client_id: clientId,
    entity_type: entityType,
    entity_id: entityId,
    date,
    impressions: Math.round(acc.impressions),
    clicks: Math.round(acc.clicks),
    spend: Number(acc.spend.toFixed(2)),
    conversions: conversaoPrimaria(acc.stages),
    revenue: Number(acc.revenue.toFixed(2)),
    // Frequência é média ponderada por impressão: a média simples entre ads
    // trataria um ad com 10 impressões igual a um com 100 mil.
    frequency: acc.impressions > 0 ? Number((acc.freqPonderada / acc.impressions).toFixed(3)) : null,
    ctr: ctr === null ? null : Number(ctr.toFixed(4)),
    cpc: cpc === null ? null : Number(cpc.toFixed(4)),
    cpm: cpm === null ? null : Number(cpm.toFixed(2)),
    stage_values: acc.stages,
    raw_data: null,
  };
}

/**
 * Transforma as linhas de insight (nível ad) nas quatro granularidades que o
 * dashboard consome. Função pura — dá pra testar com um JSON salvo.
 */
export function agregarInsights(
  clientId: string,
  rows: MetaInsightRow[],
  criativoPorAd: Map<string, string>,
  overrides: Record<string, EtapaId> = {},
): MetricsDailyInsert[] {
  const buckets = new Map<string, { tipo: MetricsDailyInsert['entity_type']; id: string; date: string; acc: Acumulado }>();

  const pegar = (tipo: MetricsDailyInsert['entity_type'], id: string, date: string) => {
    const chave = `${tipo}|${id}|${date}`;
    let bucket = buckets.get(chave);
    if (!bucket) {
      bucket = { tipo, id, date, acc: acumuladorVazio() };
      buckets.set(chave, bucket);
    }
    return bucket.acc;
  };

  for (const row of rows) {
    const date = row.date_start;
    if (!date) continue;

    if (row.ad_id) acumular(pegar('ad', row.ad_id, date), row, overrides);
    if (row.adset_id) acumular(pegar('adset', row.adset_id, date), row, overrides);
    if (row.campaign_id) acumular(pegar('campaign', row.campaign_id, date), row, overrides);

    const criativoId = row.ad_id ? criativoPorAd.get(row.ad_id) : undefined;
    if (criativoId) acumular(pegar('creative', criativoId, date), row, overrides);
  }

  return Array.from(buckets.values()).map((b) => paraLinha(clientId, b.tipo, b.id, b.date, b.acc));
}

// ── Orquestração ─────────────────────────────────────────────────────────────

/** Upsert em lotes: um payload de milhares de linhas estoura o limite do PostgREST. */
async function gravarMetricas(
  supabase: ServiceClient,
  linhas: MetricsDailyInsert[],
  tamanhoLote = 500,
): Promise<number> {
  let gravadas = 0;
  for (let i = 0; i < linhas.length; i += tamanhoLote) {
    const lote = linhas.slice(i, i + tamanhoLote);
    const { error } = await supabase
      .from('metrics_daily')
      .upsert(lote, { onConflict: 'client_id,entity_type,entity_id,date' });
    if (error) throw new Error(`upsert metrics_daily: ${error.message}`);
    gravadas += lote.length;
  }
  return gravadas;
}

export async function syncClient(
  clientId: string,
  adAccountId: string,
  opcoes: OpcoesSync = {},
): Promise<ResultadoSync> {
  const inicio = Date.now();
  const supabase = createServiceClient();
  const orcamento = opcoes.orcamento ?? new Orcamento();
  const desde = opcoes.desde ?? diasAtras(7);
  const ate = opcoes.ate ?? hoje();
  const conta = normalizarAdAccountId(adAccountId);

  const { data: logRow } = await supabase
    .from('sync_log')
    .insert({
      client_id: clientId,
      source: 'meta_ads',
      status: 'running',
      date_start: desde,
      date_stop: ate,
    })
    .select('id')
    .single();
  const logId = logRow?.id;

  const fechar = async (
    status: ResultadoSync['status'],
    dados: { entidades: number; linhas: number; erro?: string; detalhes?: Record<string, unknown> },
  ): Promise<ResultadoSync> => {
    const duracaoMs = Date.now() - inicio;
    if (logId) {
      await supabase
        .from('sync_log')
        .update({
          status,
          entities_synced: dados.entidades,
          rows_upserted: dados.linhas,
          api_calls: orcamento.chamadas,
          duration_ms: duracaoMs,
          error_message: dados.erro ?? null,
          details: { pico_de_cota: orcamento.picoDeUso, conta, ...dados.detalhes },
          finished_at: new Date().toISOString(),
        })
        .eq('id', logId);
    }
    return {
      clientId,
      status,
      entidades: dados.entidades,
      linhas: dados.linhas,
      chamadas: orcamento.chamadas,
      picoDeCota: orcamento.picoDeUso,
      erro: dados.erro,
      duracaoMs,
    };
  };

  let entidades = 0;

  try {
    await verificarAcesso(conta, orcamento);

    if (!opcoes.somenteMetricas) {
      entidades = await sincronizarEntidades(supabase, clientId, conta, orcamento);
    }

    // `metrics_daily.entity_id` guarda SEMPRE o id da Meta, nos quatro níveis.
    // Misturar id local (uuid) com id da Meta em níveis diferentes obrigaria
    // cada leitura a saber de qual tipo é a chave — então o mapa abaixo traduz
    // ad(meta) → criativo(meta), não ad(meta) → criativo(uuid).
    const { data: adsLocais } = await supabase
      .from('ads')
      .select('meta_id, creative_id')
      .eq('client_id', clientId);
    const { data: criativosLocaisParaMapa } = await supabase
      .from('creatives')
      .select('id, meta_id')
      .eq('client_id', clientId);
    const metaIdPorCriativoLocal = new Map(
      (criativosLocaisParaMapa ?? []).map((c) => [c.id, c.meta_id]),
    );

    const criativoPorAd = new Map<string, string>();
    for (const ad of adsLocais ?? []) {
      const metaIdDoCriativo = ad.creative_id ? metaIdPorCriativoLocal.get(ad.creative_id) : undefined;
      if (metaIdDoCriativo) criativoPorAd.set(ad.meta_id, metaIdDoCriativo);
    }

    const insights = await buscarInsights(conta, { desde, ate, level: 'ad' }, orcamento);
    const linhas = agregarInsights(clientId, insights, criativoPorAd, opcoes.overridesDeAcao);
    const gravadas = await gravarMetricas(supabase, linhas);

    return fechar('success', {
      entidades,
      linhas: gravadas,
      detalhes: { insights_recebidos: insights.length, janela: `${desde}..${ate}` },
    });
  } catch (e) {
    const erro = e instanceof Error ? e.message : String(e);
    // Estourar o teto de chamadas é parada controlada, não falha: o que já foi
    // gravado vale, e a próxima janela do cron retoma de onde parou.
    const status: ResultadoSync['status'] = e instanceof OrcamentoDeChamadasError ? 'partial' : 'error';
    return fechar(status, { entidades, linhas: 0, erro });
  }
}

/**
 * Sincroniza todos os clientes ativos com conta configurada.
 *
 * Sequencial de propósito: o rate limit da Meta é por app/usuário, então rodar
 * clientes em paralelo só faz todos baterem no mesmo teto ao mesmo tempo. O
 * orçamento é compartilhado pela execução inteira pelo mesmo motivo.
 */
export async function syncAllClients(opcoes: OpcoesSync = {}): Promise<ResultadoSync[]> {
  const supabase = createServiceClient();
  const orcamento = opcoes.orcamento ?? new Orcamento();

  const { data: clientes, error } = await supabase
    .from('clients')
    .select('id, meta_ad_account_id')
    .eq('active', true)
    .not('meta_ad_account_id', 'is', null);

  if (error) throw new Error(`leitura de clients: ${error.message}`);

  const resultados: ResultadoSync[] = [];
  for (const cliente of clientes ?? []) {
    const conta = cliente.meta_ad_account_id;
    // O seed deixa 'act_PREENCHER' até o BM real ser levantado.
    if (!conta || conta.includes('PREENCHER')) continue;
    if (orcamento.restantes < 10) {
      resultados.push({
        clientId: cliente.id,
        status: 'partial',
        entidades: 0,
        linhas: 0,
        chamadas: 0,
        picoDeCota: orcamento.picoDeUso,
        erro: 'Orçamento de chamadas da execução esgotado antes deste cliente.',
        duracaoMs: 0,
      });
      continue;
    }
    resultados.push(await syncClient(cliente.id, conta, { ...opcoes, orcamento }));
  }

  return resultados;
}
