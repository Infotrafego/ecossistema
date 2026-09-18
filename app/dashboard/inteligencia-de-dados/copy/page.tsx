/**
 * Sugestoes de Copy IA (Fase 2c · C4)
 */

import { resolverContexto } from '@/lib/data/contexto';
import { createClient } from '@/lib/supabase/server';
import { EstadoVazio } from '@/components/dashboard/intel/estado-vazio';
import type { ParamsBrutos } from '@/lib/filtros';
import type { CopySugestao } from '@/types/database';
import { CopyView } from './view';

export const dynamic = 'force-dynamic';

export default async function CopyPage({
  searchParams,
}: {
  searchParams: Promise<ParamsBrutos>;
}) {
  const ctx = await resolverContexto(await searchParams);
  if (!ctx.cliente) return <EstadoVazio motivo="sem_acesso" />;

  const supabase = await createClient();
  const { data } = await supabase
    .from('copy_sugestoes')
    .select('*')
    .eq('client_id', ctx.cliente.id)
    .order('created_at', { ascending: false })
    .limit(20);

  return (
    <CopyView
      clienteId={ctx.cliente.id}
      clienteNome={ctx.cliente.nome}
      funilId={ctx.filtros.funilId}
      periodo={{ desde: ctx.filtros.desde, ate: ctx.filtros.ate }}
      historico={(data ?? []) as CopySugestao[]}
    />
  );
}
