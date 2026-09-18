/**
 * Camada HTTP do conector Meta · paginação, retry com backoff e rate limit
 *
 * Isolada do resto porque é a parte que o briefing marca como risco: estourar
 * o limite não devolve um erro simples, bloqueia a conta por um tempo que só a
 * própria API informa (`estimated_time_to_regain_access`, em minutos).
 *
 * Três proteções, em ordem de quem age primeiro:
 *   1. `Orcamento` — teto de chamadas por execução, contado antes de sair.
 *   2. Espaçamento mínimo entre chamadas, pra não mandar rajada.
 *   3. Retry com backoff exponencial + jitter, só nos erros que são transitórios.
 */

import {
  MAX_CALLS_PER_RUN,
  MAX_RETRIES,
  META_GRAPH_URL,
  MIN_CALL_INTERVAL_MS,
  getAccessToken,
} from './config';

export class MetaApiError extends Error {
  constructor(
    message: string,
    readonly status: number,
    readonly code?: number,
    readonly subcode?: number,
    readonly fbtraceId?: string,
  ) {
    super(message);
    this.name = 'MetaApiError';
  }
}

export class MetaRateLimitError extends MetaApiError {
  constructor(message: string, status: number, code: number | undefined, readonly esperarMs: number) {
    super(message, status, code);
    this.name = 'MetaRateLimitError';
  }
}

export class OrcamentoDeChamadasError extends Error {
  constructor(limite: number) {
    super(
      `Teto de ${limite} chamadas por execução atingido. ` +
        'O sync parou por conta própria pra não bloquear a conta na Meta; ' +
        'o que já foi gravado continua válido (upsert é idempotente).',
    );
    this.name = 'OrcamentoDeChamadasError';
  }
}

/**
 * Códigos de erro que valem retry.
 *
 * 1/2   · erro temporário genérico da plataforma
 * 4     · limite do app
 * 17    · limite do usuário
 * 32    · limite de página
 * 613   · limite de chamadas do recurso
 * 80000+ · limites por caso de uso (ads management, insights)
 *
 * 190 (token inválido) e 100 (parâmetro errado) NÃO entram: repetir só gasta
 * cota e atrasa o diagnóstico.
 */
const CODIGOS_TRANSITORIOS = new Set([1, 2, 4, 17, 32, 341, 613]);
const CODIGOS_RATE_LIMIT = new Set([4, 17, 32, 613, 80000, 80001, 80002, 80003, 80004, 80005, 80006, 80008, 80014]);

function ehRateLimit(code?: number): boolean {
  return code !== undefined && CODIGOS_RATE_LIMIT.has(code);
}

function ehTransitorio(code: number | undefined, status: number): boolean {
  if (status >= 500) return true;
  if (code === undefined) return false;
  return CODIGOS_TRANSITORIOS.has(code) || CODIGOS_RATE_LIMIT.has(code);
}

/**
 * Lê os headers de uso da Meta para descobrir quanto esperar.
 *
 * `x-business-use-case-usage` vem como JSON indexado por business id; cada
 * entrada traz percentuais de uso e, quando já houve bloqueio,
 * `estimated_time_to_regain_access` em MINUTOS.
 */
function esperaSugeridaMs(headers: Headers): number | null {
  for (const nome of ['x-business-use-case-usage', 'x-ad-account-usage', 'x-app-usage']) {
    const bruto = headers.get(nome);
    if (!bruto) continue;
    try {
      const parsed = JSON.parse(bruto) as unknown;
      const entradas: unknown[] = Array.isArray(parsed)
        ? parsed
        : Object.values(parsed as Record<string, unknown>).flatMap((v) => (Array.isArray(v) ? v : [v]));

      for (const entrada of entradas) {
        const e = entrada as Record<string, unknown> | null;
        const minutos = e && typeof e['estimated_time_to_regain_access'] === 'number'
          ? (e['estimated_time_to_regain_access'] as number)
          : 0;
        if (minutos > 0) return minutos * 60_000;
      }
    } catch {
      // Header malformado não é motivo pra derrubar o sync — cai no backoff padrão.
    }
  }
  return null;
}

/** Percentual de cota já consumido, para o sync registrar no log. */
export function usoDeCota(headers: Headers): number | null {
  const bruto = headers.get('x-business-use-case-usage') || headers.get('x-ad-account-usage');
  if (!bruto) return null;
  try {
    const parsed = JSON.parse(bruto) as Record<string, unknown>;
    const entradas = Object.values(parsed).flatMap((v) => (Array.isArray(v) ? v : [v]));
    let maior = 0;
    for (const entrada of entradas) {
      const e = entrada as Record<string, unknown>;
      for (const chave of ['call_count', 'total_cputime', 'total_time', 'acc_id_util_pct']) {
        const v = e?.[chave];
        if (typeof v === 'number' && v > maior) maior = v;
      }
    }
    return maior;
  } catch {
    return null;
  }
}

const dormir = (ms: number) => new Promise<void>((r) => setTimeout(r, ms));

/**
 * Orçamento de chamadas de uma execução.
 *
 * Instanciado uma vez por sync e passado adiante, em vez de um contador global:
 * dois clientes sincronizando em paralelo precisam de contas separadas, e teste
 * não pode herdar o estado do teste anterior.
 */
export class Orcamento {
  private usadas = 0;
  private ultimaChamadaEm = 0;
  /** Maior percentual de cota visto nos headers durante a execução. */
  picoDeUso: number | null = null;

  constructor(private readonly limite: number = MAX_CALLS_PER_RUN) {}

  get chamadas(): number {
    return this.usadas;
  }

  get restantes(): number {
    return Math.max(0, this.limite - this.usadas);
  }

  /** Reserva uma chamada e respeita o espaçamento mínimo. */
  async reservar(): Promise<void> {
    if (this.usadas >= this.limite) throw new OrcamentoDeChamadasError(this.limite);
    const desdeUltima = Date.now() - this.ultimaChamadaEm;
    if (this.ultimaChamadaEm > 0 && desdeUltima < MIN_CALL_INTERVAL_MS) {
      await dormir(MIN_CALL_INTERVAL_MS - desdeUltima);
    }
    this.usadas += 1;
    this.ultimaChamadaEm = Date.now();
  }

  registrarUso(headers: Headers): void {
    const uso = usoDeCota(headers);
    if (uso !== null && (this.picoDeUso === null || uso > this.picoDeUso)) {
      this.picoDeUso = uso;
    }
  }
}

interface RespostaMetaErro {
  error?: {
    message?: string;
    code?: number;
    error_subcode?: number;
    fbtrace_id?: string;
    type?: string;
  };
}

/**
 * Backoff exponencial com jitter.
 *
 * O jitter não é enfeite: sem ele, várias contas que falharam na mesma janela
 * voltam a bater na API exatamente no mesmo instante.
 */
function backoffMs(tentativa: number): number {
  const base = Math.min(1_000 * 2 ** tentativa, 30_000);
  return base + Math.random() * 500;
}

async function requisitar(
  url: string,
  init: RequestInit,
  orcamento: Orcamento,
): Promise<unknown> {
  let ultimoErro: unknown;

  for (let tentativa = 0; tentativa <= MAX_RETRIES; tentativa++) {
    await orcamento.reservar();

    let res: Response;
    try {
      res = await fetch(url, { ...init, cache: 'no-store' });
    } catch (e) {
      // Falha de rede: transitória por definição.
      ultimoErro = e;
      if (tentativa === MAX_RETRIES) break;
      await dormir(backoffMs(tentativa));
      continue;
    }

    orcamento.registrarUso(res.headers);

    if (res.ok) return res.json();

    const corpo = (await res.json().catch(() => ({}))) as RespostaMetaErro;
    const erro = corpo.error ?? {};
    const mensagem = erro.message || `HTTP ${res.status}`;

    if (!ehTransitorio(erro.code, res.status) || tentativa === MAX_RETRIES) {
      if (ehRateLimit(erro.code)) {
        throw new MetaRateLimitError(
          mensagem,
          res.status,
          erro.code,
          esperaSugeridaMs(res.headers) ?? backoffMs(tentativa),
        );
      }
      throw new MetaApiError(mensagem, res.status, erro.code, erro.error_subcode, erro.fbtrace_id);
    }

    // Rate limit com tempo informado pela própria Meta vence o backoff calculado.
    const espera = ehRateLimit(erro.code)
      ? esperaSugeridaMs(res.headers) ?? backoffMs(tentativa)
      : backoffMs(tentativa);

    // Se a Meta pedir mais de 5 min, não faz sentido segurar o job: aborta e
    // deixa o cron da próxima janela retomar (o upsert é idempotente).
    if (espera > 5 * 60_000) {
      throw new MetaRateLimitError(mensagem, res.status, erro.code, espera);
    }

    ultimoErro = new MetaApiError(mensagem, res.status, erro.code, erro.error_subcode, erro.fbtrace_id);
    await dormir(espera);
  }

  throw ultimoErro instanceof Error
    ? ultimoErro
    : new MetaApiError('Falha desconhecida na Meta API', 0);
}

function montarUrl(path: string, params: Record<string, string | number | undefined>): string {
  const query = new URLSearchParams({ access_token: getAccessToken() });
  for (const [k, v] of Object.entries(params)) {
    if (v !== undefined && v !== '') query.set(k, String(v));
  }
  const caminho = path.startsWith('/') ? path : `/${path}`;
  return `${META_GRAPH_URL}${caminho}?${query}`;
}

export async function metaGet<T>(
  path: string,
  params: Record<string, string | number | undefined>,
  orcamento: Orcamento,
): Promise<T> {
  return (await requisitar(montarUrl(path, params), { method: 'GET' }, orcamento)) as T;
}

interface PaginaMeta<T> {
  data: T[];
  paging?: { next?: string; cursors?: { after?: string } };
}

/**
 * Percorre todas as páginas de um edge.
 *
 * Segue `paging.next` (que já vem com token e cursor embutidos) em vez de
 * remontar a URL com `after`: é o que a Meta recomenda e evita perder
 * parâmetros de filtro no meio da paginação.
 */
export async function metaGetAll<T>(
  path: string,
  params: Record<string, string | number | undefined>,
  orcamento: Orcamento,
  maxPaginas = 25,
): Promise<T[]> {
  const itens: T[] = [];
  let url: string | undefined = montarUrl(path, { limit: 200, ...params });

  for (let pagina = 0; pagina < maxPaginas && url; pagina++) {
    const resposta = (await requisitar(url, { method: 'GET' }, orcamento)) as PaginaMeta<T>;
    itens.push(...(resposta.data ?? []));
    url = resposta.paging?.next;
  }

  return itens;
}

export async function metaPost<T>(
  path: string,
  body: Record<string, string | number | boolean | undefined>,
  orcamento: Orcamento,
): Promise<T> {
  const form = new URLSearchParams({ access_token: getAccessToken() });
  for (const [k, v] of Object.entries(body)) {
    if (v !== undefined) form.set(k, String(v));
  }
  const caminho = path.startsWith('/') ? path : `/${path}`;
  const resposta = await requisitar(
    `${META_GRAPH_URL}${caminho}`,
    {
      method: 'POST',
      headers: { 'content-type': 'application/x-www-form-urlencoded' },
      body: form.toString(),
    },
    orcamento,
  );
  return resposta as T;
}
