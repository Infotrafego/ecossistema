# 👋 Bem-vindo · Pasta da Fase 2 · Inteligência de Dados

**Para:** Pablo
**Versão:** v1 · 02/06/2026
**Status:** liberada · pronta pra construir

---

## O que tem aqui

Esta pasta é **a única que você precisa abrir** pra construir a Fase 2 (Inteligência de Dados). Tudo que está aqui é essencial · nada é histórico.

```
DRIVE-V2-FASE-2/
├── 00-LEIA-PRIMEIRO.md           ← você está aqui
├── 01-FASE-2-INTELIGENCIA-DE-DADOS.md   ← O QUE CONSTRUIR (lê isso primeiro)
├── 02-MARCA-INFOTRAFEGO.md       ← Cores · tipografia · logo
├── 03-CUSTOS-FERRAMENTAS.md      ← Custos por fase (CEO já aprovou Fase 2)
├── 04-COMPARATIVO-REFERENCIAS.md  ← Por que essa arquitetura (histórico estratégico)
│
├── mockups/                        ← REFERÊNCIA VISUAL (HTMLs · abre direto no browser)
│   ├── app-unificado-v1.5-COMPLETO.html  ⭐ visual final do ecossistema
│   ├── creative-intel/              v6.26 da Inteligência de Dados standalone
│   └── construtor-funil/           v0.2 do Construtor
│
└── codigo/                         ← SCAFFOLD PRONTO PRA DEPLOY
    └── ecossistema-infotrafego/    Next.js 14 + Supabase + multi-tenancy
        ├── README.md               ← Setup em 5 min
        ├── supabase/migrations/    Schema SQL inicial + RLS
        ├── app/                    Rotas Next.js
        ├── components/             Components React (sidebar · brand bar · KPI · funil cone)
        ├── lib/                    Clients (Supabase · Meta · Claude)
        └── ...
```

---

## Por onde começar (1h)

1. **Lê o `01-FASE-2-INTELIGENCIA-DE-DADOS.md`** (~20 min) · contexto completo do que construir
2. **Abre `mockups/app-unificado-v1.5-COMPLETO.html`** no browser (~20 min) · navega pelas 5 abas da Inteligência de Dados pra entender o visual
3. **Lê o `codigo/ecossistema-infotrafego/README.md`** (~10 min) · setup do projeto
4. **Roda o setup local** (~10 min) · `cd codigo/ecossistema-infotrafego && npm install && npm run dev`

Após isso você tem o esqueleto rodando localmente com:
- Login funcionando (Supabase Auth)
- Sidebar + brand bar com identidade visual oficial
- Aba "Visão Geral" mockada com dados fake
- Funil cone Looker SVG funcionando
- KPI cards · tabela diária · estrutura pras outras 4 abas

---

## Autonomia

Você tem autonomia total pra construir. Modificar o scaffold · escolher libs · padrões de código · arquitetura — tudo decisão sua.

**Me chama quando:**
- Acessos · credenciais · contas (Supabase / Vercel / GitHub / Meta IDs)
- Decisão de produto (escopo · prioridade entre clientes · UX)
- Validação com Infotráfego (cliente piloto somos nós mesmos · auto-uso interno)
- Decisão financeira (orçamento adicional · contratar 2º implementador)

**Não me chama pra:**
- Decisão técnica (arquitetura · libs · padrões)
- Setup local · debug · code review (abre Cowork com Claude)

**No técnico, abre Cowork (Claude):**
- Claude tem o contexto inteiro do projeto
- Pode gerar mais código · refatorar · revisar PR · debugar
- Não precisa explicar de novo

---

## Mudança importante vs primeira versão

**Cliente piloto:** ~~Carv Group · MLC~~ → **A própria Infotráfego com seu funil de aquisição**

**Por etapas:**
1. **Primeiro:** validar a plataforma com a própria Infotráfego (auto-uso interno · usando o funil de aquisição de novos clientes pra agência)
2. **Depois:** expandir pros 7 clientes da agência (Carv Group · Kedma · Stella · Giulia · Cristina · Paula · Alex)

**Por que:**
- Validamos com dados que conhecemos a fundo (nosso próprio funil)
- A Infotráfego vira o melhor case da própria Infotráfego
- Quando expandirmos, a plataforma já estará estável

**Isso já está refletido no scaffold:**
- DB multi-tenant pronto desde o início (RLS · policies completas)
- Seed cria apenas 1 cliente "Infotráfego" + 1 funil de aquisição da agência
- Os outros 7 clientes entram só após a Infotráfego estar funcionando bem

---

## Mockup vs implementação

**Os mockups são REFERÊNCIA VISUAL EXATA.** Não copie HTML→React direto. Olha o layout · funcionalidade · interações · implementa em React/Next.js do zero seguindo padrões modernos.

Diferenças esperadas:
- ✅ Layout · cores · tipografia · espaçamentos = SEGUIR mockup
- ✅ Funcionalidades · views · interações = SEGUIR mockup
- ❌ Estrutura de divs · classes CSS · funções JS = REESCREVER em padrão Next.js + Tailwind

---

## Roadmap (sem prazos · construção por etapas)

1. **Inteligência de Dados** ← você está aqui · construindo agora
2. Relatórios Diários (reusa infra ID)
3. Action toolbar CRUD via MCP Meta (extensão da ID)
4. Inteligência IA (Assistente · Otimizador · Diagnóstico Fadiga · Copy IA)
5. Comercial Consultivo + CRM Kanban + WhatsApp
6. Estratégia · CS · Debriefings · Portal Cliente
7. Gestão Interna (Pessoas · SOS · Financeiro · Suporte)
8. App Unificado consolidando tudo

Cada uma entrega valor independente · não é tudo ou nada.

---

🚀 **Bora construir.**
