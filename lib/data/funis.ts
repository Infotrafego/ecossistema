/**
 * Leitura e escrita de funis · tabela `funis`
 *
 * Ponto de tradução entre `ConfigFunil` (o shape que o Construtor e os
 * componentes usam) e a linha do banco. Manter a tradução num lugar só é o que
 * impede a config de divergir do que está gravado — foi exatamente esse tipo de
 * divergência que gerou o conflito de `modo_captura` resolvido na migration
 * 20260918000000.
 *
 * ⚠ SERVER ONLY (usa o client Supabase de servidor).
 */

import type { SupabaseClient } from '@supabase/supabase-js';
import { createClient } from '@/lib/supabase/server';
import type { Database } from '@/types/database';
import {
  ETAPAS_VALIDAS,
  SUBOBJETIVOS_VALIDOS,
  isEtapaId,
  ordenarEtapas,
  type ConfigFunil,
  type EtapaId,
  type Familia,
  type ModoCaptura,
  type SubObjetivo,
} from '@/lib/funil';
import type { Funil } from '@/types/database';

type ClienteSupabase = SupabaseClient<Database, 'infotrafego_ecossistema'>;

export interface ClienteResumo {
  id: string;
  nome: string;
  slug: string;
  corDaMarca: string;
  contaMeta: string | null;
}

export interface FunilResumo {
  id: string;
  nome: string;
  clientId: string;
  familia: Familia;
  subObjetivo: SubObjetivo;
  ativo: boolean;
}

/**
 * Clientes que o usuário logado enxerga.
 *
 * Não filtra nada explicitamente: o RLS (`user_has_client_access`) é que
 * decide. Filtrar de novo aqui daria a falsa impressão de que a segurança está
 * no app — ela está na policy, e é lá que ela é testada.
 */
export async function listarClientes(): Promise<ClienteResumo[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from('clients')
    .select('id, name, slug, brand_color, meta_ad_account_id')
    .eq('active', true)
    .order('name');

  if (error) throw new Error(`clients: ${error.message}`);

  return (data ?? []).map((c) => ({
    id: c.id,
    nome: c.name,
    slug: c.slug,
    corDaMarca: c.brand_color,
    contaMeta: c.meta_ad_account_id,
  }));
}

export async function listarFunis(clientId?: string): Promise<FunilResumo[]> {
  const supabase = await createClient();
  let query = supabase
    .from('funis')
    .select('id, name, client_id, familia, sub_objetivo, active')
    .eq('active', true)
    .order('name');

  if (clientId) query = query.eq('client_id', clientId);

  const { data, error } = await query;
  if (error) throw new Error(`funis: ${error.message}`);

  return (data ?? []).map((f) => ({
    id: f.id,
    nome: f.name,
    clientId: f.client_id,
    familia: f.familia,
    subObjetivo: f.sub_objetivo,
    ativo: f.active,
  }));
}

/** Linha do banco → `ConfigFunil`. */
export function linhaParaConfig(linha: Funil, nomeDoCliente = ''): ConfigFunil {
  // O CHECK do banco garante ids válidos, mas uma linha gravada antes da
  // migration de taxonomia poderia escapar — filtrar aqui evita que um id
  // desconhecido quebre a renderização do cone em runtime.
  const etapas = (linha.etapas ?? []).filter((e): e is EtapaId => isEtapaId(e));

  return {
    id: linha.id,
    clientId: linha.client_id,
    cliente: nomeDoCliente,
    nome: linha.name,
    familia: linha.familia,
    subObjetivo: linha.sub_objetivo,
    captura: linha.modo_captura,
    etapas: ordenarEtapas(etapas),
    marcadorMkt: linha.marcador_mkt && isEtapaId(linha.marcador_mkt) ? linha.marcador_mkt : null,
    marcadorCom: linha.marcador_com && isEtapaId(linha.marcador_com) ? linha.marcador_com : null,
    metas: (linha.metas ?? {}) as Partial<Record<EtapaId, number>>,
  };
}

/** Carrega a config completa de um funil. `null` quando não há funil filtrado. */
export async function funilDaLinha(
  supabase: ClienteSupabase,
  funilId: string | null,
): Promise<ConfigFunil | null> {
  if (!funilId) return null;

  const { data, error } = await supabase
    .from('funis')
    .select('*')
    .eq('id', funilId)
    .maybeSingle();

  if (error) throw new Error(`funil ${funilId}: ${error.message}`);
  if (!data) return null;

  // Duas queries em vez de um embed `clients(name)`: os tipos deste arquivo são
  // mantidos à mão e não declaram Relationships, então o embed vira
  // `SelectQueryError` no TypeScript. Uma leitura extra por id é barata.
  const { data: cliente } = await supabase
    .from('clients')
    .select('name')
    .eq('id', data.client_id)
    .maybeSingle();

  return linhaParaConfig(data as Funil, cliente?.name ?? '');
}

export async function getFunil(funilId: string): Promise<ConfigFunil | null> {
  const supabase = await createClient();
  return funilDaLinha(supabase, funilId);
}

// ── Escrita ──────────────────────────────────────────────────────────────────

export interface ErroValidacao {
  campo: string;
  mensagem: string;
}

/**
 * Valida a config ANTES de mandar pro banco.
 *
 * Os CHECKs da migration cobrem os mesmos casos, mas um erro de constraint
 * chega como texto do Postgres, que não serve pra mostrar ao gestor. Aqui o
 * erro sai apontando o campo.
 */
export function validarConfig(config: ConfigFunil): ErroValidacao[] {
  const erros: ErroValidacao[] = [];

  if (!config.clientId) erros.push({ campo: 'cliente', mensagem: 'Selecione o cliente.' });
  if (!config.nome.trim()) erros.push({ campo: 'nome', mensagem: 'Dê um nome ao funil.' });
  if (!config.familia) erros.push({ campo: 'familia', mensagem: 'Escolha a família.' });

  if (!config.subObjetivo) {
    erros.push({ campo: 'subObjetivo', mensagem: 'Escolha o sub-objetivo.' });
  } else if (!SUBOBJETIVOS_VALIDOS.includes(config.subObjetivo)) {
    erros.push({ campo: 'subObjetivo', mensagem: 'Sub-objetivo desconhecido.' });
  }

  if (!config.captura) erros.push({ campo: 'captura', mensagem: 'Escolha o modo de captura.' });

  if (config.etapas.length < 2) {
    erros.push({ campo: 'etapas', mensagem: 'O funil precisa de pelo menos 2 etapas.' });
  }

  const invalidas = config.etapas.filter((e) => !ETAPAS_VALIDAS.includes(e));
  if (invalidas.length) {
    erros.push({ campo: 'etapas', mensagem: `Etapas desconhecidas: ${invalidas.join(', ')}.` });
  }

  // Marcador órfão passaria pelo CHECK só se a etapa estivesse na lista, mas o
  // erro fica muito mais claro aqui do que vindo do Postgres.
  if (config.marcadorMkt && !config.etapas.includes(config.marcadorMkt)) {
    erros.push({ campo: 'marcadorMkt', mensagem: 'O marcador MKT aponta pra uma etapa fora do funil.' });
  }
  if (config.marcadorCom && !config.etapas.includes(config.marcadorCom)) {
    erros.push({ campo: 'marcadorCom', mensagem: 'O marcador COM aponta pra uma etapa fora do funil.' });
  }

  return erros;
}

export interface ResultadoSalvar {
  ok: boolean;
  id?: string;
  erros?: ErroValidacao[];
}

/**
 * Cria ou atualiza um funil.
 *
 * Usa o client com sessão do usuário (não o service role) de propósito: assim o
 * RLS decide se ele pode gravar naquele cliente. Gravar com service role aqui
 * transformaria o multi-tenancy em confiança no código da rota.
 */
export async function salvarFunil(config: ConfigFunil): Promise<ResultadoSalvar> {
  const erros = validarConfig(config);
  if (erros.length) return { ok: false, erros };

  const supabase = await createClient();
  const linha = {
    client_id: config.clientId!,
    name: config.nome.trim(),
    familia: config.familia as Familia,
    sub_objetivo: config.subObjetivo as SubObjetivo,
    modo_captura: config.captura as ModoCaptura,
    etapas: ordenarEtapas(config.etapas),
    marcador_mkt: config.marcadorMkt,
    marcador_com: config.marcadorCom,
    metas: config.metas,
  };

  if (config.id) {
    const { error } = await supabase.from('funis').update(linha).eq('id', config.id);
    if (error) return { ok: false, erros: [{ campo: 'geral', mensagem: error.message }] };
    return { ok: true, id: config.id };
  }

  const { data, error } = await supabase.from('funis').insert(linha).select('id').single();
  if (error) return { ok: false, erros: [{ campo: 'geral', mensagem: error.message }] };
  return { ok: true, id: data.id };
}

export async function arquivarFunil(funilId: string): Promise<ResultadoSalvar> {
  const supabase = await createClient();
  const { error } = await supabase.from('funis').update({ active: false }).eq('id', funilId);
  if (error) return { ok: false, erros: [{ campo: 'geral', mensagem: error.message }] };
  return { ok: true, id: funilId };
}
