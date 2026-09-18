-- ═══════════════════════════════════════════════════════════════
-- Teste de RLS · isolamento entre clientes (critério A7)
-- ═══════════════════════════════════════════════════════════════
-- Como rodar: Supabase Dashboard → SQL Editor → cole e execute.
-- É transacional e termina em ROLLBACK: não deixa nada no banco.
--
-- POR QUE ESTE TESTE EXISTE
-- O briefing marca policy errada como risco de VAZAMENTO DE DADOS ENTRE
-- CLIENTES. Ler a policy e achar que está certa não é verificação — RLS falha
-- de formas silenciosas (policy permissiva demais, tabela sem RLS habilitado,
-- função SECURITY DEFINER com search_path errado). Este script simula dois
-- usuários de clientes diferentes e afirma o que cada um PODE e NÃO PODE ver.
--
-- O que ele cobre:
--   1. usuário do cliente A não enxerga dados do cliente B (6 tabelas)
--   2. admin global enxerga os dois
--   3. usuário sem vínculo não enxerga nada
--   4. authenticated não consegue ESCREVER em metrics_daily nem audit_log
--   5. conversa do assistente é privada por usuário, não por cliente
-- ═══════════════════════════════════════════════════════════════

BEGIN;

-- ─────────────────────────────────────────────
-- Massa de teste
-- ─────────────────────────────────────────────
-- Os uuids fixos abaixo começam com 'eeee'/'aaaa' pra não colidir com dados
-- reais. `auth.users` precisa da linha porque `users.id` referencia ela.

INSERT INTO auth.users (id, instance_id, aud, role, email, encrypted_password,
                        email_confirmed_at, created_at, updated_at,
                        raw_app_meta_data, raw_user_meta_data)
VALUES
  ('eeee0000-0000-0000-0000-0000000000a1', '00000000-0000-0000-0000-000000000000',
   'authenticated', 'authenticated', 'rls-teste-a@infotrafego.test', '',
   now(), now(), now(), '{}'::jsonb, '{}'::jsonb),
  ('eeee0000-0000-0000-0000-0000000000b1', '00000000-0000-0000-0000-000000000000',
   'authenticated', 'authenticated', 'rls-teste-b@infotrafego.test', '',
   now(), now(), now(), '{}'::jsonb, '{}'::jsonb),
  ('eeee0000-0000-0000-0000-0000000000ad', '00000000-0000-0000-0000-000000000000',
   'authenticated', 'authenticated', 'rls-teste-admin@infotrafego.test', '',
   now(), now(), now(), '{}'::jsonb, '{}'::jsonb),
  ('eeee0000-0000-0000-0000-0000000000cc', '00000000-0000-0000-0000-000000000000',
   'authenticated', 'authenticated', 'rls-teste-orfao@infotrafego.test', '',
   now(), now(), now(), '{}'::jsonb, '{}'::jsonb)
ON CONFLICT (id) DO NOTHING;

-- O trigger on_auth_user_created_infotrafego já cria os perfis; o UPDATE ajusta
-- o papel do admin.
UPDATE infotrafego_ecossistema.users
SET global_role = 'admin'
WHERE id = 'eeee0000-0000-0000-0000-0000000000ad';

INSERT INTO infotrafego_ecossistema.clients (id, name, slug, meta_ad_account_id) VALUES
  ('aaaa0000-0000-0000-0000-00000000000a', 'Cliente Teste A', 'rls-teste-a', 'act_111'),
  ('aaaa0000-0000-0000-0000-00000000000b', 'Cliente Teste B', 'rls-teste-b', 'act_222')
ON CONFLICT (id) DO NOTHING;

INSERT INTO infotrafego_ecossistema.client_members (client_id, user_id, role) VALUES
  ('aaaa0000-0000-0000-0000-00000000000a', 'eeee0000-0000-0000-0000-0000000000a1', 'gestor'),
  ('aaaa0000-0000-0000-0000-00000000000b', 'eeee0000-0000-0000-0000-0000000000b1', 'gestor')
ON CONFLICT DO NOTHING;

INSERT INTO infotrafego_ecossistema.funis
  (id, client_id, name, familia, sub_objetivo, modo_captura, etapas, marcador_mkt, marcador_com)
VALUES
  ('aaaa0000-0000-0000-0000-00000000fa01', 'aaaa0000-0000-0000-0000-00000000000a',
   'Funil A', 'captacao', 'isca_digital', 'landing_page',
   '["impressao","clique","lead"]'::jsonb, 'lead', NULL),
  ('aaaa0000-0000-0000-0000-00000000fb01', 'aaaa0000-0000-0000-0000-00000000000b',
   'Funil B', 'captacao', 'isca_digital', 'landing_page',
   '["impressao","clique","lead"]'::jsonb, 'lead', NULL)
ON CONFLICT (id) DO NOTHING;

INSERT INTO infotrafego_ecossistema.campaigns (id, client_id, meta_id, name) VALUES
  ('aaaa0000-0000-0000-0000-0000000ca01a', 'aaaa0000-0000-0000-0000-00000000000a', 'cmp_a', 'Campanha A'),
  ('aaaa0000-0000-0000-0000-0000000cb01b', 'aaaa0000-0000-0000-0000-00000000000b', 'cmp_b', 'Campanha B')
ON CONFLICT (id) DO NOTHING;

INSERT INTO infotrafego_ecossistema.metrics_daily
  (client_id, entity_type, entity_id, date, impressions, clicks, spend, stage_values)
VALUES
  ('aaaa0000-0000-0000-0000-00000000000a', 'campaign', 'cmp_a', '2026-09-01', 1000, 20, 50, '{"lead":3}'::jsonb),
  ('aaaa0000-0000-0000-0000-00000000000b', 'campaign', 'cmp_b', '2026-09-01', 2000, 40, 90, '{"lead":7}'::jsonb)
ON CONFLICT DO NOTHING;

INSERT INTO infotrafego_ecossistema.audit_log
  (client_id, user_id, acao, entity_type, entity_meta_id, status)
VALUES
  ('aaaa0000-0000-0000-0000-00000000000a', 'eeee0000-0000-0000-0000-0000000000a1',
   'campanha.pausar', 'campaign', 'cmp_a', 'sucesso'),
  ('aaaa0000-0000-0000-0000-00000000000b', 'eeee0000-0000-0000-0000-0000000000b1',
   'campanha.pausar', 'campaign', 'cmp_b', 'sucesso');

INSERT INTO infotrafego_ecossistema.assistente_mensagens
  (client_id, user_id, thread_id, role, conteudo)
VALUES
  ('aaaa0000-0000-0000-0000-00000000000a', 'eeee0000-0000-0000-0000-0000000000a1',
   'aaaa0000-0000-0000-0000-00000000dead', 'user', 'segredo do usuario A');

-- ─────────────────────────────────────────────
-- Helper de asserção
-- ─────────────────────────────────────────────

CREATE OR REPLACE FUNCTION pg_temp.checar(p_nome text, p_condicao boolean)
RETURNS void LANGUAGE plpgsql AS $$
BEGIN
  IF p_condicao THEN
    RAISE NOTICE '  OK   %', p_nome;
  ELSE
    RAISE EXCEPTION 'FALHOU: %', p_nome;
  END IF;
END;
$$;

/*
 * Simula um usuário logado.
 *
 * `auth.uid()` lê o claim `sub` de `request.jwt.claims`, então setar essa GUC
 * reproduz exatamente o que o PostgREST faz ao receber um JWT — e o `SET ROLE
 * authenticated` é o que realmente liga o RLS (o dono da tabela o ignora).
 */
CREATE OR REPLACE FUNCTION pg_temp.logar_como(p_user_id uuid)
RETURNS void LANGUAGE plpgsql AS $$
BEGIN
  EXECUTE format('SET LOCAL request.jwt.claims = %L', json_build_object('sub', p_user_id, 'role', 'authenticated')::text);
  SET LOCAL ROLE authenticated;
END;
$$;

-- ─────────────────────────────────────────────
-- 1 · Usuário do cliente A
-- ─────────────────────────────────────────────

DO $$
DECLARE v_clientes int; v_funis int; v_campanhas int; v_metricas int; v_audit int;
BEGIN
  RAISE NOTICE '--- Usuário do Cliente A ---';
  PERFORM pg_temp.logar_como('eeee0000-0000-0000-0000-0000000000a1');

  SELECT count(*) INTO v_clientes FROM infotrafego_ecossistema.clients
    WHERE id IN ('aaaa0000-0000-0000-0000-00000000000a','aaaa0000-0000-0000-0000-00000000000b');
  PERFORM pg_temp.checar('vê 1 cliente (o próprio), não 2', v_clientes = 1);

  SELECT count(*) INTO v_funis FROM infotrafego_ecossistema.funis
    WHERE id IN ('aaaa0000-0000-0000-0000-00000000fa01','aaaa0000-0000-0000-0000-00000000fb01');
  PERFORM pg_temp.checar('vê só o funil do próprio cliente', v_funis = 1);

  SELECT count(*) INTO v_campanhas FROM infotrafego_ecossistema.campaigns
    WHERE meta_id IN ('cmp_a','cmp_b');
  PERFORM pg_temp.checar('vê só a campanha do próprio cliente', v_campanhas = 1);

  SELECT count(*) INTO v_metricas FROM infotrafego_ecossistema.metrics_daily
    WHERE entity_id IN ('cmp_a','cmp_b');
  PERFORM pg_temp.checar('vê só as métricas do próprio cliente', v_metricas = 1);

  SELECT count(*) INTO v_audit FROM infotrafego_ecossistema.audit_log
    WHERE entity_meta_id IN ('cmp_a','cmp_b');
  PERFORM pg_temp.checar('vê só a auditoria do próprio cliente', v_audit = 1);
END $$;

RESET ROLE;

-- ─────────────────────────────────────────────
-- 2 · Usuário do cliente B (o espelho)
-- ─────────────────────────────────────────────

DO $$
DECLARE v_metricas int; v_impressoes bigint;
BEGIN
  RAISE NOTICE '--- Usuário do Cliente B ---';
  PERFORM pg_temp.logar_como('eeee0000-0000-0000-0000-0000000000b1');

  SELECT count(*), coalesce(max(impressions),0) INTO v_metricas, v_impressoes
    FROM infotrafego_ecossistema.metrics_daily WHERE entity_id IN ('cmp_a','cmp_b');
  PERFORM pg_temp.checar('vê 1 linha de métrica', v_metricas = 1);
  PERFORM pg_temp.checar('e é a DELE (2000 impressões, não 1000)', v_impressoes = 2000);
END $$;

RESET ROLE;

-- ─────────────────────────────────────────────
-- 3 · Admin global vê tudo
-- ─────────────────────────────────────────────

DO $$
DECLARE v_clientes int; v_metricas int;
BEGIN
  RAISE NOTICE '--- Admin global ---';
  PERFORM pg_temp.logar_como('eeee0000-0000-0000-0000-0000000000ad');

  SELECT count(*) INTO v_clientes FROM infotrafego_ecossistema.clients
    WHERE id IN ('aaaa0000-0000-0000-0000-00000000000a','aaaa0000-0000-0000-0000-00000000000b');
  PERFORM pg_temp.checar('admin vê os 2 clientes', v_clientes = 2);

  SELECT count(*) INTO v_metricas FROM infotrafego_ecossistema.metrics_daily
    WHERE entity_id IN ('cmp_a','cmp_b');
  PERFORM pg_temp.checar('admin vê as métricas dos 2', v_metricas = 2);
END $$;

RESET ROLE;

-- ─────────────────────────────────────────────
-- 4 · Usuário sem vínculo não vê nada
-- ─────────────────────────────────────────────

DO $$
DECLARE v_clientes int; v_metricas int;
BEGIN
  RAISE NOTICE '--- Usuário órfão (sem client_members) ---';
  PERFORM pg_temp.logar_como('eeee0000-0000-0000-0000-0000000000cc');

  SELECT count(*) INTO v_clientes FROM infotrafego_ecossistema.clients;
  PERFORM pg_temp.checar('não vê nenhum cliente', v_clientes = 0);

  SELECT count(*) INTO v_metricas FROM infotrafego_ecossistema.metrics_daily;
  PERFORM pg_temp.checar('não vê nenhuma métrica', v_metricas = 0);
END $$;

RESET ROLE;

-- ─────────────────────────────────────────────
-- 5 · Escrita bloqueada onde deve ser
-- ─────────────────────────────────────────────
-- metrics_daily e audit_log não têm policy de INSERT para `authenticated`:
-- quem escreve é o service_role (sync e executor). Sem isso, um usuário
-- poderia forjar os próprios números — ou apagar o log das ações dele.

DO $$
DECLARE v_deu_erro boolean;
BEGIN
  RAISE NOTICE '--- Escrita por usuário comum ---';
  PERFORM pg_temp.logar_como('eeee0000-0000-0000-0000-0000000000a1');

  BEGIN
    INSERT INTO infotrafego_ecossistema.metrics_daily
      (client_id, entity_type, entity_id, date, impressions)
    VALUES ('aaaa0000-0000-0000-0000-00000000000a', 'campaign', 'forjado', '2026-09-02', 999999);
    v_deu_erro := false;
  EXCEPTION WHEN others THEN
    v_deu_erro := true;
  END;
  PERFORM pg_temp.checar('usuário NÃO consegue inserir em metrics_daily', v_deu_erro);

  BEGIN
    INSERT INTO infotrafego_ecossistema.audit_log
      (client_id, acao, entity_type, status)
    VALUES ('aaaa0000-0000-0000-0000-00000000000a', 'forjado', 'campaign', 'sucesso');
    v_deu_erro := false;
  EXCEPTION WHEN others THEN
    v_deu_erro := true;
  END;
  PERFORM pg_temp.checar('usuário NÃO consegue inserir em audit_log', v_deu_erro);
END $$;

RESET ROLE;

-- ─────────────────────────────────────────────
-- 6 · Conversa do assistente é privada POR USUÁRIO
-- ─────────────────────────────────────────────
-- Não basta isolar por cliente: dois gestores do mesmo cliente não devem ler
-- o chat um do outro.

DO $$
DECLARE v_msgs int;
BEGIN
  RAISE NOTICE '--- Privacidade do assistente ---';

  PERFORM pg_temp.logar_como('eeee0000-0000-0000-0000-0000000000a1');
  SELECT count(*) INTO v_msgs FROM infotrafego_ecossistema.assistente_mensagens;
  PERFORM pg_temp.checar('o autor vê a própria mensagem', v_msgs = 1);
  RESET ROLE;

  -- Admin do mesmo ecossistema NÃO deve ler a conversa alheia.
  PERFORM pg_temp.logar_como('eeee0000-0000-0000-0000-0000000000ad');
  SELECT count(*) INTO v_msgs FROM infotrafego_ecossistema.assistente_mensagens;
  PERFORM pg_temp.checar('outro usuário não vê a conversa alheia', v_msgs = 0);
END $$;

RESET ROLE;

DO $$ BEGIN RAISE NOTICE '';
  RAISE NOTICE 'TODAS AS ASSERÇÕES PASSARAM · multi-tenancy validado.';
END $$;

-- Nada é persistido: o teste não suja o banco.
ROLLBACK;
