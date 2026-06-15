# Roteiro · Vídeo de Apresentação — Inteligência de Dados Infotráfego

**Público:** time interno + gestor (decisão de aprovar/seguir)
**Duração ideal:** 6-7 minutos
**Tom:** consultor sênior. Diagnóstico → causa-raiz → solução. Sem clima de "demo de produto".
**Formato:** screen-share do `index.html` v6.6 + sua narração

---

## 🎬 Bloco 1 · Diagnóstico do momento (00:00 – 01:00)

**Tela:** câmera no apresentador, ambiente calmo. Sem slide.

**Fala:**
> "Pessoal, esse vídeo é mais reflexão do que apresentação. Nas últimas semanas eu parei pra observar como a gente tá operando hoje, e o que eu vi foi o seguinte: a agência cresceu — entraram clientes novos, entraram pessoas novas no time, a operação ficou maior. Mas o **ritmo da operação não acompanhou esse crescimento**. A gente continua fazendo do mesmo jeito que fazia quando éramos menores: relatório diário no braço, análise de criativo um a um, feedback de cliente improvisado na sexta. Isso tem três efeitos práticos que eu acho que todo mundo aqui já sentiu."

> "Primeiro: o gestor passa o dia em operação repetitiva e sobra pouco tempo pra estratégia, que é justamente onde a gente entrega resultado. Segundo: o time novo entra e não pega o ritmo porque não existe um sistema único, cada cliente tem um jeito, cada gestor tem um Excel. Terceiro — e esse pra mim é o mais crítico — o **cliente não percebe o valor** que a gente entrega. A gente otimiza, ajusta, testa, mas o que chega pro cliente é um relatório seco e uma reunião uma vez por semana. Ele paga premium e sente que tá recebendo commodity."

---

## 🎬 Bloco 2 · A causa-raiz (01:00 – 01:45)

**Tela:** ainda câmera, ou um slide simples com 3 caixas: "Dados / Execução / Decisões — desconectados"

**Fala:**
> "Quando eu olhei pra essas três dores, percebi que a causa é a mesma: **as informações da agência vivem em ilhas separadas**. Os dados de mídia ficam no Looker. As ações que o gestor toma ficam no ClickUp. As decisões que a gente toma com o cliente ficam nas atas no Drive. E o gestor é a cola humana que tenta conectar tudo isso de cabeça, todo dia, pra cada cliente. Isso não escala. Não tem como crescer mais 5 clientes mantendo essa cola humana funcionando. E não tem como o cliente perceber valor se a gente nem consegue mostrar pra ele de forma estruturada o que aconteceu, o que a gente fez, e qual foi o impacto."

---

## 🎬 Bloco 3 · A solução proposta (01:45 – 02:15)

**Tela:** abrir o `index.html`, hero com logo Infotráfego + tagline "Inteligência de Dados"

**Fala:**
> "A partir disso eu desenhei e protótipei uma solução que pra mim é a resposta certa pro momento que a gente vive. Chama **Inteligência de Dados Infotráfego**. É uma plataforma interna nossa que conecta as três ilhas — dados, execução e decisões — num lugar só. Substitui o Looker, conversa com o ClickUp, lê as atas das reuniões. E o mais importante: gera narrativa pro cliente automaticamente. Eu fiz com a Carv como cliente piloto pra testar com dados reais. Vou mostrar rapidamente."

---

## 🎬 Bloco 4 · Demo guiada pela dor (02:15 – 04:30)

> Cada aba é apresentada como **resposta a uma dor específica** do diagnóstico.

### 4.1 · Visão Geral & Criativos · "menos tempo em operação" (02:15 – 03:00)

**Tela:** Visão Geral → depois Criativos

**Fala:**
> "Visão Geral: o gestor abre de manhã e em 30 segundos sabe como o cliente tá. Funil completo, do investimento até a receita, com comparação automática contra o período anterior. Não precisa abrir 4 abas do Looker. À direita o funil cone, embaixo a distribuição por campanha, público e criativo lado a lado."

> "Criativos: 131 ads consolidados com thumbnail real. Análise estratégica dos top 5. Aquele tempo que a gente gasta toda semana fazendo análise manual de criativo — isso aqui resolve. O gestor olha 1 minuto e sabe o que tá performando, o que tá saturando, o que cortar."

### 4.2 · Otimizações · "mostrar valor pro cliente" (03:00 – 03:30)

**Tela:** aba Otimizações

**Fala:**
> "Otimizações. Aqui é onde a gente para de ser invisível. Toda otimização que o gestor faz no ClickUp é cruzada automaticamente com a curva de performance: 7 dias antes da ação contra 7 dias depois. Resultado: a gente consegue dizer pro cliente, com número, qual foi o impacto de cada coisa que a gente fez. Acabou o cliente achar que a gente só roda anúncio."

### 4.3 · Reuniões · "fechar o ciclo gerencial" (03:30 – 04:00)

**Tela:** aba Reuniões, mostrar dashboard "Decisão × Execução × Resultado", abrir uma ata

**Fala:**
> "Reuniões. Essa é a peça que conecta tudo. Hoje a gente faz weekly, decide coisa, e na semana seguinte ninguém lembra direito o que ficou de quem. A plataforma vai ler a transcrição que o Gemini já gera, montar a ata estruturada, criar as tasks no ClickUp já atribuídas, e depois cruzar: o que foi decidido × foi feito × qual o impacto. Veja a Carv: 22 decisões nas últimas 4 semanas, 14 deram resultado, 5 não mexeram, 3 nem foram feitas. Isso é gestão de verdade."

### 4.4 · Relatório diário automático (04:00 – 04:30)

**Tela:** voltar pra README ou slide do roadmap, mostrar a parte de "Onda 4"

**Fala:**
> "E na Onda 4 vem a entrega que mais resolve a percepção de valor: relatório diário automático. O sistema gera todo dia útil dois relatórios — um técnico pro time interno no ClickUp Chat, e um narrativo pro cliente direto no WhatsApp. Cliente acorda todo dia com 'isso aconteceu ontem, isso foi feito, esse é o resultado'. Isso muda completamente como ele enxerga o serviço."

---

## 🎬 Bloco 5 · Por que é a solução certa pra agora (04:30 – 05:15)

**Tela:** câmera, ou slide com bullets "3 problemas resolvidos"

**Fala:**
> "Pensando no momento da agência, essa solução resolve as três dores que eu trouxe no começo de uma vez:"

> "**Tempo do gestor:** as tarefas repetitivas — relatório, análise, follow-up de ata — viram automação. O gestor recupera horas por semana pra estratégia, que é onde a gente entrega resultado."

> "**Ritmo do time novo:** todo mundo passa a operar pelo mesmo sistema. Não tem mais Excel diferente por gestor. A pessoa nova entra e em uma semana entende como tudo funciona, porque tudo tá num lugar só."

> "**Percepção de valor pelo cliente:** com o relatório diário no WhatsApp, com a ata estruturada toda semana, com o cruzamento decisão × execução × resultado, o cliente literalmente vê todo dia o que tá sendo feito por ele. Isso muda a conversa de renovação, muda o NPS, muda o ticket médio que a gente consegue cobrar."

---

## 🎬 Bloco 6 · Como entrega (05:15 – 05:45)

**Tela:** README/slide do roadmap em ondas

**Fala:**
> "A entrega é em **6 ondas incrementais**, sem big-bang, sem travar a operação. Onda 1 substitui o Looker pra Carv em 4 semanas — já entrega valor. Onda 2 conecta com ClickUp. Onda 3 traz IA pros criativos. Onda 4 é o relatório diário. Onda 5 é a parte de reuniões. Onda 6 a gente replica pra todos os clientes e abre acesso cliente-facing. Cronograma realista: 4 meses com 1 dev, 2 meses com 2."

---

## 🎬 Bloco 7 · Custo, ROI e decisão (05:45 – 06:30)

**Tela:** câmera no apresentador

**Fala:**
> "Sobre custo: a stack toda é gratuita. Next.js, Supabase, Inngest, Meta API direta. O único investimento é o dev. O ROI eu vejo em três frentes — horas de gestor recuperadas, capacidade de absorver mais clientes sem aumentar o time na mesma proporção, e principalmente o efeito comercial: a gente passa a ter um pitch que ninguém no mercado consegue replicar nos próximos 6 meses."

> "Resumindo: o problema é real, a causa é estrutural, e essa é a solução que faz sentido pro momento. O briefing técnico tá pronto no ClickUp com tudo detalhado. O que eu preciso é o aval pra começar a Onda 1. Pensa com calma e me retorna. Valeu, time."

---

## 📋 Checklist antes de gravar

- [ ] Abrir `index.html` v6.6 em fullscreen, zoom 100%
- [ ] Resetar a página de Criativos (filtro = "2026 inteiro" · sort = Leads)
- [ ] Pré-clicar uma campanha pra mostrar o drill-down rápido
- [ ] Pré-abrir uma ata na aba Reuniões pra mostrar o detalhe
- [ ] Microfone testado · ambiente sem ruído
- [ ] Câmera ligada nos Blocos 1, 2, 5 e 7 (humaniza o diagnóstico e o pedido)
- [ ] Loom ou OBS rodando

## 🎯 Frases-âncora (não corte se faltar tempo)

**Bloco 1:** *"O ritmo da operação não acompanhou o crescimento da agência."*

**Bloco 2:** *"As informações vivem em ilhas separadas e o gestor é a cola humana que conecta tudo. Isso não escala."*

**Bloco 5:** *"O cliente passa a ver todo dia o que tá sendo feito por ele. Isso muda a conversa de renovação."*

**Bloco 7:** *"O problema é real, a causa é estrutural, essa é a solução que faz sentido pro momento."*

---

*Roteiro v2 · tom consultor · 02/05/2026*
