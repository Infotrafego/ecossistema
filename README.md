# Ecossistema Infotráfego · Inteligência de Dados (Fase 2)

Plataforma própria que substitui o Looker Studio na operação diária da Infotráfego.
Multi-tenant (cada cliente vê só os próprios dados), com a Infotráfego como piloto.

**Stack:** Next.js 14 · React 18 · Tailwind · Supabase (Postgres + Auth + RLS) ·
Claude API · Meta Marketing API · Docker Swarm + Traefik.

> 📖 Arquitetura, Supabase e deploy detalhados em **[CLAUDE.md](CLAUDE.md)**.

---

## Setup local

Pré-requisitos: Node.js 20+ · conta Supabase.

```bash
npm install
cp .env.example .env.local      # preencher Supabase URL/keys (ver .env.example)
npm run dev                     # http://localhost:3000
```

**Login inicial:** Supabase Dashboard → Authentication → Users → Add user. O trigger
cria o perfil automaticamente; depois promova a admin e associe ao cliente piloto
(SQL em [CLAUDE.md](CLAUDE.md#supabase) ou no comentário do seed).

Scripts: `dev` · `build` · `start` · `lint` · `typecheck`.

---

## Banco de dados (Supabase)

Projeto **Infotráfego** (`jcserimdehwyxghdgmgj`) · schema **`infotrafego_ecossistema`**.

Migrations em [supabase/migrations/](supabase/migrations/): schema → RLS → seed. Toda
mudança = nova migration (nunca editar uma aplicada).

⚠️ **Uma vez:** exponha o schema em Dashboard → Settings → API → *Exposed schemas*
(adicione `infotrafego_ecossistema`), senão as queries do app falham.

---

## Deploy (Docker Swarm + Traefik)

CI/CD: push na `main` → [GitHub Actions](.github/workflows/deploy.yml) builda e empurra
a imagem pro **GHCR** (`ghcr.io/infotrafego/ecossistema`) → stack no **Portainer**
([docker-stack.yml](docker-stack.yml))
faz pull e sobe atrás do Traefik em `ecossistema.servidordainfotrafego.com.br`.

- `NEXT_PUBLIC_*` → **build-time** (GitHub Secrets, embutidas na imagem).
- Segredos de servidor (`SUPABASE_SERVICE_ROLE_KEY`, `ANTHROPIC_API_KEY`, `META_*`) →
  **runtime** (Portainer).

Passo a passo completo em [CLAUDE.md](CLAUDE.md#deploy).

---

## Estrutura

```
app/            # rotas (App Router) — login · dashboard · /api (ações, sync, IA)
components/     # layout (sidebar · brand-bar · filtros) + dashboard (cone ★, overview, intel)
lib/            # funil · cone · intel · analise · fadiga · regras · orcamento · filtros
  data/         # leitura do Supabase (server-only)
  meta-ads/     # http · client · actions · sync · executor · agendador
  claude/       # client (Haiku + cache) · analises · assistente
  supabase/     # client (browser) · server (SSR) · service (service role)
scripts/        # runner + verificações executáveis da lógica pura
supabase/       # migrations · tests (RLS)
docs/           # referência + mockups HTML (visual oficial)
```

---

## Verificação

O projeto não tem test runner (cada dependência nova é custo de build). A lógica
pura — métricas, inferência de funil, cone, tradução das actions da Meta, fadiga,
regras, orçamento — roda de verdade por um runner baseado no `jiti`, que já vem
com o Next:

```bash
npm run verificar        # núcleo + IA (121 asserções)
npm run typecheck
npm run build
```

Multi-tenancy tem teste próprio, em SQL: cole
[supabase/tests/rls_multi_tenancy.sql](supabase/tests/rls_multi_tenancy.sql) no SQL
Editor do Supabase. Ele cria dois clientes e quatro usuários, afirma quem vê o quê,
e termina em `ROLLBACK` — não suja o banco. **Executado em 18/09/2026: passou nas 6
categorias** (isolamento entre clientes, admin, usuário órfão, escrita bloqueada em
`metrics_daily` e `audit_log`, privacidade do chat por usuário).

Contra o banco real, com dados de produção:

```bash
node scripts/run.cjs scripts/verificar/conferencia-abas.ts   # as 5 abas fecham igual?
node scripts/run.cjs scripts/diagnostico-meta.ts             # o que a conta devolve (2 chamadas)
```

A conferência confirma que Criativos, Públicos, Campanhas e a série diária somam
exatamente o total da Visão Geral, e que esse total bate com o que a Meta reportou.

---

## Decisões técnicas

**Grão atômico = o anúncio.** Na Meta, um ad JÁ É a combinação criativo × público.
Criativos, Públicos e Campanhas são agregações da mesma base de linhas de ad, feitas
em TypeScript. É isso que garante que as 5 abas sempre fechem no mesmo número —
misturar as linhas pré-agregadas do sync com as agregadas em memória na mesma tela é
exatamente como elas passariam a divergir.

**Uma chamada de insights por sync, no nível `ad`.** Pedir os quatro níveis à API
custaria ~4× a cota (o limite inicial é ~200 chamadas/hora) e daria os mesmos números:
a linha de ad já traz `adset_id` e `campaign_id`. A agregação para adset, campanha e
criativo acontece em `lib/meta-ads/sync.ts`.

**`metrics_daily.stage_values`.** Mapa `EtapaId → valor` por dia, traduzido dos
`actions[]` da Meta uma única vez (`lib/meta-ads/actions.ts`). Sem ele, cada família
de funil precisaria de colunas próprias; com ele, uma config nova de funil renderiza
cone, KPIs e tabelas sem tocar no schema.

**Action types: MÁXIMO, nunca soma.** A Meta reporta o mesmo evento em várias
granularidades ao mesmo tempo. Na conta da Infotráfego: `lead` 181, `lead_grouped` 125,
`fb_pixel_lead` 56 — os dois últimos SÃO o primeiro (125+56=181). Somar dobrava os leads
do dashboard inteiro. Mesmo padrão em `page_engagement`/`post_engagement` (25.406 vs
25.405) e `landing_page_view`/`omni_landing_page_view` (1.041 vs 1.041). Por isso
`lib/meta-ads/actions.ts` mapeia etapa → lista de candidatos e pega o maior.
Descoberto rodando `scripts/diagnostico-meta.ts` contra a conta real.

**Cliques = `link_click`, não `clicks`.** Mesmo problema: `clicks` conta curtida,
comentário e expandir legenda; `link_click` é quem foi pro destino e é o número que casa
com Page View na etapa seguinte.

**Janela de insights fatiada em blocos de 30 dias.** A Meta recusa requisições grandes
no nível `ad` com quebra diária ("Please reduce the amount of data you're asking for") —
não é rate limit, é volume por requisição. 292 dias × 175 ads estourava; em blocos, os
mesmos 292 dias saem em 12 chamadas.

**Listagem de entidades sem filtro de status.** Filtrar por ACTIVE/PAUSED parecia
economia até os números mostrarem o contrário: 29 dos 204 anúncios com histórico estavam
ARCHIVED, e sem o metadado deles R$ 4.672,83 (21% do investimento) e 35 leads sumiam das
abas de ranking enquanto a Visão Geral seguia contando. Duas telas com números diferentes
é pior que uma tela lenta.

**Cron dentro do container, não Edge Function.** Os segredos já vivem no Portainer
(duplicá-los nos secrets do Supabase é mais um lugar pra girar e vazar token); o sync
compartilha `lib/funil` e `lib/intel` com o app, e Edge Function é Deno — seria uma
segunda cópia da tradução de actions. Custo: a stack **precisa** rodar com
`replicas: 1`, e está assim no `docker-stack.yml`, comentado.
*Efeito colateral aceito:* o `instrumentation.ts` é compilado também para o runtime
edge, o que leva o bundle do middleware de 83 kB para 149 kB. Como o deploy é
self-hosted (Docker + Traefik, não Vercel), esse bundle é carregado uma vez na subida
do processo, não por request.

**Filtros globais na URL.** Período, funil e cliente vivem em search params, não em
contexto React: a tela fica linkável, sobrevive a F5 e as páginas continuam Server
Components. O layout não recebe `searchParams` no App Router, então a barra lê a URL
pelo cliente com a MESMA função (`lerFiltros`) que o servidor usa — as duas nunca
divergem.

**Escrita na Meta é allowlist, não booleano.** `META_WRITE_ALLOWED_ACCOUNTS` lista as
contas liberadas; vazio (o padrão) bloqueia tudo. Liberar "produção" com uma flag é
exatamente o acidente que se quer evitar. Toda ação — manual, do assistente ou de
regra automática — passa pelo mesmo executor, grava `audit_log` com o estado anterior
ANTES de chamar a API, e reverte se a Meta recusar no meio.

**Haiku + cache em banco.** O briefing técnico falava em Sonnet/Opus com orçamento
mensal; a task do ClickUp manda free tier com Haiku e cache. Vale a task. Nenhuma
chamada sai sem passar por `ia_cache`, e nenhuma análise roda no carregamento de
página — sempre sob demanda, com botão.

**O assistente propõe, o código resolve.** O modelo traduz "pausa criativos com freq
acima de 3.5" em ação + filtro; QUAIS anúncios casam sai de query determinística. Id
alucinado vira "nenhum alvo encontrado", não anúncio errado pausado.

**Projeção nunca se disfarça de dado.** Reuniões, vendas, receita, CAC, ROAS e LTV são
benchmark enquanto o CRM não integra, e aparecem marcados. Quando a conta reporta
compra pelo pixel, o número real vence a projeção automaticamente.

---

## Estado atual

| Área | Estado |
|---|---|
| 5 abas com dados reais do Supabase | ✅ |
| Filtros globais (período · funil · cliente) | ✅ |
| Cone/KPIs/tabelas renderizados por config de funil | ✅ |
| Construtor de Funil persistindo | ✅ |
| Sync Meta rodando contra a conta real | ✅ 2.502 linhas · 137 dias · R$ 22.031,77 conferidos |
| Multi-tenancy | ✅ teste executado, 6 categorias passaram |
| Fadiga criativa sobre dado real | ✅ 47 criativos · 1 crítico (o de 65 dias de entrega) |
| Action toolbar (6+5+6) com auditoria e rollback | ✅ código · ⏳ 1ª ação real |
| Regras Auto · Copy IA · Assistente | ✅ código · ⏳ 1ª chamada paga ao Claude |

### ⚠ Dados de demonstração ativos

O banco está **com dados de demonstração** para que o dashboard abra populado no
recorte padrão de 30 dias. Não confunda com produção real:

```bash
npm run demo:status     # o que está no banco
npm run demo:remover    # apaga tudo que é demonstração
npm run demo:aplicar    # gera de novo
```

Como funciona ([scripts/mock-dados.ts](scripts/mock-dados.ts)): em vez de uma camada
de mock no código, o script **copia a fatia mais rica do histórico REAL** e a desloca
no tempo para terminar hoje. Nomes de campanha, verba, CTR, CPL e curva de criativo
são os de verdade; o pipeline exercitado é o mesmo de produção.

Toda linha gerada leva `raw_data = {"mock": true}` — é por essa marca que o
`--remover` apaga, sem chutar intervalo de data. Nenhuma linha real é tocada: a fatia
deslocada cai depois de 23/06/2026, faixa sem dado real, então não há colisão de PK.

**O que é inventado, e só isto:** as etapas comerciais (formulário iniciado, lead
qualificado, agendamento, proposta). A Meta não as reporta porque dependem do CRM, que
é integração de outra fase. São derivadas do número real de leads do dia, simulando
lead a lead com um sorteio determinístico, o que mantém as etapas aninhadas e as taxas
corretas no agregado. Reunião realizada e venda seguem **projetadas por benchmark**,
como em produção, com o selo "Proj" no cone.

Também ficam gravados (e sobrevivem ao `--remover`, porque são config e não dado): o
vínculo das 8 campanhas ao funil de aquisição, e verba/metas de setembro/2026.

### Sobre a conta piloto

`act_616936072501143` ("CA1.0 - Infotráfego") **não entrega desde 23/06/2026** — as 28
campanhas estão pausadas. O histórico sincronizado vai de 04/12/2025 a 23/06/2026. Um
sync de "últimos 30 dias" volta legitimamente vazio, e as telas mostram o estado vazio
explicando o motivo em vez de um dashboard zerado sem explicação.

**Limitação medida:** 130 dos 204 anúncios com entrega (63% do investimento) vêm da API
sem o campo `creative`, porque `/adcreatives` não devolve o criativo de anúncios antigos.
Para esses, a aba Criativos agrupa pelo próprio anúncio e usa o nome dele — o que
funciona porque a nomenclatura da agência já identifica o criativo
(`AD121_VID_Antes de vocês entrarem...`). Resolver de verdade custaria uma chamada por
anúncio, sem ganho proporcional.

**Escrita na Meta:** liberada apenas no `.env` local, para `act_616936072501143` — conta
da própria agência, pausada, sem verba rodando. Em produção (Portainer) a allowlist segue
**vazia**: nenhuma conta de cliente aceita ação de escrita até liberação explícita.

Identidade visual e roadmap: [docs/](docs/) e [CLAUDE.md](CLAUDE.md).
