/**
 * Relatórios Diários (Fase 3)
 *
 * Reusa a infra da Inteligência de Dados: o mesmo funil vira um relatório por
 * cliente, nos três recortes que o time já usa hoje no WhatsApp (Ontem ·
 * Últimos 7 dias · Mês acumulado). A tela é a fila de revisão — gerar é
 * automático, disparar é decisão humana.
 *
 * Front-end mockado: nenhum disparo real acontece aqui.
 */

import { RELATORIOS, AGENDA_RELATORIOS } from '@/data/mock-relatorios';
import { RelatoriosView } from './view';

export const dynamic = 'force-dynamic';

export default function RelatoriosPage() {
  return <RelatoriosView relatorios={RELATORIOS} agenda={AGENDA_RELATORIOS} />;
}
