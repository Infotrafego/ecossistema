/**
 * Primitivos visuais das fases ainda mockadas
 *
 * As telas de Relatórios, Comercial, Estratégia, CS, Debriefings, Portal e
 * Gestão Interna repetem os mesmos blocos do mockup unificado: faixa de KPIs,
 * cartão com cabeçalho, barra de progresso, selo de status, lista de
 * distribuição e kanban. Ficam aqui pra não reescrever em sete lugares e pra
 * qualquer ajuste de marca valer em todas de uma vez.
 *
 * Tudo aqui é server-safe (sem estado). O que precisa de interação mora nos
 * `view.tsx` de cada rota.
 */

import Link from 'next/link';
import { cn } from '@/lib/utils';

export type Tom = 'ok' | 'atencao' | 'ruim' | 'neutro';

const TOM_TEXTO: Record<Tom, string> = {
  ok: 'text-success',
  atencao: 'text-attention',
  ruim: 'text-warn',
  neutro: 'text-[rgb(var(--muted))]',
};

const TOM_SELO: Record<Tom, string> = {
  ok: 'bg-success/10 text-success border-success/30',
  atencao: 'bg-attention/10 text-attention border-attention/30',
  ruim: 'bg-warn/10 text-warn border-warn/30',
  neutro: 'bg-[rgb(var(--border))]/50 text-[rgb(var(--muted))] border-[rgb(var(--border))]',
};

const TOM_BARRA: Record<Tom, string> = {
  ok: 'bg-success',
  atencao: 'bg-attention',
  ruim: 'bg-warn',
  neutro: 'bg-navy',
};

/* ─────────────────────────── cabeçalho de página ─────────────────────────── */

export function Cabecalho({
  titulo,
  subtitulo,
  acoes,
}: {
  titulo: string;
  subtitulo?: string;
  acoes?: React.ReactNode;
}) {
  return (
    <header className="flex items-start justify-between gap-4 flex-wrap">
      <div>
        <h1 className="text-xl font-extrabold tracking-tight">{titulo}</h1>
        {subtitulo && <p className="text-sm text-[rgb(var(--muted))] mt-1">{subtitulo}</p>}
      </div>
      {acoes}
    </header>
  );
}

/**
 * Banner que marca a tela como mockada.
 *
 * Existe por decisão de produto: o `<NotaProjecao />` da Inteligência de Dados
 * separa dado real de projeção; aqui a tela inteira é maquete, e isso precisa
 * ficar explícito pra ninguém levar número de mockup pra reunião de cliente.
 */
export function AvisoMock({ fase, children }: { fase: string; children: React.ReactNode }) {
  return (
    <div className="rounded-lg border border-attention/30 bg-attention/5 px-3.5 py-2.5 text-[11px] leading-relaxed">
      <span className="font-extrabold text-attention uppercase tracking-wider text-[10px]">
        {fase} · maquete
      </span>
      <span className="text-[rgb(var(--muted))] ml-2">{children}</span>
    </div>
  );
}

/* ───────────────────────────────── KPIs ──────────────────────────────────── */

export function FaixaKpis({ children, cols }: { children: React.ReactNode; cols?: string }) {
  return (
    <div className={cn('grid gap-2.5', cols ?? 'grid-cols-2 md:grid-cols-3 xl:grid-cols-6')}>
      {children}
    </div>
  );
}

export function Kpi({
  rotulo,
  valor,
  nota,
  tom = 'neutro',
  destaque = false,
}: {
  rotulo: string;
  valor: string | number;
  nota?: string | null;
  tom?: Tom;
  destaque?: boolean;
}) {
  return (
    <div
      className={cn(
        'card',
        destaque && 'bg-navy text-white border-navy',
        !destaque && tom !== 'neutro' && 'border-t-2',
        !destaque && tom === 'ok' && 'border-t-success',
        !destaque && tom === 'atencao' && 'border-t-attention',
        !destaque && tom === 'ruim' && 'border-t-warn',
      )}
    >
      <div className={cn('kpi-label', destaque && 'text-ash')}>{rotulo}</div>
      <div className="kpi-value mt-1">{valor}</div>
      {nota && (
        <div
          className={cn(
            'text-[10px] mt-0.5 font-bold',
            destaque ? 'text-ash' : TOM_TEXTO[tom],
          )}
        >
          {nota}
        </div>
      )}
    </div>
  );
}

/* ──────────────────────────────── cartões ────────────────────────────────── */

export function Cartao({
  titulo,
  meta,
  children,
  className,
  acoes,
}: {
  titulo?: string;
  meta?: string;
  children: React.ReactNode;
  className?: string;
  acoes?: React.ReactNode;
}) {
  return (
    <section className={cn('card', className)}>
      {(titulo || meta || acoes) && (
        <div className="flex items-baseline justify-between gap-3 mb-3 flex-wrap">
          {titulo && <h3 className="text-[13px] font-extrabold tracking-tight">{titulo}</h3>}
          <div className="flex items-center gap-3 ml-auto">
            {meta && <span className="text-[10px] text-[rgb(var(--muted))]">{meta}</span>}
            {acoes}
          </div>
        </div>
      )}
      {children}
    </section>
  );
}

export function Selo({
  children,
  tom = 'neutro',
  className,
}: {
  children: React.ReactNode;
  tom?: Tom;
  className?: string;
}) {
  return (
    <span
      className={cn(
        'inline-block px-1.5 py-0.5 rounded border text-[9px] font-extrabold uppercase tracking-wider whitespace-nowrap',
        TOM_SELO[tom],
        className,
      )}
    >
      {children}
    </span>
  );
}

/* ──────────────────────────── barras e listas ────────────────────────────── */

export function Barra({ pct, tom = 'neutro' }: { pct: number; tom?: Tom }) {
  const largura = Math.max(0, Math.min(100, pct));
  return (
    <div className="h-1.5 bg-[rgb(var(--border))] rounded-full overflow-hidden">
      <div className={cn('h-full rounded-full', TOM_BARRA[tom])} style={{ width: `${largura}%` }} />
    </div>
  );
}

/** Lista com barra proporcional — o bloco de "distribuições" do mockup. */
export function ListaDist({
  itens,
  tom = 'neutro',
}: {
  itens: Array<{ rotulo: string; valor: string; pct: number; nota?: string }>;
  tom?: Tom;
}) {
  return (
    <div className="space-y-2.5">
      {itens.map((i) => (
        <div key={i.rotulo}>
          <div className="flex items-baseline justify-between gap-2 text-[11px] mb-1">
            <span className="font-bold truncate" title={i.rotulo}>
              {i.rotulo}
            </span>
            <span className="tabular-nums text-[rgb(var(--muted))] shrink-0">
              {i.valor}
              {i.nota && <span className="ml-1.5">{i.nota}</span>}
            </span>
          </div>
          <Barra pct={i.pct} tom={tom} />
        </div>
      ))}
    </div>
  );
}

/* ──────────────────────────────── tabela ─────────────────────────────────── */

export function Tabela({
  colunas,
  children,
}: {
  colunas: Array<{ label: string; alinhar?: 'esq' | 'dir' }>;
  children: React.ReactNode;
}) {
  return (
    <div className="overflow-x-auto -mx-4 px-4">
      <table className="w-full text-[11px] min-w-[560px]">
        <thead>
          <tr className="text-[9px] uppercase tracking-wider text-[rgb(var(--muted))] font-bold border-b border-[rgb(var(--border))]">
            {colunas.map((c) => (
              <th
                key={c.label}
                className={cn('py-2 px-2 whitespace-nowrap', c.alinhar === 'dir' ? 'text-right' : 'text-left')}
              >
                {c.label}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>{children}</tbody>
      </table>
    </div>
  );
}

export function Linha({ children }: { children: React.ReactNode }) {
  return <tr className="border-b border-[rgb(var(--border))] last:border-0">{children}</tr>;
}

export function Celula({
  children,
  alinhar,
  forte,
  className,
}: {
  children: React.ReactNode;
  alinhar?: 'esq' | 'dir';
  forte?: boolean;
  className?: string;
}) {
  return (
    <td
      className={cn(
        'py-2 px-2 align-top',
        alinhar === 'dir' && 'text-right tabular-nums',
        forte && 'font-bold',
        className,
      )}
    >
      {children}
    </td>
  );
}

/* ─────────────────────────────── kanban ──────────────────────────────────── */

export function Kanban({ children }: { children: React.ReactNode }) {
  return (
    <div className="overflow-x-auto -mx-4 px-4 pb-1">
      <div className="flex gap-3 min-w-max">{children}</div>
    </div>
  );
}

export function ColunaKanban({
  titulo,
  total,
  children,
}: {
  titulo: string;
  total: number | string;
  children: React.ReactNode;
}) {
  return (
    <div className="w-[230px] shrink-0">
      <div className="flex items-center justify-between mb-2 px-1">
        <span className="text-[10px] uppercase tracking-wider font-extrabold text-[rgb(var(--muted))]">
          {titulo}
        </span>
        <span className="text-[10px] font-extrabold bg-[rgb(var(--border))] px-1.5 py-0.5 rounded">
          {total}
        </span>
      </div>
      <div className="space-y-2">{children}</div>
    </div>
  );
}

/* ───────────────────────── alertas e destaques ───────────────────────────── */

export function Alerta({
  origem,
  prioridade,
  children,
  href,
}: {
  origem: string;
  prioridade: 'alta' | 'media' | 'baixa';
  children: React.ReactNode;
  href?: string;
}) {
  const tom: Tom = prioridade === 'alta' ? 'ruim' : prioridade === 'media' ? 'atencao' : 'neutro';
  return (
    <div
      className={cn(
        'flex items-start gap-3 py-2.5 border-l-2 pl-3 border-b border-b-[rgb(var(--border))] last:border-b-0',
        prioridade === 'alta' && 'border-l-warn',
        prioridade === 'media' && 'border-l-attention',
        prioridade === 'baixa' && 'border-l-[rgb(var(--border))]',
      )}
    >
      <div className="shrink-0 w-[92px]">
        <Selo tom={tom}>{origem}</Selo>
      </div>
      <div className="text-[11px] leading-relaxed flex-1">{children}</div>
      {href && (
        <Link
          href={href}
          className="shrink-0 text-[10px] font-extrabold text-navy hover:underline whitespace-nowrap"
        >
          Abrir →
        </Link>
      )}
    </div>
  );
}

/** Texto com **negrito** em markdown simples — os alertas do mockup usam isso. */
export function TextoForte({ texto }: { texto: string }) {
  const partes = texto.split(/(\*\*[^*]+\*\*)/g);
  return (
    <>
      {partes.map((p, i) =>
        p.startsWith('**') && p.endsWith('**') ? (
          <strong key={i}>{p.slice(2, -2)}</strong>
        ) : (
          <span key={i}>{p}</span>
        ),
      )}
    </>
  );
}

/* ───────────────────────────── vazio / stub ──────────────────────────────── */

export function EmConstrucao({ titulo, texto }: { titulo: string; texto: string }) {
  return (
    <div className="card py-12 text-center">
      <div className="text-3xl text-[rgb(var(--muted))] mb-3">◌</div>
      <h3 className="font-extrabold tracking-tight">{titulo}</h3>
      <p className="text-[11px] text-[rgb(var(--muted))] mt-2 max-w-md mx-auto leading-relaxed">{texto}</p>
    </div>
  );
}

/* ───────────────────────────── formatadores ──────────────────────────────── */

export function moeda(v: number, decimais = 0): string {
  return (
    'R$ ' +
    v.toLocaleString('pt-BR', { minimumFractionDigits: decimais, maximumFractionDigits: decimais })
  );
}

export function moedaCurta(v: number): string {
  if (Math.abs(v) >= 1000) return 'R$ ' + (v / 1000).toLocaleString('pt-BR', { maximumFractionDigits: 1 }) + 'k';
  return moeda(v);
}

export function num(v: number, decimais = 0): string {
  return v.toLocaleString('pt-BR', { minimumFractionDigits: decimais, maximumFractionDigits: decimais });
}

export function pct(v: number, decimais = 1): string {
  return v.toLocaleString('pt-BR', { minimumFractionDigits: decimais, maximumFractionDigits: decimais }) + '%';
}

/** Delta já calculado em pontos percentuais — `inverso` pra métricas de custo. */
export function delta(v: number, inverso = false): { texto: string; tom: Tom } {
  if (v === 0) return { texto: '→ estável', tom: 'neutro' };
  const bom = inverso ? v < 0 : v > 0;
  const seta = v > 0 ? '↑' : '↓';
  return { texto: `${seta} ${Math.abs(v)}%`, tom: bom ? 'ok' : 'ruim' };
}

export function Delta({ valor, inverso, sufixo }: { valor: number; inverso?: boolean; sufixo?: string }) {
  const d = delta(valor, inverso);
  return (
    <span className={cn('text-[10px] font-bold', TOM_TEXTO[d.tom])}>
      {d.texto}
      {sufixo ? ` ${sufixo}` : ''}
    </span>
  );
}
