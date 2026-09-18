'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Copy, Loader2, Sparkles } from 'lucide-react';
import type { VariacaoCopy } from '@/lib/claude/analises';
import type { CopySugestao } from '@/types/database';
import { cn } from '@/lib/utils';

interface Props {
  clienteId: string;
  clienteNome: string;
  funilId: string | null;
  periodo: { desde: string; ate: string };
  historico: CopySugestao[];
}

export function CopyView({ clienteId, clienteNome, funilId, periodo, historico }: Props) {
  const router = useRouter();
  const [nicho, setNicho] = useState('');
  const [publico, setPublico] = useState('');
  const [oferta, setOferta] = useState('');
  const [quantidade, setQuantidade] = useState(3);
  const [variacoes, setVariacoes] = useState<VariacaoCopy[] | null>(null);
  const [carregando, setCarregando] = useState(false);
  const [erro, setErro] = useState<string | null>(null);

  async function gerar() {
    setCarregando(true);
    setErro(null);
    try {
      const res = await fetch('/api/ia/copy', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({
          clientId: clienteId,
          funilId,
          nicho,
          publico,
          oferta,
          quantidade,
          ...periodo,
        }),
      });
      const corpo = (await res.json()) as {
        ok: boolean;
        variacoes?: VariacaoCopy[];
        mensagem?: string;
      };
      if (!corpo.ok) throw new Error(corpo.mensagem ?? 'Falha ao gerar.');
      setVariacoes(corpo.variacoes ?? []);
      router.refresh();
    } catch (e) {
      setErro(e instanceof Error ? e.message : String(e));
    } finally {
      setCarregando(false);
    }
  }

  const podeGerar = nicho.trim() && publico.trim() && oferta.trim() && !carregando;

  return (
    <div className="space-y-6">
      <header>
        <h1 className="text-xl font-extrabold tracking-tight">Sugestões de Copy IA</h1>
        <p className="text-sm text-[rgb(var(--muted))] mt-1">
          {clienteNome} · variações ancoradas nos criativos que já performaram no período
        </p>
      </header>

      <section className="card space-y-3">
        <div className="grid sm:grid-cols-3 gap-3">
          <Campo label="Nicho">
            <input
              value={nicho}
              onChange={(e) => setNicho(e.target.value)}
              placeholder="ex: agência de tráfego pago B2B"
              className="input-wizard"
            />
          </Campo>
          <Campo label="Público">
            <input
              value={publico}
              onChange={(e) => setPublico(e.target.value)}
              placeholder="ex: donos de agência faturando 50–200k/mês"
              className="input-wizard"
            />
          </Campo>
          <Campo label="Oferta">
            <input
              value={oferta}
              onChange={(e) => setOferta(e.target.value)}
              placeholder="ex: diagnóstico gratuito de funil"
              className="input-wizard"
            />
          </Campo>
        </div>

        <div className="flex items-end gap-3 flex-wrap">
          <Campo label="Variações">
            <input
              type="number"
              min={3}
              max={8}
              value={quantidade}
              onChange={(e) => setQuantidade(Number(e.target.value))}
              className="input-wizard w-20"
            />
          </Campo>
          <button
            type="button"
            onClick={() => void gerar()}
            disabled={!podeGerar}
            className="px-4 py-2 bg-navy text-white rounded-lg text-xs font-extrabold inline-flex items-center gap-1.5 hover:bg-navy-soft transition disabled:opacity-50"
          >
            {carregando ? <Loader2 size={13} className="animate-spin" /> : <Sparkles size={13} />}
            Gerar variações
          </button>
          <p className="text-[10px] text-[rgb(var(--muted))] flex-1 min-w-[240px]">
            Mínimo de 3 variações, cada uma com um ângulo diferente. O prompt proíbe promessa de
            resultado garantido e claims que violam a política de anúncios da Meta — revise mesmo
            assim antes de subir.
          </p>
        </div>

        {erro && (
          <div className="bg-warn/10 border border-warn/30 text-warn rounded-lg p-3 text-[11px]">
            {erro}
          </div>
        )}
      </section>

      {variacoes && variacoes.length > 0 && (
        <section className="space-y-3">
          <h2 className="text-xs uppercase tracking-wider font-bold text-[rgb(var(--muted))]">
            {variacoes.length} variações geradas
          </h2>
          <div className="grid md:grid-cols-2 xl:grid-cols-3 gap-3">
            {variacoes.map((v, i) => (
              <CartaoVariacao key={i} variacao={v} indice={i + 1} />
            ))}
          </div>
        </section>
      )}

      {historico.length > 0 && (
        <section className="space-y-2">
          <h2 className="text-xs uppercase tracking-wider font-bold text-[rgb(var(--muted))]">
            Solicitações anteriores
          </h2>
          <div className="space-y-2">
            {historico.map((h) => {
              const briefing = h.briefing as { nicho?: string; publico?: string; oferta?: string };
              return (
                <details key={h.id} className="card">
                  <summary className="cursor-pointer text-[11px] font-bold flex items-center gap-2 flex-wrap">
                    <span>{new Date(h.created_at).toLocaleString('pt-BR', { dateStyle: 'short', timeStyle: 'short' })}</span>
                    <span className="text-[rgb(var(--muted))] font-normal truncate">
                      {briefing.oferta ?? '—'} · {briefing.publico ?? '—'}
                    </span>
                    <span className="text-[9px] text-[rgb(var(--muted))] ml-auto">
                      {h.variacoes.length} variações · {h.modelo}
                      {h.do_cache && ' · cache'}
                    </span>
                  </summary>
                  <div className="grid md:grid-cols-2 xl:grid-cols-3 gap-3 mt-3">
                    {(h.variacoes as unknown as VariacaoCopy[]).map((v, i) => (
                      <CartaoVariacao key={i} variacao={v} indice={i + 1} />
                    ))}
                  </div>
                </details>
              );
            })}
          </div>
        </section>
      )}
    </div>
  );
}

function CartaoVariacao({ variacao, indice }: { variacao: VariacaoCopy; indice: number }) {
  const [copiado, setCopiado] = useState(false);

  const texto = `${variacao.headline}\n\n${variacao.primaryText}\n\nCTA: ${variacao.cta}`;

  async function copiar() {
    try {
      await navigator.clipboard.writeText(texto);
      setCopiado(true);
      setTimeout(() => setCopiado(false), 1500);
    } catch {
      // Clipboard bloqueado (contexto inseguro): o texto continua selecionável.
    }
  }

  return (
    <article className="card space-y-2">
      <div className="flex items-center justify-between gap-2">
        <span className="text-[9px] uppercase tracking-wider font-extrabold text-navy">
          {indice}. {variacao.angulo}
        </span>
        <button
          type="button"
          onClick={() => void copiar()}
          title="Copiar"
          className={cn(
            'p-1 rounded border transition',
            copiado
              ? 'border-success text-success'
              : 'border-[rgb(var(--border))] text-[rgb(var(--muted))] hover:border-navy',
          )}
        >
          <Copy size={11} />
        </button>
      </div>
      <h3 className="text-xs font-extrabold leading-snug">{variacao.headline}</h3>
      <p className="text-[11px] leading-relaxed whitespace-pre-line">{variacao.primaryText}</p>
      <div className="text-[10px] font-bold text-[rgb(var(--muted))] pt-1 border-t border-[rgb(var(--border))]">
        CTA: {variacao.cta}
      </div>
    </article>
  );
}

function Campo({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="block">
      <span className="text-[9px] uppercase tracking-wider font-bold text-[rgb(var(--muted))]">
        {label}
      </span>
      <div className="mt-1">{children}</div>
    </label>
  );
}
