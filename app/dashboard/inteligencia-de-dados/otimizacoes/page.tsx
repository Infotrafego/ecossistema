'use client';

/**
 * Aba Análise & Otimizações
 *
 * Referência visual: docs/mockups/creative-intel/index.html (page "otimizacoes").
 * Ordem intencional do mockup: dados → conclusões. Primeiro a matriz e o
 * Raio-X (o que aconteceu), só depois as ações sugeridas (o que fazer).
 */

import { useMemo, useState } from 'react';
import { Search } from 'lucide-react';
import {
  acoesSugeridas,
  COMBOS,
  type ComboMetricas,
  CRIATIVOS,
  PUBLICOS_METRICAS,
  CAMPANHAS_METRICAS,
} from '@/data/mock-intel';
import {
  ALERTA_INFO,
  fmtMoeda,
  fmtNum,
  fmtPct,
  type Metricas,
} from '@/lib/intel';
import { cn } from '@/lib/utils';

type PivotCol = 'publico' | 'campanha';
type PivotMetric = 'leads' | 'mqls' | 'agend' | 'cpl' | 'cpmql' | 'conv_lm' | 'spend';

const METRIC_LABELS: Record<PivotMetric, string> = {
  leads: 'Leads',
  mqls: 'MQLs',
  agend: 'Agend.',
  cpl: 'CPL ↓',
  cpmql: 'CPMQL ↓',
  conv_lm: 'Conv L→M',
  spend: 'Investido',
};

/** Métricas de custo: no heatmap, o menor valor é que deve ficar verde. */
const MENOR_MELHOR: PivotMetric[] = ['cpl', 'cpmql'];

export default function OtimizacoesPage() {
  const [pivotCol, setPivotCol] = useState<PivotCol>('publico');
  const [pivotMetric, setPivotMetric] = useState<PivotMetric>('leads');

  const acoes = useMemo(() => acoesSugeridas(), []);

  return (
    <div className="space-y-8">
      <header>
        <h1 className="text-xl font-extrabold tracking-tight">Análise &amp; Otimizações</h1>
        <p className="text-sm text-[rgb(var(--muted))] mt-1">
          Cruzamento criativo × público · {COMBOS.length} combinações no período
        </p>
      </header>

      {/* 1 · Matriz pivot */}
      <section className="space-y-3">
        <div>
          <h2 className="text-sm font-extrabold tracking-tight">
            Matriz pivot · cruzamento de performance
          </h2>
          <p className="text-[11px] text-[rgb(var(--muted))]">
            heatmap de criativo × {pivotCol === 'publico' ? 'público' : 'campanha'}
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-x-4 gap-y-2">
          <PillRow
            label="Coluna"
            valor={pivotCol}
            onChange={(v) => setPivotCol(v as PivotCol)}
            opcoes={[
              { valor: 'publico', label: 'Públicos' },
              { valor: 'campanha', label: 'Campanhas' },
            ]}
          />
          <PillRow
            label="Métrica"
            valor={pivotMetric}
            onChange={(v) => setPivotMetric(v as PivotMetric)}
            opcoes={(Object.keys(METRIC_LABELS) as PivotMetric[]).map((k) => ({
              valor: k,
              label: METRIC_LABELS[k],
            }))}
          />
        </div>

        <PivotTable coluna={pivotCol} metrica={pivotMetric} />
      </section>

      {/* 2 · Raio-X */}
      <RaioX />

      {/* 3 · Ações sugeridas */}
      <section className="space-y-3">
        <div>
          <h2 className="text-sm font-extrabold tracking-tight">
            Ações sugeridas · conclusões priorizadas por impacto
          </h2>
          <p className="text-[11px] text-[rgb(var(--muted))]">
            {acoes.length} ações detectadas no período
          </p>
        </div>

        <div className="grid md:grid-cols-2 xl:grid-cols-3 gap-3">
          {acoes.map((a, i) => (
            <article key={`${a.tipo}-${a.alvo}-${i}`} className="card space-y-2">
              <div className="flex items-center gap-2">
                <span
                  className={cn(
                    'px-1.5 py-0.5 rounded text-[9px] font-extrabold uppercase tracking-wider',
                    a.prioridade === 'alta'
                      ? 'bg-warn/15 text-warn'
                      : a.prioridade === 'media'
                        ? 'bg-attention/15 text-attention'
                        : 'bg-[rgb(var(--border))] text-[rgb(var(--muted))]',
                  )}
                >
                  {a.prioridade}
                </span>
                <span className="text-[10px] font-extrabold text-navy uppercase tracking-wider">
                  {a.tipo}
                </span>
              </div>
              <h3 className="text-[11px] font-extrabold truncate" title={a.alvo}>
                {a.alvo}
              </h3>
              <p className="text-[11px] text-[rgb(var(--muted))]">{a.diagnostico}</p>
              <p className="text-[11px] font-bold">{a.acao}</p>
              <p className="text-[10px] font-extrabold text-success">↗ {a.impacto}</p>
            </article>
          ))}
        </div>
      </section>

      {/* 4 · Registro manual (aguardando ClickUp) */}
      <section className="space-y-3 pt-6 border-t-2 border-dashed border-[rgb(var(--border))]">
        <div>
          <h2 className="text-sm font-extrabold tracking-tight">
            Registro manual · otimizações do time via ClickUp
          </h2>
          <p className="text-[11px] text-[rgb(var(--muted))]">aguardando integração com webhook</p>
        </div>

        <div className="bg-attention-bg border border-attention/40 text-attention rounded-lg p-3 text-[11px] flex gap-2">
          <span>⚙</span>
          <div>
            <strong>Página em integração:</strong> esta seção vai ler os comentários das tarefas
            recorrentes &quot;Otimização Diária&quot; do ClickUp. Conforme os gestores registrarem as
            otimizações nos cards (template de 5 campos: o que foi feito · por quê · o que está bom ·
            o que está ruim · próximo passo), elas aparecem aqui cruzadas com a curva de performance.
          </div>
        </div>

        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
          <StatCard label="▣ Otimizações registradas" valor="0" sub="aguardando primeiros comentários" />
          <StatCard label="▣ Gestores ativos" valor="0/7" sub="de 7 clientes com tarefas configuradas" />
          <StatCard label="⊘ Taxa de impacto" valor="—" sub="% otimizações que melhoraram CPL" indisponivel />
          <StatCard label="⊘ Tipo mais frequente" valor="—" sub="categoria mais comum" indisponivel />
        </div>
      </section>
    </div>
  );
}

// ── Matriz pivot ─────────────────────────────────────────────────────────────

function PivotTable({ coluna, metrica }: { coluna: PivotCol; metrica: PivotMetric }) {
  const colunas = coluna === 'publico' ? PUBLICOS_METRICAS : CAMPANHAS_METRICAS;
  const linhas = CRIATIVOS;

  /** Índice combo → valor, para não varrer COMBOS a cada célula. */
  const celulas = useMemo(() => {
    const mapa = new Map<string, ComboMetricas>();
    for (const c of COMBOS) {
      const chaveCol = coluna === 'publico' ? c.publicoId : c.campanha;
      const chave = `${c.criativoId}|${chaveCol}`;
      const atual = mapa.get(chave);
      // Um criativo pode aparecer em vários ad sets da mesma campanha: soma.
      if (atual) {
        mapa.set(chave, somar(atual, c));
      } else {
        mapa.set(chave, c);
      }
    }
    return mapa;
  }, [coluna]);

  const valores = Array.from(celulas.values())
    .map((c) => valorPivot(c, metrica))
    .filter((v): v is number => v !== null && Number.isFinite(v));
  const min = Math.min(...valores);
  const max = Math.max(...valores);

  return (
    <div className="card p-0 overflow-x-auto">
      <table className="w-full text-[10px] border-collapse">
        <thead>
          <tr>
            <th className="sticky left-0 z-10 bg-[rgb(var(--surface))] text-left p-2 border-b border-r border-[rgb(var(--border))] font-bold uppercase tracking-wider text-[rgb(var(--muted))] min-w-[200px]">
              Criativo
            </th>
            {colunas.map((c) => (
              <th
                key={c.id}
                className="p-2 border-b border-[rgb(var(--border))] font-bold text-[rgb(var(--muted))] max-w-[110px]"
                title={c.nome}
              >
                <div className="truncate">{encurtar(c.nome)}</div>
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {linhas.map((l) => (
            <tr key={l.id}>
              <td
                className="sticky left-0 z-10 bg-[rgb(var(--surface))] p-2 border-b border-r border-[rgb(var(--border))] font-bold truncate max-w-[200px]"
                title={l.nome}
              >
                {l.nome}
              </td>
              {colunas.map((c) => {
                const chave = `${l.id}|${coluna === 'publico' ? c.id : c.nome}`;
                const celula = celulas.get(chave);
                const valor = celula ? valorPivot(celula, metrica) : null;
                return (
                  <td
                    key={c.id}
                    className="p-2 border-b border-[rgb(var(--border))] text-center tabular-nums font-bold"
                    style={{ background: corHeatmap(valor, min, max, metrica) }}
                    title={celula ? `${l.nome} × ${c.nome}` : 'não rodou nesta combinação'}
                  >
                    {valor === null ? (
                      <span className="text-[rgb(var(--muted))] font-normal">·</span>
                    ) : (
                      fmtPivot(valor, metrica)
                    )}
                  </td>
                );
              })}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function somar(a: ComboMetricas, b: ComboMetricas): ComboMetricas {
  const spend = a.spend + b.spend;
  const leads = a.leads + b.leads;
  const mqls = a.mqls + b.mqls;
  return {
    ...a,
    spend,
    leads,
    mqls,
    agend: a.agend + b.agend,
    impressoes: a.impressoes + b.impressoes,
    cliques: a.cliques + b.cliques,
    cpl: leads > 0 ? spend / leads : null,
    cpmql: mqls > 0 ? spend / mqls : null,
    convLm: leads > 0 ? mqls / leads : null,
  };
}

function valorPivot(m: Metricas, metrica: PivotMetric): number | null {
  switch (metrica) {
    case 'conv_lm': return m.convLm;
    case 'cpl': return m.cpl;
    case 'cpmql': return m.cpmql;
    case 'spend': return m.spend;
    default: return m[metrica];
  }
}

function fmtPivot(v: number, metrica: PivotMetric): string {
  if (metrica === 'cpl' || metrica === 'cpmql') return fmtMoeda(v, 0);
  if (metrica === 'spend') return fmtMoeda(v, 0);
  if (metrica === 'conv_lm') return fmtPct(v, 0);
  return fmtNum(v);
}

/**
 * Verde = bom, vermelho = ruim, em escala linear entre o menor e o maior valor
 * da matriz. Para CPL/CPMQL a escala inverte, porque barato é bom.
 */
function corHeatmap(valor: number | null, min: number, max: number, metrica: PivotMetric): string {
  if (valor === null || !Number.isFinite(valor) || max === min) return 'transparent';
  let t = (valor - min) / (max - min);
  if (MENOR_MELHOR.includes(metrica)) t = 1 - t;
  // Vermelho (0) → amarelo (0.5) → verde (1), com opacidade contida pra manter legível.
  const hue = t * 120;
  return `hsl(${hue} 70% 50% / ${0.1 + t * 0.22})`;
}

function encurtar(nome: string): string {
  return nome.length > 26 ? `…${nome.slice(-24)}` : nome;
}

// ── Raio-X ───────────────────────────────────────────────────────────────────

type RaioXSort = 'leads-desc' | 'leads-asc' | 'cpl-asc' | 'cpl-desc' | 'spend-desc' | 'conv_lm-desc';

function RaioX() {
  const [busca, setBusca] = useState('');
  const [sort, setSort] = useState<RaioXSort>('leads-desc');

  const linhas = useMemo(() => {
    const termo = busca.trim().toLowerCase();
    const filtradas = COMBOS.filter((c) =>
      termo
        ? `${c.criativoNome} ${c.publicoNome} ${c.campanha}`.toLowerCase().includes(termo)
        : true,
    );

    const [campo, dir] = sort.split('-') as [string, 'asc' | 'desc'];
    return [...filtradas].sort((a, b) => {
      const va = campo === 'conv_lm' ? a.convLm : (a as unknown as Record<string, number | null>)[campo];
      const vb = campo === 'conv_lm' ? b.convLm : (b as unknown as Record<string, number | null>)[campo];
      if (va === null && vb === null) return 0;
      if (va === null) return 1;
      if (vb === null) return -1;
      return dir === 'asc' ? va - vb : vb - va;
    });
  }, [busca, sort]);

  return (
    <section className="space-y-3">
      <div>
        <h2 className="text-sm font-extrabold tracking-tight">Raio-X · todas as combinações</h2>
        <p className="text-[11px] text-[rgb(var(--muted))]">
          {linhas.length} de {COMBOS.length} combinações
        </p>
      </div>

      <div className="flex flex-wrap gap-2">
        <div className="relative flex-1 min-w-[220px]">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-[rgb(var(--muted))]" />
          <input
            type="search"
            value={busca}
            onChange={(e) => setBusca(e.target.value)}
            placeholder="Buscar criativo, público ou campanha…"
            className="w-full pl-9 pr-3 py-2 bg-[rgb(var(--surface))] border border-[rgb(var(--border))] rounded-lg text-xs outline-none focus:border-navy/50"
          />
        </div>
        <select
          value={sort}
          onChange={(e) => setSort(e.target.value as RaioXSort)}
          className="px-3 py-2 bg-[rgb(var(--surface))] border border-[rgb(var(--border))] rounded-lg text-xs font-bold outline-none focus:border-navy/50"
        >
          <option value="leads-desc">Leads ↓ (mais leads)</option>
          <option value="leads-asc">Leads ↑</option>
          <option value="cpl-asc">CPL ↑ (mais barato)</option>
          <option value="cpl-desc">CPL ↓ (mais caro)</option>
          <option value="spend-desc">Investido ↓</option>
          <option value="conv_lm-desc">Conv L→M ↓</option>
        </select>
      </div>

      <div className="card p-0 overflow-x-auto max-h-[520px] overflow-y-auto">
        <table className="w-full text-[11px]">
          <thead className="sticky top-0 bg-[rgb(var(--surface))] z-10">
            <tr className="text-left text-[9px] uppercase tracking-wider text-[rgb(var(--muted))] font-bold border-b border-[rgb(var(--border))]">
              <th className="py-2 px-2">Criativo</th>
              <th className="py-2 px-2">Público</th>
              <th className="py-2 px-2 text-right">Investido</th>
              <th className="py-2 px-2 text-right">Leads</th>
              <th className="py-2 px-2 text-right">MQLs</th>
              <th className="py-2 px-2 text-right">CPL</th>
              <th className="py-2 px-2 text-right">Conv L→M</th>
              <th className="py-2 px-2 text-right">Alerta</th>
            </tr>
          </thead>
          <tbody>
            {linhas.map((c) => {
              const info = ALERTA_INFO[c.alerta];
              return (
                <tr key={c.id} className="border-b border-[rgb(var(--border))] last:border-0">
                  <td className="py-1.5 px-2 font-bold truncate max-w-[240px]" title={c.criativoNome}>
                    {c.criativoNome}
                  </td>
                  <td className="py-1.5 px-2 truncate max-w-[200px] text-[rgb(var(--muted))]" title={c.publicoNome}>
                    {c.publicoNome}
                  </td>
                  <td className="py-1.5 px-2 text-right tabular-nums">{fmtMoeda(c.spend, 0)}</td>
                  <td className="py-1.5 px-2 text-right tabular-nums font-bold">{fmtNum(c.leads)}</td>
                  <td className="py-1.5 px-2 text-right tabular-nums">{fmtNum(c.mqls)}</td>
                  <td className="py-1.5 px-2 text-right tabular-nums">{fmtMoeda(c.cpl)}</td>
                  <td className="py-1.5 px-2 text-right tabular-nums">{fmtPct(c.convLm)}</td>
                  <td className="py-1.5 px-2 text-right">
                    <span className={cn('px-1.5 py-0.5 rounded border text-[9px] font-bold', info.classe)}>
                      {info.icone}
                    </span>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </section>
  );
}

// ── Auxiliares de UI ─────────────────────────────────────────────────────────

function PillRow({
  label,
  valor,
  onChange,
  opcoes,
}: {
  label: string;
  valor: string;
  onChange: (v: string) => void;
  opcoes: Array<{ valor: string; label: string }>;
}) {
  return (
    <div className="flex items-center gap-2">
      <span className="text-[9px] uppercase tracking-wider font-bold text-[rgb(var(--muted))]">
        {label}
      </span>
      <div className="flex flex-wrap gap-1">
        {opcoes.map((o) => (
          <button
            key={o.valor}
            type="button"
            onClick={() => onChange(o.valor)}
            className={cn(
              'px-2.5 py-1 rounded-full text-[11px] font-bold border transition',
              valor === o.valor
                ? 'bg-navy text-white border-navy'
                : 'border-[rgb(var(--border))] text-[rgb(var(--muted))] hover:border-navy/40',
            )}
          >
            {o.label}
          </button>
        ))}
      </div>
    </div>
  );
}

function StatCard({
  label,
  valor,
  sub,
  indisponivel = false,
}: {
  label: string;
  valor: string;
  sub: string;
  indisponivel?: boolean;
}) {
  return (
    <div className={cn('card', indisponivel && 'opacity-60')}>
      <div className="kpi-label">{label}</div>
      <div className="text-2xl font-extrabold tracking-tight mt-1">{valor}</div>
      <div className="text-[10px] text-[rgb(var(--muted))] mt-1">{sub}</div>
    </div>
  );
}
