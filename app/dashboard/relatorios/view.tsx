'use client';

/**
 * Fila de relatórios diários + pré-visualização do que vai ser enviado.
 *
 * A lista da esquerda é a fila de revisão do dia; a direita mostra o relatório
 * exatamente na ordem em que ele sai no WhatsApp/ClickUp (recortes, marketing,
 * comercial, criativo, metas, análise), pra revisar sem sair da tela.
 */

import { useState } from 'react';
import { Check, Clock, MessageCircle, RefreshCw, Send, TriangleAlert } from 'lucide-react';
import type { Relatorio, Recorte, StatusRelatorio } from '@/data/mock-relatorios';
import {
  AvisoMock,
  Barra,
  Cabecalho,
  Cartao,
  Celula,
  Delta,
  Linha,
  Selo,
  Tabela,
  moeda,
  num,
  pct,
  type Tom,
} from '@/components/mock/ui';
import { cn } from '@/lib/utils';

const STATUS: Record<StatusRelatorio, { label: string; tom: Tom }> = {
  enviado: { label: 'Enviado', tom: 'ok' },
  revisao: { label: 'Aguardando revisão', tom: 'atencao' },
  gerando: { label: 'Gerando', tom: 'neutro' },
  falhou: { label: 'Falhou', tom: 'ruim' },
};

interface Props {
  relatorios: Relatorio[];
  agenda: {
    horario: string;
    canais: string[];
    proximaExecucao: string;
    ultimaExecucao: string;
    clientesAtivos: number;
  };
}

export function RelatoriosView({ relatorios, agenda }: Props) {
  const [selecionado, setSelecionado] = useState(relatorios[0].id);
  const rel = relatorios.find((r) => r.id === selecionado) ?? relatorios[0];

  const pendentes = relatorios.filter((r) => r.status === 'revisao').length;
  const falhas = relatorios.filter((r) => r.status === 'falhou').length;

  return (
    <div className="space-y-5">
      <Cabecalho
        titulo="Relatórios Diários"
        subtitulo={`${agenda.ultimaExecucao} · próxima execução ${agenda.proximaExecucao}`}
        acoes={
          <button
            type="button"
            className="px-3 py-2 bg-navy text-white rounded-lg text-xs font-extrabold inline-flex items-center gap-1.5 hover:bg-navy-soft transition"
          >
            <RefreshCw size={13} /> Rodar agora
          </button>
        }
      />

      <AvisoMock fase="Relatórios Diários">
        Maquete da fila de revisão. Nada é disparado: os botões de envio e reprocessamento não chamam
        ClickUp nem WhatsApp enquanto a fase não tiver backend.
      </AvisoMock>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-2.5">
        <ResumoFila rotulo="Clientes ativos" valor={agenda.clientesAtivos} nota="na Central" />
        <ResumoFila rotulo="Gerados hoje" valor={relatorios.length} nota={agenda.horario} />
        <ResumoFila rotulo="Aguardando revisão" valor={pendentes} nota="precisa de olho humano" tom="atencao" />
        <ResumoFila rotulo="Falhas" valor={falhas} nota="sem dado no período" tom={falhas ? 'ruim' : 'neutro'} />
      </div>

      <div className="grid lg:grid-cols-[300px_1fr] gap-4 items-start">
        {/* Fila */}
        <div className="space-y-2">
          {relatorios.map((r) => {
            const st = STATUS[r.status];
            const ativo = r.id === selecionado;
            return (
              <button
                key={r.id}
                type="button"
                onClick={() => setSelecionado(r.id)}
                className={cn(
                  'w-full text-left card transition',
                  ativo ? 'border-navy ring-1 ring-navy/20' : 'hover:border-navy/40',
                )}
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="min-w-0">
                    <div className="text-[12px] font-extrabold tracking-tight truncate">{r.cliente}</div>
                    <div className="text-[10px] text-[rgb(var(--muted))] truncate">{r.funil}</div>
                  </div>
                  <Selo tom={st.tom}>{st.label}</Selo>
                </div>
                <div className="text-[9px] text-[rgb(var(--muted))] mt-2 flex items-center gap-2">
                  <span>{r.arquetipo}</span>
                  {r.entrega.horario && (
                    <span className="inline-flex items-center gap-1">
                      <Check size={9} /> {r.entrega.horario}
                    </span>
                  )}
                </div>
              </button>
            );
          })}

          <div className="card text-[10px] text-[rgb(var(--muted))] leading-relaxed">
            <div className="font-extrabold text-ink dark:text-ash mb-1.5">Agenda</div>
            <p>Roda todo dia às {agenda.horario}.</p>
            <ul className="mt-1.5 space-y-0.5">
              {agenda.canais.map((c) => (
                <li key={c}>· {c}</li>
              ))}
            </ul>
          </div>
        </div>

        {/* Relatório */}
        <div className="space-y-4 min-w-0">
          <Detalhe rel={rel} />
        </div>
      </div>
    </div>
  );
}

function ResumoFila({
  rotulo,
  valor,
  nota,
  tom = 'neutro',
}: {
  rotulo: string;
  valor: number | string;
  nota: string;
  tom?: Tom;
}) {
  return (
    <div
      className={cn(
        'card',
        tom === 'atencao' && 'border-t-2 border-t-attention',
        tom === 'ruim' && 'border-t-2 border-t-warn',
      )}
    >
      <div className="kpi-label">{rotulo}</div>
      <div className="text-xl font-extrabold tracking-tight mt-0.5">{valor}</div>
      <div className="text-[10px] text-[rgb(var(--muted))]">{nota}</div>
    </div>
  );
}

function Detalhe({ rel }: { rel: Relatorio }) {
  const st = STATUS[rel.status];

  return (
    <>
      <Cartao>
        <div className="flex items-start justify-between gap-3 flex-wrap">
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-base font-extrabold tracking-tight">
                {rel.cliente} · {rel.funil}
              </h2>
              <Selo tom={st.tom}>{st.label}</Selo>
            </div>
            <p className="text-[11px] text-[rgb(var(--muted))] mt-1">
              Relatório de {rel.data} · {rel.referencia} · gerado em {rel.geradoEm}
            </p>
          </div>

          <div className="flex items-center gap-2">
            <BotaoCanal ativo={rel.entrega.clickup} icone={<Check size={12} />} label="ClickUp" />
            <BotaoCanal ativo={rel.entrega.whatsapp} icone={<MessageCircle size={12} />} label="WhatsApp" />
            {rel.status === 'revisao' && (
              <button
                type="button"
                className="px-2.5 py-1.5 bg-navy text-white rounded-md text-[10px] font-extrabold inline-flex items-center gap-1.5 hover:bg-navy-soft transition"
              >
                <Send size={11} /> Aprovar e enviar
              </button>
            )}
            {rel.status === 'falhou' && (
              <button
                type="button"
                className="px-2.5 py-1.5 border border-warn/40 text-warn rounded-md text-[10px] font-extrabold inline-flex items-center gap-1.5 hover:bg-warn/5 transition"
              >
                <RefreshCw size={11} /> Reprocessar
              </button>
            )}
          </div>
        </div>
      </Cartao>

      {rel.status === 'falhou' && (
        <div className="rounded-lg border border-warn/30 bg-warn/5 p-3 text-[11px] flex gap-2.5">
          <TriangleAlert size={15} className="text-warn shrink-0 mt-0.5" />
          <div>
            <div className="font-extrabold text-warn">Relatório não saiu</div>
            <p className="text-[rgb(var(--muted))] mt-0.5 leading-relaxed">{rel.analise.diagnostico}</p>
          </div>
        </div>
      )}

      {rel.status === 'gerando' && (
        <div className="rounded-lg border border-[rgb(var(--border))] bg-[rgb(var(--surface))] p-3 text-[11px] flex gap-2.5 items-center">
          <Clock size={15} className="text-[rgb(var(--muted))] shrink-0" />
          <span className="text-[rgb(var(--muted))]">{rel.analise.resultado}</span>
        </div>
      )}

      {rel.recortes.filter((r) => r.investimento > 0).map((r) => (
        <BlocoRecorte key={r.id} r={r} arquetipo={rel.arquetipo} />
      ))}

      {rel.criativoDestaque && (
        <Cartao titulo="🎬 Criativo destaque">
          <div className="text-[12px] font-extrabold">{rel.criativoDestaque.nome}</div>
          <div className="text-[11px] text-[rgb(var(--muted))] mt-0.5">
            {rel.criativoDestaque.gasto} · {rel.criativoDestaque.resultado}
          </div>
          <div className="text-[11px] mt-2">
            <span className="font-bold">Testar:</span>{' '}
            <span className="text-[rgb(var(--muted))]">{rel.criativoDestaque.teste}</span>
          </div>
          {rel.criativoDestaque.permalink && (
            <a
              href={rel.criativoDestaque.permalink}
              target="_blank"
              rel="noreferrer"
              className="text-[10px] text-navy font-extrabold mt-2 inline-block hover:underline"
            >
              Ver prévia no Instagram →
            </a>
          )}
        </Cartao>
      )}

      {rel.metas.length > 0 && (
        <Cartao titulo="🎯 Metas do mês" meta="mês ainda correndo">
          <div className="grid sm:grid-cols-2 gap-3">
            {rel.metas.map((m) => (
              <div key={m.metrica}>
                <div className="flex items-baseline justify-between text-[11px] mb-1">
                  <span className="font-bold">{m.metrica}</span>
                  <span className="tabular-nums text-[rgb(var(--muted))]">
                    {m.realizado} / {m.meta} · <strong>{m.pct}%</strong>
                  </span>
                </div>
                <Barra pct={m.pct} tom={m.pct >= 80 ? 'ok' : m.pct >= 50 ? 'atencao' : 'ruim'} />
              </div>
            ))}
          </div>
        </Cartao>
      )}

      {rel.status !== 'gerando' && (
        <Cartao titulo="📌 Análise">
          <dl className="space-y-3 text-[11px] leading-relaxed">
            <div>
              <dt className="font-extrabold uppercase tracking-wider text-[9px] text-[rgb(var(--muted))]">
                Resultado
              </dt>
              <dd className="mt-0.5">{rel.analise.resultado}</dd>
            </div>
            <div>
              <dt className="font-extrabold uppercase tracking-wider text-[9px] text-[rgb(var(--muted))]">
                Diagnóstico
              </dt>
              <dd className="mt-0.5">{rel.analise.diagnostico}</dd>
            </div>
            <div>
              <dt className="font-extrabold uppercase tracking-wider text-[9px] text-[rgb(var(--muted))]">Ação</dt>
              <dd className="mt-0.5">{rel.analise.acao}</dd>
            </div>
          </dl>
        </Cartao>
      )}
    </>
  );
}

function BotaoCanal({ ativo, icone, label }: { ativo: boolean; icone: React.ReactNode; label: string }) {
  return (
    <span
      className={cn(
        'px-2 py-1 rounded-md text-[10px] font-extrabold inline-flex items-center gap-1 border',
        ativo
          ? 'border-success/30 bg-success/10 text-success'
          : 'border-[rgb(var(--border))] text-[rgb(var(--muted))]',
      )}
    >
      {ativo ? icone : <Clock size={11} />} {label}
    </span>
  );
}

function BlocoRecorte({ r, arquetipo }: { r: Recorte; arquetipo: string }) {
  const ecommerce = arquetipo === 'E-commerce/ROAS';
  const roas = r.investimento > 0 ? r.receita / r.investimento : 0;

  return (
    <Cartao titulo={r.label} meta={r.comparativo}>
      <div className="space-y-4">
        <div>
          <div className="text-[9px] uppercase tracking-wider font-extrabold text-[rgb(var(--muted))] mb-2">
            Marketing
          </div>
          <Tabela
            colunas={[
              { label: 'Métrica' },
              { label: 'Valor', alinhar: 'dir' },
              { label: 'vs período anterior', alinhar: 'dir' },
            ]}
          >
            <LinhaMetrica rotulo="💰 Investimento" valor={moeda(r.investimento)} delta={r.deltas.investimento} />
            <LinhaMetrica rotulo="👁️ Impressões" valor={num(r.impressoes)} />
            <LinhaMetrica
              rotulo="🖱️ Cliques · CTR"
              valor={`${num(r.cliques)} · ${pct((r.cliques / Math.max(r.impressoes, 1)) * 100, 2)}`}
            />
            {!ecommerce && (
              <>
                <LinhaMetrica rotulo="👥 Leads" valor={num(r.leads)} delta={r.deltas.leads} />
                <LinhaMetrica rotulo="💸 CPL" valor={moeda(r.cpl, 2)} delta={r.deltas.cpl} inverso />
                <LinhaMetrica rotulo="⭐ MQLs" valor={num(r.mqls)} delta={r.deltas.mqls} />
                <LinhaMetrica rotulo="💸 CP MQL" valor={moeda(r.cpmql, 2)} />
                <LinhaMetrica
                  rotulo="📈 Conversão lead→MQL"
                  valor={pct((r.mqls / Math.max(r.leads, 1)) * 100)}
                />
              </>
            )}
          </Tabela>
        </div>

        {(r.reunioes > 0 || r.vendas > 0) && (
          <div>
            <div className="text-[9px] uppercase tracking-wider font-extrabold text-[rgb(var(--muted))] mb-2">
              {ecommerce ? 'Vendas' : 'Funil comercial'}
            </div>
            <Tabela
              colunas={[
                { label: 'Métrica' },
                { label: 'Valor', alinhar: 'dir' },
                { label: 'vs período anterior', alinhar: 'dir' },
              ]}
            >
              {!ecommerce && (
                <>
                  <LinhaMetrica rotulo="📅 Agendamentos" valor={num(r.agendamentos)} />
                  <LinhaMetrica
                    rotulo="🤝 Reuniões · no-show"
                    valor={`${num(r.reunioes)} · ${num(r.noShow)} (${pct(
                      (r.noShow / Math.max(r.agendamentos, 1)) * 100,
                    )})`}
                  />
                </>
              )}
              <LinhaMetrica rotulo="✅ Vendas" valor={num(r.vendas)} delta={r.deltas.vendas} />
              <LinhaMetrica
                rotulo="💵 Receita · ROAS"
                valor={`${moeda(r.receita)} · ${roas.toLocaleString('pt-BR', { maximumFractionDigits: 2 })}x`}
              />
            </Tabela>
          </div>
        )}
      </div>
    </Cartao>
  );
}

function LinhaMetrica({
  rotulo,
  valor,
  delta,
  inverso,
}: {
  rotulo: string;
  valor: string;
  delta?: number;
  inverso?: boolean;
}) {
  return (
    <Linha>
      <Celula>{rotulo}</Celula>
      <Celula alinhar="dir" forte>
        {valor}
      </Celula>
      <Celula alinhar="dir">
        {delta !== undefined ? <Delta valor={delta} inverso={inverso} /> : <span className="text-[rgb(var(--muted))]">—</span>}
      </Celula>
    </Linha>
  );
}
