'use client';

import { useState } from 'react';
import { NotaProjecao } from '@/components/dashboard/intel/nota-projecao';
import { RankingView, type SortSection } from '@/components/dashboard/intel/ranking-view';
import { SecondaryRow } from '@/components/dashboard/intel/secondary-row';
import { ActionToolbar } from '@/components/dashboard/action-toolbar';
import { ALERTA_INFO, fmtMoeda, fmtNum, fmtPct, ordenar, type Metricas } from '@/lib/intel';
import { cn } from '@/lib/utils';

const SORT_SECTIONS: SortSection[] = [
  { titulo: '▣ Primária', chaves: ['leads', 'mqls', 'agend', 'cpl', 'cpmql', 'conv_lm'] },
  { titulo: 'Secundária', chaves: ['spend', 'ctr'] },
];

export function CampanhasView({
  clienteId,
  campanhas,
  drilldowns,
  total,
}: {
  clienteId: string;
  campanhas: Metricas[];
  drilldowns: Record<string, Metricas[]>;
  total: Metricas;
}) {
  const [selecionada, setSelecionada] = useState<Metricas | null>(null);

  return (
    <div className="space-y-6">
      <header>
        <h1 className="text-xl font-extrabold tracking-tight">Ranking de Campanhas</h1>
        <p className="text-sm text-[rgb(var(--muted))] mt-1">
          {campanhas.length} campanhas com entrega no período
        </p>
      </header>

      <ActionToolbar
        escopo="campanhas"
        clienteId={clienteId}
        selecionado={selecionada ? { id: selecionada.id, nome: selecionada.nome } : null}
        info={`${campanhas.length} campanhas · ${campanhas.filter((c) => c.status === 'active').length} ativas`}
      />

      <SecondaryRow total={total} />

      <div className="bg-attention-bg border border-attention/40 text-attention rounded-lg p-3 text-[11px] flex gap-2">
        <span>↗</span>
        <div>
          <strong>Clique em uma campanha</strong> pra abrir o drill-down e ver os criativos dela com
          performance individual.
        </div>
      </div>

      <RankingView
        itens={campanhas}
        sortSections={SORT_SECTIONS}
        sortInicial="leads"
        onSelecionar={setSelecionada}
        selecionadoId={selecionada?.id ?? null}
        placeholderBusca="Buscar campanha…"
        substantivo={{ singular: 'campanha', plural: 'campanhas' }}
        renderDetalhe={(campanha) => <DrillDown criativos={drilldowns[campanha.id] ?? []} />}
      />

      <NotaProjecao />
    </div>
  );
}

function DrillDown({ criativos }: { criativos: Metricas[] }) {
  const ordenados = ordenar(criativos, 'leads');

  if (ordenados.length === 0) {
    return (
      <p className="text-[11px] text-[rgb(var(--muted))] py-2">
        Nenhum criativo com entrega nesta campanha no período.
      </p>
    );
  }

  return (
    <div>
      <h4 className="text-[10px] uppercase tracking-wider font-bold text-[rgb(var(--muted))] mb-2">
        Criativos desta campanha · {ordenados.length}
      </h4>
      <div className="overflow-x-auto">
        <table className="w-full text-[11px]">
          <thead>
            <tr className="text-left text-[9px] uppercase tracking-wider text-[rgb(var(--muted))] font-bold border-b border-[rgb(var(--border))]">
              <th className="py-1.5 pr-2">Criativo</th>
              <th className="py-1.5 px-2 text-right">Investido</th>
              <th className="py-1.5 px-2 text-right">Leads</th>
              <th className="py-1.5 px-2 text-right">MQLs</th>
              <th className="py-1.5 px-2 text-right">CPL</th>
              <th className="py-1.5 px-2 text-right">CPMQL</th>
              <th className="py-1.5 px-2 text-right">Conv L→M</th>
              <th className="py-1.5 pl-2 text-right">Alerta</th>
            </tr>
          </thead>
          <tbody>
            {ordenados.map((c) => {
              const info = ALERTA_INFO[c.alerta];
              return (
                <tr key={c.id} className="border-b border-[rgb(var(--border))] last:border-0">
                  <td className="py-1.5 pr-2 font-bold truncate max-w-[280px]" title={c.nome}>
                    {c.nome}
                  </td>
                  <td className="py-1.5 px-2 text-right tabular-nums">{fmtMoeda(c.spend, 0)}</td>
                  <td className="py-1.5 px-2 text-right tabular-nums font-bold">{fmtNum(c.leads)}</td>
                  <td className="py-1.5 px-2 text-right tabular-nums">{fmtNum(c.mqls)}</td>
                  <td className="py-1.5 px-2 text-right tabular-nums">{fmtMoeda(c.cpl)}</td>
                  <td className="py-1.5 px-2 text-right tabular-nums">{fmtMoeda(c.cpmql)}</td>
                  <td className="py-1.5 px-2 text-right tabular-nums">{fmtPct(c.convLm)}</td>
                  <td className="py-1.5 pl-2 text-right">
                    <span className={cn('px-1.5 py-0.5 rounded border text-[9px] font-bold', info.classe)}>
                      {info.icone} {info.label}
                    </span>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
