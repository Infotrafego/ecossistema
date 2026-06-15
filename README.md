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
app/          # rotas (App Router) — login + dashboard/inteligencia-de-dados
components/   # layout (sidebar, brand-bar) + dashboard (funil-cone ★, kpi-card)
lib/          # supabase (client/server/middleware) · meta-ads* · claude* · utils
data/         # mock-metrics (Visão Geral)
types/        # database.ts (schema + DB_SCHEMA)
supabase/     # migrations
docs/         # referência + mockups HTML (visual oficial)
```
\* stub na Fase 2.

---

## Estado atual

✅ Auth · layout · tema · aba **Visão Geral** (dados mockados).
🚧 Abas Criativos/Públicos/Campanhas/Otimizações/Construtor · sync Meta · IA Claude.

Identidade visual e roadmap: [docs/](docs/) e [CLAUDE.md](CLAUDE.md).
