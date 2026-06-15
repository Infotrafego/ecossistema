/**
 * Cliente Claude API · STUB pra você implementar
 *
 * Usos na Fase 2:
 * - Análise estratégica dos criativos (aba Criativos)
 * - Ações sugeridas priorizadas (aba Análise & Otimizações)
 * - Diagnóstico de fadiga (texto explicativo)
 *
 * Docs: https://docs.anthropic.com/en/api/getting-started
 */

import Anthropic from '@anthropic-ai/sdk';

let _client: Anthropic | null = null;

function getClient() {
  if (!_client) {
    if (!process.env.ANTHROPIC_API_KEY) {
      throw new Error('ANTHROPIC_API_KEY não configurado');
    }
    _client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });
  }
  return _client;
}

/**
 * Chama Claude Sonnet com prompt template
 *
 * TODO Pablo: implementar caching · streaming · error handling
 */
export async function complete({
  system,
  user,
  maxTokens = 4096,
  model = 'claude-sonnet-4-5-20250929',
}: {
  system: string;
  user: string;
  maxTokens?: number;
  model?: string;
}): Promise<string> {
  const client = getClient();

  const response = await client.messages.create({
    model,
    max_tokens: maxTokens,
    system,
    messages: [{ role: 'user', content: user }],
  });

  const block = response.content[0];
  if (block.type !== 'text') throw new Error('Resposta inesperada do Claude');
  return block.text;
}

/**
 * Analisa um criativo específico e retorna análise estratégica
 *
 * Exemplo de uso na aba Criativos:
 *
 *   const analise = await analyzeCreative({
 *     creativeData: { name, ctr, spend, conversions, ... },
 *     contextoCliente: 'Infotráfego · agência de tráfego pago',
 *   });
 */
export async function analyzeCreative(args: {
  creativeData: Record<string, unknown>;
  contextoCliente: string;
}): Promise<string> {
  const system = `Você é um estrategista sênior de tráfego pago da Infotráfego.
Sua análise deve ser direta · técnica · com números específicos.
Tom: consultor · não vendedor. Evite superlativos.`;

  const user = `Cliente: ${args.contextoCliente}

Dados do criativo:
${JSON.stringify(args.creativeData, null, 2)}

Faça uma análise em 3 partes:
1. O QUE FUNCIONOU (1 frase com números)
2. O QUE NÃO FUNCIONOU (1 frase com números)
3. AÇÃO RECOMENDADA (1 frase específica e executável)`;

  return complete({ system, user, maxTokens: 1024 });
}
