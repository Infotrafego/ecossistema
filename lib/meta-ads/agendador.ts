/**
 * Agendador do sync diário
 *
 * DECISÃO (o prompt pede que fique registrada): o cron roda DENTRO do próprio
 * container, não como Edge Function do Supabase.
 *
 *   · Segredo em um lugar só. `META_ACCESS_TOKEN` e a service role já vivem no
 *     Portainer como env de runtime. Uma Edge Function exigiria duplicá-los nos
 *     secrets do Supabase — dois lugares pra girar token, dois pra vazar.
 *   · Mesmo código. O sync compartilha `lib/funil`, `lib/intel` e os tipos com
 *     o app. Edge Function é Deno: ou se mantém uma segunda cópia da tradução
 *     de actions, ou se monta um build separado. As duas saídas custam mais do
 *     que valem aqui.
 *   · Free tier de verdade. O plano free do Supabase limita invocações de
 *     função, e `pg_cron` + `pg_net` não são garantidos — o container já está
 *     pago e ocioso de madrugada.
 *
 * O que isso cobra em troca: a stack roda com `replicas: 1` (está assim no
 * docker-stack.yml). Com duas réplicas, duas rodariam o sync. A trava de
 * `jaRodouHoje` reduz a janela, mas quem garante mesmo é a réplica única — e o
 * upsert idempotente, que faz de uma execução dupla um desperdício de cota, não
 * um erro de dado.
 */

import { createServiceClient } from '@/lib/supabase/service';
import { syncAllClients, type ResultadoSync } from './sync';

const HORA_ALVO = Number(process.env.SYNC_HORA_UTC ?? 7); // 04h em Brasília
const INTERVALO_CHECAGEM_MS = 15 * 60_000;

let timer: NodeJS.Timeout | null = null;
let rodando = false;

/** Houve sync bem-sucedido hoje? Evita repetir em restart do container. */
async function jaRodouHoje(): Promise<boolean> {
  try {
    const supabase = createServiceClient();
    const hoje = new Date().toISOString().slice(0, 10);
    const { data } = await supabase
      .from('sync_log')
      .select('id')
      .eq('source', 'meta_ads')
      .in('status', ['success', 'partial'])
      .gte('started_at', `${hoje}T00:00:00Z`)
      .limit(1);
    return (data?.length ?? 0) > 0;
  } catch {
    // Sem conseguir consultar, o mais seguro é NÃO rodar: gastar cota à toa é
    // pior do que pular um dia — o dia seguinte re-sincroniza a janela de 7d.
    return true;
  }
}

export async function rodarSyncAgendado(forcar = false): Promise<ResultadoSync[] | null> {
  if (rodando) return null;
  if (!forcar && (await jaRodouHoje())) return null;

  rodando = true;
  const inicio = Date.now();
  try {
    const resultados = await syncAllClients();
    const falhas = resultados.filter((r) => r.status === 'error').length;
    console.log(
      `[sync] ${resultados.length} cliente(s) em ${Date.now() - inicio}ms · ${falhas} falha(s)`,
    );

    // Fadiga e regras dependem das métricas do dia já gravadas — por isso rodam
    // DEPOIS, e não em paralelo. Falha em qualquer uma das duas não invalida o
    // sync, que é o dado; por isso cada uma tem o próprio try.
    await rodarPosSync();

    return resultados;
  } catch (e) {
    console.error('[sync] execução abortada:', e);
    return null;
  } finally {
    rodando = false;
  }
}

/** Diagnóstico de fadiga + regras automáticas, na sequência do sync. */
export async function rodarPosSync(): Promise<void> {
  try {
    const { recalcularFadigaTodos } = await import('@/lib/data/fadiga');
    const fadiga = await recalcularFadigaTodos();
    const avaliados = fadiga.reduce((s, f) => s + f.criativosAvaliados, 0);
    const criticos = fadiga.reduce((s, f) => s + f.criticos, 0);
    console.log(`[fadiga] ${avaliados} criativo(s) avaliados · ${criticos} crítico(s)`);
  } catch (e) {
    console.error('[fadiga] falhou:', e);
  }

  try {
    const { executarRegrasAtivas } = await import('@/lib/data/regras');
    const execucoes = await executarRegrasAtivas();
    const aplicadas = execucoes.reduce((s, r) => s + r.aplicadas, 0);
    console.log(`[regras] ${execucoes.length} regra(s) executadas · ${aplicadas} ação(ões)`);
  } catch (e) {
    console.error('[regras] falhou:', e);
  }
}

/**
 * Liga a checagem periódica.
 *
 * Checa a cada 15 min em vez de calcular o delay até a hora exata: reinício de
 * container no minuto errado não faz o sync pular o dia inteiro.
 */
export function iniciarAgendador(): void {
  if (timer) return;
  if (process.env.SYNC_CRON_ENABLED !== 'true') {
    console.log('[sync] agendador desligado (SYNC_CRON_ENABLED != true)');
    return;
  }

  console.log(`[sync] agendador ligado · janela alvo ${HORA_ALVO}h UTC`);

  timer = setInterval(() => {
    const hora = new Date().getUTCHours();
    if (hora !== HORA_ALVO) return;
    void rodarSyncAgendado();
  }, INTERVALO_CHECAGEM_MS);

  // `unref` pra que o timer não segure o processo vivo num shutdown.
  timer.unref?.();
}
