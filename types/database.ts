/**
 * Tipos do banco de dados Supabase · schema `infotrafego_ecossistema`
 *
 * Pra regenerar a partir do banco (depois de expor o schema na API):
 *   npx supabase gen types typescript --project-id jcserimdehwyxghdgmgj \
 *     --schema infotrafego_ecossistema > types/database.ts
 *
 * Mantido à mão enquanto o schema está estável. O app conecta neste schema via
 * `db: { schema: 'infotrafego_ecossistema' }` nos clients (lib/supabase/*).
 *
 * IMPORTANTE: os `Row` ficam em `Rows` (standalone) e `Insert`/`Update` derivam
 * deles — sem referência circular a `Database` (que o supabase-js >2.1 resolve
 * como `never`, quebrando `.insert()/.upsert()`).
 *
 * A taxonomia do funil (`familia`, `sub_objetivo`, `modo_captura`, `etapas`)
 * vem de `lib/funil.ts`, que é a fonte única — os CHECKs da migration
 * 20260918000000_taxonomia_funil.sql amarram o banco aos mesmos valores.
 */

import type { EtapaId, Familia, ModoCaptura, SubObjetivo } from '@/lib/funil';
import type { Condicao } from '@/lib/regras';

export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

// ── Linhas (fonte única, sem circularidade) ─────────────────────
type Rows = {
  users: {
    id: string;
    email: string;
    name: string;
    global_role:
      | 'admin'
      | 'gestor_dados'
      | 'gestor_comercial'
      | 'closer'
      | 'sdr'
      | 'cs'
      | 'analista'
      | 'criativo'
      | 'cliente';
    avatar_url: string | null;
    created_at: string;
    updated_at: string;
  };
  clients: {
    id: string;
    name: string;
    slug: string;
    brand_color: string;
    meta_ad_account_id: string | null;
    looker_url: string | null;
    active: boolean;
    created_at: string;
    updated_at: string;
  };
  client_members: {
    client_id: string;
    user_id: string;
    role: 'gestor' | 'closer' | 'sdr' | 'cs' | 'analista' | 'cliente';
    created_at: string;
  };
  funis: {
    id: string;
    client_id: string;
    name: string;
    familia: Familia;
    sub_objetivo: SubObjetivo;
    modo_captura: ModoCaptura;
    etapas: EtapaId[];
    marcador_mkt: EtapaId | null;
    marcador_com: EtapaId | null;
    metas: Partial<Record<EtapaId, number>>;
    active: boolean;
    created_at: string;
    updated_at: string;
  };
  campaigns: {
    id: string;
    client_id: string;
    funil_id: string | null;
    meta_id: string;
    name: string;
    objective: string | null;
    status: string;
    daily_budget: number | null;
    created_at: string;
    updated_at: string;
  };
  adsets: {
    id: string;
    client_id: string;
    campaign_id: string;
    meta_id: string;
    name: string;
    targeting: Record<string, unknown> | null;
    optimization_goal: string | null;
    status: string;
    daily_budget: number | null;
    created_at: string;
    updated_at: string;
  };
  creatives: {
    id: string;
    client_id: string;
    meta_id: string;
    type: 'image' | 'video' | 'carousel';
    hash: string | null;
    thumbnail_url: string | null;
    ig_link: string | null;
    copy: string | null;
    created_at: string;
  };
  ads: {
    id: string;
    client_id: string;
    adset_id: string;
    creative_id: string | null;
    meta_id: string;
    name: string;
    status: string;
    created_at: string;
    updated_at: string;
  };
  metrics_daily: {
    client_id: string;
    entity_type: 'campaign' | 'adset' | 'ad' | 'creative';
    entity_id: string;
    date: string;
    impressions: number;
    clicks: number;
    spend: number;
    conversions: number;
    revenue: number;
    frequency: number | null;
    ctr: number | null;
    cpc: number | null;
    cpm: number | null;
    /** Mapa EtapaId → valor do dia. Preenchido pelo sync (lib/meta-ads/actions.ts). */
    stage_values: Partial<Record<EtapaId, number>>;
    raw_data: Record<string, unknown> | null;
    synced_at: string;
  };
  fadiga_creative: {
    creative_id: string;
    client_id: string;
    score: number;
    status: 'saudavel' | 'atencao' | 'critico';
    days_active: number;
    last_refresh: string | null;
    calculated_at: string;
  };
  sync_log: {
    id: string;
    client_id: string | null;
    source: string;
    status: 'running' | 'success' | 'partial' | 'error';
    date_start: string | null;
    date_stop: string | null;
    entities_synced: number;
    rows_upserted: number;
    api_calls: number;
    duration_ms: number | null;
    error_message: string | null;
    details: Record<string, unknown> | null;
    started_at: string;
    finished_at: string | null;
  };
  orcamento_mensal: {
    client_id: string;
    ano: number;
    mes: number;
    tipo: 'pre_pago' | 'pos_pago';
    verba_mensal: number;
    saldo_prepago: number;
    dia_ciclo: number;
    created_at: string;
    updated_at: string;
  };
  metas_mensais: {
    funil_id: string;
    client_id: string;
    ano: number;
    mes: number;
    metricas: Record<string, { meta: number; tipo: 'positivo' | 'custo' }>;
    created_at: string;
    updated_at: string;
  };
  audit_log: {
    id: string;
    client_id: string;
    user_id: string | null;
    origem: 'ui' | 'assistente_ia' | 'regra_auto';
    acao: string;
    entity_type: 'campaign' | 'adset' | 'ad' | 'creative' | 'audience';
    entity_meta_id: string | null;
    entity_nome: string | null;
    params: Record<string, unknown>;
    status: 'pendente' | 'sucesso' | 'erro' | 'revertido' | 'reversao_falhou';
    erro: string | null;
    resposta_meta: Record<string, unknown> | null;
    estado_anterior: Record<string, unknown> | null;
    revertido_em: string | null;
    ad_account_id: string | null;
    sandbox: boolean;
    created_at: string;
    finished_at: string | null;
  };
  ia_cache: {
    cache_key: string;
    client_id: string | null;
    finalidade: string;
    model: string;
    resposta: string;
    input_tokens: number;
    output_tokens: number;
    hits: number;
    created_at: string;
    expires_at: string;
  };
  regras_auto: {
    id: string;
    client_id: string;
    nome: string;
    escopo: 'campaign' | 'adset' | 'ad';
    condicoes: Condicao[];
    operador_logico: 'e' | 'ou';
    janela_dias: number;
    acao: 'pausar' | 'aumentar_orcamento' | 'reduzir_orcamento' | 'notificar';
    acao_params: Record<string, unknown>;
    gasto_minimo: number;
    ativa: boolean;
    dry_run: boolean;
    created_by: string | null;
    created_at: string;
    updated_at: string;
  };
  regra_execucoes: {
    id: string;
    regra_id: string;
    client_id: string;
    status: 'sucesso' | 'parcial' | 'erro' | 'sem_alvos';
    dry_run: boolean;
    alvos_avaliados: number;
    alvos_casados: number;
    acoes_aplicadas: number;
    detalhes: Array<Record<string, unknown>>;
    erro: string | null;
    executed_at: string;
  };
  copy_sugestoes: {
    id: string;
    client_id: string;
    funil_id: string | null;
    briefing: Record<string, unknown>;
    variacoes: Array<Record<string, unknown>>;
    modelo: string;
    do_cache: boolean;
    created_by: string | null;
    created_at: string;
  };
  assistente_mensagens: {
    id: string;
    client_id: string;
    user_id: string;
    thread_id: string;
    role: 'user' | 'assistant';
    conteudo: string;
    tool_calls: Array<Record<string, unknown>> | null;
    audit_log_id: string | null;
    created_at: string;
  };
};

/** Tabelas cuja PK é gerada pelo banco — o Insert torna `id` opcional. */
type ComIdGerado =
  | 'clients' | 'funis' | 'campaigns' | 'adsets' | 'creatives' | 'ads'
  | 'sync_log' | 'audit_log' | 'regras_auto' | 'regra_execucoes'
  | 'copy_sugestoes' | 'assistente_mensagens';

/**
 * Colunas com DEFAULT no banco — opcionais no Insert.
 *
 * Lista por NOME, não por tabela: os nomes abaixo têm default em todas as
 * tabelas onde aparecem, então não há risco de afrouxar uma coluna obrigatória
 * de outra tabela. Coluna nova com DEFAULT precisa entrar aqui, senão o
 * TypeScript exige um valor que o banco já sabe preencher.
 */
type ComDefault =
  // timestamps
  | 'created_at' | 'updated_at' | 'synced_at' | 'calculated_at' | 'started_at' | 'executed_at'
  // flags e enums com default
  | 'active' | 'status' | 'role' | 'global_role' | 'brand_color' | 'origem' | 'sandbox'
  | 'ativa' | 'dry_run' | 'do_cache' | 'source' | 'tipo' | 'operador_logico'
  // contadores com default 0
  | 'impressions' | 'clicks' | 'spend' | 'conversions' | 'revenue' | 'score' | 'days_active'
  | 'entities_synced' | 'rows_upserted' | 'api_calls' | 'input_tokens' | 'output_tokens' | 'hits'
  | 'alvos_avaliados' | 'alvos_casados' | 'acoes_aplicadas'
  | 'verba_mensal' | 'saldo_prepago' | 'dia_ciclo' | 'janela_dias' | 'gasto_minimo'
  // jsonb com default
  | 'etapas' | 'metas' | 'metricas' | 'params' | 'condicoes' | 'acao_params' | 'detalhes'
  | 'briefing' | 'variacoes' | 'stage_values';

/**
 * Coluna nullable também é opcional no Insert: o banco grava NULL sozinho.
 * É o que evita ter de passar `funil_id: null` em todo upsert de campanha.
 */
type ChavesNullable<T> = { [K in keyof T]-?: null extends T[K] ? K : never }[keyof T];

type Opcionais<T extends keyof Rows> =
  | ChavesNullable<Rows[T]>
  | Extract<keyof Rows[T], ComDefault>
  | (T extends ComIdGerado ? Extract<keyof Rows[T], 'id'> : never);

type Insertable<T extends keyof Rows> = Omit<Rows[T], Opcionais<T>> &
  Partial<Pick<Rows[T], Opcionais<T> & keyof Rows[T]>>;

type Tabela<T extends keyof Rows> = {
  Row: Rows[T];
  Insert: Insertable<T>;
  Update: Partial<Rows[T]>;
  Relationships: [];
};

export type Database = {
  __InternalSupabase: {
    PostgrestVersion: '14.1';
  };
  infotrafego_ecossistema: {
    Tables: {
      users: Tabela<'users'>;
      clients: Tabela<'clients'>;
      client_members: Tabela<'client_members'>;
      funis: Tabela<'funis'>;
      campaigns: Tabela<'campaigns'>;
      adsets: Tabela<'adsets'>;
      creatives: Tabela<'creatives'>;
      ads: Tabela<'ads'>;
      metrics_daily: Tabela<'metrics_daily'>;
      fadiga_creative: Tabela<'fadiga_creative'>;
      sync_log: Tabela<'sync_log'>;
      orcamento_mensal: Tabela<'orcamento_mensal'>;
      metas_mensais: Tabela<'metas_mensais'>;
      audit_log: Tabela<'audit_log'>;
      ia_cache: Tabela<'ia_cache'>;
      regras_auto: Tabela<'regras_auto'>;
      regra_execucoes: Tabela<'regra_execucoes'>;
      copy_sugestoes: Tabela<'copy_sugestoes'>;
      assistente_mensagens: Tabela<'assistente_mensagens'>;
    };
    Views: { [_ in never]: never };
    Functions: { [_ in never]: never };
    Enums: { [_ in never]: never };
    CompositeTypes: { [_ in never]: never };
  };
};

// Nome do schema usado em todos os clients Supabase
export const DB_SCHEMA = 'infotrafego_ecossistema' as const;

// Helpers (linhas)
export type User = Rows['users'];
export type Client = Rows['clients'];
export type Funil = Rows['funis'];
export type Campaign = Rows['campaigns'];
export type AdSet = Rows['adsets'];
export type Creative = Rows['creatives'];
export type Ad = Rows['ads'];
export type MetricsDaily = Rows['metrics_daily'];
export type FadigaCreative = Rows['fadiga_creative'];
export type SyncLog = Rows['sync_log'];
export type OrcamentoMensal = Rows['orcamento_mensal'];
export type MetasMensais = Rows['metas_mensais'];
export type AuditLog = Rows['audit_log'];
export type RegraAuto = Rows['regras_auto'];
export type RegraExecucao = Rows['regra_execucoes'];
export type CopySugestao = Rows['copy_sugestoes'];
export type AssistenteMensagem = Rows['assistente_mensagens'];

// Helpers (inserts) — usados pelo sync e pelas Server Actions
export type MetricsDailyInsert = Insertable<'metrics_daily'>;
export type CampaignInsert = Insertable<'campaigns'>;
export type AdSetInsert = Insertable<'adsets'>;
export type AdInsert = Insertable<'ads'>;
export type CreativeInsert = Insertable<'creatives'>;
export type FunilInsert = Insertable<'funis'>;
export type AuditLogInsert = Insertable<'audit_log'>;
export type SyncLogInsert = Insertable<'sync_log'>;
