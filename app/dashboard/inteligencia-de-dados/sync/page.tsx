/**
 * Status do sync Meta Ads
 *
 * Existe por um criterio de pronto especifico: "sync rodando diariamente sem
 * falhas por 7 dias seguidos". Essa e uma afirmacao que precisa de evidencia,
 * nao de memoria — a tela mostra a serie e conta os dias.
 */

import { resolverContexto } from '@/lib/data/contexto';
import { getResumoSync } from '@/lib/data/sync';
import { EstadoVazio } from '@/components/dashboard/intel/estado-vazio';
import type { ParamsBrutos } from '@/lib/filtros';
import { SyncView } from './view';

export const dynamic = 'force-dynamic';

export default async function SyncPage({
  searchParams,
}: {
  searchParams: Promise<ParamsBrutos>;
}) {
  const ctx = await resolverContexto(await searchParams);
  if (!ctx.cliente) return <EstadoVazio motivo="sem_acesso" />;

  const resumo = await getResumoSync(ctx.cliente.id, 30);

  return (
    <SyncView
      cliente={{ id: ctx.cliente.id, nome: ctx.cliente.nome, contaMeta: ctx.cliente.contaMeta }}
      resumo={resumo}
    />
  );
}
