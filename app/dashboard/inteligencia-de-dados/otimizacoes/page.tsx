/**
 * Aba Analise & Otimizacoes
 *
 * Referencia visual: docs/mockups/creative-intel/index.html (page "otimizacoes").
 * Ordem intencional do mockup: dados -> conclusoes. Primeiro a matriz e o
 * Raio-X (o que aconteceu), so depois as acoes sugeridas (o que fazer).
 */

import { getDadosIntel } from '@/lib/data/intel';
import { resolverContexto } from '@/lib/data/contexto';
import { getResumoSync } from '@/lib/data/sync';
import { acoesSugeridas } from '@/lib/analise';
import { EstadoVazio, motivoDoVazio } from '@/components/dashboard/intel/estado-vazio';
import type { ParamsBrutos } from '@/lib/filtros';
import { OtimizacoesView } from './view';

export const dynamic = 'force-dynamic';

export default async function OtimizacoesPage({
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

  const acoes = acoesSugeridas({
    criativos: dados.criativos,
    publicos: dados.publicos,
    combos: dados.combos,
  });

  return (
    <OtimizacoesView
      clienteId={ctx.cliente.id}
      combos={dados.combos}
      criativos={dados.criativos}
      publicos={dados.publicos}
      campanhas={dados.campanhas}
      acoes={acoes}
    />
  );
}
