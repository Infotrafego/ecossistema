/**
 * App Unificado · hub executivo — dados mockados (Fase 8 · front-end)
 *
 * Extraídos do mockup oficial (VIEWS.inicio): o snapshot que consolida as
 * plataformas internas numa tela só, com os alertas centralizados apontando
 * pra rota que resolve cada um.
 */

export const KPIS_HUB = [
  { rotulo: 'Receita 30d', valor: 'R$ 350k', delta: '↑ 35% vs período anterior', tom: 'ok' as const, destaque: true },
  { rotulo: 'ROAS', valor: '9,85', delta: '↑ 44%', tom: 'ok' as const, destaque: false },
  { rotulo: 'CPL', valor: 'R$ 142', delta: '↓ 18%', tom: 'ok' as const, destaque: false },
  { rotulo: 'Show rate', valor: '72%', delta: '↑ 7pts', tom: 'ok' as const, destaque: false },
  { rotulo: 'Close rate', valor: '43%', delta: '↑ 4pts', tom: 'ok' as const, destaque: false },
  { rotulo: 'Saúde CS', valor: '82', delta: '↓ 3pts', tom: 'ruim' as const, destaque: false },
];

export const ALERTAS_HUB = [
  {
    prioridade: 'alta' as const,
    origem: 'Comercial',
    texto:
      '**Pedro Henrique · 3 perdas seguidas** em calls com objeção "falar com sócio" · falta agenda condicional. Treinamento imediato sugerido com a Juliana.',
    href: '/dashboard/comercial?tab=calls',
  },
  {
    prioridade: 'alta' as const,
    origem: 'Inteligência',
    texto:
      '**Custo MQL subiu 13%** apesar do CPL cair · sinal de qualificação afrouxada. Verificar último ajuste no Typebot.',
    href: '/dashboard/inteligencia-de-dados',
  },
  {
    prioridade: 'media' as const,
    origem: 'Estratégia',
    texto:
      '**Forecast realista R$ 380k** vs meta R$ 420k · gap de R$ 40k · 4 ações no Plano de Testes pra fechar.',
    href: '/dashboard/estrategia?tab=forecast',
  },
  {
    prioridade: 'media' as const,
    origem: 'CS',
    texto:
      '**Fernanda (Carv) sinalizou friction** com prazo de entrega · risco baixo de churn · ping da Bianca recomendado em 48h.',
    href: '/dashboard/cs?tab=riscos',
  },
  {
    prioridade: 'baixa' as const,
    origem: 'IA · Fadiga',
    texto:
      '**5 criativos com fadiga crítica detectada** · CTR caiu >20% em 3d · considerar rotacionar imediatamente.',
    href: '/dashboard/inteligencia-de-dados/fadiga',
  },
];

export const PILARES = [
  {
    nome: 'Inteligência de Dados',
    sub: 'mídia paga · funil · criativos',
    saude: 'SAUDÁVEL' as const,
    href: '/dashboard/inteligencia-de-dados',
    kpis: [
      { rotulo: 'Invest', valor: 'R$ 7.813', nota: '↑ ROAS 9,85', tom: 'ok' as const },
      { rotulo: 'Top criativo', valor: 'AD262', nota: 'CPMQL R$ 63', tom: 'neutro' as const },
      { rotulo: 'Saturação', valor: 'Baixa', nota: 'freq. 1,4', tom: 'neutro' as const },
    ],
    highlight:
      'AD262_CansouDeSofrer responde por 40% dos top leads · pronto pra escalar verba +25%',
    highlightTom: 'ok' as const,
  },
  {
    nome: 'Comercial Consultivo',
    sub: 'calls · time · objeções',
    saude: 'ATENÇÃO' as const,
    href: '/dashboard/comercial',
    kpis: [
      { rotulo: 'Vendas', valor: '28', nota: '↑ 40%', tom: 'ok' as const },
      { rotulo: 'Close rate', valor: '43%', nota: '↑ 4pts', tom: 'ok' as const },
      { rotulo: 'Top closer', valor: 'Juliana', nota: '50% close', tom: 'neutro' as const },
    ],
    highlight: 'Pedro perde 60% de calls com "falar com sócio" · padrão repetitivo nos últimos 14 dias',
    highlightTom: 'atencao' as const,
  },
  {
    nome: 'Estratégia & Inteligência',
    sub: 'forecast · debriefings · munição',
    saude: 'EM CURSO' as const,
    href: '/dashboard/estrategia',
    kpis: [
      { rotulo: 'Forecast', valor: 'R$ 380k', nota: '↓ 10% meta', tom: 'ruim' as const },
      { rotulo: 'Testes', valor: '6', nota: '3Q · 3F', tom: 'neutro' as const },
      { rotulo: 'Debriefings', valor: '3', nota: 'Kedma Abril', tom: 'neutro' as const },
    ],
    highlight:
      'Debriefing Kedma Abril 26 entregue · 15 seções · 5 decisões propostas pra próximo período',
    highlightTom: 'ok' as const,
  },
  {
    nome: 'Central CS · Bianca',
    sub: 'saúde do cliente · munição',
    saude: 'ATENÇÃO' as const,
    href: '/dashboard/cs',
    kpis: [
      { rotulo: 'Saúde Carv', valor: '82', nota: '↓ 3pts 7d', tom: 'ruim' as const },
      { rotulo: 'Indicações', valor: '2', nota: 'novas mês', tom: 'ok' as const },
      { rotulo: 'Riscos', valor: '1', nota: 'friction prazo', tom: 'neutro' as const },
    ],
    highlight: 'Fernanda sinalizou friction com prazo de entrega · Bianca agenda ping em 48h',
    highlightTom: 'atencao' as const,
  },
];
