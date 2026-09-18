'use client';

/**
 * Action toolbar contextual (Fase 2b)
 *
 * Referência visual: docs/mockups/app-unificado-v1.5-COMPLETO.html (`action-bar`).
 * Os botões vêm do catálogo em lib/meta-ads/acoes.ts, não de uma lista aqui —
 * a mesma fonte que o executor valida no servidor.
 *
 * Ação destrutiva SEMPRE passa pelo modal, sem exceção configurável: essas
 * ações gastam verba de cliente real, e o custo de um clique errado é alto
 * demais pra ficar atrás de uma preferência.
 */

import { useState } from 'react';
import { AlertTriangle, Loader2 } from 'lucide-react';
import { useRouter } from 'next/navigation';
import {
  ROTULO_ESCOPO,
  acoesDoEscopo,
  type DefinicaoAcao,
  type EscopoAcao,
} from '@/lib/meta-ads/acoes';
import { cn } from '@/lib/utils';

interface Selecionado {
  id: string;
  nome: string;
}

interface Props {
  escopo: EscopoAcao;
  clienteId: string;
  selecionado: Selecionado | null;
  info: string;
}

type Resultado = { ok: boolean; mensagem: string } | null;

export function ActionToolbar({ escopo, clienteId, selecionado, info }: Props) {
  const router = useRouter();
  const [confirmando, setConfirmando] = useState<DefinicaoAcao | null>(null);
  const [executando, setExecutando] = useState<string | null>(null);
  const [resultado, setResultado] = useState<Resultado>(null);

  const acoes = acoesDoEscopo(escopo);

  async function executar(acao: DefinicaoAcao) {
    setConfirmando(null);
    setExecutando(acao.id);
    setResultado(null);

    try {
      const res = await fetch('/api/acoes', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({
          clientId: clienteId,
          acaoId: acao.id,
          entityMetaId: selecionado?.id,
          entityNome: selecionado?.nome,
          params: acao.percentual !== undefined ? { percentual: acao.percentual } : {},
        }),
      });
      const corpo = (await res.json()) as { ok: boolean; mensagem: string };
      setResultado(corpo);
      // Sucesso muda a conta na Meta; o dado da tela ficou velho.
      if (corpo.ok) router.refresh();
    } catch (e) {
      setResultado({
        ok: false,
        mensagem: `Não foi possível falar com o servidor: ${e instanceof Error ? e.message : String(e)}`,
      });
    } finally {
      setExecutando(null);
    }
  }

  function aoClicar(acao: DefinicaoAcao) {
    if (acao.exigeSelecao && !selecionado) {
      setResultado({ ok: false, mensagem: 'Selecione um item na lista abaixo primeiro.' });
      return;
    }
    if (acao.destrutiva) {
      setConfirmando(acao);
      return;
    }
    void executar(acao);
  }

  return (
    <div className="space-y-2">
      <div className="flex items-center gap-2 flex-wrap bg-[rgb(var(--surface))] border border-[rgb(var(--border))] rounded-lg px-3 py-2.5">
        <span className="text-[10px] uppercase tracking-wider font-extrabold text-[rgb(var(--muted))] mr-1">
          {ROTULO_ESCOPO[escopo]}
        </span>

        {acoes.map((acao) => (
          <BotaoAcao
            key={acao.id}
            acao={acao}
            carregando={executando === acao.id}
            desabilitado={executando !== null}
            onClick={() => aoClicar(acao)}
          />
        ))}

        <span className="flex-1" />

        <span className="text-[10px] text-[rgb(var(--muted))]">
          {selecionado ? (
            <>
              Selecionado: <strong className="text-navy">{selecionado.nome}</strong>
            </>
          ) : (
            info
          )}
        </span>
      </div>

      {resultado && (
        <div
          className={cn(
            'rounded-lg border p-3 text-[11px] flex items-start gap-2',
            resultado.ok
              ? 'bg-success/10 border-success/30 text-success'
              : 'bg-warn/10 border-warn/30 text-warn',
          )}
        >
          <span>{resultado.ok ? '✓' : '⚠'}</span>
          <div className="flex-1">{resultado.mensagem}</div>
          <button
            type="button"
            onClick={() => setResultado(null)}
            className="font-bold opacity-60 hover:opacity-100"
          >
            ✕
          </button>
        </div>
      )}

      {confirmando && (
        <ModalConfirmacao
          acao={confirmando}
          alvo={selecionado}
          onCancelar={() => setConfirmando(null)}
          onConfirmar={() => void executar(confirmando)}
        />
      )}
    </div>
  );
}

function BotaoAcao({
  acao,
  carregando,
  desabilitado,
  onClick,
}: {
  acao: DefinicaoAcao;
  carregando: boolean;
  desabilitado: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={desabilitado}
      title={acao.descricao}
      className={cn(
        'px-3 py-1.5 rounded-md border text-[11px] font-bold inline-flex items-center gap-1.5 transition',
        acao.tom === 'primary'
          ? 'bg-navy text-white border-navy hover:bg-alicerce'
          : acao.tom === 'danger'
            ? 'bg-[rgb(var(--bg))] border-[rgb(var(--border))] text-warn hover:border-warn hover:bg-warn/10'
            : acao.tom === 'scale'
              ? 'bg-[rgb(var(--bg))] border-[rgb(var(--border))] text-success hover:border-success hover:bg-success/10'
              : 'bg-[rgb(var(--bg))] border-[rgb(var(--border))] hover:border-navy',
        desabilitado && 'opacity-50 cursor-not-allowed',
      )}
    >
      {carregando ? <Loader2 size={12} className="animate-spin" /> : <span>{acao.icone}</span>}
      {acao.rotulo}
    </button>
  );
}

function ModalConfirmacao({
  acao,
  alvo,
  onCancelar,
  onConfirmar,
}: {
  acao: DefinicaoAcao;
  alvo: Selecionado | null;
  onCancelar: () => void;
  onConfirmar: () => void;
}) {
  return (
    <div
      className="fixed inset-0 z-50 bg-alicerce/60 flex items-center justify-center p-4"
      onClick={onCancelar}
    >
      <div
        className="bg-[rgb(var(--surface))] border border-[rgb(var(--border))] rounded-xl max-w-md w-full p-5 shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-start gap-3">
          <div className="w-9 h-9 rounded-full bg-warn/15 text-warn flex items-center justify-center shrink-0">
            <AlertTriangle size={17} />
          </div>
          <div className="min-w-0">
            <h2 className="text-sm font-extrabold tracking-tight">Confirmar: {acao.rotulo}</h2>
            <p className="text-[11px] text-[rgb(var(--muted))] mt-1">{acao.descricao}</p>
          </div>
        </div>

        {alvo && (
          <div className="mt-4 p-2.5 rounded-lg bg-[rgb(var(--bg))] border border-[rgb(var(--border))]">
            <div className="text-[9px] uppercase tracking-wider font-bold text-[rgb(var(--muted))]">
              Alvo
            </div>
            <div className="text-[11px] font-bold truncate mt-0.5">{alvo.nome}</div>
          </div>
        )}

        <p className="text-[11px] mt-3 text-warn font-bold">
          Esta ação altera a conta de anúncios de verdade e não é desfeita automaticamente
          depois de concluída.
        </p>

        <div className="flex gap-2 mt-5">
          <button
            type="button"
            onClick={onCancelar}
            className="flex-1 px-4 py-2 border border-[rgb(var(--border))] rounded-lg text-xs font-extrabold hover:border-navy/40 transition"
          >
            Cancelar
          </button>
          <button
            type="button"
            onClick={onConfirmar}
            className="flex-1 px-4 py-2 bg-warn text-white rounded-lg text-xs font-extrabold hover:opacity-90 transition"
          >
            {acao.rotulo}
          </button>
        </div>
      </div>
    </div>
  );
}
