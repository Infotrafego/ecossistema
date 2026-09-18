/**
 * Visão Geral · Inteligência de Dados
 *
 * Referência visual: docs/mockups/creative-intel/index.html (`data-page="overview"`).
 * Ordem das seções igual à do mockup: metas → orçamento → cone → séries →
 * tabelas diárias → distribuições → jornada → alertas.
 *
 * Tudo aqui é derivado da config do funil selecionado. Trocar o funil no filtro
 * do topo troca os KPIs, as etapas do cone e o eixo de distribuição — sem
 * nenhum ramo `if (cliente === 'X')` no caminho.
 */

import { cardsDoTopo, montarCone, projecoesComerciais } from '@/lib/cone';
import { resolverContexto } from '@/lib/data/contexto';
import { getDadosIntel } from '@/lib/data/intel';
import { getMetasDoMes, getOrcamento, montarMetas } from '@/lib/data/metas';
import { getResumoSync } from '@/lib/data/sync';
import { alertasAtivos } from '@/lib/analise';
import { BENCHMARKS, fmtMoeda, fmtNum, type Metricas } from '@/lib/intel';
import { calcularMeta, calcularOrcamento, diasNoMes } from '@/lib/orcamento';
import { eixoDeDistribuicao, ROTULO_EIXO } from '@/lib/funil-kpis';
import { periodoAnterior, type ParamsBrutos } from '@/lib/filtros';
import { FunilCone } from '@/components/dashboard/funil-cone';
import { KpiRow } from '@/components/dashboard/overview/kpi-row';
import { SeriesTemporaisLazy } from '@/components/dashboard/overview/series-lazy';
import { TabelasDiarias } from '@/components/dashboard/overview/tabelas-diarias';
import {
  AlertasAtivos,
  Distribuicoes,
  Jornada,
  PainelMetas,
  PainelOrcamento,
} from '@/components/dashboard/overview/paineis';
import { EstadoVazio, motivoDoVazio } from '@/components/dashboard/intel/estado-vazio';
import { NotaProjecao } from '@/components/dashboard/intel/nota-projecao';

export const dynamic = 'force-dynamic';

const MESES = [
  'Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho',
  'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro',
];

export default async function VisaoGeralPage({
  searchParams,
}: {
  searchParams: Promise<ParamsBrutos>;
}) {
  const ctx = await resolverContexto(await searchParams);
  if (!ctx.cliente) return <EstadoVazio motivo="sem_acesso" />;

  const filtros = {
    clientId: ctx.cliente.id,
    funilId: ctx.filtros.funilId,
    desde: ctx.filtros.desde,
    ate: ctx.filtros.ate,
  };

  const anterior = periodoAnterior(ctx.filtros);

  const [dados, dadosAnteriores] = await Promise.all([
    getDadosIntel(filtros),
    // Só pro delta dos KPIs. Falhar aqui não pode derrubar a página: sem base
    // de comparação a tela ainda vale, só perde as setinhas.
    getDadosIntel({ ...filtros, desde: anterior.desde, ate: anterior.ate }).catch(() => null),
  ]);

  if (dados.vazio) {
    const { houveSync } = await getResumoSync(ctx.cliente.id, 5);
    return (
      <EstadoVazio
        motivo={motivoDoVazio({ semAcesso: false, contaMeta: ctx.cliente.contaMeta, houveSync })}
      />
    );
  }

  // O painel mensal segue o mês do FIM do período: se o gestor olha "últimos 30
  // dias" no dia 5 de outubro, a régua de metas que interessa é a de outubro.
  const fim = new Date(`${ctx.filtros.ate}T00:00:00Z`);
  const ano = fim.getUTCFullYear();
  const mes = fim.getUTCMonth() + 1;
  const diasDoMes = diasNoMes(ano, mes);
  const diasDecorridos = fim.getUTCDate();
  const mesLabel = `${MESES[mes - 1]}/${String(ano).slice(2)}`;

  const [orcamentoConfig, metasConfig, dadosDoMes] = await Promise.all([
    getOrcamento(ctx.cliente.id, ano, mes),
    getMetasDoMes(ctx.filtros.funilId, ano, mes),
    // Metas e verba são MENSAIS; comparar com o gasto de um período de 7 dias
    // daria um "ritmo" sem sentido. Então o painel do mês lê o mês inteiro,
    // independente do filtro de período.
    getDadosIntel({
      ...filtros,
      desde: `${ano}-${String(mes).padStart(2, '0')}-01`,
      ate: ctx.filtros.ate,
    }).catch(() => null),
  ]);

  const totalDoMes: Metricas = dadosDoMes?.total ?? dados.total;

  const orcamento = calcularOrcamento({
    tipo: orcamentoConfig.tipo,
    verbaMensal: orcamentoConfig.verbaMensal,
    saldoPrepago: orcamentoConfig.saldoPrepago,
    gastoMtd: totalDoMes.spend,
    diasDecorridos,
    diasDoMes,
  });

  const metas = montarMetas(dados.funil, metasConfig, totalDoMes).map((m) =>
    calcularMeta(m, diasDecorridos, diasDoMes),
  );

  const cone = dados.funil
    ? montarCone(dados.funil, dados.total, {
        projecoes: projecoesComerciais(dados.total, {
          showRate: BENCHMARKS.showRate,
          closeRate: BENCHMARKS.closeRate,
        }),
      })
    : [];

  const cards = cardsDoTopo(dados.funil?.familia ?? null, dados.total, {
    moeda: fmtMoeda,
    num: fmtNum,
  });

  const alertas = alertasAtivos(dados.criativos);
  const eixo = eixoDeDistribuicao(dados.funil?.familia ?? null);

  return (
    <div className="space-y-7">
      <header>
        <h1 className="text-xl font-extrabold tracking-tight">Visão Geral</h1>
        <p className="text-sm text-[rgb(var(--muted))] mt-1">
          {ctx.cliente.nome}
          {dados.funil ? ` · ${dados.funil.nome}` : ' · todos os funis'} ·{' '}
          {ctx.filtros.desde.split('-').reverse().join('/')} a{' '}
          {ctx.filtros.ate.split('-').reverse().join('/')}
        </p>
      </header>

      <PainelMetas
        metas={metas}
        diasDecorridos={diasDecorridos}
        diasDoMes={diasDoMes}
        mesLabel={mesLabel}
      />

      <PainelOrcamento
        orcamento={orcamento}
        configurado={orcamentoConfig.configurado}
        mesLabel={mesLabel}
      />

      <KpiRow funil={dados.funil} total={dados.total} anterior={dadosAnteriores?.total ?? null} />

      <section className="space-y-3">
        <h2 className="text-xs uppercase tracking-wider font-bold text-[rgb(var(--muted))]">
          Funil completo · taxas de conversão e custo por etapa
        </h2>
        <div className="card space-y-4">
          <div className="grid grid-cols-3 gap-3">
            {cards.map((c) => (
              <div
                key={c.label}
                className="rounded-lg border border-[rgb(var(--border))] bg-[rgb(var(--bg))] px-3 py-2"
              >
                <div className="kpi-label">{c.label}</div>
                <div className="text-lg font-extrabold tracking-tight tabular-nums mt-0.5">
                  {c.valor}
                </div>
                <div className="text-[10px] text-[rgb(var(--muted))]">{c.sub}</div>
              </div>
            ))}
          </div>

          {cone.length > 0 ? (
            <FunilCone etapas={cone} />
          ) : (
            <p className="text-[11px] text-[rgb(var(--muted))] py-4 text-center">
              Selecione um funil no filtro do topo pra desenhar o cone. As etapas vêm da config
              cadastrada no Construtor.
            </p>
          )}
        </div>
      </section>

      <SeriesTemporaisLazy diario={dados.diario} />

      <TabelasDiarias diario={dados.diario} />

      <Distribuicoes
        campanhas={dados.campanhas}
        publicos={dados.publicos}
        criativos={dados.criativos}
        rotuloEixo={ROTULO_EIXO[eixo]}
      />

      <Jornada total={dados.total} />

      <AlertasAtivos alertas={alertas} />

      <NotaProjecao />
    </div>
  );
}
