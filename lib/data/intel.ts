/**
 * Leitura da Inteligência de Dados · Supabase → shape de `lib/intel.ts`
 *
 * ⚠ SERVER ONLY. Importa `lib/supabase/server`, que usa `next/headers` — só
 * roda em Server Component ou Route Handler. (Sem o pacote `server-only` pra
 * não adicionar dependência; o import de `next/headers` já quebra o build se
 * alguém tentar usar isto de um Client Component.)
 *
 * Substitui `data/mock-intel.ts`. A camada de métricas não mudou: continua
 * recebendo `LinhaBruta[]` e devolvendo `Metricas` — o que mudou é de onde as
 * linhas vêm.
 *
 * GRÃO ATÔMICO = o ad. Na Meta, um ad JÁ É a combinação criativo × público
 * (um criativo dentro de um ad set), então a linha de ad é exatamente o "combo"
 * que o mockup usa no Raio-X e na matriz pivot. Criativos, Públicos e Campanhas
 * são agregações dessa mesma base — é o que garante que as 5 abas fechem no
 * mesmo número. Por isso as leituras NÃO usam as linhas pré-agregadas que o
 * sync grava em `metrics_daily` para adset/campaign/creative: aquelas existem
 * pra consulta rápida, mas misturar as duas fontes numa mesma tela é como as
 * abas passariam a divergir.
 */

import { createClient } from '@/lib/supabase/server';
import type { ConfigFunil, EtapaId } from '@/lib/funil';
import {
  derivar,
  derivarTodas,
  somarLinhas,
  totalizar,
  type Formato,
  type LinhaBruta,
  type Metricas,
  type Status,
} from '@/lib/intel';
import { funilDaLinha } from './funis';

export interface FiltrosIntel {
  clientId: string;
  funilId: string | null;
  desde: string;
  ate: string;
}

export interface Combo extends LinhaBruta {
  criativoId: string;
  criativoNome: string;
  publicoId: string;
  publicoNome: string;
  campanha: string;
  campanhaId: string;
}

export type ComboMetricas = Combo & Metricas;

export interface LinhaDiaria {
  date: string;
  spend: number;
  impressoes: number;
  cliques: number;
  leads: number;
  mqls: number;
  agend: number;
  reunioes: number;
  vendas: number;
  receita: number;
}

export interface DadosIntel {
  combos: ComboMetricas[];
  criativos: Metricas[];
  publicos: Metricas[];
  campanhas: Metricas[];
  total: Metricas;
  diario: LinhaDiaria[];
  funil: ConfigFunil | null;
  /** `true` quando não há nenhuma linha no período — as telas mostram vazio. */
  vazio: boolean;
}

/** Linha de `metrics_daily` no nível de ad, já com os campos que interessam. */
interface LinhaMetrica {
  entity_id: string;
  date: string;
  impressions: number;
  clicks: number;
  spend: number;
  revenue: number;
  stage_values: Partial<Record<EtapaId, number>>;
}

const TAMANHO_PAGINA = 1000;

/**
 * Acima disto, o filtro `in` vira uma URL longa demais.
 *
 * O PostgREST recebe o `in.(...)` na query string, e um id de ad da Meta tem
 * ~17 caracteres: com uns 400 ads a URL passa do limite que proxies costumam
 * aceitar e a resposta volta 414 — ou, pior, truncada. Acima do corte, busca
 * tudo do cliente e filtra em memória: mais linhas trafegadas, mas correto.
 */
const MAX_IDS_NO_FILTRO = 300;

/**
 * Lê todas as páginas de `metrics_daily` no nível de ad.
 *
 * O PostgREST corta em 1000 linhas por padrão e não avisa — sem paginar, um
 * cliente com 130 ads em 30 dias perderia dois terços do período e o dashboard
 * mostraria números menores sem nenhum erro aparente.
 */
async function lerMetricasDeAds(
  supabase: Awaited<ReturnType<typeof createClient>>,
  filtros: FiltrosIntel,
  adIds: string[],
): Promise<LinhaMetrica[]> {
  if (adIds.length === 0) return [];

  const filtrarNoBanco = adIds.length <= MAX_IDS_NO_FILTRO;
  const permitidos = new Set(adIds);
  const linhas: LinhaMetrica[] = [];

  for (let offset = 0; ; offset += TAMANHO_PAGINA) {
    let query = supabase
      .from('metrics_daily')
      .select('entity_id, date, impressions, clicks, spend, revenue, stage_values')
      .eq('client_id', filtros.clientId)
      .eq('entity_type', 'ad')
      .gte('date', filtros.desde)
      .lte('date', filtros.ate);

    if (filtrarNoBanco) query = query.in('entity_id', adIds);

    const { data, error } = await query
      .order('date', { ascending: true })
      .range(offset, offset + TAMANHO_PAGINA - 1);

    if (error) throw new Error(`metrics_daily: ${error.message}`);

    for (const linha of (data ?? []) as LinhaMetrica[]) {
      if (filtrarNoBanco || permitidos.has(linha.entity_id)) linhas.push(linha);
    }

    if (!data || data.length < TAMANHO_PAGINA) break;
  }
  return linhas;
}

interface MetaDoAd {
  metaId: string;
  nome: string;
  status: Status;
  criativoId: string;
  criativoNome: string;
  formato?: Formato;
  publicoId: string;
  publicoNome: string;
  campanhaId: string;
  campanhaNome: string;
}

/**
 * Metadados dos ads do cliente, opcionalmente restritos a um funil.
 *
 * O filtro de funil mora na campanha (`campaigns.funil_id`), então filtrar por
 * funil é filtrar o conjunto de ads antes de tocar nas métricas — mais barato
 * do que trazer tudo e descartar depois.
 */
async function lerMetadados(
  supabase: Awaited<ReturnType<typeof createClient>>,
  filtros: FiltrosIntel,
): Promise<MetaDoAd[]> {
  let queryCampanhas = supabase
    .from('campaigns')
    .select('id, meta_id, name, funil_id')
    .eq('client_id', filtros.clientId);

  if (filtros.funilId) queryCampanhas = queryCampanhas.eq('funil_id', filtros.funilId);

  const [{ data: campanhas, error: erroCamp }, { data: adsets, error: erroAdset },
    { data: ads, error: erroAds }, { data: criativos, error: erroCri }] = await Promise.all([
    queryCampanhas,
    supabase.from('adsets').select('id, meta_id, name, campaign_id').eq('client_id', filtros.clientId),
    supabase.from('ads').select('meta_id, name, status, adset_id, creative_id').eq('client_id', filtros.clientId),
    supabase.from('creatives').select('id, meta_id, type, copy').eq('client_id', filtros.clientId),
  ]);

  const erro = erroCamp ?? erroAdset ?? erroAds ?? erroCri;
  if (erro) throw new Error(`metadados: ${erro.message}`);

  const porCampanha = new Map((campanhas ?? []).map((c) => [c.id, c]));
  const porAdset = new Map((adsets ?? []).map((a) => [a.id, a]));
  const porCriativo = new Map((criativos ?? []).map((c) => [c.id, c]));

  const resultado: MetaDoAd[] = [];
  for (const ad of ads ?? []) {
    const adset = porAdset.get(ad.adset_id);
    if (!adset) continue;
    const campanha = porCampanha.get(adset.campaign_id);
    // Ad de campanha fora do funil filtrado: não entra.
    if (!campanha) continue;

    const criativo = ad.creative_id ? porCriativo.get(ad.creative_id) : undefined;
    resultado.push({
      metaId: ad.meta_id,
      nome: ad.name,
      status: ad.status === 'ACTIVE' ? 'active' : 'inactive',
      criativoId: criativo?.meta_id ?? `sem-criativo:${ad.meta_id}`,
      criativoNome: ad.name,
      formato: criativo?.type === 'video' ? 'Vídeo' : criativo ? 'Imagem' : undefined,
      publicoId: adset.meta_id,
      publicoNome: adset.name,
      campanhaId: campanha.meta_id,
      campanhaNome: campanha.name,
    });
  }
  return resultado;
}

/** Converte um grupo de linhas diárias numa `LinhaBruta` do período. */
function comprimir(
  linhas: LinhaMetrica[],
  base: Omit<LinhaBruta, 'spend' | 'impressoes' | 'cliques' | 'pageViews' | 'leads' | 'mqls' | 'agend'>,
): LinhaBruta {
  const stages: Partial<Record<EtapaId, number>> = {};
  let spend = 0;
  let receita = 0;
  const diasComEntrega = new Set<string>();

  for (const l of linhas) {
    spend += Number(l.spend) || 0;
    receita += Number(l.revenue) || 0;
    if ((Number(l.impressions) || 0) > 0) diasComEntrega.add(l.date);
    for (const [etapa, valor] of Object.entries(l.stage_values ?? {})) {
      const id = etapa as EtapaId;
      stages[id] = (stages[id] ?? 0) + (Number(valor) || 0);
    }
  }

  return {
    ...base,
    // `diasAtivo` conta dias com ENTREGA, não dias desde a criação: é o número
    // que o diagnóstico de fadiga usa, e um ad pausado no meio não envelheceu
    // nos dias em que não rodou.
    diasAtivo: diasComEntrega.size,
    spend,
    impressoes: stages.impressao ?? 0,
    cliques: stages.clique ?? 0,
    pageViews: stages.page_view ?? 0,
    leads: stages.lead ?? stages.aplicacao_completa ?? 0,
    mqls: stages.mql ?? 0,
    agend: stages.agendamento ?? 0,
    stages,
    receitaReal: receita > 0 ? receita : undefined,
  };
}

function agruparPor<T>(itens: T[], chave: (i: T) => string): Map<string, T[]> {
  const mapa = new Map<string, T[]>();
  for (const item of itens) {
    const k = chave(item);
    const atual = mapa.get(k);
    if (atual) atual.push(item);
    else mapa.set(k, [item]);
  }
  return mapa;
}

/**
 * `cliente` permite injetar um client Supabase — usado pelos scripts de
 * conferência, que rodam fora de um request e portanto não têm `next/headers`.
 * Em produção fica sempre undefined e vale a sessão do usuário (com RLS).
 */
export async function getDadosIntel(
  filtros: FiltrosIntel,
  cliente?: Awaited<ReturnType<typeof createClient>>,
): Promise<DadosIntel> {
  const supabase = cliente ?? (await createClient());

  const [metadados, funil] = await Promise.all([
    lerMetadados(supabase, filtros),
    funilDaLinha(supabase, filtros.funilId),
  ]);

  const metricas = await lerMetricasDeAds(
    supabase,
    filtros,
    metadados.map((m) => m.metaId),
  );

  const porAd = agruparPor(metricas, (l) => l.entity_id);

  const combosBrutos: Combo[] = metadados
    .map((meta) => {
      const linhas = porAd.get(meta.metaId) ?? [];
      const bruta = comprimir(linhas, {
        id: meta.metaId,
        nome: meta.nome,
        status: meta.status,
        formato: meta.formato,
        campanhas: [meta.campanhaNome],
        publicos: [meta.publicoNome],
      });
      return {
        ...bruta,
        criativoId: meta.criativoId,
        criativoNome: meta.criativoNome,
        publicoId: meta.publicoId,
        publicoNome: meta.publicoNome,
        campanha: meta.campanhaNome,
        campanhaId: meta.campanhaId,
      };
    })
    // Ad sem nenhuma entrega no período é ruído na tela: não gastou, não
    // entregou, não tem o que analisar.
    .filter((c) => c.spend > 0 || c.impressoes > 0);

  const combos = derivarTodas(combosBrutos);

  const agregarGrupo = (grupo: Combo[], id: string, nome: string): Metricas => {
    const soma = somarLinhas(grupo);
    return derivar({
      ...soma,
      id,
      nome,
      status: grupo.some((g) => g.status === 'active') ? 'active' : 'inactive',
      formato: grupo[0]?.formato,
      campanhas: Array.from(new Set(grupo.map((g) => g.campanha))),
      publicos: Array.from(new Set(grupo.map((g) => g.publicoNome))),
      diasAtivo: Math.max(...grupo.map((g) => g.diasAtivo ?? 0), 0),
    });
  };

  const criativos = Array.from(agruparPor(combosBrutos, (c) => c.criativoId)).map(([id, grupo]) =>
    agregarGrupo(grupo, id, grupo[0].criativoNome),
  );
  const publicos = Array.from(agruparPor(combosBrutos, (c) => c.publicoId)).map(([id, grupo]) =>
    agregarGrupo(grupo, id, grupo[0].publicoNome),
  );
  const campanhas = Array.from(agruparPor(combosBrutos, (c) => c.campanhaId)).map(([id, grupo]) =>
    agregarGrupo(grupo, id, grupo[0].campanha),
  );

  return {
    combos,
    criativos,
    publicos,
    campanhas,
    total: totalizar(combosBrutos),
    diario: construirDiario(metricas),
    funil,
    vazio: combosBrutos.length === 0,
  };
}

/**
 * Série temporal do período, um ponto por dia.
 *
 * Reunioes/vendas seguem a mesma projeção por benchmark de `lib/intel.ts`,
 * aplicada dia a dia — usar o total do período e ratear daria outro número por
 * causa do arredondamento, e as duas telas mostrariam valores diferentes.
 */
function construirDiario(metricas: LinhaMetrica[]): LinhaDiaria[] {
  const porDia = agruparPor(metricas, (l) => l.date);

  return Array.from(porDia)
    .map(([date, linhas]) => {
      const bruta = comprimir(linhas, { id: date, nome: date, status: 'active' });
      const m = derivar(bruta);
      return {
        date,
        spend: m.spend,
        impressoes: m.impressoes,
        cliques: m.cliques,
        leads: m.leads,
        mqls: m.mqls,
        agend: m.agend,
        reunioes: m.reunioes,
        vendas: m.vendas,
        receita: m.receita,
      };
    })
    .sort((a, b) => a.date.localeCompare(b.date));
}

/** Criativos de uma campanha — drill-down da aba Campanhas. */
export function criativosDaCampanha(dados: DadosIntel, campanhaId: string): Metricas[] {
  const combos = dados.combos.filter((c) => c.campanhaId === campanhaId);
  return Array.from(agruparPor(combos, (c) => c.criativoId)).map(([id, grupo]) => {
    const soma = somarLinhas(grupo);
    return derivar({
      ...soma,
      id,
      nome: grupo[0].criativoNome,
      status: grupo.some((g) => g.status === 'active') ? 'active' : 'inactive',
      formato: grupo[0].formato,
      publicos: Array.from(new Set(grupo.map((g) => g.publicoNome))),
    });
  });
}
