/**
 * Monta o cone do funil a partir da config · regra A5 do BRIEFING_01
 *
 * O cone deixa de ser uma lista fixa de 8 etapas e passa a ser derivado:
 * as etapas vêm de `funil.etapas[]`, na ordem definida; os pins MKT/COM saem
 * de `marcador_mkt`/`marcador_com`; e `formulario_nativo` pula `page_view`
 * sozinho, porque formulário nativo da Meta não tem página pra visitar — a
 * etapa existiria sempre zerada e o gestor leria isso como queda de conversão.
 *
 * Puro: recebe config + total já agregado e devolve dados. Quem desenha é o
 * componente.
 */

import { ETAPAS, type ConfigFunil, type EtapaId } from '@/lib/funil';
import { custoPorEtapa, valorDaEtapa, type LinhaBruta, type Metricas } from '@/lib/intel';

export interface EtapaCone {
  id: EtapaId;
  label: string;
  valor: number;
  /** Conversão em relação à etapa anterior do cone. `null` na primeira. */
  taxa: number | null;
  /** Rótulo da taxa, no vocabulário da etapa (ex.: "Taxa de MQL"). */
  taxaLabel: string | null;
  /** Custo por unidade desta etapa. */
  custo: number | null;
  custoLabel: string;
  /** Meta da etapa, quando configurada no Construtor. */
  meta: number | null;
  marcadorMkt: boolean;
  marcadorCom: boolean;
  /** `true` quando o valor é projeção por benchmark, não dado de mídia. */
  projecao: boolean;
}

/**
 * Nome curto do custo por etapa, como o gestor fala.
 * Etapa sem apelido consagrado cai em "Custo por <etapa>".
 */
const APELIDO_CUSTO: Partial<Record<EtapaId, string>> = {
  impressao: 'CPM',
  clique: 'CPC',
  page_view: 'CPVP',
  lead: 'CPL',
  lead_magnet: 'CPL',
  aplicacao_completa: 'CPApl',
  mql: 'CPMQL',
  agendamento: 'CRA',
  call_realizada: 'CRR',
  venda: 'CAC',
  compra: 'CPA',
  inscricao_evento: 'CPI',
  mensagens: 'CPC conversa',
  seguidores: 'CPS',
};

/**
 * Etapas cujo valor, hoje, é projetado por benchmark e não medido.
 *
 * Enquanto o CRM não integra, a Meta não sabe se a reunião aconteceu nem se o
 * contrato fechou — só sabe que o lead entrou. Marcar isso é requisito: o
 * prompt é explícito em "não apresente projeção como dado real".
 */
const PROJETADAS: EtapaId[] = ['call_realizada', 'no_show', 'proposta_enviada', 'venda'];

function apelidoCusto(etapa: EtapaId): string {
  return APELIDO_CUSTO[etapa] ?? `Custo por ${ETAPAS[etapa].label}`;
}

/**
 * Etapas efetivas de um funil, já com as regras de captura aplicadas.
 * Exportada porque as tabelas dinâmicas precisam da MESMA lista do cone —
 * divergir aqui faria a tabela mostrar uma coluna que o cone não mostra.
 */
export function etapasEfetivas(config: Pick<ConfigFunil, 'etapas' | 'captura'>): EtapaId[] {
  if (config.captura === 'formulario_nativo') {
    return config.etapas.filter((e) => e !== 'page_view');
  }
  return [...config.etapas];
}

export interface OpcoesCone {
  /** Valores de etapa que o dado de mídia não traz e vêm de projeção. */
  projecoes?: Partial<Record<EtapaId, number>>;
}

/**
 * Constrói o cone.
 *
 * Etapa sem valor medido nem projetado vira 0 mas continua na lista: sumir com
 * ela mudaria a forma do funil e esconderia que aquela etapa não está sendo
 * medida — que é justamente o diagnóstico que o gestor precisa ver.
 */
export function montarCone(
  config: Pick<ConfigFunil, 'etapas' | 'captura' | 'marcadorMkt' | 'marcadorCom' | 'metas'>,
  total: LinhaBruta,
  opcoes: OpcoesCone = {},
): EtapaCone[] {
  const etapas = etapasEfetivas(config);
  const projecoes = opcoes.projecoes ?? {};

  let anterior: number | null = null;

  return etapas.map((id) => {
    const medido = valorDaEtapa(total, id);
    const projetado = projecoes[id] ?? null;
    const ehProjecao = medido === null && projetado !== null;
    const valor = medido ?? projetado ?? 0;

    const taxa = anterior !== null && anterior > 0 ? valor / anterior : null;
    anterior = valor;

    const custoMedido = custoPorEtapa(total, id);
    const custo = custoMedido ?? (valor > 0 ? total.spend / valor : null);

    return {
      id,
      label: ETAPAS[id].label,
      valor,
      taxa,
      taxaLabel: taxa === null ? null : `Taxa de ${ETAPAS[id].label}`,
      // CPM é por mil impressões, não por impressão.
      custo: id === 'impressao' && custo !== null ? custo * 1000 : custo,
      custoLabel: apelidoCusto(id),
      meta: config.metas?.[id] ?? null,
      marcadorMkt: config.marcadorMkt === id,
      marcadorCom: config.marcadorCom === id,
      projecao: ehProjecao || PROJETADAS.includes(id),
    };
  });
}

/**
 * Projeções por benchmark para as etapas comerciais.
 *
 * Só entra onde a mídia não mede. Reunião realizada = agendamentos × show rate;
 * venda = reuniões × close rate. Quando o CRM integrar, estas linhas somem e o
 * dado real entra por `stages`.
 */
export function projecoesComerciais(
  total: LinhaBruta,
  benchmarks: { showRate: number; closeRate: number },
): Partial<Record<EtapaId, number>> {
  const agendamentos = valorDaEtapa(total, 'agendamento') ?? 0;
  const reunioes = Math.round(agendamentos * benchmarks.showRate);
  return {
    call_realizada: reunioes,
    no_show: Math.max(0, agendamentos - reunioes),
    venda: Math.round(reunioes * benchmarks.closeRate),
  };
}

/** Cards do topo do cone, que mudam de significado conforme a família. */
export interface CardTopoCone {
  label: string;
  valor: string;
  sub: string;
  tom: 'receita' | 'neutro' | 'roas';
}

export function cardsDoTopo(
  familia: ConfigFunil['familia'],
  total: Metricas,
  fmt: { moeda: (v: number | null, d?: number) => string; num: (v: number | null) => string },
): CardTopoCone[] {
  const investido: CardTopoCone = {
    label: 'Investido',
    valor: fmt.moeda(total.spend, 0),
    sub: `${fmt.num(total.impressoes)} impressões`,
    tom: 'neutro',
  };

  if (familia === 'distribuicao') {
    const alcance = valorDaEtapa(total, 'alcance');
    const vvComplete = valorDaEtapa(total, 'vv_complete');
    return [
      { label: 'Alcance', valor: fmt.num(alcance), sub: 'audiência impactada', tom: 'receita' },
      investido,
      { label: 'VV completo', valor: fmt.num(vvComplete), sub: 'conteúdo consumido', tom: 'roas' },
    ];
  }

  if (familia === 'lancamento') {
    const inscritos = valorDaEtapa(total, 'inscricao_evento') ?? valorDaEtapa(total, 'lead');
    return [
      {
        label: 'Receita',
        valor: fmt.moeda(total.receita, 0),
        sub: `${fmt.num(total.vendas)} venda${total.vendas === 1 ? '' : 's'}`,
        tom: 'receita',
      },
      investido,
      { label: 'Inscritos', valor: fmt.num(inscritos), sub: 'base do evento', tom: 'roas' },
    ];
  }

  return [
    {
      label: 'Receita',
      valor: fmt.moeda(total.receita, 0),
      sub: `${fmt.num(total.vendas)} venda${total.vendas === 1 ? '' : 's'}${total.receitaEhReal ? '' : ' · projeção'}`,
      tom: 'receita',
    },
    investido,
    {
      label: 'ROAS',
      valor: total.roas === null ? '—' : `${total.roas.toFixed(2)}x`,
      sub: total.roas === null ? 'sem receita no período' : `cada R$ 1 → ${fmt.moeda(total.roas)}`,
      tom: 'roas',
    },
  ];
}
