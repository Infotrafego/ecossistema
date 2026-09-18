/**
 * Documento do debriefing · 9 seções
 *
 * Replica o layout do mockup `db`: capa com os 4 destaques, sumário executivo
 * em 3 leituras, funil com reconciliação de fontes, captação por fase,
 * criativos (top e corte), públicos, comercial, financeiro, plano de ação e o
 * anexo metodológico — que é o que dá credibilidade ao número.
 */

import { notFound } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';
import { DEBRIEFINGS, DOC_KEDMA, SECOES_DEBRIEFING } from '@/data/mock-debriefings';
import {
  AvisoMock,
  Barra,
  Cartao,
  Celula,
  Linha,
  ListaDist,
  Selo,
  Tabela,
  num,
  pct,
  type Tom,
} from '@/components/mock/ui';
import { cn } from '@/lib/utils';

export const dynamic = 'force-dynamic';

const TOM_PILL: Record<string, Tom> = { ok: 'ok', alerta: 'atencao', neutro: 'neutro' };

export default async function DebriefingPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const meta = DEBRIEFINGS.find((d) => d.id === id);
  if (!meta || !meta.completo) notFound();

  const D = DOC_KEDMA;
  const maxTemp = Math.max(...D.temperatura.map((t) => t.investimento));
  const maxCpmql = Math.max(...D.cpmqlSemanal.map((s) => s.cpmql));
  const maxCluster = Math.max(...D.clustersFormato.map((c) => c.cpmql));
  const maxProj = Math.max(...D.projecaoFaturamento.map((p) => p.valor));
  const maxRoas = Math.max(...D.evolucaoRoas.map((e) => e.roas));
  const maxIdade = Math.max(...D.demografia.idade.map((i) => i.mqls));

  return (
    <div className="space-y-5">
      <Link
        href="/dashboard/debriefings"
        className="text-[11px] text-[rgb(var(--muted))] hover:text-navy inline-flex items-center gap-1.5 font-bold"
      >
        <ArrowLeft size={12} /> Todos os debriefings
      </Link>

      <AvisoMock fase="Debriefings">
        Documento de referência visual. Os gráficos do mockup viram barras aqui — a estrutura das 9
        seções e o texto são os definitivos.
      </AvisoMock>

      {/* Índice */}
      <nav className="card sticky top-[57px] z-20 py-2.5">
        <div className="flex gap-1 overflow-x-auto">
          {SECOES_DEBRIEFING.map((s) => (
            <a
              key={s.id}
              href={`#${s.id}`}
              className="px-2.5 py-1 rounded-md text-[10px] font-extrabold text-[rgb(var(--muted))] hover:bg-navy/5 hover:text-navy whitespace-nowrap transition"
            >
              <span className="text-navy mr-1">{s.letra}</span>
              {s.nome}
            </a>
          ))}
        </div>
      </nav>

      {/* Capa */}
      <section className="rounded-xl bg-alicerce text-white p-6">
        <h1 className="text-2xl font-extrabold tracking-tight">{D.capa.titulo}</h1>
        <p className="text-[12px] text-ash mt-1">{D.capa.subtitulo}</p>

        <div className="flex gap-1.5 flex-wrap mt-3">
          {D.capa.pills.map((p) => (
            <span
              key={p.texto}
              className={cn(
                'px-2 py-1 rounded text-[10px] font-extrabold',
                p.tom === 'ok'
                  ? 'bg-success/20 text-success'
                  : p.tom === 'alerta'
                    ? 'bg-attention/20 text-attention'
                    : 'bg-white/10 text-ash',
              )}
            >
              {p.texto}
            </span>
          ))}
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-5 pt-5 border-t border-white/10">
          {D.capa.destaques.map((d) => (
            <div key={d.rotulo}>
              <div className="text-[10px] uppercase tracking-wider text-ash font-bold">{d.rotulo}</div>
              <div className="text-2xl font-extrabold tracking-tight mt-0.5">{d.valor}</div>
              <div className="text-[10px] text-ash mt-0.5">{d.nota}</div>
            </div>
          ))}
        </div>
      </section>

      {/* A · Visão geral */}
      <Secao id="overview" letra="A" titulo="Sumário executivo" sub="Leitura em 90 segundos">
        <div className="grid md:grid-cols-3 gap-3">
          {D.sumario.map((s) => (
            <div
              key={s.n}
              className={cn(
                'rounded-lg border p-3',
                s.tom === 'ok' ? 'border-success/40' : 'border-attention/40',
              )}
            >
              <div className="flex items-center gap-2 mb-1.5">
                <span className="text-lg font-extrabold text-[rgb(var(--muted))]">{s.n}</span>
                <Selo tom={TOM_PILL[s.tom]}>{s.tag}</Selo>
              </div>
              <div className="text-[12px] font-extrabold">{s.titulo}</div>
              <p className="text-[11px] text-[rgb(var(--muted))] mt-1.5 leading-relaxed">{s.texto}</p>
            </div>
          ))}
        </div>

        <Cartao titulo="KPIs do período · vs lançamento anterior" className="mt-3">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {D.kpis.map((k) => (
              <div key={k.rotulo}>
                <div className="kpi-label">{k.rotulo}</div>
                <div className="text-xl font-extrabold tracking-tight mt-0.5">{k.valor}</div>
                <div
                  className={cn(
                    'text-[10px] font-bold mt-0.5',
                    k.tom === 'ok' ? 'text-success' : k.tom === 'alerta' ? 'text-attention' : 'text-[rgb(var(--muted))]',
                  )}
                >
                  {k.delta}
                </div>
              </div>
            ))}
          </div>

          <div className="grid grid-cols-2 md:grid-cols-6 gap-3 mt-4 pt-4 border-t border-[rgb(var(--border))]">
            {D.kpisSecundarios.map((k) => (
              <div key={k.rotulo}>
                <div className="kpi-label">{k.rotulo}</div>
                <div className="text-[15px] font-extrabold tracking-tight">{k.valor}</div>
                <div className="text-[9px] text-[rgb(var(--muted))]">{k.nota}</div>
              </div>
            ))}
          </div>
        </Cartao>
      </Secao>

      {/* B · Funil */}
      <Secao id="funil" letra="B" titulo="Funil completo" sub="Uma única fonte de verdade · reconciliação ao lado">
        <div className="grid lg:grid-cols-2 gap-3">
          <Cartao titulo="Conversão entre etapas" meta="vs lançamento anterior">
            <div className="space-y-2.5">
              {D.funil.map((f, i) => (
                <div key={f.etapa}>
                  <div className="flex items-baseline justify-between text-[11px] mb-1">
                    <span className="font-bold">{f.etapa}</span>
                    <span className="tabular-nums">
                      <strong>{f.valor}</strong>
                      <span className="text-[rgb(var(--muted))] ml-1.5">{f.taxa}</span>
                      {f.delta && (
                        <span className={cn('ml-1.5 font-bold', f.delta.startsWith('↑') ? 'text-success' : 'text-warn')}>
                          {f.delta}
                        </span>
                      )}
                    </span>
                  </div>
                  <Barra pct={100 - i * 13} tom="neutro" />
                </div>
              ))}
            </div>
          </Cartao>

          <Cartao titulo="Reconciliação de fontes" meta="divergência ±25%">
            <div className="space-y-2">
              {D.reconciliacao.fontes.map((f) => (
                <div
                  key={f.nome}
                  className={cn(
                    'rounded-md border p-2.5',
                    f.canonica ? 'border-navy/40 bg-navy/5' : 'border-[rgb(var(--border))]',
                  )}
                >
                  <div className="flex items-baseline justify-between gap-2">
                    <div>
                      <span className="text-[11px] font-extrabold">
                        {f.canonica && '★ '}
                        {f.nome}
                      </span>
                      <div className="text-[9px] text-[rgb(var(--muted))]">{f.detalhe}</div>
                    </div>
                    <div className="text-right shrink-0">
                      <div className="text-[12px] font-extrabold tabular-nums">{f.valor}</div>
                      <div className="text-[9px] text-[rgb(var(--muted))]">{f.nota}</div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
            <p className="text-[10px] text-[rgb(var(--muted))] mt-2.5 leading-relaxed">
              {D.reconciliacao.nota}
            </p>
          </Cartao>
        </div>
      </Secao>

      {/* C · Captação */}
      <Secao id="captacao" letra="C" titulo="Análise da captação" sub="Etapas, curva temporal e mix de público">
        <Cartao titulo="Performance por fase do lançamento">
          <div className="grid sm:grid-cols-3 lg:grid-cols-5 gap-3">
            {D.fases.map((f) => (
              <div key={f.nome} className="rounded-md border border-[rgb(var(--border))] p-2.5">
                <div className="text-[11px] font-extrabold">{f.nome}</div>
                <div className="text-[9px] text-[rgb(var(--muted))]">{f.periodo}</div>
                <div className="text-lg font-extrabold tracking-tight mt-1.5">{f.valor}</div>
                <div className="text-[9px] text-[rgb(var(--muted))] mt-0.5">{f.nota}</div>
              </div>
            ))}
          </div>
        </Cartao>

        <div className="grid lg:grid-cols-2 gap-3 mt-3">
          <Cartao titulo="Quente vs frio" meta="investimento · MQLs · vendas">
            <Tabela
              colunas={[
                { label: 'Temperatura' },
                { label: 'Invest.', alinhar: 'dir' },
                { label: 'MQLs', alinhar: 'dir' },
                { label: 'CPMQL', alinhar: 'dir' },
                { label: 'Vendas', alinhar: 'dir' },
              ]}
            >
              {D.temperatura.map((t) => (
                <Linha key={t.nome}>
                  <Celula forte>{t.nome}</Celula>
                  <Celula alinhar="dir">
                    <div className="flex items-center justify-end gap-2">
                      <div className="w-16">
                        <Barra pct={(t.investimento / maxTemp) * 100} tom={t.nome === 'Frio' ? 'ok' : 'atencao'} />
                      </div>
                      <span>R$ {num(t.investimento)}</span>
                    </div>
                  </Celula>
                  <Celula alinhar="dir">{t.mqls}</Celula>
                  <Celula alinhar="dir" forte>
                    R$ {t.cpmql}
                  </Celula>
                  <Celula alinhar="dir">{t.vendas}</Celula>
                </Linha>
              ))}
            </Tabela>
          </Cartao>

          <Cartao titulo="CPMQL semanal" meta="meta R$ 80">
            <ListaDist
              itens={D.cpmqlSemanal.map((s) => ({
                rotulo: s.semana,
                valor: `R$ ${s.cpmql}`,
                pct: (s.cpmql / maxCpmql) * 100,
                nota: s.cpmql > 80 ? '· acima' : '· na meta',
              }))}
              tom="atencao"
            />
          </Cartao>
        </div>
      </Secao>

      {/* D · Criativos */}
      <Secao id="criativos" letra="D" titulo="Análise de criativos" sub="Top, corte, fadiga e clusters">
        <div className="grid lg:grid-cols-2 gap-3">
          <Cartao titulo="★ Top 3 criativos" meta="maior eficiência">
            <div className="space-y-2">
              {D.topCriativos.map((c) => (
                <div key={c.id} className="rounded-md border border-success/30 p-2.5">
                  <div className="flex items-start justify-between gap-2">
                    <div className="min-w-0">
                      <div className="text-[11px] font-extrabold">
                        <span className="text-success mr-1">{c.rank}</span>
                        {c.nome}
                      </div>
                      <div className="text-[10px] text-[rgb(var(--muted))]">{c.descricao}</div>
                    </div>
                    <div className="text-right shrink-0">
                      <div className="text-[13px] font-extrabold">{c.cpmql}</div>
                      <div className="text-[9px] text-[rgb(var(--muted))]">CPMQL</div>
                    </div>
                  </div>
                  <div className="flex gap-1 flex-wrap mt-1.5">
                    <Selo tom="neutro">{c.formato}</Selo>
                    {c.tags.map((t) => (
                      <Selo key={t} tom="neutro">
                        {t}
                      </Selo>
                    ))}
                  </div>
                  <div className="text-[10px] text-[rgb(var(--muted))] mt-1.5">{c.resultado}</div>
                </div>
              ))}
            </div>
          </Cartao>

          <Cartao titulo="✕ Cortar urgente" meta="ROI negativo">
            <div className="space-y-2">
              {D.cortarCriativos.map((c) => (
                <div key={c.id} className="rounded-md border border-warn/30 p-2.5">
                  <div className="flex items-start justify-between gap-2">
                    <div className="min-w-0">
                      <div className="text-[11px] font-extrabold">{c.nome}</div>
                      <div className="text-[10px] text-[rgb(var(--muted))]">{c.descricao}</div>
                    </div>
                    <div className="text-right shrink-0">
                      <div className="text-[13px] font-extrabold text-warn">{c.cpmql}</div>
                      <div className="text-[9px] text-[rgb(var(--muted))]">CPMQL</div>
                    </div>
                  </div>
                  <div className="flex gap-1 flex-wrap mt-1.5">
                    {c.tags.map((t) => (
                      <Selo key={t} tom="neutro">
                        {t}
                      </Selo>
                    ))}
                  </div>
                  <div className="text-[10px] text-[rgb(var(--muted))] mt-1.5">{c.resultado}</div>
                </div>
              ))}
            </div>

            <div className="mt-3 rounded-md bg-attention/10 p-2.5">
              <div className="text-[9px] uppercase tracking-wider font-extrabold text-attention">
                ▼ Aprendizado
              </div>
              <p className="text-[11px] mt-1 leading-relaxed">{D.aprendizadoCriativos}</p>
            </div>
          </Cartao>
        </div>

        <Cartao titulo="Cluster por formato" meta="CPMQL médio" className="mt-3">
          <ListaDist
            itens={D.clustersFormato.map((c) => ({
              rotulo: c.formato,
              valor: `R$ ${c.cpmql}`,
              pct: (c.cpmql / maxCluster) * 100,
              nota: `· ${c.criativos} criativos`,
            }))}
            tom="atencao"
          />
        </Cartao>
      </Secao>

      {/* E · Públicos */}
      <Secao id="publicos" letra="E" titulo="Análise de públicos" sub="Performance por segmento e breakdown demográfico">
        <Cartao>
          <Tabela
            colunas={[
              { label: 'Público' },
              { label: 'Temp.' },
              { label: 'Invest.', alinhar: 'dir' },
              { label: 'Impressões', alinhar: 'dir' },
              { label: 'MQLs', alinhar: 'dir' },
              { label: 'CPMQL', alinhar: 'dir' },
              { label: 'Vendas', alinhar: 'dir' },
              { label: 'ROAS', alinhar: 'dir' },
            ]}
          >
            {D.publicos.map((p) => (
              <Linha key={p.nome}>
                <Celula forte className="max-w-[240px]">
                  {p.nome}
                  <div className="text-[9px] text-[rgb(var(--muted))] font-normal">{p.descricao}</div>
                </Celula>
                <Celula>
                  <Selo tom={p.temperatura === 'Frio' ? 'neutro' : 'atencao'}>{p.temperatura}</Selo>
                </Celula>
                <Celula alinhar="dir">{p.investimento}</Celula>
                <Celula alinhar="dir">{p.impressoes}</Celula>
                <Celula alinhar="dir">{p.mqls}</Celula>
                <Celula alinhar="dir" forte>
                  {p.cpmql}
                </Celula>
                <Celula alinhar="dir">{p.vendas}</Celula>
                <Celula alinhar="dir">
                  <span
                    className={cn(
                      'font-extrabold',
                      parseFloat(p.roas) >= 3 ? 'text-success' : parseFloat(p.roas) >= 2 ? '' : 'text-warn',
                    )}
                  >
                    {p.roas}
                  </span>
                </Celula>
              </Linha>
            ))}
          </Tabela>
        </Cartao>

        <div className="grid md:grid-cols-3 gap-3 mt-3">
          <Cartao titulo="Idade × conversão">
            <ListaDist
              itens={D.demografia.idade.map((i) => ({
                rotulo: i.faixa,
                valor: `${i.mqls} MQLs`,
                pct: (i.mqls / maxIdade) * 100,
                nota: `· ${i.vendas} vendas`,
              }))}
            />
          </Cartao>
          <Cartao titulo="Gênero">
            <ListaDist
              itens={D.demografia.genero.map((g) => ({ rotulo: g.nome, valor: pct(g.pct, 0), pct: g.pct }))}
            />
          </Cartao>
          <Cartao titulo="Dispositivo">
            <ListaDist
              itens={D.demografia.dispositivo.map((d) => ({ rotulo: d.nome, valor: pct(d.pct, 0), pct: d.pct }))}
            />
          </Cartao>
        </div>
      </Secao>

      {/* F · Comercial */}
      <Secao id="comercial" letra="F" titulo="Análise comercial" sub="O que aconteceu nas calls e no fechamento">
        <div className="grid lg:grid-cols-2 gap-3">
          <Cartao titulo="Motivos de não-compra" meta="registrados no CRM (89% das aplicações)">
            <ListaDist
              itens={D.motivosNaoCompra.map((m) => ({
                rotulo: m.motivo,
                valor: pct(m.pct, 0),
                pct: m.pct,
              }))}
              tom="ruim"
            />
          </Cartao>

          <Cartao titulo="Jornada do lead">
            <div className="grid grid-cols-3 gap-3">
              {D.jornada.map((j) => (
                <div key={j.rotulo}>
                  <div className="kpi-label">{j.rotulo}</div>
                  <div className="text-xl font-extrabold tracking-tight">{j.valor}</div>
                  <div className="text-[9px] text-[rgb(var(--muted))]">{j.nota}</div>
                </div>
              ))}
            </div>
          </Cartao>

          <Cartao titulo="Forma de pagamento">
            <ListaDist
              itens={D.pagamento.map((p) => ({ rotulo: p.forma, valor: pct(p.pct, 0), pct: p.pct }))}
            />
          </Cartao>

          <Cartao titulo="Mix de parcelamento">
            <ListaDist
              itens={D.parcelamento.map((p) => ({ rotulo: p.faixa, valor: pct(p.pct, 0), pct: p.pct }))}
            />
          </Cartao>
        </div>
      </Secao>

      {/* G · Financeiro */}
      <Secao id="financeiro" letra="G" titulo="Análise financeira" sub="CAC, LTV, payback e projeção">
        <div className="grid md:grid-cols-2 xl:grid-cols-4 gap-3">
          {D.financeiro.map((f) => (
            <Cartao key={f.rotulo}>
              <div className="kpi-label">{f.rotulo}</div>
              <div className="text-2xl font-extrabold tracking-tight mt-0.5">{f.valor}</div>
              <p className="text-[10px] text-[rgb(var(--muted))] mt-1.5 leading-relaxed">{f.nota}</p>
            </Cartao>
          ))}
        </div>

        <div className="grid lg:grid-cols-2 gap-3 mt-3">
          <Cartao titulo="Faturamento projetado" meta="imediato · 30d · 90d · LTV">
            <ListaDist
              itens={D.projecaoFaturamento.map((p) => ({
                rotulo: p.horizonte,
                valor: `R$ ${p.valor}k`,
                pct: (p.valor / maxProj) * 100,
              }))}
              tom="ok"
            />
          </Cartao>

          <Cartao titulo="Evolução do ROAS" meta="últimos 4 lançamentos">
            <ListaDist
              itens={D.evolucaoRoas.map((e) => ({
                rotulo: e.lancamento,
                valor: `${e.roas.toLocaleString('pt-BR')}x`,
                pct: (e.roas / maxRoas) * 100,
              }))}
              tom="ok"
            />
          </Cartao>
        </div>
      </Secao>

      {/* H · Plano */}
      <Secao id="plano" letra="H" titulo="Aprendizados e plano de ação" sub="Próximo ciclo · 5 prioridades">
        <div className="grid lg:grid-cols-2 gap-3">
          <Cartao titulo="✓ Hipóteses validadas">
            <ul className="space-y-2 text-[11px] leading-relaxed">
              {D.validadas.map((v) => (
                <li key={v} className="flex gap-2">
                  <span className="text-success font-extrabold shrink-0">✓</span>
                  <span>{v}</span>
                </li>
              ))}
            </ul>
          </Cartao>

          <Cartao titulo="✕ Hipóteses invalidadas">
            <ul className="space-y-2 text-[11px] leading-relaxed">
              {D.invalidadas.map((v) => (
                <li key={v} className="flex gap-2">
                  <span className="text-warn font-extrabold shrink-0">✕</span>
                  <span>{v}</span>
                </li>
              ))}
            </ul>
          </Cartao>
        </div>

        <div className="space-y-2.5 mt-3">
          {D.plano.map((p) => (
            <div
              key={p.titulo}
              className={cn(
                'rounded-lg border p-3',
                p.prioridade === 'P1'
                  ? 'border-warn/40 bg-warn/5'
                  : p.prioridade === 'P2'
                    ? 'border-attention/40'
                    : 'border-[rgb(var(--border))]',
              )}
            >
              <div className="flex items-start justify-between gap-3 flex-wrap">
                <div className="flex items-baseline gap-2">
                  <Selo tom={p.prioridade === 'P1' ? 'ruim' : p.prioridade === 'P2' ? 'atencao' : 'neutro'}>
                    {p.prioridade}
                  </Selo>
                  <span className="text-[12px] font-extrabold">{p.titulo}</span>
                </div>
                <Selo tom="ok">{p.impacto}</Selo>
              </div>
              <p className="text-[11px] text-[rgb(var(--muted))] mt-1.5 leading-relaxed">{p.descricao}</p>
              <div className="flex gap-4 text-[10px] mt-2 flex-wrap">
                <span>
                  <span className="text-[rgb(var(--muted))]">Resp.</span> <strong>{p.responsavel}</strong>
                </span>
                <span>
                  <span className="text-[rgb(var(--muted))]">Prazo</span> <strong>{p.prazo}</strong>
                </span>
                <span>
                  <span className="text-[rgb(var(--muted))]">Meta</span> <strong>{p.meta}</strong>
                </span>
              </div>
            </div>
          ))}
        </div>
      </Secao>

      {/* I · Anexo */}
      <Secao id="anexo" letra="I" titulo="Anexo metodológico" sub="Fontes, definições e limitações">
        <div className="grid lg:grid-cols-2 gap-3">
          <Cartao titulo="Definições canônicas">
            <dl className="space-y-2 text-[11px]">
              {D.definicoes.map((d) => (
                <div key={d.termo}>
                  <dt className="font-extrabold">{d.termo}</dt>
                  <dd className="text-[rgb(var(--muted))] leading-relaxed">{d.texto}</dd>
                </div>
              ))}
            </dl>
          </Cartao>

          <Cartao titulo="Fontes utilizadas">
            <dl className="space-y-2 text-[11px]">
              {D.fontes.map((f) => (
                <div key={f.nome}>
                  <dt className="font-extrabold">{f.nome}</dt>
                  <dd className="text-[rgb(var(--muted))] leading-relaxed">{f.texto}</dd>
                </div>
              ))}
            </dl>
          </Cartao>
        </div>

        <Cartao titulo="▲ Limitações conhecidas" className="mt-3">
          <ul className="space-y-1.5 text-[11px] text-[rgb(var(--muted))] leading-relaxed">
            {D.limitacoes.map((l) => (
              <li key={l}>· {l}</li>
            ))}
          </ul>
        </Cartao>
      </Secao>

      <footer className="text-[10px] text-[rgb(var(--muted))] text-center py-4 border-t border-[rgb(var(--border))]">
        Debriefing gerado por infotráfego · publicado em {meta.publicadoEm} · revisado por {meta.revisor}
      </footer>
    </div>
  );
}

function Secao({
  id,
  letra,
  titulo,
  sub,
  children,
}: {
  id: string;
  letra: string;
  titulo: string;
  sub: string;
  children: React.ReactNode;
}) {
  return (
    <section id={id} className="scroll-mt-32">
      <div className="flex items-baseline gap-3 mb-3">
        <span className="w-7 h-7 rounded-md bg-navy text-white text-[12px] font-extrabold flex items-center justify-center shrink-0">
          {letra}
        </span>
        <div>
          <h2 className="text-base font-extrabold tracking-tight">{titulo}</h2>
          <p className="text-[10px] text-[rgb(var(--muted))]">{sub}</p>
        </div>
      </div>
      {children}
    </section>
  );
}
