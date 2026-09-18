/**
 * Leitura do histórico de sync
 *
 * Existe por causa de um critério de pronto específico da fase: "sync Meta
 * rodando diariamente sem falhas por 7 dias seguidos". Isso não é uma
 * afirmação que se faz de memória — precisa de uma tela que mostre a série.
 *
 * ⚠ SERVER ONLY.
 */

import { createClient } from '@/lib/supabase/server';
import type { SyncLog } from '@/types/database';

export interface ResumoSync {
  ultimo: SyncLog | null;
  execucoes: SyncLog[];
  /** Dias seguidos, até hoje, com pelo menos um sync bem-sucedido. */
  diasConsecutivosOk: number;
  houveSync: boolean;
}

export async function getResumoSync(clientId: string, limite = 30): Promise<ResumoSync> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from('sync_log')
    .select('*')
    .eq('client_id', clientId)
    .order('started_at', { ascending: false })
    .limit(limite);

  if (error) throw new Error(`sync_log: ${error.message}`);

  const execucoes = (data ?? []) as SyncLog[];
  return {
    ultimo: execucoes[0] ?? null,
    execucoes,
    diasConsecutivosOk: contarDiasConsecutivos(execucoes),
    houveSync: execucoes.some((e) => e.status === 'success' || e.status === 'partial'),
  };
}

/**
 * Conta a sequência de dias com sync bem-sucedido, terminando em hoje ou ontem.
 *
 * Aceitar que a sequência termine ONTEM é proposital: o cron roda de
 * madrugada, então entre 00h e a execução do dia a contagem legítima ainda
 * aponta pra ontem — zerar aí faria o painel piscar "0 dias" todo dia de manhã.
 */
export function contarDiasConsecutivos(execucoes: SyncLog[], hoje = new Date()): number {
  const diasOk = new Set(
    execucoes
      .filter((e) => e.status === 'success')
      .map((e) => e.started_at.slice(0, 10)),
  );
  if (diasOk.size === 0) return 0;

  const base = new Date(Date.UTC(hoje.getUTCFullYear(), hoje.getUTCMonth(), hoje.getUTCDate()));
  const iso = (d: Date) => d.toISOString().slice(0, 10);
  const DIA = 86_400_000;

  let inicio = base;
  if (!diasOk.has(iso(base))) {
    const ontem = new Date(base.getTime() - DIA);
    if (!diasOk.has(iso(ontem))) return 0;
    inicio = ontem;
  }

  let contagem = 0;
  for (let cursor = inicio; diasOk.has(iso(cursor)); cursor = new Date(cursor.getTime() - DIA)) {
    contagem++;
  }
  return contagem;
}
