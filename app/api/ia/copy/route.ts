/**
 * POST /api/ia/copy · gera variacoes de anuncio
 *
 * Criterio de pronto (C4): 3+ variacoes por solicitacao, vinculadas ao cliente,
 * com contexto de nicho/publico/oferta e dos criativos que ja funcionaram.
 *
 * Roda sob demanda e grava em `copy_sugestoes` — guardar o briefing junto com a
 * saida e o que permite, depois, comparar o que foi pedido com o que performou.
 */

import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { createServiceClient } from '@/lib/supabase/service';
import { sugerirCopy } from '@/lib/claude/analises';
import { getDadosIntel } from '@/lib/data/intel';
import { ordenar } from '@/lib/intel';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

interface Corpo {
  clientId?: string;
  funilId?: string | null;
  nicho?: string;
  publico?: string;
  oferta?: string;
  quantidade?: number;
  desde?: string;
  ate?: string;
}

export async function POST(request: Request) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ ok: false, mensagem: 'Não autenticado.' }, { status: 401 });

  const corpo = (await request.json().catch(() => ({}))) as Corpo;
  if (!corpo.clientId || !corpo.nicho || !corpo.publico || !corpo.oferta) {
    return NextResponse.json(
      { ok: false, mensagem: 'Preencha nicho, público e oferta.' },
      { status: 400 },
    );
  }

  const { data: cliente } = await supabase
    .from('clients')
    .select('id, name')
    .eq('id', corpo.clientId)
    .maybeSingle();

  if (!cliente) {
    return NextResponse.json({ ok: false, mensagem: 'Sem acesso a este cliente.' }, { status: 403 });
  }

  try {
    // Contexto de performance: sem ele a IA devolve copy generica de qualquer
    // nicho. Falhar aqui nao impede a geracao — so a deixa menos ancorada.
    const dados = corpo.desde && corpo.ate
      ? await getDadosIntel({
          clientId: corpo.clientId,
          funilId: corpo.funilId ?? null,
          desde: corpo.desde,
          ate: corpo.ate,
        }).catch(() => null)
      : null;

    const topCriativos = dados ? ordenar(dados.criativos, 'cpl').slice(0, 5) : [];

    const service = createServiceClient();
    const { variacoes, doCache, modelo } = await sugerirCopy(service, {
      clientId: corpo.clientId,
      nicho: corpo.nicho,
      publico: corpo.publico,
      oferta: corpo.oferta,
      topCriativos,
      quantidade: corpo.quantidade,
    });

    await service.from('copy_sugestoes').insert({
      client_id: corpo.clientId,
      funil_id: corpo.funilId ?? null,
      briefing: {
        nicho: corpo.nicho,
        publico: corpo.publico,
        oferta: corpo.oferta,
        referencias: topCriativos.map((c) => c.nome),
      },
      variacoes: variacoes as unknown as Array<Record<string, unknown>>,
      modelo,
      do_cache: doCache,
      created_by: user.id,
    });

    return NextResponse.json({ ok: true, variacoes, doCache });
  } catch (e) {
    const mensagem = e instanceof Error ? e.message : String(e);
    return NextResponse.json({ ok: false, mensagem }, { status: 500 });
  }
}
