/**
 * Configuração e trava de segurança do conector Meta Marketing API
 *
 * Decisão registrada: Marketing API DIRETA, não MCP. O MCP do Meta existe só
 * dentro do Cowork/Claude Desktop — não há runtime dele no container de
 * produção, então ele não serve como camada de integração do app.
 *
 * Tudo aqui lê `process.env` em tempo de chamada (nunca no topo do módulo):
 * essas variáveis são RUNTIME (Portainer), e resolver no import quebraria o
 * `next build`, que roda sem elas.
 */

export const META_API_VERSION = process.env.META_API_VERSION || 'v21.0';
export const META_GRAPH_URL = `https://graph.facebook.com/${META_API_VERSION}`;

export function getAccessToken(): string {
  const token = process.env.META_ACCESS_TOKEN;
  if (!token) {
    throw new Error(
      'META_ACCESS_TOKEN não configurado. Local: .env · Produção: Portainer (runtime).',
    );
  }
  return token;
}

/**
 * Teto de chamadas por execução de sync.
 *
 * O limite da Marketing API é por app/usuário e gira em torno de 200 chamadas
 * por hora para contas novas. Estourar não devolve erro simples: bloqueia a
 * conta por um tempo estimado que a própria API informa. Um teto explícito por
 * run é mais barato do que descobrir o bloqueio em produção.
 */
export const MAX_CALLS_PER_RUN = Number(process.env.META_MAX_CALLS_PER_RUN || 150);

/** Intervalo mínimo entre chamadas, para não disparar rajadas. */
export const MIN_CALL_INTERVAL_MS = Number(process.env.META_MIN_CALL_INTERVAL_MS || 250);

/** Tentativas por chamada (a 1ª não conta como retry). */
export const MAX_RETRIES = Number(process.env.META_MAX_RETRIES || 4);

/**
 * Contas liberadas para ESCRITA (Fase 2b).
 *
 * Regra do prompt de implementação: as ações da action toolbar gastam verba de
 * cliente real, então rodam só em conta sandbox/teste até o Pablo liberar. A
 * trava é uma allowlist explícita, não um booleano: liberar "produção" inteira
 * de uma vez é exatamente o acidente que se quer evitar.
 *
 * `META_WRITE_ALLOWED_ACCOUNTS=act_123,act_456`
 */
export function contasComEscritaLiberada(): string[] {
  return (process.env.META_WRITE_ALLOWED_ACCOUNTS || '')
    .split(',')
    .map((s) => s.trim())
    .filter(Boolean);
}

export function escritaLiberada(adAccountId: string): boolean {
  return contasComEscritaLiberada().includes(adAccountId);
}

/**
 * `true` quando a conta está numa allowlist de sandbox conhecida. Usado só para
 * marcar a linha de auditoria — a autorização de verdade é `escritaLiberada`.
 */
export function ehSandbox(adAccountId: string): boolean {
  const sandboxes = (process.env.META_SANDBOX_ACCOUNTS || '')
    .split(',')
    .map((s) => s.trim())
    .filter(Boolean);
  return sandboxes.length === 0 ? true : sandboxes.includes(adAccountId);
}

export class MetaWriteBloqueadaError extends Error {
  constructor(adAccountId: string) {
    super(
      `Escrita bloqueada para a conta ${adAccountId}. ` +
        'Adicione a conta em META_WRITE_ALLOWED_ACCOUNTS (Portainer) para liberar. ' +
        'Contas de cliente em produção só com autorização explícita do Pablo.',
    );
    this.name = 'MetaWriteBloqueadaError';
  }
}

/** Normaliza `123` / `act_123` para o formato que a Graph API espera. */
export function normalizarAdAccountId(id: string): string {
  const limpo = id.trim();
  return limpo.startsWith('act_') ? limpo : `act_${limpo}`;
}
