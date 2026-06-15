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
 */

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
    familia: 'distribuicao' | 'captacao' | 'venda_direta' | 'lancamento';
    sub_objetivo: string;
    modo_captura: 'form_meta' | 'landing' | 'whatsapp' | 'quiz' | 'webinario';
    etapas: string[];
    marcador_mkt: string | null;
    marcador_com: string | null;
    metas: Record<string, unknown>;
    active: boolean;
    created_at: string;
    updated_at: string;
  };
  campaigns: {
    id: string;
    client_id: string;
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
};

export type Database = {
  __InternalSupabase: {
    PostgrestVersion: '14.1';
  };
  infotrafego_ecossistema: {
    Tables: {
      users: {
        Row: Rows['users'];
        Insert: Omit<Rows['users'], 'created_at' | 'updated_at'> & {
          created_at?: string;
          updated_at?: string;
        };
        Update: Partial<Rows['users']>;
        Relationships: [];
      };
      clients: {
        Row: Rows['clients'];
        Insert: Omit<Rows['clients'], 'id' | 'created_at' | 'updated_at'> & {
          id?: string;
          created_at?: string;
          updated_at?: string;
        };
        Update: Partial<Rows['clients']>;
        Relationships: [];
      };
      client_members: {
        Row: Rows['client_members'];
        Insert: Omit<Rows['client_members'], 'created_at'> & { created_at?: string };
        Update: Partial<Rows['client_members']>;
        Relationships: [];
      };
      funis: {
        Row: Rows['funis'];
        Insert: Omit<Rows['funis'], 'id' | 'created_at' | 'updated_at'> & {
          id?: string;
          created_at?: string;
          updated_at?: string;
        };
        Update: Partial<Rows['funis']>;
        Relationships: [];
      };
      campaigns: {
        Row: Rows['campaigns'];
        Insert: Omit<Rows['campaigns'], 'id' | 'created_at' | 'updated_at'> & {
          id?: string;
          created_at?: string;
          updated_at?: string;
        };
        Update: Partial<Rows['campaigns']>;
        Relationships: [];
      };
      adsets: {
        Row: Rows['adsets'];
        Insert: Omit<Rows['adsets'], 'id' | 'created_at' | 'updated_at'> & {
          id?: string;
          created_at?: string;
          updated_at?: string;
        };
        Update: Partial<Rows['adsets']>;
        Relationships: [];
      };
      creatives: {
        Row: Rows['creatives'];
        Insert: Omit<Rows['creatives'], 'id' | 'created_at'> & {
          id?: string;
          created_at?: string;
        };
        Update: Partial<Rows['creatives']>;
        Relationships: [];
      };
      ads: {
        Row: Rows['ads'];
        Insert: Omit<Rows['ads'], 'id' | 'created_at' | 'updated_at'> & {
          id?: string;
          created_at?: string;
          updated_at?: string;
        };
        Update: Partial<Rows['ads']>;
        Relationships: [];
      };
      metrics_daily: {
        Row: Rows['metrics_daily'];
        Insert: Omit<Rows['metrics_daily'], 'synced_at'> & { synced_at?: string };
        Update: Partial<Rows['metrics_daily']>;
        Relationships: [];
      };
      fadiga_creative: {
        Row: Rows['fadiga_creative'];
        Insert: Omit<Rows['fadiga_creative'], 'calculated_at'> & {
          calculated_at?: string;
        };
        Update: Partial<Rows['fadiga_creative']>;
        Relationships: [];
      };
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
