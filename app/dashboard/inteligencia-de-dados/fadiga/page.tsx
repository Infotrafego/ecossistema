/**
 * Diagnostico de Fadiga Criativa (Fase 2c · C2)
 *
 * O score sai de lib/fadiga.ts, recalculado diariamente pelo job que roda logo
 * apos o sync. Esta tela so le — nao recalcula no request, porque a serie de 30
 * dias de todos os criativos e cara demais pra um page load.
 */

import { resolverContexto } from '@/lib/data/contexto';
import { getFadiga } from '@/lib/data/fadiga';
import { EstadoVazio } from '@/components/dashboard/intel/estado-vazio';
import { INFO_FADIGA } from '@/lib/fadiga';
import { fmtNum } from '@/lib/intel';
import { cn } from '@/lib/utils';
import type { ParamsBrutos } from '@/lib/filtros';

export const dynamic = 'force-dynamic';

export default async function FadigaPage({
  searchParams,
}: {
  searchParams: Promise<ParamsBrutos>;
}) {
  const ctx = await resolverContexto(await searchParams);
  if (!ctx.cliente) return <EstadoVazio motivo="sem_acesso" />;

  const itens = await getFadiga(ctx.cliente.id);

  const criticos = itens.filter((i) => i.status === 'critico');
  const atencao = itens.filter((i) => i.status === 'atencao');
  const saudaveis = itens.filter((i) => i.status === 'saudavel');
  const calculadoEm = itens[0]?.calculadoEm;

  return (
    <div className="space-y-6">
      <header>
        <h1 className="text-xl font-extrabold tracking-tight">Diagnóstico de Fadiga Criativa</h1>
        <p className="text-sm text-[rgb(var(--muted))] mt-1">
          {ctx.cliente.nome} · {itens.length} criativos avaliados
          {calculadoEm && ` · atualizado em ${new Date(calculadoEm).toLocaleString('pt-BR', { dateStyle: 'short', timeStyle: 'short' })}`}
        </p>
      </header>

      {itens.length === 0 ? (
        <div className="card py-10 text-center">
          <p className="text-sm text-[rgb(var(--muted))]">
            Nenhum criativo avaliado ainda. O diagnóstico roda junto com o sync diário e precisa
            de pelo menos 5 dias de entrega por criativo pra ter curva.
          </p>
        </div>
      ) : (
        <>
          <div className="grid grid-cols-3 gap-3">
            <Resumo titulo="🔴 Críticos" valor={criticos.length} tom="warn" sub="substituir ou pausar" />
            <Resumo titulo="🟡 Atenção" valor={atencao.length} tom="attention" sub="preparar variação" />
            <Resumo titulo="🟢 Saudáveis" valor={saudaveis.length} tom="success" sub="continuar" />
          </div>

          <div className="card p-0 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-[11px]">
                <thead>
                  <tr className="text-left text-[9px] uppercase tracking-wider text-[rgb(var(--muted))] font-bold border-b border-[rgb(var(--border))]">
                    <th className="py-2 px-3">Criativo</th>
                    <th className="py-2 px-2 text-right">Score</th>
                    <th className="py-2 px-2">Status</th>
                    <th className="py-2 px-2 text-right">Dias com entrega</th>
                  </tr>
                </thead>
                <tbody>
                  {itens.map((i) => {
                    const info = INFO_FADIGA[i.status];
                    return (
                      <tr key={i.creativeId} className="border-b border-[rgb(var(--border))] last:border-0">
                        <td className="py-2 px-3 font-bold truncate max-w-[420px]" title={i.nome}>
                          {i.nome}
                        </td>
                        <td className="py-2 px-2 text-right">
                          <div className="flex items-center justify-end gap-2">
                            <div className="w-24 h-1.5 bg-[rgb(var(--border))] rounded-full overflow-hidden">
                              <div
                                className={cn(
                                  'h-full rounded-full',
                                  i.status === 'critico'
                                    ? 'bg-warn'
                                    : i.status === 'atencao'
                                      ? 'bg-attention'
                                      : 'bg-success',
                                )}
                                style={{ width: `${i.score}%` }}
                              />
                            </div>
                            <span className="tabular-nums font-extrabold w-7 text-right">{i.score}</span>
                          </div>
                        </td>
                        <td className="py-2 px-2">
                          <span className={cn('px-1.5 py-0.5 rounded border text-[9px] font-bold', info.classe)}>
                            {info.icone} {info.label}
                          </span>
                        </td>
                        <td className="py-2 px-2 text-right tabular-nums">{fmtNum(i.diasAtivo)}</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>

          <div className="card text-[11px] text-[rgb(var(--muted))] space-y-1">
            <p className="font-bold text-ink dark:text-ash">Como o score é calculado</p>
            <p>
              Combina três sinais dos últimos 30 dias, comparando os 3 primeiros dias de entrega
              com os 3 mais recentes: <strong>queda de CTR</strong> (até 60 pontos — 20% de queda
              já vale 35), <strong>frequência atual</strong> (até 25) e <strong>alta de CPC</strong> (até 15).
              Score ≥ 60 é crítico, ≥ 35 é atenção.
            </p>
            <p>
              Os três juntos evitam o falso positivo mais comum: CTR caindo logo após o pico de
              novidade, com frequência baixa e CPC estável, é normalização — não saturação.
            </p>
          </div>
        </>
      )}
    </div>
  );
}

function Resumo({
  titulo,
  valor,
  tom,
  sub,
}: {
  titulo: string;
  valor: number;
  tom: 'warn' | 'attention' | 'success';
  sub: string;
}) {
  return (
    <div
      className={cn(
        'card border-t-2',
        tom === 'warn' ? 'border-t-warn' : tom === 'attention' ? 'border-t-attention' : 'border-t-success',
      )}
    >
      <div className="kpi-label">{titulo}</div>
      <div className="text-2xl font-extrabold tracking-tight mt-1">{valor}</div>
      <div className="text-[10px] text-[rgb(var(--muted))] mt-0.5">{sub}</div>
    </div>
  );
}
