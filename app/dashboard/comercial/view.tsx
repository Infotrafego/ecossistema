'use client';

/**
 * Comercial Consultivo · todas as abas
 *
 * Client component porque três abas têm interação local: o drill-down da call,
 * a seleção de pessoa no coaching e a troca de conversa no WhatsApp. O resto é
 * render puro em cima dos mocks.
 */

import { useState } from 'react';
import { MessageCircle, Send, X } from 'lucide-react';
import { DADOS_COMERCIAL, LEADS_DIA } from '@/data/mock-comercial';
import { PIPELINE, CONVERSAS } from '@/data/mock-gestao';
import { Abas, resolverAba, type Aba } from '@/components/mock/abas';
import {
  Alerta,
  AvisoMock,
  Barra,
  Cabecalho,
  Cartao,
  Celula,
  ColunaKanban,
  FaixaKpis,
  Kanban,
  Kpi,
  Linha,
  ListaDist,
  Selo,
  Tabela,
  moeda,
  moedaCurta,
  num,
  pct,
  type Tom,
} from '@/components/mock/ui';
import { cn } from '@/lib/utils';

const D = DADOS_COMERCIAL;

const ABAS: readonly Aba[] = [
  { id: 'overview', label: 'Visão Geral' },
  { id: 'calls', label: 'Calls', contador: D.calls.length },
  { id: 'leads', label: 'Leads', contador: LEADS_DIA.total_ontem },
  { id: 'time', label: 'Time Comercial', contador: D.team.sdrs.length + D.team.closers.length },
  { id: 'padroes', label: 'Padrões & Coaching' },
  { id: 'historico', label: 'Histórico' },
  { id: 'crm', label: 'CRM Kanban' },
  { id: 'conversas', label: 'Conversas WhatsApp' },
] as const;

export function ComercialView({ tab }: { tab?: string }) {
  const atual = resolverAba(ABAS, tab);

  return (
    <div className="space-y-5">
      <Cabecalho
        titulo="Comercial Consultivo"
        subtitulo={`${D.cliente} · ${D.periodo}`}
      />

      <AvisoMock fase="Comercial Consultivo">
        Dados fictícios. A versão com CRM e telefonia plugados substitui só o dataset — a leitura das
        calls, o playbook e o coaching já estão no formato final.
      </AvisoMock>

      <Abas abas={ABAS} atual={atual} />

      {atual === 'overview' && <Overview />}
      {atual === 'calls' && <Calls />}
      {atual === 'leads' && <Leads />}
      {atual === 'time' && <Time />}
      {atual === 'padroes' && <Padroes />}
      {atual === 'historico' && <Historico />}
      {atual === 'crm' && <Crm />}
      {atual === 'conversas' && <Conversas />}
    </div>
  );
}

/* ═══════════════════════════════ Visão Geral ═══════════════════════════════ */

function variacao(atual: number, anterior: number): number {
  if (!anterior) return 0;
  return Math.round(((atual - anterior) / anterior) * 100);
}

function Overview() {
  const k = D.kpis;
  const p = D.kpis_prev;

  const funil = [
    { etapa: 'Calls agendadas', valor: k.calls_agendadas, taxa: '100%' },
    {
      etapa: 'Calls realizadas',
      valor: k.calls_realizadas,
      taxa: pct((k.calls_realizadas / k.calls_agendadas) * 100),
    },
    { etapa: 'Vendas', valor: k.vendas, taxa: pct((k.vendas / k.calls_realizadas) * 100) },
  ];

  const objecoes = contarObjecoes();

  return (
    <div className="space-y-4">
      <FaixaKpis cols="grid-cols-2 md:grid-cols-4 xl:grid-cols-8">
        <Kpi rotulo="Calls agendadas" valor={num(k.calls_agendadas)} nota={`vs ${p.calls_agendadas}`} />
        <Kpi rotulo="Calls realizadas" valor={num(k.calls_realizadas)} nota={`vs ${p.calls_realizadas}`} />
        <Kpi
          rotulo="Show rate"
          valor={pct(k.show_rate)}
          nota={`${(k.show_rate - p.show_rate).toFixed(1)}pts`}
          tom="ok"
        />
        <Kpi
          rotulo="Close rate"
          valor={pct(k.close_rate)}
          nota={`${(k.close_rate - p.close_rate).toFixed(1)}pts`}
          tom="ok"
        />
        <Kpi rotulo="Vendas" valor={num(k.vendas)} nota={`vs ${p.vendas}`} tom="ok" destaque />
        <Kpi rotulo="Receita" valor={moedaCurta(k.receita)} nota={`${variacao(k.receita, p.receita)}%`} tom="ok" />
        <Kpi rotulo="Ticket médio" valor={moedaCurta(k.ticket_medio)} nota={`vs ${moedaCurta(p.ticket_medio)}`} />
        <Kpi
          rotulo="Ciclo médio"
          valor={`${k.ciclo_medio_dias}d`}
          nota={`vs ${p.ciclo_medio_dias}d`}
          tom="ok"
        />
      </FaixaKpis>

      <Cartao
        titulo="⚠️ Anomalias detectadas · ações sugeridas pela IA"
        meta={`${D.anomalias.length} padrões`}
      >
        <div>
          {D.anomalias.map((a) => (
            <Alerta
              key={a.padrao}
              origem={a.pessoa.split(' ')[0]}
              prioridade={a.severidade === 'alta' ? 'alta' : a.severidade === 'media' ? 'media' : 'baixa'}
            >
              <strong>{a.padrao}</strong>
              <div className="text-[rgb(var(--muted))] mt-0.5">→ {a.sugestao}</div>
            </Alerta>
          ))}
        </div>
      </Cartao>

      <div className="grid lg:grid-cols-2 gap-3">
        <Cartao titulo="Funil comercial · Lead → Venda">
          <div className="space-y-3">
            {funil.map((f) => (
              <div key={f.etapa}>
                <div className="flex items-baseline justify-between text-[11px] mb-1">
                  <span className="font-bold">{f.etapa}</span>
                  <span className="tabular-nums">
                    <strong>{num(f.valor)}</strong>{' '}
                    <span className="text-[rgb(var(--muted))]">{f.taxa}</span>
                  </span>
                </div>
                <Barra pct={(f.valor / funil[0].valor) * 100} tom="neutro" />
              </div>
            ))}
          </div>
        </Cartao>

        <Cartao titulo="Distribuição de objeções" meta="calls do período">
          <ListaDist itens={objecoes} tom="atencao" />
        </Cartao>

        <Cartao titulo="🎤 Speech analytics · talk/listen ratio">
          <div className="space-y-3">
            {[
              { label: 'Top performers', d: D.speech_analytics.top_performers, tom: 'ok' as Tom },
              { label: 'Média do time', d: D.speech_analytics.media_time, tom: 'neutro' as Tom },
              { label: 'Bottom performers', d: D.speech_analytics.bottom_performers, tom: 'ruim' as Tom },
            ].map((g) => (
              <div key={g.label}>
                <div className="text-[11px] font-bold mb-1">{g.label}</div>
                <div className="flex h-5 rounded overflow-hidden text-[9px] font-extrabold text-white">
                  <div
                    className="bg-navy flex items-center justify-center"
                    style={{ width: `${g.d.talk_ratio_closer}%` }}
                  >
                    {g.d.talk_ratio_closer}%
                  </div>
                  <div
                    className="bg-success flex items-center justify-center"
                    style={{ width: `${g.d.talk_ratio_lead}%` }}
                  >
                    {g.d.talk_ratio_lead}%
                  </div>
                  <div
                    className="bg-gray flex items-center justify-center"
                    style={{ width: `${g.d.talk_ratio_sdr}%` }}
                  >
                    {g.d.talk_ratio_sdr}%
                  </div>
                </div>
              </div>
            ))}
            <div className="flex gap-3 text-[9px] text-[rgb(var(--muted))]">
              <span>■ closer</span>
              <span className="text-success">■ lead</span>
              <span>■ SDR</span>
            </div>
            <p className="text-[10px] text-[rgb(var(--muted))] leading-relaxed border-t border-[rgb(var(--border))] pt-2">
              {D.speech_analytics.insight}
            </p>
          </div>
        </Cartao>

        <Cartao titulo="🔗 Origem do lead × performance comercial">
          <Tabela
            colunas={[
              { label: 'Criativo' },
              { label: 'Calls', alinhar: 'dir' },
              { label: 'Vendas', alinhar: 'dir' },
              { label: 'Close', alinhar: 'dir' },
              { label: 'Ciclo', alinhar: 'dir' },
            ]}
          >
            {D.origem_performance.map((o) => (
              <Linha key={o.criativo}>
                <Celula>
                  <span className="font-bold">{o.criativo}</span>
                  {o.highlight === 'top' && (
                    <Selo tom="ok" className="ml-1.5">
                      top
                    </Selo>
                  )}
                  {o.highlight === 'bottom' && (
                    <Selo tom="ruim" className="ml-1.5">
                      fraco
                    </Selo>
                  )}
                </Celula>
                <Celula alinhar="dir">{o.calls}</Celula>
                <Celula alinhar="dir">{o.vendas}</Celula>
                <Celula alinhar="dir" forte>
                  {pct(o.close_rate)}
                </Celula>
                <Celula alinhar="dir">{o.ciclo_dias}d</Celula>
              </Linha>
            ))}
          </Tabela>
        </Cartao>
      </div>

      <Cartao titulo="Ações sugeridas hoje · priorizadas por impacto" meta={`${D.diagnosticos.length} diagnósticos`}>
        <div className="space-y-2.5">
          {D.diagnosticos.map((d) => (
            <div
              key={d.id}
              className={cn(
                'rounded-md border p-2.5',
                d.severidade === 'alta'
                  ? 'border-warn/30 bg-warn/5'
                  : d.severidade === 'media'
                    ? 'border-attention/30 bg-attention/5'
                    : 'border-[rgb(var(--border))]',
              )}
            >
              <div className="flex items-start justify-between gap-2">
                <div className="text-[12px] font-extrabold">{d.titulo}</div>
                <Selo tom={d.severidade === 'alta' ? 'ruim' : d.severidade === 'media' ? 'atencao' : 'neutro'}>
                  {d.impacto_estimado}
                </Selo>
              </div>
              <p className="text-[11px] text-[rgb(var(--muted))] mt-1 leading-relaxed">{d.descricao}</p>
              <div className="text-[10px] text-[rgb(var(--muted))] mt-1.5">
                Afeta: <strong>{d.afetados.join(', ')}</strong> · {d.calls_relacionadas} calls
              </div>
            </div>
          ))}
        </div>
      </Cartao>
    </div>
  );
}

function contarObjecoes() {
  const mapa = new Map<string, number>();
  for (const c of D.calls) for (const o of c.objecoes) mapa.set(o, (mapa.get(o) ?? 0) + 1);
  const total = [...mapa.values()].reduce((a, b) => a + b, 0) || 1;
  return [...mapa.entries()]
    .sort((a, b) => b[1] - a[1])
    .map(([rotulo, n]) => ({
      rotulo: rotulo.charAt(0).toUpperCase() + rotulo.slice(1),
      valor: `${n}`,
      pct: (n / total) * 100,
      nota: `· ${Math.round((n / total) * 100)}%`,
    }));
}

/* ═══════════════════════════════════ Calls ══════════════════════════════════ */

const STATUS_CALL: Record<string, { label: string; tom: Tom }> = {
  ganha: { label: 'Ganha', tom: 'ok' },
  perdida: { label: 'Perdida', tom: 'ruim' },
  'no-show': { label: 'No-show', tom: 'atencao' },
};

type Call = (typeof D.calls)[number];

function Calls() {
  const [aberta, setAberta] = useState<Call | null>(null);
  const [filtro, setFiltro] = useState<string>('todas');

  const calls = filtro === 'todas' ? D.calls : D.calls.filter((c) => c.status === filtro);

  return (
    <div className="space-y-4">
      <div className="flex gap-1.5 flex-wrap">
        {[
          { id: 'todas', label: 'Todas' },
          { id: 'ganha', label: 'Ganhas' },
          { id: 'perdida', label: 'Perdidas' },
          { id: 'no-show', label: 'No-show' },
        ].map((f) => (
          <button
            key={f.id}
            type="button"
            onClick={() => setFiltro(f.id)}
            className={cn(
              'px-2.5 py-1 rounded-md text-[10px] font-extrabold border transition',
              filtro === f.id
                ? 'bg-navy text-white border-navy'
                : 'border-[rgb(var(--border))] text-[rgb(var(--muted))] hover:border-navy/40',
            )}
          >
            {f.label}
          </button>
        ))}
      </div>

      <Cartao meta={`${calls.length} calls · clique pra abrir o raio-X`}>
        <Tabela
          colunas={[
            { label: 'Call' },
            { label: 'Lead' },
            { label: 'SDR / Closer' },
            { label: 'Dur.', alinhar: 'dir' },
            { label: 'Valor', alinhar: 'dir' },
            { label: 'Score', alinhar: 'dir' },
            { label: 'Status' },
          ]}
        >
          {calls.map((c) => {
            const st = STATUS_CALL[c.status];
            return (
              <tr
                key={c.id}
                onClick={() => setAberta(c)}
                className="border-b border-[rgb(var(--border))] last:border-0 cursor-pointer hover:bg-navy/5 transition"
              >
                <Celula forte>
                  {c.id}
                  <div className="text-[9px] text-[rgb(var(--muted))] font-normal">{c.data}</div>
                </Celula>
                <Celula>{c.lead}</Celula>
                <Celula>
                  <div className="text-[10px]">{c.sdr}</div>
                  <div className="text-[10px] text-[rgb(var(--muted))]">{c.closer}</div>
                </Celula>
                <Celula alinhar="dir">{c.duracao}min</Celula>
                <Celula alinhar="dir">{c.valor ? moedaCurta(c.valor) : '—'}</Celula>
                <Celula alinhar="dir" forte>
                  {c.score}
                </Celula>
                <Celula>
                  <Selo tom={st.tom}>{st.label}</Selo>
                </Celula>
              </tr>
            );
          })}
        </Tabela>
      </Cartao>

      {aberta && <RaioX call={aberta} fechar={() => setAberta(null)} />}
    </div>
  );
}

function RaioX({ call, fechar }: { call: Call; fechar: () => void }) {
  const d = call.detalhe;
  const st = STATUS_CALL[call.status];

  return (
    <div
      className="fixed inset-0 z-50 bg-alicerce/60 backdrop-blur-sm flex items-start justify-center p-4 overflow-y-auto"
      onClick={fechar}
    >
      <div
        className="bg-[rgb(var(--surface))] rounded-xl border border-[rgb(var(--border))] w-full max-w-3xl my-8"
        onClick={(e) => e.stopPropagation()}
      >
        <header className="flex items-start justify-between gap-3 p-4 border-b border-[rgb(var(--border))] sticky top-0 bg-[rgb(var(--surface))] rounded-t-xl">
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-base font-extrabold tracking-tight">
                {call.id} · {call.lead}
              </h2>
              <Selo tom={st.tom}>{st.label}</Selo>
            </div>
            <p className="text-[11px] text-[rgb(var(--muted))] mt-0.5">
              {call.data} · {call.duracao}min · SDR {call.sdr} · Closer {call.closer}
              {call.valor ? ` · ${moeda(call.valor)}` : ''}
            </p>
          </div>
          <button
            type="button"
            onClick={fechar}
            className="p-1.5 rounded-md hover:bg-[rgb(var(--border))] transition shrink-0"
            aria-label="Fechar"
          >
            <X size={16} />
          </button>
        </header>

        <div className="p-4 space-y-4">
          <p className="text-[11px] leading-relaxed">{d.resumo}</p>

          <div className="grid sm:grid-cols-2 gap-3">
            <div className="card">
              <div className="kpi-label mb-2">Talk ratio</div>
              <div className="flex h-5 rounded overflow-hidden text-[9px] font-extrabold text-white">
                <div className="bg-navy flex items-center justify-center" style={{ width: `${d.talk_ratio.closer}%` }}>
                  {d.talk_ratio.closer}%
                </div>
                <div className="bg-success flex items-center justify-center" style={{ width: `${d.talk_ratio.lead}%` }}>
                  {d.talk_ratio.lead}%
                </div>
                <div className="bg-gray flex items-center justify-center" style={{ width: `${d.talk_ratio.sdr}%` }}>
                  {d.talk_ratio.sdr}%
                </div>
              </div>
              <div className="flex gap-3 text-[9px] text-[rgb(var(--muted))] mt-1.5">
                <span>■ closer</span>
                <span className="text-success">■ lead</span>
                <span>■ SDR</span>
              </div>
            </div>

            <div className="card">
              <div className="kpi-label mb-2">Origem do lead</div>
              <dl className="text-[10px] space-y-1">
                <div className="flex justify-between gap-2">
                  <dt className="text-[rgb(var(--muted))]">Criativo</dt>
                  <dd className="font-bold text-right">{d.origem_lead.criativo}</dd>
                </div>
                <div className="flex justify-between gap-2">
                  <dt className="text-[rgb(var(--muted))]">Público</dt>
                  <dd className="font-bold text-right">{d.origem_lead.publico}</dd>
                </div>
                <div className="flex justify-between gap-2">
                  <dt className="text-[rgb(var(--muted))]">Campanha</dt>
                  <dd className="font-bold text-right">{d.origem_lead.campanha}</dd>
                </div>
              </dl>
            </div>
          </div>

          <div>
            <div className="kpi-label mb-2">Roteiro da call</div>
            <div className="space-y-2">
              {d.script.map((s) => (
                <div
                  key={s.fase}
                  className={cn(
                    'rounded-md border p-2.5',
                    s.highlight ? 'border-navy/30 bg-navy/5' : 'border-[rgb(var(--border))]',
                  )}
                >
                  <div className="text-[10px] font-extrabold uppercase tracking-wider text-navy">{s.fase}</div>
                  <p className="text-[11px] mt-1 leading-relaxed">{s.texto}</p>
                </div>
              ))}
            </div>
          </div>

          <div>
            <div className="kpi-label mb-2">Frases-chave</div>
            <div className="space-y-1.5">
              {d.frases_chave.map((f) => (
                <div key={f.texto} className="flex gap-2 text-[11px]">
                  <Selo tom={f.tipo === 'vencedora' ? 'ok' : 'ruim'}>{f.momento}</Selo>
                  <span className="italic">&ldquo;{f.texto}&rdquo;</span>
                </div>
              ))}
            </div>
          </div>

          <div
            className={cn(
              'rounded-md p-3 text-[11px] leading-relaxed',
              call.status === 'ganha' ? 'bg-success/10' : 'bg-warn/10',
            )}
          >
            <span className="font-extrabold">
              {call.status === 'ganha' ? 'Por que ganhou' : 'Por que perdeu'}:{' '}
            </span>
            {'porque_ganhou' in d ? d.porque_ganhou : (d as { porque_perdeu?: string }).porque_perdeu}
          </div>
        </div>
      </div>
    </div>
  );
}

/* ═══════════════════════════════════ Leads ══════════════════════════════════ */

const STATUS_LEAD: Record<string, { label: string; tom: Tom }> = {
  nao_contactado: { label: '🔴 Não contactado', tom: 'ruim' },
  em_conversa: { label: '⏳ Em conversa', tom: 'atencao' },
  agendado: { label: '✅ Agendado', tom: 'ok' },
};

function Leads() {
  const L = LEADS_DIA;
  const maxHora = Math.max(...L.heatmap_horas.map((h) => h.leads));

  return (
    <div className="space-y-4">
      <FaixaKpis cols="grid-cols-2 md:grid-cols-4">
        <Kpi rotulo="Leads ontem" valor={L.total_ontem} nota={L.data_referencia} destaque />
        <Kpi rotulo="Qualificação alta" valor={L.qualificacao_dist.alta} nota="score ≥ 75" tom="ok" />
        <Kpi rotulo="Média" valor={L.qualificacao_dist.media} nota="score 50–74" tom="atencao" />
        <Kpi rotulo="Baixa" valor={L.qualificacao_dist.baixa} nota="score < 50" tom="ruim" />
      </FaixaKpis>

      <Cartao titulo="Top leads do dia · priorizados por score" meta="clique no WhatsApp pra abordar">
        <div className="space-y-2">
          {L.leads.map((lead, i) => {
            const st = STATUS_LEAD[lead.status];
            const tier: Tom = lead.score >= 75 ? 'ok' : lead.score >= 50 ? 'atencao' : 'ruim';
            return (
              <div
                key={lead.id}
                className={cn(
                  'rounded-md border p-2.5 flex gap-3 items-start',
                  tier === 'ok' ? 'border-success/30' : tier === 'atencao' ? 'border-attention/30' : 'border-[rgb(var(--border))]',
                )}
              >
                <div className="text-[10px] font-extrabold text-[rgb(var(--muted))] w-6 shrink-0 pt-0.5">
                  #{i + 1}
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex items-baseline gap-2 flex-wrap">
                    <span className="text-[12px] font-extrabold">{lead.nome}</span>
                    <span className="text-[9px] text-[rgb(var(--muted))]">{lead.id}</span>
                    <span className="text-[10px] text-[rgb(var(--muted))]">{lead.telefone}</span>
                    <span className="text-[9px] text-[rgb(var(--muted))]">⏰ {lead.horario}</span>
                  </div>

                  <div className="flex gap-1 flex-wrap mt-1.5">
                    {lead.criterios.map((c) => (
                      <span
                        key={c.label}
                        className={cn(
                          'text-[9px] px-1.5 py-0.5 rounded border font-bold',
                          c.color === 'verde'
                            ? 'border-success/30 bg-success/10 text-success'
                            : c.color === 'amarelo'
                              ? 'border-attention/30 bg-attention/10 text-attention'
                              : 'border-navy/30 bg-navy/5 text-navy',
                        )}
                      >
                        {c.icon} {c.label}
                      </span>
                    ))}
                  </div>

                  <div className="text-[10px] text-[rgb(var(--muted))] mt-1.5">
                    🎯 <strong>{lead.criativo}</strong> · 👥 <strong>{lead.publico}</strong>
                  </div>
                  <div className="text-[10px] mt-0.5">{lead.obs}</div>
                </div>

                <div className="text-center shrink-0 w-12">
                  <div
                    className={cn(
                      'text-lg font-extrabold tracking-tight',
                      tier === 'ok' ? 'text-success' : tier === 'atencao' ? 'text-attention' : 'text-warn',
                    )}
                  >
                    {lead.score}
                  </div>
                  <div className="text-[9px] text-[rgb(var(--muted))]">Score</div>
                </div>

                <div className="shrink-0 flex flex-col items-end gap-1.5">
                  <Selo tom={st.tom}>{st.label}</Selo>
                  <button
                    type="button"
                    className="text-[10px] font-extrabold text-success inline-flex items-center gap-1 hover:underline"
                  >
                    <MessageCircle size={11} /> WhatsApp
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </Cartao>

      <div className="grid lg:grid-cols-3 gap-3">
        <Cartao titulo="Critérios que mais aparecem">
          <ListaDist
            itens={L.criterios_top.map((c) => ({
              rotulo: `${c.icon} ${c.nome}`,
              valor: `${c.pct}%`,
              pct: c.pct,
            }))}
          />
        </Cartao>

        <Cartao titulo="Origem dos leads top">
          <ListaDist
            itens={L.origem_top.map((o) => ({
              rotulo: o.criativo,
              valor: `${o.leads_top} leads`,
              pct: o.pct,
              nota: `· ${o.pct}%`,
            }))}
            tom="ok"
          />
        </Cartao>

        <Cartao titulo="Horário de entrada" meta="% de leads top por faixa">
          <ListaDist
            itens={L.heatmap_horas.map((h) => ({
              rotulo: h.hora,
              valor: `${h.leads} leads`,
              pct: (h.leads / maxHora) * 100,
              nota: `· ${h.top_pct}% top`,
            }))}
            tom="atencao"
          />
        </Cartao>
      </div>
    </div>
  );
}

/* ═══════════════════════════════════ Time ═══════════════════════════════════ */

function Time() {
  return (
    <div className="space-y-4">
      <Cartao titulo="SDRs" meta="qualificação e agendamento">
        <Tabela
          colunas={[
            { label: '#' },
            { label: 'Nome' },
            { label: 'Origem' },
            { label: 'Calls', alinhar: 'dir' },
            { label: 'Qualif.', alinhar: 'dir' },
            { label: 'Show', alinhar: 'dir' },
            { label: 'Observação' },
          ]}
        >
          {D.team.sdrs.map((s) => (
            <Linha key={s.nome}>
              <Celula forte>{s.rank}</Celula>
              <Celula forte>{s.nome}</Celula>
              <Celula>
                <Selo tom={s.origem === 'cliente' ? 'neutro' : 'ok'}>{s.origem}</Selo>
              </Celula>
              <Celula alinhar="dir">{s.calls}</Celula>
              <Celula alinhar="dir">{pct(s.qual_rate)}</Celula>
              <Celula alinhar="dir" forte>
                {pct(s.show_rate)}
              </Celula>
              <Celula className="text-[rgb(var(--muted))]">{s.obs}</Celula>
            </Linha>
          ))}
        </Tabela>
      </Cartao>

      <Cartao titulo="Closers" meta="fechamento e ticket">
        <Tabela
          colunas={[
            { label: '#' },
            { label: 'Nome' },
            { label: 'Origem' },
            { label: 'Calls', alinhar: 'dir' },
            { label: 'Vendas', alinhar: 'dir' },
            { label: 'Close', alinhar: 'dir' },
            { label: 'Ticket', alinhar: 'dir' },
            { label: 'Observação' },
          ]}
        >
          {D.team.closers.map((c) => (
            <Linha key={c.nome}>
              <Celula forte>{c.rank}</Celula>
              <Celula forte>{c.nome}</Celula>
              <Celula>
                <Selo tom={c.origem === 'cliente' ? 'neutro' : 'ok'}>{c.origem}</Selo>
              </Celula>
              <Celula alinhar="dir">{c.calls}</Celula>
              <Celula alinhar="dir">{c.vendas}</Celula>
              <Celula alinhar="dir" forte>
                {pct(c.close_rate)}
              </Celula>
              <Celula alinhar="dir">{moedaCurta(c.ticket_medio)}</Celula>
              <Celula className="text-[rgb(var(--muted))]">{c.obs}</Celula>
            </Linha>
          ))}
        </Tabela>
      </Cartao>
    </div>
  );
}

/* ═════════════════════════════ Padrões & Coaching ═══════════════════════════ */

function Padroes() {
  const pessoas = Object.keys(D.coaching);
  const [pessoa, setPessoa] = useState(pessoas[0]);
  const c = D.coaching[pessoa as keyof typeof D.coaching];

  return (
    <div className="space-y-4">
      <Cartao titulo="Playbook · o que funciona e o que não funciona">
        <div className="space-y-3">
          {D.playbook.map((p) => (
            <div key={p.cenario} className="border border-[rgb(var(--border))] rounded-md p-3">
              <div className="flex items-baseline justify-between gap-2 mb-2">
                <span className="text-[12px] font-extrabold">{p.cenario}</span>
                <span className="text-[10px] text-[rgb(var(--muted))]">{p.freq}</span>
              </div>
              <div className="grid md:grid-cols-2 gap-3">
                <div>
                  <div className="text-[9px] uppercase tracking-wider font-extrabold text-success mb-1.5">
                    ✓ Top performers
                  </div>
                  <div className="space-y-2">
                    {p.top.map((f) => (
                      <div key={f.frase} className="text-[11px]">
                        <div className="italic">&ldquo;{f.frase}&rdquo;</div>
                        <div className="text-[10px] text-[rgb(var(--muted))] mt-0.5">{f.explicacao}</div>
                      </div>
                    ))}
                  </div>
                </div>
                <div>
                  <div className="text-[9px] uppercase tracking-wider font-extrabold text-warn mb-1.5">
                    ✕ Bottom performers
                  </div>
                  <div className="space-y-2">
                    {p.bottom.map((f) => (
                      <div key={f.frase} className="text-[11px]">
                        <div className="italic">&ldquo;{f.frase}&rdquo;</div>
                        <div className="text-[10px] text-[rgb(var(--muted))] mt-0.5">{f.explicacao}</div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </Cartao>

      <Cartao titulo="Coaching 1:1" meta="selecione a pessoa">
        <div className="flex gap-1.5 flex-wrap mb-3">
          {pessoas.map((p) => (
            <button
              key={p}
              type="button"
              onClick={() => setPessoa(p)}
              className={cn(
                'px-2.5 py-1 rounded-md text-[10px] font-extrabold border transition',
                pessoa === p
                  ? 'bg-navy text-white border-navy'
                  : 'border-[rgb(var(--border))] text-[rgb(var(--muted))] hover:border-navy/40',
              )}
            >
              {p}
            </button>
          ))}
        </div>

        <div className="text-[12px] font-bold mb-3">{c.perfil}</div>

        <div className="grid md:grid-cols-2 gap-3 mb-3">
          <div>
            <div className="text-[9px] uppercase tracking-wider font-extrabold text-success mb-1.5">
              Pontos fortes
            </div>
            <ul className="text-[11px] space-y-1 text-[rgb(var(--muted))]">
              {c.pontos_fortes.map((p) => (
                <li key={p}>· {p}</li>
              ))}
            </ul>
          </div>
          <div>
            <div className="text-[9px] uppercase tracking-wider font-extrabold text-warn mb-1.5">Gaps</div>
            <ul className="text-[11px] space-y-1 text-[rgb(var(--muted))]">
              {c.gaps.map((g) => (
                <li key={g}>· {g}</li>
              ))}
            </ul>
          </div>
        </div>

        <div className="mb-3">
          <div className="text-[9px] uppercase tracking-wider font-extrabold text-[rgb(var(--muted))] mb-1.5">
            Recomendações
          </div>
          <div className="space-y-2">
            {c.recomendacoes.map((r) => (
              <div key={r.acao} className="rounded-md bg-navy/5 p-2.5">
                <div className="text-[11px] font-bold">{r.acao}</div>
                <div className="text-[10px] text-[rgb(var(--muted))] mt-0.5">{r.exemplo}</div>
              </div>
            ))}
          </div>
        </div>

        <div className="border-t border-[rgb(var(--border))] pt-3 grid grid-cols-3 gap-3 text-center">
          <div>
            <div className="kpi-label">Close 30d atrás</div>
            <div className="text-lg font-extrabold">{c.evolucao['30d_atras'].close_rate}%</div>
          </div>
          <div>
            <div className="kpi-label">Close hoje</div>
            <div className="text-lg font-extrabold">{c.evolucao.hoje.close_rate}%</div>
          </div>
          <div>
            <div className="kpi-label">Tendência</div>
            <div className="text-[11px] font-bold mt-1.5">{c.evolucao.trend}</div>
          </div>
        </div>
      </Cartao>
    </div>
  );
}

/* ═══════════════════════════════ Histórico ══════════════════════════════════ */

function Historico() {
  return (
    <Cartao titulo="Recomendações emitidas · e o que deu" meta={`${D.recomendacoes.length} registros`}>
      <div className="space-y-2.5">
        {D.recomendacoes.map((r) => (
          <div key={r.id} className="border-l-2 border-navy pl-3 py-1">
            <div className="flex items-baseline justify-between gap-2 flex-wrap">
              <span className="text-[12px] font-extrabold">{r.titulo}</span>
              <Selo tom={r.status === 'feito' ? 'ok' : r.status === 'andamento' ? 'atencao' : 'neutro'}>
                {r.status}
              </Selo>
            </div>
            <div className="text-[10px] text-[rgb(var(--muted))] mt-0.5">
              {r.data} · {r.destinatarios}
            </div>
            <div className="text-[11px] mt-1">{r.impacto}</div>
          </div>
        ))}
      </div>
    </Cartao>
  );
}

/* ═════════════════════════════════ CRM ══════════════════════════════════════ */

const TAG_TOM: Record<string, Tom> = {
  Quente: 'ruim',
  Morno: 'atencao',
  Frio: 'neutro',
  Renovado: 'ok',
};

function Crm() {
  const total = PIPELINE.reduce((s, c) => s + c.total, 0);

  return (
    <Cartao titulo="Pipeline · Comercial Padrão" meta={`${total} oportunidades abertas`}>
      <Kanban>
        {PIPELINE.map((col) => (
          <ColunaKanban key={col.etapa} titulo={col.etapa} total={col.total}>
            {col.deals.map((d) => (
              <div key={d.nome} className="rounded-md border border-[rgb(var(--border))] p-2.5 bg-[rgb(var(--bg))]">
                <div className="text-[11px] font-extrabold">{d.nome}</div>
                <div className="text-[10px] text-[rgb(var(--muted))]">{d.contexto}</div>
                <div className="text-[11px] font-bold text-navy mt-1">{d.valor}</div>
                <div className="mt-1.5">
                  <Selo tom={TAG_TOM[d.tag] ?? 'neutro'}>{d.tag}</Selo>
                </div>
              </div>
            ))}
            {col.total > col.deals.length && (
              <div className="text-[10px] text-[rgb(var(--muted))] text-center py-2">
                + {col.total - col.deals.length} não exibidos
              </div>
            )}
          </ColunaKanban>
        ))}
      </Kanban>
    </Cartao>
  );
}

/* ══════════════════════════════ Conversas ═══════════════════════════════════ */

function Conversas() {
  const [ativa, setAtiva] = useState(CONVERSAS[0].id);
  const conversa = CONVERSAS.find((c) => c.id === ativa) ?? CONVERSAS[0];
  const abertas = CONVERSAS.length;

  return (
    <Cartao titulo="Conversas WhatsApp" meta={`${abertas} abertas`} className="p-0 overflow-hidden">
      <div className="grid md:grid-cols-[260px_1fr] min-h-[460px]">
        <div className="border-r border-[rgb(var(--border))] overflow-y-auto max-h-[460px]">
          {CONVERSAS.map((c) => (
            <button
              key={c.id}
              type="button"
              onClick={() => setAtiva(c.id)}
              className={cn(
                'w-full text-left px-3 py-2.5 border-b border-[rgb(var(--border))] transition',
                c.id === ativa ? 'bg-navy/5' : 'hover:bg-[rgb(var(--bg))]',
              )}
            >
              <div className="flex items-baseline justify-between gap-2">
                <span className="text-[11px] font-extrabold truncate">{c.nome}</span>
                <span className="text-[9px] text-[rgb(var(--muted))] shrink-0">{c.hora}</span>
              </div>
              <div className="flex items-center gap-1.5 mt-0.5">
                <span className="text-[10px] text-[rgb(var(--muted))] truncate flex-1">{c.previa}</span>
                {c.naoLidas > 0 && (
                  <span className="text-[9px] font-extrabold bg-success text-white rounded-full px-1.5 shrink-0">
                    {c.naoLidas}
                  </span>
                )}
              </div>
            </button>
          ))}
        </div>

        <div className="flex flex-col max-h-[460px]">
          <div className="px-4 py-2.5 border-b border-[rgb(var(--border))]">
            <div className="text-[12px] font-extrabold">{conversa.nome}</div>
            <div className="text-[10px] text-[rgb(var(--muted))]">{conversa.contexto}</div>
          </div>

          <div className="flex-1 overflow-y-auto p-4 space-y-2.5 bg-[rgb(var(--bg))]">
            {conversa.mensagens.map((m, i) => (
              <div key={i} className={cn('flex', m.de === 'nos' ? 'justify-end' : 'justify-start')}>
                <div
                  className={cn(
                    'max-w-[78%] rounded-lg px-3 py-2 text-[11px] leading-relaxed',
                    m.de === 'nos'
                      ? 'bg-navy text-white rounded-br-sm'
                      : 'bg-[rgb(var(--surface))] border border-[rgb(var(--border))] rounded-bl-sm',
                  )}
                >
                  {m.texto}
                  <div className={cn('text-[9px] mt-1', m.de === 'nos' ? 'text-ash' : 'text-[rgb(var(--muted))]')}>
                    {m.hora}
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div className="p-3 border-t border-[rgb(var(--border))] flex gap-2">
            <input
              type="text"
              placeholder="Digite sua mensagem..."
              disabled
              className="flex-1 px-3 py-2 bg-[rgb(var(--bg))] border border-[rgb(var(--border))] rounded-md text-[11px] outline-none disabled:opacity-60"
            />
            <button
              type="button"
              disabled
              className="px-3 py-2 bg-navy text-white rounded-md text-[11px] font-extrabold inline-flex items-center gap-1.5 disabled:opacity-50"
            >
              <Send size={12} /> Enviar
            </button>
          </div>
        </div>
      </div>
    </Cartao>
  );
}
