/**
 * Dados MOCKADOS pra desenvolvimento da Visão Geral
 *
 * Quando o sync Meta Ads real estiver implementado, substituir
 * por queries reais no Supabase.
 *
 * Cliente piloto: Infotráfego · Funil: Aquisição de Clientes
 */

import { FunilEtapa } from '@/components/dashboard/funil-cone';

export const mockKpis = {
  impressoes: { value: 248_350, delta: 0.18 },
  cliques: { value: 5_120, delta: 0.22 },
  pageViews: { value: 4_380, delta: 0.15 },
  formIniciado: { value: 412, delta: 0.31 },
  formCompleto: { value: 287, delta: 0.28 }, // = MQLs
  leadQualificado: { value: 142, delta: 0.12 }, // = SQLs
  reunioesAgendadas: { value: 38, delta: 0.05 },
  vendas: { value: 9, delta: 0.5 },
};

export const mockReceita = {
  total: 72_000,
  delta: 0.5,
  ticketMedio: 8_000,
};

export const mockFunilEtapas: FunilEtapa[] = [
  { id: 'imp', label: 'Impressões', value: 248_350 },
  { id: 'click', label: 'Cliques', value: 5_120, cost: 0.85, costLabel: 'CPC' },
  { id: 'pv', label: 'Page Views', value: 4_380 },
  { id: 'form_in', label: 'Form Iniciado', value: 412 },
  { id: 'mql', label: 'MQL (Form Completo)', value: 287, cost: 18.5, costLabel: 'CPMQL' },
  { id: 'sql', label: 'Lead Qualificado', value: 142, cost: 37.4, costLabel: 'CPSQL' },
  { id: 'agendada', label: 'Reunião Agendada', value: 38 },
  { id: 'realizada', label: 'Reunião Realizada', value: 28 },
  { id: 'proposta', label: 'Proposta Enviada', value: 14 },
  { id: 'venda', label: 'Contrato Assinado', value: 9, cost: 592, costLabel: 'CAC' },
];

export const mockMetas = {
  leadsMes: { meta: 30, atual: 9, pace: 0.30 }, // 30%
  reunioesMes: { meta: 12, atual: 38, pace: 3.17 }, // 317% (acima da meta)
  vendasMes: { meta: 3, atual: 9, pace: 3.0 }, // 300%
  ticketMedio: { meta: 8000, atual: 8000, pace: 1.0 },
};

export const mockSaldoOrcamento = {
  budgetMensal: 12_000,
  gastoAteHoje: 5_330,
  saldoRestante: 6_670,
  projecaoFimMes: 11_840,
  diasUteisRestantes: 13,
};

export const mockMulticanal = [
  { canal: 'Meta Ads', spend: 4_200, conversoes: 7, share: 0.78 },
  { canal: 'Google Ads', spend: 800, conversoes: 1, share: 0.15 },
  { canal: 'Orgânico', spend: 0, conversoes: 1, share: 0.11 },
  { canal: 'WhatsApp', spend: 0, conversoes: 0, share: 0 },
];

export const mockVisaoDiaria = [
  { date: '2026-05-27', impressoes: 38_240, cliques: 745, spend: 620, conversoes: 1 },
  { date: '2026-05-28', impressoes: 41_180, cliques: 820, spend: 690, conversoes: 2 },
  { date: '2026-05-29', impressoes: 35_400, cliques: 710, spend: 590, conversoes: 1 },
  { date: '2026-05-30', impressoes: 39_950, cliques: 805, spend: 680, conversoes: 1 },
  { date: '2026-05-31', impressoes: 28_300, cliques: 580, spend: 470, conversoes: 1 },
  { date: '2026-06-01', impressoes: 32_180, cliques: 670, spend: 540, conversoes: 1 },
  { date: '2026-06-02', impressoes: 33_100, cliques: 790, spend: 560, conversoes: 2 },
];
