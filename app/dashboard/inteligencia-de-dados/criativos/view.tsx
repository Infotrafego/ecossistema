'use client';

import { useState } from 'react';
import { Podium } from '@/components/dashboard/intel/podium';
import { RankingView, type SortSection } from '@/components/dashboard/intel/ranking-view';
import { NotaProjecao } from '@/components/dashboard/intel/nota-projecao';
import { SecondaryRow } from '@/components/dashboard/intel/secondary-row';
import { AnaliseCriativosIA } from '@/components/dashboard/intel/analise-ia';
import { ActionToolbar } from '@/components/dashboard/action-toolbar';
import { ordenar, piores, SORT_LABELS, type Metricas, type SortKey } from '@/lib/intel';

const SORT_SECTIONS: SortSection[] = [
  { titulo: '▣ Funil mídia', chaves: ['leads', 'mqls', 'agend', 'cpl', 'cpmql', 'cpa', 'conv_lm'] },
  { titulo: '📊 Funil vendas (projeção)', chaves: ['reunioes', 'vendas', 'receita', 'cac', 'roas', 'ltv'] },
  { titulo: 'Secundária', chaves: ['spend', 'ctr'] },
];

interface Props {
  clienteId: string;
  clienteNome: string;
  criativos: Metricas[];
  total: Metricas;
  periodo: { desde: string; ate: string };
}

export function CriativosView({ clienteId, clienteNome, criativos, total, periodo }: Props) {
  const [sort, setSort] = useState<SortKey>('leads');
  const [selecionado, setSelecionado] = useState<Metricas | null>(null);

  const melhores = ordenar(criativos, sort).slice(0, 5);
  const piorados = piores(criativos, 5);
  const campeoes = ordenar(criativos, 'leads').slice(0, 5);

  return (
    <div className="space-y-6">
      <header>
        <h1 className="text-xl font-extrabold tracking-tight">Ranking de Criativos</h1>
        <p className="text-sm text-[rgb(var(--muted))] mt-1">
          {clienteNome} · {criativos.length} criativos no período
        </p>
      </header>

      <ActionToolbar
        escopo="criativos"
        clienteId={clienteId}
        selecionado={selecionado ? { id: selecionado.id, nome: selecionado.nome } : null}
        info={`${criativos.length} criativos · ${criativos.filter((c) => c.status === 'active').length} ativos`}
      />

      <SecondaryRow total={total} />

      <Podium
        melhores={melhores}
        piores={piorados}
        metrica={sort}
        metricaLabel={SORT_LABELS[sort].replace(' ↓ (mais barato)', '').replace(' ↓', '')}
        tituloMelhores="Top 5 Campeões"
        tituloPiores="Top 5 Piores"
        legendaPiores="muito investido, poucos leads"
      />

      <AnaliseCriativosIA clienteId={clienteId} criativos={campeoes} periodo={periodo} />

      <div className="border-t border-[rgb(var(--border))]" />

      <RankingView
        itens={criativos}
        sortSections={SORT_SECTIONS}
        sortInicial="leads"
        onSortChange={setSort}
        onSelecionar={setSelecionado}
        selecionadoId={selecionado?.id ?? null}
        placeholderBusca="Buscar criativo, campanha…"
        substantivo={{ singular: 'criativo', plural: 'criativos' }}
        filtrosAvancados
      />

      <NotaProjecao />
    </div>
  );
}
