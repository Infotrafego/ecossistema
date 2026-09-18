/**
 * Debriefings (Fase 6)
 *
 * Lista dos debriefings por cliente. O documento completo — 9 seções, da capa
 * ao anexo metodológico — fica em `/dashboard/debriefings/[id]`.
 *
 * Front-end mockado (`data/mock-debriefings.ts`).
 */

import Link from 'next/link';
import { FileText, Plus } from 'lucide-react';
import { DEBRIEFINGS } from '@/data/mock-debriefings';
import { AvisoMock, Cabecalho, Cartao, Selo, type Tom } from '@/components/mock/ui';
import { cn } from '@/lib/utils';

export const dynamic = 'force-dynamic';

const STATUS: Record<string, { label: string; tom: Tom }> = {
  publicado: { label: 'Publicado', tom: 'ok' },
  revisao: { label: 'Em revisão', tom: 'atencao' },
  gerando: { label: 'Gerando', tom: 'neutro' },
};

export default function DebriefingsPage() {
  return (
    <div className="space-y-5">
      <Cabecalho
        titulo="Debriefings"
        subtitulo={`${DEBRIEFINGS.length} debriefings · gerador automático com revisão humana`}
        acoes={
          <button
            type="button"
            className="px-3 py-2 bg-navy text-white rounded-lg text-xs font-extrabold inline-flex items-center gap-1.5 hover:bg-navy-soft transition"
          >
            <Plus size={13} /> Novo debriefing
          </button>
        }
      />

      <AvisoMock fase="Debriefings">
        O documento do lançamento 20 em 20 está completo como referência visual. Os outros dois são
        cascas — a geração a partir dos dados do Supabase entra com a fase.
      </AvisoMock>

      <div className="grid md:grid-cols-2 xl:grid-cols-3 gap-3">
        {DEBRIEFINGS.map((d) => {
          const st = STATUS[d.status];
          const conteudo = (
            <>
              <div className="flex items-start justify-between gap-2">
                <div>
                  <div className="text-[10px] uppercase tracking-wider font-extrabold text-[rgb(var(--muted))]">
                    {d.cliente}
                  </div>
                  <div className="text-[13px] font-extrabold tracking-tight mt-0.5">{d.titulo}</div>
                </div>
                <Selo tom={st.tom}>{st.label}</Selo>
              </div>

              <div className="flex gap-1.5 mt-2">
                <Selo tom="neutro">{d.tipo}</Selo>
                <Selo tom="neutro">{d.edicao}</Selo>
              </div>

              <p className="text-[10px] text-[rgb(var(--muted))] mt-2">{d.periodo}</p>

              <div className="grid grid-cols-3 gap-2 mt-3 pt-3 border-t border-[rgb(var(--border))]">
                <div>
                  <div className="kpi-label">Invest.</div>
                  <div className="text-[13px] font-extrabold">{d.investimento}</div>
                </div>
                <div>
                  <div className="kpi-label">Faturam.</div>
                  <div className="text-[13px] font-extrabold">{d.faturamento}</div>
                </div>
                <div>
                  <div className="kpi-label">ROAS</div>
                  <div className="text-[13px] font-extrabold text-success">{d.roas}</div>
                </div>
              </div>

              <div className="text-[9px] text-[rgb(var(--muted))] mt-3">
                {d.publicadoEm ? `Publicado em ${d.publicadoEm}` : 'Ainda não publicado'}
                {d.revisor && ` · revisor ${d.revisor}`}
              </div>

              {d.completo && (
                <span className="text-[10px] text-navy font-extrabold mt-2 inline-flex items-center gap-1 group-hover:underline">
                  <FileText size={11} /> Abrir documento →
                </span>
              )}
            </>
          );

          return d.completo ? (
            <Link
              key={d.id}
              href={`/dashboard/debriefings/${d.id}`}
              className="card hover:border-navy transition group"
            >
              {conteudo}
            </Link>
          ) : (
            <div key={d.id} className={cn('card', 'opacity-75')}>
              {conteudo}
            </div>
          );
        })}
      </div>
    </div>
  );
}
