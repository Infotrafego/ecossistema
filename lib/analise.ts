/**
 * Ações sugeridas e alertas · derivados dos dados, não de lista fixa
 *
 * Veio de `data/mock-intel.ts`, que saiu junto com os mocks. A lógica não
 * mudou: escalar quem está classificado como 'escalar', cortar quem queima
 * verba, e sinalizar combinações ruins dentro de criativos que, no agregado,
 * parecem saudáveis — o caso que o ranking sozinho esconde.
 *
 * Puro: recebe métricas já derivadas e devolve conclusões.
 */

import { METAS_PADRAO, fmtMoeda, fmtPct, type Metricas } from '@/lib/intel';

export interface Acao {
  prioridade: 'alta' | 'media' | 'baixa';
  tipo: string;
  alvo: string;
  /** Identificação da entidade, pra action toolbar saber no que agir. */
  alvoId: string;
  alvoTipo: 'creative' | 'adset' | 'ad';
  diagnostico: string;
  acao: string;
  impacto: string;
}

export interface EntradaAnalise {
  criativos: Metricas[];
  publicos: Metricas[];
  /** Combinação criativo × público (o ad). */
  combos: Array<Metricas & { criativoId: string; criativoNome: string; publicoNome: string }>;
}

const ORDEM_PRIORIDADE = { alta: 0, media: 1, baixa: 2 } as const;

export function acoesSugeridas(dados: EntradaAnalise, metas = METAS_PADRAO): Acao[] {
  const acoes: Acao[] = [];

  for (const c of dados.criativos.filter((x) => x.alerta === 'escalar').slice(0, 3)) {
    acoes.push({
      prioridade: 'alta',
      tipo: 'Escalar',
      alvo: c.nome,
      alvoId: c.id,
      alvoTipo: 'creative',
      diagnostico: `CPL de ${fmtMoeda(c.cpl)} com ${fmtPct(c.convLm, 0)} de conversão L→M — ambos acima da meta.`,
      acao: 'Aumentar verba em 30% mantendo o mesmo público e monitorar frequência por 3 dias.',
      impacto: `+${Math.round(c.leads * 0.3)} leads/mês estimados`,
    });
  }

  for (const c of dados.criativos
    .filter((x) => x.alerta === 'cortar')
    .sort((a, b) => b.spend - a.spend)
    .slice(0, 3)) {
    acoes.push({
      prioridade: 'alta',
      tipo: 'Cortar',
      alvo: c.nome,
      alvoId: c.id,
      alvoTipo: 'creative',
      diagnostico:
        c.leads === 0
          ? `Investiu ${fmtMoeda(c.spend, 0)} sem gerar nenhum lead.`
          : `CPL de ${fmtMoeda(c.cpl)} — mais de 1,5× a meta de ${fmtMoeda(metas.cplMax, 0)}.`,
      acao: 'Pausar o criativo e realocar a verba para os campeões do mesmo público.',
      impacto: `${fmtMoeda(c.spend, 0)} liberados por ciclo`,
    });
  }

  // Combinações fracas dentro de criativos saudáveis no agregado.
  const criativosOk = new Set(
    dados.criativos.filter((c) => c.alerta === 'escalar' || c.alerta === 'ok').map((c) => c.id),
  );
  for (const combo of dados.combos
    .filter((k) => criativosOk.has(k.criativoId) && k.alerta === 'cortar' && k.spend > 100)
    .sort((a, b) => b.spend - a.spend)
    .slice(0, 3)) {
    acoes.push({
      prioridade: 'media',
      tipo: 'Isolar',
      alvo: `${combo.criativoNome} × ${combo.publicoNome}`,
      alvoId: combo.id,
      alvoTipo: 'ad',
      diagnostico: 'O criativo vai bem no geral, mas esta combinação específica está puxando o CPL para cima.',
      acao: 'Excluir o criativo deste ad set e manter apenas nos públicos onde ele converte.',
      impacto: `${fmtMoeda(combo.spend, 0)} realocados`,
    });
  }

  for (const p of dados.publicos
    .filter((x) => x.alerta === 'atencao' || x.alerta === 'cortar')
    .sort((a, b) => b.spend - a.spend)
    .slice(0, 2)) {
    acoes.push({
      prioridade: 'baixa',
      tipo: 'Renovar público',
      alvo: p.nome,
      alvoId: p.id,
      alvoTipo: 'adset',
      diagnostico: `Conversão L→M de ${fmtPct(p.convLm, 0)}, abaixo da meta, com ${fmtMoeda(p.spend, 0)} investidos.`,
      acao: 'Atualizar a semente do lookalike ou trocar por interesse novo antes de subir verba.',
      impacto: 'Reduz risco de saturação no próximo ciclo',
    });
  }

  return acoes.sort((a, b) => ORDEM_PRIORIDADE[a.prioridade] - ORDEM_PRIORIDADE[b.prioridade]);
}

// ── Alertas da Visão Geral ───────────────────────────────────────────────────

export interface Alerta {
  tipo: 'cortar' | 'escalar' | 'atencao';
  nome: string;
  mensagem: string;
  spend: number;
}

/**
 * Lista de alertas ativos, ordenada por urgência e depois por verba em jogo.
 *
 * O corte de `spend > metas.cplMax` no nível 'atenção' é deliberado: item com
 * R$ 5 gastos e conversão ruim é ruído estatístico, não problema — enche a
 * lista e afunda o alerta que importa.
 */
export function alertasAtivos(criativos: Metricas[], metas = METAS_PADRAO, limite = 10): Alerta[] {
  const alertas: Alerta[] = [];

  for (const c of criativos) {
    if (c.alerta === 'cortar') {
      alertas.push({
        tipo: 'cortar',
        nome: c.nome,
        mensagem:
          c.leads === 0
            ? `Gastou ${fmtMoeda(c.spend, 0)} sem leads — pausar.`
            : `CPL ${fmtMoeda(c.cpl)} acima do limite de ${fmtMoeda(metas.cplMax * 1.5, 0)}.`,
        spend: c.spend,
      });
    } else if (c.alerta === 'escalar') {
      alertas.push({
        tipo: 'escalar',
        nome: c.nome,
        mensagem: `${c.leads} leads · CPL ${fmtMoeda(c.cpl)} · L→M ${fmtPct(c.convLm, 0)} — escalar verba.`,
        spend: c.spend,
      });
    } else if (c.alerta === 'atencao' && c.spend > metas.cplMax) {
      alertas.push({
        tipo: 'atencao',
        nome: c.nome,
        mensagem:
          c.cpl !== null && c.cpl > metas.cplMax
            ? `CPL ${fmtMoeda(c.cpl)} acima da meta de ${fmtMoeda(metas.cplMax, 0)}.`
            : `Conversão L→M de ${fmtPct(c.convLm, 0)}, abaixo da meta.`,
        spend: c.spend,
      });
    }
  }

  const ordem = { cortar: 0, escalar: 1, atencao: 2 } as const;
  return alertas
    .sort((a, b) => ordem[a.tipo] - ordem[b.tipo] || b.spend - a.spend)
    .slice(0, limite);
}

// ── Visão por dia da semana ──────────────────────────────────────────────────

export interface LinhaDia {
  date: string;
  spend: number;
  leads: number;
  mqls: number;
  agend: number;
  reunioes: number;
  vendas: number;
}

export interface LinhaDiaDaSemana {
  dow: number;
  nome: string;
  dias: number;
  spend: number;
  leads: number;
  mqls: number;
  agend: number;
  reunioes: number;
  vendas: number;
  melhor: boolean;
  pior: boolean;
}

const NOMES_DOW = ['domingo', 'segunda', 'terça', 'quarta', 'quinta', 'sexta', 'sábado'];

/**
 * Agrupa o período por dia da semana.
 *
 * `dias` conta quantas datas distintas caíram naquele dia da semana — sem isso
 * um período de 10 dias compararia 2 segundas com 1 sábado como se fossem a
 * mesma amostra. Melhor/pior sai por vendas, com leads como desempate.
 */
export function porDiaDaSemana(diario: LinhaDia[]): LinhaDiaDaSemana[] {
  const mapa = new Map<number, LinhaDiaDaSemana & { datas: Set<string> }>();

  for (const linha of diario) {
    // `T00:00:00Z` explícito: sem o fuso, `new Date('2026-09-18')` é UTC mas
    // `getDay()` é local — em UTC-3 toda data cairia no dia anterior.
    const dow = new Date(`${linha.date}T00:00:00Z`).getUTCDay();
    let atual = mapa.get(dow);
    if (!atual) {
      atual = {
        dow,
        nome: NOMES_DOW[dow],
        dias: 0,
        spend: 0,
        leads: 0,
        mqls: 0,
        agend: 0,
        reunioes: 0,
        vendas: 0,
        melhor: false,
        pior: false,
        datas: new Set<string>(),
      };
      mapa.set(dow, atual);
    }
    atual.spend += linha.spend;
    atual.leads += linha.leads;
    atual.mqls += linha.mqls;
    atual.agend += linha.agend;
    atual.reunioes += linha.reunioes;
    atual.vendas += linha.vendas;
    atual.datas.add(linha.date);
  }

  const linhas = Array.from(mapa.values())
    .map(({ datas, ...resto }) => ({ ...resto, dias: datas.size }))
    .sort((a, b) => a.dow - b.dow);

  const comVolume = [...linhas]
    .filter((l) => l.leads > 0)
    .sort((a, b) => b.vendas - a.vendas || b.leads - a.leads);

  if (comVolume.length >= 2) {
    const melhor = comVolume[0].dow;
    const pior = comVolume[comVolume.length - 1].dow;
    for (const l of linhas) {
      l.melhor = l.dow === melhor;
      l.pior = l.dow === pior;
    }
  }

  return linhas;
}
