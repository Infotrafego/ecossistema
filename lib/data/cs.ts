/**
 * Central CS · leitura da escuta dos grupos
 *
 * Lê as quatro views `cs_escuta_*` (migration 20260927000000) e entrega a
 * carteira montada por `lib/cs.ts`. As views já filtram pelo acesso do usuário
 * logado — este loader não refiltra (mesma regra de `listarClientes`).
 *
 * ⚠ SERVER ONLY (usa o client Supabase de servidor).
 */

import { createClient } from '@/lib/supabase/server';
import { hojeBrt, montarCarteira, somarDias, JANELA_VOLUME_DIAS, type CarteiraCs } from '@/lib/cs';

export async function getCarteiraCs(agora: Date = new Date()): Promise<CarteiraCs> {
  const supabase = await createClient();
  const hoje = hojeBrt(agora);
  const desde = somarDias(hoje, -(JANELA_VOLUME_DIAS - 1));

  const [clientes, sinais, diaria, pendencias] = await Promise.all([
    supabase
      .from('cs_escuta_clientes')
      .select('client_slug, cliente, grupos, escuta_desde, ultima_mensagem, ultima_mensagem_cliente, ultima_mensagem_time'),
    supabase
      .from('cs_escuta_sinais')
      .select('id, client_slug, cliente, grupo, dia, scanned_at, categoria, sentimento, urgencia, autor_papel, assunto, virou_subtarefa')
      .gte('dia', desde)
      .order('scanned_at', { ascending: false }),
    supabase
      .from('cs_escuta_diaria')
      .select('client_slug, cliente, dia, grupos_com_conversa, sinais, demandas, erros, insatisfacoes, elogios, sentimento_cliente, sentimento_resumo')
      .gte('dia', desde),
    supabase
      .from('cs_escuta_pendencias')
      .select('client_slug, cliente, grupo, dia, atualizado_em, lado, ordem, item'),
  ]);

  for (const [nome, r] of [
    ['cs_escuta_clientes', clientes],
    ['cs_escuta_sinais', sinais],
    ['cs_escuta_diaria', diaria],
    ['cs_escuta_pendencias', pendencias],
  ] as const) {
    if (r.error) throw new Error(`${nome}: ${r.error.message}`);
  }

  return montarCarteira(
    {
      clientes: clientes.data ?? [],
      sinais: sinais.data ?? [],
      diaria: diaria.data ?? [],
      pendencias: pendencias.data ?? [],
    },
    hoje,
  );
}
