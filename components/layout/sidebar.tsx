'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';
import {
  Home,
  BarChart3,
  Image as ImageIcon,
  Users,
  Megaphone,
  Lightbulb,
  Settings2,
  Sun,
  Moon,
  LogOut,
} from 'lucide-react';
import { useState, useEffect } from 'react';

const NAV = [
  {
    group: 'Menu Principal',
    items: [{ href: '/dashboard', label: 'Início', icon: Home }],
  },
  {
    group: 'Inteligência de Dados',
    items: [
      { href: '/dashboard/inteligencia-de-dados', label: 'Visão Geral', icon: BarChart3 },
      { href: '/dashboard/inteligencia-de-dados/criativos', label: 'Criativos', icon: ImageIcon },
      { href: '/dashboard/inteligencia-de-dados/publicos', label: 'Públicos', icon: Users },
      { href: '/dashboard/inteligencia-de-dados/campanhas', label: 'Campanhas', icon: Megaphone },
      { href: '/dashboard/inteligencia-de-dados/otimizacoes', label: 'Análise & Otimizações', icon: Lightbulb },
      { href: '/dashboard/inteligencia-de-dados/construtor-funil', label: 'Construtor de Funil', icon: Settings2 },
    ],
  },
];

export function Sidebar() {
  const pathname = usePathname();
  const [theme, setTheme] = useState<'light' | 'dark'>('light');

  useEffect(() => {
    const saved = localStorage.getItem('theme') as 'light' | 'dark' | null;
    if (saved) {
      setTheme(saved);
      document.documentElement.classList.toggle('dark', saved === 'dark');
    }
  }, []);

  function toggleTheme() {
    const next = theme === 'light' ? 'dark' : 'light';
    setTheme(next);
    localStorage.setItem('theme', next);
    document.documentElement.classList.toggle('dark', next === 'dark');
  }

  return (
    <aside className="w-[248px] bg-alicerce text-white flex flex-col sticky top-0 h-screen overflow-y-auto">
      {/* Brand */}
      <div className="p-4 border-b border-white/10">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 bg-navy rounded-md flex items-center justify-center">
            <span className="text-white font-extrabold text-base tracking-tighter">if</span>
          </div>
          <div>
            <div className="text-sm font-extrabold tracking-tight">infotráfego</div>
            <div className="text-[10px] text-ash uppercase tracking-wider">
              Inteligência de Dados
            </div>
          </div>
        </div>
      </div>

      {/* Cliente ativo (placeholder · vamos implementar o seletor depois) */}
      <div className="px-4 py-3 border-b border-white/10">
        <div className="text-[10px] uppercase tracking-wider text-ash mb-1">
          Cliente ativo
        </div>
        <button className="w-full text-left px-3 py-2 bg-white/5 hover:bg-white/10 rounded-md text-sm font-bold flex items-center justify-between">
          <span>Infotráfego</span>
          <span className="text-ash text-xs">▼</span>
        </button>
      </div>

      {/* Nav */}
      <nav className="flex-1 px-3 py-4 space-y-4">
        {NAV.map((group) => (
          <div key={group.group}>
            <div className="text-[10px] uppercase tracking-wider text-ash font-bold px-3 mb-2">
              {group.group}
            </div>
            <div className="space-y-0.5">
              {group.items.map((item) => {
                const Icon = item.icon;
                const active = pathname === item.href;
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={cn(
                      'flex items-center gap-2.5 px-3 py-2 rounded-md text-sm transition',
                      active
                        ? 'bg-navy text-white'
                        : 'text-ash hover:bg-white/5 hover:text-white',
                    )}
                  >
                    <Icon size={16} />
                    <span>{item.label}</span>
                  </Link>
                );
              })}
            </div>
          </div>
        ))}
      </nav>

      {/* Footer */}
      <div className="p-3 border-t border-white/10 space-y-2">
        <button
          onClick={toggleTheme}
          className="w-full flex items-center gap-2 px-3 py-2 text-sm text-ash hover:text-white hover:bg-white/5 rounded-md transition"
        >
          {theme === 'light' ? <Moon size={16} /> : <Sun size={16} />}
          Modo {theme === 'light' ? 'escuro' : 'claro'}
        </button>
        <button
          onClick={async () => {
            const { createClient } = await import('@/lib/supabase/client');
            await createClient().auth.signOut();
            window.location.href = '/login';
          }}
          className="w-full flex items-center gap-2 px-3 py-2 text-sm text-ash hover:text-white hover:bg-white/5 rounded-md transition"
        >
          <LogOut size={16} />
          Sair
        </button>
      </div>
    </aside>
  );
}
