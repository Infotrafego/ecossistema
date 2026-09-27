/**
 * Central CS · lógica pura da carteira a partir da escuta dos grupos
 *
 * Recebe as linhas das views `cs_escuta_*` (migration 20260927000000) e monta o
 * que a tela mostra: status, risk score, touchpoints, pendências, volume por
 * categoria e tendência de sentimento de cada cliente.
 *
 * O risk score aqui é PARCIAL — só o que a escuta enxerga (insatisfação, erro
 * reportado, tom do grupo, silêncio do cliente, pendências nossas). NPS, métrica
 * de mídia e contrato entram quando tiverem fonte; até lá a tela diz isso.
 *
 * Sem I/O: `hoje` entra como parâmetro, pra verificação rodar com data fixa
 * (scripts/verificar/nucleo.ts).
 */

// ── Linhas das views ─────────────────────────────────────────────────────────

export type CategoriaEscuta = 'DEMANDA' | 'ERRO' | 'INSATISFACAO' | 'ELOGIO';

export interface LinhaEscutaCliente {
  client_slug: string;
  cliente: string;
  grupos: number;
  escuta_desde: string | null;
  ultima_mensagem: string | null;
  ultima_mensagem_cliente: string | null;
  ultima_mensagem_time: string | null;
}

export interface LinhaEscutaSinal {
  id: number;
  client_slug: string;
  cliente: string;
  grupo: string | null;
  dia: string;
  scanned_at: string;
  categoria: CategoriaEscuta;
  sentimento: number | null;
  urgencia: string | null;
  autor_papel: 'cliente' | 'time' | null;
  assunto: string;
  virou_subtarefa: boolean;
}

export interface LinhaEscutaDiaria {
  client_slug: string;
  cliente: string;
  dia: string;
  grupos_com_conversa: number;
  sinais: number;
  demandas: number;
  erros: number;
  insatisfacoes: number;
  elogios: number;
  sentimento_cliente: number | null;
  sentimento_resumo: number | null;
}

export interface LinhaEscutaPendencia {
  client_slug: string;
  cliente: string;
  grupo: string | null;
  dia: string;
  atualizado_em: string;
  lado: 'nossa' | 'cliente';
  ordem: number;
  item: string;
}

export interface DadosEscuta {
  clientes: LinhaEscutaCliente[];
  sinais: LinhaEscutaSinal[];
  diaria: LinhaEscutaDiaria[];
  pendencias: LinhaEscutaPendencia[];
}

// ── Modelo da tela ───────────────────────────────────────────────────────────

export type StatusCs = 'risco' | 'atencao' | 'saudavel';
export type Sentimento = 'positivo' | 'neutro' | 'negativo';
export type Prioridade = 'alta' | 'media' | 'baixa';

export interface Touchpoint {
  id: number;
  dia: string; // ISO yyyy-mm-dd
  canal: string; // "WhatsApp" ou "WhatsApp · <grupo>"
  categoria: CategoriaEscuta;
  assunto: string;
  sentimento: Sentimento;
  autor: 'cliente' | 'time' | null;
  virouSubtarefa: boolean;
}

export interface Pendencia {
  item: string;
  grupo: string | null;
  dia: string; // dia do resumo que listou a pendência
  diasDesde: number;
}

export interface SinalRisco {
  tipo: 'insatisfacao' | 'erro' | 'tom' | 'silencio' | 'pendencias';
  prioridade: Prioridade;
  peso: number;
  msg: string;
}

export interface PontoTendencia {
  dia: string;
  /** Tom geral do dia no resumo, -1..1. `null` = sem conversa no dia. */
  tom: number | null;
  sinais: number;
}

export type Volume = Record<CategoriaEscuta, number>;

export interface ClienteCs {
  id: string; // slug
  nome: string;
  grupos: number;
  escutaDesde: string | null;
  status: StatusCs;
  riskScore: number;
  saudeEmoji: string;
  ultimaMensagemCliente: string | null;
  diasSemMsgCliente: number | null;
  sinais7d: number;
  volume7d: Volume;
  volume30d: Volume;
  /** Média -2..2 dos sinais escritos pelo cliente nos últimos 7 dias. */
  sentimentoCliente7d: number | null;
  tendencia: {
    pontos: PontoTendencia[];
    tom7d: number | null;
    tom7dAnterior: number | null;
    direcao: 'subindo' | 'caindo' | 'estavel' | 'sem_dados';
  };
  touchpoints: Touchpoint[];
  pendencias: { nossas: Pendencia[]; deles: Pendencia[] };
  sinaisRisco: SinalRisco[];
  proximaAcao: string;
}

export interface AlertaCarteira extends SinalRisco {
  clienteId: string;
  cliente: string;
}

export interface CarteiraCs {
  hoje: string;
  escutaDesde: string | null;
  clientes: ClienteCs[];
  alertas: AlertaCarteira[];
  kpis: {
    total: number;
    saudaveis: number;
    atencao: number;
    emRisco: number;
    sinais7d: number;
    pendenciasNossas: number;
    pendenciasDeles: number;
    tom7d: number | null;
  };
}

// ── Parâmetros ───────────────────────────────────────────────────────────────

export const JANELA_TENDENCIA_DIAS = 14;
export const JANELA_VOLUME_DIAS = 30;
export const MAX_TOUCHPOINTS = 12;
export const LIMIAR_RISCO = 60;
export const LIMIAR_ATENCAO = 35;

const DIA_MS = 86_400_000;
const ORDEM_STATUS: Record<StatusCs, number> = { risco: 0, atencao: 1, saudavel: 2 };
const ORDEM_PRIORIDADE: Record<Prioridade, number> = { alta: 0, media: 1, baixa: 2 };

// ── Datas ────────────────────────────────────────────────────────────────────

/** Data de hoje (yyyy-mm-dd) no fuso de Brasília. */
export function hojeBrt(agora: Date = new Date()): string {
  return new Intl.DateTimeFormat('en-CA', { timeZone: 'America/Sao_Paulo' }).format(agora);
}

/** Soma dias a uma data ISO (yyyy-mm-dd), sem fuso no caminho. */
export function somarDias(dia: string, n: number): string {
  const d = new Date(`${dia}T12:00:00Z`);
  return new Date(d.getTime() + n * DIA_MS).toISOString().slice(0, 10);
}

/** Dias corridos entre duas datas ISO (yyyy-mm-dd). */
export function diasEntre(de: string, ate: string): number {
  return Math.round(
    (new Date(`${ate}T12:00:00Z`).getTime() - new Date(`${de}T12:00:00Z`).getTime()) / DIA_MS,
  );
}

/** "2026-09-25" → "25/09". */
export function ddmm(dia: string): string {
  return `${dia.slice(8, 10)}/${dia.slice(5, 7)}`;
}

// ── Classificações ───────────────────────────────────────────────────────────

export function rotuloSentimento(v: number | null): Sentimento {
  if (v === null || v === 0) return 'neutro';
  return v > 0 ? 'positivo' : 'negativo';
}

export function statusDoScore(score: number): StatusCs {
  if (score >= LIMIAR_RISCO) return 'risco';
  if (score >= LIMIAR_ATENCAO) return 'atencao';
  return 'saudavel';
}

const EMOJI: Record<StatusCs, string> = { risco: '🔴', atencao: '🟡', saudavel: '🟢' };

function media(valores: Array<number | null>): number | null {
  const v = valores.filter((x): x is number => x !== null);
  if (!v.length) return null;
  return Math.round((v.reduce((a, b) => a + b, 0) / v.length) * 100) / 100;
}

function volumeVazio(): Volume {
  return { DEMANDA: 0, ERRO: 0, INSATISFACAO: 0, ELOGIO: 0 };
}

function plural(n: number, um: string, varios: string): string {
  return `${n} ${n === 1 ? um : varios}`;
}

// ── Risk score (só escuta) ───────────────────────────────────────────────────

/**
 * Sinais de risco e peso de cada um. A soma (0–100) é o risk score.
 *
 * Pesos pensados pra que uma semana de silêncio do cliente, sozinha, já ponha
 * em atenção (35); uma insatisfação (25) + qualquer outro sinal também; e duas
 * insatisfações com o tom do grupo negativo (50 + 15) ponham em risco — é a
 * frustração explícita que antecede o cancelamento, mais do que o volume de
 * pedidos.
 */
export function sinaisDeRisco(input: {
  sinais7d: LinhaEscutaSinal[];
  tom7d: number | null;
  tom7dAnterior: number | null;
  sentimentoCliente7d: number | null;
  diasSemMsgCliente: number | null;
  pendenciasNossas: Pendencia[];
}): SinalRisco[] {
  const out: SinalRisco[] = [];

  const insat = input.sinais7d.filter((s) => s.categoria === 'INSATISFACAO');
  if (insat.length) {
    out.push({
      tipo: 'insatisfacao',
      prioridade: 'alta',
      peso: Math.min(50, insat.length * 25),
      msg: `${plural(insat.length, 'insatisfação', 'insatisfações')} no grupo em 7 dias — "${insat[0].assunto}"`,
    });
  }

  const erros = input.sinais7d.filter((s) => s.categoria === 'ERRO' && s.autor_papel === 'cliente');
  if (erros.length) {
    const urgente = erros.some((e) => e.urgencia === 'alta');
    out.push({
      tipo: 'erro',
      prioridade: urgente ? 'alta' : 'media',
      peso: Math.min(20, erros.length * 10),
      msg: `${plural(erros.length, 'erro reportado', 'erros reportados')} pelo cliente em 7 dias — "${erros[0].assunto}"`,
    });
  }

  if (input.tom7d !== null && input.tom7d < 0) {
    out.push({
      tipo: 'tom',
      prioridade: 'alta',
      peso: 15,
      msg: `Tom do grupo negativo na semana (média ${input.tom7d.toLocaleString('pt-BR')})`,
    });
  } else if (
    input.tom7d !== null &&
    input.tom7dAnterior !== null &&
    input.tom7dAnterior - input.tom7d >= 0.5
  ) {
    out.push({
      tipo: 'tom',
      prioridade: 'media',
      peso: 10,
      msg: `Tom do grupo caiu: ${input.tom7dAnterior.toLocaleString('pt-BR')} → ${input.tom7d.toLocaleString('pt-BR')} na semana`,
    });
  } else if (input.sentimentoCliente7d !== null && input.sentimentoCliente7d < 0) {
    out.push({
      tipo: 'tom',
      prioridade: 'media',
      peso: 10,
      msg: `Mensagens do cliente com sentimento médio negativo na semana`,
    });
  }

  const d = input.diasSemMsgCliente;
  if (d !== null && d >= 7) {
    out.push({ tipo: 'silencio', prioridade: 'alta', peso: 35, msg: `Cliente sem mensagem no grupo há ${d} dias` });
  } else if (d !== null && d >= 4) {
    out.push({ tipo: 'silencio', prioridade: 'media', peso: 15, msg: `Cliente sem mensagem no grupo há ${d} dias` });
  }

  const p = input.pendenciasNossas;
  if (p.length) {
    const maisAntiga = Math.max(...p.map((x) => x.diasDesde));
    out.push({
      tipo: 'pendencias',
      prioridade: maisAntiga >= 2 ? 'media' : 'baixa',
      peso: Math.min(15, p.length * 5),
      msg: `${plural(p.length, 'pendência nossa', 'pendências nossas')} no último resumo (${ddmm(p[0].dia)})`,
    });
  }

  return out.sort(
    (a, b) => ORDEM_PRIORIDADE[a.prioridade] - ORDEM_PRIORIDADE[b.prioridade] || b.peso - a.peso,
  );
}

function proximaAcao(status: StatusCs, sinais: SinalRisco[], pendenciasNossas: number): string {
  if (sinais.length && status !== 'saudavel') return `${EMOJI[status]} ${sinais[0].msg}`;
  if (pendenciasNossas) return `🟢 Fechar ${plural(pendenciasNossas, 'pendência nossa', 'pendências nossas')} do grupo`;
  return '🟢 Sem sinal de risco na escuta';
}

// ── Montagem ─────────────────────────────────────────────────────────────────

export function montarCarteira(dados: DadosEscuta, hoje: string): CarteiraCs {
  const inicio7d = somarDias(hoje, -6);
  const inicio14d = somarDias(hoje, -13);
  const inicio30d = somarDias(hoje, -(JANELA_VOLUME_DIAS - 1));

  const clientes: ClienteCs[] = dados.clientes.map((c) => {
    const sinais = dados.sinais
      .filter((s) => s.client_slug === c.client_slug)
      .sort((a, b) => b.scanned_at.localeCompare(a.scanned_at) || b.id - a.id);
    const sinais7d = sinais.filter((s) => s.dia >= inicio7d);
    const sinais30d = sinais.filter((s) => s.dia >= inicio30d);

    const volume7d = volumeVazio();
    for (const s of sinais7d) volume7d[s.categoria]++;
    const volume30d = volumeVazio();
    for (const s of sinais30d) volume30d[s.categoria]++;

    const porDia = new Map(
      dados.diaria.filter((d) => d.client_slug === c.client_slug).map((d) => [d.dia, d]),
    );
    const pontos: PontoTendencia[] = [];
    for (let i = JANELA_TENDENCIA_DIAS - 1; i >= 0; i--) {
      const dia = somarDias(hoje, -i);
      const linha = porDia.get(dia);
      pontos.push({ dia, tom: linha?.sentimento_resumo ?? null, sinais: linha?.sinais ?? 0 });
    }
    const tom7d = media(pontos.filter((p) => p.dia >= inicio7d).map((p) => p.tom));
    const tom7dAnterior = media(pontos.filter((p) => p.dia >= inicio14d && p.dia < inicio7d).map((p) => p.tom));
    const direcao =
      tom7d === null
        ? 'sem_dados'
        : tom7dAnterior === null
          ? 'estavel'
          : tom7d - tom7dAnterior >= 0.25
            ? 'subindo'
            : tom7dAnterior - tom7d >= 0.25
              ? 'caindo'
              : 'estavel';

    const sentimentoCliente7d = media(
      sinais7d.filter((s) => s.autor_papel === 'cliente').map((s) => s.sentimento),
    );

    const pend = dados.pendencias
      .filter((p) => p.client_slug === c.client_slug)
      .sort((a, b) => b.dia.localeCompare(a.dia) || a.ordem - b.ordem);
    const paraPendencia = (p: LinhaEscutaPendencia): Pendencia => ({
      item: p.item,
      grupo: p.grupo,
      dia: p.dia,
      diasDesde: diasEntre(p.dia, hoje),
    });
    const nossas = pend.filter((p) => p.lado === 'nossa').map(paraPendencia);
    const deles = pend.filter((p) => p.lado === 'cliente').map(paraPendencia);

    // Sem nenhuma mensagem do cliente, o silêncio conta desde o início da escuta.
    const refSilencio = c.ultima_mensagem_cliente ?? c.escuta_desde;
    const diasSemMsgCliente = refSilencio ? Math.max(0, diasEntre(hojeBrt(new Date(refSilencio)), hoje)) : null;

    const sinaisRisco = sinaisDeRisco({
      sinais7d,
      tom7d,
      tom7dAnterior,
      sentimentoCliente7d,
      diasSemMsgCliente,
      pendenciasNossas: nossas,
    });
    const riskScore = Math.min(100, sinaisRisco.reduce((a, s) => a + s.peso, 0));
    const status = statusDoScore(riskScore);

    return {
      id: c.client_slug,
      nome: c.cliente,
      grupos: c.grupos,
      escutaDesde: c.escuta_desde,
      status,
      riskScore,
      saudeEmoji: EMOJI[status],
      ultimaMensagemCliente: c.ultima_mensagem_cliente,
      diasSemMsgCliente,
      sinais7d: sinais7d.length,
      volume7d,
      volume30d,
      sentimentoCliente7d,
      tendencia: { pontos, tom7d, tom7dAnterior, direcao },
      touchpoints: sinais.slice(0, MAX_TOUCHPOINTS).map((s) => ({
        id: s.id,
        dia: s.dia,
        canal: s.grupo ? `WhatsApp · ${s.grupo}` : 'WhatsApp',
        categoria: s.categoria,
        assunto: s.assunto,
        sentimento: rotuloSentimento(s.sentimento),
        autor: s.autor_papel,
        virouSubtarefa: s.virou_subtarefa,
      })),
      pendencias: { nossas, deles },
      sinaisRisco,
      proximaAcao: proximaAcao(status, sinaisRisco, nossas.length),
    };
  });

  clientes.sort(
    (a, b) =>
      ORDEM_STATUS[a.status] - ORDEM_STATUS[b.status] ||
      b.riskScore - a.riskScore ||
      a.nome.localeCompare(b.nome, 'pt-BR'),
  );

  const alertas: AlertaCarteira[] = clientes
    .flatMap((c) => c.sinaisRisco.map((s) => ({ ...s, clienteId: c.id, cliente: c.nome })))
    .sort((a, b) => ORDEM_PRIORIDADE[a.prioridade] - ORDEM_PRIORIDADE[b.prioridade] || b.peso - a.peso);

  const inicios = dados.clientes.map((c) => c.escuta_desde).filter((x): x is string => !!x).sort();

  return {
    hoje,
    escutaDesde: inicios[0] ?? null,
    clientes,
    alertas,
    kpis: {
      total: clientes.length,
      saudaveis: clientes.filter((c) => c.status === 'saudavel').length,
      atencao: clientes.filter((c) => c.status === 'atencao').length,
      emRisco: clientes.filter((c) => c.status === 'risco').length,
      sinais7d: clientes.reduce((a, c) => a + c.sinais7d, 0),
      pendenciasNossas: clientes.reduce((a, c) => a + c.pendencias.nossas.length, 0),
      pendenciasDeles: clientes.reduce((a, c) => a + c.pendencias.deles.length, 0),
      tom7d: media(clientes.map((c) => c.tendencia.tom7d)),
    },
  };
}
