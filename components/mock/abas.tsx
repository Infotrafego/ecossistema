'use client';

/**
 * Navegação por abas via query string
 *
 * Cada módulo novo (Comercial, Estratégia, CS, Portal, Gestão Interna) é uma
 * rota só com várias abas — igual ao mockup unificado, onde o sidebar troca a
 * tab do mesmo módulo em vez de recarregar a plataforma inteira.
 *
 * O estado mora na URL (`?tab=`) e não no componente: assim o item do sidebar
 * aponta direto pra aba, o link é compartilhável e o botão de voltar funciona.
 */

import Link from 'next/link';
import { usePathname, useSearchParams } from 'next/navigation';
import { cn } from '@/lib/utils';

export interface Aba {
  id: string;
  label: string;
  contador?: number | string;
}

export function Abas({ abas, atual }: { abas: readonly Aba[]; atual: string }) {
  const pathname = usePathname();
  const params = useSearchParams();

  function href(id: string) {
    const p = new URLSearchParams(params.toString());
    p.set('tab', id);
    return `${pathname}?${p.toString()}`;
  }

  return (
    <nav className="border-b border-[rgb(var(--border))] -mx-6 px-6 overflow-x-auto">
      <div className="flex gap-1 min-w-max">
        {abas.map((a) => {
          const ativa = a.id === atual;
          return (
            <Link
              key={a.id}
              href={href(a.id)}
              scroll={false}
              className={cn(
                'px-3 py-2.5 text-[12px] font-bold whitespace-nowrap border-b-2 -mb-px transition inline-flex items-center gap-1.5',
                ativa
                  ? 'border-navy text-navy'
                  : 'border-transparent text-[rgb(var(--muted))] hover:text-ink dark:hover:text-ash',
              )}
            >
              {a.label}
              {a.contador !== undefined && (
                <span
                  className={cn(
                    'text-[9px] font-extrabold px-1.5 py-0.5 rounded',
                    ativa ? 'bg-navy text-white' : 'bg-[rgb(var(--border))] text-[rgb(var(--muted))]',
                  )}
                >
                  {a.contador}
                </span>
              )}
            </Link>
          );
        })}
      </div>
    </nav>
  );
}

/** Resolve a aba pedida na URL, caindo na primeira quando o valor é inválido. */
export function resolverAba(abas: readonly Aba[], pedida: string | undefined): string {
  return abas.some((a) => a.id === pedida) ? (pedida as string) : abas[0].id;
}
