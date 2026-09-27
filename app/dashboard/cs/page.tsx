/**
 * Central CS · Gestão de Carteira (Fase 6)
 *
 * Visão multi-cliente do time de Customer Success: risco de churn detectado
 * cedo, pendências cruzadas e calendário.
 *
 * Dados reais onde a escuta dos grupos de WhatsApp cobre (views `cs_escuta_*`,
 * migration 20260927000000): touchpoints, pendências, volume por categoria,
 * tendência de sentimento e um risk score parcial. O Calendário continua
 * mockado (`data/mock-cs.ts`) até agenda e contratos terem fonte.
 */

import { getCarteiraCs } from '@/lib/data/cs';
import { CsView } from './view';

export const dynamic = 'force-dynamic';

export default async function CsPage({
  searchParams,
}: {
  searchParams: Promise<{ tab?: string; cliente?: string }>;
}) {
  const { tab, cliente } = await searchParams;
  const carteira = await getCarteiraCs();
  return <CsView carteira={carteira} tab={tab} clienteInicial={cliente} />;
}
