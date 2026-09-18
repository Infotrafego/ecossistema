'use client';

/**
 * Análise estratégica dos criativos campeões · sob demanda
 *
 * O botão é deliberado: a análise custa token e a fase roda em free tier.
 * Rodar sozinha no load transformaria cada abertura de aba num gasto. Com
 * cache de 24h, o segundo clique do dia devolve a mesma resposta sem custo —
 * e a etiqueta "do cache" deixa isso visível em vez de escondido.
 */

import { useState } from 'react';
import { Loader2, Sparkles } from 'lucide-react';
import type { Metricas } from '@/lib/intel';
import type { AnaliseCriativo } from '@/lib/claude/analises';

interface Props {
  clienteId: string;
  criativos: Metricas[];
  periodo: { desde: string; ate: string };
  funilId?: string | null;
}

export function AnaliseCriativosIA({ clienteId, criativos, periodo, funilId = null }: Props) {
  const [analises, setAnalises] = useState<AnaliseCriativo[] | null>(null);
  const [carregando, setCarregando] = useState(false);
  const [erro, setErro] = useState<string | null>(null);
  const [doCache, setDoCache] = useState(false);

  const porId = new Map(criativos.map((c) => [c.id, c]));

  async function gerar() {
    setCarregando(true);
    setErro(null);
    try {
      const res = await fetch('/api/ia/analise-criativos', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ clientId: clienteId, funilId, ...periodo }),
      });
      const corpo = (await res.json()) as {
        ok: boolean;
        analises?: AnaliseCriativo[];
        doCache?: boolean;
        mensagem?: string;
      };
      if (!corpo.ok) throw new Error(corpo.mensagem ?? 'Falha na análise.');
      setAnalises(corpo.analises ?? []);
      setDoCache(Boolean(corpo.doCache));
    } catch (e) {
      setErro(e instanceof Error ? e.message : String(e));
    } finally {
      setCarregando(false);
    }
  }

  if (criativos.length === 0) return null;

  return (
    <section className="space-y-3">
      <div className="flex items-center gap-3 flex-wrap">
        <h2 className="text-xs uppercase tracking-wider font-bold text-[rgb(var(--muted))]">
          ▣ Análise estratégica · Top {criativos.length} campeões
        </h2>
        <button
          type="button"
          onClick={() => void gerar()}
          disabled={carregando}
          className="px-3 py-1.5 rounded-lg bg-navy text-white text-[11px] font-extrabold inline-flex items-center gap-1.5 hover:bg-navy-soft transition disabled:opacity-60"
        >
          {carregando ? <Loader2 size={12} className="animate-spin" /> : <Sparkles size={12} />}
          {analises ? 'Gerar de novo' : 'Gerar análise (IA)'}
        </button>
        {doCache && (
          <span className="text-[10px] text-[rgb(var(--muted))]">
            resposta do cache · sem custo novo
          </span>
        )}
      </div>

      {erro && (
        <div className="bg-warn/10 border border-warn/30 text-warn rounded-lg p-3 text-[11px]">
          {erro}
        </div>
      )}

      {!analises && !carregando && !erro && (
        <p className="text-[11px] text-[rgb(var(--muted))]">
          A análise lê os números do período e devolve ângulo, motivo e próximo passo de cada
          campeão. Roda só quando você pede — a fase opera em free tier.
        </p>
      )}

      {analises && analises.length === 0 && (
        <p className="text-[11px] text-[rgb(var(--muted))]">
          A IA não conseguiu associar a resposta aos criativos do período. Tente de novo.
        </p>
      )}

      {analises && analises.length > 0 && (
        <div className="grid md:grid-cols-2 xl:grid-cols-3 gap-3">
          {analises.map((a) => (
            <article key={a.id} className="card space-y-2.5">
              <h3 className="text-xs font-extrabold truncate" title={porId.get(a.id)?.nome ?? a.id}>
                {porId.get(a.id)?.nome ?? a.id}
              </h3>
              <Bloco titulo="Ângulo" texto={a.angulo} />
              <Bloco titulo="Por que funciona" texto={a.porque} />
              <Bloco titulo="Próximo passo" texto={a.proximoPasso} destaque />
            </article>
          ))}
        </div>
      )}
    </section>
  );
}

function Bloco({ titulo, texto, destaque = false }: { titulo: string; texto: string; destaque?: boolean }) {
  return (
    <div>
      <div className="text-[9px] uppercase tracking-wider font-bold text-[rgb(var(--muted))]">
        {titulo}
      </div>
      <p className={destaque ? 'text-[11px] font-bold text-navy mt-0.5' : 'text-[11px] mt-0.5'}>
        {texto}
      </p>
    </div>
  );
}
