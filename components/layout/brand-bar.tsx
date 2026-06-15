'use client';

import { ChevronDown } from 'lucide-react';

export function BrandBar() {
  return (
    <header className="bg-alicerce text-white px-7 py-3.5 flex items-center gap-5">
      {/* Brand */}
      <div className="flex items-center gap-3 shrink-0">
        <div className="w-7 h-7 bg-white rounded flex items-center justify-center">
          <span className="text-navy font-extrabold text-xs tracking-tighter">if</span>
        </div>
        <div className="flex flex-col">
          <span className="text-base font-extrabold tracking-tight leading-none">
            infotráfego
          </span>
          <span className="text-[10px] text-ash uppercase tracking-wider mt-0.5">
            Inteligência de Dados
          </span>
        </div>
      </div>

      {/* Filtros · empurrados pra direita */}
      <div className="ml-auto flex items-center gap-2 flex-wrap">
        <FilterPill label="Cliente" value="Infotráfego" primary />
        <FilterPill label="Período" value="30d" />
        <FilterPill label="Funil" value="Aquisição de Clientes" />
      </div>
    </header>
  );
}

function FilterPill({
  label,
  value,
  primary = false,
}: {
  label: string;
  value: string;
  primary?: boolean;
}) {
  return (
    <button
      className={`px-3 py-1.5 rounded-md text-xs font-bold flex items-center gap-1.5 transition ${
        primary
          ? 'bg-white/15 border border-white/25 hover:bg-white/20'
          : 'bg-white/8 border border-white/15 hover:bg-white/14'
      }`}
    >
      <span className="text-[9px] uppercase tracking-wider text-white/45 font-extrabold">
        {label}
      </span>
      <span className="text-white">{value}</span>
      <ChevronDown size={11} className="text-white/60" />
    </button>
  );
}
