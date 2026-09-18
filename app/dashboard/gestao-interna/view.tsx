'use client';

/**
 * Gestão Interna · negócio, pessoas, SOS, financeiro, chamados e onboarding.
 */

import { TriangleAlert } from 'lucide-react';
import { NEGOCIO, SOS, PESSOAS, FINANCEIRO, CHAMADOS, ONBOARDINGS } from '@/data/mock-gestao';
import { Abas, resolverAba, type Aba } from '@/components/mock/abas';
import {
  AvisoMock,
  Barra,
  Cabecalho,
  Cartao,
  ColunaKanban,
  FaixaKpis,
  Kanban,
  Kpi,
  Selo,
  type Tom,
} from '@/components/mock/ui';
import { cn } from '@/lib/utils';

const ABAS: readonly Aba[] = [
  { id: 'negocio', label: 'Visão do Negócio' },
  { id: 'pessoas', label: 'Gestão de Pessoas', contador: PESSOAS.length },
  { id: 'sos', label: 'SOS', contador: SOS.length },
  { id: 'financeiro', label: 'Aprovações Financeiras', contador: FINANCEIRO.pendentes.length },
  { id: 'suporte', label: 'Suporte / Chamados', contador: CHAMADOS[0].cards.length },
  { id: 'onboarding', label: 'Onboarding Cliente', contador: ONBOARDINGS.length },
] as const;

const TOM_BADGE: Record<string, Tom> = { ok: 'ok', atencao: 'atencao', risco: 'ruim' };

export function GestaoView({ tab }: { tab?: string }) {
  const atual = resolverAba(ABAS, tab);

  return (
    <div className="space-y-5">
      <Cabecalho
        titulo="Gestão Interna"
        subtitulo="Infotráfego · 7 clientes · 12 colaboradores"
      />

      <AvisoMock fase="Gestão Interna">
        Dados fictícios. A fase prevê ligar folha, ferramentas e chamados a fontes reais — aqui só a
        estrutura das telas está definida.
      </AvisoMock>

      <Abas abas={ABAS} atual={atual} />

      {atual === 'negocio' && <Negocio />}
      {atual === 'pessoas' && <Pessoas />}
      {atual === 'sos' && <Sos />}
      {atual === 'financeiro' && <Financeiro />}
      {atual === 'suporte' && <Suporte />}
      {atual === 'onboarding' && <Onboarding />}
    </div>
  );
}

function Negocio() {
  return (
    <div className="space-y-4">
      <FaixaKpis>
        {NEGOCIO.kpis.map((k, i) => (
          <Kpi key={k.rotulo} rotulo={k.rotulo} valor={k.valor} destaque={i === 1} />
        ))}
      </FaixaKpis>

      {SOS.length > 0 && (
        <div className="rounded-lg border border-warn/40 bg-warn/5 p-3.5 flex gap-3">
          <TriangleAlert size={18} className="text-warn shrink-0 mt-0.5" />
          <div>
            <div className="text-[12px] font-extrabold text-warn">⚠ SOS · {SOS[0].titulo}</div>
            <p className="text-[11px] text-[rgb(var(--muted))] mt-1 leading-relaxed">{SOS[0].descricao}</p>
          </div>
        </div>
      )}

      <div className="grid lg:grid-cols-2 gap-3">
        <Cartao titulo={FINANCEIRO.receita.titulo}>
          <LinhasFinanceiras linhas={FINANCEIRO.receita.linhas} />
        </Cartao>
        <Cartao titulo={FINANCEIRO.despesas.titulo}>
          <LinhasFinanceiras linhas={FINANCEIRO.despesas.linhas} />
        </Cartao>
      </div>
    </div>
  );
}

function Pessoas() {
  return (
    <Cartao titulo="Time interno" meta={`${PESSOAS.length} pessoas · função · alocação`}>
      <div className="grid sm:grid-cols-2 xl:grid-cols-4 gap-3">
        {PESSOAS.map((p) => (
          <div
            key={p.nome}
            className={cn(
              'rounded-lg border p-3',
              p.tom === 'risco'
                ? 'border-warn/40 bg-warn/5'
                : p.tom === 'atencao'
                  ? 'border-attention/40'
                  : 'border-[rgb(var(--border))]',
            )}
          >
            <div className="text-[12px] font-extrabold">{p.nome}</div>
            <div className="text-[10px] text-[rgb(var(--muted))]">{p.funcao}</div>

            <div className="grid grid-cols-2 gap-2 mt-2.5">
              {p.stats.map((s) => (
                <div key={s.rotulo}>
                  <div className="text-[9px] uppercase tracking-wider text-[rgb(var(--muted))] font-bold">
                    {s.rotulo}
                  </div>
                  <div className="text-[13px] font-extrabold">{s.valor}</div>
                </div>
              ))}
            </div>

            <div className="mt-2.5">
              <Selo tom={TOM_BADGE[p.tom]}>{p.badge}</Selo>
            </div>
          </div>
        ))}
      </div>
    </Cartao>
  );
}

function Sos() {
  return (
    <div className="space-y-3">
      {SOS.map((s) => (
        <Cartao key={s.titulo} className="border-warn/40">
          <div className="flex items-start gap-3">
            <TriangleAlert size={18} className="text-warn shrink-0 mt-0.5" />
            <div className="flex-1">
              <div className="text-[13px] font-extrabold text-warn">{s.titulo}</div>
              <p className="text-[11px] mt-1.5 leading-relaxed">{s.descricao}</p>
              <div className="text-[10px] text-[rgb(var(--muted))] mt-2">
                Aberto em {s.abertoEm} · responsável {s.responsavel}
              </div>
            </div>
          </div>
        </Cartao>
      ))}

      <p className="text-[10px] text-[rgb(var(--muted))] leading-relaxed">
        O SOS é o canal de escalada interna: entra aqui o que não cabe em chamado nem em 1:1 e precisa
        de decisão de sócio dentro da semana.
      </p>
    </div>
  );
}

function LinhasFinanceiras({
  linhas,
}: {
  linhas: Array<{ rotulo: string; valor: string; tom: Tom; forte?: boolean }>;
}) {
  return (
    <div className="space-y-1.5">
      {linhas.map((l) => (
        <div
          key={l.rotulo}
          className={cn(
            'flex items-baseline justify-between gap-3 text-[11px] py-1.5 border-b border-[rgb(var(--border))] last:border-0',
            l.forte && 'font-extrabold border-t border-t-[rgb(var(--border))] pt-2 mt-1',
          )}
        >
          <span>{l.rotulo}</span>
          <span
            className={cn(
              'tabular-nums font-bold',
              l.tom === 'ok' ? 'text-success' : l.tom === 'atencao' ? 'text-attention' : '',
            )}
          >
            {l.valor}
          </span>
        </div>
      ))}
    </div>
  );
}

function Financeiro() {
  return (
    <div className="space-y-4">
      <div className="grid lg:grid-cols-2 gap-3">
        <Cartao titulo={FINANCEIRO.receita.titulo}>
          <LinhasFinanceiras linhas={FINANCEIRO.receita.linhas} />
        </Cartao>
        <Cartao titulo={FINANCEIRO.despesas.titulo}>
          <LinhasFinanceiras linhas={FINANCEIRO.despesas.linhas} />
        </Cartao>
      </div>

      <Cartao titulo="Aguardando aprovação" meta={`${FINANCEIRO.pendentes.length} item(ns)`}>
        <div className="space-y-2">
          {FINANCEIRO.pendentes.map((p) => (
            <div
              key={p.item}
              className="rounded-md border border-attention/40 p-2.5 flex items-start justify-between gap-3 flex-wrap"
            >
              <div>
                <div className="text-[12px] font-extrabold">{p.item}</div>
                <div className="text-[10px] text-[rgb(var(--muted))]">
                  Solicitado por {p.solicitante} em {p.em}
                </div>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-[13px] font-extrabold text-attention">{p.valor}</span>
                <button
                  type="button"
                  className="px-2.5 py-1 bg-navy text-white rounded-md text-[10px] font-extrabold hover:bg-navy-soft transition"
                >
                  Aprovar
                </button>
                <button
                  type="button"
                  className="px-2.5 py-1 border border-[rgb(var(--border))] rounded-md text-[10px] font-extrabold hover:border-warn/40 transition"
                >
                  Recusar
                </button>
              </div>
            </div>
          ))}
        </div>
      </Cartao>
    </div>
  );
}

function Suporte() {
  const total = CHAMADOS.reduce((s, c) => s + c.cards.length, 0);

  return (
    <Cartao titulo="Chamados" meta={`${total} no quadro`}>
      <Kanban>
        {CHAMADOS.map((col) => (
          <ColunaKanban key={col.coluna} titulo={col.coluna} total={col.cards.length}>
            {col.cards.map((c) => (
              <div
                key={c.titulo}
                className={cn(
                  'rounded-md border p-2.5 bg-[rgb(var(--bg))]',
                  c.tom === 'alta'
                    ? 'border-warn/40'
                    : c.tom === 'media'
                      ? 'border-attention/40'
                      : c.tom === 'ok'
                        ? 'border-success/30'
                        : 'border-[rgb(var(--border))]',
                )}
              >
                <div className="text-[11px] font-bold">{c.titulo}</div>
                <div className="text-[9px] text-[rgb(var(--muted))] mt-1">{c.meta}</div>
              </div>
            ))}
          </ColunaKanban>
        ))}
      </Kanban>
    </Cartao>
  );
}

function Onboarding() {
  return (
    <div className="grid md:grid-cols-2 gap-3">
      {ONBOARDINGS.map((o) => (
        <Cartao key={o.cliente} titulo={`${o.cliente} · Onboarding`} meta={`Etapa ${o.etapaAtual}/${o.totalEtapas}`}>
          <div className="text-[11px] font-bold mb-2">{o.etapaNome}</div>
          <Barra pct={(o.etapaAtual / o.totalEtapas) * 100} />
          <div className="flex flex-wrap gap-x-3 gap-y-1 mt-3 text-[10px]">
            {o.etapas.map((e, i) => {
              const feito = i + 1 < o.etapaAtual;
              const atual = i + 1 === o.etapaAtual;
              return (
                <span
                  key={e}
                  className={cn(
                    feito ? 'text-success font-bold' : atual ? 'text-navy font-extrabold' : 'text-[rgb(var(--muted))]',
                  )}
                >
                  {feito ? '✓' : atual ? '◐' : '○'} {e}
                </span>
              );
            })}
          </div>
        </Cartao>
      ))}
    </div>
  );
}
