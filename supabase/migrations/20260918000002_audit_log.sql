-- ═══════════════════════════════════════════════════════════════
-- Fase 2b · Log de auditoria das ações CRUD na Meta
-- ═══════════════════════════════════════════════════════════════
-- Schema: infotrafego_ecossistema
-- Author: Pablo + Claude · 2026-09-18
--
-- Critério de pronto da 2b: "toda ação com log de auditoria (quem · quando ·
-- o quê · resultado)" e "rollback em caso de erro da API Meta".
--
-- O rollback vive aqui, não só no código: antes de mutar qualquer entidade a
-- action layer grava `estado_anterior` com os campos que vai mexer. Se a Meta
-- responder erro no meio de uma ação composta (ex.: duplicar → ajustar verba),
-- o executor lê esta linha e reverte. Sem isso um erro parcial deixa a conta do
-- cliente num estado que ninguém sabe desfazer.

CREATE TABLE IF NOT EXISTS infotrafego_ecossistema.audit_log (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  client_id uuid NOT NULL REFERENCES infotrafego_ecossistema.clients(id) ON DELETE CASCADE,

  -- QUEM · nullable porque job automático (Regras Auto) não tem usuário humano.
  user_id uuid REFERENCES infotrafego_ecossistema.users(id) ON DELETE SET NULL,
  origem text NOT NULL DEFAULT 'ui'
    CHECK (origem IN ('ui', 'assistente_ia', 'regra_auto')),

  -- O QUÊ
  acao text NOT NULL,
  entity_type text NOT NULL CHECK (entity_type IN ('campaign', 'adset', 'ad', 'creative', 'audience')),
  entity_meta_id text,
  entity_nome text,
  params jsonb NOT NULL DEFAULT '{}'::jsonb,

  -- RESULTADO
  status text NOT NULL DEFAULT 'pendente'
    CHECK (status IN ('pendente', 'sucesso', 'erro', 'revertido', 'reversao_falhou')),
  erro text,
  resposta_meta jsonb,

  -- ROLLBACK · snapshot dos campos mutados, gravado ANTES da chamada
  estado_anterior jsonb,
  revertido_em timestamptz,

  -- Conta usada. `sandbox` false só é possível com liberação explícita do Pablo
  -- (ver META_ALLOW_PRODUCTION_WRITES em lib/meta-ads/guard.ts).
  ad_account_id text,
  sandbox boolean NOT NULL DEFAULT true,

  created_at timestamptz NOT NULL DEFAULT now(),
  finished_at timestamptz
);

CREATE INDEX IF NOT EXISTS idx_audit_log_client_created
  ON infotrafego_ecossistema.audit_log(client_id, created_at DESC);

CREATE INDEX IF NOT EXISTS idx_audit_log_entity
  ON infotrafego_ecossistema.audit_log(entity_type, entity_meta_id);

-- Linhas que precisam de atenção humana: erro sem reversão, ou reversão falhada.
CREATE INDEX IF NOT EXISTS idx_audit_log_pendencias
  ON infotrafego_ecossistema.audit_log(client_id, created_at DESC)
  WHERE status IN ('erro', 'reversao_falhou');

COMMENT ON COLUMN infotrafego_ecossistema.audit_log.estado_anterior IS
  'Campos da entidade ANTES da ação (ex.: {"status":"ACTIVE","daily_budget":5000}). Fonte do rollback.';

-- ─────────────────────────────────────────────
-- RLS · leitura isolada por cliente; escrita só pelo service_role
-- ─────────────────────────────────────────────
-- Auditoria que o próprio usuário pode reescrever não é auditoria: as ações
-- passam por Route Handler com service role, que é quem grava.

ALTER TABLE infotrafego_ecossistema.audit_log ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users see audit_log of their clients" ON infotrafego_ecossistema.audit_log;
CREATE POLICY "Users see audit_log of their clients" ON infotrafego_ecossistema.audit_log
  FOR SELECT USING (infotrafego_ecossistema.user_has_client_access(client_id));
