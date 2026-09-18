/**
 * Saldo, orçamento e acompanhamento de metas · lógica pura
 *
 * Portado do mockup (`computeOrcamento` / `calcMetaStatus`), que tinha os
 * números chumbados. A ideia central dos dois é a mesma: comparar o RITMO com
 * o esperado para o ponto do mês, não o total com a meta do mês. 40% da verba
 * gasta no dia 5 é problema; no dia 20, é atraso.
 */

export type StatusRitmo = 'verde' | 'amarelo' | 'vermelho' | 'azul';

export interface EntradaOrcamento {
  tipo: 'pre_pago' | 'pos_pago';
  verbaMensal: number;
  saldoPrepago: number;
  /** Gasto acumulado no mês até hoje. */
  gastoMtd: number;
  diasDecorridos: number;
  diasDoMes: number;
}

export interface ResultadoOrcamento {
  tipo: EntradaOrcamento['tipo'];
  verba: number;
  gastoMtd: number;
  saldo: number;
  pctConsumido: number;
  pctDoMes: number;
  ritmoAtual: number;
  ritmoIdeal: number;
  forecast: number;
  deltaForecast: number;
  status: StatusRitmo;
  statusLabel: string;
  acao: string;
  /** Só para pré-pago: em quantos dias o saldo zera no ritmo atual. */
  diasAteZerar: number | null;
}

export function calcularOrcamento(e: EntradaOrcamento): ResultadoOrcamento {
  const verba = e.verbaMensal;
  const saldo = verba - e.gastoMtd;
  const diasDecorridos = Math.max(1, e.diasDecorridos);
  const diasRestantes = Math.max(0, e.diasDoMes - diasDecorridos);

  const pctConsumido = verba > 0 ? (e.gastoMtd / verba) * 100 : 0;
  const pctDoMes = (diasDecorridos / e.diasDoMes) * 100;
  const ritmoAtual = e.gastoMtd / diasDecorridos;
  const ritmoIdeal = verba / e.diasDoMes;
  const forecast = ritmoAtual * e.diasDoMes;
  const deltaForecast = verba > 0 ? ((forecast - verba) / verba) * 100 : 0;

  let status: StatusRitmo;
  let statusLabel: string;
  let acao: string;

  if (deltaForecast > 10) {
    status = 'vermelho';
    statusLabel = '🔴 Risco de estourar';
    const alvo = diasRestantes > 0 ? saldo / diasRestantes : 0;
    acao =
      diasRestantes > 0
        ? `Reduzir o gasto diário para ${brl(alvo)}/dia nos próximos ${diasRestantes} dias pra encaixar na verba.`
        : 'O mês fechou acima da verba. Revisar antes do próximo ciclo.';
  } else if (deltaForecast > 5) {
    status = 'amarelo';
    statusLabel = '🟡 Acelerando · revisar diários';
    acao = 'Conferir as campanhas em escala e ajustar o orçamento diário pra não estourar.';
  } else if (deltaForecast < -10) {
    status = 'azul';
    statusLabel = '🔵 Subutilizando verba';
    acao = `Sobra projetada de ${brl(verba - forecast)} · acelerar os criativos vencedores ou abrir verba de teste.`;
  } else {
    status = 'verde';
    statusLabel = '🟢 No ritmo';
    acao = 'Pace alinhado com a meta · manter o monitoramento diário.';
  }

  return {
    tipo: e.tipo,
    verba,
    gastoMtd: e.gastoMtd,
    saldo,
    pctConsumido,
    pctDoMes,
    ritmoAtual,
    ritmoIdeal,
    forecast,
    deltaForecast,
    status,
    statusLabel,
    acao,
    diasAteZerar:
      e.tipo === 'pre_pago' && ritmoAtual > 0 ? Math.round(e.saldoPrepago / ritmoAtual) : null,
  };
}

export interface EntradaMeta {
  chave: string;
  label: string;
  meta: number;
  realizado: number;
  /** 'custo' = queremos ficar PERTO da meta; 'positivo' = queremos superar. */
  tipo: 'positivo' | 'custo';
  formato: 'numero' | 'moeda';
}

export interface ResultadoMeta extends EntradaMeta {
  esperadoHoje: number;
  pctAtingido: number;
  pctEsperado: number;
  razao: number;
  projecaoFimDoMes: number;
  deltaProjecao: number;
  status: StatusRitmo;
  statusLabel: string;
}

/**
 * Status de uma meta no ponto atual do mês.
 *
 * Investimento é do tipo 'custo' e inverte a leitura: estar 30% ACIMA do
 * esperado é ruim, não ótimo. Tratar os dois com a mesma régua faria o painel
 * pintar de verde um cliente prestes a estourar a verba.
 */
export function calcularMeta(
  e: EntradaMeta,
  diasDecorridos: number,
  diasDoMes: number,
): ResultadoMeta {
  const dias = Math.max(1, diasDecorridos);
  const esperadoHoje = e.meta * (dias / diasDoMes);
  const pctAtingido = e.meta > 0 ? (e.realizado / e.meta) * 100 : 0;
  const pctEsperado = (dias / diasDoMes) * 100;
  const razao = esperadoHoje > 0 ? e.realizado / esperadoHoje : 0;
  const projecaoFimDoMes = (e.realizado / dias) * diasDoMes;
  const deltaProjecao = e.meta > 0 ? ((projecaoFimDoMes - e.meta) / e.meta) * 100 : 0;

  let status: StatusRitmo;
  let statusLabel: string;

  if (e.tipo === 'custo') {
    if (razao > 1.15) {
      status = 'vermelho';
      statusLabel = '🔴 Superinvestindo';
    } else if (razao > 1.05) {
      status = 'amarelo';
      statusLabel = '🟡 Acima do ritmo';
    } else if (razao < 0.85) {
      status = 'azul';
      statusLabel = '🔵 Subinvestindo';
    } else {
      status = 'verde';
      statusLabel = '🟢 No ritmo';
    }
  } else if (razao >= 1) {
    status = 'verde';
    statusLabel = '🟢 No ritmo';
  } else if (razao >= 0.85) {
    status = 'amarelo';
    statusLabel = '🟡 Atenção';
  } else {
    status = 'vermelho';
    statusLabel = '🔴 Atrasado';
  }

  return {
    ...e,
    esperadoHoje,
    pctAtingido,
    pctEsperado,
    razao,
    projecaoFimDoMes,
    deltaProjecao,
    status,
    statusLabel,
  };
}

export const CLASSE_STATUS: Record<StatusRitmo, { texto: string; barra: string; borda: string }> = {
  verde: { texto: 'text-success', barra: 'bg-success', borda: 'border-success/40' },
  amarelo: { texto: 'text-attention', barra: 'bg-attention', borda: 'border-attention/40' },
  vermelho: { texto: 'text-warn', barra: 'bg-warn', borda: 'border-warn/40' },
  azul: { texto: 'text-navy', barra: 'bg-navy', borda: 'border-navy/40' },
};

/** Dias do mês de uma data — fevereiro de ano bissexto incluso. */
export function diasNoMes(ano: number, mes: number): number {
  return new Date(Date.UTC(ano, mes, 0)).getUTCDate();
}

function brl(v: number): string {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
    maximumFractionDigits: 0,
  }).format(v);
}
