/**
 * Portal Cliente (Fase 6)
 *
 * A mesma base de dados, vista pelo lado de fora: o que o cliente abre. A
 * diferença não é cosmética — aqui não entra custo interno, nome de gestor nem
 * hipótese não validada; entra o que ele precisa pra decidir e o que está
 * esperando por ele.
 *
 * Front-end mockado (`data/mock-portal.ts`, extraído do mockup oficial).
 */

import { PortalView } from './view';

export const dynamic = 'force-dynamic';

export default async function PortalPage({
  searchParams,
}: {
  searchParams: Promise<{ tab?: string }>;
}) {
  const { tab } = await searchParams;
  return <PortalView tab={tab} />;
}
