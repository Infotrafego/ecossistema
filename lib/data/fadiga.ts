/**
 * Cálculo e leitura da fadiga criativa
 *
 * O job roda logo depois do sync (mesma janela diária) porque depende das
 * métricas do dia já estarem gravadas. Critério de pronto: 100% dos criativos
 * ATIVOS, atualização diária.
 */

import { createClient } from '@/lib/supabase/server';
import { createServiceClient, type ServiceClient } from '@/lib/supabase/service';
import { diagnosticar, type DiagnosticoFadiga, type PontoDiario } from '@/lib/fadiga';

/** Janela de análise. 30 dias cobre a vida útil típica de um criativo. */
const DIAS_JANELA = 30;
const TAMANHO_PAGINA = 1000;

export interface ResultadoFadiga {
  clientId: string;
  criativosAvaliados: number;
  criticos: number;
  atencao: number;
  erro?: string;
}

/**
 * Recalcula a fadiga de todos os criativos com entrega recente.
 *
 * Usa service role porque `fadiga_creative` não tem policy de escrita para
 * `authenticated`: é resultado de job, não de ação de usuário.
 */
export async function recalcularFadiga(
  clientId: string,
  supabase: ServiceClient = createServiceClient(),
  // Parametrizável pra recalcular histórico: numa conta que parou de entregar,
  // a janela padrão de 30 dias não alcança nenhum criativo.
  diasJanela: number = DIAS_JANELA,
): Promise<ResultadoFadiga> {
  const desde = new Date(Date.now() - diasJanela * 86_400_000).toISOString().slice(0, 10);

  try {
    const { data: criativos, error: erroCriativos } = await supabase
      .from('creatives')
      .select('id, meta_id')
      .eq('client_id', clientId);

    if (erroCriativos) throw new Error(erroCriativos.message);
    if (!criativos?.length) {
      return { clientId, criativosAvaliados: 0, criticos: 0, atencao: 0 };
    }

    const idLocalPorMetaId = new Map(criativos.map((c) => [c.meta_id, c.id]));

    // Série diária no nível de criativo — a mesma que o sync agrega.
    const series = new Map<string, PontoDiario[]>();
    for (let offset = 0; ; offset += TAMANHO_PAGINA) {
      const { data, error } = await supabase
        .from('metrics_daily')
        .select('entity_id, date, impressions, clicks, spend, frequency')
        .eq('client_id', clientId)
        .eq('entity_type', 'creative')
        .gte('date', desde)
        .order('date', { ascending: true })
        .range(offset, offset + TAMANHO_PAGINA - 1);

      if (error) throw new Error(error.message);

      for (const linha of data ?? []) {
        const lista = series.get(linha.entity_id) ?? [];
        lista.push({
          date: linha.date,
          impressoes: Number(linha.impressions) || 0,
          cliques: Number(linha.clicks) || 0,
          spend: Number(linha.spend) || 0,
          frequencia: linha.frequency === null ? null : Number(linha.frequency),
        });
        series.set(linha.entity_id, lista);
      }

      if (!data || data.length < TAMANHO_PAGINA) break;
    }

    const linhas: Array<{
      creative_id: string;
      client_id: string;
      score: number;
      status: DiagnosticoFadiga['status'];
      days_active: number;
      last_refresh: string | null;
      calculated_at: string;
    }> = [];

    let criticos = 0;
    let atencao = 0;
    const agora = new Date().toISOString();

    for (const [metaId, serie] of series) {
      const creativeId = idLocalPorMetaId.get(metaId);
      // Métrica de criativo que não tem mais linha em `creatives` (apagado na
      // Meta): ignorar, senão o upsert quebra na FK.
      if (!creativeId) continue;

      const d = diagnosticar(serie);
      if (d.status === 'critico') criticos++;
      if (d.status === 'atencao') atencao++;

      linhas.push({
        creative_id: creativeId,
        client_id: clientId,
        score: d.score,
        status: d.status,
        days_active: d.diasAtivo,
        // Primeiro dia com entrega na janela — quando o criativo "estreou".
        last_refresh: serie[0]?.date ?? null,
        calculated_at: agora,
      });
    }

    for (let i = 0; i < linhas.length; i += 500) {
      const { error } = await supabase
        .from('fadiga_creative')
        .upsert(linhas.slice(i, i + 500), { onConflict: 'creative_id' });
      if (error) throw new Error(error.message);
    }

    return { clientId, criativosAvaliados: linhas.length, criticos, atencao };
  } catch (e) {
    return {
      clientId,
      criativosAvaliados: 0,
      criticos: 0,
      atencao: 0,
      erro: e instanceof Error ? e.message : String(e),
    };
  }
}

export async function recalcularFadigaTodos(
  diasJanela: number = DIAS_JANELA,
): Promise<ResultadoFadiga[]> {
  const supabase = createServiceClient();
  const { data: clientes } = await supabase.from('clients').select('id').eq('active', true);

  const resultados: ResultadoFadiga[] = [];
  for (const cliente of clientes ?? []) {
    resultados.push(await recalcularFadiga(cliente.id, supabase, diasJanela));
  }
  return resultados;
}

// ── Leitura (para a UI) ──────────────────────────────────────────────────────

export interface FadigaNaTela {
  creativeId: string;
  metaId: string;
  nome: string;
  score: number;
  status: 'saudavel' | 'atencao' | 'critico';
  diasAtivo: number;
  calculadoEm: string;
}

/** ⚠ SERVER ONLY. Lê com a sessão do usuário — o RLS isola por cliente. */
export async function getFadiga(clientId: string): Promise<FadigaNaTela[]> {
  const supabase = await createClient();

  const [{ data: fadiga }, { data: criativos }, { data: ads }] = await Promise.all([
    supabase
      .from('fadiga_creative')
      .select('creative_id, score, status, days_active, calculated_at')
      .eq('client_id', clientId)
      .order('score', { ascending: false }),
    supabase.from('creatives').select('id, meta_id').eq('client_id', clientId),
    // O nome que o gestor reconhece é o do ANÚNCIO; `creatives` guarda só a
    // copy e o hash, que não servem pra identificar na tela.
    supabase.from('ads').select('name, creative_id').eq('client_id', clientId),
  ]);

  const metaIdPorLocal = new Map((criativos ?? []).map((c) => [c.id, c.meta_id]));
  const nomePorCriativo = new Map<string, string>();
  for (const ad of ads ?? []) {
    if (ad.creative_id && !nomePorCriativo.has(ad.creative_id)) {
      nomePorCriativo.set(ad.creative_id, ad.name);
    }
  }

  return (fadiga ?? []).map((f) => ({
    creativeId: f.creative_id,
    metaId: metaIdPorLocal.get(f.creative_id) ?? f.creative_id,
    nome: nomePorCriativo.get(f.creative_id) ?? 'Criativo sem anúncio ativo',
    score: f.score,
    status: f.status,
    diasAtivo: f.days_active,
    calculadoEm: f.calculated_at,
  }));
}
