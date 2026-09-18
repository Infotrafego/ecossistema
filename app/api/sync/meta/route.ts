/**
 * POST /api/sync/meta · dispara o sync manualmente
 *
 * Dois caminhos de autorização:
 *   · `Authorization: Bearer <SYNC_SECRET>` — para um agendador externo
 *     (Portainer, GitHub Actions, uptime robot), caso o cron interno saia do ar.
 *   · sessão de usuário admin — o botão da tela de sync.
 *
 * ⚠ Cada execução consome cota da Marketing API. O teto por run é controlado
 * por `META_MAX_CALLS_PER_RUN` (lib/meta-ads/config.ts); o sync para sozinho
 * quando chega lá e registra `partial` no log.
 */

import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { syncAllClients, syncClient } from '@/lib/meta-ads/sync';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';
// Sync de conta grande passa de 1 min; o padrão do Next derrubaria no meio.
export const maxDuration = 300;

async function autorizado(request: Request): Promise<{ ok: boolean; motivo?: string }> {
  const segredo = process.env.SYNC_SECRET;
  const header = request.headers.get('authorization');

  if (segredo && header === `Bearer ${segredo}`) return { ok: true };

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return { ok: false, motivo: 'Não autenticado.' };

  // Sync mexe em dados de todos os clientes: só admin global dispara.
  const { data: perfil } = await supabase
    .from('users')
    .select('global_role')
    .eq('id', user.id)
    .maybeSingle();

  if (perfil?.global_role !== 'admin') {
    return { ok: false, motivo: 'Apenas admin pode disparar o sync manualmente.' };
  }
  return { ok: true };
}

export async function POST(request: Request) {
  const auth = await autorizado(request);
  if (!auth.ok) {
    return NextResponse.json({ ok: false, mensagem: auth.motivo }, { status: 403 });
  }

  const corpo = (await request.json().catch(() => ({}))) as {
    clientId?: string;
    adAccountId?: string;
    desde?: string;
    ate?: string;
  };

  try {
    const resultados =
      corpo.clientId && corpo.adAccountId
        ? [await syncClient(corpo.clientId, corpo.adAccountId, { desde: corpo.desde, ate: corpo.ate })]
        : await syncAllClients({ desde: corpo.desde, ate: corpo.ate });

    const houveErro = resultados.some((r) => r.status === 'error');
    return NextResponse.json({ ok: !houveErro, resultados }, { status: houveErro ? 207 : 200 });
  } catch (e) {
    const mensagem = e instanceof Error ? e.message : String(e);
    return NextResponse.json({ ok: false, mensagem }, { status: 500 });
  }
}
