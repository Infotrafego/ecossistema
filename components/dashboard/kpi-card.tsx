import { cn, formatNumber, formatPercent, deltaColorClass } from '@/lib/utils';

type KpiCardProps = {
  label: string;
  value: string | number;
  format?: 'number' | 'currency' | 'percent' | 'raw';
  delta?: number;
  inverseDelta?: boolean; // pra métricas onde "menor é melhor" (ex: CPC)
  emphasis?: 'primary' | 'success' | 'warn' | 'neutral';
  className?: string;
};

export function KpiCard({
  label,
  value,
  format = 'raw',
  delta,
  inverseDelta = false,
  emphasis = 'neutral',
  className,
}: KpiCardProps) {
  const displayValue =
    typeof value === 'number'
      ? format === 'currency'
        ? new Intl.NumberFormat('pt-BR', {
            style: 'currency',
            currency: 'BRL',
          }).format(value)
        : format === 'percent'
          ? formatPercent(value)
          : formatNumber(value)
      : value;

  return (
    <div
      className={cn(
        'card transition',
        emphasis === 'primary' && 'bg-navy text-white border-navy',
        emphasis === 'success' && 'border-success',
        emphasis === 'warn' && 'border-warn',
        className,
      )}
    >
      <div
        className={cn(
          'kpi-label',
          emphasis === 'primary' && 'text-white/70',
        )}
      >
        {label}
      </div>
      <div className="kpi-value mt-1">{displayValue}</div>
      {typeof delta === 'number' && (
        <div
          className={cn(
            'text-xs mt-1.5 font-bold flex items-center gap-1',
            emphasis === 'primary'
              ? 'text-white/80'
              : deltaColorClass(delta, inverseDelta),
          )}
        >
          {delta > 0 ? '↑' : delta < 0 ? '↓' : '·'} {formatPercent(Math.abs(delta))}
          <span className="text-[10px] opacity-70 font-normal">vs período anterior</span>
        </div>
      )}
    </div>
  );
}
