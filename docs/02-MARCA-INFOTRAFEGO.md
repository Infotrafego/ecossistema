# Marca Infotráfego · Identidade Visual

**Versão:** v1 · 02/06/2026
**Status:** documento de referência pra Pablo + futuro design system
**Aplicado em:** v1.4 do app unificado

---

## Paleta de cores oficial

| Nome | HEX | RGB | CMYK | Uso |
|---|---|---|---|---|
| **Azul Via Central Profundo** | `#1A3D70` | 26, 61, 112 | C100 M79 Y28 K15 | Cor primária · navy do logo · KPIs ativos |
| **Azul Alicerce** | `#031D31` | 3, 29, 49 | C100 M82 Y50 K64 | Fundo escuro · header · sidebar (modo escuro) |
| **Cinza Meio Tom** | `#939899` | 147, 152, 153 | C44 M31 Y33 K11 | Texto secundário · ícones inativos |
| **Ash Gray** | `#C7D2D7` | 199, 210, 215 | C26 M13 Y14 K0 | Bordas · separadores · texto sutil |
| **Chimenes Black** | `#10131A` | 16, 19, 26 | C9 M79 Y57 K82 | Texto principal · pretos profundos |
| **Jet Stream** | `#FFFFFF` | 225, 225, 225 | C0 M0 Y0 K0 | Fundo claro · texto sobre fundo escuro |

### Variáveis CSS no app

```css
:root {
  --navy: #1A3D70;        /* Azul Via Central Profundo */
  --alicerce: #031D31;    /* Azul Alicerce */
  --gray: #939899;         /* Cinza Meio Tom */
  --ash: #C7D2D7;          /* Ash Gray */
  --ink: #10131A;          /* Chimenes Black */
  --white: #FFFFFF;        /* Jet Stream */
}
```

---

## Tipografia

**Família principal:** `Space Grotesk` · `Inter` · fallback system-ui

**Características:**
- Letter-spacing: `-0.005em` (sutil tightening)
- Smoothing: `antialiased`
- Pesos usados: 400 (regular) · 600 (semibold) · 700 (bold) · 800 (extrabold) · 900 (black)

**Hierarquia no app:**
- Título de página · 22px · weight 800 · letter-spacing -0.03em
- Subtítulo · 14px · weight 700
- Body · 14px · weight 400
- Caption · 11-12px · weight 600
- Label · 10-11px · weight 800 · uppercase · letter-spacing 0.06em

---

## Logo · símbolo

**Forma:** octogonal com pé característico no canto inferior-direito · entrelaçamento "i" + "f" estilizado.

**Aplicações no app unificado:**

| Lugar | Tamanho | Fill octógono | Fill letras | Borda |
|---|---|---|---|---|
| Sidebar topo (modo claro) | 36×36 px | Azul Via Central Profundo `#1A3D70` | Branco | Ash Gray 25% opacidade |
| Sidebar topo (modo escuro) | 36×36 px | Azul Via Central Profundo `#1A3D70` | Branco | Branco 25% opacidade |
| Header brand bar | 28×28 px | Branco | Azul Via Central Profundo `#1A3D70` | sem |
| Favicon | 32×32 px | mesma do sidebar | — | — |

**Regras de uso:**
- Margem mínima ao redor do símbolo: 25% da sua largura
- NUNCA distorcer (estica/comprime)
- NUNCA mudar as cores oficiais
- Sobre fundo colorido: preferir a versão branca ou cinza
- Sobre fundo branco: usar a versão Navy oficial

---

## Tom e voz

**Tom geral:** consultivo · sóbrio · técnico mas acessível
**Frases evitadas:** "incrível" · "amazing" · superlativos
**Frases preferidas:** dados específicos · números · ações concretas

**Exemplo correto:**
> "Carv Group · MLC · 23 vendas no período · ROAS 3.4x"

**Exemplo a evitar:**
> "Resultados incríveis no Carv Group, foi um sucesso enorme!"

---

## Onde aplicar no ecossistema

| Camada | Implementação |
|---|---|
| App unificado | Variáveis CSS no shell + override pros módulos |
| Plataforma de produção (Next.js) | Tailwind config customizado com paleta exata |
| Portal Cliente | Branding adaptável por cliente, mas mantendo essas cores como base |
| Documentos (briefings · atas · debriefings) | Capa com símbolo + paleta · tipografia Space Grotesk |
| Comunicação interna (Slack · ClickUp) | Avatar com símbolo Navy · cor da org branding |
| Emails (cliente · interno) | Header com logo · footer com paleta |

---

## Anexos · arquivos da marca

Arquivos vetoriais oficiais devem ficar em:

```
DASHBOARD INFOTRAFEGO/
└── 04 · Marca/
    ├── simbolo-azul.svg
    ├── simbolo-branco.svg
    ├── simbolo-cinza.svg
    ├── logo-completo-azul-sobre-branco.svg
    ├── logo-completo-branco-sobre-azul.svg
    ├── logo-completo-preto.svg
    ├── paleta.pdf
    └── manual-da-marca.pdf
```

(Se você tiver os SVGs originais do logo, me passa que eu substituo o SVG aproximado do app pelo SVG vetorial exato.)
