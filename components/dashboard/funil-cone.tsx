'use client';

/**
 * Funil cone Looker · componente CRÍTICO da Inteligência de Dados
 *
 * Renderiza um funil vertical em formato de cone com:
 * - N etapas (vem da config do funil · não fixo)
 * - Cada etapa mostra valor absoluto + taxa de conversão pra etapa anterior
 * - Lateral mostra custos (CPC, CPMQL, etc) e métricas auxiliares
 *
 * O cone vai estreitando conforme as etapas vão tendo menos volume.
 * Largura proporcional ao valor da etapa.
 */

import { formatNumber, formatCurrency, formatPercent } from '@/lib/utils';

export type FunilEtapa = {
  id: string;
  label: string;
  value: number;
  cost?: number; // custo acumulado nessa etapa
  costLabel?: string; // ex: "CPC", "CPMQL"
};

type FunilConeProps = {
  etapas: FunilEtapa[];
  className?: string;
};

export function FunilCone({ etapas, className }: FunilConeProps) {
  if (etapas.length === 0) {
    return (
      <div className="card text-center text-[rgb(var(--muted))] py-8">
        Configure um funil pra ver o cone
      </div>
    );
  }

  const maxValue = etapas[0].value;
  const width = 600;
  const height = etapas.length * 56 + 40;
  const centerX = width / 2;

  return (
    <div className={className}>
      <svg
        viewBox={`0 0 ${width} ${height}`}
        className="w-full h-auto"
        preserveAspectRatio="xMidYMid meet"
      >
        {etapas.map((etapa, i) => {
          // Largura proporcional ao valor
          const ratio = maxValue > 0 ? etapa.value / maxValue : 0;
          const stageWidth = Math.max(80, ratio * (width - 280));
          const x = centerX - stageWidth / 2;
          const y = 20 + i * 56;
          const stageHeight = 48;

          // Taxa vs etapa anterior
          const conversion =
            i > 0 && etapas[i - 1].value > 0
              ? etapa.value / etapas[i - 1].value
              : 1;

          // Cor: navy gradient (mais escuro nas etapas finais)
          const opacity = 1 - i * 0.06;

          return (
            <g key={etapa.id}>
              {/* Linha de taxa entre etapas (a partir da 2ª) */}
              {i > 0 && (
                <text
                  x={x - 8}
                  y={y - 4}
                  fontSize="9"
                  fill="#94A3B8"
                  textAnchor="end"
                  fontWeight="700"
                  className="uppercase tracking-wider"
                >
                  → {formatPercent(conversion, 1)}
                </text>
              )}

              {/* Barra da etapa */}
              <rect
                x={x}
                y={y}
                width={stageWidth}
                height={stageHeight}
                fill="#1A3D70"
                fillOpacity={opacity}
                rx={4}
              />

              {/* Label dentro da barra */}
              <text
                x={centerX}
                y={y + stageHeight / 2 - 4}
                textAnchor="middle"
                fontSize="11"
                fill="white"
                fontWeight="700"
              >
                {etapa.label}
              </text>
              <text
                x={centerX}
                y={y + stageHeight / 2 + 12}
                textAnchor="middle"
                fontSize="14"
                fill="white"
                fontWeight="800"
              >
                {formatNumber(etapa.value)}
              </text>

              {/* Custo lateral à direita (se houver) */}
              {etapa.cost !== undefined && etapa.costLabel && (
                <>
                  <text
                    x={x + stageWidth + 12}
                    y={y + stageHeight / 2 - 2}
                    fontSize="9"
                    fill="#64748B"
                    fontWeight="700"
                    className="uppercase tracking-wider"
                  >
                    {etapa.costLabel}
                  </text>
                  <text
                    x={x + stageWidth + 12}
                    y={y + stageHeight / 2 + 12}
                    fontSize="13"
                    fill="#0F172A"
                    fontWeight="800"
                  >
                    {formatCurrency(etapa.cost)}
                  </text>
                </>
              )}
            </g>
          );
        })}
      </svg>
    </div>
  );
}
