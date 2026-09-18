/**
 * Assistente IA conversacional (Fase 2c · C1)
 */

import { resolverContexto } from '@/lib/data/contexto';
import { EstadoVazio } from '@/components/dashboard/intel/estado-vazio';
import type { ParamsBrutos } from '@/lib/filtros';
import { AssistenteView } from './view';

export const dynamic = 'force-dynamic';

export default async function AssistentePage({
  searchParams,
}: {
  searchParams: Promise<ParamsBrutos>;
}) {
  const ctx = await resolverContexto(await searchParams);
  if (!ctx.cliente) return <EstadoVazio motivo="sem_acesso" />;

  return (
    <AssistenteView
      clienteId={ctx.cliente.id}
      clienteNome={ctx.cliente.nome}
      periodo={{ desde: ctx.filtros.desde, ate: ctx.filtros.ate }}
    />
  );
}
