/**
 * Cliente Meta Marketing API · leitura de entidades e insights
 *
 * Camada fina sobre `http.ts`: monta os campos certos de cada edge e devolve
 * tipos. Toda chamada recebe um `Orcamento` porque o teto de chamadas é por
 * execução de sync, não global — ver lib/meta-ads/http.ts.
 *
 * Docs: https://developers.facebook.com/docs/marketing-apis
 */

import { normalizarAdAccountId } from './config';
import { metaGet, metaGetAll, type Orcamento } from './http';
import type { MetaInsightRow } from './actions';

export type { MetaInsightRow };

export interface MetaCampaign {
  id: string;
  name: string;
  objective?: string;
  status: string;
  effective_status?: string;
  daily_budget?: string;
  lifetime_budget?: string;
  start_time?: string;
  stop_time?: string;
}

export interface MetaAdSet {
  id: string;
  name: string;
  campaign_id: string;
  status: string;
  effective_status?: string;
  daily_budget?: string;
  lifetime_budget?: string;
  optimization_goal?: string;
  targeting?: Record<string, unknown>;
}

export interface MetaAd {
  id: string;
  name: string;
  adset_id: string;
  campaign_id?: string;
  status: string;
  effective_status?: string;
  creative?: { id: string };
}

export interface MetaCreative {
  id: string;
  name?: string;
  object_type?: string;
  thumbnail_url?: string;
  image_hash?: string;
  video_id?: string;
  body?: string;
  title?: string;
  instagram_permalink_url?: string;
  effective_object_story_id?: string;
}

const CAMPOS_CAMPANHA =
  'id,name,objective,status,effective_status,daily_budget,lifetime_budget,start_time,stop_time';
const CAMPOS_ADSET =
  'id,name,campaign_id,status,effective_status,daily_budget,lifetime_budget,optimization_goal,targeting';
const CAMPOS_AD = 'id,name,adset_id,campaign_id,status,effective_status,creative{id}';
const CAMPOS_CREATIVE =
  'id,name,object_type,thumbnail_url,image_hash,video_id,body,title,instagram_permalink_url,effective_object_story_id';

/**
 * Campos de insight pedidos no sync.
 *
 * `reach` e os `video_p*_watched_actions` entram porque são etapas do funil em
 * famílias de distribuição/lançamento — sem eles o cone dessas famílias fica
 * vazio, e uma segunda passada só pra buscá-los custaria o dobro de cota.
 */
const CAMPOS_INSIGHT = [
  'campaign_id',
  'adset_id',
  'ad_id',
  'date_start',
  'date_stop',
  'impressions',
  'reach',
  'clicks',
  'spend',
  'frequency',
  'ctr',
  'cpc',
  'cpm',
  'actions',
  'action_values',
  'video_p25_watched_actions',
  'video_p50_watched_actions',
  'video_p75_watched_actions',
  'video_p100_watched_actions',
].join(',');

/**
 * As listagens NÃO filtram por status de propósito.
 *
 * Filtrar por ACTIVE/PAUSED parecia economia de cota até os números provarem o
 * contrário: na conta da Infotráfego, 29 dos 204 anúncios com histórico de
 * entrega estavam ARCHIVED. Sem o metadado deles, 276 linhas de métrica ficavam
 * órfãs — R$ 4.672,83 (21% do investimento) e 35 leads desapareciam das abas de
 * ranking, enquanto a Visão Geral seguia contando. Duas telas com números
 * diferentes é pior do que uma tela lenta.
 */
export async function listarCampanhas(
  adAccountId: string,
  orcamento: Orcamento,
): Promise<MetaCampaign[]> {
  return metaGetAll<MetaCampaign>(
    `/${normalizarAdAccountId(adAccountId)}/campaigns`,
    { fields: CAMPOS_CAMPANHA, limit: 100 },
    orcamento,
  );
}

export async function listarAdSets(
  adAccountId: string,
  orcamento: Orcamento,
): Promise<MetaAdSet[]> {
  return metaGetAll<MetaAdSet>(
    `/${normalizarAdAccountId(adAccountId)}/adsets`,
    // Página pequena: `targeting` é um objeto grande e, sem filtro de status,
    // a conta devolve todo o histórico. Com 200 por página a Meta recusa o
    // volume ("Please reduce the amount of data you're asking for").
    { fields: CAMPOS_ADSET, limit: 25 },
    orcamento,
    200,
  );
}

export async function listarAds(adAccountId: string, orcamento: Orcamento): Promise<MetaAd[]> {
  return metaGetAll<MetaAd>(
    `/${normalizarAdAccountId(adAccountId)}/ads`,
    { fields: CAMPOS_AD, limit: 100 },
    orcamento,
    100,
  );
}

export async function listarCriativos(
  adAccountId: string,
  orcamento: Orcamento,
): Promise<MetaCreative[]> {
  return metaGetAll<MetaCreative>(
    `/${normalizarAdAccountId(adAccountId)}/adcreatives`,
    { fields: CAMPOS_CREATIVE, limit: 100 },
    orcamento,
    100,
  );
}

/**
 * Tamanho máximo, em dias, de cada requisição de insights.
 *
 * A Meta recusa janelas grandes no nível `ad` com `time_increment=1` com
 * "Please reduce the amount of data you're asking for" — e não é rate limit,
 * é o volume de UMA requisição. Aconteceu de verdade tentando puxar 292 dias
 * da conta da Infotráfego (175 ads × 292 dias). 30 dias por bloco passa
 * folgado e ainda mantém o número de chamadas baixo.
 */
const MAX_DIAS_POR_BLOCO = Number(process.env.META_DIAS_POR_BLOCO || 30);

const DIA_MS = 86_400_000;

function iso(d: Date): string {
  return d.toISOString().slice(0, 10);
}

/** Fatia [desde, ate] em blocos de no máximo `MAX_DIAS_POR_BLOCO` dias. */
export function fatiarJanela(
  desde: string,
  ate: string,
  maxDias = MAX_DIAS_POR_BLOCO,
): Array<{ desde: string; ate: string }> {
  const inicio = Date.parse(`${desde}T00:00:00Z`);
  const fim = Date.parse(`${ate}T00:00:00Z`);
  if (Number.isNaN(inicio) || Number.isNaN(fim) || fim < inicio) return [];

  const blocos: Array<{ desde: string; ate: string }> = [];
  for (let cursor = inicio; cursor <= fim; cursor += maxDias * DIA_MS) {
    // -1 dia porque o intervalo da Meta é inclusivo nas duas pontas: sem isso
    // o último dia de um bloco repetiria como primeiro do seguinte.
    const fimDoBloco = Math.min(cursor + (maxDias - 1) * DIA_MS, fim);
    blocos.push({ desde: iso(new Date(cursor)), ate: iso(new Date(fimDoBloco)) });
  }
  return blocos;
}

/**
 * Insights diários de uma conta.
 *
 * `time_increment=1` quebra por dia — é o que torna o upsert idempotente na PK
 * composta (client_id, entity_type, entity_id, date) e o que permite re-rodar
 * uma janela sem duplicar nada.
 *
 * A janela é fatiada em blocos porque a Meta limita o volume por requisição
 * (ver `MAX_DIAS_POR_BLOCO`). Os blocos são sequenciais de propósito: em
 * paralelo eles competiriam pelo mesmo rate limit e o backoff de um atrasaria
 * todos.
 */
export async function buscarInsights(
  adAccountId: string,
  opcoes: {
    desde: string;
    ate: string;
    level: 'campaign' | 'adset' | 'ad';
  },
  orcamento: Orcamento,
): Promise<MetaInsightRow[]> {
  const conta = normalizarAdAccountId(adAccountId);
  const todos: MetaInsightRow[] = [];

  for (const bloco of fatiarJanela(opcoes.desde, opcoes.ate)) {
    const pagina = await metaGetAll<MetaInsightRow>(
      `/${conta}/insights`,
      {
        level: opcoes.level,
        time_range: JSON.stringify({ since: bloco.desde, until: bloco.ate }),
        time_increment: '1',
        fields: CAMPOS_INSIGHT,
        limit: 500,
      },
      orcamento,
      50,
    );
    todos.push(...pagina);
  }

  return todos;
}

/** Lê o estado atual de uma entidade — usado pelo rollback da Fase 2b. */
export async function lerEntidade<T = Record<string, unknown>>(
  metaId: string,
  campos: string,
  orcamento: Orcamento,
): Promise<T> {
  return metaGet<T>(`/${metaId}`, { fields: campos }, orcamento);
}

/** Checagem barata de credencial: 1 chamada, sem tocar em dados de mídia. */
export async function verificarAcesso(
  adAccountId: string,
  orcamento: Orcamento,
): Promise<{ id: string; name: string; account_status: number; currency: string }> {
  return metaGet(
    `/${normalizarAdAccountId(adAccountId)}`,
    { fields: 'id,name,account_status,currency' },
    orcamento,
  );
}
