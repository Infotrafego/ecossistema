/**
 * Camada de métricas da Inteligência de Dados · Tools (WAT)
 *
 * Código determinístico que transforma linhas brutas (criativo · público ·
 * campanha) nas métricas derivadas usadas por todas as abas. Nada aqui
 * depende de React — é puro, testável e reusável pelo sync do Meta Ads.
 *
 * Regra do mockup (creative-intel/index.html): métricas de mídia (leads,
 * MQLs, agendamentos, spend) são REAIS; reuniões, vendas, receita, ROAS e LTV
 * são PROJEÇÃO por benchmark até o CRM estar integrado.
 */

/** Benchmarks B2B usados nas projeções enquanto o CRM não está integrado. */
export const BENCHMARKS = {
  showRate: 0.7, // agendamento → reunião realizada
  closeRate: 0.25, // reunião realizada → venda
  ticketMedio: 8_000, // R$ por contrato assinado
  ltvMultiplo: 12, // ticket mensal × 12 meses
} as const;

/** Metas do funil de aquisição da Infotráfego (configuráveis no Construtor). */
export const METAS_PADRAO = {
  cplMax: 40,
  cpmqlMax: 60,
  cpAgendMax: 400,
  convLmMin: 0.55,
  cacMax: 2_400,
  roasMin: 3,
} as const;

export type Alerta = 'escalar' | 'ok' | 'atencao' | 'cortar';
export type Formato = 'Vídeo' | 'Imagem';
export type Status = 'active' | 'inactive';

/** Linha bruta — o shape que o sync do Meta Ads vai entregar. */
export interface LinhaBruta {
  id: string;
  nome: string;
  status: Status;
  formato?: Formato;
  /** Campanhas às quais o item pertence (criativo pode rodar em várias). */
  campanhas?: string[];
  /** Públicos (ad sets) nos quais o item roda. */
  publicos?: string[];
  diasAtivo?: number;
  spend: number;
  impressoes: number;
  cliques: number;
  pageViews: number;
  leads: number;
  mqls: number;
  agend: number;
}

/** Linha com todas as métricas derivadas — o que as abas consomem. */
export interface Metricas extends LinhaBruta {
  ctr: number;
  cpc: number;
  cpm: number;
  cpl: number | null;
  cpmql: number | null;
  cpa: number | null;
  convLm: number | null;
  convClickLead: number | null;
  // Projeções (📊)
  reunioes: number;
  vendas: number;
  receita: number;
  cac: number | null;
  roas: number | null;
  ltv: number;
  alerta: Alerta;
}

function div(a: number, b: number): number | null {
  return b > 0 ? a / b : null;
}

/**
 * Classifica o item em uma das 4 faixas de ação.
 *
 * A ordem importa: "cortar" tem precedência sobre tudo (queima verba sem
 * retorno), e "escalar" só sai quando CPL e conversão estão ambos acima do
 * esperado — não basta ser barato.
 */
export function classificarAlerta(m: Omit<Metricas, 'alerta'>, metas = METAS_PADRAO): Alerta {
  // Gastou o equivalente a 1 CPL-alvo e não trouxe lead nenhum → cortar.
  if (m.leads === 0) return m.spend >= metas.cplMax ? 'cortar' : 'atencao';

  const cpl = m.cpl ?? Infinity;
  const conv = m.convLm ?? 0;

  if (cpl > metas.cplMax * 1.5) return 'cortar';
  if (cpl <= metas.cplMax * 0.7 && conv >= metas.convLmMin) return 'escalar';
  if (cpl <= metas.cplMax && conv >= metas.convLmMin * 0.75) return 'ok';
  return 'atencao';
}

/**
 * Deriva todas as métricas de uma linha bruta.
 *
 * Genérico de propósito: quem passa uma linha com campos extras (um combo
 * criativo × público, por exemplo) recebe esses campos de volta no tipo, e não
 * só o shape de `Metricas`.
 */
export function derivar<T extends LinhaBruta>(linha: T, metas = METAS_PADRAO): T & Metricas {
  const reunioes = Math.round(linha.agend * BENCHMARKS.showRate);
  const vendas = Math.round(reunioes * BENCHMARKS.closeRate);
  const receita = vendas * BENCHMARKS.ticketMedio;

  const base = {
    ...linha,
    ctr: div(linha.cliques, linha.impressoes) ?? 0,
    cpc: div(linha.spend, linha.cliques) ?? 0,
    cpm: (div(linha.spend, linha.impressoes) ?? 0) * 1000,
    cpl: div(linha.spend, linha.leads),
    cpmql: div(linha.spend, linha.mqls),
    cpa: div(linha.spend, linha.agend),
    convLm: div(linha.mqls, linha.leads),
    convClickLead: div(linha.leads, linha.cliques),
    reunioes,
    vendas,
    receita,
    cac: div(linha.spend, vendas),
    roas: div(receita, linha.spend),
    ltv: vendas * BENCHMARKS.ticketMedio * BENCHMARKS.ltvMultiplo,
  };

  return { ...base, alerta: classificarAlerta(base, metas) };
}

export function derivarTodas<T extends LinhaBruta>(linhas: T[], metas = METAS_PADRAO): Array<T & Metricas> {
  return linhas.map((l) => derivar(l, metas));
}

/** Soma um conjunto de linhas num total e deriva as métricas do agregado. */
export function totalizar(linhas: LinhaBruta[], metas = METAS_PADRAO): Metricas {
  const soma = linhas.reduce<LinhaBruta>(
    (acc, l) => ({
      ...acc,
      spend: acc.spend + l.spend,
      impressoes: acc.impressoes + l.impressoes,
      cliques: acc.cliques + l.cliques,
      pageViews: acc.pageViews + l.pageViews,
      leads: acc.leads + l.leads,
      mqls: acc.mqls + l.mqls,
      agend: acc.agend + l.agend,
    }),
    {
      id: '__total__',
      nome: 'Total',
      status: 'active',
      spend: 0,
      impressoes: 0,
      cliques: 0,
      pageViews: 0,
      leads: 0,
      mqls: 0,
      agend: 0,
    },
  );
  return derivar(soma, metas);
}

// ── Ordenação ────────────────────────────────────────────────────────────────

export type SortKey =
  | 'leads' | 'mqls' | 'agend'
  | 'cpl' | 'cpmql' | 'cpa' | 'conv_lm'
  | 'reunioes' | 'vendas' | 'receita' | 'cac' | 'roas' | 'ltv'
  | 'spend' | 'ctr';

/** Métricas de custo: menor é melhor, então ordenam ascendente. */
const MENOR_MELHOR: SortKey[] = ['cpl', 'cpmql', 'cpa', 'cac'];

export const SORT_LABELS: Record<SortKey, string> = {
  leads: 'Leads',
  mqls: 'MQLs',
  agend: 'Agendamentos',
  cpl: 'CPL ↓ (mais barato)',
  cpmql: 'CPMQL ↓',
  cpa: 'CP Agend. ↓',
  conv_lm: 'Conv L→M',
  reunioes: 'Reuniões',
  vendas: 'Vendas',
  receita: 'Receita',
  cac: 'CAC ↓',
  roas: 'ROAS',
  ltv: 'LTV/venda',
  spend: 'Spend',
  ctr: 'CTR',
};

function valorDe(m: Metricas, key: SortKey): number | null {
  switch (key) {
    case 'conv_lm': return m.convLm;
    case 'reunioes': return m.reunioes;
    default: return (m as unknown as Record<string, number | null>)[key] ?? null;
  }
}

/**
 * Ordena pela métrica escolhida. Itens sem valor (null — ex.: CPL de quem não
 * teve lead) vão sempre pro fim, independente da direção.
 */
export function ordenar(linhas: Metricas[], key: SortKey): Metricas[] {
  const asc = MENOR_MELHOR.includes(key);
  return [...linhas].sort((a, b) => {
    const va = valorDe(a, key);
    const vb = valorDe(b, key);
    if (va === null && vb === null) return 0;
    if (va === null) return 1;
    if (vb === null) return -1;
    return asc ? va - vb : vb - va;
  });
}

/**
 * Piores do período: quem mais investiu com menor retorno. Só entra quem
 * gastou de verdade — item com R$ 5 e zero lead é ruído, não problema.
 */
export function piores(linhas: Metricas[], n = 5): Metricas[] {
  const relevantes = linhas.filter((l) => l.spend >= METAS_PADRAO.cplMax);
  return [...relevantes]
    .sort((a, b) => {
      const ra = a.leads > 0 ? a.spend / a.leads : Infinity;
      const rb = b.leads > 0 ? b.spend / b.leads : Infinity;
      if (ra === rb) return b.spend - a.spend;
      return rb - ra;
    })
    .slice(0, n);
}

// ── Formatação ───────────────────────────────────────────────────────────────

export function fmtMoeda(v: number | null, decimais = 2): string {
  if (v === null || !Number.isFinite(v)) return '—';
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
    minimumFractionDigits: decimais,
    maximumFractionDigits: decimais,
  }).format(v);
}

export function fmtNum(v: number | null, decimais = 0): string {
  if (v === null || !Number.isFinite(v)) return '—';
  return new Intl.NumberFormat('pt-BR', {
    minimumFractionDigits: decimais,
    maximumFractionDigits: decimais,
  }).format(v);
}

export function fmtPct(v: number | null, decimais = 1): string {
  if (v === null || !Number.isFinite(v)) return '—';
  return new Intl.NumberFormat('pt-BR', {
    style: 'percent',
    minimumFractionDigits: decimais,
    maximumFractionDigits: decimais,
  }).format(v);
}

export function fmtMetrica(m: Metricas, key: SortKey): string {
  switch (key) {
    case 'cpl': return fmtMoeda(m.cpl);
    case 'cpmql': return fmtMoeda(m.cpmql);
    case 'cpa': return fmtMoeda(m.cpa);
    case 'cac': return fmtMoeda(m.cac);
    case 'spend': return fmtMoeda(m.spend, 0);
    case 'receita': return fmtMoeda(m.receita, 0);
    case 'ltv': return fmtMoeda(m.ltv, 0);
    case 'ctr': return fmtPct(m.ctr, 2);
    case 'conv_lm': return fmtPct(m.convLm);
    case 'roas': return m.roas === null ? '—' : `${fmtNum(m.roas, 1)}x`;
    default: return fmtNum(valorDe(m, key));
  }
}

// ── Apresentação dos alertas ─────────────────────────────────────────────────

export const ALERTA_INFO: Record<Alerta, { icone: string; label: string; classe: string }> = {
  escalar: { icone: '🚀', label: 'Escalar', classe: 'bg-success/10 text-success border-success/30' },
  ok: { icone: '🟢', label: 'Saudável', classe: 'bg-success/10 text-success border-success/30' },
  atencao: { icone: '🟡', label: 'Atenção', classe: 'bg-attention/10 text-attention border-attention/30' },
  cortar: { icone: '🔴', label: 'Cortar', classe: 'bg-warn/10 text-warn border-warn/30' },
};
