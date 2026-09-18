'use client';

import { useState } from 'react';
import { Podium } from '@/components/dashboard/intel/podium';
import { NotaProjecao } from '@/components/dashboard/intel/nota-projecao';
import { RankingView, type SortSection } from '@/components/dashboard/intel/ranking-view';
import { SecondaryRow } from '@/components/dashboard/intel/secondary-row';
import { ActionToolbar } from '@/components/dashboard/action-toolbar';
import { ordenar, piores, SORT_LABELS, type Metricas, type SortKey } from '@/lib/intel';

const SORT_SECTIONS: SortSection[] = [
  { titulo: '▣ Primária', chaves: ['leads', 'mqls', 'agend', 'cpl', 'cpmql', 'conv_lm'] },
  { titulo: 'Secundária', chaves: ['spend', 'ctr'] },
];

export function PublicosView({
  clienteId,
  publicos,
  total,
}: {
  clienteId: string;
  publicos: Metricas[];
  total: Metricas;
}) {
  const [sort, setSort] = useState<SortKey>('leads');
  const [selecionado, setSelecionado] = useState<Metricas | null>(null);

  const melhores = ordenar(publicos, sort).slice(0, 5);
  const saturados = piores(publicos, 5);

  return (
    <div className="space-y-6">
      <header>
        <h1 className="text-xl font-extrabold tracking-tight">Ranking de Públicos</h1>
        <p className="text-sm text-[rgb(var(--muted))] mt-1">
          {publicos.length} ad sets com entrega no período
        </p>
      </header>

      <ActionToolbar
        escopo="publicos"
        clienteId={clienteId}
        selecionado={selecionado ? { id: selecionado.id, nome: selecionado.nome } : null}
        info={`${publicos.length} públicos · ${publicos.filter((p) => p.status === 'active').length} ativos`}
      />

      <SecondaryRow total={total} />

      <Podium
        melhores={melhores}
        piores={saturados}
        metrica={sort}
        metricaLabel={SORT_LABELS[sort].replace(' ↓ (mais barato)', '').replace(' ↓', '')}
        tituloMelhores="Top 5 públicos campeões"
        tituloPiores="Top 5 públicos saturados"
        legendaPiores="alto gasto, baixa qualificação"
      />

      <RankingView
        itens={publicos}
        sortSections={SORT_SECTIONS}
        sortInicial="leads"
        onSortChange={setSort}
        onSelecionar={setSelecionado}
        selecionadoId={selecionado?.id ?? null}
        placeholderBusca="Buscar público…"
        substantivo={{ singular: 'público', plural: 'públicos' }}
      />

      <NotaProjecao />
    </div>
  );
}
