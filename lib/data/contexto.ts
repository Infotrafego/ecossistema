/**
 * Contexto de uma página da Inteligência de Dados
 *
 * Resolve, em um lugar só, a pergunta que TODAS as 5 abas fazem: qual cliente,
 * qual funil, qual período. Se cada página resolvesse por conta própria, duas
 * abas poderiam discordar sobre qual é o cliente padrão — e o gestor veria
 * números diferentes navegando entre elas com a mesma URL.
 *
 * ⚠ SERVER ONLY.
 */

import { lerFiltros, type Filtros, type ParamsBrutos } from '@/lib/filtros';
import { listarClientes, listarFunis, type ClienteResumo, type FunilResumo } from './funis';

export interface Contexto {
  filtros: Filtros & { clientId: string | null };
  clientes: ClienteResumo[];
  cliente: ClienteResumo | null;
  funis: FunilResumo[];
  /** `true` quando o usuário não tem acesso a nenhum cliente. */
  semAcesso: boolean;
}

export async function resolverContexto(params: ParamsBrutos): Promise<Contexto> {
  const clientes = await listarClientes();
  const lidos = lerFiltros(params);

  // Cliente pedido na URL só vale se o usuário tiver acesso a ele: sem essa
  // checagem, trocar o uuid na barra de endereço não vazaria dados (o RLS
  // barra), mas renderizaria uma tela vazia sem dizer por quê.
  const pedido = lidos.clientId ? clientes.find((c) => c.id === lidos.clientId) : undefined;
  const cliente = pedido ?? clientes[0] ?? null;

  const funis = cliente ? await listarFunis(cliente.id) : [];
  const funilId = lidos.funilId && funis.some((f) => f.id === lidos.funilId) ? lidos.funilId : null;

  return {
    filtros: { ...lidos, clientId: cliente?.id ?? null, funilId },
    clientes,
    cliente,
    funis,
    semAcesso: clientes.length === 0,
  };
}
