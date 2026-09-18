/**
 * Aba Publicos · ranking de ad sets e deteccao de saturacao
 *
 * Referencia visual: docs/mockups/creative-intel/index.html (page "publicos").
 */

import { getDadosIntel } from '@/lib/data/intel';
import { resolverContexto } from '@/lib/data/contexto';
import { getResumoSync } from '@/lib/data/sync';
import { EstadoVazio, motivoDoVazio } from '@/components/dashboard/intel/estado-vazio';
import type { ParamsBrutos } from '@/lib/filtros';
import { PublicosView } from './view';

export const dynamic = 'force-dynamic';

export default async function PublicosPage({
  searchParams,
}: {
  searchParams: Promise<ParamsBrutos>;
}) {
  const ctx = await resolverContexto(await searchParams);
  if (!ctx.cliente) return <EstadoVazio motivo="sem_acesso" />;

  const dados = await getDadosIntel({
    clientId: ctx.cliente.id,
    funilId: ctx.filtros.funilId,
    desde: ctx.filtros.desde,
    ate: ctx.filtros.ate,
  });

  if (dados.vazio) {
    const { houveSync } = await getResumoSync(ctx.cliente.id, 5);
    return (
      <EstadoVazio
        motivo={motivoDoVazio({ semAcesso: false, contaMeta: ctx.cliente.contaMeta, houveSync })}
      />
    );
  }

  return (
    <PublicosView
      clienteId={ctx.cliente.id}
      publicos={dados.publicos}
      total={dados.total}
    />
  );
}
