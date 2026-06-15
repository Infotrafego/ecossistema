# Infotráfego — Inteligência de Dados

Plataforma interna unificada para clientes da agência. Substitui o Looker Studio + ferramentas avulsas, juntando análise de criativos, públicos, funil, campanhas, otimizações e reuniões num único lugar.

Cliente piloto: **Carv Group / SE / MLC (Typebot)**.

📁 **Pasta no Drive:** https://drive.google.com/drive/folders/1QqTrdSVPQ69EeYkS3Knr8nxo7qUqBhLi
🎯 **Briefing técnico no ClickUp:** https://app.clickup.com/t/86ah7ttqd

---

## Como abrir

1. **Local (recomendado pra teste):** dois cliques em `index.html` — abre no navegador padrão e roda 100%.

2. **Compartilhar com o time (Drive):** o Drive não renderiza HTML, mostra o código. Pra compartilhar como app de verdade, use **Netlify Drop** (https://app.netlify.com/drop): arrasta o arquivo, recebe URL pública em 30 segundos.

3. **Produção (a partir da Onda 6):** app em domínio próprio (intel.infotrafego.com.br) com auth multi-tenant.

---

## Estrutura

```
infotrafego-creative-intel/
├── index.html          ← App final v6.4 (com página Reuniões)
├── README.md           ← Este arquivo
├── versions/
│   ├── index_v6.3_2026-05-02.html             ← Snapshot v6.3
│   └── index_v6.4_2026-05-02_reunioes.html    ← Snapshot v6.4 com Reuniões
├── data/               ← Dados-fonte usados na build
│   ├── combined_v7.json             ← Dataset unificado injetado no app
│   ├── meta_2026_full.json          ← Raw Meta Ads (Supermetrics)
│   ├── criativos_typebot_compact.json
│   ├── campaigns.json
│   ├── audiences.json
│   └── raw_2026.md                  ← Planilha CARV original (head)
└── brand/              ← Assets da marca usados na UI
    ├── symbol_ash.png   ← Símbolo cinza (hero)
    ├── lockup_white.png ← Logo branco horizontal
    ├── lockup_full.png  ← Logo completo navy
    ├── symbol_navy.png
    ├── symbol_white.png
    └── logo_full.png
```

---

## O que tem dentro do app (v6.4)

6 páginas (tabs no topo):

1. **Visão Geral** — funil cone 6 estágios (Investimento → ROAS), MoM/WoW, alertas
2. **Criativos** — galeria com thumbnails, drill-down, ranking, saturação
3. **Públicos** — performance por adset, lookalike vs interesse
4. **Campanhas** — drill-down campanha → ads
5. **Otimizações** — preview da integração ClickUp (em construção)
6. **Reuniões** — MVP da Fase 7. Lista as últimas atas Carv Group, mostra "Decisão × Execução × Resultado" com 22 decisões, 14 🟢 / 5 🟡 / 3 🔴. Drill-down abre detalhe completo da ata.

### Fontes de dados

- **Primárias** (volume, custo, leads, MQL, agend): planilha do CRM via cross-reference Typebot × Meta
- **Secundárias** (impressões, CTR, CPM, alcance): Meta Ads API
- **Mock projection** (reuniões realizadas, vendas, receita, LTV, ROAS): benchmarks setados em código (70% show rate · 25% close · ticket $2.4k · LTV 1.3x). Marcados com badge "Projeção" na UI.
- **Atas (página Reuniões)**: 4 atas reais Carv Group puxadas do ClickUp Doc

### Identidade visual

Cores oficiais Infotráfego: navy `#1A3D70` · alicerce `#031D31` · ash `#C7D2D7` · jet stream `#FFFFFF` · chimenes black `#10131A`.
Tipografia: Space Grotesk (títulos) + system-ui (corpo).

---

## 🎯 Roadmap em 6 ondas (entrega incremental)

Estratégia: cada onda vai pra produção e é validada antes da próxima começar. Sem big-bang, sem travar enquanto não tiver tudo 100%.

### 🟢 Onda 1 · MVP de Análise de Mídia
4 páginas (Visão Geral · Criativos · Públicos · Campanhas) substituem Looker Studio para análise diária do gestor.
**~4 semanas · Pré-requisitos:** Infra + Conectores

### 🟡 Onda 2 · Otimizações conectadas ao ClickUp
Página Otimizações ativa — lê comentários das tasks recorrentes "Otimização Diária" do ClickUp, cruza com curva de performance 7d antes/7d depois.
**~1,5 semana · Pré-requisitos:** Onda 1

### 🟠 Onda 3 · Inteligência IA dos Criativos
Análise automática top 5 via Whisper (transcrição) + GPT-4o vision (análise visual). Substitui análise heurística atual.
**~2 semanas · Pré-requisitos:** Onda 1

### 🔵 Onda 4 · Relatório Diário Inteligente
Sistema automatizado: cruza dados da plataforma + ações do ClickUp e dispara dois relatórios:
- **Interno** (cru, técnico) → ClickUp Chat
- **Cliente** (resultado, narrativa) → WhatsApp do grupo do cliente

Diferencial: gera narrativa causal ("MQL caiu 12% após pausarmos AD124 ontem"). Aprovação opcional pro cliente.
**~2 semanas · Pré-requisitos:** Ondas 1 + 2

### 🟣 Onda 5 · Inteligência de Reuniões (Pauta + Atas)
Página Reuniões ativa. Lê transcrições do Google Meet/Gemini, gera ata estruturada no ClickUp Doc na pasta certa, cria tasks automáticas com tag `origem-reuniao:[data]:[cliente]`. Dashboard "Decisão × Execução × Resultado" semanal.
**~2,5 semanas · Pré-requisitos:** Ondas 1 + 4

### 🔴 Onda 6 · Portal Cliente-Facing
Réplica multi-cliente em domínio próprio (intel.infotrafego.com.br). Cliente acessa via auth, vê só os funis dele.
**~1,5 semana · Pré-requisitos:** Ondas 1-5

### Cronograma sugerido (1 dev fullstack)

| Mês | Ondas | Entrega |
|---|---|---|
| Mês 1 | Infra + Conectores + Onda 1 | MVP Carv Group |
| Mês 2 | Ondas 2 + 3 | Otimizações + IA criativos |
| Mês 3 | Ondas 4 + 5 | Relatório diário + atas estruturadas |
| Mês 4 | Onda 6 | Multi-cliente cliente-facing |

Com 2 devs paralelos comprime pra ~2 meses.

---

## 🧱 Stack recomendada

- **Frontend:** Next.js 15 + React 19 + TypeScript + Tailwind + shadcn/ui + Recharts
- **Backend:** Next.js API + tRPC ou Hono · ORM: Prisma
- **Banco:** PostgreSQL (Supabase free) · Cache: Redis (Upstash) · Workers: Inngest
- **Auth:** Better Auth (free) ou Clerk ($25/mês)
- **IA:** OpenAI Whisper + GPT-4o vision + Claude Sonnet (atas)
- **Hospedagem:** Vercel Pro ($20/mês) ou VPS Hetzner + Coolify ($7/mês)
- **WhatsApp:** Business API oficial ou Z-API/UltraMsg

---

## 🗂️ Schema Postgres

```
clients (id, name, slug, brand_colors, sheets_id, ad_account_id, typebot_id)
client_goals (client_id, cpl_max, cpmql_max, cp_agend_max, conv_lm_min, spend_min)
meta_ads_daily (client_id, date, ad_id, ad_name, campaign_name, adset_name,
                spend, impressions, reach, clicks, lp_views,
                creative_thumbnail_url, instagram_permalink, fetched_at)
funnel_daily (client_id, date, ad_name, leads, mqls, agendamentos,
              reunioes_realizadas, vendas, receita, source)
creative_intel (client_id, ad_name, format, concept, hook_inferred,
                transcription, vision_analysis)
optimizations (client_id, date, gestor_id, ad_name, action, hypothesis,
               observation, clickup_task_id, clickup_comment_id)
alerts (client_id, date, ad_name, alert_type, message, status)
daily_reports (client_id, date, audience, payload, sent_at, sent_to, status)
meeting_minutes (id, client_id, meeting_date, raw_transcript, structured_md,
                 clickup_doc_url, source, created_at)
meeting_actions (id, meeting_id, action_text, responsible_user_id, due_date,
                 clickup_task_id, status, impact_summary, impact_evaluated_at)
users (id, email, role, client_ids)
```

---

## 🏁 Decisões pendentes

- Hospedagem: Vercel Pro vs self-hosted Coolify
- Banco: Supabase free vs self-hosted
- Auth: Clerk vs Better Auth
- Domínio: subdomínio ou dedicado
- Time: 1 fullstack (4 meses) ou 2 pessoas (2 meses)
- Onda 4: WhatsApp Business API oficial ou Z-API
- Onda 4: aprovação manual ou automática pro cliente
- Onda 5: Google Calendar API direto ou polling do Drive

---

## 🚀 Backlog V2 (pós Ondas 1-6)

Quality Score do Criativo (0-100) · Recomendações IA matinais · Comparador A/B lado-a-lado · Forecast fim-do-mês · Histórico do criativo (sparkline) · Email digest semanal · Cohort analysis lead→venda · Heatmap dia×hora · Anotações no gráfico · Chat com IA sobre os dados · Mobile-first + PWA · Slack integration.

---

## Histórico de versões

- **v6.4** (02/05/2026) — Página Reuniões adicionada com 4 atas reais Carv Group · dashboard Decisão × Execução × Resultado · drill-down completo. Renomeação: "Inteligência de Criativos" → "Inteligência de Dados".
- **v6.3** (01/05/2026) — Funil cone 7 estágios completo (Investimento → ROAS) · LTV · CAC · projeções benchmarks B2B mentoria.
- **v6.0** (01/05/2026) — Funnel cone 6 estágios · LTV · jornada · ROAS · CAC.
- **v5.x** (30/04/2026) — MoM/WoW · drill-down campanhas · saturação CTR · logo white em hero.
- **v4.x** — Identidade visual oficial · 5 páginas funcionais.
- **v3.x** — Métricas primárias da planilha (não pixel).
- **v2.x** — Live-pull Meta Ads via Supermetrics.
- **v1.x** — MVP inicial Typebot × Meta Ads.

*Última atualização: 02/05/2026*
