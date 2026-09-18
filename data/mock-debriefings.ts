/**
 * Debriefings — dados mockados (Fase 6 · front-end)
 *
 * O documento completo vem do mockup oficial (módulo `db`): 9 seções, da capa
 * ao anexo metodológico. A lista existe pra dar o contexto de "vários
 * debriefings por cliente" que a fase prevê — hoje só o da Kedma tem conteúdo.
 */

export interface ResumoDebriefing {
  id: string;
  cliente: string;
  titulo: string;
  tipo: string;
  edicao: string;
  periodo: string;
  status: 'publicado' | 'revisao' | 'gerando';
  investimento: string;
  faturamento: string;
  roas: string;
  publicadoEm: string | null;
  revisor: string | null;
  completo: boolean;
}

export const DEBRIEFINGS: ResumoDebriefing[] = [
  {
    id: 'kedma-20em20-04-26',
    cliente: 'Kedma',
    titulo: 'Lançamento 20 em 20',
    tipo: 'Lançamento',
    edicao: '#4 · Abr/26',
    periodo: 'Captação 03–18 abr · vendas 19–22 abr 2026',
    status: 'publicado',
    investimento: 'R$ 41,2k',
    faturamento: 'R$ 150k',
    roas: '3,64x',
    publicadoEm: '09/05/2026 às 14h32',
    revisor: 'Higor Cardoso',
    completo: true,
  },
  {
    id: 'kedma-aplicacao-04-26',
    cliente: 'Kedma',
    titulo: 'Aplicação · perpétuo',
    tipo: 'Perpétuo',
    edicao: 'Abr/26',
    periodo: 'Abril 2026 · 30 dias',
    status: 'revisao',
    investimento: 'R$ 7,8k',
    faturamento: 'R$ 77k',
    roas: '9,85x',
    publicadoEm: null,
    revisor: 'Mickael Almeida',
    completo: false,
  },
  {
    id: 'carv-mlc-03-26',
    cliente: 'Carv Group',
    titulo: 'MLC · ciclo de março',
    tipo: 'Captação',
    edicao: 'Mar/26',
    periodo: '01–31 mar 2026',
    status: 'gerando',
    investimento: 'R$ 12,5k',
    faturamento: 'R$ 96k',
    roas: '7,68x',
    publicadoEm: null,
    revisor: null,
    completo: false,
  },
];

export const SECOES_DEBRIEFING = [
  { id: 'overview', letra: 'A', nome: 'Visão geral' },
  { id: 'funil', letra: 'B', nome: 'Funil' },
  { id: 'captacao', letra: 'C', nome: 'Captação' },
  { id: 'criativos', letra: 'D', nome: 'Criativos' },
  { id: 'publicos', letra: 'E', nome: 'Públicos' },
  { id: 'comercial', letra: 'F', nome: 'Comercial' },
  { id: 'financeiro', letra: 'G', nome: 'Financeiro' },
  { id: 'plano', letra: 'H', nome: 'Plano de ação' },
  { id: 'anexo', letra: 'I', nome: 'Anexo' },
] as const;

/** Documento completo do debriefing da Kedma · 20 em 20 (edição #4). */
export const DOC_KEDMA = {
  capa: {
    titulo: 'Debriefing · Lançamento 20 em 20',
    subtitulo: 'Webinário · captação 03–18 abr · vendas 19–22 abr 2026 · 4º lançamento do ano',
    pills: [
      { tom: 'ok' as const, texto: '● CPMQL na meta' },
      { tom: 'alerta' as const, texto: '▲ Conv. comercial abaixo' },
      { tom: 'ok' as const, texto: '↗ ROAS +14% vs anterior' },
      { tom: 'neutro' as const, texto: '▣ Fonte canônica: CRM' },
      { tom: 'neutro' as const, texto: '⌖ 20 dias' },
    ],
    destaques: [
      { rotulo: 'Investimento', valor: 'R$ 41,2k', nota: '+12% vs anterior' },
      { rotulo: 'Faturamento', valor: 'R$ 150k', nota: 'CRM canônico · +28%' },
      { rotulo: 'ROAS imediato', valor: '3,64x', nota: 'Projetado 90d · 5,5x' },
      { rotulo: 'MQLs · Vendas', valor: '495 · 20', nota: 'CAC R$ 2.061 · ticket R$ 7,5k' },
    ],
  },

  sumario: [
    {
      n: 1,
      tag: '● Captação saudável',
      tom: 'ok' as const,
      titulo: 'CPMQL na meta, puxado pelo frio',
      texto:
        'CPMQL de R$ 83 ficou 4% acima da meta de R$ 80, sustentado pelo público frio (R$ 73 vs R$ 100 do quente — 36% mais barato). Volume forte: 495 MQLs com 98% de conversão lead→MQL.',
    },
    {
      n: 2,
      tag: '▲ Gargalo identificado',
      tom: 'alerta' as const,
      titulo: 'Gargalo é comercial, não mídia',
      texto:
        'Apenas 4% dos MQLs viraram venda (vs 6,2% em fev). ROAS imediato de 3,64x está abaixo do potencial — se conversão subir para 6%, ROAS chega a 5,5x sem investir mais.',
    },
    {
      n: 3,
      tag: '↗ Replicação',
      tom: 'ok' as const,
      titulo: 'Encontramos criativo replicável',
      texto:
        'AD062 entregou MQL a R$ 45 (46% abaixo da média) e gerou R$ 9k de venda com R$ 4,6k investidos. Hook vira template para os próximos 5 criativos do ciclo.',
    },
  ],

  kpis: [
    { rotulo: 'Investimento', valor: 'R$ 41,2k', delta: '↑ 12% · R$ 4,4k a mais', tom: 'neutro' as const },
    { rotulo: 'Faturamento', valor: 'R$ 150k', delta: '↑ 28% · R$ 33k a mais', tom: 'ok' as const },
    { rotulo: 'ROAS imediato', valor: '3,64x', delta: '↑ 14% · vs 3,20x', tom: 'ok' as const },
    { rotulo: 'CPMQL', valor: 'R$ 83', delta: '▲ 4% · acima da meta R$ 80', tom: 'alerta' as const },
  ],

  kpisSecundarios: [
    { rotulo: 'CAC', valor: 'R$ 2.061', nota: 'ticket R$ 7,5k' },
    { rotulo: 'LTV (12m)', valor: 'R$ 12.300', nota: 'recompra 38%' },
    { rotulo: 'Payback', valor: '~12 dias', nota: '1ª parcela' },
    { rotulo: 'Vendas', valor: '20', nota: '+5 vs anterior' },
    { rotulo: 'Show up call', valor: '63%', nota: '+1pp' },
    { rotulo: 'Tempo lead→venda', valor: '14d', nota: 'mediana' },
  ],

  funil: [
    { etapa: 'Impressões', valor: '3.218.905', taxa: '3,22M', delta: null },
    { etapa: 'Cliques', valor: '8.867', taxa: 'CTR 0,28%', delta: null },
    { etapa: 'Leads', valor: '505', taxa: '5,70%', delta: '↓ 0,3pp' },
    { etapa: 'MQLs', valor: '495', taxa: '98,02%', delta: '↑ 2pp' },
    { etapa: 'Aplicações', valor: '141', taxa: '28,5%', delta: '↓ 4pp' },
    { etapa: 'Calls realizadas', valor: '89', taxa: '63,1%', delta: '↑ 1pp' },
    { etapa: 'Vendas', valor: '20', taxa: '22,5%', delta: '↓ 8pp' },
  ],

  reconciliacao: {
    fontes: [
      {
        nome: 'CRM (canônico)',
        detalhe: 'HubSpot · sync contínuo',
        valor: 'R$ 150.000',
        nota: '20 vendas',
        canonica: true,
      },
      {
        nome: 'Planilha KPIs',
        detalhe: 'acompanhamento operacional',
        valor: 'R$ 177.500',
        nota: '25 vendas · +5 pendentes',
        canonica: false,
      },
      {
        nome: 'Planilha e-mail',
        detalhe: 'vendas com UTM rastreável',
        valor: 'R$ 113.100',
        nota: '15 vendas · sem orgânico',
        canonica: false,
      },
      {
        nome: 'Extração Meta',
        detalhe: 'pixel direto',
        valor: 'R$ 45.000',
        nota: '6 vendas · subreporting',
        canonica: false,
      },
    ],
    nota:
      'Divergência ±25% explicada: pixel duplicando eventos no Meta, atraso de sync planilha→CRM (+5 vendas), e-mail captura apenas com link UTM. Detalhes no anexo I.',
  },

  fases: [
    { nome: 'Pré-captação', periodo: '28 mar – 02 abr', valor: 'R$ 2,1k', nota: 'Teste de criativos · CPMQL R$ 91' },
    { nome: 'Captação', periodo: '03 – 18 abr', valor: 'R$ 37,7k', nota: '495 MQLs · CPMQL R$ 80' },
    { nome: 'Lembrete', periodo: '19 abr', valor: 'R$ 1,4k', nota: 'Show up 62% → 78%' },
    { nome: 'Webinário', periodo: '19 abr · 20h', valor: '307', nota: 'Presentes ao vivo (62%)' },
    { nome: 'Vendas', periodo: '19 – 22 abr', valor: 'R$ 150k', nota: '20 vendas · ROAS 3,64x' },
  ],

  temperatura: [
    { nome: 'Frio', investimento: 30076, mqls: 373, vendas: 16, cpmql: 73 },
    { nome: 'Quente', investimento: 11124, mqls: 122, vendas: 4, cpmql: 100 },
  ],

  cpmqlSemanal: [
    { semana: 'S1 · 03–09 abr', cpmql: 91 },
    { semana: 'S2 · 10–16 abr', cpmql: 78 },
    { semana: 'S3 · 17–18 abr', cpmql: 80 },
    { semana: 'Lembrete · 19 abr', cpmql: 86 },
  ],

  topCriativos: [
    {
      rank: 1,
      id: 'AD062',
      nome: 'AD062 · Hook prova social',
      descricao: 'Frio · VSL curta · "80% das alunas..."',
      tags: ['VSL', 'Frio', 'Hook 3s'],
      cpmql: 'R$ 45',
      resultado: '103 MQL · 1 venda · R$ 9k',
      formato: '▶ VSL 45s',
    },
    {
      rank: 2,
      id: 'AD04',
      nome: 'AD04 · Depoimento cortes',
      descricao: 'Frio · cortes rápidos · alta freq.',
      tags: ['Depoimento', 'Frio', '⚠ Freq. 3,8'],
      cpmql: 'R$ 78',
      resultado: '120 MQL · 1 venda · R$ 7k',
      formato: '▶ 30s',
    },
    {
      rank: 3,
      id: 'AD03',
      nome: 'AD03 · Pergunta + lista',
      descricao: 'Quente · carrossel · educativo',
      tags: ['Carrossel', 'Quente', '★ 2 vendas'],
      cpmql: 'R$ 75',
      resultado: '62 MQL · 2 vendas · R$ 14k',
      formato: '▦ 5 cards',
    },
  ],

  cortarCriativos: [
    {
      id: 'AD088',
      nome: 'AD088 · Hook genérico',
      descricao: '"Conheça…" · sem dor específica · CTR 0,12%',
      tags: ['Frio', 'Imagem', '8% verba sem retorno'],
      cpmql: 'R$ 233',
      resultado: '14 MQL · 0 venda · R$ 3,3k',
    },
    {
      id: 'AD104',
      nome: 'AD104 · Estática genérica',
      descricao: 'Sem movimento · 60% pior que vídeos',
      tags: ['Frio', 'Imagem', 'Migrar pra vídeo'],
      cpmql: 'R$ 236',
      resultado: '8 MQL · 0 venda · R$ 1,9k',
    },
  ],

  aprendizadoCriativos:
    'Hooks abertos não funcionam para esse público. Próximo lançamento: sempre dor específica nos primeiros 3s. Pausar todas as estáticas e migrar verba 100% para vídeo curto.',

  clustersFormato: [
    { formato: 'VSL curta (≤60s)', cpmql: 52, criativos: 4 },
    { formato: 'Depoimento', cpmql: 81, criativos: 6 },
    { formato: 'Carrossel', cpmql: 88, criativos: 5 },
    { formato: 'Estática', cpmql: 234, criativos: 3 },
  ],

  publicos: [
    {
      nome: '00_STORY_REELS_LAL7%_MQL+MEDICOS',
      descricao: 'Lookalike 7% MQLs + médicos',
      temperatura: 'Frio',
      investimento: 'R$ 14.061',
      impressoes: '1.118.905',
      mqls: 194,
      cpmql: 'R$ 72',
      vendas: 11,
      roas: '5,2x',
    },
    {
      nome: '04_STORY_REELS_Envolvimento_90D',
      descricao: 'Engajou stories/reels últimos 90d',
      temperatura: 'Quente',
      investimento: 'R$ 2.327',
      impressoes: '137.185',
      mqls: 34,
      cpmql: 'R$ 68',
      vendas: 3,
      roas: '4,5x',
    },
    {
      nome: 'TESTE_CRIATIVOS',
      descricao: 'Audiência ampla para teste',
      temperatura: 'Frio',
      investimento: 'R$ 3.591',
      impressoes: '215.992',
      mqls: 53,
      cpmql: 'R$ 68',
      vendas: 2,
      roas: '3,9x',
    },
    {
      nome: '00_FEED_STORY_LAL_1%_LISTA_ALUNOS',
      descricao: 'Lookalike 1% da lista de alunos',
      temperatura: 'Frio',
      investimento: 'R$ 9.678',
      impressoes: '770.397',
      mqls: 126,
      cpmql: 'R$ 77',
      vendas: 3,
      roas: '2,8x',
    },
    {
      nome: '03_FEED_Envolvimento_180D',
      descricao: 'Engajou perfil últimos 180d',
      temperatura: 'Quente',
      investimento: 'R$ 7.772',
      impressoes: '418.735',
      mqls: 67,
      cpmql: 'R$ 116',
      vendas: 1,
      roas: '1,1x',
    },
  ],

  demografia: {
    idade: [
      { faixa: '25-34', mqls: 128, vendas: 4 },
      { faixa: '35-44', mqls: 208, vendas: 10 },
      { faixa: '45-54', mqls: 112, vendas: 5 },
      { faixa: '55+', mqls: 47, vendas: 1 },
    ],
    genero: [
      { nome: 'Feminino', pct: 78 },
      { nome: 'Masculino', pct: 22 },
    ],
    dispositivo: [
      { nome: 'Mobile app', pct: 71 },
      { nome: 'Mobile web', pct: 19 },
      { nome: 'Desktop', pct: 10 },
    ],
  },

  motivosNaoCompra: [
    { motivo: 'Preço / parcelamento', pct: 38 },
    { motivo: 'Vai pensar / não retornou', pct: 27 },
    { motivo: 'Não é o momento', pct: 18 },
    { motivo: 'Já fez outro curso', pct: 11 },
    { motivo: 'Sem fit (perfil)', pct: 6 },
  ],

  jornada: [
    { rotulo: 'Tempo lead→venda', valor: '14d', nota: 'mediana' },
    { rotulo: 'Ticket médio', valor: 'R$ 7,5k', nota: '+10% vs anterior' },
    { rotulo: 'Show up call', valor: '63%', nota: '+1pp' },
  ],

  pagamento: [
    { forma: 'Cartão parcelado', pct: 62 },
    { forma: 'PIX à vista', pct: 28 },
    { forma: 'Boleto', pct: 10 },
  ],

  parcelamento: [
    { faixa: '12x', pct: 48 },
    { faixa: '10x', pct: 22 },
    { faixa: '6x', pct: 18 },
    { faixa: 'À vista', pct: 12 },
  ],

  financeiro: [
    {
      rotulo: 'CAC verdadeiro',
      valor: 'R$ 2.234',
      nota: 'Mídia: R$ 2.061 · produção: R$ 173',
    },
    {
      rotulo: 'LTV projetado (12m)',
      valor: 'R$ 12.300',
      nota: 'Ticket R$ 7,5k · recompra 38% · ticket #2 R$ 4,8k',
    },
    {
      rotulo: 'Razão LTV/CAC',
      valor: '5,5x',
      nota: 'Acima da meta de 3x · saudável para escalar.',
    },
    {
      rotulo: 'Payback',
      valor: '~12 dias',
      nota: 'CAC recuperado no 1º pagamento do parcelamento.',
    },
  ],

  projecaoFaturamento: [
    { horizonte: 'Imediato', valor: 150 },
    { horizonte: '30 dias', valor: 186 },
    { horizonte: '90 dias', valor: 227 },
    { horizonte: 'LTV 12m', valor: 246 },
  ],

  evolucaoRoas: [
    { lancamento: '#1 · Out/25', roas: 2.4 },
    { lancamento: '#2 · Dez/25', roas: 2.9 },
    { lancamento: '#3 · Fev/26', roas: 3.2 },
    { lancamento: '#4 · Abr/26', roas: 3.64 },
  ],

  validadas: [
    'Frio bate quente em CPMQL. R$ 73 vs R$ 100 — 36% mais barato. Manter mix 73% frio no próximo ciclo.',
    'VSL curta (45s) com hook de 3s funciona. AD062 validou — replicar estrutura em 5 variações de copy.',
    'Lookalike de MQL+médicos > LAL de lista. 5,2x vs 2,8x ROAS — escalar verba no LAL 7%.',
  ],

  invalidadas: [
    'Teste de página falhou. Iniciado no dia 12 do lançamento — volume insuficiente. Próximo: rodar nos primeiros 3 dias.',
    'Quente com Envolvimento_180D saturou. CPMQL R$ 116 e ROAS 1,1x — pausar e renovar audiência.',
    'Imagem estática não converte. 60% pior que vídeo. Migrar 100% do orçamento de estática para vídeo curto.',
  ],

  plano: [
    {
      prioridade: 'P1',
      titulo: 'Investigar queda de conversão MQL→venda com o comercial',
      descricao:
        'Conversão caiu de 6,2% (fev) para 4,0% (abr). Comparar script atual com o de fevereiro, cruzar com motivo "preço/parcelamento" (38%) e desenhar nova oferta de parcelamento estendido (12x → 18x).',
      responsavel: 'Comercial · Lucas',
      prazo: '7 dias',
      meta: '6% conv. MQL→venda',
      impacto: '+R$ 75k em ROAS',
    },
    {
      prioridade: 'P1',
      titulo: 'Escalar AD062 em +30% e produzir 5 variações do hook',
      descricao:
        'CPMQL de R$ 45 está 46% abaixo da média. Replicar estrutura: dor específica nos 3s + prova social + CTA único. Brief para criação em anexo.',
      responsavel: 'Criação · Bruno',
      prazo: '5 dias',
      meta: '5 criativos prontos',
      impacto: '-R$ 12/MQL',
    },
    {
      prioridade: 'P2',
      titulo: 'Iniciar teste de página nos primeiros 3 dias do próximo lançamento',
      descricao:
        'Neste ciclo rodou tarde, sem volume para conclusão. Definir hipótese A/B antes da captação começar — checklist no template do debriefing.',
      responsavel: 'Tráfego · Ana',
      prazo: '10 dias',
      meta: 'significância 95%',
      impacto: 'Aprendizado estratégico',
    },
    {
      prioridade: 'P2',
      titulo: 'Política de corte automático para criativos ruins',
      descricao:
        'Cortar criativos com CPMQL > R$ 120 após 3 dias rodando. AD088 e AD104 consumiram 8% do orçamento sem retorno. Configurar regra no Meta Ads.',
      responsavel: 'Tráfego · Ana',
      prazo: 'Implementar hoje',
      meta: '-8% custo morto',
      impacto: '~R$ 3,3k/lanç.',
    },
    {
      prioridade: 'P3',
      titulo: 'Manter mix 73% frio · 27% quente no próximo lançamento',
      descricao:
        'Frio teve CPMQL 36% menor e ROAS 2,8x; quente serviu para conversão final. Composição validada — não mexer no próximo ciclo.',
      responsavel: 'Tráfego · Ana',
      prazo: 'Próx. lançamento',
      meta: 'manter ROAS 3,6x+',
      impacto: 'Decisão validada',
    },
  ],

  definicoes: [
    {
      termo: 'Lead',
      texto: 'Toda pessoa que preencheu o formulário de captação, independente da qualidade.',
    },
    {
      termo: 'MQL',
      texto:
        'Lead que respondeu ao critério qualificador (campo "renda mensal" preenchido + "área médica" marcada). 98% dos leads atenderam.',
    },
    {
      termo: 'SQL / Aplicação',
      texto: 'MQL que preencheu o formulário de aplicação após o webinário. Inclui qualificação financeira.',
    },
    {
      termo: 'Venda',
      texto: 'Pagamento confirmado no checkout (PIX aprovado ou cartão capturado). Não inclui carrinhos abandonados.',
    },
    {
      termo: 'ROAS canônico',
      texto: 'Faturamento CRM ÷ Investimento mídia. Não inclui custos de produção, equipe ou ferramentas.',
    },
  ],

  fontes: [
    {
      nome: 'Meta Ads (via Supermetrics)',
      texto:
        'Impressões, cliques, custo, frequência, breakdown por criativo e público. Atualização: a cada 6h.',
    },
    {
      nome: 'CRM (HubSpot) — canônico',
      texto: 'Fonte canônica de leads, MQLs, aplicações, calls e vendas. Sincronização contínua via webhook.',
    },
    {
      nome: 'Planilha KPIs (Sheets)',
      texto: 'Acompanhamento operacional do time. Diverge do CRM em +5 vendas (atraso de sincronia).',
    },
    {
      nome: 'Pixel + UTM',
      texto: 'Rastreio de origem da venda. Limitação: ~22% das vendas sem UTM (orgânico ou direto).',
    },
    {
      nome: 'Comercial (CRM custom fields)',
      texto: 'Motivos de não-compra. Cobertura: 89% das aplicações.',
    },
  ],

  limitacoes: [
    '22% das vendas não rastreadas por UTM (orgânico ou tráfego direto) — distribuídas proporcionalmente entre criativos.',
    'Motivos de não-compra registrados em 89% das aplicações — 11% sem registro foram excluídas da análise comercial.',
    'LTV projetado usa dados de coorte do lançamento de out/25 (mais antigo com histórico completo) — pode variar ±15%.',
    'Frequência de criativos pode estar subestimada — Meta exclui exposições abaixo de 3s da contagem.',
    'Data de corte dos dados: 09/05/2026 às 14h. Vendas posteriores entram no próximo debriefing.',
  ],
};
