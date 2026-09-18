/**
 * Cliente Claude API · Haiku com cache em banco
 *
 * Decisão registrada (conflito entre fontes, resolvido pela task do ClickUp):
 * o briefing técnico falava em Sonnet/Opus com orçamento mensal de R$ 1.500 a
 * 3.500; a task manda operar em free tier, preferindo Haiku, com cache em DB e
 * batch. Vale a task — custo depende de aprovação prévia do Pablo.
 *
 * Consequência prática: NENHUMA chamada sai daqui sem passar pelo cache. A
 * função `completar()` é o único caminho, e ela consulta `ia_cache` antes.
 */

import Anthropic from '@anthropic-ai/sdk';
import { createHash } from 'crypto';
import type { ServiceClient } from '@/lib/supabase/service';

/**
 * Haiku 4.5 é o padrão da fase. Trocar por um modelo maior muda o custo por
 * chamada — passa pelo Pablo antes.
 */
export const MODELO_PADRAO = 'claude-haiku-4-5-20251001';

let cliente: Anthropic | null = null;

function getCliente(): Anthropic {
  if (!cliente) {
    const apiKey = process.env.ANTHROPIC_API_KEY;
    if (!apiKey) {
      throw new Error('ANTHROPIC_API_KEY não configurado (runtime · Portainer).');
    }
    cliente = new Anthropic({ apiKey });
  }
  return cliente;
}

export interface PedidoIA {
  system: string;
  user: string;
  finalidade: string;
  clientId?: string;
  maxTokens?: number;
  model?: string;
  /** Validade do cache em horas. Padrão: 24h, alinhado ao sync diário. */
  ttlHoras?: number;
  /** Ignora o cache de leitura (e regrava). Use com parcimônia: custa token. */
  forcar?: boolean;
}

export interface RespostaIA {
  texto: string;
  doCache: boolean;
  modelo: string;
  inputTokens: number;
  outputTokens: number;
}

/**
 * Chave do cache.
 *
 * Inclui o modelo porque a mesma pergunta em modelos diferentes é resposta
 * diferente, e inclui a finalidade pra facilitar invalidar uma feature inteira
 * sem derrubar o cache das outras.
 */
function chaveDeCache(pedido: PedidoIA, modelo: string): string {
  const material = JSON.stringify({
    modelo,
    finalidade: pedido.finalidade,
    system: pedido.system,
    user: pedido.user,
  });
  return createHash('sha256').update(material).digest('hex');
}

/**
 * Executa um pedido, preferindo o cache.
 *
 * Falha de cache (leitura ou escrita) nunca derruba a chamada: cache é
 * otimização de custo, não dependência funcional. Mas falha da API derruba,
 * porque aí não há resposta.
 */
export async function completar(
  supabase: ServiceClient,
  pedido: PedidoIA,
): Promise<RespostaIA> {
  const modelo = pedido.model ?? MODELO_PADRAO;
  const chave = chaveDeCache(pedido, modelo);
  const agora = new Date();

  if (!pedido.forcar) {
    try {
      const { data } = await supabase
        .from('ia_cache')
        .select('resposta, model, input_tokens, output_tokens, hits, expires_at')
        .eq('cache_key', chave)
        .maybeSingle();

      if (data && new Date(data.expires_at) > agora) {
        // Contador de hits: é o que mostra se o cache está pagando o próprio
        // custo de complexidade.
        await supabase
          .from('ia_cache')
          .update({ hits: data.hits + 1 })
          .eq('cache_key', chave);

        return {
          texto: data.resposta,
          doCache: true,
          modelo: data.model,
          inputTokens: data.input_tokens,
          outputTokens: data.output_tokens,
        };
      }
    } catch {
      // Segue para a API.
    }
  }

  const resposta = await getCliente().messages.create({
    model: modelo,
    max_tokens: pedido.maxTokens ?? 1024,
    system: pedido.system,
    messages: [{ role: 'user', content: pedido.user }],
  });

  const bloco = resposta.content.find((b) => b.type === 'text');
  if (!bloco || bloco.type !== 'text') {
    throw new Error('O Claude respondeu sem bloco de texto.');
  }

  const ttl = (pedido.ttlHoras ?? 24) * 3_600_000;
  const resultado: RespostaIA = {
    texto: bloco.text,
    doCache: false,
    modelo,
    inputTokens: resposta.usage.input_tokens,
    outputTokens: resposta.usage.output_tokens,
  };

  try {
    await supabase.from('ia_cache').upsert({
      cache_key: chave,
      client_id: pedido.clientId ?? null,
      finalidade: pedido.finalidade,
      model: modelo,
      resposta: resultado.texto,
      input_tokens: resultado.inputTokens,
      output_tokens: resultado.outputTokens,
      hits: 0,
      expires_at: new Date(agora.getTime() + ttl).toISOString(),
    });
  } catch {
    // Não gravou no cache: a resposta continua válida, só vai custar de novo.
  }

  return resultado;
}

/**
 * Extrai JSON de uma resposta.
 *
 * O modelo às vezes embrulha o JSON em ```json ... ``` ou antecede com uma
 * frase, mesmo instruído a não fazer. Tentar recortar é mais barato do que
 * gastar outra chamada pedindo de novo.
 */
export function extrairJson<T>(texto: string): T {
  const semCerca = texto.replace(/```(?:json)?/gi, '').trim();
  const inicio = semCerca.search(/[[{]/);
  if (inicio === -1) throw new Error(`Resposta sem JSON: ${texto.slice(0, 200)}`);

  const fim = Math.max(semCerca.lastIndexOf(']'), semCerca.lastIndexOf('}'));
  if (fim === -1) throw new Error(`JSON truncado: ${texto.slice(0, 200)}`);

  return JSON.parse(semCerca.slice(inicio, fim + 1)) as T;
}
