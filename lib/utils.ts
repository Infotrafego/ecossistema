import { type ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

/**
 * Combina classes Tailwind com clsx + tailwind-merge
 * (padrão shadcn/ui)
 */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/**
 * Formata número como currency BRL
 */
export function formatCurrency(value: number): string {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  }).format(value);
}

/**
 * Formata número com separador de milhar
 */
export function formatNumber(value: number, decimals = 0): string {
  return new Intl.NumberFormat('pt-BR', {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  }).format(value);
}

/**
 * Formata percentual
 */
export function formatPercent(value: number, decimals = 1): string {
  return new Intl.NumberFormat('pt-BR', {
    style: 'percent',
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  }).format(value);
}

/**
 * Calcula delta percentual entre dois valores
 */
export function calcDelta(current: number, previous: number): number {
  if (previous === 0) return 0;
  return (current - previous) / previous;
}

/**
 * Classe de cor baseada no delta (positivo verde · negativo vermelho)
 */
export function deltaColorClass(delta: number, inverse = false): string {
  if (delta === 0) return 'text-gray';
  const isPositive = inverse ? delta < 0 : delta > 0;
  return isPositive ? 'text-success' : 'text-warn';
}
