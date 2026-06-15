/**
 * Visão Geral · Inteligência de Dados (Fase 2 · cliente piloto: Infotráfego)
 *
 * Esta página está MOCKADA com dados fake pra você ver o esqueleto.
 * Quando implementar o sync Meta Ads real, troca os imports do mock-metrics
 * por queries reais no Supabase.
 */

import { KpiCard } from '@/components/dashboard/kpi-card';
import { FunilCone } from '@/components/dashboard/funil-cone';
import {
  mockKpis,
  mockReceita,
  mockFunilEtapas,
  mockMetas,
  mockSaldoOrcamento,
  mockMulticanal,
  mockVisaoDiaria,
} from '@/data/mock-metrics';
import { formatCurrency, formatNumber, formatPercent } from '@/lib/utils';

export default function VisaoGeralPage() {
  return (
    <div className="space-y-6">
      {/* Headline */}
      <div>
        <h1 className="text-xl font-extrabold tracking-tight">Visão Geral</h1>
        <p className="text-sm text-[rgb(var(--muted))] mt-1">
          Funil de aquisição da Infotráfego · últimos 30 dias
        </p>
      </div>

      {/* KPIs · 8 boxes */}
      <section>
        <h2 className="text-xs uppercase tracking-wider font-bold text-[rgb(var(--muted))] mb-3">
          Métricas do funil
        </h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          <KpiCard label="Impressões" value={mockKpis.impressoes.value} format="number" delta={mockKpis.impressoes.delta} />
          <KpiCard label="Cliques" value={mockKpis.cliques.value} format="number" delta={mockKpis.cliques.delta} />
          <KpiCard label="Page Views" value={mockKpis.pageViews.value} format="number" delta={mockKpis.pageViews.delta} />
          <KpiCard label="Form Iniciado" value={mockKpis.formIniciado.value} format="number" delta={mockKpis.formIniciado.delta} />
          <KpiCard label="MQLs" value={mockKpis.formCompleto.value} format="number" delta={mockKpis.formCompleto.delta} />
          <KpiCard label="SQLs" value={mockKpis.leadQualificado.value} format="number" delta={mockKpis.leadQualificado.delta} />
          <KpiCard label="Reuniões" value={mockKpis.reunioesAgendadas.value} format="number" delta={mockKpis.reunioesAgendadas.delta} />
          <KpiCard label="Vendas" value={mockKpis.vendas.value} format="number" delta={mockKpis.vendas.delta} emphasis="primary" />
        </div>

        {/* Receita destacada */}
        <div className="mt-3">
          <KpiCard
            label="Receita do período"
            value={mockReceita.total}
            format="currency"
            delta={mockReceita.delta}
            emphasis="primary"
          />
        </div>
      </section>

      {/* Acompanhamento de Metas */}
      <section>
        <h2 className="text-xs uppercase tracking-wider font-bold text-[rgb(var(--muted))] mb-3">
          Acompanhamento de Metas
        </h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {Object.entries(mockMetas).map(([key, m]) => (
            <MetaCard key={key} label={labelMeta(key)} meta={m.meta} atual={m.atual} pace={m.pace} />
          ))}
        </div>
      </section>

      {/* Funil cone Looker (CRÍTICO) */}
      <section>
        <h2 className="text-xs uppercase tracking-wider font-bold text-[rgb(var(--muted))] mb-3">
          Funil cone · Aquisição de Clientes
        </h2>
        <div className="card">
          <FunilCone etapas={mockFunilEtapas} />
        </div>
      </section>

      {/* Saldo & Orçamento + Multicanal lado a lado */}
      <div className="grid md:grid-cols-2 gap-6">
        <section>
          <h2 className="text-xs uppercase tracking-wider font-bold text-[rgb(var(--muted))] mb-3">
            Saldo & Orçamento
          </h2>
          <div className="card space-y-3">
            <Row label="Budget mensal" value={formatCurrency(mockSaldoOrcamento.budgetMensal)} />
            <Row label="Gasto até hoje" value={formatCurrency(mockSaldoOrcamento.gastoAteHoje)} />
            <Row label="Saldo restante" value={formatCurrency(mockSaldoOrcamento.saldoRestante)} strong />
            <Row label="Projeção fim de mês" value={formatCurrency(mockSaldoOrcamento.projecaoFimMes)} />
            <Row label="Dias úteis restantes" value={String(mockSaldoOrcamento.diasUteisRestantes)} />
          </div>
        </section>

        <section>
          <h2 className="text-xs uppercase tracking-wider font-bold text-[rgb(var(--muted))] mb-3">
            Painel Multicanal
          </h2>
          <div className="card space-y-2">
            {mockMulticanal.map((c) => (
              <div key={c.canal} className="flex items-center justify-between py-1">
                <div className="text-sm font-bold">{c.canal}</div>
                <div className="flex items-center gap-4 text-xs">
                  <span className="text-[rgb(var(--muted))]">
                    {formatCurrency(c.spend)}
                  </span>
                  <span className="font-bold">{c.conversoes} conv.</span>
                  <span className="text-[rgb(var(--muted))]">{formatPercent(c.share)}</span>
                </div>
              </div>
            ))}
          </div>
        </section>
      </div>

      {/* Tabela diária */}
      <section>
        <h2 className="text-xs uppercase tracking-wider font-bold text-[rgb(var(--muted))] mb-3">
          Visão Diária · últimos 7 dias
        </h2>
        <div className="card overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left text-[10px] uppercase tracking-wider text-[rgb(var(--muted))] font-bold border-b border-[rgb(var(--border))]">
                <th className="py-2 px-2">Data</th>
                <th className="py-2 px-2 text-right">Impressões</th>
                <th className="py-2 px-2 text-right">Cliques</th>
                <th className="py-2 px-2 text-right">Gasto</th>
                <th className="py-2 px-2 text-right">Conversões</th>
              </tr>
            </thead>
            <tbody>
              {mockVisaoDiaria.map((d) => (
                <tr key={d.date} className="border-b border-[rgb(var(--border))] last:border-0">
                  <td className="py-2 px-2 font-bold">{formatDate(d.date)}</td>
                  <td className="py-2 px-2 text-right">{formatNumber(d.impressoes)}</td>
                  <td className="py-2 px-2 text-right">{formatNumber(d.cliques)}</td>
                  <td className="py-2 px-2 text-right">{formatCurrency(d.spend)}</td>
                  <td className="py-2 px-2 text-right font-bold">{d.conversoes}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      {/* Nota */}
      <div className="bg-attention-bg border border-attention/30 text-attention rounded-lg p-4 text-xs">
        <strong>⚠ Dados mockados:</strong> esta página usa dados fake em{' '}
        <code className="bg-white/30 px-1 rounded">data/mock-metrics.ts</code>. Quando o sync
        Meta Ads real estiver implementado, substituir por queries no Supabase.
      </div>
    </div>
  );
}

function MetaCard({ label, meta, atual, pace }: { label: string; meta: number; atual: number; pace: number }) {
  const pct = Math.min(pace, 1.5); // cap visual em 150%
  const color = pace >= 1 ? 'bg-success' : pace >= 0.7 ? 'bg-attention' : 'bg-warn';
  return (
    <div className="card">
      <div className="kpi-label">{label}</div>
      <div className="flex items-baseline gap-2 mt-1">
        <span className="text-xl font-extrabold">{formatNumber(atual)}</span>
        <span className="text-xs text-[rgb(var(--muted))]">/ {formatNumber(meta)}</span>
      </div>
      <div className="h-2 bg-[rgb(var(--border))] rounded-full mt-2 overflow-hidden">
        <div className={`h-full ${color} transition-all`} style={{ width: `${Math.min(pct * 100, 150)}%` }} />
      </div>
      <div className="text-[10px] text-[rgb(var(--muted))] mt-1.5 font-bold">
        {formatPercent(pace)} da meta
      </div>
    </div>
  );
}

function Row({ label, value, strong = false }: { label: string; value: string; strong?: boolean }) {
  return (
    <div className="flex justify-between items-center text-sm">
      <span className="text-[rgb(var(--muted))]">{label}</span>
      <span className={strong ? 'font-extrabold text-base' : 'font-bold'}>{value}</span>
    </div>
  );
}

function labelMeta(key: string): string {
  const map: Record<string, string> = {
    leadsMes: 'Leads/mês',
    reunioesMes: 'Reuniões/mês',
    vendasMes: 'Vendas/mês',
    ticketMedio: 'Ticket médio',
  };
  return map[key] || key;
}

function formatDate(iso: string): string {
  const [, m, d] = iso.split('-');
  return `${d}/${m}`;
}
