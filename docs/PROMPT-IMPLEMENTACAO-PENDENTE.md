# Prompt · Implementar o pendente da Fase 2 (core + 2b + 2c)

> **Como usar:** abra uma sessão nova do Claude Code na raiz deste repositório e cole
> este arquivo inteiro como primeira mensagem. Ele é autossuficiente — não depende de
> nenhum contexto de conversa anterior.

---

## 0 · Quem é você e o que vai fazer

Você é o agente da camada **Agents** do framework WAT descrito no `CLAUDE.md` deste
repositório. Leia o `CLAUDE.md` antes de qualquer coisa — ele define a arquitetura, os
pontos críticos do projeto (schema dedicado, env build-time × runtime, deploy) e quando
chamar o Pablo.

Sua tarefa é **fechar a Fase 2 da Inteligência de Dados** e implementar as duas
extensões que estão especificadas no Drive mas não estavam na task do ClickUp: a
**Fase 2b (Action toolbar CRUD via Meta)** e a **Fase 2c (Inteligência IA)**.

Esforço estimado pelo briefing do Mickael: **2b = 80-140h · 2c = 120-200h**, mais o que
resta do core da Fase 2. É trabalho para várias sessões — siga a ordem do bloco 4 e
entregue incrementos que buildam e rodam, não um big bang.

---

## 1 · Estado atual (verificado em 18/09/2026 — confie nisto)

### O que JÁ está implementado e no ar

Produção: **https://ecossistema.servidordainfotrafego.com.br** (stack `ecossistema`,
Id 65 no Portainer, Docker Swarm + Traefik, imagem `ghcr.io/infotrafego/ecossistema:latest`).

| Área | Estado |
|---|---|
| Login + middleware de auth (Supabase) | ✅ funcionando |
| Layout (sidebar + brand bar) | ✅ |
| Visão Geral | ✅ UI completa, **dados mockados** (`data/mock-metrics.ts`) |
| Criativos · Públicos · Campanhas | ✅ UI completa, **dados mockados** (`data/mock-intel.ts`) |
| Otimizações (pivot + Raio-X + ações) | ✅ UI completa, **dados mockados** |
| Construtor de Funil (wizard 3 passos) | ✅ UI completa, **não persiste** — só gera JSON em memória |
| Schema Supabase + RLS + seed | ✅ 3 migrations aplicadas |
| CI/CD (push main → GHCR → Portainer) | ✅ |

### Arquivos que você vai mexer mais

```
lib/intel.ts                      # métricas derivadas, alertas, ordenação — puro, sem React
lib/funil.ts                      # taxonomia do funil modular + reconhecimento automático
lib/meta-ads/client.ts            # STUB — lança "Não implementado"
lib/meta-ads/sync.ts              # STUB
lib/claude/client.ts              # STUB
data/mock-metrics.ts              # mock da Visão Geral — a remover
data/mock-intel.ts                # mock das outras 4 abas — a remover
components/dashboard/funil-cone.tsx
components/dashboard/intel/       # podium · ranking-view · secondary-row · nota-projecao
app/dashboard/inteligencia-de-dados/**/page.tsx
supabase/migrations/              # toda mudança = nova migration
```

### Schema que JÁ existe (não recriar)

Schema dedicado `infotrafego_ecossistema` (o app **não** usa `public`). Tabelas:
`users` · `clients` · `client_members` · `funis` · `campaigns` · `adsets` · `creatives` ·
`ads` · `metrics_daily` · `fadiga_creative`.

Funções: `handle_new_user()` · `set_updated_at()` · `user_has_client_access()` · `is_admin()`.

`metrics_daily` já tem a PK composta `(client_id, entity_type, entity_id, date)` e as
colunas de insight (impressions, clicks, spend, conversions, revenue, frequency, ctr,
cpc, cpm, raw_data, synced_at). `fadiga_creative` já existe com `score`/`status`/
`days_active`/`last_refresh`.

---

## 2 · ⚠ Conflitos entre as fontes — leia antes de codar

Os documentos do Drive foram escritos em datas diferentes e **se contradizem**. Resolva
sempre pela coluna "o que vale":

| Tema | Fonte antiga | Fonte nova / realidade | O que vale |
|---|---|---|---|
| **Hospedagem** | Briefings dizem **Vercel** | O repo já deploya em **Docker Swarm + Traefik** via GHCR/Portainer | **Docker/Portainer.** Não migre pra Vercel. |
| **Meta Ads** | Briefings dizem "via MCP Meta Ads" | Task ClickUp: "Marketing API direta · sem custo" | **Marketing API direta.** MCP é camada do Cowork, não existe em produção. |
| **Modelo de IA** | Briefing técnico: Sonnet 4.5 / Opus, R$ 1.500-3.500/mês | Task ClickUp: free tier, **preferir Haiku**, cache em DB, batch | **Haiku + cache.** Custo precisa de aprovação prévia. |
| **Cliente piloto** | `BRIEFING_01` (12/05): Carv Group · MLC | `01-FASE-2` (05/06) e task: **a própria Infotráfego** | **Infotráfego**, funil de aquisição. |
| **Versão do mockup** | `BRIEFING_01`: v6.24 | Inventário: v6.26 · 3.014 linhas · 23 render fns | Local **é** v6.26 (verificado). Use `docs/mockups/creative-intel/index.html`. |
| **Custos** | `03-CUSTOS-FERRAMENTAS.md` | Task ClickUp: "**NÃO usar** · é projeção futura" | Ignore o doc de custos. |

### 🔴 Bug latente que você PRECISA resolver antes de persistir funil

O CHECK constraint do banco **não bate** com a taxonomia do código:

```sql
-- supabase/migrations/20260602000000_initial_schema.sql
modo_captura text NOT NULL CHECK (modo_captura IN
  ('form_meta', 'landing', 'whatsapp', 'quiz', 'webinario'))
```

```ts
// lib/funil.ts (segue o BRIEFING_01, que é a spec canônica)
type ModoCaptura = 'landing_page' | 'formulario_nativo'
                 | 'click_to_whatsapp' | 'instagram_dm' | 'multi';
```

Nenhum valor coincide. **Qualquer INSERT do Construtor vai falhar.** Crie uma migration
nova alinhando o CHECK à taxonomia do `BRIEFING_01` (não mude o TypeScript — o briefing
é a fonte). Se houver linha existente em `funis`, migre o valor antigo no mesmo script.

### 🟡 Divergência menor de nomes de etapa

`lib/funil.ts` inventou alguns ids que diferem do `EtapaId` canônico do `BRIEFING_01`:

| Em `lib/funil.ts` | No `BRIEFING_01` |
|---|---|
| `salvamentos` | `save` |
| `reuniao_realizada` | `call_realizada` |
| `replay_view` | `replay` |
| — | faltam: `compartilhamento`, `visita_perfil`, `confirmacao_evento`, `assistiu_evento`, `vis_produto`, `checkout_iniciado` |

Reconcilie para os nomes do briefing **antes** de gravar `etapas` no banco — depois que
houver funil salvo, renomear vira migração de dados.

---

## 3 · Fontes de verdade

**No repositório (já atualizadas, são as mais recentes):**
- `docs/01-FASE-2-INTELIGENCIA-DE-DADOS.md` — o que construir
- `docs/02-MARCA-INFOTRAFEGO.md` — cores, tipografia, logo
- `docs/mockups/creative-intel/index.html` — **referência visual exata das 5 abas** (v6.26)
- `docs/mockups/construtor-funil/index.html` — Construtor (v0.2, 636 linhas)
- `docs/mockups/app-unificado-v1.5-COMPLETO.html` — ecossistema inteiro; a **action toolbar
  da Fase 2b está mockada aqui** (procure `action-bar` / `id="action-bar"`)

**No Drive (pasta "DASHBOARD INFOTRAFEGO", NÃO estão no repo):**
- [BRIEFING_TECNICO_ROADMAP_v1.md](https://docs.google.com/document/d/16L0K06uTxppXYea2tNCr-cv0ZnwHw4xIERrKtPTLY94/edit) — seções 6, **6b** e **6c** são o escopo desta tarefa
- [BRIEFING_01_INTELIGENCIA_DE_DADOS.md](https://drive.google.com/file/d/1BXJoaon7_yLbcd-oBcU1fqaba0GeFwJ2/view) — spec do funil modular, regras de inferência, renderização dinâmica
- [BRIEFING_EXECUTIVO_ROADMAP_v1.md](https://docs.google.com/document/d/1IJ06M7u-g_RDyusZim2h2mO3PR9l3OLrhS2UJ0AIebE/edit) — estimativas e checkpoints
- [BRIEFING_02_MOTOR_IA.md](https://docs.google.com/document/d/1FG-0g37pu-5-jYSWYUm7vVupi2RsJJU2iu5NrDNuGqU/edit) — fora do escopo (é a Entrega 2), mas a camada de prompt é compartilhada

**Regra do `CLAUDE.md`:** não crie nem sobrescreva docs em `docs/` sem perguntar ao Pablo.
Se quiser trazer os briefings do Drive pro repo, **pergunte antes**.

**⚠ Sobre a lista de mockups nos briefings:** eles citam PDFs em `/uploads/` e pastas
`infotrafego-*/`. Não existem neste repositório. Não invente conteúdo a partir dos nomes —
se precisar do material, peça o arquivo ao Pablo.

---

## 4 · O trabalho, em ordem

Entregue **um bloco por vez**, cada um buildando e verificado. Não comece o próximo sem
o anterior estar de pé.

### BLOCO A · Fechar o core da Fase 2

Este bloco é pré-requisito dos outros dois: sem dados reais, 2b e 2c não têm o que operar.

**A1 · Meta Marketing API real** (`lib/meta-ads/client.ts` + `sync.ts`)
- Substituir os stubs por chamadas à Marketing API direta (credenciais `META_APP_ID`,
  `META_APP_SECRET`, `META_ACCESS_TOKEN` já no `.env` e no Portainer).
- Puxar campaigns / adsets / ads / creatives + insights por dia, gravar em
  `metrics_daily` (upsert pela PK composta — o schema já suporta re-sync idempotente).
- Paginação, retry com backoff e respeito a rate limit (o briefing marca isso como risco;
  o limite inicial é ~200 calls/hora/user).
- Cron diário. Free tier: use Supabase Edge Function agendada **ou** um job no próprio
  container — decida e registre o porquê no README.
- **Antes de rodar sync que gaste cota ou crédito, confirme com o Pablo** (regra do `CLAUDE.md`).

**A2 · Trocar mock por dados reais**
- `data/mock-metrics.ts` e `data/mock-intel.ts` saem; as páginas passam a ler do Supabase.
- **Preserve o formato de `lib/intel.ts`**: ele já é puro e recebe `LinhaBruta[]`. O sync
  só precisa entregar linhas nesse shape — não reescreva a camada de métricas.
- Mantenha a distinção real × projeção (`<NotaProjecao />`). Reuniões, vendas, receita,
  CAC, ROAS e LTV continuam projetados por benchmark até o CRM integrar. **Não apresente
  projeção como dado real.**

**A3 · Filtros globais** — *não existem hoje, e o critério de pronto exige*
- Período (presets + datas custom), funil e cliente, no header, **sticky**, funcionando
  nas 5 abas. Estado compartilhado (URL search params de preferência, para ser linkável).

**A4 · Construtor de Funil persistindo**
- Salvar/editar/listar em `funis`. **Resolva antes o conflito do `modo_captura` (seção 2).**
- Critério de pronto do briefing: *"Construtor cria nova config e a Inteligência de Dados
  renderiza imediatamente"*.

**A5 · Renderização dinâmica pela config do funil** — *a parte que falta de verdade*

Hoje o cone e os KPIs são fixos. O `BRIEFING_01` exige que **cada componente leia a
config**:
- **Cone:** etapas vêm de `funil.etapas[]` na ordem definida; pin `◉ MKT` na etapa
  `marcador_mkt` e `◉ COM` na `marcador_com`; se `modo_captura === 'formulario_nativo'`,
  pula `page_view` automaticamente.
- **KPI row:** os KPIs derivam do par `familia.sub_objetivo` (a tabela "Sub-objetivos por
  família + KPI primário" do `BRIEFING_01` tem o mapa completo).
- **Tabelas:** colunas dinâmicas — uma por etapa do funil + custo por etapa; etapas com
  marcador em negrito.
- **Distribuições:** `captacao`/`lancamento` → frio vs quente · `venda_direta` → placement/
  dispositivo · `distribuicao` → formato (Reels/Carrossel/Story/Live).
- **Saldo & Orçamento:** se `familia === 'lancamento'` e há fases, mostrar previsto ×
  realizado **por fase**.

**A6 · Completar a Visão Geral**
Compare com o mockup (`data-page="overview"`) e implemente o que falta: linhas temporais
(Leads × MQLs × Agendamentos e Investimento diário), **Visão por Dia da Semana**,
distribuições por campanha/público/criativo, jornada de compra e alertas ativos.

**A7 · Multi-tenancy validado**
Testar RLS com 2+ usuários e 2+ clientes. O briefing marca policy errada como risco de
**vazamento de dados entre clientes** — teste exaustivamente, incluindo o caminho do
service role.

**A8 · Performance, logs e README**
Dashboard < 2s; paginação em tabelas > 100 linhas; logs e métricas básicas; README com as
decisões técnicas tomadas.

---

### BLOCO B · Fase 2b — Action toolbar CRUD via Meta

Ligar botões de ação reais às telas. O mockup já tem o CSS/JS da toolbar
(`docs/mockups/app-unificado-v1.5-COMPLETO.html`, `id="action-bar"`).

| Rota | Ações |
|---|---|
| Campanhas | + Nova · ✎ Editar · ⏸ Pausar · ⎘ Duplicar · ↑ Aumentar orçamento · ↓ Reduzir orçamento |
| Públicos | + Novo · ✎ Editar · ⚡ Otimizar (IA) · ⎘ Duplicar · Arquivar |
| Criativos | + Novo · ⏸ Pausar · ↑ Escalar verba · ⎘ Duplicar · Solicitar variação · ✎ Editar |
| Otimizações | ✓ Aplicar sugestão · ✕ Ignorar · ⏰ Lembrar depois |

**Critério de pronto (do briefing):**
- 6 ações de Campanhas, 5 de Públicos e 6 de Criativos funcionando em **conta de teste**
- Toda ação com **log de auditoria** (quem · quando · o quê · resultado) — crie a tabela
  numa migration nova
- **Modal de confirmação** antes de ação destrutiva (pausar, arquivar)
- **Rollback** em caso de erro da API Meta — não deixar estado inconsistente

**Regra de segurança:** essas ações gastam verba de cliente real. Rode **só em conta
sandbox/teste** até o Pablo liberar explicitamente. Nunca execute ação destrutiva em
conta de produção por iniciativa própria.

---

### BLOCO C · Fase 2c — Inteligência IA

Camada que age, não só mostra. Tudo com **Haiku + cache em DB** (ver seção 2).

**C1 · Assistente IA conversacional**
Chat no dashboard; o usuário pede em linguagem natural (*"pausa criativos com freq > 3.5
na campanha MLC"*) e a IA traduz para chamadas da Marketing API + confirma o resultado.
Pronto = 10 comandos processados, 100% dos comandos válidos viram chamadas corretas.
Depende do Bloco B (é ele quem executa).

**C2 · Diagnóstico de Fadiga Criativa**
Score por criativo a partir da **curva de decay do CTR ao longo do tempo**; classifica em
saudável / atenção / crítico e sugere ação (continuar · substituir · pausar).
A tabela `fadiga_creative` **já existe** — só preencher. Atualização diária, 100% dos
criativos ativos.

**C3 · Otimizador / Regras Auto**
Editor de regras configuráveis (*"se CPC > R$ 3,50 por 3 dias → pausar ad set"*), executor
em cron diário, histórico de execuções rastreável. Pronto = 5+ regras ativas funcionando.

**C4 · Sugestões de Copy IA**
3+ variações por solicitação, vinculadas ao cliente, com contexto de nicho/público/oferta/
top criativos passados.

---

## 5 · Como trabalhar (regras não negociáveis)

1. **Toda mudança de banco = nova migration.** Nunca edite migration já aplicada.
2. **Verifique, não presuma.** Rode `npm run build` e `npx tsc --noEmit` a cada bloco.
   Para lógica pura (métricas, inferência de funil, decay de fadiga), rode a função de
   verdade e confira o resultado — não afirme que funciona sem ter executado.
3. **Custo zero.** Free tiers apenas. Qualquer coisa paga — upgrade de plano, ferramenta
   nova, sync que consuma crédito — passa pelo Pablo **antes**.
4. **Segredos** ficam no `.env` (local) e no Portainer (runtime). Nunca commite.
   `NEXT_PUBLIC_*` são build-time (GitHub Secrets → build-args do CI).
5. **Mockup é referência visual, não código.** Replique layout/UX em React + Tailwind;
   não converta HTML→React direto.
6. **Deploy:** push na `main` → GitHub Actions builda e empurra pro GHCR → Portainer puxa.
   Não crie stack nova; a `ecossistema` (Id 65) já existe.
7. **Reporte com honestidade.** Se um bloco ficou parcial, diga o que ficou de fora e por
   quê. Se um teste falhou, mostre a saída.
8. **Chame o Pablo** para: credenciais/acessos, decisão de produto ou escopo, orçamento.
   Decisão técnica (arquitetura, libs, padrões) é sua.

---

## 6 · Definição de pronto (a fase inteira)

Do `BRIEFING_TECNICO` §6.6 + §6b.4 + §6c.4 e da task do ClickUp:

- [ ] 5 abas com **dados reais** da Infotráfego (cliente piloto)
- [ ] Cone renderizado a partir de **qualquer** config — testar **3 famílias diferentes**
- [ ] Multi-tenancy validado (2+ usuários, 2+ clientes)
- [ ] Sync Meta rodando diariamente **sem falhas por 7 dias seguidos**
- [ ] Filtros globais (período · funil · cliente) nas 5 abas
- [ ] Construtor cria config e a ID renderiza imediatamente
- [ ] Dashboard carrega em **< 2s** · paginação acima de 100 linhas
- [ ] Action toolbar: 6 ações Campanhas + 5 Públicos + 6 Criativos, com auditoria e rollback
- [ ] Assistente IA: 10 comandos válidos → chamadas corretas
- [ ] Fadiga: 100% dos criativos ativos, atualização diária
- [ ] Regras Auto: 5+ regras ativas com histórico
- [ ] Copy IA: 3+ variações por solicitação
- [ ] Logs e métricas básicas coletadas
- [ ] README atualizado com as decisões técnicas
- [ ] Operação **100% em free tier** durante toda a fase

**Critério final do Mickael (`BRIEFING_01`):** *Mickael + 1 gestor de tráfego usando todo
dia em substituição ao Looker por 5 dias úteis seguidos, sem upload manual de dado e sem
reclamação de funcionalidade essencial ausente.*

---

## 7 · Primeira ação sugerida

1. Ler `CLAUDE.md` e `docs/01-FASE-2-INTELIGENCIA-DE-DADOS.md`.
2. Abrir `docs/mockups/creative-intel/index.html` e comparar a aba Visão Geral com
   `app/dashboard/inteligencia-de-dados/page.tsx` para dimensionar o A6.
3. Rodar `npm run build` para confirmar que parte de uma base verde.
4. Abrir o **Bloco A1** (Meta Marketing API) — mas **confirmar com o Pablo** antes de
   disparar o primeiro sync real.

Comece pelo conflito do `modo_captura` (seção 2) se for mexer no Construtor antes disso:
é barato agora e caro depois que houver funil gravado.
