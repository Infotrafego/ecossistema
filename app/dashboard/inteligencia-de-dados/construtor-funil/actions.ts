'use server';

/**
 * Server Actions do Construtor de Funil
 *
 * Usa o client com a sessao do usuario (nao o service role): quem decide se ele
 * pode gravar naquele cliente e o RLS, nao este codigo. E o mesmo principio das
 * leituras — a seguranca mora na policy e e la que ela e testada.
 */

import { revalidatePath } from 'next/cache';
import { arquivarFunil, salvarFunil, type ResultadoSalvar } from '@/lib/data/funis';
import type { ConfigFunil } from '@/lib/funil';

export async function salvarFunilAction(config: ConfigFunil): Promise<ResultadoSalvar> {
  const resultado = await salvarFunil(config);

  if (resultado.ok) {
    // Criterio de pronto do briefing: "o Construtor cria a config e a
    // Inteligencia de Dados renderiza imediatamente". Sem invalidar o cache das
    // rotas, o funil novo so apareceria no proximo hard refresh.
    revalidatePath('/dashboard/inteligencia-de-dados', 'layout');
  }

  return resultado;
}

export async function arquivarFunilAction(funilId: string): Promise<ResultadoSalvar> {
  const resultado = await arquivarFunil(funilId);
  if (resultado.ok) revalidatePath('/dashboard/inteligencia-de-dados', 'layout');
  return resultado;
}
