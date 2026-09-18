/**
 * Painéis da Visão Geral · metas · orçamento · distribuições · jornada · alertas
 *
 * Todos são Server Components: recebem dados já calculados e só desenham. A
 * conta mora em `lib/orcamento.ts` e `lib/analise.ts`, que rodam fora do React
 * e por isso podem ser verificados executando.
 */

import type { ResultadoMeta, ResultadoOrcamento } from '@/lib/orcamento';
import { CLASSE_STATUS } from '@/lib/orcamento';
import type { Alerta } from '@/lib/analise';
import type { Metricas } from '@/lib/intel';
import { fmtMoeda, fmtNum, fmtPct } from '@/lib/intel';
import { cn } from '@/lib/utils';

// ── Metas ────────────────────────────────────────────────────────────────────

export function PainelMetas({
  metas,
  diasDecorridos,
  diasDoMes,
  mesLabel,
}: {
  metas: ResultadoMeta[];
  diasDecorridos: number;
  diasDoMes: number;
  mesLabel: string;
}) {
  if (metas.length === 0) {
    return (
      <section className="card">
        <h2 className="text-xs font-extrabold tracking-tight">Acompanhamento de Metas</h2>
        <p className="text-[11px] text-[rgb(var(--muted))] mt-1.5">
          Nenhuma meta configurada para este funil em {mesLabel}. Sem meta, o painel não tem
          régua — e mostrar o realizado sozinho não diz se está bom ou ruim.
        </p>
      </section>
    );
  }

  return (
    <section className="space-y-3">
      <div className="flex items-baseline justify-between gap-3 flex-wrap">
        <h2 className="text-xs uppercase tracking-wider font-bold text-[rgb(var(--muted))]">
          Acompanhamento de Metas · {mesLabel}
        </h2>
        <span className="text-[10px] text-[rgb(var(--muted))]">
          {diasDecorridos}/{diasDoMes} dias do mês ·{' '}
          {Math.round((diasDecorridos / diasDoMes) * 100)}% do período
        </span>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-3">
        {metas.map((m) => {
          const cor = CLASSE_STATUS[m.status];
          const fmt = (v: number) => (m.formato === 'moeda' ? fmtMoeda(v, 0) : fmtNum(v));
          return (
            <div key={m.chave} className={cn('card border-t-2', cor.borda)}>
              <div className="kpi-label truncate">{m.label}</div>
              <div className="text-lg font-extrabold tracking-tight mt-1 tabular-nums">
                {fmt(m.realizado)}
              </div>
              <div className="text-[10px] text-[rgb(var(--muted))]">
                de <strong>{fmt(m.meta)}</strong> · {Math.round(m.pctAtingido)}%
              </div>

              {/* O marcador mostra onde a meta DEVERIA estar hoje — é o que
                  separa "atrasado" de "ainda é cedo". */}
              <div className="relative h-2 bg-[rgb(var(--border))] rounded-full mt-2 overflow-hidden">
                <div
                  className={cn('h-full transition-all', cor.barra)}
                  style={{ width: `${Math.min(m.pctAtingido, 100)}%` }}
                />
                <div
                  className="absolute top-0 h-full w-px bg-ink/60"
                  style={{ left: `${Math.min(m.pctEsperado, 100)}%` }}
                  title="Esperado para hoje"
                />
              </div>

              <div className={cn('text-[10px] font-bold mt-1.5', cor.texto)}>{m.statusLabel}</div>
              <div className="text-[9px] text-[rgb(var(--muted))] mt-0.5">
                📊 Proj.: {fmt(Math.round(m.projecaoFimDoMes))} ({m.deltaProjecao >= 0 ? '+' : ''}
                {Math.round(m.deltaProjecao)}%)
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}

// ── Orçamento ────────────────────────────────────────────────────────────────

export function PainelOrcamento({
  orcamento,
  configurado,
  mesLabel,
}: {
  orcamento: ResultadoOrcamento;
  configurado: boolean;
  mesLabel: string;
}) {
  if (!configurado) {
    return (
      <section className="card">
        <h2 className="text-xs font-extrabold tracking-tight">Saldo &amp; Orçamento</h2>
        <p className="text-[11px] text-[rgb(var(--muted))] mt-1.5">
          Verba do mês não cadastrada para este cliente. Gasto do período:{' '}
          <strong>{fmtMoeda(orcamento.gastoMtd, 0)}</strong> — sem verba contratada não dá pra
          calcular ritmo nem forecast.
        </p>
      </section>
    );
  }

  const cor = CLASSE_STATUS[orcamento.status];

  return (
    <section className="space-y-3">
      <div className="flex items-baseline justify-between gap-3 flex-wrap">
        <h2 className="text-xs uppercase tracking-wider font-bold text-[rgb(var(--muted))]">
          Saldo &amp; Orçamento · {mesLabel}
        </h2>
        <span className="text-[10px] font-bold text-[rgb(var(--muted))]">
          {orcamento.tipo === 'pre_pago'
            ? `PRÉ-PAGO · saldo ${fmtMoeda(orcamento.saldo, 0)}`
            : `PÓS-PAGO · cap mensal ${fmtMoeda(orcamento.verba, 0)}`}
        </span>
      </div>

      <div className="grid lg:grid-cols-3 gap-3">
        <div className={cn('card border-t-2', cor.borda)}>
          <Linha label="Verba contratada" valor={fmtMoeda(orcamento.verba, 2)} />
          <Linha label="Gasto no mês" valor={fmtMoeda(orcamento.gastoMtd, 2)} />
          <Linha label="Saldo restante" valor={fmtMoeda(orcamento.saldo, 2)} forte />
          {orcamento.diasAteZerar !== null && (
            <Linha label="⏳ Saldo zera em" valor={`${orcamento.diasAteZerar}d`} forte />
          )}

          <div className="relative h-2.5 bg-[rgb(var(--border))] rounded-full mt-3 overflow-hidden">
            <div
              className={cn('h-full', cor.barra)}
              style={{ width: `${Math.min(orcamento.pctConsumido, 100)}%` }}
            />
            <div
              className="absolute top-0 h-full w-px bg-ink/60"
              style={{ left: `${Math.min(orcamento.pctDoMes, 100)}%` }}
              title="Percentual do mês decorrido"
            />
          </div>
          <div className="flex justify-between text-[10px] text-[rgb(var(--muted))] mt-1.5">
            <span>
              <strong>{Math.round(orcamento.pctConsumido)}%</strong> da verba
            </span>
            <span>{Math.round(orcamento.pctDoMes)}% do mês</span>
          </div>
        </div>

        <div className={cn('card border-t-2', cor.borda)}>
          <div className="kpi-label">📊 Ritmo de gasto</div>
          <div className="text-xl font-extrabold tracking-tight mt-1">
            {fmtMoeda(orcamento.ritmoAtual, 0)}/dia
          </div>
          <div className="text-[10px] text-[rgb(var(--muted))] mt-1">
            ideal {fmtMoeda(orcamento.ritmoIdeal, 0)}/dia ·{' '}
            {orcamento.ritmoIdeal > 0
              ? `${orcamento.ritmoAtual >= orcamento.ritmoIdeal ? '+' : ''}${Math.round(
                  (orcamento.ritmoAtual / orcamento.ritmoIdeal - 1) * 100,
                )}%`
              : '—'}
          </div>
          <div className={cn('text-[11px] font-bold mt-2', cor.texto)}>{orcamento.statusLabel}</div>
        </div>

        <div className={cn('card border-t-2', cor.borda)}>
          <div className="kpi-label">🎯 Forecast fim do mês</div>
          <div className="text-xl font-extrabold tracking-tight mt-1">
            {fmtMoeda(orcamento.forecast, 0)}
          </div>
          <div className="text-[10px] text-[rgb(var(--muted))] mt-1">
            {orcamento.deltaForecast >= 0 ? '+' : ''}
            {Math.round(orcamento.deltaForecast)}% vs {fmtMoeda(orcamento.verba, 0)}
          </div>
          <p className="text-[10px] mt-2 leading-relaxed">💡 {orcamento.acao}</p>
        </div>
      </div>
    </section>
  );
}

function Linha({ label, valor, forte = false }: { label: string; valor: string; forte?: boolean }) {
  return (
    <div className="flex justify-between items-baseline text-[11px] py-0.5">
      <span className="text-[rgb(var(--muted))]">{label}</span>
      <span className={forte ? 'font-extrabold text-sm tabular-nums' : 'font-bold tabular-nums'}>
        {valor}
      </span>
    </div>
  );
}

// ── Distribuições ────────────────────────────────────────────────────────────

export function Distribuicoes({
  campanhas,
  publicos,
  criativos,
  rotuloEixo,
}: {
  campanhas: Metricas[];
  publicos: Metricas[];
  criativos: Metricas[];
  rotuloEixo: string;
}) {
  return (
    <section className="space-y-3">
      <h2 className="text-xs uppercase tracking-wider font-bold text-[rgb(var(--muted))]">
        Distribuição do investimento{' '}
        <span className="normal-case tracking-normal font-medium opacity-70">· {rotuloEixo}</span>
      </h2>
      <div className="grid lg:grid-cols-3 gap-4">
        <ListaDistribuicao titulo="Por campanha" itens={campanhas} cor="#1A3D70" />
        <ListaDistribuicao titulo="Por público" itens={publicos} cor="#2563EB" limite={15} />
        <ListaDistribuicao titulo="Por criativo" itens={criativos} cor="#16A34A" limite={15} />
      </div>
    </section>
  );
}

function ListaDistribuicao({
  titulo,
  itens,
  cor,
  limite,
}: {
  titulo: string;
  itens: Metricas[];
  cor: string;
  limite?: number;
}) {
  const ordenados = [...itens].sort((a, b) => b.spend - a.spend);
  const totalSpend = ordenados.reduce((s, i) => s + i.spend, 0);
  const visiveis = limite ? ordenados.slice(0, limite) : ordenados;

  return (
    <div className="card">
      <h3 className="text-xs font-extrabold tracking-tight mb-2">{titulo}</h3>
      {visiveis.length === 0 ? (
        <p className="text-[11px] text-[rgb(var(--muted))] py-3 text-center">Sem dados.</p>
      ) : (
        <div>
          {visiveis.map((i) => {
            const pct = totalSpend > 0 ? (i.spend / totalSpend) * 100 : 0;
            return (
              <div
                key={i.id}
                className="flex gap-3 items-center py-2 border-b border-[rgb(var(--border))] last:border-0"
              >
                <div className="flex-1 min-w-0">
                  <div className="text-[11px] font-bold truncate" title={i.nome}>
                    {i.nome}
                  </div>
                  <div className="h-1.5 bg-[rgb(var(--border))] rounded-full mt-1 overflow-hidden">
                    <div className="h-full rounded-full" style={{ width: `${pct}%`, background: cor }} />
                  </div>
                  <div className="text-[10px] text-[rgb(var(--muted))] mt-0.5">
                    {fmtNum(i.leads)} leads · CPL {fmtMoeda(i.cpl)}
                  </div>
                </div>
                <div className="text-right shrink-0">
                  <div className="text-[12px] font-extrabold tabular-nums">{fmtMoeda(i.spend, 0)}</div>
                  <div className="text-[10px] text-[rgb(var(--muted))] tabular-nums">
                    {pct.toFixed(1)}%
                  </div>
                </div>
              </div>
            );
          })}
          {limite && ordenados.length > limite && (
            <p className="text-[10px] text-[rgb(var(--muted))] pt-2">
              exibindo {limite} de {ordenados.length}
            </p>
          )}
        </div>
      )}
    </div>
  );
}

// ── Jornada de compra ────────────────────────────────────────────────────────

export function Jornada({ total }: { total: Metricas }) {
  const ticket = total.vendas > 0 ? total.receita / total.vendas : null;
  const ltvPorCliente = total.vendas > 0 ? total.ltv / total.vendas : null;
  const cac = total.cac;
  const ltvCac = ltvPorCliente !== null && cac !== null && cac > 0 ? ltvPorCliente / cac : null;
  const leadParaVenda = total.leads > 0 ? total.vendas / total.leads : null;

  const celulas: Array<{
    valor: string;
    label: string;
    sub: string;
    destaque?: 'ok' | 'atencao';
  }> = [
    {
      valor: fmtPct(leadParaVenda, 2),
      label: 'Lead → Venda',
      sub: 'taxa de conversão ponta a ponta',
    },
    { valor: fmtMoeda(ticket, 0), label: 'Ticket médio', sub: 'valor médio da primeira venda' },
    { valor: fmtMoeda(ltvPorCliente, 0), label: 'LTV por cliente', sub: 'ticket × 12 meses' },
    { valor: fmtMoeda(cac, 0), label: 'CAC', sub: 'custo de aquisição por venda' },
    {
      valor: ltvCac === null ? '—' : `${ltvCac.toFixed(1)}:1`,
      label: 'LTV : CAC',
      sub: 'sustentabilidade (saudável ≥ 3:1)',
      destaque: ltvCac === null ? undefined : ltvCac >= 3 ? ('ok' as const) : ('atencao' as const),
    },
  ];

  return (
    <section className="card">
      <h2 className="text-xs font-extrabold tracking-tight">
        Jornada de compra · timing{' '}
        <span className="ml-1 px-1.5 py-0.5 rounded bg-attention/15 text-attention text-[9px] font-extrabold">
          📊 Projeção
        </span>
      </h2>
      <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-5 gap-4 mt-3">
        {celulas.map((c) => (
          <div key={c.label} className="text-center">
            <div
              className={cn(
                'text-2xl font-extrabold tracking-tight tabular-nums',
                c.destaque === 'ok' && 'text-success',
                c.destaque === 'atencao' && 'text-attention',
              )}
            >
              {c.valor}
            </div>
            <div className="text-[10px] uppercase tracking-wider font-bold text-[rgb(var(--muted))] mt-1.5">
              {c.label}
            </div>
            <div className="text-[10px] text-[rgb(var(--muted))] mt-0.5">{c.sub}</div>
          </div>
        ))}
      </div>
    </section>
  );
}

// ── Alertas ──────────────────────────────────────────────────────────────────

const TOM_ALERTA = {
  cortar: { classe: 'border-l-warn bg-warn/5', badge: '🔴 Cortar', texto: 'text-warn' },
  escalar: { classe: 'border-l-success bg-success/5', badge: '🚀 Escalar', texto: 'text-success' },
  atencao: { classe: 'border-l-attention bg-attention/5', badge: '🟡 Atenção', texto: 'text-attention' },
} as const;

export function AlertasAtivos({ alertas }: { alertas: Alerta[] }) {
  return (
    <section className="card">
      <h2 className="text-xs font-extrabold tracking-tight mb-3">Alertas ativos · ações sugeridas</h2>
      {alertas.length === 0 ? (
        <p className="text-[11px] text-[rgb(var(--muted))] py-3 text-center">
          Tudo dentro das metas no período.
        </p>
      ) : (
        <div className="space-y-1.5">
          {alertas.map((a, i) => {
            const tom = TOM_ALERTA[a.tipo];
            return (
              <div
                key={`${a.nome}-${i}`}
                className={cn('flex items-center gap-3 border-l-2 rounded-r px-3 py-2', tom.classe)}
              >
                <span className={cn('text-[10px] font-extrabold shrink-0 w-20', tom.texto)}>
                  {tom.badge}
                </span>
                <div className="flex-1 min-w-0">
                  <div className="text-[11px] font-bold truncate" title={a.nome}>
                    {a.nome}
                  </div>
                  <div className="text-[10px] text-[rgb(var(--muted))]">{a.mensagem}</div>
                </div>
                <span className="text-[11px] font-extrabold tabular-nums shrink-0">
                  {fmtMoeda(a.spend, 0)}
                </span>
              </div>
            );
          })}
        </div>
      )}
    </section>
  );
}
