'use client';

/**
 * Linhas temporais da Visão Geral
 *
 * Duas séries lado a lado, como no mockup: funil (Leads × MQLs × Agendamentos)
 * e investimento diário. Recharts já estava no package.json — não custa
 * dependência nova.
 *
 * Client Component porque o gráfico mede o container pra ser responsivo, o que
 * exige DOM.
 */

import {
  Bar,
  BarChart,
  CartesianGrid,
  Legend,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import type { LinhaDiaria } from '@/lib/data/intel';
import { fmtMoeda, fmtNum } from '@/lib/intel';

const EIXO = { fontSize: 10, fill: 'rgb(100 116 139)' };

/** dd/mm — o ano é o mesmo do filtro e só roubaria espaço no eixo. */
function rotuloData(iso: string): string {
  return `${iso.slice(8, 10)}/${iso.slice(5, 7)}`;
}

export function SeriesTemporais({ diario }: { diario: LinhaDiaria[] }) {
  if (diario.length < 2) {
    return (
      <div className="card text-center py-8 text-[11px] text-[rgb(var(--muted))]">
        O período selecionado tem menos de dois dias com entrega — sem série pra desenhar.
      </div>
    );
  }

  const dados = diario.map((d) => ({ ...d, rotulo: rotuloData(d.date) }));

  return (
    <div className="grid lg:grid-cols-2 gap-4">
      <div className="card">
        <h3 className="text-xs font-extrabold tracking-tight mb-3">
          Evolução temporal · Leads × MQLs × Agendamentos
        </h3>
        <div className="h-[220px]">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={dados} margin={{ top: 4, right: 8, left: -18, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgb(226 232 240)" vertical={false} />
              <XAxis dataKey="rotulo" tick={EIXO} tickLine={false} axisLine={false} minTickGap={16} />
              <YAxis tick={EIXO} tickLine={false} axisLine={false} allowDecimals={false} />
              <Tooltip
                formatter={(v: number) => fmtNum(v)}
                contentStyle={{ fontSize: 11, borderRadius: 8 }}
              />
              <Legend wrapperStyle={{ fontSize: 11 }} />
              <Line type="monotone" dataKey="leads" name="Leads" stroke="#1A3D70" strokeWidth={2} dot={false} />
              <Line type="monotone" dataKey="mqls" name="MQLs" stroke="#2563EB" strokeWidth={2} dot={false} />
              <Line type="monotone" dataKey="agend" name="Agend." stroke="#16A34A" strokeWidth={2} dot={false} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="card">
        <h3 className="text-xs font-extrabold tracking-tight mb-3">Investimento diário</h3>
        <div className="h-[220px]">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={dados} margin={{ top: 4, right: 8, left: -8, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgb(226 232 240)" vertical={false} />
              <XAxis dataKey="rotulo" tick={EIXO} tickLine={false} axisLine={false} minTickGap={16} />
              <YAxis
                tick={EIXO}
                tickLine={false}
                axisLine={false}
                tickFormatter={(v: number) => fmtMoeda(v, 0)}
                width={62}
              />
              <Tooltip
                formatter={(v: number) => fmtMoeda(v)}
                contentStyle={{ fontSize: 11, borderRadius: 8 }}
              />
              <Bar dataKey="spend" name="Investido" fill="#1A3D70" radius={[2, 2, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}
