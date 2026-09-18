/**
 * Pódio · Top 5 campeões × Top 5 piores
 *
 * Lado esquerdo ranqueia pela métrica escolhida; lado direito mostra quem mais
 * queimou verba por lead (ver `piores()` em lib/intel).
 */

import { cn } from '@/lib/utils';
import { fmtMetrica, fmtMoeda, type Metricas, type SortKey } from '@/lib/intel';

interface PodiumProps {
  melhores: Metricas[];
  piores: Metricas[];
  metrica: SortKey;
  metricaLabel: string;
  tituloMelhores: string;
  tituloPiores: string;
  legendaPiores: string;
}

export function Podium({
  melhores,
  piores,
  metrica,
  metricaLabel,
  tituloMelhores,
  tituloPiores,
  legendaPiores,
}: PodiumProps) {
  return (
    <div className="grid lg:grid-cols-2 gap-4">
      <PodiumPanel
        tone="best"
        icone="▲"
        titulo={tituloMelhores}
        legenda={`por ${metricaLabel}`}
        itens={melhores}
        metrica={metrica}
      />
      <PodiumPanel
        tone="worst"
        icone="▼"
        titulo={tituloPiores}
        legenda={legendaPiores}
        itens={piores}
        metrica="cpl"
      />
    </div>
  );
}

function PodiumPanel({
  tone,
  icone,
  titulo,
  legenda,
  itens,
  metrica,
}: {
  tone: 'best' | 'worst';
  icone: string;
  titulo: string;
  legenda: string;
  itens: Metricas[];
  metrica: SortKey;
}) {
  const acento = tone === 'best' ? 'text-success' : 'text-warn';

  return (
    <div className={cn('card border-t-2', tone === 'best' ? 'border-t-success' : 'border-t-warn')}>
      <div className="flex items-center gap-2 mb-3">
        <span className={cn('text-xs', acento)}>{icone}</span>
        <h3 className="text-sm font-extrabold tracking-tight">{titulo}</h3>
        <span className="text-[10px] text-[rgb(var(--muted))] ml-auto">{legenda}</span>
      </div>

      {itens.length === 0 ? (
        <p className="text-xs text-[rgb(var(--muted))] py-4 text-center">
          Nenhum item com investimento relevante no período.
        </p>
      ) : (
        <ol className="space-y-1.5">
          {itens.map((item, i) => (
            <li
              key={item.id}
              className="flex items-center gap-3 py-1.5 border-b border-[rgb(var(--border))] last:border-0"
            >
              <span
                className={cn(
                  'w-5 h-5 shrink-0 rounded flex items-center justify-center text-[10px] font-extrabold',
                  tone === 'best' ? 'bg-success/15 text-success' : 'bg-warn/15 text-warn',
                )}
              >
                {i + 1}
              </span>
              <span className="text-xs font-bold truncate flex-1 min-w-0" title={item.nome}>
                {item.nome}
              </span>
              <span className="text-[10px] text-[rgb(var(--muted))] shrink-0 tabular-nums">
                {fmtMoeda(item.spend, 0)}
              </span>
              <span className={cn('text-xs font-extrabold shrink-0 tabular-nums', acento)}>
                {fmtMetrica(item, metrica)}
              </span>
            </li>
          ))}
        </ol>
      )}
    </div>
  );
}
