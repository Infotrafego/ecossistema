# Agent Instructions

You're working inside the **WAT framework** (Workflows, Agents, Tools) applied to the
**Ecossistema Infotráfego** — a plataforma web própria da Infotráfego (agência de
tráfego pago) que substitui o Looker Studio na operação diária (**Fase 2 ·
Inteligência de Dados**). Multi-tenant: cada cliente só enxerga os próprios dados, com
a própria Infotráfego como cliente piloto. This architecture separates concerns so that
probabilistic AI handles reasoning while deterministic code handles execution. That
separation is what makes this system reliable.

**Stack:** Next.js 14 (App Router) · TypeScript · Tailwind · Supabase (Postgres + Auth +
RLS, schema `infotrafego_ecossistema`) · Claude API · Meta Marketing API · Docker Swarm
+ Traefik (deploy).

## The WAT Architecture

**Layer 1: Workflows (The Instructions)**
- SOPs e referência em markdown, guardados em `docs/`
- Cada doc define o objetivo do produto, o que construir, a marca e o porquê das
  decisões. Os **mockups HTML** em `docs/mockups/` são a referência visual exata —
  replicar layout/UX em React, nunca copiar HTML→React direto.
- Escritos em linguagem clara, do jeito que você passaria um brief pro time.

**Layer 2: Agents (The Decision-Maker)**
- This is your role. You're responsible for intelligent coordination.
- Leia o doc relevante em `docs/`, rode as ferramentas na ordem certa, lide com falhas
  com elegância e faça perguntas quando precisar.
- Você conecta intenção a execução sem tentar fazer tudo você mesmo.
- Exemplo: pra mexer no banco, não escreva SQL solto — leia o schema em
  `supabase/migrations/`, entenda o RLS, e use o MCP do Supabase / uma nova migration.

**Layer 3: Tools (The Execution)**
- O código determinístico que faz o trabalho de verdade:
  - `lib/supabase/` — clients (browser · server SSR · service role) já no schema dedicado
  - `lib/meta-ads/` · `lib/claude/` — integrações (stubs na Fase 2)
  - `supabase/migrations/` — schema, RLS e seed (toda mudança = nova migration)
  - `Dockerfile` · `docker-stack.yml` · `.github/workflows/` — build e deploy
- Credenciais e chaves ficam em `.env.local` (local) e no Portainer (runtime em prod).
  Nunca commitar segredos.
- Essas peças são consistentes, testáveis e rápidas.

**Why this matters:** When AI tries to handle every step directly, accuracy drops fast.
If each step is 90% accurate, you're down to 59% success after just five steps. By
offloading execution to deterministic code (migrations, clients tipados, CI), você fica
focado na orquestração e na decisão, onde você se destaca.

## How to Operate

**1. Look for existing tools first**
Antes de criar qualquer coisa, veja o que já existe: clients em `lib/`, helpers em
`lib/utils.ts`, tipos em `types/database.ts`, componentes em `components/`. Só crie
código novo quando nada cobrir a tarefa.

**2. Learn and adapt when things fail**
When you hit an error:
- Leia a mensagem e o trace inteiros
- Conserte e re-teste (se usar API paga — Claude, Meta — confirme comigo antes de
  re-rodar gastando crédito)
- Documente o que aprendeu no doc relevante (rate limits, quirks, comportamento
  inesperado)
- Exemplo real: o build quebrava com `never[]` nas queries Supabase. Causa: skew de
  versão (`@supabase/ssr` antigo × `supabase-js` 2.108). Fix: alinhar as versões no
  `package.json`. Aprendizado registrado aqui pra não repetir.

**3. Keep workflows current**
Os docs em `docs/` e este CLAUDE.md evoluem conforme você aprende. Quando achar um
método melhor, descobrir uma restrição ou bater num problema recorrente, atualize.
Dito isso, não crie nem sobrescreva docs sem perguntar, a não ser que eu peça
explicitamente — são minhas instruções, pra preservar e refinar, não descartar.

## The Self-Improvement Loop

Every failure is a chance to make the system stronger:
1. Identify what broke
2. Fix the tool (código, migration, config)
3. Verify the fix works (`npm run build`, MCP do Supabase, teste real)
4. Update the workflow/doc with the new approach
5. Move on with a more robust system

This loop is how the framework improves over time.

## File Structure

**What goes where:**
- **Deliverable:** a aplicação rodando em produção (Docker Swarm + Traefik) no domínio
  `ecossistema.servidordainfotrafego.com.br`, com os dados no Supabase.
- **Intermediates:** build artifacts (`.next/`), que são regeneráveis.

**Directory layout:**
```
app/            # Next.js App Router — login + dashboard/inteligencia-de-dados
components/     # layout (sidebar, brand-bar) + dashboard (funil-cone ★, kpi-card)
lib/            # supabase (client/server/middleware) · meta-ads* · claude* · utils  ← Tools
data/           # mock-metrics (Visão Geral, dados mockados na Fase 2)
types/          # database.ts (tipos do schema + DB_SCHEMA)
supabase/       # migrations: schema · RLS · seed                                    ← Tools
public/         # assets estáticos
docs/           # SOPs/referência + mockups HTML (visual oficial)                    ← Workflows
Dockerfile · .dockerignore · docker-stack.yml · .github/workflows/  # build e deploy ← Tools
.env.example    # template de variáveis (build-time vs runtime)
```
\* stub na Fase 2 (a implementar). Alias de import: `@/*` → raiz do projeto.

**Core principle:** o estado de verdade vive em serviços gerenciados — **Supabase**
(Postgres/Auth, schema `infotrafego_ecossistema`) e **GHCR** (imagem Docker). Arquivos
locais e build artifacts são processo/descartáveis.

### Pontos críticos deste projeto (não esquecer)
- **Schema dedicado:** o app NÃO usa `public` (ocupado por outros sistemas da
  Infotráfego). Conecta via `db: { schema: 'infotrafego_ecossistema' }` — `DB_SCHEMA`
  em `types/database.ts` é a fonte única do nome.
- **⚠️ Expor o schema na API (manual, uma vez):** o PostgREST só expõe `public` por
  padrão. Adicione `infotrafego_ecossistema` em **Dashboard → Settings → API → Exposed
  schemas**, senão as queries do app dão 404 (PGRST205). Não dá pra fazer via SQL/MCP.
- **Env build-time vs runtime:** `NEXT_PUBLIC_*` são embutidas no `next build` (vão como
  GitHub Secrets → build-args do CI). Segredos de servidor (`SUPABASE_SERVICE_ROLE_KEY`,
  `ANTHROPIC_API_KEY`, `META_*`) entram em runtime, no Portainer. Detalhes em `.env.example`.
- **Deploy:** push na `main` → GitHub Actions builda e empurra pro GHCR → stack no
  Portainer (Traefik, rede `traefik_public`, porta 3000) faz pull.
- **Multi-tenancy:** isolamento por `client_id` via RLS + `user_has_client_access()`.
  Trigger `on_auth_user_created_infotrafego` cria o perfil em `users` no signup.
- **Marca:** cores oficiais em `tailwind.config.ts` (`navy #1A3D70`…) · fonte Space Grotesk.

## Bottom Line

You sit between what I want (workflows/docs e mockups) and what actually gets done
(código, migrations, deploy). Your job is to read instructions, make smart decisions,
call the right tools, recover from errors, and keep improving the system as you go.

**Me chama (Pablo) quando:** precisar de acessos/credenciais (Meta BM ID, tokens),
decisão de produto (escopo, prioridade entre clientes) ou orçamento. Decisão técnica
(arquitetura, libs, padrões) é autônoma.

Stay pragmatic. Stay reliable. Keep learning.
