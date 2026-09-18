/**
 * Gestão Interna (Fase 7)
 *
 * A agência olhando pra si mesma: negócio, pessoas, SOS, aprovações
 * financeiras, chamados e onboarding de cliente novo.
 *
 * Front-end mockado (`data/mock-gestao.ts`, extraído do mockup oficial).
 */

import { GestaoView } from './view';

export const dynamic = 'force-dynamic';

export default async function GestaoInternaPage({
  searchParams,
}: {
  searchParams: Promise<{ tab?: string }>;
}) {
  const { tab } = await searchParams;
  return <GestaoView tab={tab} />;
}
