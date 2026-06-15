-- ═══════════════════════════════════════════════════════════════
-- Migração inicial · Ecossistema Infotráfego · Fase 2 · Inteligência de Dados
-- ═══════════════════════════════════════════════════════════════
-- Schema dedicado `infotrafego_ecossistema` (o `public` do projeto Infotráfego
-- já é usado por outros sistemas: captacao, carv_group, meta_ads accounts).
-- Cria todas as tabelas core: multi-tenancy + funis + dados de mídia.
-- Author: Pablo + Claude · 2026-06-02

-- ─────────────────────────────────────────────
-- 0. Schema + grants
-- ─────────────────────────────────────────────

CREATE SCHEMA IF NOT EXISTS infotrafego_ecossistema;

GRANT USAGE ON SCHEMA infotrafego_ecossistema TO anon, authenticated, service_role;

-- Privilégios padrão pra objetos criados neste schema (PostgREST acessa via
-- roles anon/authenticated; RLS faz o isolamento real linha a linha)
ALTER DEFAULT PRIVILEGES IN SCHEMA infotrafego_ecossistema
  GRANT ALL ON TABLES TO anon, authenticated, service_role;
ALTER DEFAULT PRIVILEGES IN SCHEMA infotrafego_ecossistema
  GRANT ALL ON SEQUENCES TO anon, authenticated, service_role;
ALTER DEFAULT PRIVILEGES IN SCHEMA infotrafego_ecossistema
  GRANT EXECUTE ON FUNCTIONS TO anon, authenticated, service_role;

-- ─────────────────────────────────────────────
-- 1. Multi-tenancy
-- ─────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS infotrafego_ecossistema.users (
  id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email text UNIQUE NOT NULL,
  name text NOT NULL,
  global_role text NOT NULL DEFAULT 'analista'
    CHECK (global_role IN ('admin', 'gestor_dados', 'gestor_comercial', 'closer', 'sdr', 'cs', 'analista', 'criativo', 'cliente')),
  avatar_url text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS infotrafego_ecossistema.clients (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  slug text UNIQUE NOT NULL,
  brand_color text NOT NULL DEFAULT '#1A3D70',
  meta_ad_account_id text,
  looker_url text,
  active boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS infotrafego_ecossistema.client_members (
  client_id uuid NOT NULL REFERENCES infotrafego_ecossistema.clients(id) ON DELETE CASCADE,
  user_id uuid NOT NULL REFERENCES infotrafego_ecossistema.users(id) ON DELETE CASCADE,
  role text NOT NULL DEFAULT 'analista'
    CHECK (role IN ('gestor', 'closer', 'sdr', 'cs', 'analista', 'cliente')),
  created_at timestamptz NOT NULL DEFAULT now(),
  PRIMARY KEY (client_id, user_id)
);

-- ─────────────────────────────────────────────
-- 2. Funis configuráveis (Construtor)
-- ─────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS infotrafego_ecossistema.funis (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  client_id uuid NOT NULL REFERENCES infotrafego_ecossistema.clients(id) ON DELETE CASCADE,
  name text NOT NULL,
  familia text NOT NULL CHECK (familia IN ('distribuicao', 'captacao', 'venda_direta', 'lancamento')),
  sub_objetivo text NOT NULL,
  modo_captura text NOT NULL CHECK (modo_captura IN ('form_meta', 'landing', 'whatsapp', 'quiz', 'webinario')),
  etapas jsonb NOT NULL DEFAULT '[]'::jsonb,
  marcador_mkt text,
  marcador_com text,
  metas jsonb NOT NULL DEFAULT '{}'::jsonb,
  active boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_funis_client_active ON infotrafego_ecossistema.funis(client_id, active);

-- ─────────────────────────────────────────────
-- 3. Dados de mídia (Meta Ads)
-- ─────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS infotrafego_ecossistema.campaigns (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  client_id uuid NOT NULL REFERENCES infotrafego_ecossistema.clients(id) ON DELETE CASCADE,
  meta_id text NOT NULL,
  name text NOT NULL,
  objective text,
  status text NOT NULL DEFAULT 'PAUSED',
  daily_budget numeric(10,2),
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (client_id, meta_id)
);

CREATE TABLE IF NOT EXISTS infotrafego_ecossistema.adsets (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  client_id uuid NOT NULL REFERENCES infotrafego_ecossistema.clients(id) ON DELETE CASCADE,
  campaign_id uuid NOT NULL REFERENCES infotrafego_ecossistema.campaigns(id) ON DELETE CASCADE,
  meta_id text NOT NULL,
  name text NOT NULL,
  targeting jsonb,
  optimization_goal text,
  status text NOT NULL DEFAULT 'PAUSED',
  daily_budget numeric(10,2),
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (client_id, meta_id)
);

CREATE TABLE IF NOT EXISTS infotrafego_ecossistema.creatives (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  client_id uuid NOT NULL REFERENCES infotrafego_ecossistema.clients(id) ON DELETE CASCADE,
  meta_id text NOT NULL,
  type text NOT NULL CHECK (type IN ('image', 'video', 'carousel')),
  hash text,
  thumbnail_url text,
  ig_link text,
  copy text,
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (client_id, meta_id)
);

CREATE TABLE IF NOT EXISTS infotrafego_ecossistema.ads (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  client_id uuid NOT NULL REFERENCES infotrafego_ecossistema.clients(id) ON DELETE CASCADE,
  adset_id uuid NOT NULL REFERENCES infotrafego_ecossistema.adsets(id) ON DELETE CASCADE,
  creative_id uuid REFERENCES infotrafego_ecossistema.creatives(id) ON DELETE SET NULL,
  meta_id text NOT NULL,
  name text NOT NULL,
  status text NOT NULL DEFAULT 'PAUSED',
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (client_id, meta_id)
);

-- ─────────────────────────────────────────────
-- 4. Métricas diárias (snapshot da API Meta)
-- ─────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS infotrafego_ecossistema.metrics_daily (
  client_id uuid NOT NULL REFERENCES infotrafego_ecossistema.clients(id) ON DELETE CASCADE,
  entity_type text NOT NULL CHECK (entity_type IN ('campaign', 'adset', 'ad', 'creative')),
  entity_id text NOT NULL,
  date date NOT NULL,
  impressions bigint NOT NULL DEFAULT 0,
  clicks bigint NOT NULL DEFAULT 0,
  spend numeric(12,2) NOT NULL DEFAULT 0,
  conversions bigint NOT NULL DEFAULT 0,
  revenue numeric(12,2) NOT NULL DEFAULT 0,
  frequency numeric(6,3),
  ctr numeric(6,4),
  cpc numeric(8,4),
  cpm numeric(8,2),
  raw_data jsonb,
  synced_at timestamptz NOT NULL DEFAULT now(),
  PRIMARY KEY (client_id, entity_type, entity_id, date)
);

CREATE INDEX IF NOT EXISTS idx_metrics_daily_date ON infotrafego_ecossistema.metrics_daily(date DESC);
CREATE INDEX IF NOT EXISTS idx_metrics_daily_client_date ON infotrafego_ecossistema.metrics_daily(client_id, date DESC);

-- ─────────────────────────────────────────────
-- 5. Fadiga criativa (calculado)
-- ─────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS infotrafego_ecossistema.fadiga_creative (
  creative_id uuid PRIMARY KEY REFERENCES infotrafego_ecossistema.creatives(id) ON DELETE CASCADE,
  client_id uuid NOT NULL REFERENCES infotrafego_ecossistema.clients(id) ON DELETE CASCADE,
  score int NOT NULL DEFAULT 0,
  status text NOT NULL DEFAULT 'saudavel' CHECK (status IN ('saudavel', 'atencao', 'critico')),
  days_active int NOT NULL DEFAULT 0,
  last_refresh date,
  calculated_at timestamptz NOT NULL DEFAULT now()
);

-- ─────────────────────────────────────────────
-- 6. Triggers de updated_at
-- ─────────────────────────────────────────────

CREATE OR REPLACE FUNCTION infotrafego_ecossistema.set_updated_at()
RETURNS trigger
LANGUAGE plpgsql
SET search_path = ''
AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

CREATE TRIGGER set_updated_at_users
  BEFORE UPDATE ON infotrafego_ecossistema.users
  FOR EACH ROW EXECUTE FUNCTION infotrafego_ecossistema.set_updated_at();

CREATE TRIGGER set_updated_at_clients
  BEFORE UPDATE ON infotrafego_ecossistema.clients
  FOR EACH ROW EXECUTE FUNCTION infotrafego_ecossistema.set_updated_at();

CREATE TRIGGER set_updated_at_funis
  BEFORE UPDATE ON infotrafego_ecossistema.funis
  FOR EACH ROW EXECUTE FUNCTION infotrafego_ecossistema.set_updated_at();

CREATE TRIGGER set_updated_at_campaigns
  BEFORE UPDATE ON infotrafego_ecossistema.campaigns
  FOR EACH ROW EXECUTE FUNCTION infotrafego_ecossistema.set_updated_at();

CREATE TRIGGER set_updated_at_adsets
  BEFORE UPDATE ON infotrafego_ecossistema.adsets
  FOR EACH ROW EXECUTE FUNCTION infotrafego_ecossistema.set_updated_at();

CREATE TRIGGER set_updated_at_ads
  BEFORE UPDATE ON infotrafego_ecossistema.ads
  FOR EACH ROW EXECUTE FUNCTION infotrafego_ecossistema.set_updated_at();

-- ─────────────────────────────────────────────
-- 7. Função auxiliar: usuário tem acesso ao cliente?
-- ─────────────────────────────────────────────

CREATE OR REPLACE FUNCTION infotrafego_ecossistema.user_has_client_access(p_client_id uuid)
RETURNS boolean
LANGUAGE sql
SECURITY DEFINER
STABLE
SET search_path = ''
AS $$
  SELECT EXISTS (
    -- Admin global vê tudo
    SELECT 1 FROM infotrafego_ecossistema.users
    WHERE id = auth.uid() AND global_role = 'admin'
  ) OR EXISTS (
    -- Senão · só clientes onde ele é membro
    SELECT 1 FROM infotrafego_ecossistema.client_members
    WHERE user_id = auth.uid() AND client_id = p_client_id
  );
$$;

COMMENT ON FUNCTION infotrafego_ecossistema.user_has_client_access IS
  'Retorna true se o usuário autenticado tem acesso aos dados do cliente · usado nas RLS policies';

-- ─────────────────────────────────────────────
-- 8. Sync automático auth.users → infotrafego_ecossistema.users
-- ─────────────────────────────────────────────
-- Quando um usuário é criado no Supabase Auth, cria automaticamente o perfil
-- na tabela de aplicação (evita passo manual). Role default = 'analista';
-- promover pra 'admin' manualmente quando necessário.

CREATE OR REPLACE FUNCTION infotrafego_ecossistema.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
BEGIN
  INSERT INTO infotrafego_ecossistema.users (id, email, name)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'name', split_part(NEW.email, '@', 1))
  )
  ON CONFLICT (id) DO NOTHING;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS on_auth_user_created_infotrafego ON auth.users;
CREATE TRIGGER on_auth_user_created_infotrafego
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION infotrafego_ecossistema.handle_new_user();
