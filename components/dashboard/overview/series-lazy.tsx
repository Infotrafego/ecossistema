'use client';

/**
 * Carregamento tardio dos graficos.
 *
 * Recharts sozinho responde por ~100 kB do bundle da Visao Geral — mais do que
 * todo o resto da pagina somado. Como os graficos ficam abaixo da dobra e a
 * fase exige carregamento em menos de 2s, eles entram depois do primeiro
 * render em vez de bloquear o bundle inicial.
 *
 * `ssr: false` porque o grafico mede o container pra ser responsivo: renderizar
 * no servidor produziria um SVG com dimensoes erradas, que o cliente
 * descartaria logo em seguida.
 */

import dynamic from 'next/dynamic';

export const SeriesTemporaisLazy = dynamic(
  () => import('./series').then((m) => m.SeriesTemporais),
  {
    ssr: false,
    loading: () => (
      <div className="grid lg:grid-cols-2 gap-4">
        <div className="card h-[268px] animate-pulse" />
        <div className="card h-[268px] animate-pulse" />
      </div>
    ),
  },
);
