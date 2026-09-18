/**
 * Filtros globais · período · funil · cliente
 *
 * O estado mora nos search params da URL, não em contexto React. Três razões,
 * nessa ordem: a tela fica linkável (o gestor manda "olha esse CPL" com o
 * recorte junto), sobrevive a F5, e as páginas continuam Server Components —
 * um provider client-side obrigaria a buscar os dados no browser.
 *
 * Puro: sem React e sem Supabase, pra poder ser testado direto.
 */

export type PresetPeriodo = 'hoje' | 'ontem' | '7d' | '30d' | 'mes' | 'mes_anterior' | 'custom';

export interface Filtros {
  clientId: string | null;
  funilId: string | null;
  preset: PresetPeriodo;
  desde: string;
  ate: string;
}

export const ROTULO_PRESET: Record<PresetPeriodo, string> = {
  hoje: 'Hoje',
  ontem: 'Ontem',
  '7d': 'Últimos 7 dias',
  '30d': 'Últimos 30 dias',
  mes: 'Este mês',
  mes_anterior: 'Mês anterior',
  custom: 'Personalizado',
};

export const PRESETS_VISIVEIS: PresetPeriodo[] = ['hoje', 'ontem', '7d', '30d', 'mes', 'mes_anterior'];

const DIA_MS = 86_400_000;

function iso(d: Date): string {
  return d.toISOString().slice(0, 10);
}

/**
 * Datas de um preset.
 *
 * `hoje` é parâmetro em vez de `new Date()` porque duas chamadas em volta da
 * meia-noite devolveriam períodos diferentes na mesma renderização — e porque
 * assim dá pra testar sem mexer no relógio.
 */
export function intervaloDoPreset(preset: PresetPeriodo, hoje = new Date()): { desde: string; ate: string } {
  const base = new Date(Date.UTC(hoje.getUTCFullYear(), hoje.getUTCMonth(), hoje.getUTCDate()));

  switch (preset) {
    case 'hoje':
      return { desde: iso(base), ate: iso(base) };
    case 'ontem': {
      const ontem = new Date(base.getTime() - DIA_MS);
      return { desde: iso(ontem), ate: iso(ontem) };
    }
    case '7d':
      // 7 dias INCLUINDO hoje — "últimos 7 dias" com 8 datas confunde na
      // conferência contra o Gerenciador de Anúncios.
      return { desde: iso(new Date(base.getTime() - 6 * DIA_MS)), ate: iso(base) };
    case '30d':
      return { desde: iso(new Date(base.getTime() - 29 * DIA_MS)), ate: iso(base) };
    case 'mes':
      return {
        desde: iso(new Date(Date.UTC(base.getUTCFullYear(), base.getUTCMonth(), 1))),
        ate: iso(base),
      };
    case 'mes_anterior': {
      const primeiroDesteMes = Date.UTC(base.getUTCFullYear(), base.getUTCMonth(), 1);
      const ultimoDoAnterior = new Date(primeiroDesteMes - DIA_MS);
      return {
        desde: iso(new Date(Date.UTC(ultimoDoAnterior.getUTCFullYear(), ultimoDoAnterior.getUTCMonth(), 1))),
        ate: iso(ultimoDoAnterior),
      };
    }
    case 'custom':
      return { desde: iso(new Date(base.getTime() - 29 * DIA_MS)), ate: iso(base) };
  }
}

const DATA_VALIDA = /^\d{4}-\d{2}-\d{2}$/;

function ehData(v: string | undefined): v is string {
  return typeof v === 'string' && DATA_VALIDA.test(v) && !Number.isNaN(Date.parse(v));
}

export type ParamsBrutos = Record<string, string | string[] | undefined>;

function primeiro(v: string | string[] | undefined): string | undefined {
  return Array.isArray(v) ? v[0] : v;
}

/**
 * Lê os filtros da URL, com defaults seguros.
 *
 * Nada aqui confia no que vem do usuário: data malformada, preset inventado ou
 * intervalo invertido caem no padrão de 30 dias em vez de propagar lixo até a
 * query do Supabase.
 */
export function lerFiltros(params: ParamsBrutos, hoje = new Date()): Filtros {
  const presetBruto = primeiro(params.periodo);
  const preset: PresetPeriodo =
    presetBruto && presetBruto in ROTULO_PRESET ? (presetBruto as PresetPeriodo) : '30d';

  const deParam = primeiro(params.de);
  const ateParam = primeiro(params.ate);

  let { desde, ate } = intervaloDoPreset(preset, hoje);

  if (preset === 'custom' && ehData(deParam) && ehData(ateParam)) {
    // Intervalo invertido é erro de digitação, não intenção: corrige em vez de
    // devolver período vazio.
    desde = deParam <= ateParam ? deParam : ateParam;
    ate = deParam <= ateParam ? ateParam : deParam;
  }

  return {
    clientId: primeiro(params.cliente) ?? null,
    funilId: primeiro(params.funil) ?? null,
    preset,
    desde,
    ate,
  };
}

/** Serializa filtros de volta pra query string, omitindo o que é default. */
export function escreverFiltros(filtros: Partial<Filtros>): string {
  const params = new URLSearchParams();
  if (filtros.clientId) params.set('cliente', filtros.clientId);
  if (filtros.funilId) params.set('funil', filtros.funilId);
  if (filtros.preset && filtros.preset !== '30d') params.set('periodo', filtros.preset);
  if (filtros.preset === 'custom') {
    if (filtros.desde) params.set('de', filtros.desde);
    if (filtros.ate) params.set('ate', filtros.ate);
  }
  const s = params.toString();
  return s ? `?${s}` : '';
}

/** Rótulo curto do período, pro pill do header. */
export function rotuloPeriodo(filtros: Filtros): string {
  if (filtros.preset !== 'custom') return ROTULO_PRESET[filtros.preset];
  const fmt = (d: string) => d.slice(8, 10) + '/' + d.slice(5, 7);
  return `${fmt(filtros.desde)} – ${fmt(filtros.ate)}`;
}

/** Quantidade de dias do período, inclusive as pontas. */
export function diasDoPeriodo(filtros: Pick<Filtros, 'desde' | 'ate'>): number {
  const d = Date.parse(filtros.desde);
  const a = Date.parse(filtros.ate);
  if (Number.isNaN(d) || Number.isNaN(a)) return 0;
  return Math.max(1, Math.round((a - d) / DIA_MS) + 1);
}

/**
 * Período imediatamente anterior, de mesma duração — base dos deltas
 * "vs período anterior" dos KPIs.
 */
export function periodoAnterior(filtros: Pick<Filtros, 'desde' | 'ate'>): { desde: string; ate: string } {
  const dias = diasDoPeriodo(filtros);
  const inicio = Date.parse(filtros.desde);
  return {
    desde: iso(new Date(inicio - dias * DIA_MS)),
    ate: iso(new Date(inicio - DIA_MS)),
  };
}
