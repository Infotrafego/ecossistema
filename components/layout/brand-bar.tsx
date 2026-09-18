/**
 * Barra de marca + filtros globais
 *
 * Server Component: carrega clientes e funis (o RLS decide o que aparece) e
 * entrega pro seletor, que é client-side. Fica no layout pra ser sticky nas 5
 * abas — critério de pronto da fase.
 */

import { Suspense } from 'react';
import { listarClientes, listarFunis } from '@/lib/data/funis';
import { FiltrosGlobais } from './filtros-globais';

export async function BrandBar() {
  // Uma falha aqui (schema não exposto na API, sessão expirada) não pode
  // derrubar o dashboard inteiro: a barra degrada pra vazia e a página mostra
  // o próprio erro, que é mais específico.
  const [clientes, funis] = await Promise.all([
    listarClientes().catch(() => []),
    listarFunis().catch(() => []),
  ]);

  return (
    <header className="bg-alicerce text-white px-7 py-3.5 flex items-center gap-5 sticky top-0 z-30">
      <div className="flex items-center gap-3 shrink-0">
        <div className="w-7 h-7 bg-white rounded flex items-center justify-center">
          <span className="text-navy font-extrabold text-xs tracking-tighter">if</span>
        </div>
        <div className="flex flex-col">
          <span className="text-base font-extrabold tracking-tight leading-none">infotráfego</span>
          <span className="text-[10px] text-ash uppercase tracking-wider mt-0.5">
            Inteligência de Dados
          </span>
        </div>
      </div>

      <div className="ml-auto">
        <Suspense fallback={<div className="h-7" />}>
          <FiltrosGlobais clientes={clientes} funis={funis} />
        </Suspense>
      </div>
    </header>
  );
}
