-- ═══════════════════════════════════════════════════════════════
-- Operação · etapas do funil nas métricas, vínculo campanha↔funil,
-- log de sync, orçamento e metas mensais
-- ═══════════════════════════════════════════════════════════════
-- Schema: infotrafego_ecossistema
-- Author: Pablo + Claude · 2026-09-18
--
-- Três lacunas que impediam a Fase 2 de sair do mock:
--   1. `metrics_daily` só guardava `conversions` (um número). O cone modular
--      precisa do valor de CADA etapa do funil por dia → `stage_values jsonb`.
--   2. Nada ligava uma campanha a um funil, então o filtro global de funil não
--      tinha por onde filtrar → `campaigns.funil_id`.
--   3. Metas e verba viviam hardcoded no mockup → duas tabelas mensais.

-- ─────────────────────────────────────────────
-- 1. Valores por etapa do funil em metrics_daily
-- ─────────────────────────────────────────────
-- Mapa EtapaId → valor do dia, ex.: {"impressao": 3200, "clique": 88,
-- "page_view": 71, "lead": 9, "mql": 6}. O sync traduz os `actions` da Meta
-- pra este vocabulário (lib/meta-ads/actions.ts) uma vez; daí pra frente
-- qualquer config de funil só lê as chaves que interessam a ela.
--
-- `conversions` continua existindo como atalho da conversão primária, pra não
-- quebrar quem já lê a coluna.

ALTER TABLE infotrafego_ecossistema.metrics_daily
  ADD COLUMN IF NOT EXISTS stage_values jsonb NOT NULL DEFAULT '{}'::jsonb;

COMMENT ON COLUMN infotrafego_ecossistema.metrics_daily.stage_values IS
  'Mapa EtapaId → valor do dia (lib/funil.ts). Preenchido pelo sync a partir de actions[] da Meta.';

-- ─────────────────────────────────────────────
-- 2. Campanha pertence a um funil
-- ─────────────────────────────────────────────
-- Nullable de propósito: campanha recém-sincronizada entra sem funil e o gestor
-- (ou a heurística de nomenclatura) atribui depois. ON DELETE SET NULL pra que
-- apagar um funil não leve junto o histórico de mídia.

ALTER TABLE infotrafego_ecossistema.campaigns
  ADD COLUMN IF NOT EXISTS funil_id uuid
    REFERENCES infotrafego_ecossistema.funis(id) ON DELETE SET NULL;

CREATE INDEX IF NOT EXISTS idx_campaigns_funil
  ON infotrafego_ecossistema.campaigns(funil_id)
  WHERE funil_id IS NOT NULL;

-- ─────────────────────────────────────────────
-- 3. Log de execução do sync
-- ─────────────────────────────────────────────
-- Critério de pronto da fase: "sync rodando diariamente sem falhas por 7 dias".
-- Sem registro de cada execução não há como afirmar isso.

CREATE TABLE IF NOT EXISTS infotrafego_ecossistema.sync_log (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  client_id uuid REFERENCES infotrafego_ecossistema.clients(id) ON DELETE CASCADE,
  source text NOT NULL DEFAULT 'meta_ads',
  status text NOT NULL CHECK (status IN ('running', 'success', 'partial', 'error')),
  date_start date,
  date_stop date,
  entities_synced int NOT NULL DEFAULT 0,
  rows_upserted int NOT NULL DEFAULT 0,
  api_calls int NOT NULL DEFAULT 0,
  duration_ms int,
  error_message text,
  details jsonb,
  started_at timestamptz NOT NULL DEFAULT now(),
  finished_at timestamptz
);

CREATE INDEX IF NOT EXISTS idx_sync_log_client_started
  ON infotrafego_ecossistema.sync_log(client_id, started_at DESC);

-- ─────────────────────────────────────────────
-- 4. Orçamento mensal (por cliente)
-- ─────────────────────────────────────────────
-- Verba é contratada por conta de anúncio, não por funil — por isso mora no
-- cliente. Alimenta o painel "Saldo & Orçamento" da Visão Geral.

CREATE TABLE IF NOT EXISTS infotrafego_ecossistema.orcamento_mensal (
  client_id uuid NOT NULL REFERENCES infotrafego_ecossistema.clients(id) ON DELETE CASCADE,
  ano int NOT NULL CHECK (ano BETWEEN 2020 AND 2100),
  mes int NOT NULL CHECK (mes BETWEEN 1 AND 12),
  tipo text NOT NULL DEFAULT 'pos_pago' CHECK (tipo IN ('pre_pago', 'pos_pago')),
  verba_mensal numeric(12,2) NOT NULL DEFAULT 0,
  saldo_prepago numeric(12,2) NOT NULL DEFAULT 0,
  dia_ciclo int NOT NULL DEFAULT 1 CHECK (dia_ciclo BETWEEN 1 AND 28),
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  PRIMARY KEY (client_id, ano, mes)
);

DROP TRIGGER IF EXISTS set_updated_at_orcamento_mensal ON infotrafego_ecossistema.orcamento_mensal;
CREATE TRIGGER set_updated_at_orcamento_mensal
  BEFORE UPDATE ON infotrafego_ecossistema.orcamento_mensal
  FOR EACH ROW EXECUTE FUNCTION infotrafego_ecossistema.set_updated_at();

-- ─────────────────────────────────────────────
-- 5. Metas mensais (por funil)
-- ─────────────────────────────────────────────
-- Metas são do funil: o mesmo cliente pode ter um funil de captação com meta de
-- MQL e um de distribuição com meta de alcance. `metricas` é jsonb porque as
-- chaves dependem da família do funil (EtapaId ou métrica derivada).

CREATE TABLE IF NOT EXISTS infotrafego_ecossistema.metas_mensais (
  funil_id uuid NOT NULL REFERENCES infotrafego_ecossistema.funis(id) ON DELETE CASCADE,
  client_id uuid NOT NULL REFERENCES infotrafego_ecossistema.clients(id) ON DELETE CASCADE,
  ano int NOT NULL CHECK (ano BETWEEN 2020 AND 2100),
  mes int NOT NULL CHECK (mes BETWEEN 1 AND 12),
  metricas jsonb NOT NULL DEFAULT '{}'::jsonb,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  PRIMARY KEY (funil_id, ano, mes)
);

CREATE INDEX IF NOT EXISTS idx_metas_mensais_client
  ON infotrafego_ecossistema.metas_mensais(client_id, ano, mes);

DROP TRIGGER IF EXISTS set_updated_at_metas_mensais ON infotrafego_ecossistema.metas_mensais;
CREATE TRIGGER set_updated_at_metas_mensais
  BEFORE UPDATE ON infotrafego_ecossistema.metas_mensais
  FOR EACH ROW EXECUTE FUNCTION infotrafego_ecossistema.set_updated_at();

COMMENT ON COLUMN infotrafego_ecossistema.metas_mensais.metricas IS
  'Mapa chave → {meta, tipo}. Chaves: EtapaId ou derivada (spend, receita). tipo: positivo | custo.';

-- ─────────────────────────────────────────────
-- 6. RLS das tabelas novas
-- ─────────────────────────────────────────────
-- Mesmo padrão das demais: leitura isolada por cliente via
-- user_has_client_access(); escrita de sync_log só pelo service_role (é job).

ALTER TABLE infotrafego_ecossistema.sync_log ENABLE ROW LEVEL SECURITY;
ALTER TABLE infotrafego_ecossistema.orcamento_mensal ENABLE ROW LEVEL SECURITY;
ALTER TABLE infotrafego_ecossistema.metas_mensais ENABLE ROW LEVEL SECURITY;

-- Linha sem client_id (sync global) fica invisível pro usuário comum: só o
-- service_role, que ignora RLS, precisa vê-la.
DROP POLICY IF EXISTS "Users see sync_log of their clients" ON infotrafego_ecossistema.sync_log;
CREATE POLICY "Users see sync_log of their clients" ON infotrafego_ecossistema.sync_log
  FOR SELECT USING (
    client_id IS NOT NULL
    AND infotrafego_ecossistema.user_has_client_access(client_id)
  );

DROP POLICY IF EXISTS "Users manage orcamento of their clients" ON infotrafego_ecossistema.orcamento_mensal;
CREATE POLICY "Users manage orcamento of their clients" ON infotrafego_ecossistema.orcamento_mensal
  FOR ALL USING (infotrafego_ecossistema.user_has_client_access(client_id));

DROP POLICY IF EXISTS "Users manage metas of their clients" ON infotrafego_ecossistema.metas_mensais;
CREATE POLICY "Users manage metas of their clients" ON infotrafego_ecossistema.metas_mensais
  FOR ALL USING (infotrafego_ecossistema.user_has_client_access(client_id));
