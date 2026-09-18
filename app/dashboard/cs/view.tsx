'use client';

/**
 * Central CS · portfolio, riscos, drill-down, pendências e calendário.
 *
 * A carteira é sempre ordenada por urgência (risco primeiro) — é a decisão de
 * UX que torna a tela útil: quem abre o CS de manhã precisa ver quem pode
 * cancelar, não a lista alfabética.
 */

import { useState } from 'react';
import { DADOS_CS } from '@/data/mock-cs';
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
  Selo,
  Tabela,
  moeda,
  moedaCurta,
  num,
  type Tom,
} from '@/components/mock/ui';
import { cn } from '@/lib/utils';

const D = DADOS_CS;

type Cliente = (typeof D.clientes)[number];

const ORDEM_STATUS: Record<string, number> = { risco: 0, atencao: 1, saudavel: 2 };
const CARTEIRA = [...D.clientes].sort(
  (a, b) => (ORDEM_STATUS[a.status] ?? 9) - (ORDEM_STATUS[b.status] ?? 9) || b.risk_score - a.risk_score,
);

const TOM_STATUS: Record<string, Tom> = { risco: 'ruim', atencao: 'atencao', saudavel: 'ok' };

const ABAS: readonly Aba[] = [
  { id: 'portfolio', label: '📊 Portfolio', contador: D.kpis_carteira.total_clientes },
  { id: 'riscos', label: '⚠️ Sinais de Risco', contador: D.alertas_globais.length },
  { id: 'cliente', label: '🔍 Drill-down por Cliente' },
  { id: 'pendencias', label: '📌 Pendências Cruzadas', contador: D.kpis_carteira.pendencias_abertas },
  { id: 'calendario', label: '📅 Calendário', contador: D.calendario_proximos_15d.length },
] as const;

export function CsView({ tab, clienteInicial }: { tab?: string; clienteInicial?: string }) {
  const atual = resolverAba(ABAS, tab);
  const [selecionado, setSelecionado] = useState(
    CARTEIRA.some((c) => c.id === clienteInicial) ? (clienteInicial as string) : CARTEIRA[0].id,
  );

  return (
    <div className="space-y-5">
      <Cabecalho
        titulo="Central CS · Gestão de Carteira"
        subtitulo={`${D.cs_responsavel} · ${D.kpis_carteira.total_clientes} clientes · referência ${D.data_referencia}`}
      />

      <AvisoMock fase="CS">
        Carteira fictícia. Na versão real, o risk score cruza métrica de mídia, NPS, cadência de
        touchpoint e pendências vencidas — os quatro sinais já estão modelados aqui.
      </AvisoMock>

      <Abas abas={ABAS} atual={atual} />

      {atual === 'portfolio' && <Portfolio onAbrir={setSelecionado} />}
      {atual === 'riscos' && <Riscos />}
      {atual === 'cliente' && (
        <Drilldown selecionado={selecionado} onSelecionar={setSelecionado} />
      )}
      {atual === 'pendencias' && <Pendencias />}
      {atual === 'calendario' && <Calendario />}
    </div>
  );
}

/* ═══════════════════════════════ Portfolio ══════════════════════════════════ */

function Portfolio({ onAbrir }: { onAbrir: (id: string) => void }) {
  const k = D.kpis_carteira;

  return (
    <div className="space-y-4">
      <FaixaKpis cols="grid-cols-2 md:grid-cols-4 xl:grid-cols-7">
        <Kpi rotulo="Clientes" valor={k.total_clientes} nota="na carteira" destaque />
        <Kpi rotulo="Saudáveis" valor={k.saudaveis} nota="risco baixo" tom="ok" />
        <Kpi rotulo="Atenção" valor={k.atencao} nota="monitorar" tom="atencao" />
        <Kpi rotulo="Em risco" valor={k.em_risco} nota="ação hoje" tom="ruim" />
        <Kpi rotulo="Receita/mês" valor={moedaCurta(k.receita_carteira_mes)} nota="carteira inteira" />
        <Kpi rotulo="NPS médio" valor={k.nps_medio} nota="últimos 90d" />
        <Kpi rotulo="Renovações 30d" valor={k.renovacoes_proximas_30d} nota="contratos" tom="atencao" />
      </FaixaKpis>

      <Cartao titulo="Carteira · ordenada por urgência" meta="risco primeiro">
        <div className="grid md:grid-cols-2 xl:grid-cols-3 gap-3">
          {CARTEIRA.map((c) => (
            <button
              key={c.id}
              type="button"
              onClick={() => onAbrir(c.id)}
              className={cn(
                'text-left rounded-lg border p-3 transition hover:border-navy',
                c.status === 'risco'
                  ? 'border-warn/40 bg-warn/5'
                  : c.status === 'atencao'
                    ? 'border-attention/40'
                    : 'border-[rgb(var(--border))]',
              )}
            >
              <div className="flex items-start justify-between gap-2">
                <div>
                  <div className="text-[12px] font-extrabold">
                    {c.saude_emoji} {c.nome}
                  </div>
                  <div className="text-[10px] text-[rgb(var(--muted))]">{c.tipo}</div>
                </div>
                <div className="text-right shrink-0">
                  <div
                    className={cn(
                      'text-lg font-extrabold tracking-tight',
                      c.risk_score >= 60 ? 'text-warn' : c.risk_score >= 35 ? 'text-attention' : 'text-success',
                    )}
                  >
                    {c.risk_score}
                  </div>
                  <div className="text-[9px] text-[rgb(var(--muted))]">risco</div>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-2 mt-2.5 text-center">
                <Mini rotulo="NPS" valor={`${c.nps}`} nota={`era ${c.nps_anterior}`} />
                <Mini
                  rotulo="Métrica MoM"
                  valor={`${c.metrica_mom > 0 ? '+' : ''}${c.metrica_mom}%`}
                  nota={c.metrica_mom < 0 ? 'caindo' : 'subindo'}
                />
                <Mini rotulo="Renovação" valor={`${c.renovacao_em}d`} nota={moedaCurta(c.ticket_mensal)} />
              </div>

              <p className="text-[10px] mt-2.5 leading-relaxed">{c.proxima_acao}</p>

              <div className="text-[9px] text-[rgb(var(--muted))] mt-2 flex gap-2 flex-wrap">
                <span>Última reunião {c.ultima_reuniao}</span>
                <span>·</span>
                <span>{c.dias_sem_touchpoint}d sem contato</span>
              </div>
            </button>
          ))}
        </div>
      </Cartao>
    </div>
  );
}

function Mini({ rotulo, valor, nota }: { rotulo: string; valor: string; nota: string }) {
  return (
    <div>
      <div className="text-[9px] uppercase tracking-wider text-[rgb(var(--muted))] font-bold">{rotulo}</div>
      <div className="text-[13px] font-extrabold">{valor}</div>
      <div className="text-[9px] text-[rgb(var(--muted))]">{nota}</div>
    </div>
  );
}

/* ═════════════════════════════════ Riscos ═══════════════════════════════════ */

function Riscos() {
  return (
    <Cartao
      titulo="Alertas detectados automaticamente"
      meta={`${D.alertas_globais.length} sinais · ação proativa`}
    >
      <div>
        {D.alertas_globais.map((a) => (
          <Alerta
            key={a.padrao}
            origem={a.cliente.split(' ')[0]}
            prioridade={a.prioridade === 'alta' ? 'alta' : a.prioridade === 'media' ? 'media' : 'baixa'}
          >
            <strong>{a.cliente}</strong> — {a.padrao}
            <div className="text-[rgb(var(--muted))] mt-0.5">→ {a.sugestao}</div>
            <div className="text-[9px] text-[rgb(var(--muted))] mt-0.5">fonte: {a.fonte}</div>
          </Alerta>
        ))}
      </div>
    </Cartao>
  );
}

/* ═══════════════════════════════ Drill-down ═════════════════════════════════ */

function Drilldown({
  selecionado,
  onSelecionar,
}: {
  selecionado: string;
  onSelecionar: (id: string) => void;
}) {
  const c: Cliente = CARTEIRA.find((x) => x.id === selecionado) ?? CARTEIRA[0];

  return (
    <div className="space-y-4">
      <div className="flex gap-1.5 flex-wrap">
        {CARTEIRA.map((x) => (
          <button
            key={x.id}
            type="button"
            onClick={() => onSelecionar(x.id)}
            className={cn(
              'px-2.5 py-1 rounded-md text-[10px] font-extrabold border transition',
              x.id === selecionado
                ? 'bg-navy text-white border-navy'
                : 'border-[rgb(var(--border))] text-[rgb(var(--muted))] hover:border-navy/40',
            )}
          >
            {x.saude_emoji} {x.nome}
          </button>
        ))}
      </div>

      <FaixaKpis cols="grid-cols-2 md:grid-cols-3 xl:grid-cols-6">
        <Kpi rotulo="Risk score" valor={c.risk_score} nota={c.status} tom={TOM_STATUS[c.status]} destaque />
        <Kpi rotulo="NPS" valor={c.nps} nota={`era ${c.nps_anterior}`} tom={c.nps < c.nps_anterior ? 'ruim' : 'ok'} />
        <Kpi rotulo="Campanhas ativas" valor={c.indicadores.campanhas_ativas} nota="no mês" />
        <Kpi rotulo="Leads/mês" valor={num(c.indicadores.leads_mes)} nota={`${c.metrica_mom}% MoM`} tom={c.metrica_mom < 0 ? 'ruim' : 'ok'} />
        <Kpi rotulo="Vendas/mês" valor={c.indicadores.vendas_mes} nota={moedaCurta(c.indicadores.receita_mes)} />
        <Kpi rotulo="Renovação" valor={`${c.renovacao_em}d`} nota={`${moeda(c.ticket_mensal)}/mês`} tom="atencao" />
      </FaixaKpis>

      <div className="rounded-lg border border-warn/30 bg-warn/5 p-3">
        <div className="text-[9px] uppercase tracking-wider font-extrabold text-warn">Próxima ação</div>
        <p className="text-[12px] font-bold mt-1">{c.proxima_acao}</p>
      </div>

      <div className="grid lg:grid-cols-2 gap-3">
        <Cartao titulo="Sinais detectados">
          <div className="space-y-2">
            {c.alertas.map((a) => (
              <div key={a.msg} className="flex gap-2 items-start text-[11px]">
                <Selo tom="atencao">{a.tipo}</Selo>
                <span className="flex-1">{a.msg}</span>
              </div>
            ))}
          </div>
        </Cartao>

        <Cartao titulo="Touchpoints recentes" meta={`${c.dias_sem_touchpoint}d desde o último`}>
          <Tabela colunas={[{ label: 'Data' }, { label: 'Canal' }, { label: 'Assunto' }, { label: 'Sentimento' }]}>
            {c.touchpoints_recentes.map((t) => (
              <Linha key={t.data + t.tipo}>
                <Celula>{t.data}</Celula>
                <Celula forte>{t.canal}</Celula>
                <Celula className="text-[rgb(var(--muted))]">{t.tipo}</Celula>
                <Celula>
                  <Selo
                    tom={t.sentimento === 'negativo' ? 'ruim' : t.sentimento === 'positivo' ? 'ok' : 'neutro'}
                  >
                    {t.sentimento}
                  </Selo>
                </Celula>
              </Linha>
            ))}
          </Tabela>
        </Cartao>

        <Cartao titulo="Pendências nossas" meta={`${c.pendencias.nossas.length} itens`}>
          <Tabela colunas={[{ label: 'Item' }, { label: 'Responsável' }, { label: 'Prazo', alinhar: 'dir' }]}>
            {c.pendencias.nossas.map((p) => (
              <Linha key={p.item}>
                <Celula forte>{p.item}</Celula>
                <Celula>{p.responsavel}</Celula>
                <Celula alinhar="dir">
                  <span className={p.prazo.toLowerCase().includes('vencid') ? 'text-warn font-bold' : ''}>
                    {p.prazo}
                  </span>
                </Celula>
              </Linha>
            ))}
          </Tabela>
        </Cartao>

        <Cartao titulo="Pendências do cliente" meta={`${c.pendencias.deles.length} itens`}>
          <Tabela colunas={[{ label: 'Item' }, { label: 'Responsável' }, { label: 'Prazo', alinhar: 'dir' }]}>
            {c.pendencias.deles.map((p) => (
              <Linha key={p.item}>
                <Celula forte>{p.item}</Celula>
                <Celula>{p.responsavel}</Celula>
                <Celula alinhar="dir">
                  <span className={p.prazo.toLowerCase().includes('pendente') ? 'text-attention font-bold' : ''}>
                    {p.prazo}
                  </span>
                </Celula>
              </Linha>
            ))}
          </Tabela>
        </Cartao>
      </div>

      <Cartao titulo="Agenda do cliente">
        <div className="grid sm:grid-cols-2 gap-3 text-[11px]">
          <div>
            <div className="kpi-label">Última reunião</div>
            <div className="font-bold mt-0.5">{c.ultima_reuniao}</div>
          </div>
          <div>
            <div className="kpi-label">Próxima reunião</div>
            <div className="font-bold mt-0.5">{c.proxima_reuniao}</div>
          </div>
        </div>
        {c.ata_pendente_followup && (
          <p className="text-[10px] text-attention font-bold mt-2">
            ⚠ Ata da última reunião ainda tem follow-up em aberto.
          </p>
        )}
      </Cartao>
    </div>
  );
}

/* ═══════════════════════════════ Pendências ═════════════════════════════════ */

function Pendencias() {
  const nossas = CARTEIRA.flatMap((c) =>
    c.pendencias.nossas.map((p) => ({ ...p, cliente: c.nome, lado: 'nossa' as const })),
  );
  const deles = CARTEIRA.flatMap((c) =>
    c.pendencias.deles.map((p) => ({ ...p, cliente: c.nome, lado: 'deles' as const })),
  );

  const vencidas = nossas.filter((p) => p.prazo.toLowerCase().includes('vencid'));
  const emDia = nossas.filter((p) => !p.prazo.toLowerCase().includes('vencid'));

  return (
    <Cartao
      titulo="Pendências de todos os clientes"
      meta={`${nossas.length + deles.length} abertas · ${vencidas.length} vencidas`}
    >
      <Kanban>
        <ColunaKanban titulo="Vencidas · nossas" total={vencidas.length}>
          {vencidas.map((p) => (
            <CardPendencia key={p.cliente + p.item} p={p} tom="ruim" />
          ))}
        </ColunaKanban>

        <ColunaKanban titulo="Em dia · nossas" total={emDia.length}>
          {emDia.map((p) => (
            <CardPendencia key={p.cliente + p.item} p={p} tom="atencao" />
          ))}
        </ColunaKanban>

        <ColunaKanban titulo="Com o cliente" total={deles.length}>
          {deles.map((p) => (
            <CardPendencia key={p.cliente + p.item} p={p} tom="neutro" />
          ))}
        </ColunaKanban>
      </Kanban>
    </Cartao>
  );
}

function CardPendencia({
  p,
  tom,
}: {
  p: { item: string; prazo: string; responsavel: string; cliente: string };
  tom: Tom;
}) {
  return (
    <div
      className={cn(
        'rounded-md border p-2.5 bg-[rgb(var(--bg))]',
        tom === 'ruim' ? 'border-warn/40' : tom === 'atencao' ? 'border-attention/40' : 'border-[rgb(var(--border))]',
      )}
    >
      <div className="text-[9px] uppercase tracking-wider font-extrabold text-[rgb(var(--muted))]">
        {p.cliente}
      </div>
      <div className="text-[11px] font-bold mt-0.5">{p.item}</div>
      <div className="flex items-center justify-between mt-1.5">
        <span className="text-[9px] text-[rgb(var(--muted))]">{p.responsavel}</span>
        <Selo tom={tom}>{p.prazo}</Selo>
      </div>
    </div>
  );
}

/* ═══════════════════════════════ Calendário ═════════════════════════════════ */

const TOM_EVENTO: Record<string, Tom> = {
  reuniao: 'neutro',
  deadline: 'atencao',
  renovacao: 'ruim',
};

function Calendario() {
  const porData = D.calendario_proximos_15d.reduce<Record<string, typeof D.calendario_proximos_15d>>(
    (acc, e) => {
      (acc[e.data] ??= []).push(e);
      return acc;
    },
    {},
  );

  return (
    <Cartao titulo="Próximos 15 dias" meta="reuniões · deadlines · renovações">
      <div className="space-y-3">
        {Object.entries(porData).map(([data, eventos]) => (
          <div key={data} className="flex gap-3 items-start">
            <div className="w-24 shrink-0 pt-0.5">
              <div className="text-[11px] font-extrabold">{data.slice(0, 5)}</div>
              <div className="text-[9px] text-[rgb(var(--muted))]">{data.slice(6)}</div>
            </div>
            <div className="flex-1 space-y-1.5">
              {eventos.map((e) => (
                <div
                  key={e.cliente + e.tipo + (e.horario ?? '')}
                  className="flex items-center gap-2 text-[11px] border-b border-[rgb(var(--border))] last:border-0 pb-1.5 last:pb-0"
                >
                  <Selo tom={TOM_EVENTO[e.tipo] ?? 'neutro'}>{e.tipo}</Selo>
                  <span className="font-bold">{e.cliente}</span>
                  {e.horario && <span className="text-[rgb(var(--muted))]">{e.horario}</span>}
                  <span
                    className={cn(
                      'ml-auto text-[10px]',
                      e.status?.includes('CRÍTICA') ? 'text-warn font-extrabold' : 'text-[rgb(var(--muted))]',
                    )}
                  >
                    {e.status}
                  </span>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>

      <div className="mt-4 pt-3 border-t border-[rgb(var(--border))]">
        <div className="kpi-label mb-2">Capacidade da CS</div>
        <div className="flex items-center gap-3">
          <div className="flex-1">
            <Barra pct={(D.kpis_carteira.total_clientes / 15) * 100} tom="ok" />
          </div>
          <span className="text-[11px] font-bold tabular-nums">
            {D.kpis_carteira.total_clientes}/15 clientes
          </span>
        </div>
        <p className="text-[10px] text-[rgb(var(--muted))] mt-1.5">
          A meta da fase é 1 CS cobrindo 12–15 clientes — hoje são {D.kpis_carteira.total_clientes}. O
          que fecha essa conta é automação de detecção, não mais horas de reunião.
        </p>
      </div>
    </Cartao>
  );
}
