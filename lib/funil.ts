/**
 * Funil modular · taxonomia e reconhecimento automático
 *
 * Um funil NÃO é um tipo fechado: é a combinação de 5 atributos (família ·
 * sub-objetivo · modo de captura · etapas · marcadores). O app renderiza cone,
 * KPIs e tabelas a partir dessa config — por isso a inferência abaixo é
 * determinística (regras sobre os nomes dos campos da fonte), não ML.
 *
 * Fonte das regras: BRIEFING_01_INTELIGENCIA_DE_DADOS.md (revisão 12/05/2026).
 *
 * ⚠ Os ids de `EtapaId` e `ModoCaptura` são CONTRATO com o banco: a migration
 * 20260918000000_taxonomia_funil.sql amarra os CHECKs de `funis` exatamente a
 * estes valores. Mudar um id aqui exige migration de dados junto.
 */

export type Familia = 'distribuicao' | 'captacao' | 'venda_direta' | 'lancamento';

export type SubObjetivo =
  // distribuição
  | 'c1_atracao' | 'c2_nutricao' | 'c3_levantada'
  // captação
  | 'sessao_estrategica' | 'aplicacao_direta' | 'webinario_gratuito' | 'webinario_pago' | 'isca_digital'
  // venda direta
  | 'produto_digital' | 'produto_fisico' | 'aumento_base'
  // lançamento
  | 'lancamento_semente' | 'lancamento_tradicional_3wb' | 'lancamento_pago';

export type ModoCaptura =
  | 'landing_page'
  | 'formulario_nativo'
  | 'click_to_whatsapp'
  | 'instagram_dm'
  | 'multi';

export type EtapaId =
  // mídia
  | 'impressao' | 'alcance' | 'clique' | 'page_view'
  | 'vv_25' | 'vv_50' | 'vv_75' | 'vv_complete'
  // captação
  | 'form_iniciado' | 'lead' | 'lead_magnet'
  | 'aplicacao_iniciada' | 'aplicacao_completa'
  | 'inscricao_evento' | 'confirmacao_evento' | 'evento_ao_vivo' | 'assistiu_evento' | 'replay'
  | 'mql'
  // comercial
  | 'lead_qualificado' | 'agendamento' | 'call_realizada' | 'no_show'
  | 'proposta_enviada' | 'venda'
  // venda direta
  | 'vis_produto' | 'add_carrinho' | 'checkout_iniciado' | 'compra'
  // distribuição
  | 'seguidores' | 'visita_perfil' | 'engajamento' | 'mensagens' | 'save' | 'compartilhamento'
  // lançamento
  | 'aquecimento_view' | 'lembrete_view' | 'carrinho_aberto';

export const FAMILIAS: Record<Familia, { nome: string; icone: string; desc: string }> = {
  distribuicao: { nome: 'Distribuição', icone: '◑', desc: 'Audiência · sem comercial' },
  captacao: { nome: 'Captação', icone: '◆', desc: 'Gera lead pra comercial' },
  venda_direta: { nome: 'Venda Direta', icone: '◈', desc: 'Checkout' },
  lancamento: { nome: 'Lançamento', icone: '▲', desc: 'Janela de carrinho' },
};

export const SUBOBJETIVOS: Record<Familia, Array<{ id: SubObjetivo; nome: string; desc: string }>> = {
  distribuicao: [
    { id: 'c1_atracao', nome: 'C1 · Atração', desc: 'Crescimento de audiência nova' },
    { id: 'c2_nutricao', nome: 'C2 · Nutrição', desc: 'Aquecimento de quem já conhece' },
    { id: 'c3_levantada', nome: 'C3 · Levantada de mão', desc: 'Mensagens e engajamento' },
  ],
  captacao: [
    { id: 'sessao_estrategica', nome: 'Sessão estratégica', desc: 'Aplicação → qualificação → reunião' },
    { id: 'aplicacao_direta', nome: 'Aplicação direta', desc: 'Formulário longo sem isca' },
    { id: 'webinario_gratuito', nome: 'Webinário gratuito', desc: 'Inscrição → evento → oferta' },
    { id: 'webinario_pago', nome: 'Webinário pago', desc: 'Ingresso pago antes do evento' },
    { id: 'isca_digital', nome: 'Isca digital', desc: 'Material rico em troca do lead' },
  ],
  venda_direta: [
    { id: 'produto_digital', nome: 'Produto digital', desc: 'Checkout direto sem MQL' },
    { id: 'produto_fisico', nome: 'Produto físico', desc: 'Carrinho → checkout' },
    { id: 'aumento_base', nome: 'Aumento de base', desc: 'Recompra e LTV' },
  ],
  lancamento: [
    { id: 'lancamento_semente', nome: 'Semente', desc: 'Lista pequena · alta conversão' },
    { id: 'lancamento_tradicional_3wb', nome: 'Tradicional 3+ webinários', desc: 'CPL → carrinho' },
    { id: 'lancamento_pago', nome: 'Lançamento pago', desc: 'Evento pago como filtro' },
  ],
};

/** Todos os sub-objetivos válidos, achatados — usado na validação do server. */
export const SUBOBJETIVOS_VALIDOS: SubObjetivo[] = Object.values(SUBOBJETIVOS).flatMap((lista) =>
  lista.map((s) => s.id),
);

export const CAPTURAS: Record<ModoCaptura, { nome: string; desc: string }> = {
  landing_page: { nome: 'Landing Page', desc: 'Tem Page View' },
  formulario_nativo: { nome: 'Formulário Nativo Meta', desc: 'Sem Page View' },
  click_to_whatsapp: { nome: 'Click-to-WhatsApp', desc: 'Direto pra conversa' },
  instagram_dm: { nome: 'Instagram DM', desc: 'CTA pra DM' },
  multi: { nome: 'Múltiplos modos', desc: 'Mais de um ponto de entrada' },
};

interface EtapaDef {
  label: string;
  /** Famílias que oferecem esta etapa no pool do wizard. */
  familias: Familia[];
  grupo: 'mídia' | 'captação' | 'comercial' | 'venda' | 'audiência';
}

const TODAS: Familia[] = ['distribuicao', 'captacao', 'venda_direta', 'lancamento'];

export const ETAPAS: Record<EtapaId, EtapaDef> = {
  impressao: { label: 'Impressões', familias: TODAS, grupo: 'mídia' },
  alcance: { label: 'Alcance', familias: TODAS, grupo: 'mídia' },
  clique: { label: 'Cliques', familias: TODAS, grupo: 'mídia' },
  page_view: { label: 'Page View', familias: ['captacao', 'venda_direta', 'lancamento'], grupo: 'mídia' },
  vv_25: { label: 'Video View 25%', familias: ['distribuicao', 'lancamento'], grupo: 'mídia' },
  vv_50: { label: 'Video View 50%', familias: ['distribuicao', 'lancamento'], grupo: 'mídia' },
  vv_75: { label: 'Video View 75%', familias: ['distribuicao', 'lancamento'], grupo: 'mídia' },
  vv_complete: { label: 'Video View 100%', familias: ['distribuicao', 'lancamento'], grupo: 'mídia' },

  form_iniciado: { label: 'Formulário iniciado', familias: ['captacao'], grupo: 'captação' },
  lead: { label: 'Lead', familias: ['captacao', 'lancamento'], grupo: 'captação' },
  lead_magnet: { label: 'Lead magnet baixado', familias: ['captacao'], grupo: 'captação' },
  aplicacao_iniciada: { label: 'Aplicação iniciada', familias: ['captacao'], grupo: 'captação' },
  aplicacao_completa: { label: 'Aplicação completa', familias: ['captacao'], grupo: 'captação' },
  inscricao_evento: { label: 'Inscrição no evento', familias: ['captacao', 'lancamento'], grupo: 'captação' },
  confirmacao_evento: { label: 'Confirmação de presença', familias: ['captacao', 'lancamento'], grupo: 'captação' },
  evento_ao_vivo: { label: 'Presença ao vivo', familias: ['captacao', 'lancamento'], grupo: 'captação' },
  assistiu_evento: { label: 'Assistiu o evento', familias: ['captacao', 'lancamento'], grupo: 'captação' },
  replay: { label: 'Replay assistido', familias: ['captacao', 'lancamento'], grupo: 'captação' },
  mql: { label: 'MQL', familias: ['captacao', 'lancamento'], grupo: 'captação' },

  lead_qualificado: { label: 'Lead qualificado (SQL)', familias: ['captacao'], grupo: 'comercial' },
  agendamento: { label: 'Reunião agendada', familias: ['captacao'], grupo: 'comercial' },
  call_realizada: { label: 'Reunião realizada', familias: ['captacao'], grupo: 'comercial' },
  no_show: { label: 'No-show', familias: ['captacao'], grupo: 'comercial' },
  proposta_enviada: { label: 'Proposta enviada', familias: ['captacao'], grupo: 'comercial' },
  venda: { label: 'Venda / contrato', familias: ['captacao', 'venda_direta', 'lancamento'], grupo: 'comercial' },

  vis_produto: { label: 'Visualização de produto', familias: ['venda_direta'], grupo: 'venda' },
  add_carrinho: { label: 'Adicionar ao carrinho', familias: ['venda_direta'], grupo: 'venda' },
  checkout_iniciado: { label: 'Checkout iniciado', familias: ['venda_direta', 'lancamento'], grupo: 'venda' },
  compra: { label: 'Compra', familias: ['venda_direta'], grupo: 'venda' },

  seguidores: { label: 'Novos seguidores', familias: ['distribuicao'], grupo: 'audiência' },
  visita_perfil: { label: 'Visitas ao perfil', familias: ['distribuicao'], grupo: 'audiência' },
  engajamento: { label: 'Engajamento', familias: ['distribuicao'], grupo: 'audiência' },
  mensagens: { label: 'Mensagens iniciadas', familias: ['distribuicao'], grupo: 'audiência' },
  save: { label: 'Salvamentos', familias: ['distribuicao'], grupo: 'audiência' },
  compartilhamento: { label: 'Compartilhamentos', familias: ['distribuicao'], grupo: 'audiência' },

  aquecimento_view: { label: 'Aula de aquecimento', familias: ['lancamento'], grupo: 'captação' },
  lembrete_view: { label: 'Lembrete visto', familias: ['lancamento'], grupo: 'captação' },
  carrinho_aberto: { label: 'Carrinho aberto', familias: ['lancamento'], grupo: 'venda' },
};

export const ETAPAS_VALIDAS = Object.keys(ETAPAS) as EtapaId[];

export function isEtapaId(v: string): v is EtapaId {
  return Object.prototype.hasOwnProperty.call(ETAPAS, v);
}

export interface ConfigFunil {
  id?: string;
  cliente: string;
  /** client_id do Supabase — preenchido quando a config vem do/vai pro banco. */
  clientId?: string;
  nome: string;
  familia: Familia | null;
  subObjetivo: SubObjetivo | null;
  captura: ModoCaptura | null;
  etapas: EtapaId[];
  marcadorMkt: EtapaId | null;
  marcadorCom: EtapaId | null;
  metas: Partial<Record<EtapaId, number>>;
}

export const CONFIG_VAZIA: ConfigFunil = {
  cliente: '',
  nome: '',
  familia: null,
  subObjetivo: null,
  captura: null,
  etapas: [],
  marcadorMkt: null,
  marcadorCom: null,
  metas: {},
};

// ── Reconhecimento automático ────────────────────────────────────────────────

export interface Reconhecimento {
  camposDetectados: EtapaId[];
  familia: Familia;
  subObjetivo: SubObjetivo;
  captura: ModoCaptura;
  marcadorMkt: EtapaId | null;
  marcadorCom: EtapaId | null;
  confianca: 'alta' | 'média' | 'baixa';
  kpiPrimario: string;
}

/** Ordem canônica das etapas no cone — o funil sempre segue esta sequência. */
const ORDEM: EtapaId[] = [
  'impressao', 'alcance', 'clique', 'page_view',
  'vv_25', 'vv_50', 'vv_75', 'vv_complete',
  'visita_perfil', 'seguidores', 'engajamento', 'save', 'compartilhamento', 'mensagens',
  'form_iniciado', 'lead_magnet', 'lead',
  'inscricao_evento', 'confirmacao_evento', 'aquecimento_view', 'lembrete_view',
  'evento_ao_vivo', 'assistiu_evento', 'replay',
  'aplicacao_iniciada', 'aplicacao_completa', 'mql',
  'lead_qualificado', 'agendamento', 'call_realizada', 'no_show', 'proposta_enviada',
  'vis_produto', 'add_carrinho', 'carrinho_aberto', 'checkout_iniciado', 'compra', 'venda',
];

export function ordenarEtapas(etapas: EtapaId[]): EtapaId[] {
  return [...etapas].sort((a, b) => ORDEM.indexOf(a) - ORDEM.indexOf(b));
}

/**
 * Classifica família e sub-objetivo pela presença de campos.
 *
 * As regras são avaliadas em ordem de especificidade: a combinação mais
 * restritiva vence, para que um funil de sessão estratégica (que também tem
 * `lead`) não caia na regra genérica de isca digital.
 */
function classificar(campos: Set<EtapaId>): { familia: Familia; subObjetivo: SubObjetivo } {
  const tem = (...ids: EtapaId[]) => ids.every((id) => campos.has(id));

  if (tem('aplicacao_completa', 'mql', 'agendamento', 'venda'))
    return { familia: 'captacao', subObjetivo: 'sessao_estrategica' };
  if (tem('aquecimento_view', 'lembrete_view', 'carrinho_aberto'))
    return { familia: 'lancamento', subObjetivo: 'lancamento_tradicional_3wb' };
  if (tem('inscricao_evento', 'evento_ao_vivo', 'venda'))
    return { familia: 'captacao', subObjetivo: 'webinario_gratuito' };
  if (tem('add_carrinho', 'checkout_iniciado'))
    return { familia: 'venda_direta', subObjetivo: 'produto_fisico' };
  if (tem('checkout_iniciado') && !campos.has('mql'))
    return { familia: 'venda_direta', subObjetivo: 'produto_digital' };
  if (tem('aplicacao_completa', 'mql'))
    return { familia: 'captacao', subObjetivo: 'aplicacao_direta' };
  if (tem('lead_magnet', 'mql') && !campos.has('aplicacao_completa'))
    return { familia: 'captacao', subObjetivo: 'isca_digital' };
  if (tem('mensagens', 'engajamento'))
    return { familia: 'distribuicao', subObjetivo: 'c3_levantada' };
  if (tem('vv_75', 'vv_complete') && !campos.has('lead'))
    return { familia: 'distribuicao', subObjetivo: 'c2_nutricao' };
  if (campos.has('seguidores'))
    return { familia: 'distribuicao', subObjetivo: 'c1_atracao' };

  // Fallback: tem lead e nada mais específico → captação por isca.
  return { familia: 'captacao', subObjetivo: 'isca_digital' };
}

function inferirCaptura(campos: Set<EtapaId>): ModoCaptura {
  if (campos.has('mensagens') && campos.has('page_view')) return 'multi';
  if (campos.has('mensagens')) return 'click_to_whatsapp';
  if (campos.has('page_view')) return 'landing_page';
  if (campos.has('lead')) return 'formulario_nativo';
  return 'multi';
}

/** MKT termina na primeira etapa qualificada disponível, nesta ordem de prioridade. */
function inferirMarcadorMkt(campos: Set<EtapaId>): EtapaId | null {
  for (const id of ['mql', 'lead', 'lead_magnet', 'aplicacao_completa'] as EtapaId[]) {
    if (campos.has(id)) return id;
  }
  return null;
}

/** COM termina na venda; sem venda, na última etapa comercial presente. */
function inferirMarcadorCom(etapas: EtapaId[]): EtapaId | null {
  if (etapas.includes('venda')) return 'venda';
  if (etapas.includes('compra')) return 'compra';
  const comerciais = etapas.filter((e) => ETAPAS[e].grupo === 'comercial' || ETAPAS[e].grupo === 'venda');
  return comerciais.length > 0 ? comerciais[comerciais.length - 1] : null;
}

export function reconhecer(camposDetectados: EtapaId[]): Reconhecimento {
  const etapas = ordenarEtapas(camposDetectados);
  const campos = new Set(etapas);
  const { familia, subObjetivo } = classificar(campos);
  const marcadorMkt = inferirMarcadorMkt(campos);
  const marcadorCom = inferirMarcadorCom(etapas);

  // Confiança cai quando a fonte tem poucos campos ou nenhum marcador comercial.
  const confianca: Reconhecimento['confianca'] =
    etapas.length >= 6 && marcadorMkt && marcadorCom ? 'alta'
      : etapas.length >= 4 ? 'média'
        : 'baixa';

  const kpiPrimario =
    familia === 'distribuicao' ? 'Custo por seguidor/engajamento'
      : familia === 'venda_direta' ? 'ROAS'
        : marcadorCom === 'venda' ? 'CAC (custo por contrato)'
          : marcadorMkt ? `Custo por ${ETAPAS[marcadorMkt].label}`
            : 'CPL';

  return { camposDetectados: etapas, familia, subObjetivo, captura: inferirCaptura(campos), marcadorMkt, marcadorCom, confianca, kpiPrimario };
}

// ── Fontes simuladas ─────────────────────────────────────────────────────────

/**
 * Enquanto o conector real (Sheets/API/DB) não existe, a detecção usa um
 * catálogo de fontes conhecidas. Trocar por leitura real dos cabeçalhos da
 * planilha não muda nada daqui pra baixo — `reconhecer()` continua igual.
 */
export const FONTES_EXEMPLO: Array<{
  chave: string;
  rotulo: string;
  cliente: string;
  nome: string;
  campos: EtapaId[];
}> = [
  {
    chave: 'infotrafego-aquisicao',
    rotulo: 'Infotráfego · Aquisição de clientes',
    cliente: 'Infotráfego',
    nome: 'Aquisição de Clientes',
    campos: ['impressao', 'clique', 'page_view', 'form_iniciado', 'aplicacao_completa', 'mql', 'lead_qualificado', 'agendamento', 'call_realizada', 'proposta_enviada', 'venda'],
  },
  {
    chave: 'kedma-isca',
    rotulo: 'Grupo Kedma · Isca digital',
    cliente: 'Grupo Kedma',
    nome: 'Isca Digital · E-book',
    campos: ['impressao', 'clique', 'page_view', 'lead_magnet', 'lead', 'mql'],
  },
  {
    chave: 'stella-distribuicao',
    rotulo: 'Stella Santini · Distribuição C2',
    cliente: 'Stella Santini',
    nome: 'Nutrição de audiência',
    campos: ['impressao', 'alcance', 'vv_25', 'vv_50', 'vv_75', 'vv_complete', 'save'],
  },
  {
    chave: 'carv-checkout',
    rotulo: 'Carv Group · Produto digital',
    cliente: 'Carv Group',
    nome: 'Venda direta · Mentoria',
    campos: ['impressao', 'clique', 'page_view', 'vis_produto', 'checkout_iniciado', 'compra', 'venda'],
  },
];
