/**
 * Construtor de Funil · wizard de 3 etapas
 *
 * Referencia visual: docs/mockups/construtor-funil/index.html (v0.2).
 *   1 · Conectar fonte de dados
 *   2 · Reconhecimento automatico (regras deterministicas em lib/funil.ts)
 *   3 · Ajuste manual, com preview do cone e o JSON da config
 *
 * A config gerada aqui e o que alimenta cone, KPIs e tabelas de todas as abas —
 * por isso o preview usa o MESMO componente FunilCone da Visao Geral.
 */

import { listarClientes, listarFunis, getFunil } from '@/lib/data/funis';
import { EstadoVazio } from '@/components/dashboard/intel/estado-vazio';
import type { ParamsBrutos } from '@/lib/filtros';
import { ConstrutorView } from './view';

export const dynamic = 'force-dynamic';

export default async function ConstrutorFunilPage({
  searchParams,
}: {
  searchParams: Promise<ParamsBrutos>;
}) {
  const params = await searchParams;
  const clientes = await listarClientes();

  if (clientes.length === 0) return <EstadoVazio motivo="sem_acesso" />;

  const funis = await listarFunis();

  // `?editar=<id>` abre o wizard ja preenchido com um funil existente.
  const editarId = typeof params.editar === 'string' ? params.editar : null;
  const emEdicao = editarId ? await getFunil(editarId) : null;

  return <ConstrutorView clientes={clientes} funis={funis} emEdicao={emEdicao} />;
}
