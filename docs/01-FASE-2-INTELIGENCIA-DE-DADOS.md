# 🚀 Fase 2 · Inteligência de Dados

**Para:** Pablo Almeida
**De:** Mickael Almeida
**Status:** Liberada · scaffold de código pronto pra deploy
**Cliente piloto:** **A própria Infotráfego com seu funil de aquisição** · após validar com o nosso próprio funil, expandimos pros 7 clientes da agência

---

## TL;DR

Construir a plataforma própria que **substitui o Looker Studio** na operação diária. Cliente piloto somos nós · validamos com nossos próprios clientes · quando estabilizar, replicamos pros clientes externos.

**Stack:**
- Front: Next.js 14 + React + Tailwind + shadcn/ui
- Backend: Supabase (Postgres + Auth + RLS + Edge Functions)
- Hosting: Vercel
- IA: Claude API (Sonnet 4.5)
- Meta Ads: API direta via Marketing API
- ClickUp: API + MCP

**5 abas pra entregar:**
1. Visão Geral
2. Criativos
3. Públicos
4. Campanhas
5. Análise & Otimizações

**Mais:** Construtor de Funil (modular · entra junto)

**Critério de pronto:** 5 abas funcionando com dados reais de 3+ clientes Infotráfego · multi-tenancy validado · sync Meta diário sem falha por 7 dias.

---

## Cliente piloto · A Infotráfego (com seu funil de aquisição)

**Mudança importante vs versão anterior do plano:**

~~Cliente piloto = Carv Group · MLC~~ → **Cliente piloto = a própria Infotráfego usando seu funil de aquisição de novos clientes**

**O que isso significa:**

- **Validamos primeiro com a Infotráfego** como cliente único · usando o funil de captação de novos clientes pra agência (CEOs/gestores procurando agência de tráfego)
- Quando a plataforma estiver validada com nossa operação interna, **expandimos pros 7 clientes da agência** (Carv Group · Kedma · Stella · Giulia · Cristina · Paula · Alex)
- Multi-tenancy já está pronto no DB desde a primeira migração · só não tem dados dos outros clientes ainda

**Por que essa abordagem:**
- Reduz risco · validamos com dados que conhecemos a fundo
- A Infotráfego se torna o melhor case da própria Infotráfego
- Quando expandirmos, a plataforma já estará estável
- O funil de aquisição é simples e típico (captação · conversão · venda) · bom pra testar todas as funcionalidades

**Funil de aquisição da Infotráfego (10 etapas):**
1. Impression
2. Click
3. Page view
4. Form iniciado
5. **Form completo** (marcador MKT · vira MQL)
6. **Lead qualificado** (marcador comercial · SQL)
7. Reunião agendada
8. Reunião realizada
9. Proposta enviada
10. Contrato assinado

**Metas do funil (configuráveis no Construtor):**
- 30 leads/mês
- 12 reuniões/mês
- 3 vendas/mês
- Ticket médio mensal: R$ 8.000
- CPMQL alvo: R$ 250
- LTV alvo: R$ 96.000 (12 meses)

**Seed inicial do DB:**
- 1 cliente (Infotráfego) já cadastrado
- 1 funil de aquisição já cadastrado (acima)
- Usuários (Mickael, Pablo, Higor, etc) criados via Supabase Auth

**Depois da validação · expandir:**
- Cadastrar 7 clientes da agência no DB
- Cada cliente cadastra seu funil via Construtor
- Sync Meta Ads dos BMs de cada cliente
- Auth de cada cliente vê só seus dados (RLS)

---

## Mockup de referência

`mockups/app-unificado-v1.5-COMPLETO.html` · abre direto no browser.

**Clica nas rotas pra navegar pela Inteligência de Dados:**
- Visão Geral · Criativos · Públicos · Campanhas · Análise & Otimizações · Construtor de Funil

**Importante:** mockup é REFERÊNCIA VISUAL EXATA. Não copie HTML→React direto. Implementa em padrão Next.js + Tailwind + shadcn.

---

## Stack confirmada e por quê

| Camada | Ferramenta | Por quê |
|---|---|---|
| Front | Next.js 14 (App Router) | SSR + ISR + file-based routing |
| UI | React + Tailwind + shadcn/ui | Padrão de mercado · components prontos |
| Backend | Supabase | Postgres + Auth + Storage + Edge Functions · multi-tenancy nativo via RLS |
| Hosting | Vercel | Deploy em git push · edge network |
| Auth | Supabase Auth | Incluso no Supabase · JWT |
| IA | Claude API (Sonnet 4.5) | Já validada nas atas · custo OK |
| Meta Ads | Marketing API direta | Pull diário cron + ações ad-hoc |
| ClickUp | API + MCP | Sync tasks + docs |
| Charts | recharts ou nivo | Funil cone Looker · gráficos |
| State | Zustand ou TanStack Query | Pra fetching · cache |
| Forms | React Hook Form + Zod | Validação |
| Tests | Vitest + Testing Library | Mínimo de cobertura |

**Versionamento:** GitHub (organização `infotrafego` · repo `ecossistema-infotrafego`).

---

## Scaffold já entregue

Você não começa do zero. Tem um scaffold **pronto pra deploy** em `codigo/ecossistema-infotrafego/`.

**O que vem pronto:**

✅ Estrutura Next.js 14 (App Router)
✅ Configuração Tailwind + design tokens Infotráfego
✅ Supabase client (browser + server)
✅ Migrações SQL iniciais (tabelas core + RLS policies)
✅ Seed com Infotráfego + 7 clientes + 9 usuários
✅ Auth funcionando (login Supabase)
✅ Layout com sidebar lateral + brand bar (estilo do mockup)
✅ Aba "Visão Geral" da Inteligência de Dados com:
   - 8 KPI cards
   - Funil cone Looker (SVG · 8 etapas)
   - Saldo & Orçamento
   - Painel Multicanal
   - Tabela diária
   - Distribuições
   - (com dados mockados pra você validar visual)
✅ Stubs das outras 4 abas (Criativos · Públicos · Campanhas · Otimizações)
✅ Stub do Construtor de Funil
✅ README com setup local em 5 minutos
✅ `.env.example` com todas as variáveis necessárias

**O que você precisa fazer:**

🔧 Criar conta Supabase + projeto + colar URL/keys no `.env`
🔧 Rodar migrações (`npx supabase db push`)
🔧 Deploy no Vercel (git push)
🔧 Implementar sync Meta Ads real (Marketing API direta)
🔧 Implementar Construtor de Funil completo
🔧 Trocar dados mockados por dados reais
🔧 Implementar as 4 abas restantes seguindo o padrão da Visão Geral

---

## Modelo de dados (já no scaffold)

### Tabelas core (multi-tenancy)

```sql
clients (
  id uuid PK,
  name text,
  slug text UNIQUE,
  brand_color text,
  meta_ad_account_id text,
  looker_url text,
  active boolean,
  created_at timestamp
)

client_members (
  client_id uuid FK,
  user_id uuid FK,
  role text,  -- gestor | closer | sdr | cs | analista | cliente
  PRIMARY KEY (client_id, user_id)
)

users (
  id uuid PK,  -- vem do Supabase Auth
  email text UNIQUE,
  name text,
  global_role text  -- admin | gestor_dados | gestor_comercial | etc
)
```

### Funis configuráveis (Construtor)

```sql
funis (
  id uuid PK,
  client_id uuid FK,
  name text,
  familia text,           -- distribuicao | captacao | venda_direta | lancamento
  sub_objetivo text,
  modo_captura text,      -- form_meta | landing | whatsapp | quiz | webinario
  etapas jsonb,            -- ['impression', 'click', 'page_view', 'lead', ...]
  marcador_mkt text,
  marcador_com text,
  metas jsonb,
  active boolean,
  created_at timestamp
)
```

### Dados de mídia

```sql
campaigns (id, client_id, meta_id, name, objective, status, daily_budget)
adsets (id, campaign_id, meta_id, name, targeting, optimization_goal, status)
ads (id, adset_id, meta_id, name, creative_id, status)
creatives (id, client_id, meta_id, type, hash, thumbnail_url, ig_link, copy)
metrics_daily (
  client_id, entity_type, entity_id, date,
  impressions, clicks, spend, conversions, revenue,
  frequency, ctr, cpc, cpm,
  PRIMARY KEY (client_id, entity_type, entity_id, date)
)
fadiga_creative (creative_id PK, score, status, days_active, last_refresh, calculated_at)
```

### Multi-tenancy via RLS

Todas as tabelas com `client_id` têm policy:

```sql
CREATE POLICY "Users see only their clients data" ON metrics_daily
  FOR SELECT USING (
    client_id IN (
      SELECT client_id FROM client_members
      WHERE user_id = auth.uid()
    )
  );
```

Aplicar pra: campaigns · adsets · ads · creatives · metrics_daily · fadiga_creative · funis.

**Validar com 2+ usuários e 2+ clientes ANTES de subir pra prod.**

---

## 5 abas a entregar

### Aba 1 · Visão Geral (parcialmente mockada no scaffold)

Componentes principais:
- Headline horizontal com totais do período
- 8 KPI boxes: Impressões · Cliques · Page Views · MQLs · Agendamentos · Reuniões · Vendas · Receita (com delta vs período anterior)
- Acompanhamento de Metas (4 cards com barra de progresso)
- **Funil cone Looker vertical (8 etapas)** — SVG dinâmico com taxas e custos laterais · **CRÍTICO**
- Saldo & Orçamento (4 boxes + projeção fim de mês)
- Painel Multicanal (Meta · Google · Orgânico · WhatsApp)
- Distribuições (públicos · criativos · campanhas) com pizza + ranking
- Tabela Visão Diária (últimos 7 dias)

**Status no scaffold:** layout pronto · KPIs com dados mockados · Funil cone SVG funcionando · tabela diária com mocks.

### Aba 2 · Criativos

- Top 5 Campeões + Top 5 Piores
- Análise estratégica com IA (Claude)
- Cards com prévia visual + métricas
- Filtros: período · funil · tipo

**Status:** stub criado · você implementa.

### Aba 3 · Públicos

- Ranking de adsets
- Top 5 saturados
- Detalhe de cada público

**Status:** stub criado.

### Aba 4 · Campanhas

- Ranking
- Drill-down pra criativos de cada campanha
- Indicador de saturação

**Status:** stub criado.

### Aba 5 · Análise & Otimizações

- **Matriz Pivot Criativo × Público (heatmap)**
- Raio-X de todas as combinações
- **Diagnóstico de Fadiga** (cards com badge crítico/atenção/saudável)
- Ações sugeridas priorizadas (Claude API)

**Status:** stub criado.

---

## Construtor de Funil

Mockup: `mockups/construtor-funil/index.html`

**3 etapas (wizard):**
1. **Conectar fonte de dados** (Google Sheets · API Meta · Banco próprio)
2. **Reconhecimento automático** (sistema detecta tipo de funil)
3. **Ajuste manual** (estrategista valida e ajusta)

**Estrutura modular:**
- 4 famílias: distribuicao · captacao · venda_direta · lancamento
- 14 sub-objetivos (varia por família)
- 5 modos de captura
- N etapas (configurável)
- N marcadores

**Output:** JSON salvo na tabela `funis` que dirige TUDO no dashboard (Funil cone · KPIs · tabelas · etc).

**Validar com 5+ funis reais antes de finalizar a abstração.** Me chama quando precisar levantar funis reais.

---

## Filtros globais

Em todas as 5 abas:
- **Período** (presets: hoje · ontem · 7d · 30d · mês · ano · custom)
- **Funil ativo** (cliente pode ter múltiplos funis · usa config do Construtor)
- **Cliente ativo** (gestor júnior vê só seus clientes via RLS)

**Status no scaffold:** componente de filtros já implementado no header (mockado).

---

## Integrações

### Meta Marketing API

- Pull diário 4h da manhã (cron Edge Function no Supabase)
- Snapshot em `metrics_daily`
- Histórico mínimo: 90 dias na criação · 365 dias após estabilização
- **Status:** stub no scaffold · você implementa o pull real

### Supermetrics (transição)

- Manter Looker dos clientes existentes em paralelo durante migração
- Migra cliente a cliente após validação

### ClickUp

- Puxa tasks de cada cliente
- Mostra Pendências no dashboard
- Pode usar mesma camada MCP que usamos nas atas

### Google Sheets (transição)

- Pra clientes que ainda dependem de Sheets manuais
- Migra pra DB próprio gradualmente

---

## Critério de pronto da Fase 2

Sem checar todos esses, não sobe pra produção:

- [ ] 5 abas funcionando com dados reais da Infotráfego (cliente piloto) + funil de aquisição
- [ ] Funil cone renderizado a partir de QUALQUER config (testar 3 famílias diferentes)
- [ ] Multi-tenancy validado (Mickael vê 7 clientes · gestor júnior vê só os atribuídos · não vaza dados)
- [ ] Sync Meta Ads rodando diariamente sem falhas por 7 dias seguidos
- [ ] Filtros globais (período · funil · cliente) funcionando em todas as 5 abas
- [ ] Construtor de Funil cria nova config e ID renderiza imediatamente
- [ ] Performance: dashboard carrega em < 2s · paginação em tabelas > 100 linhas
- [ ] Logs e métricas básicas coletadas
- [ ] README atualizado com decisões técnicas que você tomou

---

## Custos da Fase 2 (já aprovados)

| Item | R$/mês |
|---|---|
| Supabase Pro | 145 |
| Vercel Pro (2 users) | 230 |
| Claude API (uso médio) | 1.160-2.320 |
| GitHub Team | 69 |
| Domínio | 10 |
| Resend Pro (emails de relatório) | 115 |
| **Total Fase 2** | **R$ 1.730-2.890/mês** |

CEO aprovou esse range. Se precisar de algo fora, me chama.

---

## Riscos a observar

| Risco | Mitigação |
|---|---|
| Rate limits do Meta Marketing API | Cache agressivo · batching · retry com backoff |
| Construtor de Funil complexo demais | Validar com 5+ funis reais ANTES de finalizar abstração |
| RLS policies erradas → vazamento de dados | Testar exaustivamente com 2+ users e 2+ clientes |
| Migração Looker incompleta | Manter Looker em paralelo · migrar cliente a cliente |
| Funil cone Looker SVG demanda muito tempo | Pegar lib pronta (recharts) e customizar |

---

## Quando me chamar

**Acessos · credenciais · contas:**
- Conta Supabase / Vercel / GitHub
- IDs Meta Ad Account de cada cliente
- URLs Looker atuais

**Decisões de produto:**
- Mudança de escopo
- Priorização entre clientes
- UX subjetivo (qual layout faz mais sentido)

**Validação:**
- Quando tiver MVP rodando local · valido contigo
- Quando precisar dos funis ativos reais (vou levantar com Higor + estrategistas)
- Bug em produção com dados reais

**Decisões financeiras:**
- Investimento adicional em ferramentas
- Contratação de 2º implementador

**Não me chama pra:**
- Decisão técnica (arquitetura · libs · padrões)
- Code review · debug · setup local (Claude no Cowork)

---

## Suporte no Cowork (Claude)

Quando precisar de ajuda técnica, abre Cowork e a gente resolve:

- **Mais scaffold** · estrutura adicional · gera no momento
- **Arquitetura técnica** · revisa decisões · sugere padrões
- **Prompts IA** · refina templates pra cada output
- **Debug** · cola erro no chat e a gente resolve
- **Code review** · pode revisar PR antes de merge
- **Refatoração** · sugere melhorias

Claude tem o contexto inteiro do projeto · não precisa explicar de novo.

---

## Próxima ação (sua)

1. Abre `codigo/ecossistema-infotrafego/README.md`
2. Segue o setup local
3. Roda `npm install && npm run dev`
4. Vê o app rodando no browser
5. Cria conta Supabase + cola credenciais no `.env`
6. Roda migrações (`npx supabase db push`)
7. Login no app · navega pelas abas
8. Decide por onde começar a construir (sugestão: sync Meta Ads real)

🚀 **Bora construir.**
