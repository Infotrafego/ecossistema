/**
 * Comercial Consultivo (Fase 5)
 *
 * Pilar que fecha o ciclo da Inteligência de Dados: o que acontece depois que
 * o lead chega. Oito abas — performance, calls com drill-down, fila de leads,
 * time, playbook/coaching, histórico de recomendações, CRM Kanban e conversas.
 *
 * Front-end mockado: os dados vêm de `data/mock-comercial.ts` e
 * `data/mock-gestao.ts`, extraídos do mockup oficial.
 */

import { ComercialView } from './view';

export const dynamic = 'force-dynamic';

export default async function ComercialPage({
  searchParams,
}: {
  searchParams: Promise<{ tab?: string }>;
}) {
  const { tab } = await searchParams;
  return <ComercialView tab={tab} />;
}
