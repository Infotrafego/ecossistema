/**
 * Otimizador · regras automaticas (Fase 2c · C3)
 *
 * Criterio de pronto: 5+ regras ativas funcionando, com historico de execucoes
 * rastreavel. A tela cobre os tres: editor, lista e historico.
 */

import { resolverContexto } from '@/lib/data/contexto';
import { listarExecucoes, listarRegras } from '@/lib/data/regras';
import { EstadoVazio } from '@/components/dashboard/intel/estado-vazio';
import type { ParamsBrutos } from '@/lib/filtros';
import { RegrasView } from './view';

export const dynamic = 'force-dynamic';

export default async function RegrasPage({
  searchParams,
}: {
  searchParams: Promise<ParamsBrutos>;
}) {
  const ctx = await resolverContexto(await searchParams);
  if (!ctx.cliente) return <EstadoVazio motivo="sem_acesso" />;

  const [regras, execucoes] = await Promise.all([
    listarRegras(ctx.cliente.id),
    listarExecucoes(ctx.cliente.id),
  ]);

  return (
    <RegrasView
      clienteId={ctx.cliente.id}
      clienteNome={ctx.cliente.nome}
      regras={regras}
      execucoes={execucoes}
    />
  );
}
