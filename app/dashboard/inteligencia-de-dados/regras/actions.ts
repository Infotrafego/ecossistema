'use server';

/**
 * Server Actions do Otimizador (regras automaticas)
 *
 * Escrita das regras via client do usuario (RLS decide). A EXECUCAO usa service
 * role, mas so depois de conferir, com a sessao do usuario, que ele enxerga
 * aquele cliente — mesmo padrao da rota de acoes.
 */

import { revalidatePath } from 'next/cache';
import { createClient } from '@/lib/supabase/server';
import { createServiceClient } from '@/lib/supabase/service';
import { executarRegra, type ResultadoExecucao } from '@/lib/data/regras';
import type { Condicao } from '@/lib/regras';
import type { RegraAuto } from '@/types/database';

const ROTA = '/dashboard/inteligencia-de-dados/regras';

export interface EntradaRegra {
  id?: string;
  clientId: string;
  nome: string;
  escopo: 'campaign' | 'adset' | 'ad';
  condicoes: Condicao[];
  operadorLogico: 'e' | 'ou';
  janelaDias: number;
  gastoMinimo: number;
  acao: 'pausar' | 'aumentar_orcamento' | 'reduzir_orcamento' | 'notificar';
  acaoParams: Record<string, unknown>;
  ativa: boolean;
  dryRun: boolean;
}

export async function salvarRegraAction(
  entrada: EntradaRegra,
): Promise<{ ok: boolean; erro?: string }> {
  if (!entrada.nome.trim()) return { ok: false, erro: 'Dê um nome à regra.' };
  if (entrada.condicoes.length === 0) return { ok: false, erro: 'A regra precisa de ao menos uma condição.' };

  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  const linha = {
    client_id: entrada.clientId,
    nome: entrada.nome.trim(),
    escopo: entrada.escopo,
    condicoes: entrada.condicoes,
    operador_logico: entrada.operadorLogico,
    janela_dias: entrada.janelaDias,
    gasto_minimo: entrada.gastoMinimo,
    acao: entrada.acao,
    acao_params: entrada.acaoParams,
    ativa: entrada.ativa,
    dry_run: entrada.dryRun,
    created_by: user?.id ?? null,
  };

  const { error } = entrada.id
    ? await supabase.from('regras_auto').update(linha).eq('id', entrada.id)
    : await supabase.from('regras_auto').insert(linha);

  if (error) return { ok: false, erro: error.message };
  revalidatePath(ROTA);
  return { ok: true };
}

export async function alternarRegraAction(
  id: string,
  campo: 'ativa' | 'dry_run',
  valor: boolean,
): Promise<{ ok: boolean; erro?: string }> {
  const supabase = await createClient();
  // Chave computada vira `{[x: string]: never}` nos tipos do supabase-js; o
  // update explicito por campo mantem a checagem de tipo de verdade.
  const patch = campo === 'ativa' ? { ativa: valor } : { dry_run: valor };
  const { error } = await supabase.from('regras_auto').update(patch).eq('id', id);
  if (error) return { ok: false, erro: error.message };
  revalidatePath(ROTA);
  return { ok: true };
}

export async function apagarRegraAction(id: string): Promise<{ ok: boolean; erro?: string }> {
  const supabase = await createClient();
  const { error } = await supabase.from('regras_auto').delete().eq('id', id);
  if (error) return { ok: false, erro: error.message };
  revalidatePath(ROTA);
  return { ok: true };
}

export async function executarRegraAction(
  id: string,
): Promise<{ ok: boolean; erro?: string; resultado?: ResultadoExecucao }> {
  const supabase = await createClient();

  // Le com a sessao do usuario: se o RLS nao devolver a regra, ele nao tem
  // acesso ao cliente dela — e a execucao para antes do service role entrar.
  const { data: regra } = await supabase.from('regras_auto').select('*').eq('id', id).maybeSingle();
  if (!regra) return { ok: false, erro: 'Regra não encontrada ou sem acesso.' };

  const resultado = await executarRegra(regra as RegraAuto, createServiceClient());
  revalidatePath(ROTA);
  return { ok: resultado.status !== 'erro', erro: resultado.erro, resultado };
}
