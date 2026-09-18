/**
 * Aba Campanhas · ranking com drill-down para os criativos de cada campanha
 *
 * Referencia visual: docs/mockups/creative-intel/index.html (page "campanhas").
 */

import { criativosDaCampanha, getDadosIntel } from '@/lib/data/intel';
import { resolverContexto } from '@/lib/data/contexto';
import { getResumoSync } from '@/lib/data/sync';
import { EstadoVazio, motivoDoVazio } from '@/components/dashboard/intel/estado-vazio';
import type { ParamsBrutos } from '@/lib/filtros';
import type { Metricas } from '@/lib/intel';
import { CampanhasView } from './view';

export const dynamic = 'force-dynamic';

export default async function CampanhasPage({
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

  // O drill-down é pré-calculado no servidor: a alternativa seria mandar as
  // ~milhares de combinações pro browser só pra montar a tabela de uma
  // campanha que o gestor talvez nem abra.
  const drilldowns: Record<string, Metricas[]> = {};
  for (const campanha of dados.campanhas) {
    drilldowns[campanha.id] = criativosDaCampanha(dados, campanha.id);
  }

  return (
    <CampanhasView
      clienteId={ctx.cliente.id}
      campanhas={dados.campanhas}
      drilldowns={drilldowns}
      total={dados.total}
    />
  );
}
