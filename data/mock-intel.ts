/**
 * Dataset MOCKADO da Inteligência de Dados · cliente piloto Infotráfego
 * (funil de aquisição de novos clientes)
 *
 * ⚠ O grão atômico aqui é a COMBINAÇÃO criativo × público. Criativos,
 * Públicos, Campanhas e o Raio-X são todos agregações dessa mesma base — é
 * isso que garante que as 5 abas sempre fechem no mesmo número.
 *
 * Quando o sync do Meta Ads real entrar, só a constante CRIATIVOS_BASE (e o
 * mapa de públicos) sai daqui e vira query no Supabase; toda a agregação
 * abaixo continua valendo.
 */

import {
  derivar,
  derivarTodas,
  totalizar,
  type Formato,
  type LinhaBruta,
  type Metricas,
  type Status,
} from '@/lib/intel';

// ── Campanhas e públicos ─────────────────────────────────────────────────────

export const CAMPANHAS = {
  test_cri: 'CAPTACAO_INF_APLICACAO_ABO_F_TESTECRIATIVOS',
  test_pub: 'CAPTACAO_INF_APLICACAO_ABO_F_TESTEPUBLICOS',
  escala: 'CAPTACAO_INF_APLICACAO_CBO_F_ESCALA',
  rmk: 'REMARKETING_INF_APLICACAO_ABO_F_RMK180D',
  topo: 'RECONHECIMENTO_INF_VIDEOVIEW_ABO_F_TOPO',
} as const;

type PublicoId = keyof typeof PUBLICOS;

/** Cada público (ad set) pertence a exatamente uma campanha. */
export const PUBLICOS = {
  lal_mql: { nome: '00_AUTO_F_LAL1%LeadsMQL', campanha: CAMPANHAS.test_cri },
  lal_convite: { nome: '00_AUTO_F_LAL1%Convite180D', campanha: CAMPANHAS.test_cri },
  int_gestores: { nome: '01_INT_F_GestoresTrafego', campanha: CAMPANHAS.test_pub },
  int_agencias: { nome: '02_INT_F_DonosAgencia', campanha: CAMPANHAS.test_pub },
  int_digitais: { nome: '03_INT_F_EmpreendedoresDigitais', campanha: CAMPANHAS.test_pub },
  lal_compradores: { nome: '04_AUTO_F_LAL2%Compradores', campanha: CAMPANHAS.escala },
  advantage: { nome: '05_AUTO_F_Advantage+', campanha: CAMPANHAS.escala },
  rmk_lp: { nome: '06_RMK_F_VisitantesLP180D', campanha: CAMPANHAS.rmk },
  rmk_vv: { nome: '07_RMK_F_VideoView75', campanha: CAMPANHAS.topo },
} as const;

// ── Base de criativos ────────────────────────────────────────────────────────

interface CriativoBase {
  id: string;
  nome: string;
  formato: Formato;
  status: Status;
  diasAtivo: number;
  /** Como o volume do criativo se reparte entre os públicos (pesos relativos). */
  split: Array<[PublicoId, number]>;
  spend: number;
  impressoes: number;
  cliques: number;
  pageViews: number;
  leads: number;
  mqls: number;
  agend: number;
}

const CRIATIVOS_BASE: CriativoBase[] = [
  { id: 'AD101', nome: 'AD101_VID_INF_ADS_AgenciaQueEntrega_A', formato: 'Vídeo', status: 'active', diasAtivo: 28,
    split: [['lal_mql', 4], ['int_gestores', 3], ['advantage', 3]],
    spend: 1420, impressoes: 29_800, cliques: 640, pageViews: 560, leads: 58, mqls: 44, agend: 6 },
  { id: 'AD102', nome: 'AD102_VID_INF_ADS_CEOCansadoDeAgencia_B', formato: 'Vídeo', status: 'active', diasAtivo: 28,
    split: [['lal_mql', 4], ['int_agencias', 4], ['advantage', 2]],
    spend: 1180, impressoes: 24_600, cliques: 530, pageViews: 470, leads: 49, mqls: 37, agend: 5 },
  { id: 'AD103', nome: 'AD103_IMG_INF_ADS_ProvaSocialCarv', formato: 'Imagem', status: 'active', diasAtivo: 26,
    split: [['int_gestores', 5], ['rmk_lp', 3], ['lal_convite', 2]],
    spend: 980, impressoes: 21_200, cliques: 445, pageViews: 380, leads: 41, mqls: 30, agend: 4 },
  { id: 'AD104', nome: 'AD104_VID_INF_ADS_MetodoReceitaPrevisivel', formato: 'Vídeo', status: 'active', diasAtivo: 28,
    split: [['lal_compradores', 4], ['int_digitais', 3], ['advantage', 3]],
    spend: 1340, impressoes: 27_400, cliques: 590, pageViews: 505, leads: 46, mqls: 32, agend: 5 },
  { id: 'AD105', nome: 'AD105_VID_INF_ADS_DepoimentoKedma', formato: 'Vídeo', status: 'active', diasAtivo: 24,
    split: [['rmk_lp', 5], ['lal_mql', 3], ['int_agencias', 2]],
    spend: 860, impressoes: 18_900, cliques: 395, pageViews: 340, leads: 38, mqls: 28, agend: 4 },
  { id: 'AD106', nome: 'AD106_IMG_INF_ADS_CPLQueAssusta', formato: 'Imagem', status: 'active', diasAtivo: 22,
    split: [['int_gestores', 4], ['int_digitais', 3], ['lal_convite', 3]],
    spend: 720, impressoes: 15_400, cliques: 310, pageViews: 265, leads: 27, mqls: 18, agend: 2 },
  { id: 'AD107', nome: 'AD107_VID_INF_ADS_LookerNuncaMais', formato: 'Vídeo', status: 'active', diasAtivo: 26,
    split: [['advantage', 4], ['lal_compradores', 3], ['int_agencias', 3]],
    spend: 1090, impressoes: 22_100, cliques: 470, pageViews: 400, leads: 35, mqls: 24, agend: 3 },
  { id: 'AD108', nome: 'AD108_VID_INF_ADS_BastidoresOperacao', formato: 'Vídeo', status: 'active', diasAtivo: 20,
    split: [['rmk_vv', 5], ['lal_convite', 3], ['int_digitais', 2]],
    spend: 640, impressoes: 13_800, cliques: 285, pageViews: 240, leads: 22, mqls: 15, agend: 2 },
  { id: 'AD109', nome: 'AD109_IMG_INF_ADS_Checklist7Erros', formato: 'Imagem', status: 'active', diasAtivo: 18,
    split: [['int_digitais', 5], ['rmk_lp', 3], ['lal_mql', 2]],
    spend: 520, impressoes: 11_600, cliques: 240, pageViews: 205, leads: 21, mqls: 15, agend: 2 },
  { id: 'AD110', nome: 'AD110_VID_INF_ADS_AntesDepoisStella', formato: 'Vídeo', status: 'active', diasAtivo: 21,
    split: [['lal_compradores', 4], ['int_gestores', 3], ['rmk_vv', 3]],
    spend: 780, impressoes: 16_200, cliques: 340, pageViews: 290, leads: 25, mqls: 17, agend: 2 },
  { id: 'AD111', nome: 'AD111_VID_INF_ADS_EscalaSemQueimarCaixa', formato: 'Vídeo', status: 'active', diasAtivo: 16,
    split: [['advantage', 5], ['lal_convite', 3], ['int_agencias', 2]],
    spend: 590, impressoes: 12_400, cliques: 255, pageViews: 215, leads: 16, mqls: 10, agend: 1 },
  { id: 'AD112', nome: 'AD112_IMG_INF_ADS_OfertaDiagnosticoGratis', formato: 'Imagem', status: 'active', diasAtivo: 14,
    split: [['int_agencias', 5], ['rmk_lp', 3], ['lal_mql', 2]],
    spend: 450, impressoes: 9_800, cliques: 200, pageViews: 170, leads: 14, mqls: 9, agend: 1 },
  { id: 'AD113', nome: 'AD113_VID_INF_ADS_GestorSozinhoNaOperacao', formato: 'Vídeo', status: 'active', diasAtivo: 12,
    split: [['int_digitais', 4], ['rmk_vv', 3], ['lal_compradores', 3]],
    spend: 410, impressoes: 8_900, cliques: 180, pageViews: 150, leads: 9, mqls: 5, agend: 1 },
  { id: 'AD114', nome: 'AD114_VID_INF_ADS_FunilQuebrado', formato: 'Vídeo', status: 'active', diasAtivo: 11,
    split: [['rmk_vv', 5], ['int_digitais', 3], ['lal_convite', 2]],
    spend: 380, impressoes: 8_100, cliques: 165, pageViews: 140, leads: 6, mqls: 3, agend: 0 },
  { id: 'AD115', nome: 'AD115_IMG_INF_ADS_NumerosDaAgencia', formato: 'Imagem', status: 'inactive', diasAtivo: 9,
    split: [['lal_convite', 5], ['rmk_vv', 5]],
    spend: 290, impressoes: 6_400, cliques: 130, pageViews: 108, leads: 3, mqls: 2, agend: 0 },
  { id: 'AD116', nome: 'AD116_VID_INF_ADS_ReuniaoEstrategica', formato: 'Vídeo', status: 'inactive', diasAtivo: 7,
    split: [['int_gestores', 5], ['rmk_vv', 5]],
    spend: 240, impressoes: 5_300, cliques: 108, pageViews: 88, leads: 2, mqls: 1, agend: 0 },
  { id: 'AD117', nome: 'AD117_IMG_INF_ADS_TesteCriativoNovo', formato: 'Imagem', status: 'inactive', diasAtivo: 5,
    split: [['lal_mql', 6], ['rmk_vv', 4]],
    spend: 190, impressoes: 4_200, cliques: 85, pageViews: 68, leads: 0, mqls: 0, agend: 0 },
  { id: 'AD118', nome: 'AD118_VID_INF_ADS_HookAgressivo', formato: 'Vídeo', status: 'inactive', diasAtivo: 4,
    split: [['int_digitais', 5], ['lal_convite', 5]],
    spend: 160, impressoes: 3_450, cliques: 72, pageViews: 56, leads: 0, mqls: 0, agend: 0 },
];

// ── Repartição em combinações ────────────────────────────────────────────────

/**
 * Reparte um inteiro em fatias proporcionais aos pesos (método do maior resto).
 *
 * A soma das fatias é EXATAMENTE o total e nenhuma fatia fica negativa — sem
 * isso, os agregados por criativo, público e campanha divergiriam entre si e
 * as abas mostrariam números diferentes para o mesmo período.
 */
function repartir(total: number, pesos: number[]): number[] {
  const soma = pesos.reduce((a, b) => a + b, 0);
  const exatos = pesos.map((p) => (total * p) / soma);
  const fatias = exatos.map(Math.floor);

  // Distribui as unidades restantes para quem tem o maior resto fracionário.
  let restante = total - fatias.reduce((a, b) => a + b, 0);
  const porResto = exatos
    .map((v, i) => ({ i, resto: v - Math.floor(v) }))
    .sort((a, b) => b.resto - a.resto);

  for (let k = 0; restante > 0; k++, restante--) {
    fatias[porResto[k % porResto.length].i] += 1;
  }

  return fatias;
}

export interface Combo extends LinhaBruta {
  criativoId: string;
  criativoNome: string;
  publicoId: string;
  publicoNome: string;
  campanha: string;
}

/** Base atômica: uma linha por criativo × público. */
export const COMBOS_BRUTOS: Combo[] = CRIATIVOS_BASE.flatMap((c) => {
  const pesos = c.split.map(([, p]) => p);
  const campos = {
    spend: repartir(Math.round(c.spend), pesos),
    impressoes: repartir(c.impressoes, pesos),
    cliques: repartir(c.cliques, pesos),
    pageViews: repartir(c.pageViews, pesos),
    leads: repartir(c.leads, pesos),
    mqls: repartir(c.mqls, pesos),
    agend: repartir(c.agend, pesos),
  };

  return c.split.map(([publicoId], i) => {
    const pub = PUBLICOS[publicoId];
    return {
      id: `${c.id}__${publicoId}`,
      nome: `${c.nome} × ${pub.nome}`,
      status: c.status,
      formato: c.formato,
      diasAtivo: c.diasAtivo,
      criativoId: c.id,
      criativoNome: c.nome,
      publicoId,
      publicoNome: pub.nome,
      campanha: pub.campanha,
      campanhas: [pub.campanha],
      publicos: [pub.nome],
      spend: campos.spend[i],
      impressoes: campos.impressoes[i],
      cliques: campos.cliques[i],
      pageViews: campos.pageViews[i],
      leads: campos.leads[i],
      mqls: campos.mqls[i],
      agend: campos.agend[i],
    };
  });
});

// ── Agregações ───────────────────────────────────────────────────────────────

/** Soma um grupo de combos numa única linha bruta identificada por id/nome. */
function agregar(combos: Combo[], id: string, nome: string, extra: Partial<LinhaBruta> = {}): LinhaBruta {
  return {
    id,
    nome,
    status: combos.some((c) => c.status === 'active') ? 'active' : 'inactive',
    campanhas: Array.from(new Set(combos.map((c) => c.campanha))),
    publicos: Array.from(new Set(combos.map((c) => c.publicoNome))),
    diasAtivo: Math.max(...combos.map((c) => c.diasAtivo ?? 0)),
    spend: combos.reduce((a, c) => a + c.spend, 0),
    impressoes: combos.reduce((a, c) => a + c.impressoes, 0),
    cliques: combos.reduce((a, c) => a + c.cliques, 0),
    pageViews: combos.reduce((a, c) => a + c.pageViews, 0),
    leads: combos.reduce((a, c) => a + c.leads, 0),
    mqls: combos.reduce((a, c) => a + c.mqls, 0),
    agend: combos.reduce((a, c) => a + c.agend, 0),
    ...extra,
  };
}

function agruparPor<K extends keyof Combo>(chave: K): Map<string, Combo[]> {
  const mapa = new Map<string, Combo[]>();
  for (const c of COMBOS_BRUTOS) {
    const k = String(c[chave]);
    const atual = mapa.get(k);
    if (atual) atual.push(c);
    else mapa.set(k, [c]);
  }
  return mapa;
}

/** Combo já com métricas derivadas — preserva criativoId/publicoNome/campanha. */
export type ComboMetricas = Combo & Metricas;

export const COMBOS: ComboMetricas[] = derivarTodas(COMBOS_BRUTOS);

export const CRIATIVOS: Metricas[] = CRIATIVOS_BASE.map((c) => {
  const combos = COMBOS_BRUTOS.filter((k) => k.criativoId === c.id);
  return derivar(agregar(combos, c.id, c.nome, { formato: c.formato, status: c.status }));
});

export const PUBLICOS_METRICAS: Metricas[] = Array.from(agruparPor('publicoId')).map(
  ([publicoId, combos]) => derivar(agregar(combos, publicoId, PUBLICOS[publicoId as PublicoId].nome)),
);

export const CAMPANHAS_METRICAS: Metricas[] = Array.from(agruparPor('campanha')).map(
  ([campanha, combos]) => derivar(agregar(combos, campanha, campanha)),
);

export const TOTAL: Metricas = totalizar(COMBOS_BRUTOS);

/** Criativos de uma campanha — usado no drill-down da aba Campanhas. */
export function criativosDaCampanha(campanha: string): Metricas[] {
  const combos = COMBOS_BRUTOS.filter((c) => c.campanha === campanha);
  const porCriativo = new Map<string, Combo[]>();
  for (const c of combos) {
    const atual = porCriativo.get(c.criativoId);
    if (atual) atual.push(c);
    else porCriativo.set(c.criativoId, [c]);
  }
  return Array.from(porCriativo).map(([id, cs]) =>
    derivar(agregar(cs, id, cs[0].criativoNome, { formato: cs[0].formato })),
  );
}

// ── Análise estratégica (aba Criativos) ──────────────────────────────────────

/**
 * Leitura qualitativa dos criativos campeões. Na Fase 3 isso vira chamada
 * Claude (Haiku, com cache em DB); por ora é texto curado pelo estrategista.
 */
export const ANALISE_CRIATIVOS: Record<string, { angulo: string; porque: string; proximoPasso: string }> = {
  AD101: {
    angulo: 'Autoridade · "agência que entrega" com prova de resultado logo nos 3s iniciais',
    porque: 'Melhor CPL do período com a maior conversão L→M — o lead chega já ciente da oferta.',
    proximoPasso: 'Escalar verba em 30% e derivar 2 variações trocando só o hook.',
  },
  AD102: {
    angulo: 'Dor · "CEO cansado de agência que só manda relatório"',
    porque: 'Segundo maior volume de MQL e conversão acima da meta em público de interesse.',
    proximoPasso: 'Duplicar para o público LAL2%Compradores, que ainda não viu esse ângulo.',
  },
  AD103: {
    angulo: 'Prova social · case Carv Group com número concreto',
    porque: 'Estático performando perto dos vídeos — sinal de que a prova numérica carrega sozinha.',
    proximoPasso: 'Produzir versão em vídeo do mesmo case e testar contra o estático.',
  },
  AD104: {
    angulo: 'Método · Receita Previsível como framework nomeado',
    porque: 'Maior alcance entre os campeões; conversão sustenta mesmo com volume alto.',
    proximoPasso: 'Manter verba e monitorar frequência — é o criativo mais perto de saturar.',
  },
  AD105: {
    angulo: 'Depoimento · cliente Kedma falando em primeira pessoa',
    porque: 'CPL baixo concentrado em remarketing: fecha bem quem já visitou a LP.',
    proximoPasso: 'Isolar num ad set só de remarketing com verba própria.',
  },
};

// ── Ações sugeridas (aba Otimizações) ────────────────────────────────────────

export interface Acao {
  prioridade: 'alta' | 'media' | 'baixa';
  tipo: string;
  alvo: string;
  diagnostico: string;
  acao: string;
  impacto: string;
}

/**
 * Deriva as ações a partir dos dados, não de uma lista fixa: escalar quem está
 * classificado como 'escalar', cortar quem queima verba, e sinalizar combos
 * ruins dentro de criativos bons (o caso que o ranking sozinho esconde).
 */
export function acoesSugeridas(): Acao[] {
  const acoes: Acao[] = [];

  for (const c of CRIATIVOS.filter((x) => x.alerta === 'escalar').slice(0, 3)) {
    acoes.push({
      prioridade: 'alta',
      tipo: 'Escalar',
      alvo: c.nome,
      diagnostico: `CPL de ${c.cpl!.toFixed(2).replace('.', ',')} com ${(c.convLm! * 100).toFixed(0)}% de conversão L→M — ambos acima da meta.`,
      acao: 'Aumentar verba em 30% mantendo o mesmo público e monitorar frequência por 3 dias.',
      impacto: `+${Math.round(c.leads * 0.3)} leads/mês estimados`,
    });
  }

  for (const c of CRIATIVOS.filter((x) => x.alerta === 'cortar').sort((a, b) => b.spend - a.spend).slice(0, 3)) {
    acoes.push({
      prioridade: 'alta',
      tipo: 'Cortar',
      alvo: c.nome,
      diagnostico: c.leads === 0
        ? `Investiu ${c.spend.toLocaleString('pt-BR')} sem gerar nenhum lead.`
        : `CPL de ${c.cpl!.toFixed(2).replace('.', ',')} — mais de 1,5× a meta.`,
      acao: 'Pausar o criativo e realocar a verba para os campeões do mesmo público.',
      impacto: `${c.spend.toLocaleString('pt-BR')} liberados por ciclo`,
    });
  }

  // Combos fracos dentro de criativos que, no agregado, parecem saudáveis.
  const criativosOk = new Set(CRIATIVOS.filter((c) => c.alerta === 'escalar' || c.alerta === 'ok').map((c) => c.id));
  for (const combo of COMBOS
    .filter((k) => criativosOk.has(k.criativoId) && k.alerta === 'cortar' && k.spend > 100)
    .sort((a, b) => b.spend - a.spend)
    .slice(0, 3)) {
    acoes.push({
      prioridade: 'media',
      tipo: 'Isolar',
      alvo: `${combo.criativoNome} × ${combo.publicoNome}`,
      diagnostico: 'O criativo vai bem no geral, mas esta combinação específica está puxando o CPL para cima.',
      acao: 'Excluir o criativo deste ad set e manter apenas nos públicos onde ele converte.',
      impacto: `${combo.spend.toLocaleString('pt-BR')} realocados`,
    });
  }

  const saturados = PUBLICOS_METRICAS
    .filter((p) => p.alerta === 'atencao' || p.alerta === 'cortar')
    .sort((a, b) => b.spend - a.spend)
    .slice(0, 2);
  for (const p of saturados) {
    acoes.push({
      prioridade: 'baixa',
      tipo: 'Renovar público',
      alvo: p.nome,
      diagnostico: `Conversão L→M de ${p.convLm ? (p.convLm * 100).toFixed(0) : 0}%, abaixo da meta, com ${p.spend.toLocaleString('pt-BR')} investidos.`,
      acao: 'Atualizar a semente do lookalike ou trocar por interesse novo antes de subir verba.',
      impacto: 'Reduz risco de saturação no próximo ciclo',
    });
  }

  const ordem = { alta: 0, media: 1, baixa: 2 };
  return acoes.sort((a, b) => ordem[a.prioridade] - ordem[b.prioridade]);
}
