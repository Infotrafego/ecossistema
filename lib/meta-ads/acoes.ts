/**
 * Catálogo das ações da action toolbar (Fase 2b)
 *
 * Declarativo de propósito: a UI monta os botões a partir daqui e o executor
 * valida contra a mesma lista. Botão que existe na tela mas não no catálogo
 * não executa, e ação no catálogo que a tela não mostra continua acessível ao
 * assistente de IA (2c) — que é exatamente o que se quer, já que o assistente
 * executa através deste mesmo caminho.
 *
 * Puro: sem React, sem fetch. Serve ao componente e ao Route Handler.
 */

export type EscopoAcao = 'campanhas' | 'publicos' | 'criativos' | 'otimizacoes';

export type AcaoId =
  // Campanhas (6)
  | 'campanha.criar'
  | 'campanha.editar'
  | 'campanha.pausar'
  | 'campanha.duplicar'
  | 'campanha.aumentar_orcamento'
  | 'campanha.reduzir_orcamento'
  // Públicos (5)
  | 'publico.criar'
  | 'publico.editar'
  | 'publico.otimizar_ia'
  | 'publico.duplicar'
  | 'publico.arquivar'
  // Criativos (6)
  | 'criativo.criar'
  | 'criativo.pausar'
  | 'criativo.escalar_verba'
  | 'criativo.duplicar'
  | 'criativo.solicitar_variacao'
  | 'criativo.editar'
  // Otimizações (3)
  | 'otimizacao.aplicar'
  | 'otimizacao.ignorar'
  | 'otimizacao.lembrar';

export interface DefinicaoAcao {
  id: AcaoId;
  escopo: EscopoAcao;
  icone: string;
  rotulo: string;
  tom?: 'primary' | 'danger' | 'scale';
  /** Ação precisa de um item selecionado na lista. */
  exigeSelecao: boolean;
  /**
   * Destrutiva = muda entrega ou verba de uma conta real. Passa por modal de
   * confirmação, sem exceção (critério de pronto da 2b).
   */
  destrutiva: boolean;
  /** Entidade da Meta que a ação toca. */
  entidade: 'campaign' | 'adset' | 'ad' | 'creative' | 'audience';
  /** Ajuste percentual de orçamento, quando aplicável. */
  percentual?: number;
  /** Ação que não chama a Meta: resolve no app ou gera sugestão de IA. */
  local?: boolean;
  descricao: string;
}

export const ACOES: DefinicaoAcao[] = [
  // ── Campanhas ───────────────────────────────────────────────────
  {
    id: 'campanha.criar', escopo: 'campanhas', icone: '＋', rotulo: 'Nova campanha',
    tom: 'primary', exigeSelecao: false, destrutiva: false, entidade: 'campaign',
    descricao: 'Cria a campanha PAUSADA, pra revisão antes de entrar no ar.',
  },
  {
    id: 'campanha.editar', escopo: 'campanhas', icone: '✎', rotulo: 'Editar selecionada',
    exigeSelecao: true, destrutiva: false, entidade: 'campaign',
    descricao: 'Renomeia a campanha.',
  },
  {
    id: 'campanha.pausar', escopo: 'campanhas', icone: '⏸', rotulo: 'Pausar',
    tom: 'danger', exigeSelecao: true, destrutiva: true, entidade: 'campaign',
    descricao: 'Interrompe a entrega da campanha e de tudo abaixo dela.',
  },
  {
    id: 'campanha.duplicar', escopo: 'campanhas', icone: '⎘', rotulo: 'Duplicar',
    exigeSelecao: true, destrutiva: false, entidade: 'campaign',
    descricao: 'Copia a campanha com os ad sets, em estado pausado.',
  },
  {
    id: 'campanha.aumentar_orcamento', escopo: 'campanhas', icone: '↑', rotulo: 'Aumentar orçamento',
    tom: 'scale', exigeSelecao: true, destrutiva: true, entidade: 'campaign', percentual: 30,
    descricao: 'Sobe o orçamento diário em 30%.',
  },
  {
    id: 'campanha.reduzir_orcamento', escopo: 'campanhas', icone: '↓', rotulo: 'Reduzir orçamento',
    exigeSelecao: true, destrutiva: true, entidade: 'campaign', percentual: -30,
    descricao: 'Reduz o orçamento diário em 30%.',
  },

  // ── Públicos (ad sets) ──────────────────────────────────────────
  {
    id: 'publico.criar', escopo: 'publicos', icone: '＋', rotulo: 'Novo público',
    tom: 'primary', exigeSelecao: false, destrutiva: false, entidade: 'adset',
    descricao: 'Cria um ad set pausado dentro de uma campanha existente.',
  },
  {
    id: 'publico.editar', escopo: 'publicos', icone: '✎', rotulo: 'Editar',
    exigeSelecao: true, destrutiva: false, entidade: 'adset',
    descricao: 'Renomeia o ad set.',
  },
  {
    id: 'publico.otimizar_ia', escopo: 'publicos', icone: '⚡', rotulo: 'Otimizar (IA)',
    tom: 'scale', exigeSelecao: true, destrutiva: false, entidade: 'adset', local: true,
    descricao: 'Analisa saturação e sugere ajuste — sugestão, não aplica nada sozinho.',
  },
  {
    id: 'publico.duplicar', escopo: 'publicos', icone: '⎘', rotulo: 'Duplicar',
    exigeSelecao: true, destrutiva: false, entidade: 'adset',
    descricao: 'Copia o ad set com o mesmo targeting, pausado.',
  },
  {
    id: 'publico.arquivar', escopo: 'publicos', icone: '🗑', rotulo: 'Arquivar',
    tom: 'danger', exigeSelecao: true, destrutiva: true, entidade: 'adset',
    descricao: 'Arquiva o ad set. Sai da conta ativa, mas o histórico permanece.',
  },

  // ── Criativos (ads) ─────────────────────────────────────────────
  {
    id: 'criativo.criar', escopo: 'criativos', icone: '＋', rotulo: 'Novo criativo',
    tom: 'primary', exigeSelecao: false, destrutiva: false, entidade: 'ad',
    descricao: 'Cria o anúncio pausado a partir de um criativo existente.',
  },
  {
    id: 'criativo.pausar', escopo: 'criativos', icone: '⏸', rotulo: 'Pausar selecionado',
    tom: 'danger', exigeSelecao: true, destrutiva: true, entidade: 'ad',
    descricao: 'Interrompe a entrega do anúncio.',
  },
  {
    id: 'criativo.escalar_verba', escopo: 'criativos', icone: '↑', rotulo: 'Escalar verba',
    tom: 'scale', exigeSelecao: true, destrutiva: true, entidade: 'ad', percentual: 30,
    descricao: 'Sobe 30% no orçamento do ad set que entrega este criativo.',
  },
  {
    id: 'criativo.duplicar', escopo: 'criativos', icone: '⎘', rotulo: 'Duplicar',
    exigeSelecao: true, destrutiva: false, entidade: 'ad',
    descricao: 'Copia o anúncio, pausado.',
  },
  {
    id: 'criativo.solicitar_variacao', escopo: 'criativos', icone: '🔁', rotulo: 'Solicitar variação',
    exigeSelecao: true, destrutiva: false, entidade: 'ad', local: true,
    descricao: 'Gera variações de copy com IA a partir deste criativo.',
  },
  {
    id: 'criativo.editar', escopo: 'criativos', icone: '✎', rotulo: 'Editar',
    exigeSelecao: true, destrutiva: false, entidade: 'ad',
    descricao: 'Renomeia o anúncio.',
  },

  // ── Otimizações ─────────────────────────────────────────────────
  {
    id: 'otimizacao.aplicar', escopo: 'otimizacoes', icone: '✓', rotulo: 'Aplicar sugestão',
    tom: 'primary', exigeSelecao: true, destrutiva: true, entidade: 'ad',
    descricao: 'Executa a ação recomendada no alvo da sugestão.',
  },
  {
    id: 'otimizacao.ignorar', escopo: 'otimizacoes', icone: '✕', rotulo: 'Ignorar',
    exigeSelecao: true, destrutiva: false, entidade: 'ad', local: true,
    descricao: 'Descarta a sugestão no período atual.',
  },
  {
    id: 'otimizacao.lembrar', escopo: 'otimizacoes', icone: '⏰', rotulo: 'Lembrar depois',
    exigeSelecao: true, destrutiva: false, entidade: 'ad', local: true,
    descricao: 'Adia a sugestão para a próxima revisão.',
  },
];

const POR_ID = new Map(ACOES.map((a) => [a.id, a]));

export function acaoPorId(id: string): DefinicaoAcao | undefined {
  return POR_ID.get(id as AcaoId);
}

export function acoesDoEscopo(escopo: EscopoAcao): DefinicaoAcao[] {
  return ACOES.filter((a) => a.escopo === escopo);
}

export const ROTULO_ESCOPO: Record<EscopoAcao, string> = {
  campanhas: 'Ações de campanha',
  publicos: 'Ações de público',
  criativos: 'Ações de criativo',
  otimizacoes: 'Ações de otimização',
};
