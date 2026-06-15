-- ═══════════════════════════════════════════════════════════════
-- RLS Policies · Multi-tenancy nativo · Fase 2
-- ═══════════════════════════════════════════════════════════════
-- Schema: infotrafego_ecossistema
-- Cada usuário só vê os dados dos clientes onde é membro · Admin global vê tudo.
-- ATENÇÃO: testar com 2+ users e 2+ clientes antes de subir pra prod.

-- ─────────────────────────────────────────────
-- Habilita RLS em todas as tabelas
-- ─────────────────────────────────────────────

ALTER TABLE infotrafego_ecossistema.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE infotrafego_ecossistema.clients ENABLE ROW LEVEL SECURITY;
ALTER TABLE infotrafego_ecossistema.client_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE infotrafego_ecossistema.funis ENABLE ROW LEVEL SECURITY;
ALTER TABLE infotrafego_ecossistema.campaigns ENABLE ROW LEVEL SECURITY;
ALTER TABLE infotrafego_ecossistema.adsets ENABLE ROW LEVEL SECURITY;
ALTER TABLE infotrafego_ecossistema.ads ENABLE ROW LEVEL SECURITY;
ALTER TABLE infotrafego_ecossistema.creatives ENABLE ROW LEVEL SECURITY;
ALTER TABLE infotrafego_ecossistema.metrics_daily ENABLE ROW LEVEL SECURITY;
ALTER TABLE infotrafego_ecossistema.fadiga_creative ENABLE ROW LEVEL SECURITY;

-- ─────────────────────────────────────────────
-- Helper: usuário autenticado é admin global?
-- ─────────────────────────────────────────────
-- SECURITY DEFINER → ignora RLS. ESSENCIAL: checar admin com SELECT direto na
-- tabela users de dentro de uma policy da própria users causa recursão infinita
-- (42P17). Esta função quebra o ciclo.

CREATE OR REPLACE FUNCTION infotrafego_ecossistema.is_admin()
RETURNS boolean
LANGUAGE sql SECURITY DEFINER STABLE SET search_path = '' AS $$
  SELECT EXISTS (
    SELECT 1 FROM infotrafego_ecossistema.users
    WHERE id = auth.uid() AND global_role = 'admin'
  );
$$;

-- ─────────────────────────────────────────────
-- users · cada usuário vê o próprio · admin vê tudo
-- ─────────────────────────────────────────────

CREATE POLICY "Users see own profile" ON infotrafego_ecossistema.users
  FOR SELECT USING (id = auth.uid());

CREATE POLICY "Admin sees all users" ON infotrafego_ecossistema.users
  FOR SELECT USING (infotrafego_ecossistema.is_admin());

CREATE POLICY "Users update own profile" ON infotrafego_ecossistema.users
  FOR UPDATE USING (id = auth.uid());

-- ─────────────────────────────────────────────
-- clients · vê só os clientes onde é membro · admin vê todos
-- ─────────────────────────────────────────────

CREATE POLICY "Members see their clients" ON infotrafego_ecossistema.clients
  FOR SELECT USING (infotrafego_ecossistema.user_has_client_access(id));

CREATE POLICY "Admin manages clients" ON infotrafego_ecossistema.clients
  FOR ALL USING (infotrafego_ecossistema.is_admin());

-- ─────────────────────────────────────────────
-- client_members · vê membros dos próprios clientes
-- ─────────────────────────────────────────────

CREATE POLICY "Members see other members of same clients" ON infotrafego_ecossistema.client_members
  FOR SELECT USING (infotrafego_ecossistema.user_has_client_access(client_id));

CREATE POLICY "Admin manages all memberships" ON infotrafego_ecossistema.client_members
  FOR ALL USING (infotrafego_ecossistema.is_admin());

-- ─────────────────────────────────────────────
-- funis · isolado por cliente
-- ─────────────────────────────────────────────

CREATE POLICY "Users see funis of their clients" ON infotrafego_ecossistema.funis
  FOR SELECT USING (infotrafego_ecossistema.user_has_client_access(client_id));

CREATE POLICY "Members manage funis of their clients" ON infotrafego_ecossistema.funis
  FOR ALL USING (infotrafego_ecossistema.user_has_client_access(client_id));

-- ─────────────────────────────────────────────
-- campaigns · isolado por cliente
-- ─────────────────────────────────────────────

CREATE POLICY "Users see campaigns of their clients" ON infotrafego_ecossistema.campaigns
  FOR SELECT USING (infotrafego_ecossistema.user_has_client_access(client_id));

CREATE POLICY "Members manage campaigns of their clients" ON infotrafego_ecossistema.campaigns
  FOR ALL USING (infotrafego_ecossistema.user_has_client_access(client_id));

-- ─────────────────────────────────────────────
-- adsets · isolado por cliente
-- ─────────────────────────────────────────────

CREATE POLICY "Users see adsets of their clients" ON infotrafego_ecossistema.adsets
  FOR SELECT USING (infotrafego_ecossistema.user_has_client_access(client_id));

CREATE POLICY "Members manage adsets of their clients" ON infotrafego_ecossistema.adsets
  FOR ALL USING (infotrafego_ecossistema.user_has_client_access(client_id));

-- ─────────────────────────────────────────────
-- ads · isolado por cliente
-- ─────────────────────────────────────────────

CREATE POLICY "Users see ads of their clients" ON infotrafego_ecossistema.ads
  FOR SELECT USING (infotrafego_ecossistema.user_has_client_access(client_id));

CREATE POLICY "Members manage ads of their clients" ON infotrafego_ecossistema.ads
  FOR ALL USING (infotrafego_ecossistema.user_has_client_access(client_id));

-- ─────────────────────────────────────────────
-- creatives · isolado por cliente
-- ─────────────────────────────────────────────

CREATE POLICY "Users see creatives of their clients" ON infotrafego_ecossistema.creatives
  FOR SELECT USING (infotrafego_ecossistema.user_has_client_access(client_id));

CREATE POLICY "Members manage creatives of their clients" ON infotrafego_ecossistema.creatives
  FOR ALL USING (infotrafego_ecossistema.user_has_client_access(client_id));

-- ─────────────────────────────────────────────
-- metrics_daily · isolado por cliente · MUITO CRÍTICO
-- ─────────────────────────────────────────────

CREATE POLICY "Users see metrics of their clients" ON infotrafego_ecossistema.metrics_daily
  FOR SELECT USING (infotrafego_ecossistema.user_has_client_access(client_id));

-- Escrita só via service_role (Edge Functions / jobs de sync). authenticated
-- não tem policy de INSERT/UPDATE/DELETE → bloqueado por RLS; service_role
-- ignora RLS por padrão (BYPASSRLS).

-- ─────────────────────────────────────────────
-- fadiga_creative · isolado por cliente
-- ─────────────────────────────────────────────

CREATE POLICY "Users see fadiga of their clients" ON infotrafego_ecossistema.fadiga_creative
  FOR SELECT USING (infotrafego_ecossistema.user_has_client_access(client_id));

-- Escrita só via service_role (calculado por job).
