/**
 * Início · hub executivo do App Unificado (Fase 8)
 *
 * Consolida as plataformas numa tela só: faixa de KPIs, alertas centralizados
 * (cada um apontando pra rota que resolve) e o cartão de saúde por pilar.
 * Os números são mockados — quem tem dado real é a Inteligência de Dados.
 */

import Link from 'next/link';
import { ArrowRight } from 'lucide-react';
import { KPIS_HUB, ALERTAS_HUB, PILARES } from '@/data/mock-hub';
import {
  Alerta,
  AvisoMock,
  Cabecalho,
  Cartao,
  FaixaKpis,
  Kpi,
  Selo,
  TextoForte,
  type Tom,
} from '@/components/mock/ui';
import { cn } from '@/lib/utils';

const SAUDE_TOM: Record<string, Tom> = {
  SAUDÁVEL: 'ok',
  ATENÇÃO: 'atencao',
  'EM CURSO': 'neutro',
};

export default function DashboardHome() {
  const altos = ALERTAS_HUB.filter((a) => a.prioridade === 'alta').length;
  const medios = ALERTAS_HUB.filter((a) => a.prioridade === 'media').length;
  const baixos = ALERTAS_HUB.filter((a) => a.prioridade === 'baixa').length;

  return (
    <div className="space-y-5">
      <Cabecalho
        titulo="Início"
        subtitulo="Painel executivo · snapshot consolidado das plataformas internas · últimos 30 dias"
      />

      <AvisoMock fase="App Unificado">
        Snapshot consolidado do ecossistema. A Inteligência de Dados já roda com dado real da Meta; as
        demais plataformas são maquete de front-end até a fase de cada uma entrar.
      </AvisoMock>

      <FaixaKpis>
        {KPIS_HUB.map((k) => (
          <Kpi key={k.rotulo} rotulo={k.rotulo} valor={k.valor} nota={k.delta} tom={k.tom} destaque={k.destaque} />
        ))}
      </FaixaKpis>

      <Cartao
        titulo="Alertas centralizados · ações sugeridas pela IA"
        meta={`${ALERTAS_HUB.length} alertas · ${altos} altos · ${medios} médios · ${baixos} baixo`}
      >
        <div>
          {ALERTAS_HUB.map((a) => (
            <Alerta key={a.texto} origem={a.origem} prioridade={a.prioridade} href={a.href}>
              <TextoForte texto={a.texto} />
            </Alerta>
          ))}
        </div>
      </Cartao>

      <div className="grid lg:grid-cols-2 gap-3">
        {PILARES.map((p) => (
          <Link key={p.nome} href={p.href} className="card hover:border-navy transition group">
            <div className="flex items-start justify-between gap-3 mb-3">
              <div>
                <div className="font-extrabold tracking-tight text-[13px] group-hover:text-navy transition">
                  {p.nome}
                </div>
                <div className="text-[10px] text-[rgb(var(--muted))]">{p.sub}</div>
              </div>
              <Selo tom={SAUDE_TOM[p.saude]}>{p.saude}</Selo>
            </div>

            <div className="grid grid-cols-3 gap-2 mb-3">
              {p.kpis.map((k) => (
                <div key={k.rotulo}>
                  <div className="kpi-label">{k.rotulo}</div>
                  <div className="text-base font-extrabold tracking-tight">{k.valor}</div>
                  <div
                    className={cn(
                      'text-[9px] font-bold',
                      k.tom === 'ok' ? 'text-success' : k.tom === 'ruim' ? 'text-warn' : 'text-[rgb(var(--muted))]',
                    )}
                  >
                    {k.nota}
                  </div>
                </div>
              ))}
            </div>

            <p
              className={cn(
                'text-[10px] leading-relaxed rounded-md px-2.5 py-2',
                p.highlightTom === 'atencao'
                  ? 'bg-attention/10 text-attention'
                  : 'bg-navy/5 text-[rgb(var(--muted))]',
              )}
            >
              {p.highlight}
            </p>

            <span className="text-[10px] text-navy font-extrabold mt-3 inline-flex items-center gap-1 group-hover:underline">
              Abrir <ArrowRight size={11} />
            </span>
          </Link>
        ))}
      </div>
    </div>
  );
}
