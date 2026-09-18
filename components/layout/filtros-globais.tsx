'use client';

/**
 * Filtros globais · cliente · período · funil
 *
 * Escreve nos search params e deixa o Next re-renderizar as páginas no
 * servidor. É por isso que as abas continuam Server Components: o filtro muda
 * a URL, não um contexto — e o dado já chega pronto do servidor em vez de o
 * browser buscar de novo a cada troca.
 */

import { useState, useTransition } from 'react';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import { Check, ChevronDown, Loader2 } from 'lucide-react';
import {
  PRESETS_VISIVEIS,
  ROTULO_PRESET,
  intervaloDoPreset,
  lerFiltros,
  type Filtros,
  type PresetPeriodo,
} from '@/lib/filtros';
import type { ClienteResumo, FunilResumo } from '@/lib/data/funis';
import { cn } from '@/lib/utils';

interface Props {
  clientes: ClienteResumo[];
  /** Todos os funis que o usuário enxerga — a filtragem por cliente é aqui. */
  funis: FunilResumo[];
}

/**
 * Lê os filtros da própria URL em vez de recebê-los por prop.
 *
 * Layouts do App Router não recebem `searchParams` — só as páginas. Como a
 * barra vive no layout (pra ficar sticky nas 5 abas), ela precisa consultar a
 * URL pelo lado do cliente. As páginas fazem a mesma leitura no servidor, com
 * a mesma função, então as duas nunca divergem.
 */
export function FiltrosGlobais({ clientes, funis: todosFunis }: Props) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [pendente, iniciarTransicao] = useTransition();
  const [aberto, setAberto] = useState<'cliente' | 'periodo' | 'funil' | null>(null);

  const brutos = Object.fromEntries(searchParams.entries());
  const lidos = lerFiltros(brutos);
  // Sem `?cliente=`, vale o primeiro da lista (ordenada por nome) — a mesma
  // regra que o servidor aplica em `resolverContexto`.
  const filtros: Filtros = { ...lidos, clientId: lidos.clientId ?? clientes[0]?.id ?? null };
  const funis = todosFunis.filter((f) => f.clientId === filtros.clientId);

  function navegar(mudancas: Record<string, string | null>) {
    const params = new URLSearchParams(searchParams.toString());
    for (const [chave, valor] of Object.entries(mudancas)) {
      if (valor === null) params.delete(chave);
      else params.set(chave, valor);
    }
    setAberto(null);
    iniciarTransicao(() => {
      router.push(`${pathname}?${params.toString()}`);
    });
  }

  const clienteAtual = clientes.find((c) => c.id === filtros.clientId) ?? clientes[0];
  const funilAtual = funis.find((f) => f.id === filtros.funilId);

  const rotuloPeriodo =
    filtros.preset === 'custom'
      ? `${formatarBR(filtros.desde)} – ${formatarBR(filtros.ate)}`
      : ROTULO_PRESET[filtros.preset];

  return (
    <div className="flex items-center gap-2 flex-wrap">
      {pendente && <Loader2 size={13} className="animate-spin text-white/60" />}

      <Dropdown
        label="Cliente"
        valor={clienteAtual?.nome ?? 'Nenhum cliente'}
        primario
        aberto={aberto === 'cliente'}
        onToggle={() => setAberto(aberto === 'cliente' ? null : 'cliente')}
      >
        {clientes.length === 0 && <Vazio>Nenhum cliente acessível.</Vazio>}
        {clientes.map((c) => (
          <Item
            key={c.id}
            ativo={c.id === clienteAtual?.id}
            // Trocar de cliente zera o funil: funil pertence a um cliente, e
            // manter o id antigo devolveria uma tela vazia sem explicação.
            onClick={() => navegar({ cliente: c.id, funil: null })}
          >
            {c.nome}
          </Item>
        ))}
      </Dropdown>

      <Dropdown
        label="Período"
        valor={rotuloPeriodo}
        aberto={aberto === 'periodo'}
        onToggle={() => setAberto(aberto === 'periodo' ? null : 'periodo')}
        largura="w-64"
      >
        {PRESETS_VISIVEIS.map((p) => (
          <Item
            key={p}
            ativo={filtros.preset === p}
            onClick={() => navegar({ periodo: p, de: null, ate: null })}
          >
            <span className="flex-1">{ROTULO_PRESET[p]}</span>
            <span className="text-[9px] text-[rgb(var(--muted))] tabular-nums">
              {resumoDoPreset(p)}
            </span>
          </Item>
        ))}
        <PeriodoCustom filtros={filtros} onAplicar={(de, ate) => navegar({ periodo: 'custom', de, ate })} />
      </Dropdown>

      <Dropdown
        label="Funil"
        valor={funilAtual?.nome ?? 'Todos os funis'}
        aberto={aberto === 'funil'}
        onToggle={() => setAberto(aberto === 'funil' ? null : 'funil')}
        largura="w-72"
      >
        <Item ativo={!filtros.funilId} onClick={() => navegar({ funil: null })}>
          Todos os funis
        </Item>
        {funis.length === 0 && <Vazio>Nenhum funil cadastrado pra este cliente.</Vazio>}
        {funis.map((f) => (
          <Item key={f.id} ativo={f.id === filtros.funilId} onClick={() => navegar({ funil: f.id })}>
            {f.nome}
          </Item>
        ))}
      </Dropdown>
    </div>
  );
}

function PeriodoCustom({
  filtros,
  onAplicar,
}: {
  filtros: Filtros;
  onAplicar: (de: string, ate: string) => void;
}) {
  const [de, setDe] = useState(filtros.desde);
  const [ate, setAte] = useState(filtros.ate);

  return (
    <div className="border-t border-[rgb(var(--border))] mt-1 pt-2 px-2 pb-1">
      <div className="text-[9px] uppercase tracking-wider font-bold text-[rgb(var(--muted))] mb-1.5">
        Personalizado
      </div>
      <div className="flex items-center gap-1.5">
        <input
          type="date"
          value={de}
          max={ate}
          onChange={(e) => setDe(e.target.value)}
          className="flex-1 min-w-0 px-1.5 py-1 bg-[rgb(var(--bg))] border border-[rgb(var(--border))] rounded text-[11px] outline-none focus:border-navy/50"
        />
        <span className="text-[rgb(var(--muted))] text-[10px]">até</span>
        <input
          type="date"
          value={ate}
          min={de}
          onChange={(e) => setAte(e.target.value)}
          className="flex-1 min-w-0 px-1.5 py-1 bg-[rgb(var(--bg))] border border-[rgb(var(--border))] rounded text-[11px] outline-none focus:border-navy/50"
        />
      </div>
      <button
        type="button"
        onClick={() => onAplicar(de, ate)}
        className="w-full mt-1.5 px-2 py-1 bg-navy text-white rounded text-[11px] font-bold hover:bg-navy-soft transition"
      >
        Aplicar
      </button>
    </div>
  );
}

function Dropdown({
  label,
  valor,
  primario = false,
  aberto,
  onToggle,
  largura = 'w-56',
  children,
}: {
  label: string;
  valor: string;
  primario?: boolean;
  aberto: boolean;
  onToggle: () => void;
  largura?: string;
  children: React.ReactNode;
}) {
  return (
    <div className="relative">
      <button
        type="button"
        onClick={onToggle}
        className={cn(
          'px-3 py-1.5 rounded-md text-xs font-bold flex items-center gap-1.5 transition max-w-[240px]',
          primario
            ? 'bg-white/15 border border-white/25 hover:bg-white/20'
            : 'bg-white/[0.08] border border-white/15 hover:bg-white/[0.14]',
        )}
      >
        <span className="text-[9px] uppercase tracking-wider text-white/45 font-extrabold shrink-0">
          {label}
        </span>
        <span className="text-white truncate">{valor}</span>
        <ChevronDown size={11} className={cn('text-white/60 shrink-0 transition', aberto && 'rotate-180')} />
      </button>

      {aberto && (
        <>
          <div className="fixed inset-0 z-30" onClick={onToggle} />
          <div
            className={cn(
              'absolute right-0 z-40 mt-1 max-h-[70vh] overflow-y-auto rounded-lg border border-[rgb(var(--border))] bg-[rgb(var(--surface))] p-1 shadow-xl text-ink dark:text-ash',
              largura,
            )}
          >
            {children}
          </div>
        </>
      )}
    </div>
  );
}

function Item({
  ativo,
  onClick,
  children,
}: {
  ativo: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        'w-full flex items-center gap-2 px-2 py-1.5 rounded text-[11px] text-left transition',
        ativo ? 'bg-navy text-white font-bold' : 'hover:bg-[rgb(var(--border))]',
      )}
    >
      <Check size={11} className={cn('shrink-0', !ativo && 'invisible')} />
      {children}
    </button>
  );
}

function Vazio({ children }: { children: React.ReactNode }) {
  return <p className="px-2 py-2 text-[11px] text-[rgb(var(--muted))]">{children}</p>;
}

function formatarBR(iso: string): string {
  return `${iso.slice(8, 10)}/${iso.slice(5, 7)}`;
}

function resumoDoPreset(p: PresetPeriodo): string {
  const { desde, ate } = intervaloDoPreset(p);
  return desde === ate ? formatarBR(desde) : `${formatarBR(desde)}–${formatarBR(ate)}`;
}
