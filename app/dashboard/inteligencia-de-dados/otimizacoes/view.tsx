'use client';

import { useMemo, useState } from 'react';
import { Search } from 'lucide-react';
import type { ComboMetricas } from '@/lib/data/intel';
import type { Acao } from '@/lib/analise';
import { ActionToolbar } from '@/components/dashboard/action-toolbar';
import { ALERTA_INFO, fmtMoeda, fmtNum, fmtPct, type Metricas } from '@/lib/intel';
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

/** Acima disto a matriz vira ilegível e o navegador começa a sofrer. */
const MAX_LINHAS_PIVOT = 40;
const MAX_COLUNAS_PIVOT = 25;

interface Props {
  clienteId: string;
  combos: ComboMetricas[];
  criativos: Metricas[];
  publicos: Metricas[];
  campanhas: Metricas[];
  acoes: Acao[];
}

export function OtimizacoesView({ clienteId, combos, criativos, publicos, campanhas, acoes }: Props) {
  const [pivotCol, setPivotCol] = useState<PivotCol>('publico');
  const [pivotMetric, setPivotMetric] = useState<PivotMetric>('leads');
  const [acaoSelecionada, setAcaoSelecionada] = useState<Acao | null>(null);

  return (
    <div className="space-y-8">
      <header>
        <h1 className="text-xl font-extrabold tracking-tight">Análise &amp; Otimizações</h1>
        <p className="text-sm text-[rgb(var(--muted))] mt-1">
          Cruzamento criativo × público · {combos.length} combinações no período
        </p>
      </header>

      <ActionToolbar
        escopo="otimizacoes"
        clienteId={clienteId}
        selecionado={
          acaoSelecionada ? { id: acaoSelecionada.alvoId, nome: acaoSelecionada.alvo } : null
        }
        info={`${acoes.length} sugestões no período`}
      />

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

        <PivotTable
          combos={combos}
          criativos={criativos}
          colunas={pivotCol === 'publico' ? publicos : campanhas}
          coluna={pivotCol}
          metrica={pivotMetric}
        />
      </section>

      {/* 2 · Raio-X */}
      <RaioX combos={combos} />

      {/* 3 · Ações sugeridas */}
      <section className="space-y-3">
        <div>
          <h2 className="text-sm font-extrabold tracking-tight">
            Ações sugeridas · conclusões priorizadas por impacto
          </h2>
          <p className="text-[11px] text-[rgb(var(--muted))]">
            {acoes.length} ações detectadas · clique numa para selecioná-la na barra de ações
          </p>
        </div>

        {acoes.length === 0 ? (
          <div className="card text-center py-8 text-[11px] text-[rgb(var(--muted))]">
            Nenhuma ação sugerida: no período, nada está fora das metas o bastante pra justificar
            uma intervenção.
          </div>
        ) : (
          <div className="grid md:grid-cols-2 xl:grid-cols-3 gap-3">
            {acoes.map((a, i) => (
              <article
                key={`${a.tipo}-${a.alvoId}-${i}`}
                onClick={() => setAcaoSelecionada(acaoSelecionada === a ? null : a)}
                className={cn(
                  'card space-y-2 cursor-pointer transition',
                  acaoSelecionada === a
                    ? 'ring-2 ring-navy border-navy'
                    : 'hover:border-navy/40',
                )}
              >
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
        )}
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
            <strong>Fora do escopo desta fase:</strong> esta seção vai ler os comentários das
            tarefas recorrentes &quot;Otimização Diária&quot; do ClickUp (template de 5 campos:
            o que foi feito · por quê · o que está bom · o que está ruim · próximo passo) e
            cruzá-los com a curva de performance. A integração não estava na Fase 2.
          </div>
        </div>
      </section>
    </div>
  );
}

// ── Matriz pivot ─────────────────────────────────────────────────────────────

function PivotTable({
  combos,
  criativos,
  colunas,
  coluna,
  metrica,
}: {
  combos: ComboMetricas[];
  criativos: Metricas[];
  colunas: Metricas[];
  coluna: PivotCol;
  metrica: PivotMetric;
}) {
  // Com dados reais a matriz pode ter centenas de criativos × dezenas de
  // públicos. Renderizar tudo trava o navegador e ninguém lê uma tabela de
  // 8 mil células — então corta pelos que mais investiram, que é onde está a
  // decisão.
  const linhas = useMemo(
    () => [...criativos].sort((a, b) => b.spend - a.spend).slice(0, MAX_LINHAS_PIVOT),
    [criativos],
  );
  const cols = useMemo(
    () => [...colunas].sort((a, b) => b.spend - a.spend).slice(0, MAX_COLUNAS_PIVOT),
    [colunas],
  );

  const celulas = useMemo(() => {
    const mapa = new Map<string, { spend: number; leads: number; mqls: number; agend: number }>();
    for (const c of combos) {
      const chaveCol = coluna === 'publico' ? c.publicoId : c.campanhaId;
      const chave = `${c.criativoId}|${chaveCol}`;
      const atual = mapa.get(chave) ?? { spend: 0, leads: 0, mqls: 0, agend: 0 };
      // Um criativo pode aparecer em vários ad sets da mesma campanha: soma.
      mapa.set(chave, {
        spend: atual.spend + c.spend,
        leads: atual.leads + c.leads,
        mqls: atual.mqls + c.mqls,
        agend: atual.agend + c.agend,
      });
    }
    return mapa;
  }, [combos, coluna]);

  const valores: number[] = [];
  for (const celula of celulas.values()) {
    const v = valorPivot(celula, metrica);
    if (v !== null && Number.isFinite(v)) valores.push(v);
  }
  const min = valores.length ? Math.min(...valores) : 0;
  const max = valores.length ? Math.max(...valores) : 0;

  return (
    <>
      <div className="card p-0 overflow-x-auto max-h-[560px] overflow-y-auto">
        <table className="w-full text-[10px] border-collapse">
          <thead className="sticky top-0 z-20">
            <tr>
              <th className="sticky left-0 z-30 bg-[rgb(var(--surface))] text-left p-2 border-b border-r border-[rgb(var(--border))] font-bold uppercase tracking-wider text-[rgb(var(--muted))] min-w-[200px]">
                Criativo
              </th>
              {cols.map((c) => (
                <th
                  key={c.id}
                  className="p-2 bg-[rgb(var(--surface))] border-b border-[rgb(var(--border))] font-bold text-[rgb(var(--muted))] max-w-[110px]"
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
                {cols.map((c) => {
                  const celula = celulas.get(`${l.id}|${c.id}`);
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
      {(criativos.length > MAX_LINHAS_PIVOT || colunas.length > MAX_COLUNAS_PIVOT) && (
        <p className="text-[10px] text-[rgb(var(--muted))]">
          Mostrando os {Math.min(criativos.length, MAX_LINHAS_PIVOT)} criativos e{' '}
          {Math.min(colunas.length, MAX_COLUNAS_PIVOT)} {coluna === 'publico' ? 'públicos' : 'campanhas'}{' '}
          de maior investimento. O Raio-X abaixo tem todas as combinações.
        </p>
      )}
    </>
  );
}

interface CelulaPivot {
  spend: number;
  leads: number;
  mqls: number;
  agend: number;
}

function valorPivot(c: CelulaPivot, metrica: PivotMetric): number | null {
  switch (metrica) {
    case 'conv_lm': return c.leads > 0 ? c.mqls / c.leads : null;
    case 'cpl': return c.leads > 0 ? c.spend / c.leads : null;
    case 'cpmql': return c.mqls > 0 ? c.spend / c.mqls : null;
    case 'spend': return c.spend;
    case 'leads': return c.leads;
    case 'mqls': return c.mqls;
    case 'agend': return c.agend;
  }
}

function fmtPivot(v: number, metrica: PivotMetric): string {
  if (metrica === 'cpl' || metrica === 'cpmql' || metrica === 'spend') return fmtMoeda(v, 0);
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
  const hue = t * 120;
  return `hsl(${hue} 70% 50% / ${0.1 + t * 0.22})`;
}

function encurtar(nome: string): string {
  return nome.length > 26 ? `…${nome.slice(-24)}` : nome;
}

// ── Raio-X ───────────────────────────────────────────────────────────────────

type RaioXSort = 'leads-desc' | 'leads-asc' | 'cpl-asc' | 'cpl-desc' | 'spend-desc' | 'conv_lm-desc';

const POR_PAGINA = 100;

function RaioX({ combos }: { combos: ComboMetricas[] }) {
  const [busca, setBusca] = useState('');
  const [sort, setSort] = useState<RaioXSort>('leads-desc');
  const [pagina, setPagina] = useState(0);

  const linhas = useMemo(() => {
    const termo = busca.trim().toLowerCase();
    const filtradas = combos.filter((c) =>
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
  }, [combos, busca, sort]);

  const totalPaginas = Math.max(1, Math.ceil(linhas.length / POR_PAGINA));
  const paginaAtual = Math.min(pagina, totalPaginas - 1);
  const naTela = linhas.slice(paginaAtual * POR_PAGINA, (paginaAtual + 1) * POR_PAGINA);

  return (
    <section className="space-y-3">
      <div>
        <h2 className="text-sm font-extrabold tracking-tight">Raio-X · todas as combinações</h2>
        <p className="text-[11px] text-[rgb(var(--muted))]">
          {linhas.length} de {combos.length} combinações
          {totalPaginas > 1 && ` · página ${paginaAtual + 1} de ${totalPaginas}`}
        </p>
      </div>

      <div className="flex flex-wrap gap-2">
        <div className="relative flex-1 min-w-[220px]">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-[rgb(var(--muted))]" />
          <input
            type="search"
            value={busca}
            onChange={(e) => {
              setBusca(e.target.value);
              setPagina(0);
            }}
            placeholder="Buscar criativo, público ou campanha…"
            className="w-full pl-9 pr-3 py-2 bg-[rgb(var(--surface))] border border-[rgb(var(--border))] rounded-lg text-xs outline-none focus:border-navy/50"
          />
        </div>
        <select
          value={sort}
          onChange={(e) => {
            setSort(e.target.value as RaioXSort);
            setPagina(0);
          }}
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
            {naTela.map((c) => {
              const info = ALERTA_INFO[c.alerta];
              return (
                <tr key={c.id} className="border-b border-[rgb(var(--border))] last:border-0">
                  <td className="py-1.5 px-2 font-bold truncate max-w-[240px]" title={c.criativoNome}>
                    {c.criativoNome}
                  </td>
                  <td
                    className="py-1.5 px-2 truncate max-w-[200px] text-[rgb(var(--muted))]"
                    title={c.publicoNome}
                  >
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

      {totalPaginas > 1 && (
        <div className="flex items-center justify-center gap-3">
          <button
            type="button"
            onClick={() => setPagina((p) => Math.max(0, p - 1))}
            disabled={paginaAtual === 0}
            className="px-3 py-1.5 rounded-lg border border-[rgb(var(--border))] text-[11px] font-bold disabled:opacity-50"
          >
            ← Anterior
          </button>
          <span className="text-[11px] font-bold tabular-nums text-[rgb(var(--muted))]">
            {paginaAtual + 1} / {totalPaginas}
          </span>
          <button
            type="button"
            onClick={() => setPagina((p) => Math.min(totalPaginas - 1, p + 1))}
            disabled={paginaAtual >= totalPaginas - 1}
            className="px-3 py-1.5 rounded-lg border border-[rgb(var(--border))] text-[11px] font-bold disabled:opacity-50"
          >
            Próxima →
          </button>
        </div>
      )}
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
