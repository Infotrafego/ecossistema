'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Loader2, RefreshCw } from 'lucide-react';
import type { ResumoSync } from '@/lib/data/sync';
import { fmtNum } from '@/lib/intel';
import { cn } from '@/lib/utils';

const TOM_STATUS: Record<string, string> = {
  success: 'bg-success/10 text-success border-success/30',
  partial: 'bg-attention/10 text-attention border-attention/30',
  error: 'bg-warn/10 text-warn border-warn/30',
  running: 'bg-navy/10 text-navy border-navy/30',
};

const ROTULO_STATUS: Record<string, string> = {
  success: 'sucesso',
  partial: 'parcial',
  error: 'erro',
  running: 'rodando',
};

interface Props {
  cliente: { id: string; nome: string; contaMeta: string | null };
  resumo: ResumoSync;
}

export function SyncView({ cliente, resumo }: Props) {
  const router = useRouter();
  const [rodando, setRodando] = useState(false);
  const [mensagem, setMensagem] = useState<{ ok: boolean; texto: string } | null>(null);

  const contaOk = Boolean(cliente.contaMeta && !cliente.contaMeta.includes('PREENCHER'));

  async function disparar() {
    setRodando(true);
    setMensagem(null);
    try {
      const res = await fetch('/api/sync/meta', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ clientId: cliente.id, adAccountId: cliente.contaMeta }),
      });
      const corpo = (await res.json()) as {
        ok: boolean;
        mensagem?: string;
        resultados?: Array<{ status: string; linhas: number; chamadas: number; erro?: string }>;
      };

      if (!corpo.ok && corpo.mensagem) {
        setMensagem({ ok: false, texto: corpo.mensagem });
      } else {
        const r = corpo.resultados?.[0];
        setMensagem({
          ok: corpo.ok,
          texto: r
            ? `${ROTULO_STATUS[r.status] ?? r.status} · ${fmtNum(r.linhas)} linhas · ${r.chamadas} chamadas à Meta${r.erro ? ` · ${r.erro}` : ''}`
            : 'Sync concluído.',
        });
        router.refresh();
      }
    } catch (e) {
      setMensagem({ ok: false, texto: e instanceof Error ? e.message : String(e) });
    } finally {
      setRodando(false);
    }
  }

  return (
    <div className="space-y-6">
      <header>
        <h1 className="text-xl font-extrabold tracking-tight">Sync Meta Ads</h1>
        <p className="text-sm text-[rgb(var(--muted))] mt-1">
          {cliente.nome} · conta {cliente.contaMeta ?? 'não configurada'}
        </p>
      </header>

      <div className="grid sm:grid-cols-3 gap-3">
        <div className="card">
          <div className="kpi-label">Dias consecutivos OK</div>
          <div
            className={cn(
              'text-2xl font-extrabold tracking-tight mt-1',
              resumo.diasConsecutivosOk >= 7 ? 'text-success' : 'text-attention',
            )}
          >
            {resumo.diasConsecutivosOk}
          </div>
          <div className="text-[10px] text-[rgb(var(--muted))] mt-1">
            critério da fase: 7 dias seguidos sem falha
          </div>
        </div>

        <div className="card">
          <div className="kpi-label">Última execução</div>
          <div className="text-sm font-extrabold mt-1">
            {resumo.ultimo ? formatarData(resumo.ultimo.started_at) : '—'}
          </div>
          <div className="text-[10px] text-[rgb(var(--muted))] mt-1">
            {resumo.ultimo
              ? `${fmtNum(resumo.ultimo.rows_upserted)} linhas · ${resumo.ultimo.api_calls} chamadas`
              : 'nenhuma execução registrada'}
          </div>
        </div>

        <div className="card">
          <div className="kpi-label">Execuções registradas</div>
          <div className="text-2xl font-extrabold tracking-tight mt-1">{resumo.execucoes.length}</div>
          <div className="text-[10px] text-[rgb(var(--muted))] mt-1">últimas 30</div>
        </div>
      </div>

      <div className="card space-y-3">
        <h2 className="text-xs font-extrabold tracking-tight">Disparar manualmente</h2>
        <p className="text-[11px] text-[rgb(var(--muted))]">
          Sincroniza os últimos 7 dias deste cliente. Consome cota da Marketing API — o limite é da
          ordem de 200 chamadas/hora, e o sync para sozinho ao atingir o teto configurado, marcando
          a execução como parcial. Só admin pode disparar.
        </p>

        {!contaOk && (
          <div className="bg-attention-bg border border-attention/40 text-attention rounded-lg p-3 text-[11px]">
            Este cliente ainda não tem <code>meta_ad_account_id</code> preenchido. Sem isso não há o
            que sincronizar.
          </div>
        )}

        <button
          type="button"
          onClick={() => void disparar()}
          disabled={rodando || !contaOk}
          className="px-4 py-2 bg-navy text-white rounded-lg text-xs font-extrabold inline-flex items-center gap-2 hover:bg-navy-soft transition disabled:opacity-50"
        >
          {rodando ? <Loader2 size={13} className="animate-spin" /> : <RefreshCw size={13} />}
          Sincronizar agora
        </button>

        {mensagem && (
          <div
            className={cn(
              'rounded-lg border p-3 text-[11px]',
              mensagem.ok
                ? 'bg-success/10 border-success/30 text-success'
                : 'bg-warn/10 border-warn/30 text-warn',
            )}
          >
            {mensagem.texto}
          </div>
        )}
      </div>

      <section className="card p-0 overflow-hidden">
        <h2 className="text-xs font-extrabold tracking-tight p-3 pb-2">Histórico</h2>
        {resumo.execucoes.length === 0 ? (
          <p className="text-[11px] text-[rgb(var(--muted))] px-3 pb-4">
            Nenhuma execução até agora.
          </p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-[11px]">
              <thead>
                <tr className="text-left text-[9px] uppercase tracking-wider text-[rgb(var(--muted))] font-bold border-y border-[rgb(var(--border))]">
                  <th className="py-2 px-3">Início</th>
                  <th className="py-2 px-2">Status</th>
                  <th className="py-2 px-2">Janela</th>
                  <th className="py-2 px-2 text-right">Entidades</th>
                  <th className="py-2 px-2 text-right">Linhas</th>
                  <th className="py-2 px-2 text-right">Chamadas</th>
                  <th className="py-2 px-2 text-right">Duração</th>
                  <th className="py-2 px-3">Erro</th>
                </tr>
              </thead>
              <tbody>
                {resumo.execucoes.map((e) => (
                  <tr key={e.id} className="border-b border-[rgb(var(--border))] last:border-0">
                    <td className="py-1.5 px-3 whitespace-nowrap">{formatarData(e.started_at)}</td>
                    <td className="py-1.5 px-2">
                      <span
                        className={cn(
                          'px-1.5 py-0.5 rounded border text-[9px] font-bold',
                          TOM_STATUS[e.status],
                        )}
                      >
                        {ROTULO_STATUS[e.status] ?? e.status}
                      </span>
                    </td>
                    <td className="py-1.5 px-2 text-[rgb(var(--muted))] whitespace-nowrap">
                      {e.date_start && e.date_stop ? `${e.date_start} → ${e.date_stop}` : '—'}
                    </td>
                    <td className="py-1.5 px-2 text-right tabular-nums">{fmtNum(e.entities_synced)}</td>
                    <td className="py-1.5 px-2 text-right tabular-nums font-bold">
                      {fmtNum(e.rows_upserted)}
                    </td>
                    <td className="py-1.5 px-2 text-right tabular-nums">{e.api_calls}</td>
                    <td className="py-1.5 px-2 text-right tabular-nums">
                      {e.duration_ms ? `${(e.duration_ms / 1000).toFixed(1)}s` : '—'}
                    </td>
                    <td className="py-1.5 px-3 text-warn max-w-[280px] truncate" title={e.error_message ?? ''}>
                      {e.error_message ?? ''}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </div>
  );
}

function formatarData(iso: string): string {
  const d = new Date(iso);
  return d.toLocaleString('pt-BR', { dateStyle: 'short', timeStyle: 'short' });
}
