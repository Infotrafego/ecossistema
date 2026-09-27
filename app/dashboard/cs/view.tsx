'use client';

/**
 * Central CS · portfolio, riscos, drill-down, pendências e calendário.
 *
 * A carteira é sempre ordenada por urgência (risco primeiro) — é a decisão de
 * UX que torna a tela útil: quem abre o CS de manhã precisa ver quem pode
 * cancelar, não a lista alfabética.
 *
 * Tudo vem pronto de `lib/cs.ts` (montado no servidor): esta view só desenha.
 * A exceção é o Calendário, ainda mockado (`data/mock-cs.ts`).
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
  EmConstrucao,
  FaixaKpis,
  Kanban,
  Kpi,
  Linha,
  ListaDist,
  Selo,
  Tabela,
  num,
  type Tom,
} from '@/components/mock/ui';
import {
  ddmm,
  JANELA_TENDENCIA_DIAS,
  JANELA_VOLUME_DIAS,
  LIMIAR_ATENCAO,
  LIMIAR_RISCO,
  type CarteiraCs,
  type CategoriaEscuta,
  type ClienteCs,
  type PontoTendencia,
  type Volume,
} from '@/lib/cs';
import { cn } from '@/lib/utils';

const TOM_STATUS: Record<ClienteCs['status'], Tom> = { risco: 'ruim', atencao: 'atencao', saudavel: 'ok' };
const ROTULO_STATUS: Record<ClienteCs['status'], string> = {
  risco: 'em risco',
  atencao: 'atenção',
  saudavel: 'saudável',
};

const CATEGORIAS: ReadonlyArray<{ id: CategoriaEscuta; rotulo: string; tom: Tom }> = [
  { id: 'DEMANDA', rotulo: 'Demandas', tom: 'neutro' },
  { id: 'ERRO', rotulo: 'Erros', tom: 'atencao' },
  { id: 'INSATISFACAO', rotulo: 'Insatisfações', tom: 'ruim' },
  { id: 'ELOGIO', rotulo: 'Elogios', tom: 'ok' },
];

const TOM_CATEGORIA: Record<CategoriaEscuta, Tom> = {
  DEMANDA: 'neutro',
  ERRO: 'atencao',
  INSATISFACAO: 'ruim',
  ELOGIO: 'ok',
};

function tomDoSentimento(v: number | null): Tom {
  if (v === null) return 'neutro';
  return v > 0 ? 'ok' : v < 0 ? 'ruim' : 'neutro';
}

function fmtTom(v: number | null): string {
  if (v === null) return '—';
  return `${v > 0 ? '+' : ''}${num(v, 2)}`;
}

export function CsView({
  carteira,
  tab,
  clienteInicial,
}: {
  carteira: CarteiraCs;
  tab?: string;
  clienteInicial?: string;
}) {
  const C = carteira;
  const abas: readonly Aba[] = [
    { id: 'portfolio', label: '📊 Portfolio', contador: C.kpis.total },
    { id: 'riscos', label: '⚠️ Sinais de Risco', contador: C.alertas.length },
    { id: 'cliente', label: '🔍 Drill-down por Cliente' },
    { id: 'pendencias', label: '📌 Pendências Cruzadas', contador: C.kpis.pendenciasNossas + C.kpis.pendenciasDeles },
    { id: 'calendario', label: '📅 Calendário', contador: DADOS_CS.calendario_proximos_15d.length },
  ];
  const atual = resolverAba(abas, tab);
  const [selecionado, setSelecionado] = useState(
    C.clientes.some((c) => c.id === clienteInicial) ? (clienteInicial as string) : (C.clientes[0]?.id ?? ''),
  );

  return (
    <div className="space-y-5">
      <Cabecalho
        titulo="Central CS · Gestão de Carteira"
        subtitulo={`${C.kpis.total} clientes com escuta ativa · referência ${ddmm(C.hoje)}`}
      />

      <FonteEscuta desde={C.escutaDesde} />

      <Abas abas={abas} atual={atual} />

      {C.clientes.length === 0 && atual !== 'calendario' ? (
        <EmConstrucao
          titulo="Nenhum cliente com escuta visível"
          texto="A escuta dos grupos ainda não tem dados para os clientes que você acessa. A carteira aparece aqui assim que o primeiro grupo for varrido."
        />
      ) : (
        <>
          {atual === 'portfolio' && <Portfolio carteira={C} onAbrir={setSelecionado} />}
          {atual === 'riscos' && <Riscos carteira={C} />}
          {atual === 'cliente' && (
            <Drilldown carteira={C} selecionado={selecionado} onSelecionar={setSelecionado} />
          )}
          {atual === 'pendencias' && <Pendencias carteira={C} />}
        </>
      )}
      {atual === 'calendario' && <Calendario total={C.kpis.total} />}
    </div>
  );
}

/** Deixa explícito o que é real e o que o risco ainda não enxerga. */
function FonteEscuta({ desde }: { desde: string | null }) {
  return (
    <div className="rounded-lg border border-[rgb(var(--border))] px-3.5 py-2.5 text-[11px] leading-relaxed">
      <span className="font-extrabold text-navy uppercase tracking-wider text-[10px]">
        Escuta dos grupos · dados reais
      </span>
      <span className="text-[rgb(var(--muted))] ml-2">
        Touchpoints, pendências, volume e tom vêm dos grupos de WhatsApp
        {desde ? ` (desde ${ddmm(desde.slice(0, 10))})` : ''}. O risk score é parcial: NPS, métrica
        de mídia, contrato e reuniões ainda não entram.
      </span>
    </div>
  );
}

/* ═══════════════════════════════ Portfolio ══════════════════════════════════ */

function Portfolio({ carteira: C, onAbrir }: { carteira: CarteiraCs; onAbrir: (id: string) => void }) {
  const k = C.kpis;

  return (
    <div className="space-y-4">
      <FaixaKpis cols="grid-cols-2 md:grid-cols-4 xl:grid-cols-7">
        <Kpi rotulo="Clientes" valor={k.total} nota="com escuta ativa" destaque />
        <Kpi rotulo="Saudáveis" valor={k.saudaveis} nota="risco baixo" tom="ok" />
        <Kpi rotulo="Atenção" valor={k.atencao} nota="monitorar" tom="atencao" />
        <Kpi rotulo="Em risco" valor={k.emRisco} nota="ação hoje" tom="ruim" />
        <Kpi rotulo="Sinais 7d" valor={k.sinais7d} nota="demandas · erros · insat. · elogios" />
        <Kpi rotulo="Pendências nossas" valor={k.pendenciasNossas} nota={`${k.pendenciasDeles} com o cliente`} tom={k.pendenciasNossas ? 'atencao' : 'neutro'} />
        <Kpi rotulo="Tom 7d" valor={fmtTom(k.tom7d)} nota="média dos grupos (-1 a +1)" tom={tomDoSentimento(k.tom7d)} />
      </FaixaKpis>

      <Cartao titulo="Carteira · ordenada por urgência" meta="risco primeiro">
        <div className="grid md:grid-cols-2 xl:grid-cols-3 gap-3">
          {C.clientes.map((c) => (
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
                    {c.saudeEmoji} {c.nome}
                  </div>
                  <div className="text-[10px] text-[rgb(var(--muted))]">
                    {c.grupos === 1 ? '1 grupo' : `${c.grupos} grupos`} no WhatsApp
                  </div>
                </div>
                <div className="text-right shrink-0">
                  <div
                    className={cn(
                      'text-lg font-extrabold tracking-tight',
                      c.riskScore >= LIMIAR_RISCO
                        ? 'text-warn'
                        : c.riskScore >= LIMIAR_ATENCAO
                          ? 'text-attention'
                          : 'text-success',
                    )}
                  >
                    {c.riskScore}
                  </div>
                  <div className="text-[9px] text-[rgb(var(--muted))]">risco</div>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-2 mt-2.5 text-center">
                <Mini rotulo="Sinais 7d" valor={`${c.sinais7d}`} nota={`${c.volume7d.INSATISFACAO} insat. · ${c.volume7d.ERRO} erro`} />
                <Mini rotulo="Tom 7d" valor={fmtTom(c.tendencia.tom7d)} nota={ROTULO_DIRECAO[c.tendencia.direcao]} />
                <Mini rotulo="Pendências" valor={`${c.pendencias.nossas.length}`} nota={`nossas · ${c.pendencias.deles.length} deles`} />
              </div>

              <p className="text-[10px] mt-2.5 leading-relaxed">{c.proximaAcao}</p>

              <div className="text-[9px] text-[rgb(var(--muted))] mt-2 flex gap-2 flex-wrap">
                <span>{silencio(c)}</span>
              </div>
            </button>
          ))}
        </div>
      </Cartao>

      <Cartao
        titulo="Escuta por cliente · últimos 7 dias"
        meta={`volume por categoria · tom de ${JANELA_TENDENCIA_DIAS} dias`}
      >
        <Tabela
          colunas={[
            { label: 'Cliente' },
            ...CATEGORIAS.map((c) => ({ label: c.rotulo, alinhar: 'dir' as const })),
            { label: `Tom · ${JANELA_TENDENCIA_DIAS}d` },
            { label: 'Tendência', alinhar: 'dir' },
          ]}
        >
          {C.clientes.map((c) => (
            <Linha key={c.id}>
              <Celula forte>{c.nome}</Celula>
              {CATEGORIAS.map((cat) => (
                <Celula key={cat.id} alinhar="dir">
                  <span className={c.volume7d[cat.id] && cat.tom !== 'neutro' ? TEXTO_TOM[cat.tom] + ' font-bold' : ''}>
                    {c.volume7d[cat.id]}
                  </span>
                </Celula>
              ))}
              <Celula>
                <Sparkline pontos={c.tendencia.pontos} />
              </Celula>
              <Celula alinhar="dir">
                <Selo tom={TOM_DIRECAO[c.tendencia.direcao]}>{ROTULO_DIRECAO[c.tendencia.direcao]}</Selo>
              </Celula>
            </Linha>
          ))}
        </Tabela>
      </Cartao>
    </div>
  );
}

const TEXTO_TOM: Record<Tom, string> = {
  ok: 'text-success',
  atencao: 'text-attention',
  ruim: 'text-warn',
  neutro: '',
};

const ROTULO_DIRECAO: Record<ClienteCs['tendencia']['direcao'], string> = {
  subindo: '↑ melhorando',
  caindo: '↓ piorando',
  estavel: '→ estável',
  sem_dados: 'sem conversa',
};

const TOM_DIRECAO: Record<ClienteCs['tendencia']['direcao'], Tom> = {
  subindo: 'ok',
  caindo: 'ruim',
  estavel: 'neutro',
  sem_dados: 'neutro',
};

function silencio(c: ClienteCs): string {
  if (c.diasSemMsgCliente === null) return 'escuta sem conversa ainda';
  if (!c.ultimaMensagemCliente) return `cliente não escreveu desde o início da escuta (${c.diasSemMsgCliente}d)`;
  if (c.diasSemMsgCliente === 0) return 'cliente escreveu hoje';
  return `${c.diasSemMsgCliente}d sem mensagem do cliente`;
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

/**
 * Tom do grupo dia a dia: barra pra cima (positivo), pra baixo (negativo),
 * traço no meio (neutro) e ponto apagado quando não houve conversa.
 */
function Sparkline({ pontos, alto = false }: { pontos: PontoTendencia[]; alto?: boolean }) {
  const h = alto ? 48 : 22;
  return (
    <div className="flex items-center gap-[3px]" style={{ height: h }} aria-label="tendência de sentimento">
      {pontos.map((p) => {
        const titulo = `${ddmm(p.dia)} · ${p.tom === null ? 'sem conversa' : `tom ${fmtTom(p.tom)}`} · ${p.sinais} sinais`;
        if (p.tom === null) {
          return (
            <div key={p.dia} title={titulo} className="w-[5px] flex items-center" style={{ height: h }}>
              <div className="w-[5px] h-[2px] rounded bg-[rgb(var(--border))]" />
            </div>
          );
        }
        const metade = h / 2;
        const tamanho = Math.max(2, Math.round(Math.abs(p.tom) * metade));
        return (
          <div key={p.dia} title={titulo} className="w-[5px] relative" style={{ height: h }}>
            <div
              className={cn(
                'absolute w-[5px] rounded-sm',
                p.tom > 0 ? 'bg-success' : p.tom < 0 ? 'bg-warn' : 'bg-[rgb(var(--muted))]',
              )}
              style={
                p.tom >= 0
                  ? { bottom: metade, height: tamanho }
                  : { top: metade, height: tamanho }
              }
            />
          </div>
        );
      })}
    </div>
  );
}

/* ═════════════════════════════════ Riscos ═══════════════════════════════════ */

function Riscos({ carteira: C }: { carteira: CarteiraCs }) {
  if (!C.alertas.length) {
    return (
      <EmConstrucao
        titulo="Nenhum sinal de risco na escuta"
        texto="Sem insatisfação, erro reportado, tom negativo, silêncio longo ou pendência nossa nos grupos da carteira."
      />
    );
  }

  return (
    <Cartao titulo="Alertas detectados automaticamente" meta={`${C.alertas.length} sinais · fonte: escuta dos grupos`}>
      <div>
        {C.alertas.map((a) => (
          <Alerta
            key={a.clienteId + a.tipo}
            origem={a.cliente.split(' ')[0]}
            prioridade={a.prioridade}
            href={`/dashboard/cs?tab=cliente&cliente=${a.clienteId}`}
          >
            <strong>{a.cliente}</strong> — {a.msg}
            <div className="text-[9px] text-[rgb(var(--muted))] mt-0.5">
              {a.tipo} · +{a.peso} no risco
            </div>
          </Alerta>
        ))}
      </div>
    </Cartao>
  );
}

/* ═══════════════════════════════ Drill-down ═════════════════════════════════ */

function Drilldown({
  carteira: C,
  selecionado,
  onSelecionar,
}: {
  carteira: CarteiraCs;
  selecionado: string;
  onSelecionar: (id: string) => void;
}) {
  const c: ClienteCs = C.clientes.find((x) => x.id === selecionado) ?? C.clientes[0];
  const t = c.tendencia;

  return (
    <div className="space-y-4">
      <div className="flex gap-1.5 flex-wrap">
        {C.clientes.map((x) => (
          <button
            key={x.id}
            type="button"
            onClick={() => onSelecionar(x.id)}
            className={cn(
              'px-2.5 py-1 rounded-md text-[10px] font-extrabold border transition',
              x.id === c.id
                ? 'bg-navy text-white border-navy'
                : 'border-[rgb(var(--border))] text-[rgb(var(--muted))] hover:border-navy/40',
            )}
          >
            {x.saudeEmoji} {x.nome}
          </button>
        ))}
      </div>

      <FaixaKpis cols="grid-cols-2 md:grid-cols-3 xl:grid-cols-6">
        <Kpi rotulo="Risk score" valor={c.riskScore} nota={`${ROTULO_STATUS[c.status]} · só escuta`} tom={TOM_STATUS[c.status]} destaque />
        <Kpi rotulo="Sinais 7d" valor={c.sinais7d} nota={`${c.volume30d.DEMANDA + c.volume30d.ERRO + c.volume30d.INSATISFACAO + c.volume30d.ELOGIO} em ${JANELA_VOLUME_DIAS}d`} />
        <Kpi rotulo="Tom 7d" valor={fmtTom(t.tom7d)} nota={`semana anterior ${fmtTom(t.tom7dAnterior)}`} tom={tomDoSentimento(t.tom7d)} />
        <Kpi rotulo="Sentimento do cliente" valor={fmtTom(c.sentimentoCliente7d)} nota="sinais escritos por ele · 7d (-2 a +2)" tom={tomDoSentimento(c.sentimentoCliente7d)} />
        <Kpi rotulo="Pendências nossas" valor={c.pendencias.nossas.length} nota={`${c.pendencias.deles.length} com o cliente`} tom={c.pendencias.nossas.length ? 'atencao' : 'neutro'} />
        <Kpi rotulo="Sem mensagem do cliente" valor={c.diasSemMsgCliente === null ? '—' : `${c.diasSemMsgCliente}d`} nota={c.grupos === 1 ? '1 grupo' : `${c.grupos} grupos`} tom={c.diasSemMsgCliente !== null && c.diasSemMsgCliente >= 4 ? 'atencao' : 'neutro'} />
      </FaixaKpis>

      <div
        className={cn(
          'rounded-lg border p-3',
          c.status === 'saudavel' ? 'border-success/30 bg-success/5' : 'border-warn/30 bg-warn/5',
        )}
      >
        <div
          className={cn(
            'text-[9px] uppercase tracking-wider font-extrabold',
            c.status === 'saudavel' ? 'text-success' : 'text-warn',
          )}
        >
          Próxima ação
        </div>
        <p className="text-[12px] font-bold mt-1">{c.proximaAcao}</p>
      </div>

      <div className="grid lg:grid-cols-2 gap-3">
        <Cartao titulo="Sinais de risco" meta="o que compõe o score">
          {c.sinaisRisco.length ? (
            <div className="space-y-2">
              {c.sinaisRisco.map((a) => (
                <div key={a.tipo} className="flex gap-2 items-start text-[11px]">
                  <Selo tom={a.prioridade === 'alta' ? 'ruim' : a.prioridade === 'media' ? 'atencao' : 'neutro'}>
                    {a.tipo}
                  </Selo>
                  <span className="flex-1">{a.msg}</span>
                  <span className="text-[10px] text-[rgb(var(--muted))] tabular-nums">+{a.peso}</span>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-[11px] text-[rgb(var(--muted))]">Nenhum sinal de risco nos grupos.</p>
          )}
        </Cartao>

        <Cartao titulo="Tendência de sentimento" meta={`tom do grupo · ${JANELA_TENDENCIA_DIAS} dias`}>
          <Sparkline pontos={t.pontos} alto />
          <div className="flex justify-between text-[9px] text-[rgb(var(--muted))] mt-1">
            <span>{ddmm(t.pontos[0].dia)}</span>
            <span>{ddmm(t.pontos[t.pontos.length - 1].dia)}</span>
          </div>
          <p className="text-[10px] text-[rgb(var(--muted))] mt-2">
            Semana atual {fmtTom(t.tom7d)} · anterior {fmtTom(t.tom7dAnterior)} ·{' '}
            <span className={TEXTO_TOM[TOM_DIRECAO[t.direcao]]}>{ROTULO_DIRECAO[t.direcao]}</span>
          </p>
        </Cartao>

        <Cartao titulo="Volume por categoria" meta={`últimos ${JANELA_VOLUME_DIAS} dias`}>
          <VolumeCategorias volume={c.volume30d} />
        </Cartao>

        <Cartao titulo="Touchpoints recentes · WhatsApp" meta={silencio(c)}>
          {c.touchpoints.length ? (
            <Tabela colunas={[{ label: 'Data' }, { label: 'Canal' }, { label: 'Assunto' }, { label: 'Sentimento' }]}>
              {c.touchpoints.map((tp) => (
                <Linha key={tp.id}>
                  <Celula>{ddmm(tp.dia)}</Celula>
                  <Celula forte>{tp.canal}</Celula>
                  <Celula className="text-[rgb(var(--muted))]">
                    <Selo tom={TOM_CATEGORIA[tp.categoria]} className="mr-1.5">
                      {tp.categoria === 'INSATISFACAO' ? 'insatisfação' : tp.categoria.toLowerCase()}
                    </Selo>
                    {tp.assunto}
                    {tp.autor === 'time' && <span className="text-[9px] ml-1">(nosso time)</span>}
                  </Celula>
                  <Celula>
                    <Selo tom={tp.sentimento === 'negativo' ? 'ruim' : tp.sentimento === 'positivo' ? 'ok' : 'neutro'}>
                      {tp.sentimento}
                    </Selo>
                  </Celula>
                </Linha>
              ))}
            </Tabela>
          ) : (
            <p className="text-[11px] text-[rgb(var(--muted))]">Nenhum sinal nos últimos {JANELA_VOLUME_DIAS} dias.</p>
          )}
        </Cartao>

        <ListaPendencias titulo="Pendências nossas" itens={c.pendencias.nossas} tom="atencao" />
        <ListaPendencias titulo="Pendências do cliente" itens={c.pendencias.deles} tom="neutro" />
      </div>

      <p className="text-[10px] text-[rgb(var(--muted))]">
        Ainda sem fonte: NPS, métrica de mídia do mês, contrato/renovação e agenda de reuniões.
      </p>
    </div>
  );
}

function VolumeCategorias({ volume }: { volume: Volume }) {
  const total = CATEGORIAS.reduce((a, c) => a + volume[c.id], 0);
  if (!total) return <p className="text-[11px] text-[rgb(var(--muted))]">Nenhum sinal no período.</p>;
  return (
    <div className="space-y-2.5">
      {CATEGORIAS.map((cat) => (
        <div key={cat.id}>
          <ListaDist
            tom={cat.tom}
            itens={[
              {
                rotulo: cat.rotulo,
                valor: num(volume[cat.id]),
                pct: (volume[cat.id] / total) * 100,
                nota: `${Math.round((volume[cat.id] / total) * 100)}%`,
              },
            ]}
          />
        </div>
      ))}
    </div>
  );
}

function ListaPendencias({
  titulo,
  itens,
  tom,
}: {
  titulo: string;
  itens: ClienteCs['pendencias']['nossas'];
  tom: Tom;
}) {
  return (
    <Cartao titulo={titulo} meta={`${itens.length} itens · último resumo do grupo`}>
      {itens.length ? (
        <Tabela colunas={[{ label: 'Item' }, { label: 'Grupo' }, { label: 'Resumo de', alinhar: 'dir' }]}>
          {itens.map((p) => (
            <Linha key={p.dia + p.item}>
              <Celula forte>{p.item}</Celula>
              <Celula>{p.grupo ?? 'principal'}</Celula>
              <Celula alinhar="dir">
                <span className={p.diasDesde >= 2 && tom !== 'neutro' ? 'text-warn font-bold' : ''}>
                  {ddmm(p.dia)}
                  {p.diasDesde >= 1 ? ` · ${p.diasDesde}d` : ''}
                </span>
              </Celula>
            </Linha>
          ))}
        </Tabela>
      ) : (
        <p className="text-[11px] text-[rgb(var(--muted))]">Nada em aberto no último resumo.</p>
      )}
    </Cartao>
  );
}

/* ═══════════════════════════════ Pendências ═════════════════════════════════ */

function Pendencias({ carteira: C }: { carteira: CarteiraCs }) {
  const nossas = C.clientes.flatMap((c) => c.pendencias.nossas.map((p) => ({ ...p, cliente: c.nome })));
  const deles = C.clientes.flatMap((c) => c.pendencias.deles.map((p) => ({ ...p, cliente: c.nome })));

  // O resumo é diário: pendência que ficou num resumo de 2+ dias atrás não foi
  // mais citada no grupo desde então — é a que mais corre risco de ser esquecida.
  const paradas = nossas.filter((p) => p.diasDesde >= 2);
  const recentes = nossas.filter((p) => p.diasDesde < 2);

  return (
    <Cartao
      titulo="Pendências de todos os clientes"
      meta={`${nossas.length + deles.length} abertas · ${paradas.length} nossas paradas há 2+ dias`}
    >
      <Kanban>
        <ColunaKanban titulo="Nossas · paradas 2+ dias" total={paradas.length}>
          {paradas.map((p) => (
            <CardPendencia key={p.cliente + p.item} p={p} tom="ruim" />
          ))}
        </ColunaKanban>

        <ColunaKanban titulo="Nossas · recentes" total={recentes.length}>
          {recentes.map((p) => (
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
  p: { item: string; grupo: string | null; dia: string; diasDesde: number; cliente: string };
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
        {p.grupo ? ` · ${p.grupo}` : ''}
      </div>
      <div className="text-[11px] font-bold mt-0.5">{p.item}</div>
      <div className="flex items-center justify-between mt-1.5">
        <span className="text-[9px] text-[rgb(var(--muted))]">resumo de {ddmm(p.dia)}</span>
        <Selo tom={tom}>{p.diasDesde === 0 ? 'hoje' : `${p.diasDesde}d`}</Selo>
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

/** Ainda mockado: reuniões, deadlines e renovações não têm fonte real. */
function Calendario({ total }: { total: number }) {
  const eventosMock = DADOS_CS.calendario_proximos_15d;
  const porData = eventosMock.reduce<Record<string, typeof eventosMock>>((acc, e) => {
    (acc[e.data] ??= []).push(e);
    return acc;
  }, {});

  return (
    <div className="space-y-4">
      <AvisoMock fase="Calendário">
        Eventos fictícios. Reuniões, deadlines e renovações entram quando agenda e contratos
        tiverem fonte — a escuta dos grupos não cobre isso.
      </AvisoMock>

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
              <Barra pct={(total / 15) * 100} tom="ok" />
            </div>
            <span className="text-[11px] font-bold tabular-nums">{total}/15 clientes</span>
          </div>
          <p className="text-[10px] text-[rgb(var(--muted))] mt-1.5">
            A meta da fase é 1 CS cobrindo 12–15 clientes — hoje são {total} com escuta ativa. O que
            fecha essa conta é automação de detecção, não mais horas de reunião.
          </p>
        </div>
      </Cartao>
    </div>
  );
}
