/**
 * Resolução determinística dos alvos do assistente
 *
 * Recebe o filtro que o modelo produziu e devolve as entidades REAIS que casam,
 * lendo `metrics_daily`. Nenhum id vem do modelo — essa é a garantia de que uma
 * alucinação vira "nenhum alvo encontrado" em vez de "pausou o anúncio errado".
 *
 * ⚠ SERVER ONLY.
 */

import type { ServiceClient } from '@/lib/supabase/service';
import type { FiltroAlvo } from '@/lib/claude/assistente';
import { valorNoDia, type DiaDaEntidade, type MetricaRegra, type OperadorRegra } from '@/lib/regras';

export interface AlvoResolvido {
  metaId: string;
  nome: string;
  campanha: string;
  /** Valor da métrica do filtro no período, quando houve filtro de métrica. */
  valorMetrica: number | null;
  spend: number;
}

const TAMANHO_PAGINA = 1000;

function compara(valor: number, operador: OperadorRegra, alvo: number): boolean {
  switch (operador) {
    case 'gt': return valor > alvo;
    case 'gte': return valor >= alvo;
    case 'lt': return valor < alvo;
    case 'lte': return valor <= alvo;
  }
}

function contem(texto: string, termo?: string): boolean {
  if (!termo) return true;
  return texto.toLowerCase().includes(termo.toLowerCase());
}

/**
 * Resolve os alvos de um filtro.
 *
 * A métrica é avaliada sobre o AGREGADO do período, não dia a dia como nas
 * regras automáticas: o gestor que digita "freq > 3.5" quer dizer "está com
 * frequência alta agora", não "esteve em todos os dias".
 */
export async function resolverAlvos(
  supabase: ServiceClient,
  clientId: string,
  filtro: FiltroAlvo,
  periodo: { desde: string; ate: string },
): Promise<AlvoResolvido[]> {
  const tabela =
    filtro.escopo === 'campaign' ? 'campaigns' : filtro.escopo === 'adset' ? 'adsets' : 'ads';

  const [{ data: entidades }, { data: campanhas }, { data: adsets }] = await Promise.all([
    supabase.from(tabela).select('*').eq('client_id', clientId),
    supabase.from('campaigns').select('id, meta_id, name').eq('client_id', clientId),
    supabase.from('adsets').select('id, meta_id, name, campaign_id').eq('client_id', clientId),
  ]);

  const campanhaPorId = new Map((campanhas ?? []).map((c) => [c.id, c]));
  const adsetPorId = new Map((adsets ?? []).map((a) => [a.id, a]));

  /** Nome da campanha à qual a entidade pertence, em qualquer escopo. */
  const campanhaDe = (e: Record<string, unknown>): string => {
    if (filtro.escopo === 'campaign') return String(e.name ?? '');
    if (filtro.escopo === 'adset') return campanhaPorId.get(String(e.campaign_id))?.name ?? '';
    const adset = adsetPorId.get(String(e.adset_id));
    return adset ? (campanhaPorId.get(adset.campaign_id)?.name ?? '') : '';
  };

  const candidatas = (entidades ?? []).filter((e) => {
    const registro = e as unknown as Record<string, unknown>;
    // Ação sobre entidade já pausada não faz sentido e polui a confirmação.
    if (String(registro.status ?? '') !== 'ACTIVE') return false;
    if (!contem(String(registro.name ?? ''), filtro.nomeContem)) return false;
    if (!contem(campanhaDe(registro), filtro.campanhaContem)) return false;
    return true;
  });

  if (candidatas.length === 0) return [];

  const metaIds = new Set(candidatas.map((c) => String((c as unknown as Record<string, unknown>).meta_id)));
  const series = new Map<string, DiaDaEntidade[]>();

  for (let offset = 0; ; offset += TAMANHO_PAGINA) {
    const { data } = await supabase
      .from('metrics_daily')
      .select('entity_id, date, impressions, clicks, spend, frequency, stage_values')
      .eq('client_id', clientId)
      .eq('entity_type', filtro.escopo)
      .gte('date', periodo.desde)
      .lte('date', periodo.ate)
      .range(offset, offset + TAMANHO_PAGINA - 1);

    for (const m of data ?? []) {
      if (!metaIds.has(m.entity_id)) continue;
      const stages = (m.stage_values ?? {}) as Record<string, number>;
      const lista = series.get(m.entity_id) ?? [];
      lista.push({
        date: m.date,
        impressoes: Number(m.impressions) || 0,
        cliques: Number(m.clicks) || 0,
        spend: Number(m.spend) || 0,
        leads: Number(stages.lead ?? stages.aplicacao_completa ?? 0),
        mqls: Number(stages.mql ?? 0),
        frequencia: m.frequency === null ? null : Number(m.frequency),
      });
      series.set(m.entity_id, lista);
    }

    if (!data || data.length < TAMANHO_PAGINA) break;
  }

  const resolvidos: AlvoResolvido[] = [];

  for (const candidata of candidatas) {
    const registro = candidata as unknown as Record<string, unknown>;
    const metaId = String(registro.meta_id);
    const dias = series.get(metaId) ?? [];
    if (dias.length === 0) continue;

    const agregado = agregarPeriodo(dias);
    const valorMetrica = filtro.metrica ? valorNoDia(agregado, filtro.metrica) : null;

    if (filtro.metrica && filtro.operador && typeof filtro.valor === 'number') {
      // `null` (métrica indefinida no período) nunca casa — mesma regra do
      // otimizador: sem denominador não há afirmação a fazer.
      if (valorMetrica === null || !compara(valorMetrica, filtro.operador, filtro.valor)) continue;
    }

    resolvidos.push({
      metaId,
      nome: String(registro.name ?? metaId),
      campanha: campanhaDe(registro),
      valorMetrica,
      spend: agregado.spend,
    });
  }

  // Sem critério explícito, os que mais gastaram primeiro: é onde está a
  // consequência da ação.
  resolvidos.sort((a, b) => b.spend - a.spend);
  return typeof filtro.limite === 'number' && filtro.limite > 0
    ? resolvidos.slice(0, filtro.limite)
    : resolvidos;
}

/** Soma o período numa "pseudo-linha diária", pra reusar `valorNoDia`. */
function agregarPeriodo(dias: DiaDaEntidade[]): DiaDaEntidade {
  const total = dias.reduce<DiaDaEntidade>(
    (acc, d) => ({
      date: d.date,
      impressoes: acc.impressoes + d.impressoes,
      cliques: acc.cliques + d.cliques,
      spend: acc.spend + d.spend,
      leads: acc.leads + d.leads,
      mqls: acc.mqls + d.mqls,
      frequencia: acc.frequencia,
    }),
    { date: '', impressoes: 0, cliques: 0, spend: 0, leads: 0, mqls: 0, frequencia: null },
  );

  // Frequência não soma: é média ponderada por impressão.
  let peso = 0;
  let somaFreq = 0;
  for (const d of dias) {
    if (typeof d.frequencia === 'number' && d.impressoes > 0) {
      somaFreq += d.frequencia * d.impressoes;
      peso += d.impressoes;
    }
  }
  total.frequencia = peso > 0 ? somaFreq / peso : null;

  return total;
}

/** Métrica usada só na exibição do plano — não decide nada. */
export function rotularMetrica(metrica: MetricaRegra | undefined, valor: number | null): string {
  if (!metrica || valor === null) return '—';
  if (metrica === 'ctr' || metrica === 'conv_lm') return `${(valor * 100).toFixed(2)}%`;
  if (metrica === 'leads') return String(Math.round(valor));
  return valor.toFixed(2);
}
