/**
 * Insights & Benchmarks — dados mockados (front-end)
 *
 * Extraídos do mockup oficial (módulo `meta`). É a leitura de conta que a
 * Marketing API já expõe (opportunity score, ranking de leilão, benchmarks de
 * indústria) somada às anomalias detectadas pela camada de IA.
 */

export const OPPORTUNITY = {
  score: 78,
  rotulo: 'Bom',
  conta: 'Carv Group',
  descricao:
    'Score geral da conta com base em 12 sinais (budget utilization, creative freshness, audience overlap, etc.)',
  itens: [
    { ok: true, texto: 'Budget 92% utilizado' },
    { ok: false, texto: '3 criativos com freq > 3.5' },
    { ok: true, texto: 'Audience overlap < 15%' },
    { ok: false, texto: '1 ad set sem conversão 7d' },
  ],
};

export const BENCHMARKS = [
  { valor: 'R$ 2,14', rotulo: 'CPC médio', comparativo: '↓ 12% vs indústria (R$ 2,43)', tom: 'ok' as const },
  { valor: '1,82%', rotulo: 'CTR médio', comparativo: '↑ 23% vs indústria (1,48%)', tom: 'ok' as const },
  { valor: 'R$ 84', rotulo: 'CPMQL', comparativo: '↑ 8% vs indústria (R$ 78)', tom: 'ruim' as const },
  { valor: '3,2x', rotulo: 'ROAS', comparativo: '↑ 15% vs indústria (2,8x)', tom: 'ok' as const },
  { valor: '14,2%', rotulo: 'CVR (Page → Lead)', comparativo: '↑ 31% vs indústria (10,8%)', tom: 'ok' as const },
  { valor: '2,4', rotulo: 'Frequência média', comparativo: 'Dentro do saudável (< 3,0)', tom: 'ok' as const },
];

export const ANOMALIAS = [
  {
    severidade: 'critica' as const,
    titulo: 'CPC subiu 34% em 3 dias no conjunto LAL5% Quente',
    descricao:
      'O CPC médio passou de R$ 1,89 para R$ 2,53 entre 24/05 e 27/05. Coincide com aumento de frequência (3,1 → 4,2).',
    acao: 'Pausar e rotacionar criativos do conjunto OU reduzir bid em 15%',
  },
  {
    severidade: 'media' as const,
    titulo: 'CTR do criativo C-014 caiu 22% (de 2,1% para 1,64%)',
    descricao: 'Criativo ativo há 18 dias. Padrão de fadiga criativa identificado via curva de decay.',
    acao: 'Substituir por variação C-014b (mesmo gancho, visual novo) ou pausar',
  },
  {
    severidade: 'media' as const,
    titulo: 'Horário 21h-23h com CPA 2,3x acima da média',
    descricao:
      'Últimos 7 dias mostram queda de qualidade de leads no horário noturno. 4 no-shows em 6 agendamentos.',
    acao: 'Dayparting — reduzir bid 50% após 21h ou pausar delivery',
  },
];

export const AUCTION_RANKING = [
  { valor: 'Top 20%', rotulo: 'Quality Ranking', comparativo: 'Acima da média', tom: 'ok' as const },
  { valor: 'Top 35%', rotulo: 'Engagement Ranking', comparativo: 'Acima da média', tom: 'ok' as const },
  { valor: 'Top 45%', rotulo: 'Conversion Ranking', comparativo: 'Na média', tom: 'neutro' as const },
];

export const GLOSSARIO = [
  { termo: 'CPC', texto: 'Custo por clique no link' },
  { termo: 'CTR', texto: 'Taxa de clique (cliques/impressões)' },
  { termo: 'CPM', texto: 'Custo por mil impressões' },
  { termo: 'CPMQL', texto: 'Custo por MQL (lead qualificado)' },
  { termo: 'ROAS', texto: 'Retorno sobre investimento em ads' },
  { termo: 'CVR', texto: 'Taxa de conversão (ações/cliques)' },
  { termo: 'Frequência', texto: 'Média de vezes que cada pessoa viu o ad' },
  { termo: 'Reach', texto: 'Pessoas únicas alcançadas' },
  { termo: 'Quality Ranking', texto: 'Qualidade percebida vs outros anunciantes' },
  { termo: 'Engagement Ranking', texto: 'Engajamento esperado vs outros' },
  { termo: 'Conversion Ranking', texto: 'Taxa de conversão esperada vs outros' },
  { termo: 'Audience Overlap', texto: '% de sobreposição entre públicos' },
];
