/**
 * Funil cone · componente CRÍTICO da Inteligência de Dados
 *
 * Layout do mockup (creative-intel, `lkr-funnel`): taxa de conversão à
 * esquerda, forma do cone no centro, custo por etapa à direita. Trocado o SVG
 * anterior por HTML+flex porque o mockup precisa de três colunas alinhadas
 * linha a linha, e texto em SVG não quebra nem trunca — em nome longo de etapa
 * o rótulo vazava pra fora da barra.
 *
 * Não sabe nada sobre funil: recebe `EtapaCone[]` já montado por `lib/cone.ts`.
 * É isso que faz o mesmo componente servir Visão Geral e preview do Construtor.
 */

import type { EtapaCone } from '@/lib/cone';
import { fmtMoeda, fmtNum, fmtPct } from '@/lib/intel';
import { cn } from '@/lib/utils';

/** Tons do cone, do topo (frio) pro fundo (conversão). */
const TONS = ['#2D5A95', '#27518A', '#22487E', '#1D3F72', '#183766', '#142E5A', '#10264E', '#0C1E42'];

export type { EtapaCone };

interface FunilConeProps {
  etapas: EtapaCone[];
  className?: string;
  /** Esconde as colunas laterais — usado no preview estreito do Construtor. */
  compacto?: boolean;
}

export function FunilCone({ etapas, className, compacto = false }: FunilConeProps) {
  if (etapas.length === 0) {
    return (
      <div className="text-center text-[rgb(var(--muted))] py-8 text-sm">
        Configure um funil pra ver o cone.
      </div>
    );
  }

  return (
    <div className={cn('space-y-1', className)}>
      {etapas.map((etapa, i) => (
        <LinhaEtapa
          key={etapa.id}
          etapa={etapa}
          indice={i}
          total={etapas.length}
          compacto={compacto}
        />
      ))}
    </div>
  );
}

function LinhaEtapa({
  etapa,
  indice,
  total,
  compacto,
}: {
  etapa: EtapaCone;
  indice: number;
  total: number;
  compacto: boolean;
}) {
  // Largura decrescente e linear: o cone comunica a FORMA do funil, não a
  // proporção exata — largura proporcional ao valor faria a última etapa
  // sumir num funil saudável (9 vendas em 248 mil impressões = 0,003%).
  const largura = total === 1 ? 100 : 100 - indice * (58 / (total - 1));
  const cor = TONS[Math.min(indice, TONS.length - 1)];

  const atingiuMeta = etapa.meta !== null && etapa.valor >= etapa.meta;

  return (
    <div className="flex items-center gap-2">
      {!compacto && (
        <div className="w-[104px] shrink-0 text-right">
          {etapa.taxa !== null && (
            <Pilula
              valor={fmtPct(etapa.taxa, 1)}
              label={etapa.taxaLabel ?? ''}
              tom="taxa"
            />
          )}
        </div>
      )}

      <div className="flex-1 min-w-0 flex justify-center">
        <div
          className="rounded-md px-3 py-2 flex items-center justify-between gap-3 text-white min-w-0"
          style={{ width: `${largura}%`, background: cor }}
        >
          <span className="text-[11px] font-bold truncate flex items-center gap-1.5 min-w-0">
            <span className="truncate">{etapa.label}</span>
            {etapa.marcadorMkt && <Marcador tipo="MKT" />}
            {etapa.marcadorCom && <Marcador tipo="COM" />}
            {etapa.projecao && <Marcador tipo="Proj" />}
          </span>
          <span className="text-sm font-extrabold tabular-nums shrink-0">
            {fmtNum(etapa.valor)}
          </span>
        </div>
      </div>

      {!compacto && (
        <div className="w-[104px] shrink-0">
          {etapa.custo !== null && (
            <Pilula valor={fmtMoeda(etapa.custo)} label={etapa.custoLabel} tom="custo" />
          )}
          {etapa.meta !== null && (
            <div
              className={cn(
                'text-[9px] font-bold mt-0.5',
                atingiuMeta ? 'text-success' : 'text-[rgb(var(--muted))]',
              )}
            >
              meta {fmtNum(etapa.meta)}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

function Pilula({ valor, label, tom }: { valor: string; label: string; tom: 'taxa' | 'custo' }) {
  return (
    <div
      className={cn(
        'px-1.5 py-1 rounded border text-center',
        tom === 'taxa'
          ? 'border-[rgb(var(--border))] bg-[rgb(var(--bg))]'
          : 'border-navy/20 bg-navy/5',
      )}
    >
      <div className="text-[11px] font-extrabold tabular-nums leading-none">{valor}</div>
      <div className="text-[8px] uppercase tracking-wider font-bold text-[rgb(var(--muted))] mt-0.5 truncate">
        {label}
      </div>
    </div>
  );
}

function Marcador({ tipo }: { tipo: 'MKT' | 'COM' | 'Proj' }) {
  return (
    <span className="px-1 py-px rounded bg-white/20 border border-white/30 text-[8px] font-extrabold shrink-0">
      {tipo}
    </span>
  );
}
