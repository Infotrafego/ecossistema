/**
 * Metas e orçamento do mês · leitura e escrita
 *
 * ⚠ SERVER ONLY.
 */

import { createClient } from '@/lib/supabase/server';
import type { EntradaMeta } from '@/lib/orcamento';
import type { Metricas } from '@/lib/intel';
import type { ConfigFunil } from '@/lib/funil';
import { ETAPAS } from '@/lib/funil';
import { valorDaEtapa } from '@/lib/intel';

export interface OrcamentoDoMes {
  tipo: 'pre_pago' | 'pos_pago';
  verbaMensal: number;
  saldoPrepago: number;
  diaCiclo: number;
  /** `false` quando ninguém configurou a verba ainda. */
  configurado: boolean;
}

export async function getOrcamento(
  clientId: string,
  ano: number,
  mes: number,
): Promise<OrcamentoDoMes> {
  const supabase = await createClient();
  const { data } = await supabase
    .from('orcamento_mensal')
    .select('tipo, verba_mensal, saldo_prepago, dia_ciclo')
    .eq('client_id', clientId)
    .eq('ano', ano)
    .eq('mes', mes)
    .maybeSingle();

  if (!data) {
    return { tipo: 'pos_pago', verbaMensal: 0, saldoPrepago: 0, diaCiclo: 1, configurado: false };
  }

  return {
    tipo: data.tipo,
    verbaMensal: Number(data.verba_mensal),
    saldoPrepago: Number(data.saldo_prepago),
    diaCiclo: data.dia_ciclo,
    configurado: true,
  };
}

export async function getMetasDoMes(
  funilId: string | null,
  ano: number,
  mes: number,
): Promise<Record<string, { meta: number; tipo: 'positivo' | 'custo' }>> {
  if (!funilId) return {};
  const supabase = await createClient();
  const { data } = await supabase
    .from('metas_mensais')
    .select('metricas')
    .eq('funil_id', funilId)
    .eq('ano', ano)
    .eq('mes', mes)
    .maybeSingle();

  return data?.metricas ?? {};
}

/**
 * Monta as linhas do painel de metas.
 *
 * As chaves vêm do funil, não de uma lista fixa: o painel de um funil de
 * distribuição mostra seguidores e alcance, o de captação mostra MQL e
 * agendamento. Métrica sem meta configurada não vira card — meta de zero
 * apareceria como 100% atingida e daria uma leitura falsa de sucesso.
 */
export function montarMetas(
  funil: ConfigFunil | null,
  metasConfiguradas: Record<string, { meta: number; tipo: 'positivo' | 'custo' }>,
  total: Metricas,
): EntradaMeta[] {
  const entradas: EntradaMeta[] = [];

  const investimento = metasConfiguradas.spend;
  if (investimento && investimento.meta > 0) {
    entradas.push({
      chave: 'spend',
      label: '💰 Investimento',
      meta: investimento.meta,
      realizado: total.spend,
      tipo: 'custo',
      formato: 'moeda',
    });
  }

  const receita = metasConfiguradas.receita;
  if (receita && receita.meta > 0) {
    entradas.push({
      chave: 'receita',
      label: '🚀 Receita',
      meta: receita.meta,
      realizado: total.receita,
      tipo: 'positivo',
      formato: 'moeda',
    });
  }

  for (const etapa of funil?.etapas ?? []) {
    const config = metasConfiguradas[etapa];
    if (!config || config.meta <= 0) continue;
    entradas.push({
      chave: etapa,
      label: ETAPAS[etapa].label,
      meta: config.meta,
      realizado: valorDaEtapa(total, etapa) ?? 0,
      tipo: config.tipo ?? 'positivo',
      formato: 'numero',
    });
  }

  return entradas;
}

export interface ResultadoSalvarMetas {
  ok: boolean;
  erro?: string;
}

export async function salvarOrcamento(
  clientId: string,
  ano: number,
  mes: number,
  dados: { tipo: 'pre_pago' | 'pos_pago'; verbaMensal: number; saldoPrepago: number; diaCiclo: number },
): Promise<ResultadoSalvarMetas> {
  const supabase = await createClient();
  const { error } = await supabase.from('orcamento_mensal').upsert({
    client_id: clientId,
    ano,
    mes,
    tipo: dados.tipo,
    verba_mensal: dados.verbaMensal,
    saldo_prepago: dados.saldoPrepago,
    dia_ciclo: dados.diaCiclo,
  });
  return error ? { ok: false, erro: error.message } : { ok: true };
}

export async function salvarMetas(
  clientId: string,
  funilId: string,
  ano: number,
  mes: number,
  metricas: Record<string, { meta: number; tipo: 'positivo' | 'custo' }>,
): Promise<ResultadoSalvarMetas> {
  const supabase = await createClient();
  const { error } = await supabase.from('metas_mensais').upsert({
    funil_id: funilId,
    client_id: clientId,
    ano,
    mes,
    metricas,
  });
  return error ? { ok: false, erro: error.message } : { ok: true };
}
