/**
 * Linha de KPIs derivada da config do funil
 *
 * Substitui os 8 cards fixos da Visão Geral. Quais cards aparecem, e em que
 * ordem, vem do par `familia.sub_objetivo` (lib/funil-kpis.ts) — a exigência
 * do BRIEFING_01 de que cada componente leia a config em vez de assumir um
 * funil de captação.
 */

import { kpisDoFunil, type DefinicaoKpi } from '@/lib/funil-kpis';
import type { ConfigFunil } from '@/lib/funil';
import {
  custoPorEtapa,
  fmtMoeda,
  fmtNum,
  fmtPct,
  valorDaEtapa,
  type Metricas,
} from '@/lib/intel';
import { cn } from '@/lib/utils';

interface Props {
  funil: ConfigFunil | null;
  total: Metricas;
  /** Mesmo agregado no período anterior — base do delta. `null` = sem base. */
  anterior: Metricas | null;
}

/** Valor de um KPI e o mesmo valor no período anterior, pro delta. */
function valorDoKpi(kpi: DefinicaoKpi, m: Metricas): number | null {
  if (kpi.fonte.tipo === 'etapa') {
    return kpi.custoPorEtapa ? custoPorEtapa(m, kpi.custoPorEtapa) : valorDaEtapa(m, kpi.fonte.etapa);
  }
  switch (kpi.fonte.metrica) {
    case 'spend': return m.spend;
    case 'ctr': return m.ctr;
    case 'cpc': return m.cpc;
    case 'cpm': return m.cpm;
    case 'receita': return m.receita;
    case 'roas': return m.roas;
    case 'cac': return m.cac;
    case 'ltv': return m.ltv;
  }
}

function formatar(kpi: DefinicaoKpi, valor: number | null): string {
  if (valor === null) return '—';
  switch (kpi.formato) {
    case 'moeda': return fmtMoeda(valor, valor >= 1000 ? 0 : 2);
    case 'percentual': return fmtPct(valor, 2);
    case 'multiplo': return `${valor.toFixed(2)}x`;
    default: return fmtNum(valor);
  }
}

export function KpiRow({ funil, total, anterior }: Props) {
  const kpis = kpisDoFunil(funil?.familia ?? null, funil?.subObjetivo ?? null, funil?.etapas ?? []);

  if (kpis.length === 0) {
    return (
      <section className="card">
        <p className="text-[11px] text-[rgb(var(--muted))]">
          Selecione um funil no filtro do topo pra ver os KPIs dele. Sem funil, o app não sabe
          quais métricas são as primárias deste recorte.
        </p>
      </section>
    );
  }

  return (
    <section className="space-y-3">
      <h2 className="text-xs uppercase tracking-wider font-bold text-[rgb(var(--muted))]">
        Métricas do funil
      </h2>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {kpis.map((kpi, i) => {
          const valor = valorDoKpi(kpi, total);
          const valorAnterior = anterior ? valorDoKpi(kpi, anterior) : null;

          // Delta só quando há base: com período anterior zerado, qualquer
          // número viraria "+∞%", que não informa nada.
          const delta =
            valor !== null && valorAnterior !== null && valorAnterior !== 0
              ? (valor - valorAnterior) / Math.abs(valorAnterior)
              : null;

          // Em métrica de custo, cair é bom.
          const custoEhMelhorMenor = Boolean(kpi.custoPorEtapa) ||
            (kpi.fonte.tipo === 'derivada' && ['cpc', 'cpm', 'cac'].includes(kpi.fonte.metrica));

          const bom = delta === null ? null : custoEhMelhorMenor ? delta < 0 : delta > 0;

          return (
            <div
              key={`${kpi.label}-${i}`}
              className={cn('card', kpi.primario && 'bg-navy text-white border-navy')}
            >
              <div
                className={cn(
                  'kpi-label flex items-center gap-1',
                  kpi.primario && 'text-white/70',
                )}
              >
                <span className="truncate">{kpi.label}</span>
                {kpi.projecao && <span title="Projeção por benchmark">📊</span>}
              </div>
              <div className="kpi-value mt-1 tabular-nums">{formatar(kpi, valor)}</div>
              {delta !== null && (
                <div
                  className={cn(
                    'text-xs mt-1.5 font-bold flex items-center gap-1',
                    kpi.primario ? 'text-white/80' : bom ? 'text-success' : 'text-warn',
                  )}
                >
                  {delta > 0 ? '↑' : delta < 0 ? '↓' : '·'} {fmtPct(Math.abs(delta))}
                  <span className="text-[10px] opacity-70 font-normal">vs período anterior</span>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </section>
  );
}
