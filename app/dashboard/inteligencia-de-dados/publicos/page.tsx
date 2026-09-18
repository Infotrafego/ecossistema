'use client';

/**
 * Aba Públicos · ranking de ad sets e detecção de saturação
 *
 * Referência visual: docs/mockups/creative-intel/index.html (page "publicos").
 */

import { useState } from 'react';
import { Podium } from '@/components/dashboard/intel/podium';
import { NotaProjecao } from '@/components/dashboard/intel/nota-projecao';
import { RankingView, type SortSection } from '@/components/dashboard/intel/ranking-view';
import { SecondaryRow } from '@/components/dashboard/intel/secondary-row';
import { PUBLICOS_METRICAS, TOTAL } from '@/data/mock-intel';
import { ordenar, piores, SORT_LABELS, type SortKey } from '@/lib/intel';

const SORT_SECTIONS: SortSection[] = [
  { titulo: '▣ Primária', chaves: ['leads', 'mqls', 'agend', 'cpl', 'cpmql', 'conv_lm'] },
  { titulo: 'Secundária', chaves: ['spend', 'ctr'] },
];

export default function PublicosPage() {
  const [sort, setSort] = useState<SortKey>('leads');

  const melhores = ordenar(PUBLICOS_METRICAS, sort).slice(0, 5);
  const saturados = piores(PUBLICOS_METRICAS, 5);

  return (
    <div className="space-y-6">
      <header>
        <h1 className="text-xl font-extrabold tracking-tight">Ranking de Públicos</h1>
        <p className="text-sm text-[rgb(var(--muted))] mt-1">
          {PUBLICOS_METRICAS.length} ad sets ativos no funil de aquisição
        </p>
      </header>

      <SecondaryRow total={TOTAL} />

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
        itens={PUBLICOS_METRICAS}
        sortSections={SORT_SECTIONS}
        sortInicial="leads"
        onSortChange={setSort}
        placeholderBusca="Buscar público…"
        substantivo={{ singular: 'público', plural: 'públicos' }}
      />

      <NotaProjecao />
    </div>
  );
}
