/**
 * Visão diária e visão por dia da semana
 *
 * A segunda tabela é o que o mockup chama de "qual dia bate melhor" e não
 * existia no app. A coluna `(Nd)` ao lado do nome do dia não é enfeite: num
 * período de 10 dias há 2 segundas e 1 sábado, e sem esse número o gestor
 * compararia amostras de tamanhos diferentes como se fossem iguais.
 */

import type { LinhaDiaria } from '@/lib/data/intel';
import { porDiaDaSemana } from '@/lib/analise';
import { fmtMoeda, fmtNum } from '@/lib/intel';
import { cn } from '@/lib/utils';

const CABECALHO = [
  'Investimento',
  'Leads',
  'CPL',
  'MQL',
  'CPMQL',
  'Agend.',
  'CRA',
  'Reuniões 📊',
  'Vendas 📊',
];

const NOMES_CURTOS = ['dom', 'seg', 'ter', 'qua', 'qui', 'sex', 'sáb'];

export function TabelasDiarias({ diario }: { diario: LinhaDiaria[] }) {
  // Mais recente em cima: o gestor abre a tela pra ver ontem, não o começo do mês.
  const porData = [...diario].sort((a, b) => b.date.localeCompare(a.date));
  const semana = porDiaDaSemana(diario);

  return (
    <div className="grid xl:grid-cols-2 gap-4">
      <section className="card p-0 overflow-hidden">
        <h3 className="text-xs font-extrabold tracking-tight p-3 pb-2">
          Visão diária{' '}
          <span className="font-medium text-[rgb(var(--muted))] text-[11px]">
            · performance dia a dia
          </span>
        </h3>
        <div className="overflow-auto max-h-[380px]">
          <table className="w-full text-[11px]">
            <Cabecalho primeira="Data" />
            <tbody>
              {porData.map((d) => {
                const dow = new Date(`${d.date}T00:00:00Z`).getUTCDay();
                return (
                  <Linha
                    key={d.date}
                    rotulo={
                      <>
                        {d.date.slice(8, 10)}/{d.date.slice(5, 7)}{' '}
                        <span className="text-[rgb(var(--muted))] font-normal">{NOMES_CURTOS[dow]}</span>
                      </>
                    }
                    linha={d}
                    classe={dow === 0 || dow === 6 ? 'bg-[rgb(var(--border))]/25' : undefined}
                  />
                );
              })}
            </tbody>
          </table>
        </div>
      </section>

      <section className="card p-0 overflow-hidden">
        <h3 className="text-xs font-extrabold tracking-tight p-3 pb-2">
          Visão por dia da semana{' '}
          <span className="font-medium text-[rgb(var(--muted))] text-[11px]">
            · qual dia bate melhor
          </span>
        </h3>
        <div className="overflow-auto">
          <table className="w-full text-[11px]">
            <Cabecalho primeira="Dia da semana" />
            <tbody>
              {semana.map((d) => (
                <Linha
                  key={d.dow}
                  rotulo={
                    <>
                      {d.nome}{' '}
                      <span className="text-[rgb(var(--muted))] font-normal text-[10px]">
                        ({d.dias}d)
                      </span>
                    </>
                  }
                  linha={d}
                  classe={
                    d.melhor
                      ? 'bg-success/10'
                      : d.pior
                        ? 'bg-warn/10'
                        : d.dow === 0 || d.dow === 6
                          ? 'bg-[rgb(var(--border))]/25'
                          : undefined
                  }
                />
              ))}
            </tbody>
          </table>
        </div>
        {semana.length > 0 && (
          <p className="text-[10px] text-[rgb(var(--muted))] px-3 py-2 border-t border-[rgb(var(--border))]">
            Verde = melhor dia por vendas (leads como desempate) · vermelho = pior.
          </p>
        )}
      </section>
    </div>
  );
}

function Cabecalho({ primeira }: { primeira: string }) {
  return (
    <thead className="sticky top-0 bg-[rgb(var(--surface))] z-10">
      <tr className="text-left text-[9px] uppercase tracking-wider text-[rgb(var(--muted))] font-bold border-y border-[rgb(var(--border))]">
        <th className="py-2 px-3">{primeira}</th>
        {CABECALHO.map((c) => (
          <th key={c} className="py-2 px-2 text-right whitespace-nowrap">
            {c}
          </th>
        ))}
      </tr>
    </thead>
  );
}

interface LinhaDados {
  spend: number;
  leads: number;
  mqls: number;
  agend: number;
  reunioes: number;
  vendas: number;
}

function Linha({
  rotulo,
  linha,
  classe,
}: {
  rotulo: React.ReactNode;
  linha: LinhaDados;
  classe?: string;
}) {
  const cpl = linha.leads > 0 ? linha.spend / linha.leads : null;
  const cpmql = linha.mqls > 0 ? linha.spend / linha.mqls : null;
  const cra = linha.agend > 0 ? linha.spend / linha.agend : null;

  return (
    <tr className={cn('border-b border-[rgb(var(--border))] last:border-0', classe)}>
      <td className="py-1.5 px-3 font-bold whitespace-nowrap">{rotulo}</td>
      <Num>{fmtMoeda(linha.spend, 0)}</Num>
      <Num forte>{fmtNum(linha.leads)}</Num>
      <Num>{fmtMoeda(cpl)}</Num>
      <Num forte>{fmtNum(linha.mqls)}</Num>
      <Num>{fmtMoeda(cpmql)}</Num>
      <Num>{fmtNum(linha.agend)}</Num>
      <Num>{fmtMoeda(cra)}</Num>
      <Num>{fmtNum(linha.reunioes)}</Num>
      <Num forte>{fmtNum(linha.vendas)}</Num>
    </tr>
  );
}

function Num({ children, forte = false }: { children: React.ReactNode; forte?: boolean }) {
  const vazio = children === '0' || children === '—';
  return (
    <td
      className={cn(
        'py-1.5 px-2 text-right tabular-nums',
        forte && !vazio && 'font-bold',
        vazio && 'text-[rgb(var(--muted))]',
      )}
    >
      {children}
    </td>
  );
}
