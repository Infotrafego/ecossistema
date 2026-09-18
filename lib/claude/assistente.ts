/**
 * Assistente IA conversacional (Fase 2c · C1)
 *
 * Divisão de trabalho, que é a tese da arquitetura WAT do CLAUDE.md:
 *
 *   · O modelo faz o que ele faz bem — entender que "pausa criativos com freq
 *     acima de 3.5 na campanha MLC" quer dizer ação `criativo.pausar`, escopo
 *     `ad`, filtro de campanha contendo "MLC", condição frequência > 3.5.
 *   · O código faz o resto — QUAIS anúncios casam esse filtro sai de uma query
 *     determinística sobre `metrics_daily`, não de um palpite do modelo.
 *
 * Isso importa porque a ação gasta verba de cliente. Um modelo que alucina um
 * id de anúncio pausa o anúncio errado; um filtro alucinado, na pior hipótese,
 * não casa com nada — e o usuário vê a lista vazia antes de confirmar.
 *
 * Nada aqui executa: a saída é um PLANO, que a UI mostra para confirmação.
 */

import type { ServiceClient } from '@/lib/supabase/service';
import { completar, extrairJson } from './client';
import { ACOES } from '@/lib/meta-ads/acoes';
import type { MetricaRegra, OperadorRegra } from '@/lib/regras';

export interface FiltroAlvo {
  escopo: 'campaign' | 'adset' | 'ad';
  /** Substring do nome da entidade. */
  nomeContem?: string;
  /** Substring do nome da campanha à qual a entidade pertence. */
  campanhaContem?: string;
  /** Condição de métrica no período. */
  metrica?: MetricaRegra;
  operador?: OperadorRegra;
  valor?: number;
  /** Limita aos N piores/melhores pela métrica. */
  limite?: number;
}

export interface AcaoPlanejada {
  acaoId: string;
  filtro: FiltroAlvo;
  /** Ajuste percentual, quando a ação mexe em orçamento. */
  percentual?: number;
  justificativa: string;
}

export interface PlanoAssistente {
  entendimento: string;
  acoes: AcaoPlanejada[];
  /** Preenchido quando o comando é ambíguo demais pra virar ação. */
  duvida: string | null;
}

const ACOES_EXECUTAVEIS = ACOES.filter((a) => !a.local);

const SYSTEM = `Você é o assistente operacional de tráfego pago da Infotráfego.
Traduz comandos em português para um PLANO de ações na Meta Marketing API.

Você NÃO executa nada e NÃO inventa identificadores. Descreve alvos por FILTRO
(nome, campanha, métrica), nunca por id — quem resolve os ids é o sistema.

Ações disponíveis (use o id exato):
${ACOES_EXECUTAVEIS.map((a) => `- ${a.id} (${a.entidade}): ${a.descricao}`).join('\n')}

Métricas válidas em filtro: cpc, cpm, ctr, cpl, cpmql, spend, frequencia, conv_lm, leads.
Operadores válidos: gt, gte, lt, lte.
Escopos: campaign (campanhas), adset (públicos), ad (criativos/anúncios).

Regras:
- ctr e conv_lm são frações (0.015 = 1,5%), não percentuais.
- Se o comando não indicar claramente ação OU alvo, devolva "acoes": [] e escreva
  em "duvida" a pergunta que falta ser respondida. É melhor perguntar do que
  agir errado numa conta com verba.
- Nunca proponha mais de uma ação para o mesmo alvo.

Responda APENAS com JSON:
{"entendimento":"<o que você entendeu, uma frase>","acoes":[{"acaoId":"...","filtro":{"escopo":"ad","campanhaContem":"...","metrica":"frequencia","operador":"gt","valor":3.5,"limite":null},"percentual":null,"justificativa":"..."}],"duvida":null}`;

export interface ContextoAssistente {
  clientId: string;
  cliente: string;
  /** Nomes das campanhas, pra o modelo saber a que "MLC" se refere. */
  campanhas: string[];
  periodo: { desde: string; ate: string };
}

export async function interpretar(
  supabase: ServiceClient,
  comando: string,
  contexto: ContextoAssistente,
): Promise<PlanoAssistente> {
  const user = `Cliente: ${contexto.cliente}
Período em análise: ${contexto.periodo.desde} a ${contexto.periodo.ate}

Campanhas existentes nesta conta:
${contexto.campanhas.slice(0, 60).map((c) => `- ${c}`).join('\n') || '- (nenhuma)'}

Comando do gestor:
"""
${comando}
"""`;

  const resposta = await completar(supabase, {
    system: SYSTEM,
    user,
    finalidade: 'assistente',
    clientId: contexto.clientId,
    maxTokens: 1500,
    // Comando é sempre novo; cache longo só serviria pra repetir a leitura de
    // um comando idêntico feito no mesmo minuto.
    ttlHoras: 1,
  });

  const plano = extrairJson<PlanoAssistente>(resposta.texto);
  return normalizar(plano);
}

/**
 * Sanitiza o plano do modelo.
 *
 * Ação fora do catálogo, escopo inventado ou operador desconhecido são
 * descartados aqui — nunca chegam ao executor. É a fronteira entre a camada
 * probabilística e a determinística.
 */
function normalizar(plano: PlanoAssistente): PlanoAssistente {
  const escoposValidos = new Set(['campaign', 'adset', 'ad']);
  const operadoresValidos = new Set(['gt', 'gte', 'lt', 'lte']);
  const metricasValidas = new Set([
    'cpc', 'cpm', 'ctr', 'cpl', 'cpmql', 'spend', 'frequencia', 'conv_lm', 'leads',
  ]);

  const acoes = (plano.acoes ?? []).filter((a) => {
    const definicao = ACOES_EXECUTAVEIS.find((d) => d.id === a.acaoId);
    if (!definicao) return false;
    if (!a.filtro || !escoposValidos.has(a.filtro.escopo)) return false;
    if (a.filtro.metrica && !metricasValidas.has(a.filtro.metrica)) return false;
    if (a.filtro.operador && !operadoresValidos.has(a.filtro.operador)) return false;
    return true;
  });

  return {
    entendimento: String(plano.entendimento ?? ''),
    acoes,
    duvida:
      acoes.length === 0
        ? (plano.duvida ??
          'Não consegui transformar esse comando numa ação válida. Pode dizer qual ação e sobre quais itens?')
        : (plano.duvida ?? null),
  };
}
