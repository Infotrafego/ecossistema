/**
 * Gestão Interna — dados mockados (Fase 7 · front-end)
 *
 * Extraídos do mockup oficial (módulo `gi`): visão do negócio, SOS, pessoas,
 * aprovações financeiras, chamados e onboarding de cliente.
 */

export const NEGOCIO = {
  kpis: [
    { rotulo: 'Clientes ativos', valor: '7' },
    { rotulo: 'Receita MRR', valor: 'R$ 568k' },
    { rotulo: 'Colaboradores', valor: '12' },
    { rotulo: 'NPS médio', valor: '8.4' },
    { rotulo: 'Retention rate', valor: '94%' },
    { rotulo: 'Ticket médio', valor: 'R$ 47k' },
  ],
};

export const SOS = [
  {
    titulo: 'Lucas Ferreira (SDR) · no-show rate 51%',
    descricao:
      'No-show subiu de 35% para 51% em 3 semanas. 3 leads perdidos nesta semana por não-comparecimento. Treinamento 1:1 com Felipe agendado para 29/05 (quinta). Se não melhorar em 2 semanas, considerar realocação.',
    abertoEm: '27/05/2026',
    responsavel: 'Felipe Mendes',
  },
];

export const PESSOAS = [
  {
    nome: 'Mickael Almeida',
    funcao: 'Founder & Estrategista',
    stats: [
      { rotulo: 'Clientes', valor: '7/7' },
      { rotulo: 'Horas/sem', valor: '52h' },
    ],
    badge: 'Sobrecarregado',
    tom: 'atencao' as const,
  },
  {
    nome: 'Pablo Costa',
    funcao: 'Gestor de Tráfego Sr',
    stats: [
      { rotulo: 'Clientes', valor: '5' },
      { rotulo: 'Horas/sem', valor: '44h' },
    ],
    badge: 'Disponível',
    tom: 'ok' as const,
  },
  {
    nome: 'Bianca Silva',
    funcao: 'CS Manager',
    stats: [
      { rotulo: 'Clientes', valor: '7' },
      { rotulo: 'Horas/sem', valor: '40h' },
    ],
    badge: 'Disponível',
    tom: 'ok' as const,
  },
  {
    nome: 'Felipe Mendes',
    funcao: 'Closer Sr',
    stats: [
      { rotulo: 'Close rate', valor: '42%' },
      { rotulo: 'Calls/sem', valor: '18' },
    ],
    badge: 'Top performer',
    tom: 'ok' as const,
  },
  {
    nome: 'Juliana Santos',
    funcao: 'Closer',
    stats: [
      { rotulo: 'Close rate', valor: '38%' },
      { rotulo: 'Calls/sem', valor: '22' },
    ],
    badge: 'Disponível',
    tom: 'ok' as const,
  },
  {
    nome: 'Lucas Ferreira',
    funcao: 'SDR',
    stats: [
      { rotulo: 'Show rate', valor: '49%' },
      { rotulo: 'Calls/sem', valor: '15' },
    ],
    badge: 'Em risco · SOS ativo',
    tom: 'risco' as const,
  },
  {
    nome: 'Carolina Lima',
    funcao: 'Analista de Dados',
    stats: [
      { rotulo: 'Relatórios/sem', valor: '7' },
      { rotulo: 'Horas/sem', valor: '38h' },
    ],
    badge: 'Disponível',
    tom: 'ok' as const,
  },
  {
    nome: 'Bia (Criativos)',
    funcao: 'Designer / Videomaker',
    stats: [
      { rotulo: 'Entregas/sem', valor: '12' },
      { rotulo: 'Horas/sem', valor: '42h' },
    ],
    badge: 'Disponível',
    tom: 'ok' as const,
  },
];

export const FINANCEIRO = {
  receita: {
    titulo: 'Receita mensal',
    linhas: [
      { rotulo: 'Fee fixo (7 clientes)', valor: 'R$ 42.000', tom: 'neutro' as const },
      { rotulo: 'Variável/performance', valor: 'R$ 8.400', tom: 'neutro' as const },
      { rotulo: 'Setup novos (2)', valor: 'R$ 6.000', tom: 'neutro' as const },
      { rotulo: 'Total receita', valor: 'R$ 56.400', tom: 'ok' as const, forte: true },
    ],
  },
  despesas: {
    titulo: 'Despesas aprovadas',
    linhas: [
      { rotulo: 'Folha (12 colaboradores)', valor: 'R$ 28.000', tom: 'neutro' as const },
      { rotulo: 'Ferramentas (Meta/Pipedrive/etc)', valor: 'R$ 3.200', tom: 'neutro' as const },
      { rotulo: 'Infraestrutura', valor: 'R$ 1.800', tom: 'neutro' as const },
      { rotulo: 'Pendente aprovação: curso Felipe', valor: 'R$ 1.200', tom: 'atencao' as const },
      { rotulo: 'Margem líquida', valor: 'R$ 22.200 (39%)', tom: 'ok' as const, forte: true },
    ],
  },
  pendentes: [
    {
      item: 'Curso de closing avançado · Felipe Mendes',
      valor: 'R$ 1.200',
      solicitante: 'Felipe Mendes',
      em: '26/05/2026',
    },
  ],
};

export const CHAMADOS = [
  {
    coluna: 'Novo',
    cards: [
      { titulo: 'Kedma · pixel não disparando', meta: 'Há 2h · prioridade alta', tom: 'alta' as const },
      { titulo: 'Carv · trocar imagem LP', meta: 'Há 5h · prioridade baixa', tom: 'baixa' as const },
      { titulo: 'Giulia · UTMs quebrados', meta: 'Há 1d · prioridade média', tom: 'media' as const },
    ],
  },
  {
    coluna: 'Em andamento',
    cards: [
      { titulo: 'Stella · integração Typebot', meta: 'Pablo · 3 dias', tom: 'media' as const },
      { titulo: 'Alex · configurar CAPI', meta: 'Carolina · 1 dia', tom: 'media' as const },
    ],
  },
  {
    coluna: 'Aguardando cliente',
    cards: [
      { titulo: 'Paula · aprovar criativos', meta: 'Enviado 25/05', tom: 'baixa' as const },
      { titulo: 'Cristina · acesso GTM', meta: 'Solicitado 23/05', tom: 'baixa' as const },
    ],
  },
  {
    coluna: 'Resolvido',
    cards: [
      { titulo: 'Kedma · público duplicado', meta: 'Resolvido 26/05', tom: 'ok' as const },
      { titulo: 'Carv · atualizar copy LP', meta: 'Resolvido 26/05', tom: 'ok' as const },
      { titulo: 'Giulia · ajustar budget', meta: 'Resolvido 25/05', tom: 'ok' as const },
      { titulo: 'Stella · pixel iOS fix', meta: 'Resolvido 24/05', tom: 'ok' as const },
    ],
  },
];

export const ONBOARDINGS = [
  {
    cliente: 'Arlene MBA',
    etapaAtual: 3,
    totalEtapas: 6,
    etapaNome: 'Auditoria de conta',
    etapas: ['Discovery', 'Setup Meta', 'Auditoria', 'Estratégia', 'Criativos', 'Lançamento'],
  },
  {
    cliente: 'Instituto Renasce',
    etapaAtual: 1,
    totalEtapas: 6,
    etapaNome: 'Discovery',
    etapas: ['Discovery', 'Setup Meta', 'Auditoria', 'Estratégia', 'Criativos', 'Lançamento'],
  },
];

/* ═══════════ CRM Kanban + Conversas WhatsApp ═══════════ */

export const PIPELINE = [
  {
    etapa: 'Lead novo',
    total: 8,
    deals: [
      { nome: 'Dr. Ricardo Alves', contexto: 'Cirurgião plástico · SP', valor: 'R$ 5.000/mês', tag: 'Quente' as const },
      { nome: 'Clínica Bella Vida', contexto: 'Estética · RJ', valor: 'R$ 3.500/mês', tag: 'Morno' as const },
      { nome: 'Dr. Ana Torres', contexto: 'Dermatologista · BH', valor: 'R$ 4.200/mês', tag: 'Quente' as const },
    ],
  },
  {
    etapa: 'Qualificado',
    total: 5,
    deals: [
      { nome: 'Instituto Renasce', contexto: 'Medicina integrativa · SP', valor: 'R$ 8.000/mês', tag: 'Quente' as const },
      { nome: 'Clínica Dr. Fábio', contexto: 'Implantes · Curitiba', valor: 'R$ 4.500/mês', tag: 'Morno' as const },
    ],
  },
  {
    etapa: 'Proposta enviada',
    total: 3,
    deals: [
      { nome: 'Arlene MBA', contexto: 'Educação · online', valor: 'R$ 12.000/mês', tag: 'Quente' as const },
      { nome: 'Espaço Saúde Premium', contexto: 'Multi-especialidade · SP', valor: 'R$ 6.000/mês', tag: 'Frio' as const },
    ],
  },
  {
    etapa: 'Negociação',
    total: 2,
    deals: [
      { nome: 'Dr. Marcos Vieira', contexto: 'Ortopedista · SP', valor: 'R$ 7.500/mês', tag: 'Morno' as const },
    ],
  },
  {
    etapa: 'Fechado ✓',
    total: 4,
    deals: [
      { nome: 'Kedma · renovação', contexto: 'Estética · SP', valor: 'R$ 8.500/mês', tag: 'Renovado' as const },
    ],
  },
];

export const CONVERSAS = [
  {
    id: 'ricardo',
    nome: 'Dr. Ricardo Alves',
    contexto: 'Cirurgião plástico · SP · Lead novo',
    previa: 'Oi, queria entender melhor a proposta...',
    hora: '10:42',
    naoLidas: 3,
    mensagens: [
      {
        de: 'eles' as const,
        texto:
          'Oi, vi o anúncio de vocês no Instagram. Queria entender melhor como funciona a gestão de tráfego pro meu consultório.',
        hora: '10:38',
      },
      {
        de: 'nos' as const,
        texto:
          'Olá Dr. Ricardo! Que bom que nos encontrou. Trabalhamos exclusivamente com profissionais de saúde e estética. Posso agendar uma sessão estratégica gratuita de 30min pra entender melhor seu caso?',
        hora: '10:40',
      },
      { de: 'eles' as const, texto: 'Sim, pode ser quinta às 15h?', hora: '10:41' },
      { de: 'eles' as const, texto: 'E quanto em média vocês cobram?', hora: '10:42' },
    ],
  },
  {
    id: 'fernanda',
    nome: 'Fernanda · Carv Group',
    contexto: 'Cliente ativo · CS',
    previa: 'Os criativos novos ficaram ótimos!',
    hora: '09:15',
    naoLidas: 0,
    mensagens: [
      { de: 'eles' as const, texto: 'Os criativos novos ficaram ótimos!', hora: '09:15' },
      { de: 'nos' as const, texto: 'Que bom que gostou, Fernanda! Subimos os 3 ontem à noite.', hora: '09:20' },
    ],
  },
  {
    id: 'ana',
    nome: 'Dr. Ana Torres',
    contexto: 'Dermatologista · BH · Lead novo',
    previa: 'Quando podemos agendar a call?',
    hora: 'ontem',
    naoLidas: 1,
    mensagens: [{ de: 'eles' as const, texto: 'Quando podemos agendar a call?', hora: 'ontem · 17:02' }],
  },
  {
    id: 'kedma',
    nome: 'Kedma · Suporte',
    contexto: 'Cliente ativo · chamado aberto',
    previa: 'O pixel parou de disparar',
    hora: 'ontem',
    naoLidas: 0,
    mensagens: [{ de: 'eles' as const, texto: 'O pixel parou de disparar', hora: 'ontem · 14:30' }],
  },
  {
    id: 'renasce',
    nome: 'Instituto Renasce',
    contexto: 'Qualificado · proposta em análise',
    previa: 'Vamos fechar! Preciso do contrato',
    hora: '26/05',
    naoLidas: 0,
    mensagens: [{ de: 'eles' as const, texto: 'Vamos fechar! Preciso do contrato', hora: '26/05 · 11:12' }],
  },
  {
    id: 'arlene',
    nome: 'Arlene MBA',
    contexto: 'Proposta enviada',
    previa: 'Proposta aprovada internamente',
    hora: '25/05',
    naoLidas: 0,
    mensagens: [{ de: 'eles' as const, texto: 'Proposta aprovada internamente', hora: '25/05 · 16:45' }],
  },
];
