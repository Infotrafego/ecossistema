# Comparativo do Ecossistema · 3 referências

**Pra:** Mickael · Pablo · time Infotráfego
**Data:** 26/05/2026
**Status:** plano consolidado · pronto pra execução
**Substitui:** `COMPARATIVO_AD_MANAGER_HUB_X_NOSSO.md` (versão anterior, sem Chronos Dock)

---

## TL;DR · decisão consolidada

**Construir UM app único** que reúna o melhor das 3 referências:

1. **Ad Manager Hub (Lovable)** · operação tática de mídia com MCP no Meta
2. **Chronos Dock (anjosxisto.com)** · ERP de agência (CRM · Conversas · Gestão · Suporte · Financeiro · Pessoas)
3. **Nosso ecossistema HTML** · inteligência analítica + operação consultiva + debriefings densos

**Arquitetura final:** 1 SPA com **sidebar lateral fixo** (estilo Chronos Dock) · **modo claro/escuro toggle** · **9 grupos de menu** consolidados · multi-tenant nativo.

**Cronograma Pablo:** ~3-4 semanas começando pelo remix do Ad Manager Hub + porting das camadas analíticas do nosso + adição dos módulos operacionais inspirados no Chronos Dock.

---

## 1. As 3 referências mapeadas

### Referência A · Ad Manager Hub (Lovable)
- **URL:** projetos `1b23024d`, `5d33f3fe`, `7afcf61d` no lovable.dev
- **Stack:** Vite + React + Supabase
- **Status:** funcional · em produção via Lovable
- **Forte em:** Meta Ads API · multi-tenant · auth · CRUD de campanhas/anúncios via MCP · diagnóstico de fadiga · CRM integrado (Pipedrive · HubSpot · Shopify)
- **6 grupos:** Visão Geral · Gestão · Biblioteca · Inteligência · CRM & E-commerce · Monitoramento

### Referência B · Chronos Dock (SaaS pronto)
- **URL:** chronosdemonstracao.anjosxisto.com
- **Tagline:** *"o porto seguro da sua agência"*
- **Status:** SaaS comercial em produção · concorrente potencial
- **Forte em:** ERP de agência completo · CRM Kanban · Conversas WhatsApp · Funis · Agendamentos · Gestão de Pessoas · Receita em Risco · Financeiro · Suporte · Onboarding · **modo claro/escuro toggle**
- **7 grupos:** Menu Principal · Comercial · Gestão · Financeiro · Suporte · Operação · (Configurações/Usuário)
- **Visual:** sidebar lateral fixo de 240px · grupos colapsáveis · breadcrumb no header

### Referência C · Nosso ecossistema HTML
- **Pasta:** `DASHBOARD INFOTRAFEGO/` · 7 mockups separados
- **Stack:** HTML/CSS/JS standalone · pretendido Next.js+Supabase
- **Status:** mockup HTML pronto · ainda não foi pra produção
- **Forte em:** análise profunda · funil cone Looker · funis modulares · Comercial Consultivo COMPLETO · debriefings densos · Discovery · Portal Cliente · Hub executivo
- **7 plataformas:** Inteligência de Dados · Comercial Consultivo · Estratégia & Inteligência · Hub Infotráfego · Construtor de Funil · Portal Cliente · Central CS

---

## 2. Comparativo 3-way · quem tem o quê

### Operação Tática de Mídia (CRUD no Meta)

| Função | Ad Manager Hub | Chronos Dock | Nosso |
|---|---|---|---|
| Campanhas (CRUD via MCP no Meta) | ✅ | ❌ | ❌ |
| Conjuntos (Ad Sets) | ✅ | ❌ | ❌ |
| Anúncios (com preview) | ✅ | ❌ | parcial |
| Biblioteca de Mídias | ✅ | ❌ | ❌ |
| Biblioteca de Públicos | ✅ | ❌ | parcial |
| Pixels | ✅ | ❌ | ❌ |
| Segmentação | ✅ | ❌ | ❌ |
| Diagnóstico de Fadiga Criativa | ✅ | ❌ | parcial |
| Assistente IA (executa ações no Meta) | ✅ | ❌ | ❌ |
| Otimizador · Escala · Copy · Regras Auto · Testes A/B | ✅ | ❌ | parcial |

**Vencedor:** Ad Manager Hub. **Implicação:** essa camada vem do Lovable.

### CRM · Conversas · Atendimento

| Função | Ad Manager Hub | Chronos Dock | Nosso |
|---|---|---|---|
| CRM Kanban (pipeline visual) | ❌ | ✅ | parcial (cards de Leads) |
| Conversas WhatsApp nativas | ❌ | ✅ | ❌ |
| Formulários | ❌ | ✅ | ❌ |
| Agendamentos | ❌ | ✅ | ❌ |
| Pipedrive / HubSpot conector | ✅ | ❌ | ❌ |
| Funis de vendas | parcial | ✅ | ✅ (modulares) |
| Conversa → Criar Lead | ❌ | ✅ | ❌ |

**Vencedor:** Chronos Dock (CRM + Conversas). **Implicação:** ou licenciar Chronos Dock, ou construir esses módulos (CRM Kanban + Conversas WhatsApp) inspirados nele.

### Gestão Interna da Agência

| Função | Ad Manager Hub | Chronos Dock | Nosso |
|---|---|---|---|
| Visão do Negócio (saúde geral) | ❌ | ✅ | parcial (Hub) |
| Gestão de Pessoas (RH/equipe) | ❌ | ✅ | ❌ |
| SOS (alerta crítico interno) | ❌ | ✅ | parcial (alertas no Hub) |
| Receita em Risco | ❌ | ✅ | parcial (Central CS) |
| Financeiro (Overview · Aprovações) | ❌ | ✅ | parcial (Saldo & Orçamento) |
| Suporte / Chamados (helpdesk cliente) | ❌ | ✅ | ❌ |
| Pedidos do Cliente | ❌ | ✅ | ❌ |
| Avisos e Saídas | ❌ | ✅ | ❌ |
| Onboarding cliente | ✅ (Meta apenas) | ✅ (genérico) | parcial (Discovery) |
| Central de Ajuda (docs produto) | ❌ | ✅ | ❌ |

**Vencedor:** Chronos Dock por larga margem. **Implicação:** se a gente quer cobrir gestão interna, precisa portar esses módulos do Chronos Dock.

### Inteligência Analítica Profunda

| Função | Ad Manager Hub | Chronos Dock | Nosso |
|---|---|---|---|
| Funil cone Looker vertical (8 etapas) | ❌ | ❌ | ✅ |
| Funis modulares por tipo (4 famílias × 14 sub-objetivos) | ❌ | ❌ | ✅ |
| Construtor de Funil (Reconhecimento + Ajuste) | ❌ | ❌ | ✅ |
| Análise da fase de Aquecimento | ❌ | ❌ | ✅ |
| Top criativos com link Instagram + saturação | ❌ | ❌ | ✅ |
| Painel Multicanal (Meta + Google + Orgânico + WhatsApp) | ❌ | ❌ | ✅ |
| Tabelas Visão Diária + Dia da Semana | ❌ | ❌ | ✅ |
| Acompanhamento de Metas Comerciais | ❌ | ❌ | ✅ |
| Comparativo vs Período Anterior | ❌ | ❌ | ✅ |

**Vencedor:** Nosso por larga margem. **Implicação:** essa camada vem do nosso mockup HTML como referência exata.

### Operação Consultiva (estratégia + comercial)

| Função | Ad Manager Hub | Chronos Dock | Nosso |
|---|---|---|---|
| Análise de calls com transcrição IA | ❌ | ❌ | ✅ |
| Speech analytics (talk ratio · objeções) | ❌ | ❌ | ✅ |
| Coaching 1:1 (gaps + call de referência) | ❌ | ❌ | ✅ |
| Playbook (frases vencedoras/perdedoras) | ❌ | ❌ | ✅ |
| Forecast & Cenários (3 cenários) | ❌ | ❌ | ✅ |
| Plano de Testes (backlog priorizado) | ❌ | ❌ | ✅ |
| Mapa de Saturação multi-dimensional | ❌ | ❌ | ✅ |
| Conteúdo Orgânico + Distribuição | ❌ | ❌ | ✅ |
| **Debriefings densos (15 seções)** | ❌ | ❌ | ✅ |
| **Discovery & Persona automatizado** | ❌ | ❌ | ✅ |

**Vencedor:** Nosso. **Implicação:** essa camada é o diferencial da Infotráfego · ninguém mais tem.

### Cliente Final (visão externa)

| Função | Ad Manager Hub | Chronos Dock | Nosso |
|---|---|---|---|
| Portal Cliente externo (view filtrada) | ❌ | parcial (cliente vê seus dados) | ✅ |
| Branding tom premium pro cliente | ❌ | parcial | ✅ |
| InfoNews · resumo curado | ❌ | ❌ | ✅ |
| Próximos Passos visíveis pro cliente | ❌ | ❌ | ✅ |

**Vencedor:** Nosso. **Implicação:** essa camada é diferencial · serve como "vitrine" pro cliente.

### Design System & UX

| Função | Ad Manager Hub | Chronos Dock | Nosso |
|---|---|---|---|
| Sidebar lateral fixo (240px) com grupos | parcial | ✅ | ❌ (usamos topnav) |
| **Modo claro/escuro toggle** | ❌ | ✅ | ❌ |
| Multi-tenant nativo (cliente ativo no topo) | ✅ | ✅ | parcial (mockup) |
| Breadcrumb no header | ❌ | ✅ | ❌ |
| Avatar + nome do usuário no rodapé do sidebar | ❌ | ✅ | ❌ |
| Notificações sino no topo | ❌ | ✅ | ❌ |

**Vencedor:** Chronos Dock. **Implicação:** nosso design final vai espelhar o sidebar do Chronos Dock + identidade visual Infotráfego (navy + alicerce + Space Grotesk).

---

## 3. Arquitetura final · 1 app único com sidebar

### Princípio fundamental

**Não mais 7 plataformas separadas.** **UM SPA único** com sidebar lateral fixo (estilo Chronos Dock) onde cada item carrega uma view dentro do mesmo app. Modo claro/escuro toggle no rodapé do sidebar.

### Estrutura do sidebar (9 grupos · 50+ itens)

```
┌────────────────────────────────┐
│ 🟦  Infotráfego                 │
│ ⌐⌐  Cliente: Carv Group ▾       │
├────────────────────────────────┤
│ MENU PRINCIPAL                  │
│  ● Início (dashboard executivo) │
│  ● Clientes                     │
├────────────────────────────────┤
│ INTELIGÊNCIA DE DADOS           │
│  ● Visão Geral                  │
│  ● Criativos                    │
│  ● Públicos                     │
│  ● Campanhas                    │
│  ● Otimizações                  │
│  ● Construtor de Funil          │
├────────────────────────────────┤
│ GESTÃO DE MÍDIA                 │
│  ● Campanhas (CRUD)             │
│  ● Conjuntos                    │
│  ● Anúncios                     │
│  ● Criativos (biblioteca)       │
│  ● Mídias                       │
│  ● Pixels                       │
│  ● Configuração da plataforma   │
├────────────────────────────────┤
│ INTELIGÊNCIA IA                 │
│  ● Assistente IA                │
│  ● Otimizador                   │
│  ● Diagnóstico de Fadiga        │
│  ● Escala                       │
│  ● Copy                         │
│  ● Regras Auto                  │
│  ● Testes A/B                   │
├────────────────────────────────┤
│ COMERCIAL                       │
│  ● Visão Geral                  │
│  ● CRM Kanban  ← novo           │
│  ● Conversas WhatsApp ← novo    │
│  ● Calls                        │
│  ● Leads                        │
│  ● Time                         │
│  ● Padrões & Coaching           │
│  ● Histórico                    │
├────────────────────────────────┤
│ ESTRATÉGIA                      │
│  ● Visão Estratégica            │
│  ● Forecast                     │
│  ● Plano de Testes              │
│  ● Mapa de Saturação            │
│  ● Alocação de Budget           │
│  ● Conteúdo Orgânico            │
│  ● Distribuição                 │
│  ● Reuniões & Decisões          │
│  ● Debriefings                  │
│  ● Discovery & Persona          │
├────────────────────────────────┤
│ CS · BIANCA                     │
│  ● Saúde do Cliente             │
│  ● Receita em Risco ← novo      │
│  ● Indicações                   │
│  ● Munição Estratégica          │
├────────────────────────────────┤
│ GESTÃO INTERNA  ← novo grupo    │
│  ● Visão do Negócio             │
│  ● Gestão de Pessoas            │
│  ● SOS                          │
│  ● Aprovações Financeiras       │
│  ● Suporte/Chamados             │
│  ● Avisos e Saídas              │
│  ● Central de Ajuda             │
│  ● Onboarding (cliente novo)    │
├────────────────────────────────┤
│ PORTAL CLIENTE                  │
│  ● View externa (sub-domínio)   │
├────────────────────────────────┤
│ ☼ Modo Claro/Escuro [toggle]    │
│ 👤 Mickael Almeida          ⚙   │
└────────────────────────────────┘
```

### Header global

```
┌────────────────────────────────────────────────────────────────────────────┐
│ ⌘ Início > Inteligência de Dados > Visão Geral                  🔔  Mickael │
│                                                                              │
│ Visão Geral · Performance Comercial                                          │
│ 131 criativos no período · evolução · funil completo · alertas               │
│                                                                              │
│ [filtros globais: Período · Funil ativo · Busca]              [Personalizar] │
└────────────────────────────────────────────────────────────────────────────┘
```

### Design system unificado

**Cores · modo claro**
- Background: `#F8FAFC`
- Surface: `#FFFFFF`
- Border: `#E2E8F0`
- Ink: `#0F172A`
- Ink soft: `#475569`
- Muted: `#94A3B8`
- Brand navy: `#1A3D70`
- Brand alicerce: `#031D31`
- Brand ash: `#C7D2D7`
- Success: `#16A34A`
- Warn: `#DC2626`
- Attention: `#D97706`

**Cores · modo escuro**
- Background: `#0F172A`
- Surface: `#1E293B`
- Border: `#334155`
- Ink: `#F1F5F9`
- Ink soft: `#CBD5E1`
- Muted: `#94A3B8`
- Brand navy: `#2D5A95` (1 tom acima)
- Brand alicerce: `#1A3D70` (vira navy)
- Success: `#22C55E`
- Warn: `#EF4444`
- Attention: `#F59E0B`

**Tipografia**
- Font family: `Space Grotesk`, `Inter`, fallbacks
- Letter spacing: -0.005em (sutil tightening)
- Smoothing: antialiased

**Componentes-âncora reaproveitados de cada referência**
- Sidebar lateral → Chronos Dock
- KPI cards coloridos → Ad Manager Hub
- Funil cone Looker → Nosso
- Cards de Pilar → Hub Infotráfego (nosso)
- Pills de tipo de funil → Construtor (nosso)
- Tabela Diária + DOW → Nosso
- Chat Assistente IA → Ad Manager Hub
- Diagnóstico de Fadiga tabular → Ad Manager Hub
- CRM Kanban → Chronos Dock
- Conversas WhatsApp → Chronos Dock

---

## 4. Plano de execução · 4 semanas

### Semana 1 · Base técnica (Ad Manager Hub como base)
- Forkar/remix do Ad Manager Hub do Lovable
- Configurar repositório próprio (Pablo decide se sai do Lovable pra Next.js ou continua no Lovable)
- Aplicar **identidade Infotráfego** (navy + alicerce + Space Grotesk)
- Trocar layout pro **sidebar lateral fixo** (estilo Chronos Dock · não topnav)
- Implementar **modo claro/escuro toggle**
- Configurar credenciais reais Meta + Pipedrive + HubSpot + Supabase
- **Entrega:** app rodando em produção com Ad Manager Hub funcional já com novo design

### Semana 2 · Inteligência Analítica (nosso ID + Construtor)
- Portar nosso `infotrafego-creative-intel/` (v6.26) como conjunto de rotas no sidebar
- Implementar **funil cone Looker** como componente reutilizável
- Implementar **funis modulares** (config no banco + render reativo)
- Implementar **Construtor de Funil** (wizard Reconhecimento + Ajuste)
- Implementar **Painel Multicanal** + Tabelas Diária/DOW + Acompanhamento de Metas
- **Entrega:** grupo "Inteligência de Dados" navegável

### Semana 3 · Operação Consultiva (Comercial + Estratégia + CS)
- Portar nosso `infotrafego-comercial-consultivo/` como grupo "Comercial"
- Portar nosso `infotrafego-estrategia-inteligencia/` como grupo "Estratégia" (com Debriefings + Discovery)
- Portar nosso `infotrafego-central-cs/` como grupo "CS"
- **Adicionar do Chronos Dock:** CRM Kanban + Conversas WhatsApp (no grupo Comercial)
- **Adicionar do Chronos Dock:** Receita em Risco (no grupo CS)
- **Entrega:** ecossistema interno completo

### Semana 4 · Gestão Interna + Portal Cliente + Motor de IA
- Implementar grupo "Gestão Interna" inspirado no Chronos Dock (Visão do Negócio · Gestão de Pessoas · SOS · Aprovações · Suporte · Central de Ajuda)
- Implementar Portal Cliente (sub-domínio externo, view filtrada · com login separado)
- Construir **Motor de IA · 4 outputs** (Atas · Insumos CS · Discovery · Debriefings) · conexão Google Meet/Gemini
- **Entrega:** produto completo

### Riscos
- **Lovable → Next.js:** se Pablo decidir migrar, +1 semana
- **CRM Kanban + Conversas WhatsApp:** se virar muito complexo, manter Chronos Dock como serviço integrado em vez de portar
- **Gestão Interna:** se for muito pesado, fica em backlog · MVP entrega sem ele

---

## 5. Decisões pendentes

1. **Dono do Ad Manager Hub** · você confirmou que tem acesso aos remixes, mas é seu mesmo? Se for de terceiro, precisa licenciar antes
2. **Stack:** Lovable continua ou migra Pablo pra Next.js? Recomendação: começar no Lovable (Semana 1-2), migrar pra Next.js se ficar limitado (Semana 3-4)
3. **CRM Kanban + Conversas WhatsApp:**
   - Opção A · portar do Chronos Dock (mais trabalho, controle total)
   - Opção B · integrar Chronos Dock como serviço (mantém duas plataformas, menos trabalho)
   - Recomendação: **A** porque centraliza tudo num app só
4. **Portal Cliente** · mesmo app com login diferente, ou app separado em sub-domínio?
   - Recomendação: **sub-domínio separado** (cliente nunca vê tela interna)
5. **Cliente piloto** · Carv Group · Kedma · ou Infotráfego auto-uso?
6. **Cronograma agressivo (4 sem)** vs **realista (6 sem)?**

---

## 6. Próximos passos imediatos

| # | Ação | Quem | Quando |
|---|---|---|---|
| 1 | Você responde as 6 decisões da Seção 5 | Mickael | hoje/amanhã |
| 2 | Eu construo o **mockup `infotrafego-app-unificado/index.html`** com sidebar + modo claro/escuro + 9 grupos | Claude | em curso (próximo) |
| 3 | Eu atualizo o `BRIEFING_PABLO.md` com este plano consolidado | Claude | após decisões |
| 4 | Reunião de alinhamento com Pablo (apresentar plano) | Mickael + Pablo | esta semana |
| 5 | Forkar/remix do Ad Manager Hub no Lovable + dar acesso pro Pablo | Mickael + Pablo | após decisões |

---

**Referências:**
- Ad Manager Hub Loom · https://www.loom.com/share/ba6b291f3762486183889206c066b13d
- Ad Manager Hub Lovable · `1b23024d`, `5d33f3fe`, `7afcf61d`
- Chronos Dock · https://chronosdemonstracao.anjosxisto.com/
- Nosso mockup atual · `DASHBOARD INFOTRAFEGO/infotrafego-creative-intel/index.html` (v6.26)
- Doc anterior (substituído) · `COMPARATIVO_AD_MANAGER_HUB_X_NOSSO.md`

**Documento atualizado em:** 26/05/2026
