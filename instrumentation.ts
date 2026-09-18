/**
 * Hook de instrumentacao do Next · sobe o agendador do sync com o servidor
 *
 * `register()` roda uma vez por processo do servidor. O guard de runtime
 * importa: o modulo do agendador usa timers e o client Supabase de servidor,
 * que nao existem no runtime edge.
 */

export async function register() {
  if (process.env.NEXT_RUNTIME !== 'nodejs') return;

  const { iniciarAgendador } = await import('@/lib/meta-ads/agendador');
  iniciarAgendador();
}
