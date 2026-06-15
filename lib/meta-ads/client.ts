/**
 * Cliente Meta Marketing API · STUB pra você implementar
 *
 * Implementação sugerida:
 * - Usar facebook-nodejs-business-sdk OU fetch direto pra API
 * - Auth via System User token (longa duração)
 * - Cache agressivo no Supabase (não chamar API toda hora)
 * - Retry com backoff em caso de rate limit
 *
 * Docs: https://developers.facebook.com/docs/marketing-apis
 *
 * Endpoints principais necessários pra Fase 2:
 * - GET /act_{ACCOUNT_ID}/campaigns
 * - GET /act_{ACCOUNT_ID}/adsets
 * - GET /act_{ACCOUNT_ID}/ads
 * - GET /act_{ACCOUNT_ID}/insights
 * - GET /{CREATIVE_ID}
 */

const META_API_URL = 'https://graph.facebook.com/v21.0';

type MetaInsight = {
  campaign_id?: string;
  adset_id?: string;
  ad_id?: string;
  date_start: string;
  date_stop: string;
  impressions: string;
  clicks: string;
  spend: string;
  actions?: Array<{ action_type: string; value: string }>;
  frequency?: string;
  ctr?: string;
  cpc?: string;
  cpm?: string;
};

/**
 * Busca insights diários de uma conta Meta
 *
 * TODO Pablo: implementar paginação · cache · rate limit
 */
export async function fetchAccountInsights(
  adAccountId: string,
  dateStart: string,
  dateStop: string,
): Promise<MetaInsight[]> {
  const accessToken = process.env.META_ACCESS_TOKEN;
  if (!accessToken) throw new Error('META_ACCESS_TOKEN não configurado');

  const params = new URLSearchParams({
    access_token: accessToken,
    level: 'ad',
    time_range: JSON.stringify({ since: dateStart, until: dateStop }),
    time_increment: '1',
    fields: 'campaign_id,adset_id,ad_id,date_start,date_stop,impressions,clicks,spend,actions,frequency,ctr,cpc,cpm',
    limit: '500',
  });

  const url = `${META_API_URL}/${adAccountId}/insights?${params}`;
  const res = await fetch(url, { next: { revalidate: 3600 } });

  if (!res.ok) {
    const err = await res.text();
    throw new Error(`Meta API error: ${res.status} · ${err}`);
  }

  const data = (await res.json()) as { data: MetaInsight[] };
  return data.data;
}

/**
 * Lista campanhas de uma conta
 * TODO Pablo: implementar
 */
export async function listCampaigns(adAccountId: string) {
  // TODO: GET /act_{id}/campaigns?fields=id,name,objective,status,daily_budget
  throw new Error('Não implementado · TODO Pablo');
}

/**
 * Pausa uma campanha (action toolbar · entra na Fase 2b)
 * TODO Pablo: implementar
 */
export async function pauseCampaign(campaignId: string) {
  // TODO: POST /{campaign_id} { status: 'PAUSED' }
  throw new Error('Não implementado · TODO Pablo');
}
