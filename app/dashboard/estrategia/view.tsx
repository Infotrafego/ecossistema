'use client';

/**
 * Estratégia & Inteligência · todas as abas
 *
 * A única interação local é a seleção de reunião na aba de decisões; o resto é
 * render puro. Fica client pra compartilhar o componente de abas com os outros
 * módulos novos.
 */

import { useState } from 'react';
import { DADOS_ESTRATEGIA, ORGANICO, DISTRIBUICAO, REUNIOES } from '@/data/mock-estrategia';
import { Abas, resolverAba, type Aba } from '@/components/mock/abas';
import {
  AvisoMock,
  Barra,
  Cabecalho,
  Cartao,
  Celula,
  EmConstrucao,
  FaixaKpis,
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

const D = DADOS_ESTRATEGIA;

const ABAS: readonly Aba[] = [
  { id: 'visao', label: 'Visão Estratégica' },
  { id: 'forecast', label: 'Forecast & Cenários' },
  { id: 'testes', label: 'Plano de Testes', contador: D.plano_testes.length },
  { id: 'saturacao', label: 'Mapa de Saturação', contador: D.saturacao.length },
  { id: 'budget', label: 'Alocação de Budget' },
  { id: 'canais', label: 'Estratégia de Canal' },
  { id: 'organico', label: 'Conteúdo Orgânico', contador: ORGANICO.perfis.length },
  { id: 'distribuicao', label: 'Distribuição de Conteúdo' },
  { id: 'reunioes', label: 'Reuniões & Decisões', contador: REUNIOES.length },
  { id: 'discovery', label: 'Discovery & Persona' },
] as const;

export function EstrategiaView({ tab }: { tab?: string }) {
  const atual = resolverAba(ABAS, tab);

  return (
    <div className="space-y-5">
      <Cabecalho titulo="Estratégia & Inteligência" subtitulo={`${D.cliente} · ${D.periodo}`} />

      <AvisoMock fase="Estratégia & Inteligência">
        Cérebro estratégico do cliente, para as reuniões semanais. Números mockados — o forecast real
        sai do histórico do Supabase quando a fase entrar.
      </AvisoMock>

      <Abas abas={ABAS} atual={atual} />

      {atual === 'visao' && <Visao />}
      {atual === 'forecast' && <Forecast />}
      {atual === 'testes' && <Testes />}
      {atual === 'saturacao' && <Saturacao />}
      {atual === 'budget' && <Budget />}
      {atual === 'canais' && <Canais />}
      {atual === 'organico' && <Organico />}
      {atual === 'distribuicao' && <Distribuicao />}
      {atual === 'reunioes' && <Reunioes />}
      {atual === 'discovery' && (
        <EmConstrucao
          titulo="Discovery & Persona"
          texto="A tela vai consolidar o dossiê do cliente — voz do cliente, banco de ângulos, mapa de objeções e estudo de concorrentes — que hoje sai em .docx pelo agente de diagnóstico. Depende de trazer esse conteúdo pro banco."
        />
      )}
    </div>
  );
}

/* ═════════════════════════════ Visão Estratégica ════════════════════════════ */

function Visao() {
  const k = D.kpis_estrategicos;
  const m = D.meta;
  const gapRitmo = m.ritmo_dia_necessario_leads - m.ritmo_dia_atual_leads;

  return (
    <div className="space-y-4">
      <FaixaKpis cols="grid-cols-2 md:grid-cols-3 xl:grid-cols-5">
        <Kpi rotulo="Receita YTD" valor={moedaCurta(k.receita_ytd)} nota={`ROAS ${k.roas_ytd}`} tom="ok" destaque />
        <Kpi rotulo="Investimento YTD" valor={moedaCurta(k.investimento_ytd)} nota={`mês: ${moedaCurta(k.investimento_mes)}`} />
        <Kpi rotulo="Leads · MQLs" valor={`${num(k.leads_ytd)} · ${num(k.mqls_ytd)}`} nota={`${pct((k.mqls_ytd / k.leads_ytd) * 100)} qualif.`} />
        <Kpi
          rotulo="CAC atual"
          valor={moeda(k.cac_atual)}
          nota={`alvo ${moeda(k.cac_alvo)}`}
          tom={k.cac_atual > k.cac_alvo ? 'ruim' : 'ok'}
        />
        <Kpi rotulo="LTV por venda" valor={moedaCurta(k.ltv_per_venda)} nota={`ticket ${moedaCurta(k.ticket_medio)}`} tom="ok" />
      </FaixaKpis>

      <div className="grid lg:grid-cols-2 gap-3">
        <Cartao titulo="🎯 Meta do mês" meta={`${m.atingimento_atual_pct}% atingido`}>
          <div className="space-y-3">
            <MetaLinha rotulo="Receita" realizado={moedaCurta(k.receita_ytd)} meta={moedaCurta(m.receita_mes)} pctv={m.atingimento_atual_pct} />
            <MetaLinha rotulo="Leads" realizado={num(k.leads_ytd)} meta={num(m.leads_mes)} pctv={Math.round((k.leads_ytd / m.leads_mes) * 100)} />
            <MetaLinha rotulo="Vendas" realizado="28" meta={num(m.vendas_mes)} pctv={Math.round((28 / m.vendas_mes) * 100)} />
          </div>
        </Cartao>

        <Cartao titulo="📊 Ritmo de leads · diário" meta="necessário vs atual">
          <div className="flex items-end gap-6">
            <div>
              <div className="kpi-label">Necessário/dia</div>
              <div className="text-3xl font-extrabold tracking-tight">{m.ritmo_dia_necessario_leads}</div>
            </div>
            <div>
              <div className="kpi-label">Atual/dia</div>
              <div className="text-3xl font-extrabold tracking-tight text-warn">{m.ritmo_dia_atual_leads}</div>
            </div>
            <div className="ml-auto text-right">
              <div className="kpi-label">Gap</div>
              <div className="text-xl font-extrabold tracking-tight text-warn">-{gapRitmo}</div>
              <div className="text-[10px] text-[rgb(var(--muted))]">leads/dia</div>
            </div>
          </div>
          <div className="mt-3">
            <Barra pct={(m.ritmo_dia_atual_leads / m.ritmo_dia_necessario_leads) * 100} tom="ruim" />
          </div>
          <p className="text-[10px] text-[rgb(var(--muted))] mt-2 leading-relaxed">
            Fechar o gap exige {gapRitmo} leads/dia a mais — é o que os três testes de prioridade alta
            do plano estão perseguindo.
          </p>
        </Cartao>
      </div>

      <Cartao titulo="🎯 Top 3 ações estratégicas da semana" meta="maior score primeiro">
        <div className="space-y-2">
          {[...D.plano_testes]
            .sort((a, b) => b.score_estrategico - a.score_estrategico)
            .slice(0, 3)
            .map((t) => (
              <div key={t.id} className="flex items-start gap-3 rounded-md border border-[rgb(var(--border))] p-2.5">
                <div className="text-base font-extrabold text-navy w-9 shrink-0">{t.score_estrategico}</div>
                <div className="flex-1 min-w-0">
                  <div className="text-[12px] font-extrabold">{t.nome}</div>
                  <div className="text-[10px] text-[rgb(var(--muted))] mt-0.5">{t.impacto_estimado}</div>
                </div>
                <Selo tom={t.status === 'rodando' ? 'atencao' : t.status === 'validado' ? 'ok' : 'neutro'}>
                  {t.status.replace('_', ' ')}
                </Selo>
              </div>
            ))}
        </div>
      </Cartao>
    </div>
  );
}

function MetaLinha({
  rotulo,
  realizado,
  meta,
  pctv,
}: {
  rotulo: string;
  realizado: string;
  meta: string;
  pctv: number;
}) {
  return (
    <div>
      <div className="flex items-baseline justify-between text-[11px] mb-1">
        <span className="font-bold">{rotulo}</span>
        <span className="tabular-nums text-[rgb(var(--muted))]">
          {realizado} / {meta} · <strong>{pctv}%</strong>
        </span>
      </div>
      <Barra pct={pctv} tom={pctv >= 80 ? 'ok' : pctv >= 40 ? 'atencao' : 'ruim'} />
    </div>
  );
}

/* ═══════════════════════════════ Forecast ═══════════════════════════════════ */

function Forecast() {
  const cenarios = [
    { id: 'pessimista', label: 'Pessimista', tom: 'ruim' as Tom, ...D.forecast.pessimista },
    { id: 'realista', label: 'Realista', tom: 'atencao' as Tom, ...D.forecast.realista },
    { id: 'otimista', label: 'Otimista', tom: 'ok' as Tom, ...D.forecast.otimista },
  ];
  const maxReceita = Math.max(...cenarios.map((c) => c.receita), D.meta.receita_mes);

  return (
    <div className="space-y-4">
      <Cartao titulo="Cenários · projeção de fim de mês" meta={`meta do mês: ${moedaCurta(D.meta.receita_mes)}`}>
        <div className="grid md:grid-cols-3 gap-3">
          {cenarios.map((c) => (
            <div
              key={c.id}
              className={cn(
                'rounded-lg border p-3',
                c.tom === 'ok' ? 'border-success/40' : c.tom === 'atencao' ? 'border-attention/40' : 'border-warn/40',
              )}
            >
              <div className="flex items-center justify-between mb-2">
                <span className="text-[11px] font-extrabold uppercase tracking-wider">{c.label}</span>
                <Selo tom={c.tom}>
                  {c.vs_meta > 0 ? '+' : ''}
                  {c.vs_meta}% vs meta
                </Selo>
              </div>
              <div className="text-2xl font-extrabold tracking-tight">{moedaCurta(c.receita)}</div>
              <div className="text-[10px] text-[rgb(var(--muted))] mt-0.5">
                {num(c.leads)} leads · {c.vendas} vendas
              </div>
              <div className="mt-2">
                <Barra pct={(c.receita / maxReceita) * 100} tom={c.tom} />
              </div>
              <p className="text-[10px] text-[rgb(var(--muted))] mt-2 leading-relaxed">{c.premissa}</p>
            </div>
          ))}
        </div>
      </Cartao>

      <Cartao titulo="📈 Curva de receita · realizado vs projetado">
        <Tabela
          colunas={[
            { label: 'Cenário' },
            { label: 'Receita', alinhar: 'dir' },
            { label: 'Leads', alinhar: 'dir' },
            { label: 'Vendas', alinhar: 'dir' },
            { label: 'Gap vs meta', alinhar: 'dir' },
          ]}
        >
          {cenarios.map((c) => (
            <Linha key={c.id}>
              <Celula forte>{c.label}</Celula>
              <Celula alinhar="dir" forte>
                {moeda(c.receita)}
              </Celula>
              <Celula alinhar="dir">{num(c.leads)}</Celula>
              <Celula alinhar="dir">{c.vendas}</Celula>
              <Celula alinhar="dir">
                <span className={c.vs_meta >= 0 ? 'text-success font-bold' : 'text-warn font-bold'}>
                  {moedaCurta(c.receita - D.meta.receita_mes)}
                </span>
              </Celula>
            </Linha>
          ))}
        </Tabela>
      </Cartao>
    </div>
  );
}

/* ════════════════════════════════ Testes ════════════════════════════════════ */

const STATUS_TESTE: Record<string, { label: string; tom: Tom }> = {
  rodando: { label: 'Rodando', tom: 'atencao' },
  validado: { label: 'Validado', tom: 'ok' },
  nao_iniciado: { label: 'Não iniciado', tom: 'neutro' },
  invalidado: { label: 'Invalidado', tom: 'ruim' },
};

function Testes() {
  const total = D.plano_testes.reduce((s, t) => s + t.budget, 0);

  return (
    <Cartao
      titulo="Backlog priorizado · hipóteses a validar"
      meta={`${D.plano_testes.length} testes · ${moeda(total)} alocados`}
    >
      <div className="space-y-2.5">
        {D.plano_testes.map((t) => {
          const st = STATUS_TESTE[t.status] ?? STATUS_TESTE.nao_iniciado;
          return (
            <div key={t.id} className="rounded-md border border-[rgb(var(--border))] p-3">
              <div className="flex items-start justify-between gap-3 flex-wrap">
                <div className="flex items-baseline gap-2 flex-wrap">
                  <span className="text-[10px] font-extrabold text-[rgb(var(--muted))]">{t.id}</span>
                  <span className="text-[12px] font-extrabold">{t.nome}</span>
                  <Selo tom="neutro">{t.tipo}</Selo>
                  <Selo tom={t.prioridade === 'alta' ? 'ruim' : t.prioridade === 'media' ? 'atencao' : 'neutro'}>
                    {t.prioridade}
                  </Selo>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-[10px] text-[rgb(var(--muted))]">score</span>
                  <span className="text-base font-extrabold text-navy">{t.score_estrategico}</span>
                  <Selo tom={st.tom}>{st.label}</Selo>
                </div>
              </div>

              <p className="text-[11px] text-[rgb(var(--muted))] mt-1.5 leading-relaxed">{t.hipotese}</p>

              <dl className="grid sm:grid-cols-4 gap-2 mt-2 text-[10px]">
                <div>
                  <dt className="text-[rgb(var(--muted))]">Critério de sucesso</dt>
                  <dd className="font-bold">{t.criterio}</dd>
                </div>
                <div>
                  <dt className="text-[rgb(var(--muted))]">Budget · prazo</dt>
                  <dd className="font-bold">
                    {moeda(t.budget)} · {t.prazo}
                  </dd>
                </div>
                <div>
                  <dt className="text-[rgb(var(--muted))]">Responsável</dt>
                  <dd className="font-bold">{t.responsavel}</dd>
                </div>
                <div>
                  <dt className="text-[rgb(var(--muted))]">Impacto estimado</dt>
                  <dd className="font-bold text-success">{t.impacto_estimado}</dd>
                </div>
              </dl>
            </div>
          );
        })}
      </div>
    </Cartao>
  );
}

/* ═══════════════════════════════ Saturação ══════════════════════════════════ */

function Saturacao() {
  return (
    <Cartao titulo="Saturação preditiva · multi-dimensional" meta="alerta alto primeiro">
      <Tabela
        colunas={[
          { label: 'Dimensão' },
          { label: 'Item' },
          { label: 'Saturação', alinhar: 'dir' },
          { label: 'Tendência 7d' },
          { label: 'Alerta' },
          { label: 'Recomendação' },
        ]}
      >
        {[...D.saturacao]
          .sort((a, b) => b.saturacao_pct - a.saturacao_pct)
          .map((s) => {
            const tom: Tom = s.saturacao_pct >= 80 ? 'ruim' : s.saturacao_pct >= 60 ? 'atencao' : 'ok';
            return (
              <Linha key={s.item}>
                <Celula>{s.dimensao}</Celula>
                <Celula forte className="max-w-[220px] truncate">
                  {s.item}
                </Celula>
                <Celula alinhar="dir">
                  <div className="flex items-center justify-end gap-2">
                    <div className="w-20">
                      <Barra pct={s.saturacao_pct} tom={tom} />
                    </div>
                    <span className="font-extrabold w-8 text-right">{s.saturacao_pct}%</span>
                  </div>
                </Celula>
                <Celula>{s.tendencia === 'subindo' ? '↑ subindo' : '→ estável'}</Celula>
                <Celula>
                  <Selo tom={s.alerta === 'alta' ? 'ruim' : s.alerta === 'media' ? 'atencao' : 'neutro'}>
                    {s.alerta}
                  </Selo>
                </Celula>
                <Celula className="text-[rgb(var(--muted))] max-w-[280px]">{s.recomendacao}</Celula>
              </Linha>
            );
          })}
      </Tabela>
      <p className="text-[10px] text-[rgb(var(--muted))] mt-3 leading-relaxed border-t border-[rgb(var(--border))] pt-2">
        CTR drop em 7 dias é o sinal principal; frequência e tendência entram como confirmação. É a
        mesma lógica do diagnóstico de fadiga, aplicada também a público, campanha e oferta.
      </p>
    </Cartao>
  );
}

/* ════════════════════════════════ Budget ════════════════════════════════════ */

function Budget() {
  const totalAtual = D.alocacao_budget.reduce((s, a) => s + a.atual_valor, 0);
  const totalSugerido = D.alocacao_budget.reduce((s, a) => s + a.sugerido_valor, 0);

  return (
    <Cartao
      titulo="💰 Alocação atual vs sugerida"
      meta={`${moeda(totalAtual)} → ${moeda(totalSugerido)}`}
    >
      <div className="space-y-3">
        {D.alocacao_budget.map((a) => (
          <div key={a.campanha} className="border-b border-[rgb(var(--border))] last:border-0 pb-3 last:pb-0">
            <div className="flex items-baseline justify-between gap-2 flex-wrap">
              <span className="text-[12px] font-extrabold">{a.campanha}</span>
              <span
                className={cn(
                  'text-[11px] font-extrabold tabular-nums',
                  a.delta > 0 ? 'text-success' : a.delta < 0 ? 'text-warn' : 'text-[rgb(var(--muted))]',
                )}
              >
                {a.delta > 0 ? '+' : ''}
                {moeda(a.delta)}
              </span>
            </div>

            <div className="grid grid-cols-2 gap-3 mt-2">
              <div>
                <div className="text-[9px] uppercase tracking-wider text-[rgb(var(--muted))] font-bold mb-1">
                  Atual · {a.atual_pct}% · {moeda(a.atual_valor)}
                </div>
                <Barra pct={a.atual_pct} tom="neutro" />
              </div>
              <div>
                <div className="text-[9px] uppercase tracking-wider text-[rgb(var(--muted))] font-bold mb-1">
                  Sugerido · {a.sugerido_pct}% · {moeda(a.sugerido_valor)}
                </div>
                <Barra pct={a.sugerido_pct} tom={a.delta >= 0 ? 'ok' : 'ruim'} />
              </div>
            </div>

            <p className="text-[10px] text-[rgb(var(--muted))] mt-1.5 leading-relaxed">{a.razao}</p>
          </div>
        ))}
      </div>
    </Cartao>
  );
}

/* ════════════════════════════════ Canais ════════════════════════════════════ */

const STATUS_CANAL: Record<string, { label: string; tom: Tom }> = {
  principal: { label: 'Principal', tom: 'ok' },
  complemento: { label: 'Complemento', tom: 'atencao' },
  nao_testado: { label: 'Não testado', tom: 'neutro' },
  futuro: { label: 'Futuro', tom: 'neutro' },
};

function Canais() {
  return (
    <Cartao titulo="Performance por canal · diversificação" meta="concentração é risco">
      <Tabela
        colunas={[
          { label: 'Canal' },
          { label: 'Invest.', alinhar: 'dir' },
          { label: '% verba', alinhar: 'dir' },
          { label: 'Leads', alinhar: 'dir' },
          { label: 'CPL', alinhar: 'dir' },
          { label: 'ROAS', alinhar: 'dir' },
          { label: 'Status' },
          { label: 'Observação' },
        ]}
      >
        {D.canais.map((c) => {
          const st = STATUS_CANAL[c.status] ?? STATUS_CANAL.nao_testado;
          return (
            <Linha key={c.canal}>
              <Celula forte>{c.canal}</Celula>
              <Celula alinhar="dir">{c.investimento ? moedaCurta(c.investimento) : '—'}</Celula>
              <Celula alinhar="dir">{c.investimento_pct}%</Celula>
              <Celula alinhar="dir">{c.leads ? num(c.leads) : '—'}</Celula>
              <Celula alinhar="dir">{c.cpl ? moeda(c.cpl, 2) : '—'}</Celula>
              <Celula alinhar="dir" forte>
                {c.roas ? c.roas : '—'}
              </Celula>
              <Celula>
                <Selo tom={st.tom}>{st.label}</Selo>
              </Celula>
              <Celula className="text-[rgb(var(--muted))] max-w-[260px]">{c.obs}</Celula>
            </Linha>
          );
        })}
      </Tabela>
    </Cartao>
  );
}

/* ═══════════════════════════════ Orgânico ═══════════════════════════════════ */

function Organico() {
  const k = ORGANICO.kpis;

  return (
    <div className="space-y-4">
      <FaixaKpis cols="grid-cols-2 md:grid-cols-4">
        <Kpi rotulo="Novos seguidores" valor={num(k.novos_seguidores)} nota={`↑ ${k.novos_seguidores_delta}%`} tom="ok" />
        <Kpi rotulo="Conversões atribuídas" valor={k.conversoes_atribuidas} nota={`↑ ${k.conversoes_atribuidas_delta}%`} tom="ok" />
        <Kpi rotulo="Retenção de vídeo" valor={pct(k.retencao_video)} nota={`↑ ${k.retencao_video_delta}%`} tom="ok" />
        <Kpi rotulo="Engajamento médio" valor={pct(k.engajamento_medio)} nota={`↑ ${k.engajamento_medio_delta}%`} tom="ok" />
      </FaixaKpis>

      <div className="grid lg:grid-cols-2 gap-3">
        <Cartao titulo="Perfis" meta={`${ORGANICO.periodo}`}>
          <Tabela
            colunas={[
              { label: 'Perfil' },
              { label: 'Novos', alinhar: 'dir' },
              { label: 'Total', alinhar: 'dir' },
              { label: 'Posts', alinhar: 'dir' },
              { label: 'Alcance', alinhar: 'dir' },
              { label: 'Engaj.', alinhar: 'dir' },
              { label: 'Conv.', alinhar: 'dir' },
            ]}
          >
            {ORGANICO.perfis.map((p) => (
              <Linha key={p.handle}>
                <Celula forte>
                  {p.handle}
                  <div className="text-[9px] text-[rgb(var(--muted))] font-normal">{p.nome}</div>
                </Celula>
                <Celula alinhar="dir">{num(p.novos_seguidores)}</Celula>
                <Celula alinhar="dir">{num(p.total_seguidores)}</Celula>
                <Celula alinhar="dir">{p.posts_periodo}</Celula>
                <Celula alinhar="dir">{num(p.alcance)}</Celula>
                <Celula alinhar="dir" forte>
                  {pct(p.engajamento)}
                </Celula>
                <Celula alinhar="dir">{p.conversoes}</Celula>
              </Linha>
            ))}
          </Tabela>
        </Cartao>

        <Cartao titulo="Temas mais relevantes" meta="engajamento médio">
          <ListaDist
            itens={ORGANICO.temas.map((t) => ({
              rotulo: `${t.rank}. ${t.nome}`,
              valor: pct(t.engaj_medio),
              pct: (t.engaj_medio / 10) * 100,
              nota: `· ${t.posts} posts`,
            }))}
            tom="ok"
          />
        </Cartao>
      </div>

      <Cartao titulo="Top posts do período">
        <Tabela
          colunas={[
            { label: 'Post' },
            { label: 'Perfil' },
            { label: 'Data' },
            { label: 'Alcance', alinhar: 'dir' },
            { label: 'Engaj.', alinhar: 'dir' },
            { label: 'Salvos', alinhar: 'dir' },
          ]}
        >
          {ORGANICO.top_posts.map((p) => (
            <Linha key={p.titulo}>
              <Celula forte>
                {p.thumb_emoji} {p.titulo}
                <Selo tom="neutro" className="ml-1.5">
                  {p.tipo}
                </Selo>
              </Celula>
              <Celula>{p.perfil}</Celula>
              <Celula>{p.data}</Celula>
              <Celula alinhar="dir">{num(p.alcance)}</Celula>
              <Celula alinhar="dir" forte>
                {pct(p.engaj)}
              </Celula>
              <Celula alinhar="dir">{num(p.salvos)}</Celula>
            </Linha>
          ))}
        </Tabela>
      </Cartao>

      <Cartao titulo="Insights estratégicos">
        <div className="space-y-2">
          {ORGANICO.insights.map((i) => (
            <div key={i.texto} className="flex gap-2.5 items-start">
              <Selo tom={i.tipo === 'O que funcionou' ? 'ok' : i.tipo === 'Não funcionou' ? 'ruim' : 'atencao'}>
                {i.tipo}
              </Selo>
              <p className="text-[11px] leading-relaxed flex-1">{i.texto}</p>
            </div>
          ))}
        </div>
      </Cartao>
    </div>
  );
}

/* ═════════════════════════════ Distribuição ═════════════════════════════════ */

function Distribuicao() {
  const k = DISTRIBUICAO.kpis;
  const c = DISTRIBUICAO.comparacao;

  return (
    <div className="space-y-4">
      <FaixaKpis cols="grid-cols-2 md:grid-cols-4">
        <Kpi rotulo="Investido (MTD)" valor={`$ ${num(k.investido)}`} nota={`${DISTRIBUICAO.dias_decorridos}/${DISTRIBUICAO.dias_total} dias`} />
        <Kpi rotulo="Saldo" valor={`$ ${num(k.saldo)}`} nota={`verba $ ${num(DISTRIBUICAO.verba_mes)}/mês`} tom="ok" />
        <Kpi rotulo="Conversões" valor={k.conversoes} nota="atribuídas ao impulsionamento" />
        <Kpi rotulo="Custo por conversão" valor={`$ ${k.custo_por_conversao.toFixed(2)}`} nota="média do período" />
      </FaixaKpis>

      <Cartao titulo="Posts impulsionados no período">
        <Tabela
          colunas={[
            { label: 'Post' },
            { label: 'Perfil' },
            { label: 'Investido', alinhar: 'dir' },
            { label: 'Alcance pago', alinhar: 'dir' },
            { label: 'Conv.', alinhar: 'dir' },
            { label: 'Custo/conv.', alinhar: 'dir' },
            { label: 'ROI' },
          ]}
        >
          {DISTRIBUICAO.posts_boosteados.map((p) => (
            <Linha key={p.titulo}>
              <Celula forte className="max-w-[260px]">
                {p.thumb_emoji} {p.titulo}
              </Celula>
              <Celula>{p.perfil}</Celula>
              <Celula alinhar="dir">$ {p.investido}</Celula>
              <Celula alinhar="dir">{num(p.alcance_pago)}</Celula>
              <Celula alinhar="dir">{p.conversoes}</Celula>
              <Celula alinhar="dir" forte>
                {p.cpc === null ? '—' : `$ ${p.cpc.toFixed(2)}`}
              </Celula>
              <Celula>
                <Selo tom={p.roi_categoria === 'bom' ? 'ok' : p.roi_categoria === 'medio' ? 'atencao' : 'ruim'}>
                  {p.roi_categoria}
                </Selo>
              </Celula>
            </Linha>
          ))}
        </Tabela>
      </Cartao>

      <div className="grid md:grid-cols-2 gap-3">
        <Cartao titulo="Pago vs orgânico · alcance médio por post">
          <ListaDist
            itens={[
              { rotulo: 'Orgânico', valor: num(c.alcance.organico_medio), pct: 54 },
              { rotulo: 'Impulsionado', valor: num(c.alcance.boost_medio), pct: 100 },
            ]}
            tom="ok"
          />
          <p className="text-[10px] text-[rgb(var(--muted))] mt-2">
            Impulsionar multiplica o alcance por <strong>{c.alcance.multiplier}×</strong>.
          </p>
        </Cartao>

        <Cartao titulo="Pago vs orgânico · conversões atribuídas">
          <ListaDist
            itens={[
              { rotulo: 'Orgânico', valor: `${c.conversao.organico_medio}`, pct: 74 },
              { rotulo: 'Impulsionado', valor: `${c.conversao.boost_medio}`, pct: 100 },
            ]}
            tom="ok"
          />
          <p className="text-[10px] text-[rgb(var(--muted))] mt-2">
            Multiplicador de conversão: <strong>{c.conversao.multiplier}×</strong> — bem menor que o de
            alcance, o que indica que o boost compra visibilidade, não intenção.
          </p>
        </Cartao>
      </div>
    </div>
  );
}

/* ════════════════════════════ Reuniões & Decisões ═══════════════════════════ */

function Reunioes() {
  const [aberta, setAberta] = useState(REUNIOES[0].id);
  const r = REUNIOES.find((x) => x.id === aberta) ?? REUNIOES[0];

  return (
    <div className="space-y-4">
      <div className="grid lg:grid-cols-[280px_1fr] gap-4 items-start">
        <div className="space-y-2">
          {REUNIOES.map((m) => (
            <button
              key={m.id}
              type="button"
              onClick={() => setAberta(m.id)}
              className={cn(
                'w-full text-left card transition',
                m.id === aberta ? 'border-navy ring-1 ring-navy/20' : 'hover:border-navy/40',
              )}
            >
              <div className="flex items-baseline gap-2">
                <span className="text-[10px] font-extrabold text-navy">
                  {m.dia}/{m.mes}
                </span>
                <span className="text-[9px] text-[rgb(var(--muted))]">{m.dow}</span>
                <span className="text-[9px] text-[rgb(var(--muted))] ml-auto">{m.duracao}min</span>
              </div>
              <div className="text-[11px] font-extrabold mt-1">
                {m.tipo_icon} {m.tipo_label}
              </div>
              <div className="text-[10px] text-[rgb(var(--muted))] mt-0.5">{m.titulo}</div>
            </button>
          ))}
        </div>

        <div className="space-y-3 min-w-0">
          <Cartao titulo={`${r.tipo_icon} ${r.titulo}`} meta={`${r.dia}/${r.mes} · ${r.duracao}min`}>
            <div className="flex gap-1.5 flex-wrap mb-3">
              {r.clientes.map((c) => (
                <Selo key={c} tom="neutro">
                  {c}
                </Selo>
              ))}
            </div>
            <div className="text-[10px] text-[rgb(var(--muted))]">
              Participantes: {r.participantes.join(' · ')}
            </div>
          </Cartao>

          <Cartao titulo="Decisões">
            <ul className="text-[11px] space-y-1.5">
              {r.decisoes.map((d) => (
                <li key={d} className="flex gap-2">
                  <span className="text-navy font-extrabold shrink-0">✓</span>
                  <span>{d}</span>
                </li>
              ))}
            </ul>
          </Cartao>

          <Cartao titulo="Ações" meta={`${r.acoes.length} itens`}>
            <Tabela colunas={[{ label: 'Ação' }, { label: 'Responsável' }, { label: 'Prazo', alinhar: 'dir' }]}>
              {r.acoes.map((a) => (
                <Linha key={a.acao}>
                  <Celula>{a.acao}</Celula>
                  <Celula forte>{a.resp}</Celula>
                  <Celula alinhar="dir">{a.prazo}</Celula>
                </Linha>
              ))}
            </Tabela>
          </Cartao>

          {r.insights.length > 0 && (
            <Cartao titulo="Insights">
              <ul className="text-[11px] space-y-1.5 text-[rgb(var(--muted))]">
                {r.insights.map((i) => (
                  <li key={i}>· {i}</li>
                ))}
              </ul>
            </Cartao>
          )}
        </div>
      </div>

      <Cartao titulo="Decisões × resultado" meta="registro histórico">
        <Tabela
          colunas={[{ label: 'Data' }, { label: 'Decisão' }, { label: 'Responsável' }, { label: 'Status' }, { label: 'Impacto' }]}
        >
          {D.decisoes_estrategicas.map((d) => (
            <Linha key={d.decisao}>
              <Celula>{d.data}</Celula>
              <Celula forte className="max-w-[260px]">
                {d.decisao}
                <div className="text-[9px] text-[rgb(var(--muted))] font-normal mt-0.5">{d.tomada_em}</div>
              </Celula>
              <Celula className="text-[rgb(var(--muted))]">{d.responsavel}</Celula>
              <Celula>
                <Selo tom={d.status === 'feito' ? 'ok' : 'atencao'}>{d.status}</Selo>
              </Celula>
              <Celula className="max-w-[260px]">{d.impacto}</Celula>
            </Linha>
          ))}
        </Tabela>
      </Cartao>
    </div>
  );
}
