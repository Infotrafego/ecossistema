'use client';

/**
 * Sidebar do ecossistema
 *
 * Espelha a navegação do mockup unificado: um grupo por plataforma, e dentro
 * dele um item por aba. Os módulos novos são rota única com `?tab=`, então o
 * item aponta direto pra aba — o estado ativo compara pathname + tab.
 *
 * Grupos são colapsáveis porque a lista inteira não cabe na tela: o grupo da
 * rota atual abre sozinho, os outros começam fechados. A preferência do
 * usuário sobrescreve isso e fica no localStorage.
 */

import Link from 'next/link';
import { usePathname, useSearchParams } from 'next/navigation';
import { cn } from '@/lib/utils';
import {
  Activity,
  BarChart3,
  Bot,
  Briefcase,
  Building2,
  Calendar,
  ChevronDown,
  ClipboardList,
  Compass,
  DollarSign,
  FileBarChart,
  FileText,
  FlaskConical,
  Gauge,
  HeartPulse,
  Home,
  Image as ImageIcon,
  LayoutGrid,
  LifeBuoy,
  Lightbulb,
  LogOut,
  Megaphone,
  MessageCircle,
  Moon,
  Newspaper,
  PenLine,
  PieChart,
  RefreshCw,
  Rocket,
  Settings2,
  Share2,
  Sparkles,
  Star,
  Sun,
  Target,
  TrendingUp,
  TriangleAlert,
  UserPlus,
  Users,
} from 'lucide-react';
import { useEffect, useState, type ComponentType } from 'react';

interface Item {
  href: string;
  label: string;
  icon: ComponentType<{ size?: number | string }>;
  pill?: string;
  pillWarn?: boolean;
}

interface Grupo {
  id: string;
  nome: string;
  items: Item[];
}

const NAV: Grupo[] = [
  {
    id: 'principal',
    nome: 'Menu Principal',
    items: [{ href: '/dashboard', label: 'Início', icon: Home }],
  },
  {
    id: 'inteligencia',
    nome: 'Inteligência de Dados',
    items: [
      { href: '/dashboard/inteligencia-de-dados', label: 'Visão Geral', icon: BarChart3 },
      { href: '/dashboard/inteligencia-de-dados/criativos', label: 'Criativos', icon: ImageIcon },
      { href: '/dashboard/inteligencia-de-dados/publicos', label: 'Públicos', icon: Users },
      { href: '/dashboard/inteligencia-de-dados/campanhas', label: 'Campanhas', icon: Megaphone },
      { href: '/dashboard/inteligencia-de-dados/otimizacoes', label: 'Análise & Otimizações', icon: Lightbulb },
      { href: '/dashboard/inteligencia-de-dados/construtor-funil', label: 'Construtor de Funil', icon: Settings2 },
    ],
  },
  {
    id: 'relatorios',
    nome: 'Relatórios Diários',
    items: [{ href: '/dashboard/relatorios', label: 'Fila do dia', icon: FileBarChart, pill: 'novo' }],
  },
  {
    id: 'ia',
    nome: 'Inteligência IA',
    items: [
      { href: '/dashboard/inteligencia-de-dados/assistente', label: 'Assistente', icon: Bot },
      { href: '/dashboard/inteligencia-de-dados/fadiga', label: 'Fadiga Criativa', icon: Activity },
      { href: '/dashboard/inteligencia-de-dados/regras', label: 'Regras Automáticas', icon: Settings2 },
      { href: '/dashboard/inteligencia-de-dados/copy', label: 'Copy IA', icon: PenLine },
      { href: '/dashboard/inteligencia-de-dados/benchmarks', label: 'Insights & Benchmarks', icon: Star, pill: 'novo' },
    ],
  },
  {
    id: 'comercial',
    nome: 'Comercial Consultivo',
    items: [
      { href: '/dashboard/comercial?tab=overview', label: 'Visão Geral', icon: Gauge },
      { href: '/dashboard/comercial?tab=calls', label: 'Calls', icon: MessageCircle },
      { href: '/dashboard/comercial?tab=leads', label: 'Leads', icon: Target },
      { href: '/dashboard/comercial?tab=time', label: 'Time', icon: Users },
      { href: '/dashboard/comercial?tab=padroes', label: 'Padrões & Coaching', icon: Sparkles },
      { href: '/dashboard/comercial?tab=historico', label: 'Histórico', icon: ClipboardList },
      { href: '/dashboard/comercial?tab=crm', label: 'CRM Kanban', icon: LayoutGrid },
      { href: '/dashboard/comercial?tab=conversas', label: 'Conversas WhatsApp', icon: MessageCircle },
    ],
  },
  {
    id: 'estrategia',
    nome: 'Estratégia & Inteligência',
    items: [
      { href: '/dashboard/estrategia?tab=visao', label: 'Visão Estratégica', icon: Compass },
      { href: '/dashboard/estrategia?tab=forecast', label: 'Forecast & Cenários', icon: TrendingUp },
      { href: '/dashboard/estrategia?tab=testes', label: 'Plano de Testes', icon: FlaskConical },
      { href: '/dashboard/estrategia?tab=saturacao', label: 'Mapa de Saturação', icon: Activity },
      { href: '/dashboard/estrategia?tab=budget', label: 'Alocação de Budget', icon: DollarSign },
      { href: '/dashboard/estrategia?tab=canais', label: 'Estratégia de Canal', icon: PieChart },
      { href: '/dashboard/estrategia?tab=organico', label: 'Conteúdo Orgânico', icon: Share2 },
      { href: '/dashboard/estrategia?tab=distribuicao', label: 'Distribuição de Conteúdo', icon: Rocket },
      { href: '/dashboard/estrategia?tab=reunioes', label: 'Reuniões & Decisões', icon: Calendar },
      { href: '/dashboard/estrategia?tab=discovery', label: 'Discovery & Persona', icon: Compass },
    ],
  },
  {
    id: 'debriefings',
    nome: 'Debriefings',
    items: [{ href: '/dashboard/debriefings', label: 'Todos os debriefings', icon: FileText, pill: 'novo' }],
  },
  {
    id: 'cs',
    nome: 'CS · Gestão de Carteira',
    items: [
      { href: '/dashboard/cs?tab=portfolio', label: 'Portfolio', icon: Briefcase },
      { href: '/dashboard/cs?tab=riscos', label: 'Riscos', icon: TriangleAlert, pill: '5', pillWarn: true },
      { href: '/dashboard/cs?tab=cliente', label: 'Drill-down por Cliente', icon: HeartPulse },
      { href: '/dashboard/cs?tab=pendencias', label: 'Pendências', icon: ClipboardList },
      { href: '/dashboard/cs?tab=calendario', label: 'Calendário', icon: Calendar },
    ],
  },
  {
    id: 'portal',
    nome: 'Portal Cliente',
    items: [
      { href: '/dashboard/portal?tab=infonews', label: 'InfoNews', icon: Newspaper },
      { href: '/dashboard/portal?tab=midia', label: 'Inteligência de Dados', icon: BarChart3 },
      { href: '/dashboard/portal?tab=comercial', label: 'Comercial', icon: Gauge },
      { href: '/dashboard/portal?tab=estrategia', label: 'Tráfego Estratégico', icon: TrendingUp },
      { href: '/dashboard/portal?tab=proximos', label: 'Próximos Passos', icon: Target },
    ],
  },
  {
    id: 'gestao',
    nome: 'Gestão Interna',
    items: [
      { href: '/dashboard/gestao-interna?tab=negocio', label: 'Visão do Negócio', icon: Building2 },
      { href: '/dashboard/gestao-interna?tab=pessoas', label: 'Gestão de Pessoas', icon: Users },
      { href: '/dashboard/gestao-interna?tab=sos', label: 'SOS', icon: TriangleAlert, pill: '1', pillWarn: true },
      { href: '/dashboard/gestao-interna?tab=financeiro', label: 'Aprovações Financeiras', icon: DollarSign },
      { href: '/dashboard/gestao-interna?tab=suporte', label: 'Suporte / Chamados', icon: LifeBuoy, pill: '3' },
      { href: '/dashboard/gestao-interna?tab=onboarding', label: 'Onboarding Cliente', icon: UserPlus },
    ],
  },
  {
    id: 'operacao',
    nome: 'Operação',
    items: [{ href: '/dashboard/inteligencia-de-dados/sync', label: 'Sync Meta Ads', icon: RefreshCw }],
  },
];

/** Grupos abertos por padrão — o resto abre sozinho quando a rota cai dentro. */
const ABERTOS_PADRAO = ['principal', 'inteligencia', 'relatorios'];

function separar(href: string): { path: string; tab: string | null } {
  const [path, query] = href.split('?');
  const tab = query ? new URLSearchParams(query).get('tab') : null;
  return { path, tab };
}

export function Sidebar() {
  const pathname = usePathname();
  const params = useSearchParams();
  const tabAtual = params.get('tab');

  const [theme, setTheme] = useState<'light' | 'dark'>('light');
  // Só o que o usuário clicou entra aqui; o resto segue o padrão calculado.
  const [override, setOverride] = useState<Record<string, boolean>>({});

  useEffect(() => {
    const saved = localStorage.getItem('theme') as 'light' | 'dark' | null;
    if (saved) {
      setTheme(saved);
      document.documentElement.classList.toggle('dark', saved === 'dark');
    }
    try {
      const grupos = localStorage.getItem('nav-grupos');
      if (grupos) setOverride(JSON.parse(grupos));
    } catch {
      // preferência corrompida não deve derrubar a navegação
    }
  }, []);

  function toggleTheme() {
    const next = theme === 'light' ? 'dark' : 'light';
    setTheme(next);
    localStorage.setItem('theme', next);
    document.documentElement.classList.toggle('dark', next === 'dark');
  }

  function toggleGrupo(id: string, abertoAgora: boolean) {
    setOverride((atual) => {
      const proximo = { ...atual, [id]: !abertoAgora };
      localStorage.setItem('nav-grupos', JSON.stringify(proximo));
      return proximo;
    });
  }

  function itemAtivo(href: string) {
    const { path, tab } = separar(href);
    if (pathname !== path) return false;
    if (!tab) return true;
    // A primeira aba também responde pela URL sem `?tab=`.
    return tabAtual === tab || (tabAtual === null && ehPrimeiraAba(path, tab));
  }

  function grupoContemRota(g: Grupo) {
    return g.items.some((i) => pathname === separar(i.href).path);
  }

  return (
    <aside className="w-[248px] bg-alicerce text-white flex flex-col sticky top-0 h-screen overflow-y-auto shrink-0">
      {/* Brand */}
      <div className="p-4 border-b border-white/10">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 bg-navy rounded-md flex items-center justify-center">
            <span className="text-white font-extrabold text-base tracking-tighter">if</span>
          </div>
          <div>
            <div className="text-sm font-extrabold tracking-tight">infotráfego</div>
            <div className="text-[10px] text-ash uppercase tracking-wider">Ecossistema</div>
          </div>
        </div>
      </div>

      {/* Nav */}
      <nav className="flex-1 px-3 py-4 space-y-2">
        {NAV.map((grupo) => {
          const padrao = ABERTOS_PADRAO.includes(grupo.id) || grupoContemRota(grupo);
          const aberto = override[grupo.id] ?? padrao;

          return (
            <div key={grupo.id}>
              <button
                type="button"
                onClick={() => toggleGrupo(grupo.id, aberto)}
                className="w-full flex items-center justify-between px-3 py-1.5 text-[10px] uppercase tracking-wider text-ash font-bold hover:text-white transition"
              >
                <span>{grupo.nome}</span>
                <ChevronDown
                  size={12}
                  className={cn('transition-transform', !aberto && '-rotate-90')}
                />
              </button>

              {aberto && (
                <div className="space-y-0.5 mt-0.5">
                  {grupo.items.map((item) => {
                    const Icon = item.icon;
                    const ativo = itemAtivo(item.href);
                    return (
                      <Link
                        key={item.href}
                        href={item.href}
                        className={cn(
                          'flex items-center gap-2.5 px-3 py-1.5 rounded-md text-[13px] transition',
                          ativo ? 'bg-navy text-white' : 'text-ash hover:bg-white/5 hover:text-white',
                        )}
                      >
                        <Icon size={15} />
                        <span className="truncate">{item.label}</span>
                        {item.pill && (
                          <span
                            className={cn(
                              'ml-auto text-[9px] font-extrabold px-1.5 py-0.5 rounded shrink-0',
                              item.pillWarn ? 'bg-warn text-white' : 'bg-white/10 text-ash',
                            )}
                          >
                            {item.pill}
                          </span>
                        )}
                      </Link>
                    );
                  })}
                </div>
              )}
            </div>
          );
        })}
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

/** Primeira aba de cada módulo — usada pra marcar o item certo sem `?tab=`. */
const PRIMEIRA_ABA: Record<string, string> = {
  '/dashboard/comercial': 'overview',
  '/dashboard/estrategia': 'visao',
  '/dashboard/cs': 'portfolio',
  '/dashboard/portal': 'infonews',
  '/dashboard/gestao-interna': 'negocio',
};

function ehPrimeiraAba(path: string, tab: string) {
  return PRIMEIRA_ABA[path] === tab;
}
