-- ═══════════════════════════════════════════════════════════════
-- Central CS · ponte para a escuta dos grupos de WhatsApp
-- ═══════════════════════════════════════════════════════════════
-- Schema: infotrafego_ecossistema
-- Author: Pablo + Claude · 2026-09-27 · ClickUp 17thgbztkqm
--
-- POR QUE
-- A escuta dos grupos (repo PERSONAL_ASSISTANT, ClickUp 86akfrb5y) varre os
-- grupos de WhatsApp dos clientes e grava cada sinal (DEMANDA, ERRO,
-- INSATISFACAO, ELOGIO) e o resumo do dia em `ai_team.escuta_*`. A Central CS
-- (`/dashboard/cs`) lê este schema via PostgREST, e `ai_team` não é exposto.
-- A ponte são views agregadas aqui, sem ETL: o dado continua tendo um dono só.
--
-- PRIVACIDADE
-- Só agregados e o assunto. O trecho bruto da conversa (`escuta_sinal.trecho`,
-- `escuta_varredura.messages`), o nome de quem escreveu e o "o que aconteceu"
-- do resumo NÃO saem daqui. As datas das mensagens são lidas das mensagens,
-- mas só o máximo por cliente é exposto.
--
-- PERMISSÕES — mesma regra das outras tabelas
-- `authenticated` não tem (nem deve ter) acesso a `ai_team`, então as views não
-- podem ser `security_invoker`: rodam com o privilégio do dono e aplicam o
-- filtro de acesso dentro delas (`security_barrier`, para nenhum predicado do
-- chamador vazar linha antes do filtro). O filtro é o mesmo
-- `user_has_client_access()` das tabelas, por slug, porque os clientes da
-- escuta vêm de `ai_team.clients`:
--   * admin vê a carteira inteira (é quem opera a Central CS hoje);
--   * service_role vê tudo, como já ignora o RLS das tabelas;
--   * membro vê só o cliente cujo slug está em `clients` e em `client_members`.
-- O advisor do Supabase vai listar estas views como "security definer view"
-- (lint 0010). É intencional e é por isso que o filtro mora aqui dentro.
--
-- FORA DA CARTEIRA
-- `infotrafego` (grupos internos) e `renova-industria` (ignorada em toda a
-- operação, decisão do Pablo 2026-09-22).

-- ─────────────────────────────────────────────
-- 1. Acesso por slug
-- ─────────────────────────────────────────────

CREATE OR REPLACE FUNCTION infotrafego_ecossistema.user_has_client_slug_access(p_slug text)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = ''
AS $$
  -- service_role passa, como passa pelo RLS das tabelas (sync, jobs, scripts).
  SELECT (SELECT auth.role()) = 'service_role'
      OR infotrafego_ecossistema.is_admin()
      OR EXISTS (
    SELECT 1 FROM infotrafego_ecossistema.clients c
    WHERE c.slug = p_slug
      AND infotrafego_ecossistema.user_has_client_access(c.id)
  );
$$;

REVOKE ALL ON FUNCTION infotrafego_ecossistema.user_has_client_slug_access(text) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION infotrafego_ecossistema.user_has_client_slug_access(text) TO authenticated, service_role;

-- ─────────────────────────────────────────────
-- 2. Carteira · um cliente por linha
-- ─────────────────────────────────────────────
-- `hora` das mensagens vem como 'DD/MM HH:MI' em horário de Brasília, sem ano:
-- o ano é o do dia da varredura (menos um quando a mensagem é de dezembro e a
-- varredura já é de janeiro).

CREATE OR REPLACE VIEW infotrafego_ecossistema.cs_escuta_clientes
WITH (security_barrier = true) AS
WITH grupos AS (
  SELECT g.group_jid, g.client_id
    FROM ai_team.escuta_grupo g
   WHERE g.enabled AND g.client_id IS NOT NULL
), mensagens AS (
  SELECT g.client_id,
         m->>'papel' AS papel,
         make_timestamptz(
           extract(year FROM v.dia)::int
             - CASE WHEN substr(m->>'hora', 4, 2)::int > extract(month FROM v.dia)::int THEN 1 ELSE 0 END,
           substr(m->>'hora', 4, 2)::int,
           substr(m->>'hora', 1, 2)::int,
           substr(m->>'hora', 7, 2)::int,
           substr(m->>'hora', 10, 2)::int,
           0,
           'America/Sao_Paulo'
         ) AS em
    FROM ai_team.escuta_varredura v
    JOIN grupos g ON g.group_jid = v.group_jid
   CROSS JOIN LATERAL jsonb_array_elements(
           CASE WHEN jsonb_typeof(v.messages) = 'array' THEN v.messages ELSE '[]'::jsonb END
         ) m
   WHERE v.status = 'done'
     AND (m->>'hora') ~ '^\d{2}/\d{2} \d{2}:\d{2}$'
)
SELECT c.slug          AS client_slug,
       c.display_name  AS cliente,
       (SELECT count(*) FROM grupos g WHERE g.client_id = c.id)::int AS grupos,
       (SELECT min(v.window_start)
          FROM ai_team.escuta_varredura v
          JOIN grupos g ON g.group_jid = v.group_jid
         WHERE g.client_id = c.id)                                     AS escuta_desde,
       (SELECT max(em) FROM mensagens x WHERE x.client_id = c.id)      AS ultima_mensagem,
       (SELECT max(em) FROM mensagens x WHERE x.client_id = c.id AND x.papel = 'cliente') AS ultima_mensagem_cliente,
       (SELECT max(em) FROM mensagens x WHERE x.client_id = c.id AND x.papel = 'time')    AS ultima_mensagem_time
  FROM ai_team.clients c
 WHERE EXISTS (SELECT 1 FROM grupos g WHERE g.client_id = c.id)
   AND c.slug NOT IN ('infotrafego', 'renova-industria')
   AND infotrafego_ecossistema.user_has_client_slug_access(c.slug);

-- ─────────────────────────────────────────────
-- 3. Sinais · os touchpoints de WhatsApp
-- ─────────────────────────────────────────────
-- Um sinal por linha: data, assunto, categoria, sentimento. Sem trecho, sem autor.

CREATE OR REPLACE VIEW infotrafego_ecossistema.cs_escuta_sinais
WITH (security_barrier = true) AS
SELECT s.id,
       c.slug         AS client_slug,
       c.display_name AS cliente,
       g.rotulo       AS grupo,
       s.dia,
       s.scanned_at,
       s.categoria,
       s.sentimento,
       s.urgencia,
       s.autor_papel,
       s.assunto,
       s.virou_subtarefa
  FROM ai_team.escuta_sinal s
  JOIN ai_team.clients c ON c.id = s.client_id
  LEFT JOIN ai_team.escuta_grupo g ON g.group_jid = s.group_jid
 WHERE c.slug NOT IN ('infotrafego', 'renova-industria')
   AND infotrafego_ecossistema.user_has_client_slug_access(c.slug);

-- ─────────────────────────────────────────────
-- 4. Série diária · volume por categoria e sentimento
-- ─────────────────────────────────────────────
-- Dois sentimentos, porque medem coisas diferentes:
--   * `sentimento_cliente`: média (-2..2) dos sinais escritos pelo cliente —
--     só existe em dia com sinal;
--   * `sentimento_resumo`: o tom geral do dia no resumo (positivo=1, neutro e
--     misto=0, negativo=-1), média entre os grupos do cliente — existe em todo
--     dia com conversa, é o que dá continuidade à tendência.

CREATE OR REPLACE VIEW infotrafego_ecossistema.cs_escuta_diaria
WITH (security_barrier = true) AS
WITH dias AS (
  SELECT d.client_id,
         d.dia,
         count(*)::int AS grupos_com_conversa,
         round(avg(CASE d.resumo->>'sentimento_geral'
                     WHEN 'positivo' THEN 1
                     WHEN 'neutro'   THEN 0
                     WHEN 'misto'    THEN 0
                     WHEN 'negativo' THEN -1
                   END), 2) AS sentimento_resumo
    FROM ai_team.escuta_dia d
   WHERE d.client_id IS NOT NULL
   GROUP BY d.client_id, d.dia
), sinais AS (
  SELECT s.client_id,
         s.dia,
         count(*)::int                                          AS sinais,
         (count(*) FILTER (WHERE s.categoria = 'DEMANDA'))::int      AS demandas,
         (count(*) FILTER (WHERE s.categoria = 'ERRO'))::int         AS erros,
         (count(*) FILTER (WHERE s.categoria = 'INSATISFACAO'))::int AS insatisfacoes,
         (count(*) FILTER (WHERE s.categoria = 'ELOGIO'))::int       AS elogios,
         round(avg(s.sentimento) FILTER (WHERE s.autor_papel = 'cliente'), 2) AS sentimento_cliente
    FROM ai_team.escuta_sinal s
   WHERE s.client_id IS NOT NULL
   GROUP BY s.client_id, s.dia
)
SELECT c.slug                         AS client_slug,
       c.display_name                 AS cliente,
       coalesce(d.dia, s.dia)         AS dia,
       coalesce(d.grupos_com_conversa, 0) AS grupos_com_conversa,
       coalesce(s.sinais, 0)          AS sinais,
       coalesce(s.demandas, 0)        AS demandas,
       coalesce(s.erros, 0)           AS erros,
       coalesce(s.insatisfacoes, 0)   AS insatisfacoes,
       coalesce(s.elogios, 0)         AS elogios,
       s.sentimento_cliente,
       d.sentimento_resumo
  FROM dias d
  FULL JOIN sinais s ON s.client_id = d.client_id AND s.dia = d.dia
  JOIN ai_team.clients c ON c.id = coalesce(d.client_id, s.client_id)
 WHERE c.slug NOT IN ('infotrafego', 'renova-industria')
   AND infotrafego_ecossistema.user_has_client_slug_access(c.slug);

-- ─────────────────────────────────────────────
-- 5. Pendências · do último resumo de cada grupo
-- ─────────────────────────────────────────────
-- O resumo é do dia (o modelo reescreve o do mesmo dia a cada varredura), então
-- "pendência aberta" = o que o último resumo do grupo listou. A tela mostra o
-- `dia` junto, para ninguém ler pendência de semana passada como de hoje.

CREATE OR REPLACE VIEW infotrafego_ecossistema.cs_escuta_pendencias
WITH (security_barrier = true) AS
WITH ultimo AS (
  SELECT DISTINCT ON (d.group_jid)
         d.group_jid, d.client_id, d.dia, d.resumo, d.updated_at
    FROM ai_team.escuta_dia d
    JOIN ai_team.escuta_grupo g ON g.group_jid = d.group_jid AND g.enabled
   WHERE d.resumo IS NOT NULL AND d.client_id IS NOT NULL
   ORDER BY d.group_jid, d.dia DESC
)
SELECT c.slug         AS client_slug,
       c.display_name AS cliente,
       g.rotulo       AS grupo,
       u.dia,
       u.updated_at   AS atualizado_em,
       p.lado,
       p.ordem::int   AS ordem,
       p.item
  FROM ultimo u
  JOIN ai_team.clients c ON c.id = u.client_id
  JOIN ai_team.escuta_grupo g ON g.group_jid = u.group_jid
 CROSS JOIN LATERAL (
         SELECT 'nossa'::text AS lado, e.ordinality AS ordem, e.value #>> '{}' AS item
           FROM jsonb_array_elements(
                  CASE WHEN jsonb_typeof(u.resumo->'pendencias_nossas') = 'array'
                       THEN u.resumo->'pendencias_nossas' ELSE '[]'::jsonb END
                ) WITH ORDINALITY e
         UNION ALL
         SELECT 'cliente'::text, e.ordinality, e.value #>> '{}'
           FROM jsonb_array_elements(
                  CASE WHEN jsonb_typeof(u.resumo->'pendencias_cliente') = 'array'
                       THEN u.resumo->'pendencias_cliente' ELSE '[]'::jsonb END
                ) WITH ORDINALITY e
       ) p
 WHERE nullif(btrim(p.item), '') IS NOT NULL
   AND c.slug NOT IN ('infotrafego', 'renova-industria')
   AND infotrafego_ecossistema.user_has_client_slug_access(c.slug);

-- ─────────────────────────────────────────────
-- 6. Grants · só leitura, só logado
-- ─────────────────────────────────────────────
-- O default do schema dá ALL a `authenticated` em "tabelas" novas (views
-- entram nessa conta). Como estas views rodam com o privilégio do dono, um
-- INSERT/UPDATE que o Postgres considerasse "auto-updatable" escreveria em
-- `ai_team`. Por isso o grant é refeito aqui: SELECT e nada mais.

REVOKE ALL ON infotrafego_ecossistema.cs_escuta_clientes   FROM PUBLIC, anon, authenticated, service_role;
REVOKE ALL ON infotrafego_ecossistema.cs_escuta_sinais     FROM PUBLIC, anon, authenticated, service_role;
REVOKE ALL ON infotrafego_ecossistema.cs_escuta_diaria     FROM PUBLIC, anon, authenticated, service_role;
REVOKE ALL ON infotrafego_ecossistema.cs_escuta_pendencias FROM PUBLIC, anon, authenticated, service_role;

GRANT SELECT ON infotrafego_ecossistema.cs_escuta_clientes   TO authenticated, service_role;
GRANT SELECT ON infotrafego_ecossistema.cs_escuta_sinais     TO authenticated, service_role;
GRANT SELECT ON infotrafego_ecossistema.cs_escuta_diaria     TO authenticated, service_role;
GRANT SELECT ON infotrafego_ecossistema.cs_escuta_pendencias TO authenticated, service_role;
