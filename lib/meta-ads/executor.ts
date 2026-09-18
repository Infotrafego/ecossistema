/**
 * Executor das ações CRUD na Meta · auditoria e rollback (Fase 2b)
 *
 * Fluxo de toda ação que toca a Meta, nesta ordem:
 *
 *   1. trava de conta       → a conta está liberada pra escrita?
 *   2. snapshot             → lê da Meta os campos que a ação vai mudar
 *   3. audit_log 'pendente' → grava QUEM, O QUÊ e o estado anterior
 *   4. chamada              → executa
 *   5. audit_log final      → 'sucesso' ou 'erro'
 *   6. se deu erro          → tenta reverter com o snapshot do passo 2
 *
 * O snapshot vem ANTES do log e o log vem ANTES da chamada de propósito: se o
 * processo morrer no meio, fica no banco uma linha 'pendente' com o estado
 * anterior — que é a informação necessária pra alguém desfazer na mão. A ordem
 * inversa deixaria a conta alterada sem nenhum registro.
 */

import type { ServiceClient } from '@/lib/supabase/service';
import { acaoPorId, type DefinicaoAcao } from './acoes';
import {
  MetaWriteBloqueadaError,
  ehSandbox,
  escritaLiberada,
  normalizarAdAccountId,
} from './config';
import { lerEntidade } from './client';
import { metaPost, Orcamento } from './http';

export interface PedidoAcao {
  clientId: string;
  /** `null` quando a ação vem de um job (Regras Auto). */
  userId: string | null;
  origem: 'ui' | 'assistente_ia' | 'regra_auto';
  acaoId: string;
  /** Id da entidade na Meta. Ausente nas ações de criação. */
  entityMetaId?: string;
  entityNome?: string;
  params?: Record<string, unknown>;
}

export interface ResultadoAcao {
  ok: boolean;
  auditId?: string;
  mensagem: string;
  /** Preenchido quando a ação criou algo novo. */
  novoId?: string;
  revertido?: boolean;
}

/** Campos lidos antes de mutar, por tipo de entidade. */
const CAMPOS_SNAPSHOT: Record<DefinicaoAcao['entidade'], string> = {
  campaign: 'id,name,status,daily_budget,lifetime_budget',
  adset: 'id,name,status,daily_budget,lifetime_budget',
  ad: 'id,name,status,adset_id',
  creative: 'id,name',
  audience: 'id,name',
};

/** Campos que o rollback sabe restaurar. */
const CAMPOS_REVERSIVEIS = ['name', 'status', 'daily_budget', 'lifetime_budget'];

async function contaDoCliente(supabase: ServiceClient, clientId: string): Promise<string> {
  const { data, error } = await supabase
    .from('clients')
    .select('meta_ad_account_id')
    .eq('id', clientId)
    .maybeSingle();

  if (error) throw new Error(`cliente ${clientId}: ${error.message}`);
  const conta = data?.meta_ad_account_id;
  if (!conta || conta.includes('PREENCHER')) {
    throw new Error('Cliente sem conta de anúncios configurada (clients.meta_ad_account_id).');
  }
  return normalizarAdAccountId(conta);
}

/**
 * Traduz a ação numa chamada à Marketing API.
 *
 * Devolve `{ path, body }` em vez de executar: assim o executor mantém o
 * controle de auditoria e rollback num lugar só, e testar a tradução não exige
 * tocar na API.
 */
export function montarChamada(
  acao: DefinicaoAcao,
  contexto: {
    conta: string;
    entityMetaId?: string;
    params: Record<string, unknown>;
    snapshot: Record<string, unknown>;
  },
): { path: string; body: Record<string, string | number | boolean | undefined> } {
  const { conta, entityMetaId, params, snapshot } = contexto;
  const alvo = entityMetaId ?? '';

  switch (acao.id) {
    case 'campanha.criar':
      return {
        path: `/${conta}/campaigns`,
        body: {
          name: String(params.nome ?? 'Nova campanha'),
          objective: String(params.objetivo ?? 'OUTCOME_LEADS'),
          // Sempre pausada: campanha nova entrando no ar sozinha é dinheiro
          // gastando antes de qualquer revisão.
          status: 'PAUSED',
          special_ad_categories: '[]',
        },
      };

    case 'publico.criar':
      return {
        path: `/${conta}/adsets`,
        body: {
          name: String(params.nome ?? 'Novo público'),
          campaign_id: String(params.campanhaId ?? ''),
          daily_budget: Math.round(Number(params.orcamentoDiario ?? 0) * 100),
          billing_event: String(params.billingEvent ?? 'IMPRESSIONS'),
          optimization_goal: String(params.optimizationGoal ?? 'OFFSITE_CONVERSIONS'),
          targeting: JSON.stringify(params.targeting ?? { geo_locations: { countries: ['BR'] } }),
          status: 'PAUSED',
        },
      };

    case 'criativo.criar':
      return {
        path: `/${conta}/ads`,
        body: {
          name: String(params.nome ?? 'Novo anúncio'),
          adset_id: String(params.adsetId ?? ''),
          creative: JSON.stringify({ creative_id: String(params.criativoId ?? '') }),
          status: 'PAUSED',
        },
      };

    case 'campanha.editar':
    case 'publico.editar':
    case 'criativo.editar':
      return { path: `/${alvo}`, body: { name: String(params.nome ?? snapshot.name ?? '') } };

    case 'campanha.pausar':
    case 'criativo.pausar':
      return { path: `/${alvo}`, body: { status: 'PAUSED' } };

    case 'publico.arquivar':
      return { path: `/${alvo}`, body: { status: 'ARCHIVED' } };

    case 'campanha.duplicar':
      return {
        path: `/${alvo}/copies`,
        body: { deep_copy: true, status_option: 'PAUSED' },
      };

    case 'publico.duplicar':
    case 'criativo.duplicar':
      return { path: `/${alvo}/copies`, body: { status_option: 'PAUSED' } };

    case 'campanha.aumentar_orcamento':
    case 'campanha.reduzir_orcamento':
    case 'criativo.escalar_verba': {
      const atual = Number(snapshot.daily_budget ?? 0);
      if (!atual) {
        throw new Error(
          'Esta entidade não tem orçamento diário próprio (provavelmente usa CBO na campanha ou orçamento vitalício). Ajuste no nível certo.',
        );
      }
      const pct = Number(params.percentual ?? acao.percentual ?? 0);
      // A Meta trabalha em centavos; arredondar pra baixo evita estourar por
      // 1 centavo um teto que o cliente definiu.
      const novo = Math.max(100, Math.floor(atual * (1 + pct / 100)));
      return { path: `/${alvo}`, body: { daily_budget: novo } };
    }

    case 'otimizacao.aplicar':
      // A sugestão diz o que fazer; hoje o catálogo cobre pausar.
      return { path: `/${alvo}`, body: { status: 'PAUSED' } };

    default:
      throw new Error(`Ação '${acao.id}' não tem tradução para a Marketing API.`);
  }
}

/** Corpo que restaura o estado anterior, a partir do snapshot. */
function montarReversao(snapshot: Record<string, unknown>): Record<string, string | number> {
  const body: Record<string, string | number> = {};
  for (const campo of CAMPOS_REVERSIVEIS) {
    const valor = snapshot[campo];
    if (typeof valor === 'string' || typeof valor === 'number') body[campo] = valor;
  }
  return body;
}

export async function executarAcao(
  supabase: ServiceClient,
  pedido: PedidoAcao,
): Promise<ResultadoAcao> {
  const acao = acaoPorId(pedido.acaoId);
  if (!acao) return { ok: false, mensagem: `Ação desconhecida: ${pedido.acaoId}` };

  if (acao.exigeSelecao && !pedido.entityMetaId) {
    return { ok: false, mensagem: 'Selecione um item antes de executar esta ação.' };
  }

  // Ações locais (sugestão de IA, adiar) não tocam a Meta — quem cuida delas
  // são as rotas de IA e o estado da tela.
  if (acao.local) {
    return { ok: false, mensagem: `'${acao.rotulo}' não é uma ação da Marketing API.` };
  }

  const conta = await contaDoCliente(supabase, pedido.clientId);

  if (!escritaLiberada(conta)) {
    // Registra a tentativa mesmo bloqueada: saber que alguém tentou mexer numa
    // conta de produção é informação de auditoria, não ruído.
    await supabase.from('audit_log').insert({
      client_id: pedido.clientId,
      user_id: pedido.userId,
      origem: pedido.origem,
      acao: acao.id,
      entity_type: acao.entidade,
      entity_meta_id: pedido.entityMetaId ?? null,
      entity_nome: pedido.entityNome ?? null,
      params: (pedido.params ?? {}) as Record<string, unknown>,
      status: 'erro',
      erro: 'Escrita bloqueada: conta fora da allowlist.',
      ad_account_id: conta,
      sandbox: ehSandbox(conta),
      finished_at: new Date().toISOString(),
    });
    return { ok: false, mensagem: new MetaWriteBloqueadaError(conta).message };
  }

  const orcamento = new Orcamento(20);
  const params = pedido.params ?? {};

  // 1. Snapshot — só faz sentido pra ação que muta algo existente.
  let snapshot: Record<string, unknown> = {};
  if (pedido.entityMetaId) {
    try {
      snapshot = await lerEntidade<Record<string, unknown>>(
        pedido.entityMetaId,
        CAMPOS_SNAPSHOT[acao.entidade],
        orcamento,
      );
    } catch (e) {
      return {
        ok: false,
        mensagem: `Não foi possível ler o estado atual na Meta: ${e instanceof Error ? e.message : String(e)}`,
      };
    }
  }

  // 2. Log 'pendente' antes de qualquer mutação.
  const { data: auditRow, error: erroAudit } = await supabase
    .from('audit_log')
    .insert({
      client_id: pedido.clientId,
      user_id: pedido.userId,
      origem: pedido.origem,
      acao: acao.id,
      entity_type: acao.entidade,
      entity_meta_id: pedido.entityMetaId ?? null,
      entity_nome: pedido.entityNome ?? null,
      params: params as Record<string, unknown>,
      status: 'pendente',
      estado_anterior: Object.keys(snapshot).length ? snapshot : null,
      ad_account_id: conta,
      sandbox: ehSandbox(conta),
    })
    .select('id')
    .single();

  if (erroAudit || !auditRow) {
    // Sem auditoria não se executa. Auditoria não é acessório da ação.
    return { ok: false, mensagem: `Falha ao registrar auditoria: ${erroAudit?.message}` };
  }
  const auditId = auditRow.id;

  const fechar = async (campos: Record<string, unknown>) => {
    await supabase
      .from('audit_log')
      .update({ ...campos, finished_at: new Date().toISOString() })
      .eq('id', auditId);
  };

  // 3. Executa.
  try {
    const { path, body } = montarChamada(acao, {
      conta,
      entityMetaId: pedido.entityMetaId,
      params,
      snapshot,
    });

    const resposta = await metaPost<Record<string, unknown>>(path, body, orcamento);

    await fechar({ status: 'sucesso', resposta_meta: resposta });

    const novoId = typeof resposta.id === 'string' ? resposta.id : undefined;
    return {
      ok: true,
      auditId,
      novoId,
      mensagem: `${acao.rotulo} concluída${pedido.entityNome ? ` em "${pedido.entityNome}"` : ''}.`,
    };
  } catch (e) {
    const erro = e instanceof Error ? e.message : String(e);

    // 4. Rollback. Só faz sentido quando havia estado anterior pra restaurar —
    // ação de criação que falhou não criou nada, então não há o que desfazer.
    const reversao = montarReversao(snapshot);
    if (pedido.entityMetaId && Object.keys(reversao).length > 0) {
      try {
        await metaPost(`/${pedido.entityMetaId}`, reversao, orcamento);
        await fechar({
          status: 'revertido',
          erro,
          revertido_em: new Date().toISOString(),
        });
        return {
          ok: false,
          auditId,
          revertido: true,
          mensagem: `A Meta recusou a ação (${erro}). O estado anterior foi restaurado.`,
        };
      } catch (falhaReversao) {
        const detalhe = falhaReversao instanceof Error ? falhaReversao.message : String(falhaReversao);
        await fechar({ status: 'reversao_falhou', erro: `${erro} | reversão: ${detalhe}` });
        return {
          ok: false,
          auditId,
          mensagem:
            `A ação falhou (${erro}) E a reversão automática também (${detalhe}). ` +
            'A entidade pode estar inconsistente — confira no Gerenciador de Anúncios. ' +
            `O estado anterior está no audit_log ${auditId}.`,
        };
      }
    }

    await fechar({ status: 'erro', erro });
    return { ok: false, auditId, mensagem: `A ação falhou: ${erro}` };
  }
}
