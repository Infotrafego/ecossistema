-- ═══════════════════════════════════════════════════════════════
-- Taxonomia do funil modular · alinha o banco ao BRIEFING_01
-- ═══════════════════════════════════════════════════════════════
-- Schema: infotrafego_ecossistema
--
-- PROBLEMA QUE ESTA MIGRATION RESOLVE
-- O CHECK de `funis.modo_captura` criado na migration inicial usava um
-- vocabulário ('form_meta', 'landing', 'whatsapp', 'quiz', 'webinario') que
-- NÃO coincide com nenhum valor da taxonomia do código (lib/funil.ts, que
-- segue o BRIEFING_01). Resultado: todo INSERT vindo do Construtor de Funil
-- falharia com violação de CHECK. O briefing é a fonte canônica, então o banco
-- é que se move.
--
-- Também normaliza:
--   · `sub_objetivo`, que era texto livre (o seed gravou 'Conversão');
--   · os ids de etapa gravados em `etapas`/`marcador_mkt`/`marcador_com`,
--     que no seed usavam um terceiro vocabulário ('impression', 'form_completo',
--     'contrato_assinado'…).
--
-- A partir daqui os CHECKs amarram a tabela à taxonomia do TypeScript: qualquer
-- id novo em lib/funil.ts exige nova migration.
-- Author: Pablo + Claude · 2026-09-18

-- ─────────────────────────────────────────────
-- 1. Remove os CHECKs antigos antes de tocar nos dados
-- ─────────────────────────────────────────────
-- Os dados atuais violam os CHECKs novos E o antigo viola os dados novos, então
-- a ordem é: soltar → migrar → reamarrar.

ALTER TABLE infotrafego_ecossistema.funis
  DROP CONSTRAINT IF EXISTS funis_modo_captura_check;

-- ─────────────────────────────────────────────
-- 2. Migra os valores existentes
-- ─────────────────────────────────────────────

-- 2a · modo_captura: vocabulário antigo → taxonomia do briefing.
-- 'quiz' e 'webinario' não são modos de captura na taxonomia nova (são
-- sub-objetivos); ambos passam por landing page, então viram 'landing_page'.
UPDATE infotrafego_ecossistema.funis SET modo_captura = CASE modo_captura
  WHEN 'form_meta'  THEN 'formulario_nativo'
  WHEN 'landing'    THEN 'landing_page'
  WHEN 'whatsapp'   THEN 'click_to_whatsapp'
  WHEN 'quiz'       THEN 'landing_page'
  WHEN 'webinario'  THEN 'landing_page'
  ELSE modo_captura
END
WHERE modo_captura IN ('form_meta', 'landing', 'whatsapp', 'quiz', 'webinario');

-- 2b · sub_objetivo: o seed gravou o rótulo livre 'Conversão'. O único funil
-- existente é o de aquisição da Infotráfego (aplicação → MQL → reunião → venda),
-- que na taxonomia é sessão estratégica.
UPDATE infotrafego_ecossistema.funis
SET sub_objetivo = 'sessao_estrategica'
WHERE sub_objetivo NOT IN (
  'c1_atracao', 'c2_nutricao', 'c3_levantada',
  'sessao_estrategica', 'aplicacao_direta', 'webinario_gratuito', 'webinario_pago', 'isca_digital',
  'produto_digital', 'produto_fisico', 'aumento_base',
  'lancamento_semente', 'lancamento_tradicional_3wb', 'lancamento_pago'
);

-- 2c · ids de etapa: reescreve o array `etapas` elemento a elemento e os dois
-- marcadores pelo mesmo mapa. Cobre tanto o vocabulário do seed quanto os ids
-- que o lib/funil.ts tinha inventado antes desta reconciliação.
CREATE OR REPLACE FUNCTION infotrafego_ecossistema.__map_etapa_legada(p_id text)
RETURNS text
LANGUAGE sql IMMUTABLE
AS $$
  SELECT CASE p_id
    -- vocabulário do seed inicial
    WHEN 'impression'         THEN 'impressao'
    WHEN 'click'              THEN 'clique'
    WHEN 'form_completo'      THEN 'aplicacao_completa'
    WHEN 'reuniao_agendada'   THEN 'agendamento'
    WHEN 'contrato_assinado'  THEN 'venda'
    -- ids que divergiam do briefing em lib/funil.ts
    WHEN 'salvamentos'        THEN 'save'
    WHEN 'reuniao_realizada'  THEN 'call_realizada'
    WHEN 'replay_view'        THEN 'replay'
    WHEN 'checkout'           THEN 'checkout_iniciado'
    ELSE p_id
  END;
$$;

UPDATE infotrafego_ecossistema.funis f
SET
  etapas = COALESCE((
    SELECT jsonb_agg(infotrafego_ecossistema.__map_etapa_legada(e.value) ORDER BY e.ord)
    FROM jsonb_array_elements_text(f.etapas) WITH ORDINALITY AS e(value, ord)
  ), '[]'::jsonb),
  marcador_mkt = infotrafego_ecossistema.__map_etapa_legada(f.marcador_mkt),
  marcador_com = infotrafego_ecossistema.__map_etapa_legada(f.marcador_com);

-- O seed marcava COM em 'lead_qualificado', que é etapa de marketing
-- qualificado (SQL), não o fim do comercial. Onde o funil tem venda, é ela que
-- fecha o comercial — é disso que sai o CAC no cone.
--
-- Os dois marcadores são corrigidos de forma INDEPENDENTE de propósito: o
-- funil piloto tem 'venda' mas não tem 'mql' (o seed usava 'form_completo',
-- que vira 'aplicacao_completa'), então uma condição única exigindo os dois
-- não dispararia e o COM continuaria errado.
UPDATE infotrafego_ecossistema.funis
SET marcador_com = 'venda'
WHERE etapas ? 'venda'
  AND marcador_com IS DISTINCT FROM 'venda';

-- MKT termina na etapa qualificada mais avançada que o funil realmente mede.
UPDATE infotrafego_ecossistema.funis
SET marcador_mkt = 'mql'
WHERE etapas ? 'mql'
  AND marcador_mkt IS DISTINCT FROM 'mql';

DROP FUNCTION infotrafego_ecossistema.__map_etapa_legada(text);

-- ─────────────────────────────────────────────
-- 3. Reamarra os CHECKs · agora contra a taxonomia canônica
-- ─────────────────────────────────────────────

ALTER TABLE infotrafego_ecossistema.funis DROP CONSTRAINT IF EXISTS funis_modo_captura_check;
ALTER TABLE infotrafego_ecossistema.funis
  ADD CONSTRAINT funis_modo_captura_check CHECK (modo_captura IN (
    'landing_page', 'formulario_nativo', 'click_to_whatsapp', 'instagram_dm', 'multi'
  ));

ALTER TABLE infotrafego_ecossistema.funis DROP CONSTRAINT IF EXISTS funis_sub_objetivo_check;
ALTER TABLE infotrafego_ecossistema.funis
  ADD CONSTRAINT funis_sub_objetivo_check CHECK (sub_objetivo IN (
    'c1_atracao', 'c2_nutricao', 'c3_levantada',
    'sessao_estrategica', 'aplicacao_direta', 'webinario_gratuito', 'webinario_pago', 'isca_digital',
    'produto_digital', 'produto_fisico', 'aumento_base',
    'lancamento_semente', 'lancamento_tradicional_3wb', 'lancamento_pago'
  ));

-- `etapas` é um array jsonb de ids. O operador `<@` (contido em) valida o array
-- inteiro num único predicado imutável — dá pra usar em CHECK, ao contrário de
-- uma subquery com jsonb_array_elements.
ALTER TABLE infotrafego_ecossistema.funis DROP CONSTRAINT IF EXISTS funis_etapas_check;
ALTER TABLE infotrafego_ecossistema.funis
  ADD CONSTRAINT funis_etapas_check CHECK (etapas <@ '[
    "impressao", "alcance", "clique", "page_view",
    "vv_25", "vv_50", "vv_75", "vv_complete",
    "form_iniciado", "lead", "lead_magnet",
    "aplicacao_iniciada", "aplicacao_completa",
    "inscricao_evento", "confirmacao_evento", "evento_ao_vivo", "assistiu_evento", "replay",
    "mql",
    "lead_qualificado", "agendamento", "call_realizada", "no_show",
    "proposta_enviada", "venda",
    "vis_produto", "add_carrinho", "checkout_iniciado", "compra",
    "seguidores", "visita_perfil", "engajamento", "mensagens", "save", "compartilhamento",
    "aquecimento_view", "lembrete_view", "carrinho_aberto"
  ]'::jsonb);

-- Marcador tem que apontar pra uma etapa que existe no próprio funil — senão o
-- cone renderiza um pin órfão.
ALTER TABLE infotrafego_ecossistema.funis DROP CONSTRAINT IF EXISTS funis_marcador_mkt_check;
ALTER TABLE infotrafego_ecossistema.funis
  ADD CONSTRAINT funis_marcador_mkt_check
    CHECK (marcador_mkt IS NULL OR etapas ? marcador_mkt);

ALTER TABLE infotrafego_ecossistema.funis DROP CONSTRAINT IF EXISTS funis_marcador_com_check;
ALTER TABLE infotrafego_ecossistema.funis
  ADD CONSTRAINT funis_marcador_com_check
    CHECK (marcador_com IS NULL OR etapas ? marcador_com);

COMMENT ON COLUMN infotrafego_ecossistema.funis.etapas IS
  'Array jsonb de EtapaId (lib/funil.ts). Ordem canônica é a do cone. Mudança de vocabulário = nova migration.';
COMMENT ON COLUMN infotrafego_ecossistema.funis.modo_captura IS
  'ModoCaptura (lib/funil.ts): landing_page | formulario_nativo | click_to_whatsapp | instagram_dm | multi';
