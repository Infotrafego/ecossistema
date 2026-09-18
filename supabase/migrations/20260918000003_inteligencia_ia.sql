-- ═══════════════════════════════════════════════════════════════
-- Fase 2c · Inteligência IA · cache, regras automáticas e copy
-- ═══════════════════════════════════════════════════════════════
-- Schema: infotrafego_ecossistema
-- Author: Pablo + Claude · 2026-09-18
--
-- Restrição que molda todo este bloco: operação 100% em free tier, modelo Haiku,
-- cache em banco (task do ClickUp vence o briefing técnico, que falava em
-- Sonnet/Opus com orçamento mensal). Por isso `ia_cache` existe antes de
-- qualquer feature: nenhuma chamada ao Claude sai sem passar por ele.

-- ─────────────────────────────────────────────
-- 1. Cache de respostas do Claude
-- ─────────────────────────────────────────────
-- Chave = hash do (modelo + system + user). Mesma pergunta sobre os mesmos
-- números não gasta token duas vezes. `expires_at` porque análise de criativo
-- envelhece junto com os dados: o TTL padrão é 24h, alinhado ao sync diário.

CREATE TABLE IF NOT EXISTS infotrafego_ecossistema.ia_cache (
  cache_key text PRIMARY KEY,
  client_id uuid REFERENCES infotrafego_ecossistema.clients(id) ON DELETE CASCADE,
  finalidade text NOT NULL,
  model text NOT NULL,
  resposta text NOT NULL,
  input_tokens int NOT NULL DEFAULT 0,
  output_tokens int NOT NULL DEFAULT 0,
  hits int NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now(),
  expires_at timestamptz NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_ia_cache_expira
  ON infotrafego_ecossistema.ia_cache(expires_at);

COMMENT ON TABLE infotrafego_ecossistema.ia_cache IS
  'Cache de chamadas ao Claude. Toda chamada passa por aqui (lib/claude/client.ts) — free tier é requisito da fase.';

-- ─────────────────────────────────────────────
-- 2. Regras automáticas (Otimizador)
-- ─────────────────────────────────────────────
-- Exemplo do briefing: "se CPC > R$ 3,50 por 3 dias → pausar ad set".
-- `condicoes` é um array de {metrica, operador, valor}; `janela_dias` diz por
-- quantos dias seguidos a condição tem que valer antes da ação disparar — sem
-- isso uma oscilação de um dia pausaria um ad set saudável.

CREATE TABLE IF NOT EXISTS infotrafego_ecossistema.regras_auto (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  client_id uuid NOT NULL REFERENCES infotrafego_ecossistema.clients(id) ON DELETE CASCADE,
  nome text NOT NULL,
  escopo text NOT NULL CHECK (escopo IN ('campaign', 'adset', 'ad')),
  condicoes jsonb NOT NULL DEFAULT '[]'::jsonb,
  operador_logico text NOT NULL DEFAULT 'e' CHECK (operador_logico IN ('e', 'ou')),
  janela_dias int NOT NULL DEFAULT 3 CHECK (janela_dias BETWEEN 1 AND 30),
  acao text NOT NULL CHECK (acao IN ('pausar', 'aumentar_orcamento', 'reduzir_orcamento', 'notificar')),
  acao_params jsonb NOT NULL DEFAULT '{}'::jsonb,
  gasto_minimo numeric(12,2) NOT NULL DEFAULT 0,
  ativa boolean NOT NULL DEFAULT false,
  -- Modo seco: avalia e registra o que faria, sem chamar a Meta. Padrão true
  -- porque regra nova mexendo em verba de cliente sem observação é risco puro.
  dry_run boolean NOT NULL DEFAULT true,
  created_by uuid REFERENCES infotrafego_ecossistema.users(id) ON DELETE SET NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_regras_auto_client_ativa
  ON infotrafego_ecossistema.regras_auto(client_id, ativa);

DROP TRIGGER IF EXISTS set_updated_at_regras_auto ON infotrafego_ecossistema.regras_auto;
CREATE TRIGGER set_updated_at_regras_auto
  BEFORE UPDATE ON infotrafego_ecossistema.regras_auto
  FOR EACH ROW EXECUTE FUNCTION infotrafego_ecossistema.set_updated_at();

-- ─────────────────────────────────────────────
-- 3. Histórico de execução das regras
-- ─────────────────────────────────────────────
-- Critério de pronto: "histórico de execuções rastreável". Guarda o que casou,
-- o que foi aplicado e o porquê de cada alvo — o gestor precisa conseguir
-- responder "por que esse ad set foi pausado ontem?".

CREATE TABLE IF NOT EXISTS infotrafego_ecossistema.regra_execucoes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  regra_id uuid NOT NULL REFERENCES infotrafego_ecossistema.regras_auto(id) ON DELETE CASCADE,
  client_id uuid NOT NULL REFERENCES infotrafego_ecossistema.clients(id) ON DELETE CASCADE,
  status text NOT NULL CHECK (status IN ('sucesso', 'parcial', 'erro', 'sem_alvos')),
  dry_run boolean NOT NULL DEFAULT true,
  alvos_avaliados int NOT NULL DEFAULT 0,
  alvos_casados int NOT NULL DEFAULT 0,
  acoes_aplicadas int NOT NULL DEFAULT 0,
  detalhes jsonb NOT NULL DEFAULT '[]'::jsonb,
  erro text,
  executed_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_regra_execucoes_regra
  ON infotrafego_ecossistema.regra_execucoes(regra_id, executed_at DESC);

-- ─────────────────────────────────────────────
-- 4. Sugestões de copy
-- ─────────────────────────────────────────────
-- 3+ variações por solicitação, vinculadas ao cliente e com o contexto que as
-- gerou — guardar o contexto é o que permite comparar depois o que funcionou.

CREATE TABLE IF NOT EXISTS infotrafego_ecossistema.copy_sugestoes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  client_id uuid NOT NULL REFERENCES infotrafego_ecossistema.clients(id) ON DELETE CASCADE,
  funil_id uuid REFERENCES infotrafego_ecossistema.funis(id) ON DELETE SET NULL,
  briefing jsonb NOT NULL DEFAULT '{}'::jsonb,
  variacoes jsonb NOT NULL DEFAULT '[]'::jsonb,
  modelo text NOT NULL,
  do_cache boolean NOT NULL DEFAULT false,
  created_by uuid REFERENCES infotrafego_ecossistema.users(id) ON DELETE SET NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_copy_sugestoes_client
  ON infotrafego_ecossistema.copy_sugestoes(client_id, created_at DESC);

-- ─────────────────────────────────────────────
-- 5. Conversas do assistente
-- ─────────────────────────────────────────────
-- Mantém o histórico por usuário e cliente. `tool_calls` guarda a tradução
-- linguagem natural → chamada da Marketing API, que é exatamente o que o
-- critério de pronto mede ("10 comandos válidos → chamadas corretas").

CREATE TABLE IF NOT EXISTS infotrafego_ecossistema.assistente_mensagens (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  client_id uuid NOT NULL REFERENCES infotrafego_ecossistema.clients(id) ON DELETE CASCADE,
  user_id uuid NOT NULL REFERENCES infotrafego_ecossistema.users(id) ON DELETE CASCADE,
  thread_id uuid NOT NULL,
  role text NOT NULL CHECK (role IN ('user', 'assistant')),
  conteudo text NOT NULL,
  tool_calls jsonb,
  audit_log_id uuid REFERENCES infotrafego_ecossistema.audit_log(id) ON DELETE SET NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_assistente_thread
  ON infotrafego_ecossistema.assistente_mensagens(thread_id, created_at);

-- ─────────────────────────────────────────────
-- 6. RLS
-- ─────────────────────────────────────────────

ALTER TABLE infotrafego_ecossistema.ia_cache ENABLE ROW LEVEL SECURITY;
ALTER TABLE infotrafego_ecossistema.regras_auto ENABLE ROW LEVEL SECURITY;
ALTER TABLE infotrafego_ecossistema.regra_execucoes ENABLE ROW LEVEL SECURITY;
ALTER TABLE infotrafego_ecossistema.copy_sugestoes ENABLE ROW LEVEL SECURITY;
ALTER TABLE infotrafego_ecossistema.assistente_mensagens ENABLE ROW LEVEL SECURITY;

-- Cache é escrito só pelo servidor (service_role). Sem policy de SELECT pra
-- authenticated: a resposta chega ao usuário pela rota, não por leitura direta.

DROP POLICY IF EXISTS "Users manage regras of their clients" ON infotrafego_ecossistema.regras_auto;
CREATE POLICY "Users manage regras of their clients" ON infotrafego_ecossistema.regras_auto
  FOR ALL USING (infotrafego_ecossistema.user_has_client_access(client_id));

DROP POLICY IF EXISTS "Users see execucoes of their clients" ON infotrafego_ecossistema.regra_execucoes;
CREATE POLICY "Users see execucoes of their clients" ON infotrafego_ecossistema.regra_execucoes
  FOR SELECT USING (infotrafego_ecossistema.user_has_client_access(client_id));

DROP POLICY IF EXISTS "Users see copy of their clients" ON infotrafego_ecossistema.copy_sugestoes;
CREATE POLICY "Users see copy of their clients" ON infotrafego_ecossistema.copy_sugestoes
  FOR SELECT USING (infotrafego_ecossistema.user_has_client_access(client_id));

-- Conversa é pessoal: mesmo colega do mesmo cliente não lê o chat do outro.
DROP POLICY IF EXISTS "Users see own assistant messages" ON infotrafego_ecossistema.assistente_mensagens;
CREATE POLICY "Users see own assistant messages" ON infotrafego_ecossistema.assistente_mensagens
  FOR SELECT USING (
    user_id = auth.uid()
    AND infotrafego_ecossistema.user_has_client_access(client_id)
  );
