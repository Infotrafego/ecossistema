/**
 * KPIs derivados da config do funil
 *
 * O BRIEFING_01 exige que a linha de KPIs venha do par `familia.sub_objetivo`,
 * não de uma lista fixa: um funil de distribuição não tem CPL, e um de venda
 * direta não tem MQL.
 *
 * ⚠ ASSUNÇÃO A CONFIRMAR COM O PABLO: o briefing tem uma tabela
 * "Sub-objetivos por família + KPI primário" que está no Drive, não no repo.
 * O mapa abaixo foi derivado da própria definição de cada sub-objetivo
 * (`SUBOBJETIVOS` em lib/funil.ts) e do que o mockup mostra por família
 * (renderModularCone). Quando a tabela estiver à mão, conferir linha a linha —
 * a estrutura já está pronta, muda só o conteúdo de `KPIS_POR_SUBOBJETIVO`.
 */

import type { EtapaId, Familia, SubObjetivo } from '@/lib/funil';

/** Métrica derivada que não é uma etapa do funil. */
export type MetricaDerivada = 'spend' | 'ctr' | 'cpc' | 'cpm' | 'receita' | 'roas' | 'cac' | 'ltv';

export interface DefinicaoKpi {
  /** Etapa do funil (volume) ou métrica derivada. */
  fonte: { tipo: 'etapa'; etapa: EtapaId } | { tipo: 'derivada'; metrica: MetricaDerivada };
  label: string;
  /** Custo por unidade desta etapa — rende o "CPx" ao lado do volume. */
  custoPorEtapa?: EtapaId;
  formato: 'numero' | 'moeda' | 'percentual' | 'multiplo';
  /** Marca o KPI primário do funil: é ele que abre a linha e recebe destaque. */
  primario?: boolean;
  /** `true` quando o número é projeção por benchmark, não dado de mídia. */
  projecao?: boolean;
}

const etapa = (e: EtapaId, label: string, extra: Partial<DefinicaoKpi> = {}): DefinicaoKpi => ({
  fonte: { tipo: 'etapa', etapa: e },
  label,
  formato: 'numero',
  ...extra,
});

const custo = (e: EtapaId, label: string, extra: Partial<DefinicaoKpi> = {}): DefinicaoKpi => ({
  fonte: { tipo: 'etapa', etapa: e },
  label,
  custoPorEtapa: e,
  formato: 'moeda',
  ...extra,
});

const derivada = (
  m: MetricaDerivada,
  label: string,
  formato: DefinicaoKpi['formato'],
  extra: Partial<DefinicaoKpi> = {},
): DefinicaoKpi => ({ fonte: { tipo: 'derivada', metrica: m }, label, formato, ...extra });

/**
 * KPIs por sub-objetivo. O primeiro item com `primario: true` é o KPI que o
 * briefing chama de "KPI primário" daquele funil.
 */
const KPIS_POR_SUBOBJETIVO: Record<SubObjetivo, DefinicaoKpi[]> = {
  // ── Distribuição · sem comercial: o que importa é audiência e custo dela ──
  c1_atracao: [
    etapa('seguidores', 'Novos seguidores', { primario: true }),
    custo('seguidores', 'Custo por seguidor'),
    etapa('alcance', 'Alcance'),
    etapa('visita_perfil', 'Visitas ao perfil'),
    etapa('engajamento', 'Engajamento'),
    derivada('cpm', 'CPM', 'moeda'),
  ],
  c2_nutricao: [
    etapa('vv_75', 'Video View 75%', { primario: true }),
    custo('vv_75', 'Custo por VV75'),
    etapa('vv_complete', 'Video View 100%'),
    etapa('save', 'Salvamentos'),
    etapa('compartilhamento', 'Compartilhamentos'),
    derivada('ctr', 'CTR', 'percentual'),
  ],
  c3_levantada: [
    etapa('mensagens', 'Conversas iniciadas', { primario: true }),
    custo('mensagens', 'Custo por conversa'),
    etapa('engajamento', 'Engajamento'),
    etapa('clique', 'Cliques'),
    derivada('cpc', 'CPC', 'moeda'),
    derivada('spend', 'Investido', 'moeda'),
  ],

  // ── Captação · o funil termina no comercial ──────────────────────────────
  sessao_estrategica: [
    etapa('aplicacao_completa', 'Aplicações', { primario: true }),
    custo('aplicacao_completa', 'CPApl'),
    etapa('mql', 'MQLs'),
    custo('mql', 'CPMQL'),
    etapa('agendamento', 'Reuniões agendadas'),
    custo('agendamento', 'CRA'),
    etapa('venda', 'Vendas', { projecao: true }),
    derivada('cac', 'CAC', 'moeda', { projecao: true }),
  ],
  aplicacao_direta: [
    etapa('aplicacao_completa', 'Aplicações', { primario: true }),
    custo('aplicacao_completa', 'CPApl'),
    etapa('mql', 'MQLs'),
    custo('mql', 'CPMQL'),
    etapa('agendamento', 'Agendamentos'),
    derivada('cac', 'CAC', 'moeda', { projecao: true }),
  ],
  webinario_gratuito: [
    etapa('inscricao_evento', 'Inscrições', { primario: true }),
    custo('inscricao_evento', 'Custo por inscrição'),
    etapa('evento_ao_vivo', 'Presença ao vivo'),
    etapa('replay', 'Replay'),
    etapa('venda', 'Vendas', { projecao: true }),
    derivada('roas', 'ROAS', 'multiplo', { projecao: true }),
  ],
  webinario_pago: [
    etapa('inscricao_evento', 'Ingressos', { primario: true }),
    custo('inscricao_evento', 'Custo por ingresso'),
    etapa('confirmacao_evento', 'Confirmados'),
    etapa('evento_ao_vivo', 'Presença ao vivo'),
    etapa('venda', 'Vendas', { projecao: true }),
    derivada('roas', 'ROAS', 'multiplo'),
  ],
  isca_digital: [
    etapa('lead', 'Leads', { primario: true }),
    custo('lead', 'CPL'),
    etapa('lead_magnet', 'Downloads'),
    etapa('mql', 'MQLs'),
    custo('mql', 'CPMQL'),
    derivada('ctr', 'CTR', 'percentual'),
  ],

  // ── Venda direta · o funil termina no checkout ───────────────────────────
  produto_digital: [
    etapa('compra', 'Compras', { primario: true }),
    custo('compra', 'CPA'),
    derivada('receita', 'Receita', 'moeda'),
    derivada('roas', 'ROAS', 'multiplo'),
    etapa('checkout_iniciado', 'Checkouts'),
    etapa('vis_produto', 'Visualizações'),
  ],
  produto_fisico: [
    etapa('compra', 'Compras', { primario: true }),
    custo('compra', 'CPA'),
    derivada('receita', 'Receita', 'moeda'),
    derivada('roas', 'ROAS', 'multiplo'),
    etapa('add_carrinho', 'Carrinhos'),
    etapa('checkout_iniciado', 'Checkouts'),
  ],
  aumento_base: [
    derivada('receita', 'Receita', 'moeda', { primario: true }),
    derivada('roas', 'ROAS', 'multiplo'),
    etapa('compra', 'Compras'),
    custo('compra', 'CPA'),
    derivada('ltv', 'LTV', 'moeda', { projecao: true }),
    derivada('spend', 'Investido', 'moeda'),
  ],

  // ── Lançamento · CPL na captação, receita na janela de carrinho ──────────
  lancamento_semente: [
    etapa('lead', 'Leads', { primario: true }),
    custo('lead', 'CPL'),
    etapa('venda', 'Vendas'),
    derivada('receita', 'Receita', 'moeda'),
    derivada('roas', 'ROAS', 'multiplo'),
    derivada('spend', 'Investido', 'moeda'),
  ],
  lancamento_tradicional_3wb: [
    etapa('lead', 'Leads', { primario: true }),
    custo('lead', 'CPL'),
    etapa('aquecimento_view', 'Aulas assistidas'),
    etapa('carrinho_aberto', 'Carrinho'),
    etapa('venda', 'Vendas'),
    derivada('roas', 'ROAS', 'multiplo'),
  ],
  lancamento_pago: [
    etapa('inscricao_evento', 'Ingressos', { primario: true }),
    custo('inscricao_evento', 'Custo por ingresso'),
    etapa('evento_ao_vivo', 'Presença'),
    etapa('venda', 'Vendas'),
    derivada('receita', 'Receita', 'moeda'),
    derivada('roas', 'ROAS', 'multiplo'),
  ],
};

/** Fallback quando o funil ainda não tem sub-objetivo definido. */
const KPIS_POR_FAMILIA: Record<Familia, DefinicaoKpi[]> = {
  distribuicao: KPIS_POR_SUBOBJETIVO.c1_atracao,
  captacao: KPIS_POR_SUBOBJETIVO.isca_digital,
  venda_direta: KPIS_POR_SUBOBJETIVO.produto_digital,
  lancamento: KPIS_POR_SUBOBJETIVO.lancamento_semente,
};

/**
 * KPIs de um funil.
 *
 * Filtra pelo que o funil realmente mede: um funil de captação sem a etapa
 * `agendamento` não deve mostrar um card de agendamentos zerado, porque zero
 * aqui significaria "não medimos", e o gestor leria como "não aconteceu".
 * Métricas derivadas (ROAS, CAC, investido) passam sempre — elas existem em
 * qualquer funil que gaste verba.
 */
export function kpisDoFunil(
  familia: Familia | null,
  subObjetivo: SubObjetivo | null,
  etapasDoFunil: EtapaId[],
): DefinicaoKpi[] {
  const base = subObjetivo
    ? KPIS_POR_SUBOBJETIVO[subObjetivo]
    : familia
      ? KPIS_POR_FAMILIA[familia]
      : [];

  const disponiveis = new Set(etapasDoFunil);
  return base.filter((kpi) => kpi.fonte.tipo === 'derivada' || disponiveis.has(kpi.fonte.etapa));
}

/**
 * Qual distribuição a Visão Geral mostra, por família (regra A5 do prompt).
 * `lancamento` acompanha `captacao` porque o eixo relevante nos dois é a
 * temperatura do público, não o formato nem o posicionamento.
 */
export type EixoDistribuicao = 'temperatura' | 'placement' | 'formato';

export function eixoDeDistribuicao(familia: Familia | null): EixoDistribuicao {
  switch (familia) {
    case 'venda_direta':
      return 'placement';
    case 'distribuicao':
      return 'formato';
    case 'captacao':
    case 'lancamento':
      return 'temperatura';
    default:
      return 'temperatura';
  }
}

export const ROTULO_EIXO: Record<EixoDistribuicao, string> = {
  temperatura: 'Distribuição por temperatura · frio × quente',
  placement: 'Distribuição por posicionamento e dispositivo',
  formato: 'Distribuição por formato',
};
