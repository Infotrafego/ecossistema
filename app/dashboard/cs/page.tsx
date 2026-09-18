/**
 * Central CS · Gestão de Carteira (Fase 6)
 *
 * Visão multi-cliente do time de Customer Success: risco de churn detectado
 * cedo, pendências cruzadas e calendário. Lê (na versão real) os dados das
 * outras plataformas + os grupos de WhatsApp.
 *
 * Front-end mockado (`data/mock-cs.ts`, extraído do mockup oficial).
 */

import { CsView } from './view';

export const dynamic = 'force-dynamic';

export default async function CsPage({
  searchParams,
}: {
  searchParams: Promise<{ tab?: string; cliente?: string }>;
}) {
  const { tab, cliente } = await searchParams;
  return <CsView tab={tab} clienteInicial={cliente} />;
}
