'use client';

/**
 * Portal Cliente · InfoNews, mídia, comercial, estratégia e próximos passos.
 *
 * Tudo aqui é leitura. O cliente não edita nada — as ações dele viram
 * pendências na aba Próximos Passos, que é o único lugar onde ele descobre o
 * que está travado esperando por ele.
 */

import { DADOS_PORTAL, PROXIMOS_PASSOS, ORCAMENTO_CLIENTE } from '@/data/mock-portal';
import { Abas, resolverAba, type Aba } from '@/components/mock/abas';
import {
  AvisoMock,
  Barra,
  Cabecalho,
  Cartao,
  Celula,
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

const D = DADOS_PORTAL;

const ABAS: readonly Aba[] = [
  { id: 'infonews', label: 'InfoNews' },
  { id: 'midia', label: 'Inteligência de Dados' },
  { id: 'comercial', label: 'Comercial' },
  { id: 'estrategia', label: 'Tráfego Estratégico' },
  { id: 'proximos', label: 'Próximos Passos', contador: PROXIMOS_PASSOS.pendencias_cliente.length },
] as const;

const TOM_SAUDE: Record<string, Tom> = { verde: 'ok', amarelo: 'atencao', vermelho: 'ruim' };

export function PortalView({ tab }: { tab?: string }) {
  const atual = resolverAba(ABAS, tab);

  return (
    <div className="space-y-5">
      <Cabecalho titulo={`Portal · ${D.cliente}`} subtitulo={D.semana} />

      <AvisoMock fase="Portal Cliente">
        Visão do cliente, com dados fictícios. Na versão real é a mesma base do dashboard interno,
        filtrada pelo RLS do `client_id` — o cliente nunca enxerga outro cliente.
      </AvisoMock>

      <Abas abas={ABAS} atual={atual} />

      {atual === 'infonews' && <InfoNews />}
      {atual === 'midia' && <Midia />}
      {atual === 'comercial' && <Comercial />}
      {atual === 'estrategia' && <Estrategia />}
      {atual === 'proximos' && <Proximos />}
    </div>
  );
}

/* ═══════════════════════════════ InfoNews ═══════════════════════════════════ */

function InfoNews() {
  const f = D.funil;
  const m = D.meta;
  const o = ORCAMENTO_CLIENTE;
  const saldo = o.verba_mensal - o.gasto_mtd;
  const pendenciasUrgentes = PROXIMOS_PASSOS.pendencias_cliente.filter((p) => p.urgencia === 'alta');

  return (
    <div className="space-y-4">
      <Cartao>
        <div className="text-[9px] uppercase tracking-wider font-extrabold text-navy">Visão da semana</div>
        <p className="text-[13px] leading-relaxed mt-1.5">{D.resumo_semana}</p>
      </Cartao>

      <div className="grid lg:grid-cols-2 gap-3">
        <Cartao titulo="🎯 Meta de receita do mês" meta={`${m.dias_decorridos}/${m.dias_total} dias`}>
          <div className="flex items-baseline gap-3">
            <div className="text-3xl font-extrabold tracking-tight">{moedaCurta(m.receita_realizada)}</div>
            <div className="text-[11px] text-[rgb(var(--muted))]">de {moedaCurta(m.receita_alvo_mes)}</div>
            <Selo tom={m.ritmo_status === 'ajustando' ? 'atencao' : 'ok'} className="ml-auto">
              {m.atingimento_pct}% atingido
            </Selo>
          </div>
          <div className="mt-2">
            <Barra pct={m.atingimento_pct} tom={m.atingimento_pct >= 50 ? 'ok' : 'atencao'} />
          </div>
          <p className="text-[10px] text-[rgb(var(--muted))] mt-2 leading-relaxed">{m.narrativa_meta}</p>
        </Cartao>

        <Cartao titulo="Sua verba do mês" meta={`${o.dias_decorridos}/${o.dias_mes} dias · ${o.tipo}`}>
          <div className="grid grid-cols-3 gap-3">
            <div>
              <div className="kpi-label">Verba</div>
              <div className="text-lg font-extrabold tracking-tight">{moedaCurta(o.verba_mensal)}</div>
            </div>
            <div>
              <div className="kpi-label">Gasto</div>
              <div className="text-lg font-extrabold tracking-tight">{moedaCurta(o.gasto_mtd)}</div>
            </div>
            <div>
              <div className="kpi-label">Saldo</div>
              <div className="text-lg font-extrabold tracking-tight text-success">{moedaCurta(saldo)}</div>
            </div>
          </div>
          <div className="mt-2">
            <Barra pct={(o.gasto_mtd / o.verba_mensal) * 100} tom="neutro" />
          </div>
        </Cartao>
      </div>

      {pendenciasUrgentes.length > 0 && (
        <div className="rounded-lg border border-warn/30 bg-warn/5 p-3">
          <div className="text-[11px] font-extrabold text-warn">⚠ Você tem pendências urgentes</div>
          <ul className="text-[11px] mt-1.5 space-y-0.5">
            {pendenciasUrgentes.map((p) => (
              <li key={p.item}>· {p.item} — prazo {p.prazo}</li>
            ))}
          </ul>
        </div>
      )}

      <Cartao titulo="Funil da semana" meta="vs semana anterior">
        <FaixaKpis cols="grid-cols-2 md:grid-cols-4 xl:grid-cols-7">
          <Kpi rotulo="Investimento" valor={moedaCurta(f.investimento)} nota={`${f.deltas.investimento}%`} />
          <Kpi rotulo="Leads" valor={num(f.leads)} nota={`${f.deltas.leads}%`} tom={f.deltas.leads < 0 ? 'ruim' : 'ok'} />
          <Kpi rotulo="MQLs" valor={num(f.mqls)} nota={`+${f.deltas.mqls}%`} tom="ok" />
          <Kpi rotulo="Agendamentos" valor={num(f.agendamentos)} nota={`+${f.deltas.agendamentos}%`} tom="ok" />
          <Kpi rotulo="Vendas" valor={f.vendas} nota={`+${f.deltas.vendas}%`} tom="ok" destaque />
          <Kpi rotulo="Receita" valor={moedaCurta(f.receita)} nota={`+${f.deltas.receita}%`} tom="ok" />
          <Kpi rotulo="ROAS" valor={`${f.roas}x`} nota="na semana" tom="ok" />
        </FaixaKpis>
      </Cartao>

      <Cartao titulo="Recortes temporais" meta={`atualizado ${D.recortes_temporais.data_atualizacao}`}>
        <div className="grid lg:grid-cols-3 gap-3">
          {[D.recortes_temporais.ontem, D.recortes_temporais.ultimos_7d, D.recortes_temporais.mes_ate_ontem].map(
            (r) => (
              <div key={r.label} className="rounded-lg border border-[rgb(var(--border))] p-3">
                <div className="text-[11px] font-extrabold">{r.label}</div>
                <div className="text-[9px] text-[rgb(var(--muted))]">{r.periodo_anterior}</div>

                <dl className="grid grid-cols-2 gap-2 mt-2.5 text-[10px]">
                  <Item rotulo="Investimento" valor={moeda(r.investimento)} d={r.deltas.investimento} />
                  <Item rotulo="Leads" valor={num(r.leads)} d={r.deltas.leads} />
                  <Item rotulo="MQLs" valor={num(r.mqls)} d={r.deltas.mqls} />
                  <Item rotulo="CPL" valor={moeda(r.cpl, 2)} d={r.deltas.cpl} inverso />
                  <Item rotulo="Agendamentos" valor={num(r.agendamentos)} d={r.deltas.agendamentos} />
                  <Item rotulo="Vendas" valor={num(r.vendas)} d={r.deltas.vendas} />
                </dl>

                <p className="text-[10px] text-[rgb(var(--muted))] mt-2 leading-relaxed">{r.destaque}</p>
                {r.atencao && <p className="text-[10px] text-attention font-bold mt-1">⚠ {r.atencao}</p>}
              </div>
            ),
          )}
        </div>
      </Cartao>

      <div className="grid lg:grid-cols-2 gap-3">
        <Cartao titulo="Destaques da semana">
          <dl className="space-y-2 text-[11px]">
            <Destaque rotulo="Criativo destaque" texto={D.aquisicao.criativo_destaque} />
            <Destaque rotulo="Novo em teste" texto={D.aquisicao.novo_em_teste} />
            <Destaque rotulo="Público top" texto={D.aquisicao.publico_top} />
            <Destaque rotulo="Atenção" texto={D.aquisicao.saturacao_alerta} tom="atencao" />
            <Destaque rotulo="Comercial" texto={D.conversao.destaque} />
          </dl>
        </Cartao>

        <Cartao titulo="Saúde geral por área">
          <div className="space-y-2">
            {D.indicadores_saude.map((i) => (
              <div key={i.area} className="flex items-start gap-2.5">
                <Selo tom={TOM_SAUDE[i.status] ?? 'neutro'}>{i.status}</Selo>
                <div className="flex-1">
                  <div className="text-[11px] font-bold">{i.area}</div>
                  <div className="text-[10px] text-[rgb(var(--muted))]">{i.nota}</div>
                </div>
              </div>
            ))}
          </div>
        </Cartao>
      </div>
    </div>
  );
}

function Item({
  rotulo,
  valor,
  d,
  inverso,
}: {
  rotulo: string;
  valor: string;
  d: number;
  inverso?: boolean;
}) {
  const bom = inverso ? d < 0 : d > 0;
  return (
    <div>
      <dt className="text-[rgb(var(--muted))]">{rotulo}</dt>
      <dd className="font-extrabold">
        {valor}{' '}
        {d !== 0 && (
          <span className={cn('text-[9px]', bom ? 'text-success' : 'text-warn')}>
            {d > 0 ? '↑' : '↓'}
            {Math.abs(d)}%
          </span>
        )}
      </dd>
    </div>
  );
}

function Destaque({ rotulo, texto, tom = 'neutro' }: { rotulo: string; texto: string; tom?: Tom }) {
  return (
    <div>
      <dt
        className={cn(
          'text-[9px] uppercase tracking-wider font-extrabold',
          tom === 'atencao' ? 'text-attention' : 'text-[rgb(var(--muted))]',
        )}
      >
        {rotulo}
      </dt>
      <dd className="leading-relaxed">{texto}</dd>
    </div>
  );
}

/* ═════════════════════════════════ Mídia ════════════════════════════════════ */

function Midia() {
  const m = D.midia;
  const k = m.kpis_ytd;

  return (
    <div className="space-y-4">
      <Cartao>
        <h2 className="text-base font-extrabold tracking-tight">Inteligência de Dados · YTD 2026</h2>
        <p className="text-[12px] text-[rgb(var(--muted))] mt-1">
          {moedaCurta(k.receita_proj)} de receita projetada com {moeda(k.investimento)} investidos · ROAS{' '}
          {k.roas}x
        </p>
      </Cartao>

      <FaixaKpis cols="grid-cols-2 md:grid-cols-3 xl:grid-cols-6">
        <Kpi rotulo="Investimento" valor={moedaCurta(k.investimento)} nota="YTD" />
        <Kpi rotulo="Leads" valor={num(k.leads)} nota={`CPL ${moeda(k.cpl_medio, 2)}`} />
        <Kpi rotulo="MQLs" valor={num(k.mqls)} nota={`CPMQL ${moeda(k.cpmql_medio, 2)}`} />
        <Kpi rotulo="Agendamentos" valor={num(k.agendamentos)} nota={pct((k.agendamentos / k.mqls) * 100)} />
        <Kpi rotulo="Vendas (proj.)" valor={num(k.vendas_proj)} nota="projeção por benchmark" tom="atencao" />
        <Kpi rotulo="Receita (proj.)" valor={moedaCurta(k.receita_proj)} nota={`ROAS ${k.roas}x`} tom="ok" destaque />
      </FaixaKpis>

      <Cartao titulo="Funil completo" meta="taxas e custo por etapa">
        <div className="space-y-2.5">
          {m.funil_cone.map((f) => (
            <div key={f.label}>
              <div className="flex items-baseline justify-between text-[11px] mb-1">
                <span className="font-bold">{f.label}</span>
                <span className="tabular-nums">
                  <strong>{f.value}</strong>
                  {'taxa' in f && f.taxa && <span className="text-[rgb(var(--muted))] ml-1.5">{f.taxa}</span>}
                </span>
              </div>
              <Barra pct={f.pct} tom={f.cor === 'success' ? 'ok' : 'neutro'} />
            </div>
          ))}
        </div>
      </Cartao>

      <Cartao titulo="Top 5 criativos do período">
        <Tabela
          colunas={[
            { label: '#' },
            { label: 'Conceito' },
            { label: 'Leads', alinhar: 'dir' },
            { label: 'CPL', alinhar: 'dir' },
            { label: 'Status' },
            { label: 'Leitura' },
          ]}
        >
          {m.criativos_destaque.map((c) => (
            <Linha key={c.posicao}>
              <Celula forte>{c.posicao}</Celula>
              <Celula forte className="max-w-[240px]">
                {c.thumb_emoji} {c.conceito}
                {c.link_instagram && (
                  <a
                    href={c.link_instagram}
                    target="_blank"
                    rel="noreferrer"
                    className="block text-[9px] text-navy font-normal hover:underline"
                  >
                    ver prévia →
                  </a>
                )}
              </Celula>
              <Celula alinhar="dir">{num(c.leads)}</Celula>
              <Celula alinhar="dir" forte>
                {moeda(c.cpl, 2)}
              </Celula>
              <Celula>
                <Selo tom={c.status === 'ativo' ? 'ok' : 'neutro'}>{c.status}</Selo>
              </Celula>
              <Celula className="text-[rgb(var(--muted))] max-w-[220px]">{c.performance}</Celula>
            </Linha>
          ))}
        </Tabela>
      </Cartao>

      <div className="grid lg:grid-cols-2 gap-3">
        <Cartao titulo="🎯 Públicos · top performance">
          <Tabela
            colunas={[
              { label: 'Público' },
              { label: 'Qualif.', alinhar: 'dir' },
              { label: 'CPL', alinhar: 'dir' },
              { label: 'Leitura' },
            ]}
          >
            {m.publicos.map((p) => (
              <Linha key={p.nome}>
                <Celula forte>{p.nome}</Celula>
                <Celula alinhar="dir">{pct(p.qual)}</Celula>
                <Celula alinhar="dir" forte>
                  {moeda(p.cpl, 2)}
                </Celula>
                <Celula className="text-[rgb(var(--muted))]">{p.performance}</Celula>
              </Linha>
            ))}
          </Tabela>
        </Cartao>

        <Cartao titulo="📡 Distribuição por canal">
          <ListaDist
            itens={m.canal_dist.map((c) => ({
              rotulo: c.canal,
              valor: pct(c.pct, 0),
              pct: c.pct,
              nota: '',
            }))}
          />
          <div className="mt-3 space-y-1 text-[10px] text-[rgb(var(--muted))]">
            {m.canal_dist.map((c) => (
              <div key={c.canal}>
                <strong>{c.canal}:</strong> {c.obs}
              </div>
            ))}
          </div>
        </Cartao>
      </div>
    </div>
  );
}

/* ═══════════════════════════════ Comercial ══════════════════════════════════ */

function Comercial() {
  const c = D.comercial;
  const k = c.kpis_periodo;

  return (
    <div className="space-y-4">
      <Cartao>
        <h2 className="text-base font-extrabold tracking-tight">Comercial · últimos 3 meses</h2>
        <p className="text-[12px] text-[rgb(var(--muted))] mt-1">
          {k.vendas} vendas · ticket médio {moeda(k.ticket_medio)} · close rate subiu 6 pontos no período
        </p>
      </Cartao>

      <FaixaKpis cols="grid-cols-2 md:grid-cols-4 xl:grid-cols-8">
        <Kpi rotulo="Calls agendadas" valor={num(k.calls_agendadas)} />
        <Kpi rotulo="Calls realizadas" valor={num(k.calls_realizadas)} />
        <Kpi rotulo="Show rate" valor={pct(k.show_rate)} tom="ok" />
        <Kpi rotulo="Close rate" valor={pct(k.close_rate)} tom="ok" />
        <Kpi rotulo="Vendas" valor={k.vendas} tom="ok" destaque />
        <Kpi rotulo="Receita" valor={moedaCurta(k.receita)} tom="ok" />
        <Kpi rotulo="Ticket médio" valor={moedaCurta(k.ticket_medio)} />
        <Kpi rotulo="Ciclo médio" valor={`${k.ciclo_medio_dias}d`} />
      </FaixaKpis>

      <div className="grid lg:grid-cols-2 gap-3">
        <Cartao titulo="Funil comercial · do lead à venda">
          <div className="space-y-2.5">
            {c.funil_comercial.map((f) => (
              <div key={f.label}>
                <div className="flex items-baseline justify-between text-[11px] mb-1">
                  <span className="font-bold">{f.label}</span>
                  <strong className="tabular-nums">{f.value}</strong>
                </div>
                <Barra pct={f.pct || 6} tom="neutro" />
              </div>
            ))}
          </div>
        </Cartao>

        <Cartao titulo="Objeções mais comuns + tratamento que funciona">
          <div className="space-y-2.5">
            {c.objecoes_dist.map((o) => (
              <div key={o.tipo}>
                <div className="flex items-baseline justify-between text-[11px] mb-1">
                  <span className="font-bold">{o.tipo}</span>
                  <span className="tabular-nums text-[rgb(var(--muted))]">{o.pct}%</span>
                </div>
                <Barra pct={o.pct} tom={o.cor === 'warn' ? 'ruim' : o.cor === 'attention' ? 'atencao' : 'neutro'} />
                {o.tratamento && (
                  <p className="text-[10px] text-[rgb(var(--muted))] mt-1 leading-relaxed">{o.tratamento}</p>
                )}
              </div>
            ))}
          </div>
        </Cartao>
      </div>

      <div className="grid lg:grid-cols-2 gap-3">
        <Cartao titulo="Tendência mensal" meta="close rate e vendas">
          <Tabela colunas={[{ label: 'Mês' }, { label: 'Close rate', alinhar: 'dir' }, { label: 'Vendas', alinhar: 'dir' }]}>
            {c.tendencia_mensal.labels.map((m, i) => (
              <Linha key={m}>
                <Celula forte>{m}</Celula>
                <Celula alinhar="dir">{pct(c.tendencia_mensal.close_rate[i], 0)}</Celula>
                <Celula alinhar="dir">{c.tendencia_mensal.vendas[i]}</Celula>
              </Linha>
            ))}
          </Tabela>
        </Cartao>

        <Cartao titulo="🏆 Destaques do período">
          <ul className="space-y-2 text-[11px] leading-relaxed">
            {c.destaques.map((d) => (
              <li key={d.texto} className="flex gap-2">
                <span className="shrink-0">{d.icone}</span>
                <span>{d.texto}</span>
              </li>
            ))}
          </ul>
        </Cartao>
      </div>
    </div>
  );
}

/* ══════════════════════════════ Estratégia ══════════════════════════════════ */

function Estrategia() {
  const e = D.estrategia;
  const cenarios = [
    { cenario: 'Pessimista', tom: 'ruim' as Tom, ...e.forecast_full.pessimista },
    { cenario: 'Realista', tom: 'atencao' as Tom, ...e.forecast_full.realista },
    { cenario: 'Otimista', tom: 'ok' as Tom, ...e.forecast_full.otimista },
  ];
  const max = Math.max(...cenarios.map((c) => c.valor));

  return (
    <div className="space-y-4">
      <Cartao titulo="Forecast · onde o mês deve fechar">
        <div className="grid md:grid-cols-3 gap-3">
          {cenarios.map((c) => (
            <div
              key={c.cenario}
              className={cn(
                'rounded-lg border p-3',
                c.tom === 'ok' ? 'border-success/40' : c.tom === 'atencao' ? 'border-attention/40' : 'border-warn/40',
              )}
            >
              <div className="flex items-center justify-between mb-2">
                <span className="text-[11px] font-extrabold uppercase tracking-wider">{c.cenario}</span>
                <Selo tom={c.tom}>
                  {c.vs_meta > 0 ? '+' : ''}
                  {c.vs_meta}%
                </Selo>
              </div>
              <div className="text-2xl font-extrabold tracking-tight">{moedaCurta(c.valor)}</div>
              <div className="text-[10px] text-[rgb(var(--muted))] mt-0.5">{c.label}</div>
              <div className="mt-2">
                <Barra pct={(c.valor / max) * 100} tom={c.tom} />
              </div>
              <p className="text-[10px] text-[rgb(var(--muted))] mt-2 leading-relaxed">{c.premissa}</p>
            </div>
          ))}
        </div>
      </Cartao>

      <div className="grid lg:grid-cols-2 gap-3">
        <Cartao titulo="Testes em curso" meta={`${e.testes_ativos.length} hipóteses`}>
          <Tabela
            colunas={[{ label: 'Teste' }, { label: 'Tipo' }, { label: 'Prazo' }, { label: 'Status' }]}
          >
            {e.testes_ativos.map((t) => (
              <Linha key={t.nome}>
                <Celula forte className="max-w-[200px]">
                  {t.nome}
                  <div className="text-[9px] text-[rgb(var(--muted))] font-normal">{t.expectativa}</div>
                </Celula>
                <Celula>{t.tipo}</Celula>
                <Celula>{t.prazo}</Celula>
                <Celula>
                  <Selo tom={t.status === 'rodando' ? 'atencao' : t.status === 'validado' ? 'ok' : 'neutro'}>
                    {t.status}
                  </Selo>
                </Celula>
              </Linha>
            ))}
          </Tabela>
        </Cartao>

        <Cartao titulo="Alertas de saturação">
          <div className="space-y-2.5">
            {e.saturacao_alertas.map((s) => (
              <div key={s.item}>
                <div className="flex items-baseline justify-between text-[11px] mb-1">
                  <span className="font-bold">{s.item}</span>
                  <span className="tabular-nums font-extrabold">{s.saturacao}%</span>
                </div>
                <Barra pct={s.saturacao} tom={s.saturacao >= 80 ? 'ruim' : 'atencao'} />
                <p className="text-[10px] text-[rgb(var(--muted))] mt-1">{s.acao}</p>
              </div>
            ))}
          </div>
        </Cartao>
      </div>

      <Cartao titulo="Decisões estratégicas">
        <Tabela colunas={[{ label: 'Quando' }, { label: 'Decisão' }, { label: 'Status' }]}>
          {e.decisoes_estrategicas.map((d) => (
            <Linha key={d.decisao}>
              <Celula>{d.data}</Celula>
              <Celula forte>{d.decisao}</Celula>
              <Celula>
                <Selo tom={d.status === 'feito' ? 'ok' : d.status === 'pendente' ? 'atencao' : 'neutro'}>
                  {d.status}
                </Selo>
              </Celula>
            </Linha>
          ))}
        </Tabela>
      </Cartao>
    </div>
  );
}

/* ═══════════════════════════ Próximos passos ════════════════════════════════ */

const STATUS_MARCO: Record<string, { label: string; tom: Tom }> = {
  'em-progresso': { label: '🟡 Em progresso', tom: 'atencao' },
  agendado: { label: '⚪ Agendado', tom: 'neutro' },
  pendente: { label: '🔴 Pendente decisão', tom: 'ruim' },
  concluido: { label: '🟢 Concluído', tom: 'ok' },
};

const URGENCIA: Record<string, { label: string; tom: Tom }> = {
  alta: { label: 'Alta urgência', tom: 'ruim' },
  media: { label: 'Atenção', tom: 'atencao' },
  baixa: { label: 'Quando puder', tom: 'neutro' },
};

function Proximos() {
  const dec = D.decisoes_semana;
  const feitas = dec.filter((d) => d.status === 'feito').length;
  const andamento = dec.filter((d) => d.status === 'andamento').length;
  const agendadas = dec.filter((d) => d.status === 'agendado').length;

  return (
    <div className="space-y-4">
      <Cartao
        titulo="Decisões desta semana"
        meta={`${dec.length} registradas · ${feitas} executadas · ${andamento} em andamento · ${agendadas} agendadas`}
      >
        <div className="grid grid-cols-3 gap-2.5 mb-3">
          <Kpi rotulo="🟢 Feitas" valor={feitas} nota="decisões executadas" tom="ok" />
          <Kpi rotulo="⏳ Em andamento" valor={andamento} nota="em execução agora" tom="atencao" />
          <Kpi rotulo="⚪ Agendadas" valor={agendadas} nota="próximos dias" />
        </div>

        <Tabela colunas={[{ label: 'Ação' }, { label: 'Responsável' }, { label: 'Status' }, { label: 'Impacto' }]}>
          {dec.map((d) => (
            <Linha key={d.acao}>
              <Celula forte>{d.acao}</Celula>
              <Celula>{d.responsavel}</Celula>
              <Celula>
                <Selo tom={d.status === 'feito' ? 'ok' : d.status === 'andamento' ? 'atencao' : 'neutro'}>
                  {d.status}
                </Selo>
              </Celula>
              <Celula className="max-w-[260px]">{d.impacto}</Celula>
            </Linha>
          ))}
        </Tabela>
      </Cartao>

      <div className="grid lg:grid-cols-2 gap-3">
        <Cartao titulo="Plano da próxima semana">
          <ul className="space-y-2 text-[11px] leading-relaxed">
            {D.proxima_semana.map((p) => (
              <li key={p}>{p}</li>
            ))}
          </ul>
        </Cartao>

        <Cartao titulo="Marcos do mês">
          <div className="space-y-2.5">
            {PROXIMOS_PASSOS.marcos_mes.map((m) => {
              const st = STATUS_MARCO[m.status] ?? STATUS_MARCO.agendado;
              return (
                <div key={m.titulo} className="border-b border-[rgb(var(--border))] last:border-0 pb-2.5 last:pb-0">
                  <div className="flex items-start justify-between gap-2">
                    <span className="text-[11px] font-extrabold">{m.titulo}</span>
                    <Selo tom={st.tom}>{st.label}</Selo>
                  </div>
                  <div className="text-[9px] uppercase tracking-wider text-[rgb(var(--muted))] font-bold mt-0.5">
                    Prazo · {m.prazo}
                  </div>
                  <p className="text-[10px] text-[rgb(var(--muted))] mt-1">{m.detalhe}</p>
                </div>
              );
            })}
          </div>
        </Cartao>
      </div>

      <Cartao titulo="⏳ Esperando por você" meta="pendências do cliente">
        <div className="space-y-2.5">
          {PROXIMOS_PASSOS.pendencias_cliente.map((p) => {
            const u = URGENCIA[p.urgencia] ?? URGENCIA.baixa;
            return (
              <div key={p.item} className="border-b border-[rgb(var(--border))] last:border-0 pb-2.5 last:pb-0">
                <div className="flex items-start justify-between gap-2">
                  <span className="text-[12px] font-extrabold">{p.item}</span>
                  <Selo tom={u.tom}>{u.label}</Selo>
                </div>
                <div className="text-[9px] uppercase tracking-wider text-[rgb(var(--muted))] font-bold mt-0.5">
                  Prazo · {p.prazo}
                </div>
                <p className="text-[11px] text-[rgb(var(--muted))] mt-1 leading-relaxed">{p.detalhe}</p>
              </div>
            );
          })}
        </div>
      </Cartao>

      <Cartao titulo="Próximas reuniões">
        <Tabela colunas={[{ label: 'Data' }, { label: 'Reunião' }, { label: 'Participantes' }, { label: 'Tipo' }]}>
          {PROXIMOS_PASSOS.proximas_reunioes.map((r) => (
            <Linha key={r.titulo}>
              <Celula forte>
                {r.data}
                <div className="text-[9px] text-[rgb(var(--muted))] font-normal">{r.horario}</div>
              </Celula>
              <Celula forte>{r.titulo}</Celula>
              <Celula className="text-[rgb(var(--muted))]">{r.participantes}</Celula>
              <Celula>
                <Selo tom="neutro">{r.tipo}</Selo>
              </Celula>
            </Linha>
          ))}
        </Tabela>
      </Cartao>
    </div>
  );
}
