/**
 * Dados de demonstração · desloca o histórico real para o presente
 *
 *   node scripts/run.cjs scripts/mock-dados.ts --aplicar
 *   node scripts/run.cjs scripts/mock-dados.ts --remover
 *   node scripts/run.cjs scripts/mock-dados.ts --status
 *
 * POR QUE ASSIM, E NÃO UM data/mock-*.ts
 * A conta piloto não entrega desde 23/06/2026, então o recorte padrão de 30
 * dias vem vazio — o que está certo, mas atrapalha quem só quer ver a cara do
 * produto. Em vez de reintroduzir uma camada de mock no código (que seria mais
 * um caminho pra manter, e que um dia vaza pra produção), este script COPIA os
 * últimos 60 dias de entrega REAL e os desloca no tempo para terminarem hoje.
 *
 * O ganho: nomes de campanha, distribuição de verba, CTR, CPL e curva de
 * criativo são os de verdade. O pipeline exercitado é o mesmo — sync, agregação
 * e telas leem exatamente como leriam em produção.
 *
 * ⚠ TODA linha gerada aqui leva `raw_data = {"mock": true}`. É o que torna a
 * remoção exata: `--remover` apaga por essa marca, não por intervalo de data.
 * Nenhuma linha real é tocada — a fatia deslocada cai depois de 23/06/2026,
 * faixa onde não existe dado real, então não há colisão de chave primária.
 *
 * O QUE É INVENTADO (e só isto):
 * As etapas comerciais — formulário iniciado, lead qualificado, agendamento e
 * proposta. A Meta não as reporta porque dependem do CRM, que é integração de
 * outra fase. São derivadas do número REAL de leads do dia, com taxas B2B
 * plausíveis e determinísticas. Reunião realizada e venda seguem PROJETADAS
 * pelo benchmark (como em produção), aparecendo com o selo "Proj" no cone.
 */

import { createServiceClient } from '@/lib/supabase/service';
import type { EtapaId } from '@/lib/funil';

const MARCA = { mock: true } as const;

/** Dias de histórico real que viram a janela de demonstração. */
const DIAS_DE_DEMO = 60;

/**
 * O recorte que o dashboard abre por padrão.
 *
 * A otimização mira ESTES dias, não os 60: alinhar o fim da fatia com hoje sem
 * olhar pra composição fez os últimos 30 dias caírem em janeiro/26, que tinha
 * uma campanha só — a aba Campanhas abria com uma linha. Escolhendo primeiro
 * a melhor janela de 30 e ancorando ela no fim, o recorte padrão fica rico e
 * os 30 dias anteriores viram histórico da série temporal.
 */
const DIAS_DO_RECORTE_PADRAO = 30;

interface LinhaMetrica {
  client_id: string;
  entity_type: 'campaign' | 'adset' | 'ad' | 'creative';
  entity_id: string;
  date: string;
  impressions: number;
  clicks: number;
  spend: number;
  conversions: number;
  revenue: number;
  frequency: number | null;
  ctr: number | null;
  cpc: number | null;
  cpm: number | null;
  stage_values: Partial<Record<EtapaId, number>>;
  raw_data: Record<string, unknown> | null;
}

const DIA_MS = 86_400_000;
const iso = (d: Date) => d.toISOString().slice(0, 10);
const somarDias = (data: string, dias: number) =>
  iso(new Date(Date.parse(`${data}T00:00:00Z`) + dias * DIA_MS));

/**
 * Ruído determinístico entre 0 e 1, estável para a mesma chave.
 *
 * Sem isto, todo dia converteria exatamente na mesma taxa e os gráficos
 * sairiam com uma regularidade que denuncia dado sintético. Com `Math.random`
 * os números mudariam a cada execução, e aí nenhuma conferência fecharia duas
 * vezes seguidas.
 */
function ruido(chave: string): number {
  let h = 2166136261;
  for (let i = 0; i < chave.length; i++) {
    h ^= chave.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return ((h >>> 0) % 1000) / 1000;
}

/**
 * Arredondamento estocástico, determinístico pela chave.
 *
 * `Math.round` destrói taxa em número pequeno: a maioria das linhas tem 1 lead
 * no dia, e 1 × 50% arredonda para 1 — o que fez o primeiro teste sair com
 * 18 leads, 14 SQLs e 14 agendamentos, um "funil" que não afunila. Aqui 0,5
 * vira 1 em metade das linhas e 0 na outra metade, então a taxa se preserva no
 * agregado, que é onde ela é lida.
 */
function arredondar(valor: number, chave: string): number {
  const base = Math.floor(valor);
  return base + (ruido(chave) < valor - base ? 1 : 0);
}

/** Taxas B2B de agência: cada uma sobre a etapa imediatamente anterior. */
const TAXA_SQL = 0.5;
const TAXA_AGENDAMENTO = 0.55;
const TAXA_PROPOSTA = 0.45;

/**
 * Preenche as etapas que dependem do CRM, a partir dos leads reais do dia.
 *
 * Só age quando houve lead: dia sem lead continua sem etapa comercial, porque
 * é isso que mantém honestos os alertas de "gastou e não converteu".
 *
 * SIMULA LEAD A LEAD, com um único sorteio por lead. Tentar aplicar taxa por
 * linha e depois encadear com `min` produziu 26 SQLs e apenas 4 agendamentos:
 * como cada etapa sorteava separado, um lead podia "virar agendamento" numa
 * linha em que não tinha virado SQL, e o `min` zerava. Com um só `u` por lead
 * as etapas ficam aninhadas por construção — todo agendamento é SQL, toda
 * proposta é agendamento — e as taxas se preservam no agregado.
 */
function enriquecerEtapas(
  stages: Partial<Record<EtapaId, number>>,
  chave: string,
): Partial<Record<EtapaId, number>> {
  const leads = stages.lead ?? 0;
  if (leads <= 0) return stages;

  const aplicacao = Math.max(stages.aplicacao_completa ?? 0, leads);

  // ±15% em volta da taxa base, estável por (entidade, dia), pra que os dias
  // não convirjam todos exatamente na mesma taxa.
  const variar = (base: number, sufixo: string) => base * (0.85 + ruido(chave + sufixo) * 0.3);
  const ateSql = variar(TAXA_SQL, 'q');
  const ateAgendamento = ateSql * variar(TAXA_AGENDAMENTO, 'a');
  const ateProposta = ateAgendamento * variar(TAXA_PROPOSTA, 'p');

  let qualificado = 0;
  let agendamento = 0;
  let proposta = 0;

  for (let i = 0; i < aplicacao; i++) {
    const u = ruido(`${chave}:lead${i}`);
    if (u < ateSql) qualificado++;
    if (u < ateAgendamento) agendamento++;
    if (u < ateProposta) proposta++;
  }

  return {
    ...stages,
    form_iniciado: Math.max(arredondar(aplicacao * variar(1.45, 'f'), `${chave}f`), aplicacao),
    aplicacao_completa: aplicacao,
    lead_qualificado: qualificado,
    agendamento,
    proposta_enviada: proposta,
    // `call_realizada` e `venda` ficam de fora de propósito: o cone as projeta
    // por benchmark e as marca como projeção, que é o comportamento real.
  };
}

function recalcularDerivadas(linha: LinhaMetrica): LinhaMetrica {
  const ctr = linha.impressions > 0 ? linha.clicks / linha.impressions : null;
  const cpc = linha.clicks > 0 ? linha.spend / linha.clicks : null;
  const cpm = linha.impressions > 0 ? (linha.spend / linha.impressions) * 1000 : null;
  return {
    ...linha,
    ctr: ctr === null ? null : Number(ctr.toFixed(4)),
    cpc: cpc === null ? null : Number(cpc.toFixed(4)),
    cpm: cpm === null ? null : Number(cpm.toFixed(2)),
    conversions: linha.stage_values.lead ?? 0,
  };
}

async function lerTudo(
  supabase: ReturnType<typeof createServiceClient>,
  clientId: string,
  desde: string,
  ate: string,
): Promise<LinhaMetrica[]> {
  const linhas: LinhaMetrica[] = [];
  for (let offset = 0; ; offset += 1000) {
    const { data, error } = await supabase
      .from('metrics_daily')
      .select('*')
      .eq('client_id', clientId)
      .gte('date', desde)
      .lte('date', ate)
      .order('date', { ascending: true })
      .range(offset, offset + 999);
    if (error) throw new Error(error.message);
    linhas.push(...((data ?? []) as unknown as LinhaMetrica[]));
    if (!data || data.length < 1000) break;
  }
  return linhas;
}

/**
 * Escolhe a fatia de `DIAS_DE_DEMO` dias com MAIOR volume de leads.
 *
 * A primeira versão pegava simplesmente os últimos 60 dias de entrega — que na
 * conta piloto são os mais fracos (18 leads), e o cone saía morrendo em 2
 * agendamentos. Deslizar a janela pelo histórico acha dez/25–jan/26, com 114
 * leads, e a demonstração passa a mostrar o funil inteiro. Continua sendo dado
 * real, só que o trecho representativo dele.
 */
async function escolherMelhorJanela(
  supabase: ReturnType<typeof createServiceClient>,
  clientId: string,
): Promise<{
  inicio: string;
  fim: string;
  leads: number;
  campanhas: number;
  ultimoDiaReal: string;
}> {
  const leadsPorDia = new Map<string, number>();
  const campanhasPorDia = new Map<string, Set<string>>();

  for (const tipo of ['ad', 'campaign'] as const) {
    for (let offset = 0; ; offset += 1000) {
      const { data, error } = await supabase
        .from('metrics_daily')
        .select('date, entity_id, stage_values, raw_data')
        .eq('client_id', clientId)
        .eq('entity_type', tipo)
        .order('date', { ascending: true })
        .range(offset, offset + 999);
      if (error) throw new Error(error.message);

      for (const l of data ?? []) {
        // Ignora o que já é demonstração, pra não realimentar a própria saída.
        if ((l.raw_data as Record<string, unknown> | null)?.mock === true) continue;
        if (tipo === 'ad') {
          const leads = Number((l.stage_values as Record<string, number>)?.lead ?? 0);
          leadsPorDia.set(l.date, (leadsPorDia.get(l.date) ?? 0) + leads);
        } else {
          const set = campanhasPorDia.get(l.date) ?? new Set<string>();
          set.add(l.entity_id);
          campanhasPorDia.set(l.date, set);
        }
      }
      if (!data || data.length < 1000) break;
    }
  }

  const datas = Array.from(new Set([...leadsPorDia.keys(), ...campanhasPorDia.keys()])).sort();
  if (datas.length === 0) throw new Error('nenhum dado real encontrado pra deslocar');

  const ultimoDiaReal = datas[datas.length - 1];
  let melhor = { inicio: datas[0], fim: datas[0], leads: -1, campanhas: 0, score: -1 };

  // Desliza uma janela do tamanho do RECORTE PADRÃO. Janela por data de
  // calendário (não por índice de dia com entrega): dias vazios contam, porque
  // é assim que o dashboard conta.
  for (const inicio of datas) {
    const fim = somarDias(inicio, DIAS_DO_RECORTE_PADRAO - 1);
    if (fim > ultimoDiaReal) break;

    let leads = 0;
    const campanhas = new Set<string>();
    for (const dia of datas) {
      if (dia < inicio || dia > fim) continue;
      leads += leadsPorDia.get(dia) ?? 0;
      for (const c of campanhasPorDia.get(dia) ?? []) campanhas.add(c);
    }

    // Volume é o critério principal; diversidade de campanha desempata, porque
    // uma aba de Campanhas com uma linha só não mostra o produto.
    const score = leads + campanhas.size * 3;
    if (score > melhor.score) {
      melhor = { inicio, fim, leads, campanhas: campanhas.size, score };
    }
  }

  return {
    // Estende pra trás pra dar histórico à série temporal, sem passar do início.
    inicio: [somarDias(melhor.inicio, -(DIAS_DE_DEMO - DIAS_DO_RECORTE_PADRAO)), datas[0]]
      .sort()
      .reverse()[0],
    fim: melhor.fim,
    leads: melhor.leads,
    campanhas: melhor.campanhas,
    ultimoDiaReal,
  };
}

async function aplicar() {
  const supabase = createServiceClient();

  const { data: cliente } = await supabase
    .from('clients')
    .select('id, name')
    .eq('slug', 'infotrafego')
    .single();
  if (!cliente) throw new Error('cliente piloto não encontrado');

  const janela = await escolherMelhorJanela(supabase, cliente.id);
  const hoje = iso(new Date());
  const deslocamento = Math.round(
    (Date.parse(`${hoje}T00:00:00Z`) - Date.parse(`${janela.fim}T00:00:00Z`)) / DIA_MS,
  );

  // O deslocamento tem que jogar a fatia para DEPOIS do último dia real,
  // senão as linhas geradas colidiriam com dados de verdade na chave primária
  // e sobrescreveriam histórico.
  if (somarDias(janela.inicio, deslocamento) <= janela.ultimoDiaReal) {
    throw new Error(
      `deslocamento colidiria com dado real (fatia cairia em ${somarDias(janela.inicio, deslocamento)}, ` +
        `real vai até ${janela.ultimoDiaReal}). Reduza DIAS_DE_DEMO.`,
    );
  }

  console.log(`cliente        : ${cliente.name}`);
  console.log(`último dia real: ${janela.ultimoDiaReal}`);
  console.log(
    `fatia escolhida: ${janela.inicio} → ${janela.fim} · recorte padrão com ${janela.leads} leads e ${janela.campanhas} campanha(s)`,
  );
  console.log(
    `deslocamento   : +${deslocamento} dias → ${somarDias(janela.inicio, deslocamento)} a ${hoje}`,
  );

  const originais = await lerTudo(supabase, cliente.id, janela.inicio, janela.fim);
  const reais = originais.filter((l) => !l.raw_data || l.raw_data.mock !== true);
  console.log(`linhas na fatia: ${reais.length}`);

  // Nível de ad primeiro: é dele que os outros três são derivados, do mesmo
  // jeito que o sync faz. Agregar a partir do ad é o que garante que as abas
  // continuem fechando no mesmo número.
  const ads = reais
    .filter((l) => l.entity_type === 'ad')
    .map((l) => {
      const novaData = somarDias(l.date, deslocamento);
      return recalcularDerivadas({
        ...l,
        date: novaData,
        stage_values: enriquecerEtapas(l.stage_values ?? {}, `${l.entity_id}|${novaData}`),
        raw_data: { ...MARCA, origem: l.date },
      });
    });

  // Mapas ad → adset/campanha/criativo, pra reagregar.
  const { data: adsMeta } = await supabase
    .from('ads')
    .select('meta_id, adset_id, creative_id')
    .eq('client_id', cliente.id);
  const { data: adsets } = await supabase
    .from('adsets')
    .select('id, meta_id, campaign_id')
    .eq('client_id', cliente.id);
  const { data: campanhas } = await supabase
    .from('campaigns')
    .select('id, meta_id')
    .eq('client_id', cliente.id);
  const { data: criativos } = await supabase
    .from('creatives')
    .select('id, meta_id')
    .eq('client_id', cliente.id);

  const adsetPorId = new Map((adsets ?? []).map((a) => [a.id, a]));
  const campanhaPorId = new Map((campanhas ?? []).map((c) => [c.id, c]));
  const criativoPorId = new Map((criativos ?? []).map((c) => [c.id, c]));
  const infoDoAd = new Map(
    (adsMeta ?? []).map((a) => {
      const adset = adsetPorId.get(a.adset_id);
      return [
        a.meta_id,
        {
          adsetMetaId: adset?.meta_id,
          campanhaMetaId: adset ? campanhaPorId.get(adset.campaign_id)?.meta_id : undefined,
          criativoMetaId: a.creative_id ? criativoPorId.get(a.creative_id)?.meta_id : undefined,
        },
      ];
    }),
  );

  const agregados = new Map<string, LinhaMetrica>();
  const acumular = (tipo: LinhaMetrica['entity_type'], id: string, base: LinhaMetrica) => {
    const chave = `${tipo}|${id}|${base.date}`;
    const atual = agregados.get(chave);
    if (!atual) {
      agregados.set(chave, {
        ...base,
        entity_type: tipo,
        entity_id: id,
        stage_values: { ...base.stage_values },
      });
      return;
    }
    atual.impressions += base.impressions;
    atual.clicks += base.clicks;
    atual.spend = Number((atual.spend + base.spend).toFixed(2));
    atual.revenue = Number((atual.revenue + base.revenue).toFixed(2));
    for (const [etapa, valor] of Object.entries(base.stage_values)) {
      const id2 = etapa as EtapaId;
      atual.stage_values[id2] = (atual.stage_values[id2] ?? 0) + (valor ?? 0);
    }
  };

  for (const ad of ads) {
    const info = infoDoAd.get(ad.entity_id);
    if (!info) continue;
    if (info.adsetMetaId) acumular('adset', info.adsetMetaId, ad);
    if (info.campanhaMetaId) acumular('campaign', info.campanhaMetaId, ad);
    if (info.criativoMetaId) acumular('creative', info.criativoMetaId, ad);
  }

  const todas = [...ads, ...Array.from(agregados.values()).map(recalcularDerivadas)];
  console.log(`linhas geradas : ${todas.length} (${ads.length} ads + ${agregados.size} agregados)`);

  for (let i = 0; i < todas.length; i += 500) {
    const { error } = await supabase
      .from('metrics_daily')
      .upsert(todas.slice(i, i + 500), { onConflict: 'client_id,entity_type,entity_id,date' });
    if (error) throw new Error(`upsert: ${error.message}`);
  }

  await ligarCampanhasAoFunil(supabase, cliente.id);
  await semearMetasEOrcamento(supabase, cliente.id, todas);

  console.log('\nPronto. O recorte padrão de 30 dias agora tem dados.');
  console.log('Pra desfazer: node scripts/run.cjs scripts/mock-dados.ts --remover');
}

/**
 * Liga as campanhas com entrega ao funil de aquisição.
 *
 * Sem `campaigns.funil_id`, o filtro de funil não encontra nada e a Visão Geral
 * não desenha o cone — que é o componente central da tela. Isto NÃO é dado
 * inventado: é a associação que o gestor faria no dia a dia, e fica gravada
 * mesmo depois de remover o mock.
 */
async function ligarCampanhasAoFunil(
  supabase: ReturnType<typeof createServiceClient>,
  clientId: string,
) {
  const { data: funil } = await supabase
    .from('funis')
    .select('id, name')
    .eq('client_id', clientId)
    .eq('active', true)
    .limit(1)
    .single();
  if (!funil) return;

  const { data: comEntrega } = await supabase
    .from('metrics_daily')
    .select('entity_id')
    .eq('client_id', clientId)
    .eq('entity_type', 'campaign');

  const ids = Array.from(new Set((comEntrega ?? []).map((c) => c.entity_id)));
  if (ids.length === 0) return;

  const { error } = await supabase
    .from('campaigns')
    .update({ funil_id: funil.id })
    .eq('client_id', clientId)
    .in('meta_id', ids);

  if (error) throw new Error(`vincular campanhas: ${error.message}`);
  console.log(`campanhas      : ${ids.length} ligadas ao funil "${funil.name}"`);
}

/**
 * Semeia verba e metas do mês corrente.
 *
 * Sem elas, dois painéis da Visão Geral só dizem "não configurado". Os valores
 * saem do próprio ritmo de gasto da conta, pra que o painel mostre um pace
 * verossímil em vez de um número redondo qualquer.
 */
async function semearMetasEOrcamento(
  supabase: ReturnType<typeof createServiceClient>,
  clientId: string,
  linhas: LinhaMetrica[],
) {
  const hoje = new Date();
  const ano = hoje.getUTCFullYear();
  const mes = hoje.getUTCMonth() + 1;
  const prefixo = `${ano}-${String(mes).padStart(2, '0')}`;

  const doMes = linhas.filter((l) => l.entity_type === 'ad' && l.date.startsWith(prefixo));
  const gasto = doMes.reduce((s, l) => s + l.spend, 0);
  const leads = doMes.reduce((s, l) => s + (l.stage_values.lead ?? 0), 0);
  const mqls = doMes.reduce((s, l) => s + (l.stage_values.lead_qualificado ?? 0), 0);
  const agend = doMes.reduce((s, l) => s + (l.stage_values.agendamento ?? 0), 0);

  const diasCorridos = hoje.getUTCDate();
  const diasDoMes = new Date(Date.UTC(ano, mes, 0)).getUTCDate();
  // Extrapola o ritmo do mês e arredonda pra cima: meta que já nasce batida
  // deixaria o painel todo verde e não mostraria como ele sinaliza atraso.
  const proj = (v: number) => Math.max(1, Math.round(((v / diasCorridos) * diasDoMes) / 5) * 5);

  const { error: erroOrc } = await supabase.from('orcamento_mensal').upsert({
    client_id: clientId,
    ano,
    mes,
    tipo: 'pos_pago' as const,
    verba_mensal: Math.round(((gasto / diasCorridos) * diasDoMes) / 100) * 100,
    saldo_prepago: 0,
    dia_ciclo: 1,
  });
  if (erroOrc) throw new Error(`orcamento: ${erroOrc.message}`);

  const { data: funil } = await supabase
    .from('funis')
    .select('id')
    .eq('client_id', clientId)
    .eq('active', true)
    .limit(1)
    .single();

  if (funil) {
    const { error: erroMetas } = await supabase.from('metas_mensais').upsert({
      funil_id: funil.id,
      client_id: clientId,
      ano,
      mes,
      metricas: {
        spend: { meta: Math.round(((gasto / diasCorridos) * diasDoMes) / 100) * 100, tipo: 'custo' },
        lead: { meta: proj(leads), tipo: 'positivo' },
        lead_qualificado: { meta: proj(mqls), tipo: 'positivo' },
        agendamento: { meta: proj(agend), tipo: 'positivo' },
      },
    });
    if (erroMetas) throw new Error(`metas: ${erroMetas.message}`);
  }

  console.log(`metas/orçamento: semeados para ${prefixo}`);
}

async function remover() {
  const supabase = createServiceClient();

  const { data: antes } = await supabase
    .from('metrics_daily')
    .select('client_id', { count: 'exact', head: false })
    .eq('raw_data->>mock', 'true');

  const { error } = await supabase.from('metrics_daily').delete().eq('raw_data->>mock', 'true');
  if (error) throw new Error(error.message);

  console.log(`${antes?.length ?? 0} linha(s) de demonstração removida(s).`);
  console.log('Metas, orçamento e o vínculo campanha↔funil ficam — são config, não dado.');
}

async function status() {
  const supabase = createServiceClient();
  const { data } = await supabase
    .from('metrics_daily')
    .select('date, entity_type')
    .eq('raw_data->>mock', 'true')
    .order('date', { ascending: true });

  if (!data?.length) {
    console.log('Nenhum dado de demonstração no banco.');
    return;
  }
  const datas = data.map((d) => d.date);
  console.log(`${data.length} linhas de demonstração · ${datas[0]} → ${datas[datas.length - 1]}`);
}

const args = process.argv.slice(2);
const acao = args.includes('--remover')
  ? remover
  : args.includes('--status')
    ? status
    : args.includes('--aplicar')
      ? aplicar
      : null;

if (!acao) {
  console.log('uso: --aplicar | --remover | --status');
  process.exit(1);
}

acao().catch((e) => {
  console.error(e);
  process.exit(1);
});
