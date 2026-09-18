'use client';

/**
 * Aba Criativos · ranking, pódio e análise estratégica
 *
 * Referência visual: docs/mockups/creative-intel/index.html (page "criativos").
 * Dados: data/mock-intel.ts — trocar por query Supabase quando o sync entrar.
 */

import { useState } from 'react';
import { Podium } from '@/components/dashboard/intel/podium';
import { RankingView, type SortSection } from '@/components/dashboard/intel/ranking-view';
import { NotaProjecao } from '@/components/dashboard/intel/nota-projecao';
import { SecondaryRow } from '@/components/dashboard/intel/secondary-row';
import { ANALISE_CRIATIVOS, CRIATIVOS, TOTAL } from '@/data/mock-intel';
import { ordenar, piores, SORT_LABELS, type SortKey } from '@/lib/intel';

const SORT_SECTIONS: SortSection[] = [
  { titulo: '▣ Funil mídia', chaves: ['leads', 'mqls', 'agend', 'cpl', 'cpmql', 'cpa', 'conv_lm'] },
  { titulo: '📊 Funil vendas (projeção)', chaves: ['reunioes', 'vendas', 'receita', 'cac', 'roas', 'ltv'] },
  { titulo: 'Secundária', chaves: ['spend', 'ctr'] },
];

export default function CriativosPage() {
  const [sort, setSort] = useState<SortKey>('leads');

  const melhores = ordenar(CRIATIVOS, sort).slice(0, 5);
  const piorados = piores(CRIATIVOS, 5);
  const campeoes = ordenar(CRIATIVOS, 'leads').slice(0, 5);

  return (
    <div className="space-y-6">
      <header>
        <h1 className="text-xl font-extrabold tracking-tight">Ranking de Criativos</h1>
        <p className="text-sm text-[rgb(var(--muted))] mt-1">
          Funil de aquisição da Infotráfego · {CRIATIVOS.length} criativos no período
        </p>
      </header>

      <SecondaryRow total={TOTAL} />

      <Podium
        melhores={melhores}
        piores={piorados}
        metrica={sort}
        metricaLabel={SORT_LABELS[sort].replace(' ↓ (mais barato)', '').replace(' ↓', '')}
        tituloMelhores="Top 5 Campeões"
        tituloPiores="Top 5 Piores"
        legendaPiores="muito investido, poucos leads"
      />

      {/* Análise estratégica dos campeões */}
      <section>
        <h2 className="text-xs uppercase tracking-wider font-bold text-[rgb(var(--muted))] mb-3">
          ▣ Análise estratégica · Top 5 campeões
        </h2>
        <div className="grid md:grid-cols-2 xl:grid-cols-3 gap-3">
          {campeoes.map((c) => {
            const analise = ANALISE_CRIATIVOS[c.id];
            if (!analise) return null;
            return (
              <article key={c.id} className="card space-y-2.5">
                <h3 className="text-xs font-extrabold truncate" title={c.nome}>
                  {c.nome}
                </h3>
                <Bloco titulo="Ângulo" texto={analise.angulo} />
                <Bloco titulo="Por que funciona" texto={analise.porque} />
                <Bloco titulo="Próximo passo" texto={analise.proximoPasso} destaque />
              </article>
            );
          })}
        </div>
      </section>

      <div className="border-t border-[rgb(var(--border))]" />

      <RankingView
        itens={CRIATIVOS}
        sortSections={SORT_SECTIONS}
        sortInicial="leads"
        onSortChange={setSort}
        placeholderBusca="Buscar criativo, campanha…"
        substantivo={{ singular: 'criativo', plural: 'criativos' }}
        filtrosAvancados
      />

      <NotaProjecao />
    </div>
  );
}

function Bloco({ titulo, texto, destaque = false }: { titulo: string; texto: string; destaque?: boolean }) {
  return (
    <div>
      <div className="text-[9px] uppercase tracking-wider font-bold text-[rgb(var(--muted))]">
        {titulo}
      </div>
      <p className={destaque ? 'text-[11px] font-bold text-navy mt-0.5' : 'text-[11px] mt-0.5'}>
        {texto}
      </p>
    </div>
  );
}
