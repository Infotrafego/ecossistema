/**
 * Diagnóstico de fadiga criativa · lógica pura (Fase 2c · C2)
 *
 * O briefing pede o score "a partir da curva de decay do CTR ao longo do
 * tempo". A curva sozinha, porém, dá falso positivo: um criativo que caiu de
 * 3% para 2,4% de CTR mas continua com frequência 1,2 e CPC estável não está
 * saturado — está normalizando depois do pico inicial de novidade.
 *
 * Por isso o score combina três sinais, que são os mesmos que o mockup lista
 * (`CTR drop >20% (Critical) · Freq >3.5 (Warning) · CPC ↑15% (Warning)`):
 *
 *   · queda de CTR   (0-60 pts) — o sinal principal
 *   · frequência     (0-25 pts) — quantas vezes a mesma pessoa já viu
 *   · alta de CPC    (0-15 pts) — o leilão cobrando mais pelo mesmo clique
 *
 * A escala do CTR é calibrada pelo limiar que o próprio mockup usa: queda de
 * 20% já é sinal de alerta, então 20% vale exatamente os 35 pontos que colocam
 * o criativo em "atenção" mesmo sem nenhum outro sinal. Com o peso menor que
 * isso, uma queda de 25% com frequência baixa saía como "saudável" — e o
 * criativo seguia queimando verba sem ninguém ser avisado.
 *
 * Tudo puro e determinístico: dá pra rodar contra uma série salva e conferir.
 */

export interface PontoDiario {
  date: string;
  impressoes: number;
  cliques: number;
  spend: number;
  /** Frequência média do dia, quando a Meta reportou. */
  frequencia?: number | null;
}

export type StatusFadiga = 'saudavel' | 'atencao' | 'critico';

export interface DiagnosticoFadiga {
  score: number;
  status: StatusFadiga;
  diasAtivo: number;
  ctrInicial: number | null;
  ctrRecente: number | null;
  quedaCtr: number | null;
  cpcInicial: number | null;
  cpcRecente: number | null;
  altaCpc: number | null;
  frequencia: number | null;
  /** Ação sugerida em uma frase, no vocabulário do gestor. */
  recomendacao: string;
  /** Por que o score deu isso — cada sinal que pontuou. */
  motivos: string[];
}

/**
 * Dias de cada ponta da janela.
 *
 * Um único dia de cada lado tornaria o score refém de um sábado fraco; três
 * dias suavizam sem esconder a tendência.
 */
const JANELA = 3;

/** Abaixo disto a amostra é pequena demais pra afirmar qualquer coisa. */
const MIN_IMPRESSOES_JANELA = 500;
const MIN_DIAS = 5;

function ctrDe(pontos: PontoDiario[]): number | null {
  const impressoes = pontos.reduce((s, p) => s + p.impressoes, 0);
  if (impressoes < MIN_IMPRESSOES_JANELA) return null;
  const cliques = pontos.reduce((s, p) => s + p.cliques, 0);
  return cliques / impressoes;
}

function cpcDe(pontos: PontoDiario[]): number | null {
  const cliques = pontos.reduce((s, p) => s + p.cliques, 0);
  if (cliques === 0) return null;
  return pontos.reduce((s, p) => s + p.spend, 0) / cliques;
}

/** Frequência do período: média ponderada pelas impressões do dia. */
function frequenciaDe(pontos: PontoDiario[]): number | null {
  let peso = 0;
  let soma = 0;
  for (const p of pontos) {
    if (typeof p.frequencia === 'number' && p.frequencia > 0 && p.impressoes > 0) {
      soma += p.frequencia * p.impressoes;
      peso += p.impressoes;
    }
  }
  return peso > 0 ? soma / peso : null;
}

export function diagnosticar(serie: PontoDiario[]): DiagnosticoFadiga {
  const pontos = [...serie]
    .filter((p) => p.impressoes > 0)
    .sort((a, b) => a.date.localeCompare(b.date));

  const diasAtivo = pontos.length;
  // Frequência da JANELA RECENTE, não do período inteiro: saturação é um
  // estado do agora. A média dos 14 dias de um criativo que começou em 1,2 e
  // está em 3,9 dá 2,5 — e esconde exatamente o dia em que ele saturou.
  const frequencia = frequenciaDe(pontos.slice(-JANELA));

  const base: Omit<DiagnosticoFadiga, 'score' | 'status' | 'recomendacao' | 'motivos'> = {
    diasAtivo,
    ctrInicial: null,
    ctrRecente: null,
    quedaCtr: null,
    cpcInicial: null,
    cpcRecente: null,
    altaCpc: null,
    frequencia,
  };

  // Criativo novo não tem curva. Chamar isso de "saudável" é honesto: ainda não
  // há evidência de desgaste — o que não é o mesmo que estar performando bem.
  if (diasAtivo < MIN_DIAS) {
    return {
      ...base,
      score: 0,
      status: 'saudavel',
      recomendacao: `Só ${diasAtivo} dia(s) de entrega — sem histórico suficiente pra medir fadiga. Continuar.`,
      motivos: ['Histórico curto demais para diagnóstico.'],
    };
  }

  const inicio = pontos.slice(0, JANELA);
  const recente = pontos.slice(-JANELA);

  const ctrInicial = ctrDe(inicio);
  const ctrRecente = ctrDe(recente);
  const cpcInicial = cpcDe(inicio);
  const cpcRecente = cpcDe(recente);

  const quedaCtr =
    ctrInicial !== null && ctrRecente !== null && ctrInicial > 0
      ? (ctrInicial - ctrRecente) / ctrInicial
      : null;

  const altaCpc =
    cpcInicial !== null && cpcRecente !== null && cpcInicial > 0
      ? (cpcRecente - cpcInicial) / cpcInicial
      : null;

  const motivos: string[] = [];
  let score = 0;

  // ── CTR (0-60) ──
  if (quedaCtr !== null && quedaCtr > 0) {
    // 20% de queda = 35 pontos, que é o limiar de "atenção": o sinal principal
    // sozinho já precisa acender a luz amarela. Satura em 60 por volta de 34%
    // de queda — passado esse ponto, o criativo já morreu e o quanto exatamente
    // ele piorou não muda a decisão.
    const pontosCtr = Math.min(60, (quedaCtr / 0.2) * 35);
    score += pontosCtr;
    if (quedaCtr >= 0.2) {
      motivos.push(`CTR caiu ${(quedaCtr * 100).toFixed(0)}% desde os primeiros dias.`);
    }
  }

  // ── Frequência (0-25) ──
  if (frequencia !== null && frequencia > 2) {
    // 2,0 é normal; 3,5 é o alerta do mockup; 5 satura a escala.
    const pontosFreq = Math.min(25, ((frequencia - 2) / 3) * 25);
    score += pontosFreq;
    if (frequencia >= 3.5) {
      motivos.push(`Frequência em ${frequencia.toFixed(1)} — a mesma pessoa já viu várias vezes.`);
    }
  }

  // ── CPC (0-15) ──
  if (altaCpc !== null && altaCpc > 0) {
    const pontosCpc = Math.min(15, (altaCpc / 0.5) * 15);
    score += pontosCpc;
    if (altaCpc >= 0.15) {
      motivos.push(`CPC subiu ${(altaCpc * 100).toFixed(0)}% no mesmo período.`);
    }
  }

  const arredondado = Math.round(Math.min(100, score));
  const status: StatusFadiga =
    arredondado >= 60 ? 'critico' : arredondado >= 35 ? 'atencao' : 'saudavel';

  if (motivos.length === 0) {
    motivos.push('Nenhum sinal de desgaste relevante nos três indicadores.');
  }

  return {
    ...base,
    ctrInicial,
    ctrRecente,
    quedaCtr,
    cpcInicial,
    cpcRecente,
    altaCpc,
    score: arredondado,
    status,
    recomendacao: recomendar(status, quedaCtr, frequencia),
    motivos,
  };
}

function recomendar(
  status: StatusFadiga,
  quedaCtr: number | null,
  frequencia: number | null,
): string {
  if (status === 'critico') {
    return frequencia !== null && frequencia >= 3.5
      ? 'Pausar e substituir: a frequência indica que o público já foi saturado por este criativo.'
      : 'Substituir: a queda de CTR não se reverte sozinha com mais verba.';
  }
  if (status === 'atencao') {
    return quedaCtr !== null && quedaCtr >= 0.2
      ? 'Preparar variação do mesmo ângulo trocando o hook, antes que o CPL suba.'
      : 'Monitorar de perto e segurar aumentos de verba até o CTR estabilizar.';
  }
  return 'Continuar: o criativo ainda não dá sinal de desgaste.';
}

export const INFO_FADIGA: Record<StatusFadiga, { label: string; icone: string; classe: string }> = {
  saudavel: { label: 'Saudável', icone: '🟢', classe: 'bg-success/10 text-success border-success/30' },
  atencao: { label: 'Atenção', icone: '🟡', classe: 'bg-attention/10 text-attention border-attention/30' },
  critico: { label: 'Crítico', icone: '🔴', classe: 'bg-warn/10 text-warn border-warn/30' },
};
