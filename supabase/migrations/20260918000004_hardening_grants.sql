-- ═══════════════════════════════════════════════════════════════
-- Hardening · tira o role `anon` da superfície do schema
-- ═══════════════════════════════════════════════════════════════
-- Schema: infotrafego_ecossistema
-- Author: Pablo + Claude · 2026-09-18
--
-- POR QUE
-- A migration inicial fez `GRANT ALL ON TABLES TO anon, authenticated,
-- service_role` e deixou o mesmo default para tabelas futuras. O RLS protege as
-- LINHAS, mas o grant deixava o `anon` — o visitante deslogado — enxergar a
-- existência e a estrutura de todas as tabelas via PostgREST e GraphQL. Os
-- advisors do Supabase apontaram isso em 19 tabelas (lint 0026).
--
-- O app exige login em tudo (o middleware redireciona qualquer rota não pública
-- para /login) e o usuário logado usa o role `authenticated`. Ou seja: o `anon`
-- nunca precisou de nada aqui. Defesa em profundidade — se um dia uma policy
-- sair errada, o deslogado ainda esbarra na falta de privilégio antes do RLS.
--
-- O que NÃO muda: `authenticated` continua com acesso (é o RLS que filtra o que
-- ele vê) e `service_role` continua ignorando RLS, como o sync e o executor
-- precisam.

-- ─────────────────────────────────────────────
-- 1. Tabelas e sequences existentes
-- ─────────────────────────────────────────────

REVOKE ALL ON ALL TABLES IN SCHEMA infotrafego_ecossistema FROM anon;
REVOKE ALL ON ALL SEQUENCES IN SCHEMA infotrafego_ecossistema FROM anon;

-- USAGE no schema fica: sem ele, o PostgREST devolve erro de schema inexistente
-- em vez de "não autorizado", e o diagnóstico de um bug de login fica pior.
-- Sem privilégio nas tabelas, USAGE sozinho não dá acesso a dado nenhum.

-- ─────────────────────────────────────────────
-- 2. Tabelas futuras
-- ─────────────────────────────────────────────
-- Sem isto, a próxima migration que criar tabela reabriria o buraco.

ALTER DEFAULT PRIVILEGES IN SCHEMA infotrafego_ecossistema
  REVOKE ALL ON TABLES FROM anon;
ALTER DEFAULT PRIVILEGES IN SCHEMA infotrafego_ecossistema
  REVOKE ALL ON SEQUENCES FROM anon;

-- ─────────────────────────────────────────────
-- 3. Funções SECURITY DEFINER
-- ─────────────────────────────────────────────
-- As três rodam com os privilégios do dono e ficam expostas como RPC
-- (/rest/v1/rpc/...). Nenhuma tem motivo pra ser chamada por um deslogado:
-- `handle_new_user` é trigger (chamada direta nem funciona), e as outras duas
-- respondem sempre `false` para quem não tem sessão. Fechar o EXECUTE remove o
-- endpoint da superfície em vez de depender desse comportamento.

REVOKE EXECUTE ON FUNCTION infotrafego_ecossistema.handle_new_user() FROM anon;
REVOKE EXECUTE ON FUNCTION infotrafego_ecossistema.is_admin() FROM anon;
REVOKE EXECUTE ON FUNCTION infotrafego_ecossistema.user_has_client_access(uuid) FROM anon;

-- `handle_new_user` também não precisa ser chamável por usuário logado: quem a
-- dispara é o trigger em auth.users.
REVOKE EXECUTE ON FUNCTION infotrafego_ecossistema.handle_new_user() FROM authenticated;

ALTER DEFAULT PRIVILEGES IN SCHEMA infotrafego_ecossistema
  REVOKE EXECUTE ON FUNCTIONS FROM anon;

-- ─────────────────────────────────────────────
-- 4. Nota sobre ia_cache
-- ─────────────────────────────────────────────
-- `ia_cache` aparece nos advisors como "RLS habilitado sem policy" (lint 0008,
-- nível INFO). É intencional: RLS ligado + zero policies = só o service_role
-- acessa, que é exatamente o desejado — a resposta do Claude chega ao usuário
-- pela rota, nunca por leitura direta da tabela.

COMMENT ON TABLE infotrafego_ecossistema.ia_cache IS
  'Cache de chamadas ao Claude. RLS ligado SEM policy de propósito: acesso só via service_role.';
