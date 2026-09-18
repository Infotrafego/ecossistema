/**
 * Insights & Benchmarks
 *
 * Leitura de conta que a Marketing API já expõe (opportunity score, ranking de
 * leilão, benchmarks de indústria) mais as anomalias da camada de IA. Fecha a
 * pergunta que o dashboard sozinho não responde: "isso é bom pro meu mercado?".
 *
 * Front-end mockado (`data/mock-benchmarks.ts`).
 */

import {
  ANOMALIAS,
  AUCTION_RANKING,
  BENCHMARKS,
  GLOSSARIO,
  OPPORTUNITY,
} from '@/data/mock-benchmarks';
import { AvisoMock, Barra, Cabecalho, Cartao, Selo } from '@/components/mock/ui';
import { cn } from '@/lib/utils';

export const dynamic = 'force-dynamic';

export default function BenchmarksPage() {
  return (
    <div className="space-y-5">
      <Cabecalho
        titulo="Insights & Benchmarks"
        subtitulo={`Conta ${OPPORTUNITY.conta} · comparativo com a indústria`}
      />

      <AvisoMock fase="Insights & Benchmarks">
        Números fictícios. Opportunity score, auction ranking e benchmarks vêm de endpoints da
        Marketing API que ainda não estão no sync — o layout já está no formato final.
      </AvisoMock>

      <Cartao titulo="Opportunity Score" meta="12 sinais da conta">
        <div className="flex items-baseline gap-3">
          <span className="text-5xl font-extrabold tracking-tight text-navy">{OPPORTUNITY.score}</span>
          <span className="text-[13px] text-[rgb(var(--muted))]">/100 · {OPPORTUNITY.rotulo}</span>
        </div>
        <div className="mt-3">
          <Barra pct={OPPORTUNITY.score} tom={OPPORTUNITY.score >= 70 ? 'ok' : 'atencao'} />
        </div>
        <p className="text-[11px] text-[rgb(var(--muted))] mt-2 leading-relaxed">{OPPORTUNITY.descricao}</p>

        <div className="grid sm:grid-cols-2 xl:grid-cols-4 gap-2 mt-3">
          {OPPORTUNITY.itens.map((i) => (
            <div
              key={i.texto}
              className={cn(
                'rounded-md border px-2.5 py-2 text-[11px] font-bold',
                i.ok ? 'border-success/30 bg-success/5 text-success' : 'border-attention/30 bg-attention/5 text-attention',
              )}
            >
              {i.ok ? '✓' : '⚠'} {i.texto}
            </div>
          ))}
        </div>
      </Cartao>

      <Cartao titulo="Industry Benchmarks" meta="vs média do setor">
        <div className="grid sm:grid-cols-2 xl:grid-cols-3 gap-3">
          {BENCHMARKS.map((b) => (
            <div key={b.rotulo} className="rounded-lg border border-[rgb(var(--border))] p-3">
              <div className="text-2xl font-extrabold tracking-tight">{b.valor}</div>
              <div className="kpi-label mt-0.5">{b.rotulo}</div>
              <div
                className={cn(
                  'text-[10px] font-bold mt-1.5',
                  b.tom === 'ok' ? 'text-success' : b.tom === 'ruim' ? 'text-warn' : 'text-[rgb(var(--muted))]',
                )}
              >
                {b.comparativo}
              </div>
            </div>
          ))}
        </div>
      </Cartao>

      <Cartao titulo="Anomalias detectadas · IA" meta={`${ANOMALIAS.length} sinais`}>
        <div className="space-y-2.5">
          {ANOMALIAS.map((a) => (
            <div
              key={a.titulo}
              className={cn(
                'rounded-md border p-3',
                a.severidade === 'critica' ? 'border-warn/40 bg-warn/5' : 'border-[rgb(var(--border))]',
              )}
            >
              <div className="flex items-start justify-between gap-2">
                <span className="text-[12px] font-extrabold">{a.titulo}</span>
                <Selo tom={a.severidade === 'critica' ? 'ruim' : 'atencao'}>{a.severidade}</Selo>
              </div>
              <p className="text-[11px] text-[rgb(var(--muted))] mt-1 leading-relaxed">{a.descricao}</p>
              <p className="text-[11px] font-bold mt-1.5">→ {a.acao}</p>
            </div>
          ))}
        </div>
      </Cartao>

      <Cartao titulo="Auction Ranking" meta="posição relativa nos leilões">
        <div className="grid sm:grid-cols-3 gap-3">
          {AUCTION_RANKING.map((r) => (
            <div key={r.rotulo} className="rounded-lg border border-[rgb(var(--border))] p-3">
              <div className="text-xl font-extrabold tracking-tight">{r.valor}</div>
              <div className="kpi-label mt-0.5">{r.rotulo}</div>
              <div
                className={cn(
                  'text-[10px] font-bold mt-1',
                  r.tom === 'ok' ? 'text-success' : 'text-[rgb(var(--muted))]',
                )}
              >
                {r.comparativo}
              </div>
            </div>
          ))}
        </div>
      </Cartao>

      <Cartao titulo="Glossário de métricas">
        <dl className="grid sm:grid-cols-2 lg:grid-cols-3 gap-x-6 gap-y-1.5 text-[11px]">
          {GLOSSARIO.map((g) => (
            <div key={g.termo} className="flex gap-1.5">
              <dt className="font-extrabold shrink-0">{g.termo}</dt>
              <dd className="text-[rgb(var(--muted))]">· {g.texto}</dd>
            </div>
          ))}
        </dl>
      </Cartao>
    </div>
  );
}
