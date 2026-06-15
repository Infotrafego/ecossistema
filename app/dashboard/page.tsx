import Link from 'next/link';
import { BarChart3, Settings2 } from 'lucide-react';

export default function DashboardHome() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-extrabold tracking-tight">Início</h1>
        <p className="text-sm text-[rgb(var(--muted))] mt-1">
          Bem-vindo · ecossistema Infotráfego em desenvolvimento
        </p>
      </div>

      <div className="grid md:grid-cols-2 gap-4">
        <Link
          href="/dashboard/inteligencia-de-dados"
          className="card hover:border-navy transition group"
        >
          <BarChart3 className="text-navy mb-3" size={24} />
          <h3 className="font-extrabold tracking-tight">Inteligência de Dados</h3>
          <p className="text-sm text-[rgb(var(--muted))] mt-1">
            Dashboard que substitui o Looker · cliente piloto Infotráfego
          </p>
          <span className="text-xs text-navy font-bold mt-3 inline-block group-hover:underline">
            Abrir →
          </span>
        </Link>

        <Link
          href="/dashboard/inteligencia-de-dados/construtor-funil"
          className="card hover:border-navy transition group"
        >
          <Settings2 className="text-navy mb-3" size={24} />
          <h3 className="font-extrabold tracking-tight">Construtor de Funil</h3>
          <p className="text-sm text-[rgb(var(--muted))] mt-1">
            Configurar funis modulares · 4 famílias × 14 sub-objetivos
          </p>
          <span className="text-xs text-navy font-bold mt-3 inline-block group-hover:underline">
            Abrir →
          </span>
        </Link>
      </div>

      <div className="card text-xs text-[rgb(var(--muted))]">
        <strong className="text-ink">Próximas fases:</strong> Relatórios Diários · Action toolbar CRUD Meta · Inteligência IA · Comercial · CS · Debriefings · Portal Cliente · Gestão Interna · App Unificado.
      </div>
    </div>
  );
}
