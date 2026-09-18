/**
 * Otimizador · avaliação das regras automáticas (Fase 2c · C3)
 *
 * Exemplo do briefing: "se CPC > R$ 3,50 por 3 dias → pausar ad set".
 *
 * A parte que exige cuidado é o "por 3 dias". Avaliar a média do período
 * esconde o caso que importa: um CPC de R$ 8 num dia e R$ 1 nos outros dois dá
 * média R$ 3,33 e não dispara, embora tenha havido um dia muito ruim. E o
 * inverso é pior — três dias medianos disparariam uma pausa por causa de uma
 * média puxada por um outlier.
 *
 * Então a regra casa quando a condição vale em CADA UM dos N dias da janela.
 * É a leitura literal de "por 3 dias" e a que o gestor espera.
 *
 * Puro: sem banco, sem Meta. Roda contra uma série e devolve o veredito.
 */

export type MetricaRegra =
  | 'cpc' | 'cpm' | 'ctr' | 'cpl' | 'cpmql' | 'spend' | 'frequencia' | 'conv_lm' | 'leads';

export type OperadorRegra = 'gt' | 'gte' | 'lt' | 'lte';

export interface Condicao {
  metrica: MetricaRegra;
  operador: OperadorRegra;
  valor: number;
}

export interface DiaDaEntidade {
  date: string;
  impressoes: number;
  cliques: number;
  spend: number;
  leads: number;
  mqls: number;
  frequencia?: number | null;
}

export interface Entidade {
  id: string;
  nome: string;
  tipo: 'campaign' | 'adset' | 'ad';
  dias: DiaDaEntidade[];
}

export interface RegraAvaliavel {
  id: string;
  nome: string;
  escopo: 'campaign' | 'adset' | 'ad';
  condicoes: Condicao[];
  operadorLogico: 'e' | 'ou';
  janelaDias: number;
  gastoMinimo: number;
  acao: 'pausar' | 'aumentar_orcamento' | 'reduzir_orcamento' | 'notificar';
}

export interface AlvoCasado {
  entidadeId: string;
  entidadeNome: string;
  /** Uma linha por condição, com o valor observado em cada dia da janela. */
  evidencia: Array<{ condicao: Condicao; valoresPorDia: Array<{ date: string; valor: number | null }> }>;
  gastoNaJanela: number;
  motivo: string;
}

export interface ResultadoAvaliacao {
  avaliados: number;
  casados: AlvoCasado[];
  /** Entidades descartadas antes da avaliação, e por quê. */
  descartados: Array<{ entidadeId: string; motivo: string }>;
}

const ROTULO_METRICA: Record<MetricaRegra, string> = {
  cpc: 'CPC',
  cpm: 'CPM',
  ctr: 'CTR',
  cpl: 'CPL',
  cpmql: 'CPMQL',
  spend: 'Investido',
  frequencia: 'Frequência',
  conv_lm: 'Conv L→M',
  leads: 'Leads',
};

const ROTULO_OPERADOR: Record<OperadorRegra, string> = {
  gt: '>',
  gte: '≥',
  lt: '<',
  lte: '≤',
};

/**
 * Valor de uma métrica num dia.
 *
 * `null` quando o denominador é zero — e `null` NUNCA casa uma condição.
 * Tratar "sem lead nenhum" como CPL infinito faria a regra "CPL > 50" pausar
 * justamente o ad que ainda não teve tempo de converter.
 */
export function valorNoDia(dia: DiaDaEntidade, metrica: MetricaRegra): number | null {
  switch (metrica) {
    case 'cpc': return dia.cliques > 0 ? dia.spend / dia.cliques : null;
    case 'cpm': return dia.impressoes > 0 ? (dia.spend / dia.impressoes) * 1000 : null;
    case 'ctr': return dia.impressoes > 0 ? dia.cliques / dia.impressoes : null;
    case 'cpl': return dia.leads > 0 ? dia.spend / dia.leads : null;
    case 'cpmql': return dia.mqls > 0 ? dia.spend / dia.mqls : null;
    case 'conv_lm': return dia.leads > 0 ? dia.mqls / dia.leads : null;
    case 'spend': return dia.spend;
    case 'leads': return dia.leads;
    case 'frequencia': return typeof dia.frequencia === 'number' ? dia.frequencia : null;
  }
}

function compara(valor: number, operador: OperadorRegra, alvo: number): boolean {
  switch (operador) {
    case 'gt': return valor > alvo;
    case 'gte': return valor >= alvo;
    case 'lt': return valor < alvo;
    case 'lte': return valor <= alvo;
  }
}

export function descreverCondicao(c: Condicao): string {
  const valor = c.metrica === 'ctr' || c.metrica === 'conv_lm'
    ? `${(c.valor * 100).toFixed(1)}%`
    : String(c.valor);
  return `${ROTULO_METRICA[c.metrica]} ${ROTULO_OPERADOR[c.operador]} ${valor}`;
}

export function descreverRegra(r: RegraAvaliavel): string {
  const juncao = r.operadorLogico === 'e' ? ' e ' : ' ou ';
  const acoes = {
    pausar: 'pausar',
    aumentar_orcamento: 'aumentar orçamento',
    reduzir_orcamento: 'reduzir orçamento',
    notificar: 'apenas notificar',
  };
  return `Se ${r.condicoes.map(descreverCondicao).join(juncao)} por ${r.janelaDias} dia(s) → ${acoes[r.acao]}`;
}

/**
 * Avalia a regra contra uma lista de entidades.
 *
 * Duas guardas antes de qualquer comparação, ambas para não agir sobre ruído:
 *   · a entidade precisa ter a janela COMPLETA de dias com entrega;
 *   · e ter gasto pelo menos `gastoMinimo` nessa janela.
 * Sem elas, um ad que rodou meio dia com R$ 3 poderia ser pausado por um CPC
 * calculado sobre dois cliques.
 */
export function avaliarRegra(regra: RegraAvaliavel, entidades: Entidade[]): ResultadoAvaliacao {
  const casados: AlvoCasado[] = [];
  const descartados: ResultadoAvaliacao['descartados'] = [];
  let avaliados = 0;

  for (const entidade of entidades) {
    if (entidade.tipo !== regra.escopo) continue;

    const comEntrega = [...entidade.dias]
      .filter((d) => d.impressoes > 0 || d.spend > 0)
      .sort((a, b) => a.date.localeCompare(b.date));

    if (comEntrega.length < regra.janelaDias) {
      descartados.push({
        entidadeId: entidade.id,
        motivo: `só ${comEntrega.length} dia(s) com entrega; a regra exige ${regra.janelaDias}.`,
      });
      continue;
    }

    const janela = comEntrega.slice(-regra.janelaDias);
    const gastoNaJanela = janela.reduce((s, d) => s + d.spend, 0);

    if (gastoNaJanela < regra.gastoMinimo) {
      descartados.push({
        entidadeId: entidade.id,
        motivo: `gastou ${gastoNaJanela.toFixed(2)} na janela; o mínimo da regra é ${regra.gastoMinimo}.`,
      });
      continue;
    }

    avaliados++;

    const evidencia = regra.condicoes.map((condicao) => ({
      condicao,
      valoresPorDia: janela.map((d) => ({ date: d.date, valor: valorNoDia(d, condicao.metrica) })),
    }));

    // Condição só é satisfeita se valer em TODOS os dias da janela.
    const satisfeitas = evidencia.map((e) =>
      e.valoresPorDia.every(
        (v) => v.valor !== null && compara(v.valor, e.condicao.operador, e.condicao.valor),
      ),
    );

    const casou =
      regra.operadorLogico === 'e' ? satisfeitas.every(Boolean) : satisfeitas.some(Boolean);

    if (!casou) continue;

    const condicoesQueCasaram = regra.condicoes.filter((_, i) => satisfeitas[i]);
    casados.push({
      entidadeId: entidade.id,
      entidadeNome: entidade.nome,
      evidencia,
      gastoNaJanela,
      motivo: `${condicoesQueCasaram.map(descreverCondicao).join(' e ')} em todos os ${regra.janelaDias} dia(s) da janela.`,
    });
  }

  return { avaliados, casados, descartados };
}

/** Regras prontas, para o gestor partir de algo em vez de uma tela em branco. */
export const MODELOS_DE_REGRA: Array<{
  nome: string;
  escopo: RegraAvaliavel['escopo'];
  condicoes: Condicao[];
  operadorLogico: 'e' | 'ou';
  janelaDias: number;
  gastoMinimo: number;
  acao: RegraAvaliavel['acao'];
  descricao: string;
}> = [
  {
    nome: 'CPC alto por 3 dias → pausar ad set',
    escopo: 'adset',
    condicoes: [{ metrica: 'cpc', operador: 'gt', valor: 3.5 }],
    operadorLogico: 'e',
    janelaDias: 3,
    gastoMinimo: 100,
    acao: 'pausar',
    descricao: 'O exemplo do briefing. Corta público que ficou caro antes de queimar o mês.',
  },
  {
    nome: 'Criativo saturado → pausar',
    escopo: 'ad',
    condicoes: [
      { metrica: 'frequencia', operador: 'gt', valor: 3.5 },
      { metrica: 'ctr', operador: 'lt', valor: 0.008 },
    ],
    operadorLogico: 'e',
    janelaDias: 3,
    gastoMinimo: 150,
    acao: 'pausar',
    descricao: 'Frequência alta COM CTR baixo: o público já viu e parou de responder.',
  },
  {
    nome: 'CPL acima da meta → reduzir orçamento',
    escopo: 'adset',
    condicoes: [{ metrica: 'cpl', operador: 'gt', valor: 60 }],
    operadorLogico: 'e',
    janelaDias: 3,
    gastoMinimo: 200,
    acao: 'reduzir_orcamento',
    descricao: 'Reduz em vez de pausar: mantém aprendizado enquanto contém o custo.',
  },
  {
    nome: 'Campeão barato → escalar',
    escopo: 'adset',
    condicoes: [
      { metrica: 'cpl', operador: 'lt', valor: 28 },
      { metrica: 'leads', operador: 'gte', valor: 3 },
    ],
    operadorLogico: 'e',
    janelaDias: 3,
    gastoMinimo: 150,
    acao: 'aumentar_orcamento',
    descricao: 'CPL baixo com volume que sustenta — os dois juntos, nunca só o CPL.',
  },
  {
    nome: 'Gastou sem lead → notificar',
    escopo: 'ad',
    condicoes: [
      { metrica: 'leads', operador: 'lte', valor: 0 },
      { metrica: 'spend', operador: 'gte', valor: 50 },
    ],
    operadorLogico: 'e',
    janelaDias: 2,
    gastoMinimo: 100,
    acao: 'notificar',
    descricao: 'Avisa sem agir: pode ser problema de rastreamento, não de criativo.',
  },
];
