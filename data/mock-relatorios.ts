/**
 * Relatórios Diários — dados mockados (Fase 3 · front-end)
 *
 * Reproduz o formato que o agente de relatório diário já entrega hoje no
 * WhatsApp/ClickUp: um relatório por cliente/funil, com os três recortes
 * (Ontem · Últimos 7 dias · Mês acumulado), blocos de Marketing, Funil
 * Comercial, Criativos, Metas e a Análise em Resultado / Diagnóstico / Ação.
 *
 * A fase substitui o envio manual: a plataforma gera, o gestor revisa e
 * dispara. Por isso cada relatório carrega `status` e `entrega`.
 */

export type StatusRelatorio = 'enviado' | 'revisao' | 'gerando' | 'falhou';

export interface Recorte {
  id: 'ontem' | '7d' | 'mes';
  label: string;
  comparativo: string;
  investimento: number;
  impressoes: number;
  cliques: number;
  leads: number;
  cpl: number;
  mqls: number;
  cpmql: number;
  agendamentos: number;
  reunioes: number;
  noShow: number;
  vendas: number;
  receita: number;
  deltas: { investimento: number; leads: number; mqls: number; vendas: number; cpl: number };
}

export interface MetaRelatorio {
  metrica: string;
  realizado: string;
  meta: string;
  pct: number;
}

export interface Relatorio {
  id: string;
  cliente: string;
  funil: string;
  arquetipo: string;
  data: string;
  referencia: string;
  status: StatusRelatorio;
  entrega: { clickup: boolean; whatsapp: boolean; horario: string | null };
  geradoEm: string;
  recortes: Recorte[];
  metas: MetaRelatorio[];
  criativoDestaque: {
    nome: string;
    gasto: string;
    resultado: string;
    permalink: string | null;
    teste: string;
  } | null;
  analise: { resultado: string; diagnostico: string; acao: string };
}

export const RELATORIOS: Relatorio[] = [
  {
    id: 'infotrafego-aquisicao',
    cliente: 'Infotráfego',
    funil: 'Aquisição de clientes',
    arquetipo: 'Captação/Lead',
    data: '18/09/2026',
    referencia: 'dados até 17/09',
    status: 'enviado',
    entrega: { clickup: true, whatsapp: true, horario: '08:12' },
    geradoEm: '18/09/2026 08:04',
    recortes: [
      {
        id: 'ontem',
        label: 'Ontem · 17/09/2026 (quarta)',
        comparativo: 'vs terça 16/09',
        investimento: 412,
        impressoes: 38420,
        cliques: 742,
        leads: 47,
        cpl: 8.77,
        mqls: 26,
        cpmql: 15.85,
        agendamentos: 17,
        reunioes: 12,
        noShow: 5,
        vendas: 1,
        receita: 12500,
        deltas: { investimento: 6, leads: 12, mqls: 18, vendas: 0, cpl: -5 },
      },
      {
        id: '7d',
        label: 'Últimos 7 dias · 11/09 a 17/09',
        comparativo: 'vs 7 dias anteriores',
        investimento: 2810,
        impressoes: 264300,
        cliques: 5120,
        leads: 312,
        cpl: 9.01,
        mqls: 168,
        cpmql: 16.73,
        agendamentos: 104,
        reunioes: 74,
        noShow: 30,
        vendas: 6,
        receita: 75000,
        deltas: { investimento: 11, leads: 16, mqls: 19, vendas: 50, cpl: -4 },
      },
      {
        id: 'mes',
        label: 'Mês acumulado · 01/09 a 17/09 (17 dias)',
        comparativo: 'vs mesmos 17 dias de agosto',
        investimento: 6890,
        impressoes: 641200,
        cliques: 12480,
        leads: 761,
        cpl: 9.05,
        mqls: 402,
        cpmql: 17.14,
        agendamentos: 251,
        reunioes: 181,
        noShow: 70,
        vendas: 14,
        receita: 175000,
        deltas: { investimento: 8, leads: 14, mqls: 17, vendas: 27, cpl: -5 },
      },
    ],
    metas: [
      { metrica: 'MQLs', realizado: '402', meta: '700', pct: 57 },
      { metrica: 'Reuniões', realizado: '181', meta: '320', pct: 57 },
      { metrica: 'Vendas', realizado: '14', meta: '25', pct: 56 },
      { metrica: 'CP MQL', realizado: 'R$ 17,14', meta: 'R$ 20,00', pct: 100 },
    ],
    criativoDestaque: {
      nome: 'AD262_VID_CansouDeSofrer',
      gasto: 'R$ 1.980',
      resultado: '112 MQLs · CP MQL R$ 17,68',
      permalink: 'https://www.instagram.com/p/DSpV4pQjLpm/',
      teste: 'variação do mesmo gancho com corte de 3s mais seco',
    },
    analise: {
      resultado:
        'Mês rodando em ritmo de 57% da meta com 55% do mês decorrido — ou seja, no pace. CP MQL em R$ 17,14, abaixo do teto de R$ 20. Vendas em 14 contra 25 da meta, sustentadas pelo aumento de 27% vs agosto.',
      diagnostico:
        'A qualificação melhorou (lead→MQL em 52,8%, +2pp vs agosto) e o CPL caiu 5%. O gargalo segue no show rate: 30 no-shows em 104 agendamentos nos últimos 7 dias (28,8%), praticamente igual à semana anterior.',
      acao:
        'Ativar lembrete por WhatsApp 2h antes da reunião (hoje só tem o de 24h) e testar janela de agendamento mais curta — D+1/D+2 em vez de D+3. Meta: derrubar no-show pra 20% até o fim do mês.',
    },
  },
  {
    id: 'carv-mlc',
    cliente: 'Carv Group',
    funil: 'MLC · captação',
    arquetipo: 'Captação/Lead',
    data: '18/09/2026',
    referencia: 'dados até 17/09',
    status: 'revisao',
    entrega: { clickup: false, whatsapp: false, horario: null },
    geradoEm: '18/09/2026 08:04',
    recortes: [
      {
        id: 'ontem',
        label: 'Ontem · 17/09/2026 (quarta)',
        comparativo: 'vs terça 16/09',
        investimento: 320,
        impressoes: 29800,
        cliques: 588,
        leads: 38,
        cpl: 8.42,
        mqls: 22,
        cpmql: 14.55,
        agendamentos: 15,
        reunioes: 10,
        noShow: 5,
        vendas: 1,
        receita: 12500,
        deltas: { investimento: 5, leads: 8, mqls: 12, vendas: 0, cpl: -3 },
      },
      {
        id: '7d',
        label: 'Últimos 7 dias · 11/09 a 17/09',
        comparativo: 'vs 7 dias anteriores',
        investimento: 2850,
        impressoes: 251400,
        cliques: 4870,
        leads: 287,
        cpl: 9.93,
        mqls: 156,
        cpmql: 18.27,
        agendamentos: 89,
        reunioes: 61,
        noShow: 28,
        vendas: 6,
        receita: 75000,
        deltas: { investimento: 12, leads: 15, mqls: 18, vendas: 50, cpl: -3 },
      },
      {
        id: 'mes',
        label: 'Mês acumulado · 01/09 a 17/09 (17 dias)',
        comparativo: 'vs mesmos 17 dias de agosto',
        investimento: 5980,
        impressoes: 548900,
        cliques: 10640,
        leads: 648,
        cpl: 9.23,
        mqls: 342,
        cpmql: 17.49,
        agendamentos: 214,
        reunioes: 148,
        noShow: 66,
        vendas: 11,
        receita: 137500,
        deltas: { investimento: 8, leads: 10, mqls: 12, vendas: 22, cpl: -2 },
      },
    ],
    metas: [
      { metrica: 'Leads', realizado: '648', meta: '4.000', pct: 16 },
      { metrica: 'Receita', realizado: 'R$ 137,5k', meta: 'R$ 100k', pct: 100 },
      { metrica: 'CPL', realizado: 'R$ 9,23', meta: 'R$ 9,00', pct: 97 },
    ],
    criativoDestaque: {
      nome: 'AD262_VID_CansouDeSofrer',
      gasto: 'R$ 2.140',
      resultado: '23 leads no dia · top 1 do período',
      permalink: 'https://www.instagram.com/p/DSpV4pQjLpm/',
      teste: 'formato Imperial com os 3 ganchos novos',
    },
    analise: {
      resultado:
        'Ritmo de leads em 38/dia contra os 130/dia que a meta do mês exige. Receita já passou a meta mensal graças ao ticket alto, mas o volume de topo está curto.',
      diagnostico:
        'Público LAL2% em saturação (84%) puxando o CPL pra cima. O LAL1% Premium segue qualificando 58% dos leads, mas não tem escala pra segurar sozinho o volume.',
      acao:
        'Pausar LAL2% e subir o LAL5% que está em teste. Realocar R$ 2.500 da campanha de captação saturada pro conjunto novo, mantendo o teto de CPL em R$ 9.',
    },
  },
  {
    id: 'kedma-aplicacao',
    cliente: 'Grupo Kedma',
    funil: 'Aplicação · perpétuo',
    arquetipo: 'Captação/Lead',
    data: '18/09/2026',
    referencia: 'dados até 17/09',
    status: 'falhou',
    entrega: { clickup: false, whatsapp: false, horario: null },
    geradoEm: '18/09/2026 08:04',
    recortes: [
      {
        id: 'ontem',
        label: 'Ontem · 17/09/2026 (quarta)',
        comparativo: 'vs terça 16/09',
        investimento: 0,
        impressoes: 0,
        cliques: 0,
        leads: 0,
        cpl: 0,
        mqls: 0,
        cpmql: 0,
        agendamentos: 0,
        reunioes: 0,
        noShow: 0,
        vendas: 0,
        receita: 0,
        deltas: { investimento: 0, leads: 0, mqls: 0, vendas: 0, cpl: 0 },
      },
    ],
    metas: [],
    criativoDestaque: null,
    analise: {
      resultado: 'Relatório não gerado — sem dados no período.',
      diagnostico:
        'A aba "Visão geral" da auxiliar voltou vazia: o sync da planilha travou em 15/09 e o pixel do cliente parou de disparar (chamado aberto no suporte).',
      acao: 'Resolver o chamado "Kedma · pixel não disparando" e reprocessar os 3 dias em aberto.',
    },
  },
  {
    id: 'stella-ecommerce',
    cliente: 'Stella',
    funil: 'E-commerce · ROAS',
    arquetipo: 'E-commerce/ROAS',
    data: '18/09/2026',
    referencia: 'dados até 17/09',
    status: 'gerando',
    entrega: { clickup: false, whatsapp: false, horario: null },
    geradoEm: '18/09/2026 08:04',
    recortes: [
      {
        id: 'ontem',
        label: 'Ontem · 17/09/2026 (quarta)',
        comparativo: 'vs terça 16/09',
        investimento: 780,
        impressoes: 92100,
        cliques: 1840,
        leads: 0,
        cpl: 0,
        mqls: 0,
        cpmql: 0,
        agendamentos: 0,
        reunioes: 0,
        noShow: 0,
        vendas: 34,
        receita: 6120,
        deltas: { investimento: 3, leads: 0, mqls: 0, vendas: 9, cpl: 0 },
      },
    ],
    metas: [{ metrica: 'ROAS', realizado: '7,85x', meta: '6,00x', pct: 100 }],
    criativoDestaque: null,
    analise: {
      resultado: 'Processando a extração de anúncios — o bloco de criativos entra assim que a aba carregar.',
      diagnostico: '—',
      acao: '—',
    },
  },
];

export const AGENDA_RELATORIOS = {
  horario: '08:00 (America/Sao_Paulo)',
  canais: ['ClickUp · comentário na task do cliente', 'WhatsApp · grupo do cliente'],
  proximaExecucao: '19/09/2026 08:00',
  ultimaExecucao: '18/09/2026 08:04 · 4 relatórios · 1 falha',
  clientesAtivos: 7,
};
