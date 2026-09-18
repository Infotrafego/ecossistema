/**
 * Estratégia & Inteligência (Fase 6)
 *
 * O "cérebro do cliente" — a camada que a Inteligência de Dados alimenta e que
 * o sócio/gestor sênior leva pra reunião semanal: forecast, plano de testes,
 * saturação, alocação de budget, canais, conteúdo e o registro de decisões.
 *
 * Front-end mockado (`data/mock-estrategia.ts`, extraído do mockup oficial).
 */

import { EstrategiaView } from './view';

export const dynamic = 'force-dynamic';

export default async function EstrategiaPage({
  searchParams,
}: {
  searchParams: Promise<{ tab?: string }>;
}) {
  const { tab } = await searchParams;
  return <EstrategiaView tab={tab} />;
}
