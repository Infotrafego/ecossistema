/**
 * Regras automáticas · leitura, execução e histórico (Fase 2c · C3)
 *
 * A execução passa pelo MESMO executor das ações manuais
 * (lib/meta-ads/executor.ts), com `origem: 'regra_auto'`. Duas consequências
 * que valem o acoplamento: toda ação automática cai no audit_log com estado
 * anterior e rollback, e a trava de conta (`META_WRITE_ALLOWED_ACCOUNTS`) vale
 * igual — uma regra ativa não consegue mexer numa conta de produção que o
 * Pablo não liberou.
 */

import { createClient } from '@/lib/supabase/server';
import { createServiceClient, type ServiceClient } from '@/lib/supabase/service';
import { executarAcao } from '@/lib/meta-ads/executor';
import { avaliarRegra, type Entidade, type RegraAvaliavel } from '@/lib/regras';
import type { RegraAuto, RegraExecucao } from '@/types/database';

const TAMANHO_PAGINA = 1000;

export interface ResultadoExecucao {
  regraId: string;
  status: 'sucesso' | 'parcial' | 'erro' | 'sem_alvos';
  dryRun: boolean;
  avaliados: number;
  casados: number;
  aplicadas: number;
  detalhes: Array<Record<string, unknown>>;
  erro?: string;
}

function paraAvaliavel(r: RegraAuto): RegraAvaliavel {
  return {
    id: r.id,
    nome: r.nome,
    escopo: r.escopo,
    condicoes: r.condicoes,
    operadorLogico: r.operador_logico,
    janelaDias: r.janela_dias,
    gastoMinimo: Number(r.gasto_minimo),
    acao: r.acao,
  } as RegraAvaliavel;
}

/** Ação da regra → id do catálogo, no escopo certo. */
function acaoDoCatalogo(regra: RegraAuto): string | null {
  const porEscopo = {
    campaign: {
      pausar: 'campanha.pausar',
      aumentar_orcamento: 'campanha.aumentar_orcamento',
      reduzir_orcamento: 'campanha.reduzir_orcamento',
    },
    adset: {
      pausar: 'publico.arquivar',
      aumentar_orcamento: 'campanha.aumentar_orcamento',
      reduzir_orcamento: 'campanha.reduzir_orcamento',
    },
    ad: {
      pausar: 'criativo.pausar',
      aumentar_orcamento: 'criativo.escalar_verba',
      reduzir_orcamento: 'criativo.escalar_verba',
    },
  } as const;

  if (regra.acao === 'notificar') return null;
  return porEscopo[regra.escopo][regra.acao] ?? null;
}

/**
 * Monta as entidades do escopo com a série diária dos últimos N dias.
 *
 * Busca `janela_dias × 2` de histórico: a janela conta só dias COM ENTREGA, e
 * um ad set que folgou no fim de semana precisa de mais dias corridos pra
 * juntar três dias de entrega.
 */
async function carregarEntidades(
  supabase: ServiceClient,
  clientId: string,
  escopo: 'campaign' | 'adset' | 'ad',
  janelaDias: number,
): Promise<Entidade[]> {
  const desde = new Date(Date.now() - janelaDias * 2 * 86_400_000).toISOString().slice(0, 10);

  const tabela = escopo === 'campaign' ? 'campaigns' : escopo === 'adset' ? 'adsets' : 'ads';
  const { data: entidades, error } = await supabase
    .from(tabela)
    .select('meta_id, name, status')
    .eq('client_id', clientId);

  if (error) throw new Error(`${tabela}: ${error.message}`);

  // Regra não age sobre o que já está parado.
  const ativas = (entidades ?? []).filter((e) => e.status === 'ACTIVE');
  if (ativas.length === 0) return [];

  const series = new Map<string, Entidade['dias']>();
  for (let offset = 0; ; offset += TAMANHO_PAGINA) {
    const { data, error: erroMetricas } = await supabase
      .from('metrics_daily')
      .select('entity_id, date, impressions, clicks, spend, frequency, stage_values')
      .eq('client_id', clientId)
      .eq('entity_type', escopo)
      .gte('date', desde)
      .order('date', { ascending: true })
      .range(offset, offset + TAMANHO_PAGINA - 1);

    if (erroMetricas) throw new Error(`metrics_daily: ${erroMetricas.message}`);

    for (const m of data ?? []) {
      const stages = (m.stage_values ?? {}) as Record<string, number>;
      const lista = series.get(m.entity_id) ?? [];
      lista.push({
        date: m.date,
        impressoes: Number(m.impressions) || 0,
        cliques: Number(m.clicks) || 0,
        spend: Number(m.spend) || 0,
        leads: Number(stages.lead ?? stages.aplicacao_completa ?? 0),
        mqls: Number(stages.mql ?? 0),
        frequencia: m.frequency === null ? null : Number(m.frequency),
      });
      series.set(m.entity_id, lista);
    }

    if (!data || data.length < TAMANHO_PAGINA) break;
  }

  return ativas.map((e) => ({
    id: e.meta_id,
    nome: e.name,
    tipo: escopo,
    dias: series.get(e.meta_id) ?? [],
  }));
}

/**
 * Executa uma regra.
 *
 * Em `dry_run` (o padrão de toda regra nova) avalia e registra o que FARIA, sem
 * chamar a Meta. É o modo em que uma regra deve viver por alguns dias antes de
 * receber permissão de mexer em verba.
 */
export async function executarRegra(
  regra: RegraAuto,
  supabase: ServiceClient = createServiceClient(),
): Promise<ResultadoExecucao> {
  const base = { regraId: regra.id, dryRun: regra.dry_run };

  try {
    const entidades = await carregarEntidades(
      supabase,
      regra.client_id,
      regra.escopo,
      regra.janela_dias,
    );

    const avaliacao = avaliarRegra(paraAvaliavel(regra), entidades);
    const detalhes: Array<Record<string, unknown>> = [];
    let aplicadas = 0;
    let houveErro = false;

    for (const alvo of avaliacao.casados) {
      const registro: Record<string, unknown> = {
        entidade_id: alvo.entidadeId,
        entidade_nome: alvo.entidadeNome,
        motivo: alvo.motivo,
        gasto_na_janela: alvo.gastoNaJanela,
      };

      const acaoId = acaoDoCatalogo(regra);

      if (regra.dry_run || !acaoId) {
        registro.resultado = regra.dry_run ? 'simulado' : 'notificado';
        detalhes.push(registro);
        continue;
      }

      const r = await executarAcao(supabase, {
        clientId: regra.client_id,
        userId: null,
        origem: 'regra_auto',
        acaoId,
        entityMetaId: alvo.entidadeId,
        entityNome: alvo.entidadeNome,
        params: regra.acao_params,
      });

      registro.resultado = r.ok ? 'aplicado' : 'erro';
      registro.mensagem = r.mensagem;
      registro.audit_log_id = r.auditId;
      if (r.ok) aplicadas++;
      else houveErro = true;
      detalhes.push(registro);
    }

    const status: ResultadoExecucao['status'] =
      avaliacao.casados.length === 0
        ? 'sem_alvos'
        : houveErro
          ? aplicadas > 0
            ? 'parcial'
            : 'erro'
          : 'sucesso';

    await supabase.from('regra_execucoes').insert({
      regra_id: regra.id,
      client_id: regra.client_id,
      status,
      dry_run: regra.dry_run,
      alvos_avaliados: avaliacao.avaliados,
      alvos_casados: avaliacao.casados.length,
      acoes_aplicadas: aplicadas,
      detalhes,
    });

    return {
      ...base,
      status,
      avaliados: avaliacao.avaliados,
      casados: avaliacao.casados.length,
      aplicadas,
      detalhes,
    };
  } catch (e) {
    const erro = e instanceof Error ? e.message : String(e);
    await supabase.from('regra_execucoes').insert({
      regra_id: regra.id,
      client_id: regra.client_id,
      status: 'erro',
      dry_run: regra.dry_run,
      alvos_avaliados: 0,
      alvos_casados: 0,
      acoes_aplicadas: 0,
      detalhes: [],
      erro,
    });
    return { ...base, status: 'erro', avaliados: 0, casados: 0, aplicadas: 0, detalhes: [], erro };
  }
}

/** Roda todas as regras ativas. Chamado pelo agendador, depois do sync. */
export async function executarRegrasAtivas(clientId?: string): Promise<ResultadoExecucao[]> {
  const supabase = createServiceClient();
  let query = supabase.from('regras_auto').select('*').eq('ativa', true);
  if (clientId) query = query.eq('client_id', clientId);

  const { data, error } = await query;
  if (error) throw new Error(`regras_auto: ${error.message}`);

  const resultados: ResultadoExecucao[] = [];
  for (const regra of (data ?? []) as RegraAuto[]) {
    resultados.push(await executarRegra(regra, supabase));
  }
  return resultados;
}

// ── CRUD (com a sessão do usuário · RLS ativo) ───────────────────────────────

export async function listarRegras(clientId: string): Promise<RegraAuto[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from('regras_auto')
    .select('*')
    .eq('client_id', clientId)
    .order('created_at', { ascending: false });

  if (error) throw new Error(`regras_auto: ${error.message}`);
  return (data ?? []) as RegraAuto[];
}

export async function listarExecucoes(clientId: string, limite = 40): Promise<RegraExecucao[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from('regra_execucoes')
    .select('*')
    .eq('client_id', clientId)
    .order('executed_at', { ascending: false })
    .limit(limite);

  if (error) throw new Error(`regra_execucoes: ${error.message}`);
  return (data ?? []) as RegraExecucao[];
}
