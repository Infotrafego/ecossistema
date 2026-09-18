'use client';

import { useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { Loader2, Play, Plus, Trash2 } from 'lucide-react';
import {
  MODELOS_DE_REGRA,
  descreverRegra,
  type Condicao,
  type MetricaRegra,
  type OperadorRegra,
} from '@/lib/regras';
import type { RegraAuto, RegraExecucao } from '@/types/database';
import { fmtMoeda } from '@/lib/intel';
import { cn } from '@/lib/utils';
import {
  alternarRegraAction,
  apagarRegraAction,
  executarRegraAction,
  salvarRegraAction,
  type EntradaRegra,
} from './actions';

const METRICAS: Array<{ id: MetricaRegra; label: string; formato: 'moeda' | 'numero' | 'percentual' }> = [
  { id: 'cpc', label: 'CPC', formato: 'moeda' },
  { id: 'cpm', label: 'CPM', formato: 'moeda' },
  { id: 'cpl', label: 'CPL', formato: 'moeda' },
  { id: 'cpmql', label: 'CPMQL', formato: 'moeda' },
  { id: 'spend', label: 'Investido no dia', formato: 'moeda' },
  { id: 'ctr', label: 'CTR (0–1)', formato: 'percentual' },
  { id: 'conv_lm', label: 'Conv L→M (0–1)', formato: 'percentual' },
  { id: 'frequencia', label: 'Frequência', formato: 'numero' },
  { id: 'leads', label: 'Leads no dia', formato: 'numero' },
];

const OPERADORES: Array<{ id: OperadorRegra; label: string }> = [
  { id: 'gt', label: 'maior que' },
  { id: 'gte', label: 'maior ou igual' },
  { id: 'lt', label: 'menor que' },
  { id: 'lte', label: 'menor ou igual' },
];

const ACOES = [
  { id: 'pausar', label: 'Pausar' },
  { id: 'reduzir_orcamento', label: 'Reduzir orçamento 30%' },
  { id: 'aumentar_orcamento', label: 'Aumentar orçamento 30%' },
  { id: 'notificar', label: 'Apenas notificar' },
] as const;

const ESCOPOS = [
  { id: 'campaign', label: 'Campanhas' },
  { id: 'adset', label: 'Públicos (ad sets)' },
  { id: 'ad', label: 'Criativos (ads)' },
] as const;

interface Props {
  clienteId: string;
  clienteNome: string;
  regras: RegraAuto[];
  execucoes: RegraExecucao[];
}

function entradaVazia(clientId: string): EntradaRegra {
  return {
    clientId,
    nome: '',
    escopo: 'adset',
    condicoes: [{ metrica: 'cpc', operador: 'gt', valor: 3.5 }],
    operadorLogico: 'e',
    janelaDias: 3,
    gastoMinimo: 100,
    acao: 'pausar',
    acaoParams: {},
    ativa: false,
    // Regra nova nasce em simulação. Ligar direto numa conta com verba é o tipo
    // de decisão que ninguém quer tomar por descuido num formulário.
    dryRun: true,
  };
}

export function RegrasView({ clienteId, clienteNome, regras, execucoes }: Props) {
  const router = useRouter();
  const [editando, setEditando] = useState<EntradaRegra | null>(null);
  const [mensagem, setMensagem] = useState<{ ok: boolean; texto: string } | null>(null);
  const [pendente, iniciar] = useTransition();

  const ativas = regras.filter((r) => r.ativa);
  const aplicando = ativas.filter((r) => !r.dry_run);

  function agir(fn: () => Promise<{ ok: boolean; erro?: string }>, sucesso: string) {
    iniciar(async () => {
      const r = await fn();
      setMensagem({ ok: r.ok, texto: r.ok ? sucesso : (r.erro ?? 'Falhou.') });
      if (r.ok) router.refresh();
    });
  }

  return (
    <div className="space-y-6">
      <header className="flex items-start justify-between gap-4 flex-wrap">
        <div>
          <h1 className="text-xl font-extrabold tracking-tight">Otimizador · Regras automáticas</h1>
          <p className="text-sm text-[rgb(var(--muted))] mt-1">
            {clienteNome} · {regras.length} regra(s) · {ativas.length} ativa(s) ·{' '}
            {aplicando.length} aplicando de verdade
          </p>
        </div>
        <button
          type="button"
          onClick={() => setEditando(entradaVazia(clienteId))}
          className="px-3 py-2 bg-navy text-white rounded-lg text-xs font-extrabold inline-flex items-center gap-1.5 hover:bg-navy-soft transition"
        >
          <Plus size={13} /> Nova regra
        </button>
      </header>

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

      {regras.length === 0 && !editando && (
        <section className="card space-y-3">
          <h2 className="text-xs font-extrabold tracking-tight">Comece por um modelo</h2>
          <p className="text-[11px] text-[rgb(var(--muted))]">
            Todos entram em modo simulação: avaliam e registram o que fariam, sem tocar na conta.
            Depois de acompanhar o histórico por alguns dias, você libera a aplicação real.
          </p>
          <div className="grid md:grid-cols-2 gap-2">
            {MODELOS_DE_REGRA.map((m) => (
              <button
                key={m.nome}
                type="button"
                onClick={() =>
                  setEditando({
                    ...entradaVazia(clienteId),
                    nome: m.nome,
                    escopo: m.escopo,
                    condicoes: m.condicoes,
                    operadorLogico: m.operadorLogico,
                    janelaDias: m.janelaDias,
                    gastoMinimo: m.gastoMinimo,
                    acao: m.acao,
                  })
                }
                className="text-left p-3 rounded-lg border border-[rgb(var(--border))] hover:border-navy/40 transition"
              >
                <div className="text-[11px] font-extrabold">{m.nome}</div>
                <div className="text-[10px] text-[rgb(var(--muted))] mt-1">{m.descricao}</div>
              </button>
            ))}
          </div>
        </section>
      )}

      {editando && (
        <EditorRegra
          entrada={editando}
          pendente={pendente}
          onCancelar={() => setEditando(null)}
          onSalvar={(e) =>
            agir(async () => {
              const r = await salvarRegraAction(e);
              if (r.ok) setEditando(null);
              return r;
            }, 'Regra salva.')
          }
        />
      )}

      {regras.length > 0 && (
        <section className="space-y-2">
          <h2 className="text-xs uppercase tracking-wider font-bold text-[rgb(var(--muted))]">
            Regras cadastradas
          </h2>
          {regras.map((r) => (
            <article key={r.id} className="card space-y-2">
              <div className="flex items-start justify-between gap-3 flex-wrap">
                <div className="min-w-0">
                  <h3 className="text-xs font-extrabold">{r.nome}</h3>
                  <p className="text-[11px] text-[rgb(var(--muted))] mt-0.5">
                    {descreverRegra({
                      id: r.id,
                      nome: r.nome,
                      escopo: r.escopo,
                      condicoes: r.condicoes,
                      operadorLogico: r.operador_logico,
                      janelaDias: r.janela_dias,
                      gastoMinimo: Number(r.gasto_minimo),
                      acao: r.acao,
                    })}
                  </p>
                  <p className="text-[10px] text-[rgb(var(--muted))] mt-0.5">
                    Escopo: {ESCOPOS.find((e) => e.id === r.escopo)?.label} · gasto mínimo na janela{' '}
                    {fmtMoeda(Number(r.gasto_minimo), 0)}
                  </p>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  <Interruptor
                    label={r.ativa ? 'Ativa' : 'Inativa'}
                    ligado={r.ativa}
                    onChange={(v) => agir(() => alternarRegraAction(r.id, 'ativa', v), 'Regra atualizada.')}
                  />
                  <Interruptor
                    label={r.dry_run ? 'Simulação' : 'Aplicando'}
                    ligado={!r.dry_run}
                    perigo
                    onChange={(v) =>
                      agir(() => alternarRegraAction(r.id, 'dry_run', !v), 'Modo atualizado.')
                    }
                  />
                  <button
                    type="button"
                    disabled={pendente}
                    onClick={() =>
                      agir(async () => {
                        const r2 = await executarRegraAction(r.id);
                        return { ok: r2.ok, erro: r2.erro };
                      }, 'Execução concluída — veja o histórico abaixo.')
                    }
                    title="Rodar agora"
                    className="p-1.5 rounded border border-[rgb(var(--border))] hover:border-navy transition"
                  >
                    {pendente ? <Loader2 size={13} className="animate-spin" /> : <Play size={13} />}
                  </button>
                  <button
                    type="button"
                    disabled={pendente}
                    onClick={() => agir(() => apagarRegraAction(r.id), 'Regra removida.')}
                    title="Apagar"
                    className="p-1.5 rounded border border-[rgb(var(--border))] text-warn hover:border-warn transition"
                  >
                    <Trash2 size={13} />
                  </button>
                </div>
              </div>

              {r.ativa && !r.dry_run && (
                <p className="text-[10px] font-bold text-warn">
                  ⚠ Esta regra aplica ações na conta de anúncios automaticamente, no ciclo diário.
                </p>
              )}
            </article>
          ))}
        </section>
      )}

      <Historico execucoes={execucoes} regras={regras} />
    </div>
  );
}

function Interruptor({
  label,
  ligado,
  perigo = false,
  onChange,
}: {
  label: string;
  ligado: boolean;
  perigo?: boolean;
  onChange: (v: boolean) => void;
}) {
  return (
    <button
      type="button"
      onClick={() => onChange(!ligado)}
      className={cn(
        'px-2 py-1 rounded-full border text-[10px] font-extrabold transition',
        ligado
          ? perigo
            ? 'bg-warn/10 border-warn text-warn'
            : 'bg-success/10 border-success text-success'
          : 'border-[rgb(var(--border))] text-[rgb(var(--muted))]',
      )}
    >
      {label}
    </button>
  );
}

function EditorRegra({
  entrada,
  pendente,
  onCancelar,
  onSalvar,
}: {
  entrada: EntradaRegra;
  pendente: boolean;
  onCancelar: () => void;
  onSalvar: (e: EntradaRegra) => void;
}) {
  const [form, setForm] = useState<EntradaRegra>(entrada);

  function setCondicao(i: number, patch: Partial<Condicao>) {
    setForm((f) => ({
      ...f,
      condicoes: f.condicoes.map((c, idx) => (idx === i ? { ...c, ...patch } : c)),
    }));
  }

  return (
    <section className="card space-y-4 border-navy/40">
      <h2 className="text-xs font-extrabold tracking-tight">
        {form.id ? 'Editar regra' : 'Nova regra'}
      </h2>

      <div className="grid sm:grid-cols-2 gap-3">
        <Campo label="Nome">
          <input
            value={form.nome}
            onChange={(e) => setForm({ ...form, nome: e.target.value })}
            placeholder="ex: CPC alto por 3 dias → pausar"
            className="input-wizard"
          />
        </Campo>
        <Campo label="Escopo">
          <select
            value={form.escopo}
            onChange={(e) => setForm({ ...form, escopo: e.target.value as EntradaRegra['escopo'] })}
            className="input-wizard"
          >
            {ESCOPOS.map((e) => (
              <option key={e.id} value={e.id}>
                {e.label}
              </option>
            ))}
          </select>
        </Campo>
      </div>

      <div>
        <div className="flex items-center gap-3 mb-2">
          <span className="text-[9px] uppercase tracking-wider font-bold text-[rgb(var(--muted))]">
            Condições
          </span>
          <div className="flex gap-1">
            {(['e', 'ou'] as const).map((op) => (
              <button
                key={op}
                type="button"
                onClick={() => setForm({ ...form, operadorLogico: op })}
                className={cn(
                  'px-2 py-0.5 rounded-full text-[10px] font-bold border transition',
                  form.operadorLogico === op
                    ? 'bg-navy text-white border-navy'
                    : 'border-[rgb(var(--border))] text-[rgb(var(--muted))]',
                )}
              >
                {op === 'e' ? 'todas (E)' : 'qualquer (OU)'}
              </button>
            ))}
          </div>
        </div>

        <div className="space-y-2">
          {form.condicoes.map((c, i) => (
            <div key={i} className="flex flex-wrap items-center gap-2">
              <select
                value={c.metrica}
                onChange={(e) => setCondicao(i, { metrica: e.target.value as MetricaRegra })}
                className="input-wizard w-auto"
              >
                {METRICAS.map((m) => (
                  <option key={m.id} value={m.id}>
                    {m.label}
                  </option>
                ))}
              </select>
              <select
                value={c.operador}
                onChange={(e) => setCondicao(i, { operador: e.target.value as OperadorRegra })}
                className="input-wizard w-auto"
              >
                {OPERADORES.map((o) => (
                  <option key={o.id} value={o.id}>
                    {o.label}
                  </option>
                ))}
              </select>
              <input
                type="number"
                step="0.001"
                value={c.valor}
                onChange={(e) => setCondicao(i, { valor: Number(e.target.value) })}
                className="input-wizard w-24"
              />
              {form.condicoes.length > 1 && (
                <button
                  type="button"
                  onClick={() =>
                    setForm({ ...form, condicoes: form.condicoes.filter((_, idx) => idx !== i) })
                  }
                  className="text-warn text-[11px] font-bold"
                >
                  remover
                </button>
              )}
            </div>
          ))}
          <button
            type="button"
            onClick={() =>
              setForm({
                ...form,
                condicoes: [...form.condicoes, { metrica: 'cpl', operador: 'gt', valor: 50 }],
              })
            }
            className="text-[11px] font-bold text-navy"
          >
            + adicionar condição
          </button>
        </div>
      </div>

      <div className="grid sm:grid-cols-3 gap-3">
        <Campo label="Por quantos dias seguidos">
          <input
            type="number"
            min={1}
            max={30}
            value={form.janelaDias}
            onChange={(e) => setForm({ ...form, janelaDias: Number(e.target.value) })}
            className="input-wizard"
          />
        </Campo>
        <Campo label="Gasto mínimo na janela (R$)">
          <input
            type="number"
            min={0}
            value={form.gastoMinimo}
            onChange={(e) => setForm({ ...form, gastoMinimo: Number(e.target.value) })}
            className="input-wizard"
          />
        </Campo>
        <Campo label="Ação">
          <select
            value={form.acao}
            onChange={(e) => setForm({ ...form, acao: e.target.value as EntradaRegra['acao'] })}
            className="input-wizard"
          >
            {ACOES.map((a) => (
              <option key={a.id} value={a.id}>
                {a.label}
              </option>
            ))}
          </select>
        </Campo>
      </div>

      <p className="text-[10px] text-[rgb(var(--muted))]">
        A condição precisa valer em <strong>todos</strong> os dias da janela — não na média. E
        entidades que não atingiram o gasto mínimo ficam de fora, pra que uma amostra de dois
        cliques não pause um ad set.
      </p>

      <div className="flex items-center gap-3 flex-wrap">
        <label className="flex items-center gap-1.5 text-[11px] font-bold">
          <input
            type="checkbox"
            checked={form.ativa}
            onChange={(e) => setForm({ ...form, ativa: e.target.checked })}
          />
          Ativa no ciclo diário
        </label>
        <label className="flex items-center gap-1.5 text-[11px] font-bold">
          <input
            type="checkbox"
            checked={form.dryRun}
            onChange={(e) => setForm({ ...form, dryRun: e.target.checked })}
          />
          Modo simulação (não chama a Meta)
        </label>
      </div>

      {!form.dryRun && (
        <p className="text-[11px] font-bold text-warn">
          ⚠ Com a simulação desligada, esta regra executa ações reais na conta de anúncios sem
          confirmação humana. Toda ação fica registrada no audit_log.
        </p>
      )}

      <div className="flex gap-2">
        <button
          type="button"
          onClick={() => onSalvar(form)}
          disabled={pendente}
          className="px-4 py-2 bg-navy text-white rounded-lg text-xs font-extrabold inline-flex items-center gap-1.5 hover:bg-navy-soft transition disabled:opacity-60"
        >
          {pendente && <Loader2 size={12} className="animate-spin" />} Salvar regra
        </button>
        <button
          type="button"
          onClick={onCancelar}
          className="px-4 py-2 border border-[rgb(var(--border))] rounded-lg text-xs font-extrabold hover:border-navy/40 transition"
        >
          Cancelar
        </button>
      </div>
    </section>
  );
}

const TOM_EXEC: Record<string, string> = {
  sucesso: 'bg-success/10 text-success border-success/30',
  parcial: 'bg-attention/10 text-attention border-attention/30',
  erro: 'bg-warn/10 text-warn border-warn/30',
  sem_alvos: 'bg-[rgb(var(--border))] text-[rgb(var(--muted))] border-[rgb(var(--border))]',
};

function Historico({ execucoes, regras }: { execucoes: RegraExecucao[]; regras: RegraAuto[] }) {
  const nomePorRegra = new Map(regras.map((r) => [r.id, r.nome]));

  return (
    <section className="space-y-2">
      <h2 className="text-xs uppercase tracking-wider font-bold text-[rgb(var(--muted))]">
        Histórico de execuções
      </h2>
      {execucoes.length === 0 ? (
        <div className="card text-center py-8 text-[11px] text-[rgb(var(--muted))]">
          Nenhuma execução registrada ainda.
        </div>
      ) : (
        <div className="card p-0 overflow-x-auto">
          <table className="w-full text-[11px]">
            <thead>
              <tr className="text-left text-[9px] uppercase tracking-wider text-[rgb(var(--muted))] font-bold border-b border-[rgb(var(--border))]">
                <th className="py-2 px-3">Quando</th>
                <th className="py-2 px-2">Regra</th>
                <th className="py-2 px-2">Status</th>
                <th className="py-2 px-2">Modo</th>
                <th className="py-2 px-2 text-right">Avaliados</th>
                <th className="py-2 px-2 text-right">Casaram</th>
                <th className="py-2 px-2 text-right">Aplicadas</th>
                <th className="py-2 px-3">Alvos</th>
              </tr>
            </thead>
            <tbody>
              {execucoes.map((e) => (
                <tr key={e.id} className="border-b border-[rgb(var(--border))] last:border-0 align-top">
                  <td className="py-2 px-3 whitespace-nowrap">
                    {new Date(e.executed_at).toLocaleString('pt-BR', {
                      dateStyle: 'short',
                      timeStyle: 'short',
                    })}
                  </td>
                  <td className="py-2 px-2 font-bold truncate max-w-[180px]">
                    {nomePorRegra.get(e.regra_id) ?? '—'}
                  </td>
                  <td className="py-2 px-2">
                    <span
                      className={cn('px-1.5 py-0.5 rounded border text-[9px] font-bold', TOM_EXEC[e.status])}
                    >
                      {e.status.replace('_', ' ')}
                    </span>
                  </td>
                  <td className="py-2 px-2 text-[rgb(var(--muted))]">
                    {e.dry_run ? 'simulação' : 'real'}
                  </td>
                  <td className="py-2 px-2 text-right tabular-nums">{e.alvos_avaliados}</td>
                  <td className="py-2 px-2 text-right tabular-nums font-bold">{e.alvos_casados}</td>
                  <td className="py-2 px-2 text-right tabular-nums">{e.acoes_aplicadas}</td>
                  <td className="py-2 px-3 text-[10px] text-[rgb(var(--muted))] max-w-[320px]">
                    {e.erro ? (
                      <span className="text-warn">{e.erro}</span>
                    ) : (
                      e.detalhes
                        .slice(0, 3)
                        .map((d) => String((d as { entidade_nome?: string }).entidade_nome ?? ''))
                        .filter(Boolean)
                        .join(' · ') || '—'
                    )}
                    {e.detalhes.length > 3 && ` +${e.detalhes.length - 3}`}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </section>
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
