/**
 * POST /api/acoes · executa uma ação da action toolbar
 *
 * Por que uma rota e não uma Server Action: o executor precisa do service role
 * (auditoria é gravada com RLS desligado, pra que o próprio usuário não possa
 * reescrever o log das ações dele). Isolar isso numa rota deixa um ponto único
 * onde a autorização é checada antes de qualquer poder elevado entrar em jogo.
 *
 * A checagem é dupla de propósito:
 *   1. há sessão? (quem)
 *   2. essa sessão enxerga esse cliente? (o RLS responde, com o client do
 *      usuário — NÃO com o service role)
 * Só depois disso o service role é usado.
 */

import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { createServiceClient } from '@/lib/supabase/service';
import { executarAcao } from '@/lib/meta-ads/executor';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

interface Corpo {
  clientId?: string;
  acaoId?: string;
  entityMetaId?: string;
  entityNome?: string;
  params?: Record<string, unknown>;
}

export async function POST(request: Request) {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ ok: false, mensagem: 'Não autenticado.' }, { status: 401 });
  }

  let corpo: Corpo;
  try {
    corpo = (await request.json()) as Corpo;
  } catch {
    return NextResponse.json({ ok: false, mensagem: 'Corpo inválido.' }, { status: 400 });
  }

  const { clientId, acaoId } = corpo;
  if (!clientId || !acaoId) {
    return NextResponse.json(
      { ok: false, mensagem: 'clientId e acaoId são obrigatórios.' },
      { status: 400 },
    );
  }

  // Lê com a sessão do usuário: se o RLS não devolver a linha, ele não tem
  // acesso ao cliente — e a ação para aqui, antes do service role entrar.
  const { data: cliente } = await supabase
    .from('clients')
    .select('id')
    .eq('id', clientId)
    .maybeSingle();

  if (!cliente) {
    return NextResponse.json(
      { ok: false, mensagem: 'Sem acesso a este cliente.' },
      { status: 403 },
    );
  }

  try {
    const resultado = await executarAcao(createServiceClient(), {
      clientId,
      userId: user.id,
      origem: 'ui',
      acaoId,
      entityMetaId: corpo.entityMetaId,
      entityNome: corpo.entityNome,
      params: corpo.params,
    });

    return NextResponse.json(resultado, { status: resultado.ok ? 200 : 422 });
  } catch (e) {
    const mensagem = e instanceof Error ? e.message : String(e);
    return NextResponse.json({ ok: false, mensagem }, { status: 500 });
  }
}
