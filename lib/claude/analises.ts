/**
 * Análises de IA · criativos e copy (Fase 2c)
 *
 * Todo prompt daqui recebe NÚMEROS, não adjetivos: o modelo é bom em ler um
 * padrão numa tabela e ruim em inventar um que não está lá. Passar CPL, conv
 * L→M e verba investida é o que faz a saída ser verificável contra o dashboard.
 */

import type { ServiceClient } from '@/lib/supabase/service';
import { completar, extrairJson } from './client';
import { fmtMoeda, fmtNum, fmtPct, type Metricas } from '@/lib/intel';

export interface AnaliseCriativo {
  id: string;
  angulo: string;
  porque: string;
  proximoPasso: string;
}

const SYSTEM_ANALISE = `Você é estrategista sênior de tráfego pago da Infotráfego.
Escreve para gestores de tráfego, não para clientes: direto, técnico, com números.
Tom de consultor, nunca de vendedor. Sem superlativos, sem "incrível", sem emoji.
Cada campo tem UMA frase. Você só afirma o que os números mostram; quando o dado
não sustenta uma conclusão, diz o que falta medir em vez de inventar.`;

function tabelaDeCriativos(criativos: Metricas[]): string {
  const linhas = criativos.map((c) =>
    [
      `id: ${c.id}`,
      `nome: ${c.nome}`,
      `formato: ${c.formato ?? 'n/d'}`,
      `investido: ${fmtMoeda(c.spend, 0)}`,
      `leads: ${fmtNum(c.leads)}`,
      `MQLs: ${fmtNum(c.mqls)}`,
      `CPL: ${fmtMoeda(c.cpl)}`,
      `CPMQL: ${fmtMoeda(c.cpmql)}`,
      `conv L→M: ${fmtPct(c.convLm)}`,
      `CTR: ${fmtPct(c.ctr, 2)}`,
      `dias com entrega: ${c.diasAtivo ?? 'n/d'}`,
    ].join(' · '),
  );
  return linhas.join('\n');
}

/**
 * Analisa os criativos campeões do período.
 *
 * Uma chamada para o conjunto, não uma por criativo: além de custar 5× menos,
 * o modelo consegue comparar os cinco entre si — que é de onde sai a leitura
 * de ângulo que vale alguma coisa.
 */
export async function analisarCriativos(
  supabase: ServiceClient,
  args: {
    clientId: string;
    contextoCliente: string;
    criativos: Metricas[];
    periodo: { desde: string; ate: string };
  },
): Promise<{ analises: AnaliseCriativo[]; doCache: boolean }> {
  if (args.criativos.length === 0) return { analises: [], doCache: false };

  const user = `Cliente: ${args.contextoCliente}
Período: ${args.periodo.desde} a ${args.periodo.ate}

Criativos com melhor volume de leads no período:
${tabelaDeCriativos(args.criativos)}

Para CADA criativo, devolva:
- "angulo": o ângulo criativo que o nome e os números sugerem (autoridade, dor, prova social, método, depoimento…)
- "porque": por que ele funcionou, citando pelo menos um número da tabela
- "proximoPasso": uma ação específica e executável (verba, público, variação)

Responda APENAS com um array JSON, sem texto em volta:
[{"id":"<id exato da tabela>","angulo":"...","porque":"...","proximoPasso":"..."}]`;

  const resposta = await completar(supabase, {
    system: SYSTEM_ANALISE,
    user,
    finalidade: 'analise_criativos',
    clientId: args.clientId,
    maxTokens: 2048,
  });

  const bruto = extrairJson<AnaliseCriativo[]>(resposta.texto);
  const idsValidos = new Set(args.criativos.map((c) => c.id));

  // O modelo às vezes devolve um id que não estava na tabela. Descartar é
  // melhor do que renderizar análise ao lado do criativo errado.
  const analises = bruto.filter((a) => a && typeof a.id === 'string' && idsValidos.has(a.id));

  return { analises, doCache: resposta.doCache };
}

// ── Sugestões de copy ────────────────────────────────────────────────────────

export interface VariacaoCopy {
  headline: string;
  primaryText: string;
  cta: string;
  angulo: string;
}

const SYSTEM_COPY = `Você é copywriter sênior de tráfego pago da Infotráfego.
Escreve anúncios para Meta Ads em português do Brasil.
Regras: headline com no máximo 40 caracteres; texto principal em até 3 linhas curtas;
sem promessa de resultado garantido; sem claim de saúde, renda ou emagrecimento que
viole a política de anúncios da Meta; sem emoji no início da frase.`;

/**
 * Gera variações de copy.
 *
 * O contexto inclui os criativos que JÁ funcionaram para este cliente: pedir
 * variação sem isso devolve texto genérico de qualquer nicho, que é
 * exatamente o que o gestor não precisa.
 */
export async function sugerirCopy(
  supabase: ServiceClient,
  args: {
    clientId: string;
    nicho: string;
    publico: string;
    oferta: string;
    topCriativos: Metricas[];
    quantidade?: number;
  },
): Promise<{ variacoes: VariacaoCopy[]; doCache: boolean; modelo: string }> {
  const quantidade = Math.max(3, args.quantidade ?? 3);

  const referencias = args.topCriativos
    .slice(0, 5)
    .map((c) => `- ${c.nome} (CPL ${fmtMoeda(c.cpl)}, conv L→M ${fmtPct(c.convLm)})`)
    .join('\n');

  const user = `Nicho: ${args.nicho}
Público: ${args.publico}
Oferta: ${args.oferta}

Criativos que melhor performaram para este cliente:
${referencias || '- (sem histórico ainda)'}

Gere ${quantidade} variações de anúncio, cada uma com um ÂNGULO diferente entre si.

Responda APENAS com um array JSON:
[{"headline":"...","primaryText":"...","cta":"...","angulo":"..."}]`;

  const resposta = await completar(supabase, {
    system: SYSTEM_COPY,
    user,
    finalidade: 'copy_sugestao',
    clientId: args.clientId,
    maxTokens: 2048,
    // Copy é pedida de propósito quando se quer opção nova; cache longo faria
    // o gestor receber o mesmo texto ao clicar de novo.
    ttlHoras: 1,
  });

  const variacoes = extrairJson<VariacaoCopy[]>(resposta.texto).filter(
    (v) => v && typeof v.headline === 'string' && typeof v.primaryText === 'string',
  );

  return { variacoes, doCache: resposta.doCache, modelo: resposta.modelo };
}
