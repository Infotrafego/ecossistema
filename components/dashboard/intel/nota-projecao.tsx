/**
 * Aviso de dados projetados · repetido no rodapé das abas.
 *
 * Existe porque o mockup deixa explícito para o gestor quais números vêm da
 * mídia e quais são benchmark — sem isso o time lê ROAS projetado como real.
 * O prompt da fase é categórico: "não apresente projeção como dado real".
 */

import { BENCHMARKS } from '@/lib/intel';

export function NotaProjecao() {
  const show = Math.round(BENCHMARKS.showRate * 100);
  const close = Math.round(BENCHMARKS.closeRate * 100);
  const ticket = new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
    maximumFractionDigits: 0,
  }).format(BENCHMARKS.ticketMedio);

  return (
    <div className="bg-attention-bg border border-attention/30 text-attention rounded-lg p-3 text-[11px]">
      <strong>📊 Projeção:</strong> Reuniões realizadas, Vendas, Receita, CAC, ROAS e LTV são
      calculados por benchmark (show rate {show}% · fechamento {close}% · ticket {ticket}) enquanto
      o CRM não está integrado. Leads, MQLs, agendamentos e investimento são dados de mídia,
      sincronizados da Meta Marketing API. Quando a conta reporta compra e receita pelo pixel,
      esses números passam a ser reais e deixam de ser projetados.
    </div>
  );
}
