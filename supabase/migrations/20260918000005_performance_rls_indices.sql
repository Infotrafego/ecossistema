-- ═══════════════════════════════════════════════════════════════
-- Performance · índices de FK e RLS que não reavalia por linha
-- ═══════════════════════════════════════════════════════════════
-- Schema: infotrafego_ecossistema
-- Author: Pablo + Claude · 2026-09-18
--
-- Vem dos advisors do Supabase rodados depois do primeiro sync real, com 2.502
-- linhas de métrica e 2.630 entidades no banco. Tudo aqui serve ao critério de
-- "dashboard carrega em menos de 2s".

-- ─────────────────────────────────────────────
-- 1. `auth.uid()` avaliado UMA vez, não por linha
-- ─────────────────────────────────────────────
-- Sem o `(select ...)`, o Postgres trata `auth.uid()` como volátil e reexecuta
-- a função para CADA linha avaliada pela policy. Envolver num subselect deixa
-- o planner transformar em InitPlan — uma execução por query. A diferença não
-- aparece com 1 usuário e some no ruído com 10 linhas; com o histórico
-- completo de mídia ela é a diferença entre a tabela abrir e travar.
-- Referência: lint 0003 (auth_rls_initplan).

DROP POLICY IF EXISTS "Users see own profile" ON infotrafego_ecossistema.users;
CREATE POLICY "Users see own profile" ON infotrafego_ecossistema.users
  FOR SELECT USING (id = (SELECT auth.uid()));

DROP POLICY IF EXISTS "Users update own profile" ON infotrafego_ecossistema.users;
CREATE POLICY "Users update own profile" ON infotrafego_ecossistema.users
  FOR UPDATE USING (id = (SELECT auth.uid()));

DROP POLICY IF EXISTS "Users see own assistant messages" ON infotrafego_ecossistema.assistente_mensagens;
CREATE POLICY "Users see own assistant messages" ON infotrafego_ecossistema.assistente_mensagens
  FOR SELECT USING (
    user_id = (SELECT auth.uid())
    AND infotrafego_ecossistema.user_has_client_access(client_id)
  );

-- ─────────────────────────────────────────────
-- 2. Policies de SELECT redundantes
-- ─────────────────────────────────────────────
-- Estas tabelas tinham DUAS policies permissivas de SELECT com a MESMA
-- condição: uma `FOR SELECT` e outra `FOR ALL` (que já inclui SELECT). O
-- Postgres executa as duas e une com OR — custo dobrado para o mesmo
-- resultado. A `FOR ALL` fica, porque é ela que também autoriza escrita.
-- Referência: lint 0006 (multiple_permissive_policies).
--
-- Isto NÃO afrouxa nada: `user_has_client_access(client_id)` é exatamente a
-- condição que sobra, e o teste em supabase/tests/rls_multi_tenancy.sql
-- continua valendo.

DROP POLICY IF EXISTS "Users see funis of their clients" ON infotrafego_ecossistema.funis;
DROP POLICY IF EXISTS "Users see campaigns of their clients" ON infotrafego_ecossistema.campaigns;
DROP POLICY IF EXISTS "Users see adsets of their clients" ON infotrafego_ecossistema.adsets;
DROP POLICY IF EXISTS "Users see ads of their clients" ON infotrafego_ecossistema.ads;
DROP POLICY IF EXISTS "Users see creatives of their clients" ON infotrafego_ecossistema.creatives;

-- ─────────────────────────────────────────────
-- 3. Índices nas foreign keys do caminho quente
-- ─────────────────────────────────────────────
-- `client_members(user_id)` é o mais importante de todos: é a coluna que
-- `user_has_client_access()` filtra, e essa função roda em TODA policy de
-- TODA tabela. Sem índice, cada verificação de acesso faz sequential scan.
-- Referência: lint 0001 (unindexed_foreign_keys).

CREATE INDEX IF NOT EXISTS idx_client_members_user
  ON infotrafego_ecossistema.client_members(user_id);

-- Os três abaixo sustentam o join de metadados de `lib/data/intel.ts`, que é
-- o que monta criativo × público × campanha em todas as abas.
CREATE INDEX IF NOT EXISTS idx_ads_adset
  ON infotrafego_ecossistema.ads(adset_id);

CREATE INDEX IF NOT EXISTS idx_ads_creative
  ON infotrafego_ecossistema.ads(creative_id)
  WHERE creative_id IS NOT NULL;

CREATE INDEX IF NOT EXISTS idx_adsets_campaign
  ON infotrafego_ecossistema.adsets(campaign_id);

-- Menos quentes, mas baratos e usados pelas telas de IA e auditoria.
CREATE INDEX IF NOT EXISTS idx_audit_log_user
  ON infotrafego_ecossistema.audit_log(user_id)
  WHERE user_id IS NOT NULL;

CREATE INDEX IF NOT EXISTS idx_fadiga_client
  ON infotrafego_ecossistema.fadiga_creative(client_id);

CREATE INDEX IF NOT EXISTS idx_regra_execucoes_client
  ON infotrafego_ecossistema.regra_execucoes(client_id, executed_at DESC);

CREATE INDEX IF NOT EXISTS idx_assistente_client_user
  ON infotrafego_ecossistema.assistente_mensagens(client_id, user_id, created_at DESC);

CREATE INDEX IF NOT EXISTS idx_ia_cache_client
  ON infotrafego_ecossistema.ia_cache(client_id)
  WHERE client_id IS NOT NULL;

CREATE INDEX IF NOT EXISTS idx_copy_sugestoes_funil
  ON infotrafego_ecossistema.copy_sugestoes(funil_id)
  WHERE funil_id IS NOT NULL;

-- ─────────────────────────────────────────────
-- 4. Índice da query mais frequente do app
-- ─────────────────────────────────────────────
-- Toda aba lê `metrics_daily` filtrando (client_id, entity_type, date). A PK é
-- (client_id, entity_type, entity_id, date): serve para o upsert, mas não para
-- varrer um intervalo de datas sem saber o entity_id.

CREATE INDEX IF NOT EXISTS idx_metrics_client_tipo_data
  ON infotrafego_ecossistema.metrics_daily(client_id, entity_type, date);
