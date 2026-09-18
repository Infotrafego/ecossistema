/**
 * POST /api/ia/assistente · interpreta um comando e devolve o PLANO
 *
 * Nao executa. O plano volta com os alvos ja resolvidos pra que o gestor veja
 * exatamente o que vai acontecer antes de confirmar — e a execucao passa pelo
 * mesmo /api/acoes das acoes manuais, com auditoria e rollback.
 *
 * Criterio de pronto (C1): 100% dos comandos validos viram chamadas corretas.
 * "Correta" aqui significa: acao do catalogo + alvos que existem de verdade.
 */

import { NextResponse } from 'next/server';
import { randomUUID } from 'crypto';
import { createClient } from '@/lib/supabase/server';
import { createServiceClient } from '@/lib/supabase/service';
import { interpretar, type AcaoPlanejada } from '@/lib/claude/assistente';
import { resolverAlvos, type AlvoResolvido } from '@/lib/data/assistente';
import { acaoPorId } from '@/lib/meta-ads/acoes';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

interface Corpo {
  clientId?: string;
  comando?: string;
  threadId?: string;
  desde?: string;
  ate?: string;
}

export interface AcaoComAlvos extends AcaoPlanejada {
  rotulo: string;
  destrutiva: boolean;
  alvos: AlvoResolvido[];
}

export async function POST(request: Request) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ ok: false, mensagem: 'Não autenticado.' }, { status: 401 });

  const corpo = (await request.json().catch(() => ({}))) as Corpo;
  if (!corpo.clientId || !corpo.comando?.trim()) {
    return NextResponse.json(
      { ok: false, mensagem: 'clientId e comando são obrigatórios.' },
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

  const periodo = {
    desde: corpo.desde ?? new Date(Date.now() - 7 * 86_400_000).toISOString().slice(0, 10),
    ate: corpo.ate ?? new Date().toISOString().slice(0, 10),
  };

  try {
    const { data: campanhas } = await supabase
      .from('campaigns')
      .select('name')
      .eq('client_id', corpo.clientId);

    const service = createServiceClient();

    const plano = await interpretar(service, corpo.comando, {
      clientId: corpo.clientId,
      cliente: cliente.name,
      campanhas: (campanhas ?? []).map((c) => c.name),
      periodo,
    });

    const acoes: AcaoComAlvos[] = [];
    for (const acao of plano.acoes) {
      const definicao = acaoPorId(acao.acaoId);
      if (!definicao) continue;
      const alvos = await resolverAlvos(service, corpo.clientId, acao.filtro, periodo);
      acoes.push({
        ...acao,
        rotulo: definicao.rotulo,
        destrutiva: definicao.destrutiva,
        alvos,
      });
    }

    const threadId = corpo.threadId ?? randomUUID();
    const agora = new Date().toISOString();

    // Historico: a pergunta e a traducao. `tool_calls` guarda o plano, que e
    // exatamente o que o criterio de pronto mede.
    await service.from('assistente_mensagens').insert([
      {
        client_id: corpo.clientId,
        user_id: user.id,
        thread_id: threadId,
        role: 'user',
        conteudo: corpo.comando,
        created_at: agora,
      },
      {
        client_id: corpo.clientId,
        user_id: user.id,
        thread_id: threadId,
        role: 'assistant',
        conteudo: plano.duvida ?? plano.entendimento,
        tool_calls: acoes as unknown as Array<Record<string, unknown>>,
      },
    ]);

    return NextResponse.json({
      ok: true,
      threadId,
      entendimento: plano.entendimento,
      duvida: plano.duvida,
      acoes,
    });
  } catch (e) {
    const mensagem = e instanceof Error ? e.message : String(e);
    return NextResponse.json({ ok: false, mensagem }, { status: 500 });
  }
}
