/**
 * Faixa de métricas secundárias (impressões · cliques · CTR · CPC)
 * Aparece no topo das abas Criativos, Públicos e Campanhas.
 */

import { fmtMoeda, fmtNum, fmtPct, type Metricas } from '@/lib/intel';

export function SecondaryRow({ total }: { total: Metricas }) {
  const itens = [
    { label: 'Impressões', valor: fmtNum(total.impressoes) },
    { label: 'Cliques', valor: fmtNum(total.cliques) },
    { label: 'CTR', valor: fmtPct(total.ctr, 2) },
    { label: 'CPC', valor: fmtMoeda(total.cpc) },
    { label: 'CPM', valor: fmtMoeda(total.cpm) },
    { label: 'Page Views', valor: fmtNum(total.pageViews) },
  ];

  return (
    <section>
      <h2 className="text-[10px] uppercase tracking-wider font-bold text-[rgb(var(--muted))] mb-2">
        Métricas secundárias{' '}
        <span className="normal-case tracking-normal font-medium opacity-70">
          (impressões, cliques, CTR, CPC)
        </span>
      </h2>
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
        {itens.map((i) => (
          <div key={i.label} className="card py-3">
            <div className="kpi-label">{i.label}</div>
            <div className="text-lg font-extrabold tracking-tight mt-0.5">{i.valor}</div>
          </div>
        ))}
      </div>
    </section>
  );
}
