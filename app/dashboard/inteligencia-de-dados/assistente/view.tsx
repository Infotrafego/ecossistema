'use client';

/**
 * Chat do assistente.
 *
 * O fluxo é deliberadamente de DOIS passos: interpretar → confirmar. Um
 * assistente que executa direto o que entendeu de uma frase em português estaria
 * mexendo em verba de cliente com base numa inferência — e nem o gestor nem o
 * modelo têm como revisar isso depois que a entrega já parou.
 */

import { useRef, useState } from 'react';
import { AlertTriangle, Loader2, Send } from 'lucide-react';
import { fmtMoeda } from '@/lib/intel';
import { cn } from '@/lib/utils';

interface Alvo {
  metaId: string;
  nome: string;
  campanha: string;
  valorMetrica: number | null;
  spend: number;
}

interface AcaoComAlvos {
  acaoId: string;
  rotulo: string;
  destrutiva: boolean;
  justificativa: string;
  percentual?: number;
  filtro: { metrica?: string };
  alvos: Alvo[];
}

interface Turno {
  comando: string;
  entendimento: string;
  duvida: string | null;
  acoes: AcaoComAlvos[];
  executado?: { ok: number; falhou: number };
}

const EXEMPLOS = [
  'pausa os criativos com frequência acima de 3,5',
  'quais públicos estão com CPL acima de 60?',
  'reduz 30% o orçamento das campanhas com CPC acima de 4',
  'pausa os 3 anúncios que mais gastaram sem gerar lead',
];

interface Props {
  clienteId: string;
  clienteNome: string;
  periodo: { desde: string; ate: string };
}

export function AssistenteView({ clienteId, clienteNome, periodo }: Props) {
  const [comando, setComando] = useState('');
  const [turnos, setTurnos] = useState<Turno[]>([]);
  const [carregando, setCarregando] = useState(false);
  const [erro, setErro] = useState<string | null>(null);
  const [executando, setExecutando] = useState<number | null>(null);
  const threadId = useRef<string | undefined>(undefined);

  async function enviar(texto: string) {
    if (!texto.trim() || carregando) return;
    setCarregando(true);
    setErro(null);
    try {
      const res = await fetch('/api/ia/assistente', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({
          clientId: clienteId,
          comando: texto,
          threadId: threadId.current,
          ...periodo,
        }),
      });
      const corpo = (await res.json()) as {
        ok: boolean;
        mensagem?: string;
        threadId?: string;
        entendimento?: string;
        duvida?: string | null;
        acoes?: AcaoComAlvos[];
      };
      if (!corpo.ok) throw new Error(corpo.mensagem ?? 'Falha ao interpretar.');

      threadId.current = corpo.threadId;
      setTurnos((t) => [
        ...t,
        {
          comando: texto,
          entendimento: corpo.entendimento ?? '',
          duvida: corpo.duvida ?? null,
          acoes: corpo.acoes ?? [],
        },
      ]);
      setComando('');
    } catch (e) {
      setErro(e instanceof Error ? e.message : String(e));
    } finally {
      setCarregando(false);
    }
  }

  async function confirmar(indiceTurno: number) {
    const turno = turnos[indiceTurno];
    setExecutando(indiceTurno);
    let ok = 0;
    let falhou = 0;

    try {
      for (const acao of turno.acoes) {
        for (const alvo of acao.alvos) {
          const res = await fetch('/api/acoes', {
            method: 'POST',
            headers: { 'content-type': 'application/json' },
            body: JSON.stringify({
              clientId: clienteId,
              acaoId: acao.acaoId,
              entityMetaId: alvo.metaId,
              entityNome: alvo.nome,
              params: acao.percentual !== undefined ? { percentual: acao.percentual } : {},
            }),
          });
          const corpo = (await res.json()) as { ok: boolean };
          if (corpo.ok) ok++;
          else falhou++;
        }
      }
      setTurnos((t) =>
        t.map((x, i) => (i === indiceTurno ? { ...x, executado: { ok, falhou } } : x)),
      );
    } finally {
      setExecutando(null);
    }
  }

  return (
    <div className="space-y-6 max-w-4xl">
      <header>
        <h1 className="text-xl font-extrabold tracking-tight">Assistente IA</h1>
        <p className="text-sm text-[rgb(var(--muted))] mt-1">
          {clienteNome} · peça em português; o assistente traduz para ações da Marketing API e
          mostra os alvos antes de executar
        </p>
      </header>

      {turnos.length === 0 && (
        <section className="card space-y-2">
          <h2 className="text-xs font-extrabold tracking-tight">Exemplos</h2>
          <div className="flex flex-wrap gap-2">
            {EXEMPLOS.map((ex) => (
              <button
                key={ex}
                type="button"
                onClick={() => void enviar(ex)}
                className="px-2.5 py-1.5 rounded-lg border border-[rgb(var(--border))] text-[11px] font-bold hover:border-navy/40 transition"
              >
                {ex}
              </button>
            ))}
          </div>
          <p className="text-[10px] text-[rgb(var(--muted))]">
            O assistente nunca executa direto: ele descreve o que entendeu, resolve quais itens
            casam com o filtro e espera sua confirmação.
          </p>
        </section>
      )}

      <div className="space-y-4">
        {turnos.map((turno, i) => (
          <article key={i} className="space-y-3">
            <div className="flex justify-end">
              <div className="bg-navy text-white rounded-xl rounded-tr-sm px-3.5 py-2 max-w-[80%] text-[12px]">
                {turno.comando}
              </div>
            </div>

            <div className="card space-y-3">
              <p className="text-[12px]">{turno.entendimento || turno.duvida}</p>

              {turno.duvida && turno.acoes.length === 0 && (
                <p className="text-[11px] text-attention font-bold">{turno.duvida}</p>
              )}

              {turno.acoes.map((acao, j) => (
                <div key={j} className="border border-[rgb(var(--border))] rounded-lg p-3 space-y-2">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="text-[10px] font-extrabold uppercase tracking-wider text-navy">
                      {acao.rotulo}
                    </span>
                    {acao.destrutiva && (
                      <span className="text-[9px] font-extrabold text-warn inline-flex items-center gap-1">
                        <AlertTriangle size={10} /> altera a conta
                      </span>
                    )}
                    <span className="text-[10px] text-[rgb(var(--muted))] ml-auto">
                      {acao.alvos.length} alvo(s)
                    </span>
                  </div>

                  <p className="text-[11px] text-[rgb(var(--muted))]">{acao.justificativa}</p>

                  {acao.alvos.length === 0 ? (
                    <p className="text-[11px] text-attention">
                      Nenhum item do período casa com esse filtro. Nada seria alterado.
                    </p>
                  ) : (
                    <div className="max-h-56 overflow-y-auto">
                      <table className="w-full text-[11px]">
                        <thead>
                          <tr className="text-left text-[9px] uppercase tracking-wider text-[rgb(var(--muted))] font-bold border-b border-[rgb(var(--border))]">
                            <th className="py-1.5 pr-2">Item</th>
                            <th className="py-1.5 px-2">Campanha</th>
                            {acao.filtro.metrica && (
                              <th className="py-1.5 px-2 text-right">{acao.filtro.metrica}</th>
                            )}
                            <th className="py-1.5 pl-2 text-right">Investido</th>
                          </tr>
                        </thead>
                        <tbody>
                          {acao.alvos.map((alvo) => (
                            <tr
                              key={alvo.metaId}
                              className="border-b border-[rgb(var(--border))] last:border-0"
                            >
                              <td className="py-1.5 pr-2 font-bold truncate max-w-[220px]" title={alvo.nome}>
                                {alvo.nome}
                              </td>
                              <td
                                className="py-1.5 px-2 text-[rgb(var(--muted))] truncate max-w-[160px]"
                                title={alvo.campanha}
                              >
                                {alvo.campanha}
                              </td>
                              {acao.filtro.metrica && (
                                <td className="py-1.5 px-2 text-right tabular-nums">
                                  {alvo.valorMetrica === null ? '—' : alvo.valorMetrica.toFixed(2)}
                                </td>
                              )}
                              <td className="py-1.5 pl-2 text-right tabular-nums">
                                {fmtMoeda(alvo.spend, 0)}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}
                </div>
              ))}

              {turno.executado ? (
                <div
                  className={cn(
                    'rounded-lg border p-2.5 text-[11px]',
                    turno.executado.falhou === 0
                      ? 'bg-success/10 border-success/30 text-success'
                      : 'bg-attention/10 border-attention/30 text-attention',
                  )}
                >
                  {turno.executado.ok} ação(ões) aplicada(s)
                  {turno.executado.falhou > 0 && ` · ${turno.executado.falhou} falhou/falharam`}. Tudo
                  registrado no log de auditoria.
                </div>
              ) : (
                turno.acoes.some((a) => a.alvos.length > 0) && (
                  <button
                    type="button"
                    onClick={() => void confirmar(i)}
                    disabled={executando !== null}
                    className="px-4 py-2 bg-warn text-white rounded-lg text-xs font-extrabold inline-flex items-center gap-1.5 hover:opacity-90 transition disabled:opacity-60"
                  >
                    {executando === i && <Loader2 size={12} className="animate-spin" />}
                    Confirmar e executar{' '}
                    {turno.acoes.reduce((s, a) => s + a.alvos.length, 0)} ação(ões)
                  </button>
                )
              )}
            </div>
          </article>
        ))}
      </div>

      {erro && (
        <div className="bg-warn/10 border border-warn/30 text-warn rounded-lg p-3 text-[11px]">
          {erro}
        </div>
      )}

      <form
        onSubmit={(e) => {
          e.preventDefault();
          void enviar(comando);
        }}
        className="flex gap-2 sticky bottom-4"
      >
        <input
          value={comando}
          onChange={(e) => setComando(e.target.value)}
          placeholder="ex: pausa criativos com frequência acima de 3.5 na campanha de escala"
          className="flex-1 px-3.5 py-2.5 bg-[rgb(var(--surface))] border border-[rgb(var(--border))] rounded-xl text-xs outline-none focus:border-navy/50 shadow-sm"
        />
        <button
          type="submit"
          disabled={carregando || !comando.trim()}
          className="px-4 py-2.5 bg-navy text-white rounded-xl text-xs font-extrabold inline-flex items-center gap-1.5 hover:bg-navy-soft transition disabled:opacity-50"
        >
          {carregando ? <Loader2 size={13} className="animate-spin" /> : <Send size={13} />}
          Enviar
        </button>
      </form>
    </div>
  );
}
