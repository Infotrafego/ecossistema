-- ═══════════════════════════════════════════════════════════════
-- Seed inicial · Infotráfego como CLIENTE PILOTO
-- ═══════════════════════════════════════════════════════════════
-- Schema: infotrafego_ecossistema
-- Cliente piloto = a própria Infotráfego (auto-uso interno).
-- Funil = aquisição de novos clientes pra agência.
-- Após validar com Infotráfego, replicamos pros 7 clientes da agência.
-- ═══════════════════════════════════════════════════════════════

-- ─────────────────────────────────────────────
-- 1. Infotráfego como cliente piloto
-- ─────────────────────────────────────────────

INSERT INTO infotrafego_ecossistema.clients (id, name, slug, brand_color, meta_ad_account_id, active) VALUES
  (
    '00000000-0000-0000-0000-000000000001',
    'Infotráfego',
    'infotrafego',
    '#1A3D70',  -- Azul Via Central Profundo (cor oficial da marca)
    'act_PREENCHER',  -- BM da própria Infotráfego · atualizar com ID real
    true
  )
ON CONFLICT (id) DO NOTHING;

-- ─────────────────────────────────────────────
-- 2. Funil de aquisição da Infotráfego
-- ─────────────────────────────────────────────
-- Esse é o funil que capta NOVOS CLIENTES pra agência (CEO/gestor de marketing
-- que estão procurando agência de tráfego pago)

INSERT INTO infotrafego_ecossistema.funis (
  id, client_id, name, familia, sub_objetivo, modo_captura,
  etapas, marcador_mkt, marcador_com, metas
) VALUES
  (
    gen_random_uuid(),
    '00000000-0000-0000-0000-000000000001',
    'Infotráfego · Aquisição de Clientes',
    'captacao',
    'Conversão',
    'form_meta',
    '[
      "impression",
      "click",
      "page_view",
      "form_iniciado",
      "form_completo",
      "lead_qualificado",
      "reuniao_agendada",
      "reuniao_realizada",
      "proposta_enviada",
      "contrato_assinado"
    ]'::jsonb,
    'form_completo',
    'lead_qualificado',
    '{
      "leads_mes": 30,
      "reunioes_mes": 12,
      "vendas_mes": 3,
      "ticket_medio_mensal": 8000,
      "cpmql_alvo": 250,
      "ltv_alvo": 96000
    }'::jsonb
  )
ON CONFLICT DO NOTHING;

-- ─────────────────────────────────────────────
-- 3. Notas operacionais (Pablo)
-- ─────────────────────────────────────────────
--
-- ATENÇÃO: o cliente piloto é a PRÓPRIA INFOTRÁFEGO usando seu próprio funil
-- de aquisição. Validamos a plataforma com ele primeiro · depois replicamos
-- pros 7 clientes da agência (Carv Group · Kedma · Stella · Giulia · Cristina ·
-- Paula · Alex) via INSERTs adicionais ou pelo Construtor de Funil.
--
-- O meta_ad_account_id está como 'act_PREENCHER' · atualizar com o ID real do
-- BM da Infotráfego quando levantarmos com Mickael.
--
-- USUÁRIOS: o trigger `on_auth_user_created_infotrafego` (migração 00) cria
-- automaticamente o perfil em infotrafego_ecossistema.users quando o usuário é
-- criado no Supabase Auth (Dashboard → Authentication → Users). Depois:
--   1. Promover o admin:
--      UPDATE infotrafego_ecossistema.users SET global_role = 'admin'
--      WHERE email = 'mickael@infotrafego.com.br';
--   2. Associar ao cliente:
--      INSERT INTO infotrafego_ecossistema.client_members (client_id, user_id, role)
--      SELECT '00000000-0000-0000-0000-000000000001', id, 'gestor'
--      FROM infotrafego_ecossistema.users WHERE email = 'mickael@infotrafego.com.br';
