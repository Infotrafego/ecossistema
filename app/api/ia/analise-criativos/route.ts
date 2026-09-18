/**
 * POST /api/ia/analise-criativos
 *
 * Roda sob demanda, nunca no carregamento da página. Motivo: análise no load
 * significaria uma chamada paga por visita de aba — e a regra da fase é custo
 * zero, com qualquer gasto passando pelo Pablo antes. Com cache de 24h, o
 * segundo clique do dia sai de graça.
 */

import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { createServiceClient } from '@/lib/supabase/service';
import { analisarCriativos } from '@/lib/claude/analises';
import { getDadosIntel } from '@/lib/data/intel';
import { ordenar } from '@/lib/intel';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

interface Corpo {
  clientId?: string;
  funilId?: string | null;
  desde?: string;
  ate?: string;
}

export async function POST(request: Request) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ ok: false, mensagem: 'Não autenticado.' }, { status: 401 });
  }

  const corpo = (await request.json().catch(() => ({}))) as Corpo;
  if (!corpo.clientId || !corpo.desde || !corpo.ate) {
    return NextResponse.json(
      { ok: false, mensagem: 'clientId, desde e ate são obrigatórios.' },
      { status: 400 },
    );
  }

  // Confere o acesso com a sessão do usuário (RLS) antes de qualquer gasto.
  const { data: cliente } = await supabase
    .from('clients')
    .select('id, name')
    .eq('id', corpo.clientId)
    .maybeSingle();

  if (!cliente) {
    return NextResponse.json({ ok: false, mensagem: 'Sem acesso a este cliente.' }, { status: 403 });
  }

  try {
    // Relê os dados no servidor em vez de aceitar os do corpo: números vindos
    // do browser não podem virar a base de uma análise que o time vai citar.
    const dados = await getDadosIntel({
      clientId: corpo.clientId,
      funilId: corpo.funilId ?? null,
      desde: corpo.desde,
      ate: corpo.ate,
    });

    const campeoes = ordenar(dados.criativos, 'leads').slice(0, 5);

    const { analises, doCache } = await analisarCriativos(createServiceClient(), {
      clientId: corpo.clientId,
      contextoCliente: cliente.name,
      criativos: campeoes,
      periodo: { desde: corpo.desde, ate: corpo.ate },
    });

    return NextResponse.json({ ok: true, analises, doCache });
  } catch (e) {
    const mensagem = e instanceof Error ? e.message : String(e);
    return NextResponse.json({ ok: false, mensagem }, { status: 500 });
  }
}
