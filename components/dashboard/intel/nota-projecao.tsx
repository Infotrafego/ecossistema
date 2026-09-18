/**
 * Aviso de dados projetados · repetido no rodapé das abas de ranking.
 *
 * Existe porque o mockup deixa explícito para o gestor quais números vêm da
 * mídia e quais são benchmark — sem isso o time lê ROAS projetado como real.
 */

export function NotaProjecao() {
  return (
    <div className="bg-attention-bg border border-attention/30 text-attention rounded-lg p-3 text-[11px]">
      <strong>📊 Projeção:</strong> Reuniões, Vendas, Receita, CAC, ROAS e LTV são calculados por
      benchmark (show rate 70% · close 25% · ticket R$ 8.000) enquanto o CRM não está integrado.
      Leads, MQLs, agendamentos e investimento são dados de mídia. Base mockada em{' '}
      <code className="bg-white/40 px-1 rounded">data/mock-intel.ts</code>.
    </div>
  );
}
