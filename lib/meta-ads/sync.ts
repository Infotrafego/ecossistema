/**
 * Sync diário Meta Ads → Supabase · STUB pra você implementar
 *
 * Como funciona:
 * 1. Roda como Edge Function do Supabase com cron diário (4h da manhã)
 * 2. Para cada cliente ativo:
 *    a. Busca insights da Meta API (últimos 7 dias pra recuperar atrasos)
 *    b. UPSERT na tabela metrics_daily
 *    c. Atualiza cálculo de fadiga dos criativos
 * 3. Log de execução em uma tabela `sync_log`
 *
 * TODO Pablo:
 * - Implementar a função syncClient()
 * - Criar Edge Function em supabase/functions/sync-meta-ads/
 * - Configurar cron via supabase.toml
 * - Adicionar tabela sync_log na migração
 */

import { createServiceClient } from '@/lib/supabase/server';
import type { Database } from '@/types/database';
import { fetchAccountInsights } from './client';

type MetricInsert =
  Database['infotrafego_ecossistema']['Tables']['metrics_daily']['Insert'];

export async function syncClient(clientId: string, adAccountId: string) {
  const supabase = createServiceClient();

  const today = new Date().toISOString().split('T')[0];
  const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)
    .toISOString()
    .split('T')[0];

  // 1. Busca insights da Meta
  const insights = await fetchAccountInsights(adAccountId, sevenDaysAgo, today);

  // 2. Transforma + upserta no metrics_daily
  const rows: MetricInsert[] = insights.map((i) => ({
    client_id: clientId,
    entity_type: 'ad' as const,
    entity_id: i.ad_id || '',
    date: i.date_start,
    impressions: parseInt(i.impressions || '0'),
    clicks: parseInt(i.clicks || '0'),
    spend: parseFloat(i.spend || '0'),
    conversions: i.actions
      ? i.actions
          .filter((a) => a.action_type.includes('purchase') || a.action_type.includes('lead'))
          .reduce((sum, a) => sum + parseInt(a.value), 0)
      : 0,
    revenue: 0, // TODO: calcular se cliente trackeia valor de conversão
    frequency: i.frequency ? parseFloat(i.frequency) : null,
    ctr: i.ctr ? parseFloat(i.ctr) : null,
    cpc: i.cpc ? parseFloat(i.cpc) : null,
    cpm: i.cpm ? parseFloat(i.cpm) : null,
    raw_data: i as unknown as Record<string, unknown>,
    synced_at: new Date().toISOString(),
  }));

  const { error } = await supabase.from('metrics_daily').upsert(rows, {
    onConflict: 'client_id,entity_type,entity_id,date',
  });

  if (error) throw error;

  return { rowsInserted: rows.length };
}

/**
 * Sincroniza todos os clientes ativos
 * Chamado pelo cron da Edge Function
 */
export async function syncAllClients() {
  const supabase = createServiceClient();

  const { data: clients, error } = await supabase
    .from('clients')
    .select('id, meta_ad_account_id')
    .eq('active', true)
    .not('meta_ad_account_id', 'is', null);

  if (error) throw error;

  const results = await Promise.allSettled(
    (clients || []).map((c) =>
      c.meta_ad_account_id ? syncClient(c.id, c.meta_ad_account_id) : null,
    ),
  );

  return results;
}
