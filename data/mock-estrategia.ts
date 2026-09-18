/**
 * Estratégia & Inteligência — dados mockados (Fase 6 · front-end)
 *
 * Extraídos do mockup oficial (módulo `ei`): forecast, plano de testes, mapa de
 * saturação, alocação de budget, canais, conteúdo orgânico, distribuição paga,
 * reuniões e decisões.
 */

export const DADOS_ESTRATEGIA = {
  "cliente": "Carv Group · MLC",
  "periodo": "Mes corrente · Maio/2026 · 4 dias decorridos",
  "meta": {
    "receita_mes": 100000,
    "leads_mes": 4000,
    "vendas_mes": 35,
    "atingimento_atual_pct": 13,
    "ritmo_dia_necessario_leads": 130,
    "ritmo_dia_atual_leads": 91
  },
  "kpis_estrategicos": {
    "investimento_mes": 12500,
    "investimento_ytd": 29555,
    "receita_ytd": 320123,
    "roas_ytd": 10.83,
    "leads_ytd": 3670,
    "mqls_ytd": 1931,
    "ticket_medio": 12500,
    "cac_atual": 222,
    "cac_alvo": 180,
    "ltv_per_venda": 16250
  },
  "forecast": {
    "pessimista": {
      "receita": 78000,
      "leads": 2900,
      "vendas": 22,
      "vs_meta": -22,
      "premissa": "Mantém ritmo atual sem ajustes. Saturação dos top criativos continua. Sem novos testes."
    },
    "realista": {
      "receita": 96000,
      "leads": 3650,
      "vendas": 28,
      "vs_meta": -4,
      "premissa": "Implementar 3 ajustes priorizados desta semana (rotação de criativo, lookalike novo, pausa de público saturado)."
    },
    "otimista": {
      "receita": 124000,
      "leads": 4400,
      "vendas": 36,
      "vs_meta": 24,
      "premissa": "Aprovar e executar todos os 6 testes do plano + aumentar budget em 25% nos validados. Forecast otimista assume 2 dos 6 testes validados."
    }
  },
  "plano_testes": [
    {
      "id": "T-01",
      "nome": "Lookalike 5% LeadsMQL_Top (público novo)",
      "tipo": "publico",
      "hipotese": "Lookalikes 1-2% atuais saturando (CPM +18% em 14d). Testar 5% pode trazer escala antes do CPL subir.",
      "criterio": "CPL < $9 + qualificação L→M > 50% em 7 dias",
      "budget": 1500,
      "prazo": "7 dias",
      "status": "rodando",
      "prioridade": "alta",
      "responsavel": "Mickael",
      "score_estrategico": 92,
      "impacto_estimado": "+15% volume com mesmo CPL"
    },
    {
      "id": "T-02",
      "nome": "Novo formato vídeo vertical 30s · Imperial",
      "tipo": "criativo",
      "hipotese": "Filmagem profissional na locação Imperial deve trazer 3 variações de hook diferentes dos criativos atuais (que estão saturando).",
      "criterio": "1 dos 3 criativos com CPL < $8 e CTR > 2% em 5 dias",
      "budget": 800,
      "prazo": "5 dias",
      "status": "rodando",
      "prioridade": "alta",
      "responsavel": "Bia/Imperial",
      "score_estrategico": 88,
      "impacto_estimado": "Novo top performer · vida útil +30 dias"
    },
    {
      "id": "T-03",
      "nome": "Reativar AD262 com nova thumbnail/abertura",
      "tipo": "criativo",
      "hipotese": "AD262 (top histórico) saturou em março. Refresh visual + nova abertura podem trazer 2a vida útil.",
      "criterio": "CTR retorna a > 1.8% em 3 dias",
      "budget": 400,
      "prazo": "3 dias",
      "status": "validado",
      "prioridade": "alta",
      "responsavel": "Shayna",
      "score_estrategico": 85,
      "impacto_estimado": "🟢 Validado · CTR 2.1% · CPL $7,80 · escalar"
    },
    {
      "id": "T-04",
      "nome": "Google Ads como canal complementar",
      "tipo": "canal",
      "hipotese": "Hoje 100% Meta. Google traz lead com CAC maior porém mais estável. Diversificar reduz risco.",
      "criterio": "CPL Google < $14 (1.7x do Meta) em 14 dias",
      "budget": 2000,
      "prazo": "14 dias",
      "status": "nao_iniciado",
      "prioridade": "media",
      "responsavel": "Pablo",
      "score_estrategico": 76,
      "impacto_estimado": "Diversificação de canal · -30% risco saturação Meta"
    },
    {
      "id": "T-05",
      "nome": "Copy 'limpeza profissional' vs 'renda recorrente'",
      "tipo": "copy",
      "hipotese": "Hipótese da reunião 27/03: público responde melhor a benefício direto (renda) que a categoria (limpeza). Testar A/B.",
      "criterio": "Diferença de CPL > 15% entre A e B em 7 dias",
      "budget": 600,
      "prazo": "7 dias",
      "status": "nao_iniciado",
      "prioridade": "media",
      "responsavel": "Shayna",
      "score_estrategico": 72,
      "impacto_estimado": "Direcionamento estratégico de mensagem"
    },
    {
      "id": "T-06",
      "nome": "Oferta combo Mentoria + Acelerador",
      "tipo": "oferta",
      "hipotese": "Top performer Juliana fechou ticket 24% acima com upsell. Testar oferta combo na origem da call.",
      "criterio": "Ticket médio > $14k com mesma close rate",
      "budget": 0,
      "prazo": "30 dias",
      "status": "nao_iniciado",
      "prioridade": "baixa",
      "responsavel": "Comercial cliente",
      "score_estrategico": 65,
      "impacto_estimado": "+15% receita sem aumentar volume"
    }
  ],
  "saturacao": [
    {
      "dimensao": "Criativo",
      "item": "AD262_VID_CansouDeSofrer",
      "saturacao_pct": 68,
      "tendencia": "subindo",
      "alerta": "media",
      "ctr_drop_7d": -18,
      "recomendacao": "Pausar em 5 dias se CTR continuar caindo. Reteste com refresh em T-03 (em validação)."
    },
    {
      "dimensao": "Público",
      "item": "LAL2%_LeadsMQL",
      "saturacao_pct": 84,
      "tendencia": "subindo",
      "alerta": "alta",
      "ctr_drop_7d": -27,
      "recomendacao": "🔴 Pausar nos próximos 3 dias. Substituir por T-01 (LAL 5% em teste)."
    },
    {
      "dimensao": "Campanha",
      "item": "CADASTRO_CAPTACAO_MLC",
      "saturacao_pct": 71,
      "tendencia": "estavel",
      "alerta": "media",
      "ctr_drop_7d": -8,
      "recomendacao": "Reduzir budget 30% e mover pra campanha de teste."
    },
    {
      "dimensao": "Formato",
      "item": "Vídeo curto 15s",
      "saturacao_pct": 55,
      "tendencia": "estavel",
      "alerta": "baixa",
      "ctr_drop_7d": -3,
      "recomendacao": "Manter. Diversificar com formato 30s vertical (T-02)."
    },
    {
      "dimensao": "Canal",
      "item": "Meta Ads (100% do investimento)",
      "saturacao_pct": 60,
      "tendencia": "subindo",
      "alerta": "media",
      "ctr_drop_7d": -10,
      "recomendacao": "Risco de concentração. Diversificar com Google em T-04."
    }
  ],
  "alocacao_budget": [
    {
      "campanha": "CADASTRO_CAPTACAO_MLC (TESTECRIATIVOS)",
      "atual_pct": 65,
      "atual_valor": 8125,
      "sugerido_pct": 45,
      "sugerido_valor": 5625,
      "delta": -2500,
      "razao": "Campanha em saturação (71%) e CPL subindo. Reduzir 30% e mover pra testes."
    },
    {
      "campanha": "ABOPUBLICOS_LeadsMQL (validados)",
      "atual_pct": 25,
      "atual_valor": 3125,
      "sugerido_pct": 35,
      "sugerido_valor": 4375,
      "delta": 1250,
      "razao": "Públicos validados com CPL estável. Aumentar pra capturar mais escala antes da saturação chegar."
    },
    {
      "campanha": "TESTE_LAL5%_NOVO (T-01)",
      "atual_pct": 5,
      "atual_valor": 625,
      "sugerido_pct": 15,
      "sugerido_valor": 1875,
      "delta": 1250,
      "razao": "Teste rodando · early signs positivos. Acelerar validação."
    },
    {
      "campanha": "TESTE_GOOGLE (T-04)",
      "atual_pct": 0,
      "atual_valor": 0,
      "sugerido_pct": 5,
      "sugerido_valor": 625,
      "delta": 625,
      "razao": "Diversificação de canal · começar com 5% pra validar viabilidade."
    },
    {
      "campanha": "REMARKETING + CONTENT",
      "atual_pct": 5,
      "atual_valor": 625,
      "sugerido_pct": 0,
      "sugerido_valor": 0,
      "delta": -625,
      "razao": "ROAS abaixo da média. Pausar até reativar com nova estratégia."
    }
  ],
  "canais": [
    {
      "canal": "Meta Ads",
      "investimento_pct": 100,
      "investimento": 29555,
      "leads": 3670,
      "cpl": 8.05,
      "vendas": 28,
      "cac": 222,
      "roas": 10.83,
      "status": "principal",
      "obs": "Performance forte mas concentração de risco crítica."
    },
    {
      "canal": "Google Ads",
      "investimento_pct": 0,
      "investimento": 0,
      "leads": 0,
      "cpl": null,
      "vendas": 0,
      "cac": null,
      "roas": null,
      "status": "nao_testado",
      "obs": "Hipótese T-04: CPL projetado $14 (1.7x Meta) com maior estabilidade. Validar em 14 dias."
    },
    {
      "canal": "Orgânico (social selling)",
      "investimento_pct": 0,
      "investimento": 0,
      "leads": 280,
      "cpl": 0,
      "vendas": 4,
      "cac": 0,
      "roas": null,
      "status": "complemento",
      "obs": "Não escala mas tem valor agregado. Manter sem prioridade."
    },
    {
      "canal": "YouTube",
      "investimento_pct": 0,
      "investimento": 0,
      "leads": 0,
      "cpl": null,
      "vendas": 0,
      "cac": null,
      "roas": null,
      "status": "futuro",
      "obs": "Considerar em Q3 após validar Google."
    }
  ],
  "decisoes_estrategicas": [
    {
      "data": "29/04/2026",
      "decisao": "Pausar funil hispânico até estruturar time comercial (closer)",
      "tomada_em": "Reunião weekly Carv 29/04",
      "responsavel": "Fernanda (cliente) · Mickael (Infotráfego)",
      "status": "andamento",
      "impacto": "⏳ Em andamento · contratação do closer em fase final · retomada prevista 15/05"
    },
    {
      "data": "22/04/2026",
      "decisao": "Reduzir quantidade de criativos ativos · focar nos validados",
      "tomada_em": "Reunião weekly Carv 22/04",
      "responsavel": "Shayna",
      "status": "feito",
      "impacto": "🟢 Implementado · 8 criativos pausados · CPL caiu 12% nos 14 dias seguintes"
    },
    {
      "data": "15/04/2026",
      "decisao": "Testar formato Imperial (vídeo profissional 30s) com 3 ganchos",
      "tomada_em": "Reunião weekly Carv 15/04",
      "responsavel": "Bia · Imperial",
      "status": "andamento",
      "impacto": "⏳ Filmagem feita · 3 ads em produção · estreia 06/05 (T-02 do plano de testes)"
    },
    {
      "data": "08/04/2026",
      "decisao": "Concluir integração WhatsApp/Typebot pra remarketing",
      "tomada_em": "Reunião weekly Carv 08/04",
      "responsavel": "Pablo",
      "status": "feito",
      "impacto": "🟢 Concluído em 11/04 · respostas indo pra planilha + CRM · ainda pouco volume."
    }
  ]
};

export const ORGANICO = {
  "cliente": "Carv Group",
  "periodo": "Maio/2026 · MTD (8 dias)",
  "kpis": {
    "novos_seguidores": 432,
    "novos_seguidores_delta": 18,
    "conversoes_atribuidas": 17,
    "conversoes_atribuidas_delta": 23,
    "retencao_video": 38.4,
    "retencao_video_delta": 4,
    "engajamento_medio": 6.8,
    "engajamento_medio_delta": 12
  },
  "perfis": [
    {
      "handle": "@raphael.carv",
      "nome": "Raphael Carvalho",
      "avatar": "R",
      "novos_seguidores": 198,
      "total_seguidores": 14820,
      "posts_periodo": 11,
      "alcance": 42300,
      "engajamento": 7.4,
      "conversoes": 8
    },
    {
      "handle": "@imperio.cleaning",
      "nome": "Império Cleaning",
      "avatar": "I",
      "novos_seguidores": 156,
      "total_seguidores": 9200,
      "posts_periodo": 9,
      "alcance": 28100,
      "engajamento": 6.2,
      "conversoes": 6
    },
    {
      "handle": "@andre.builder",
      "nome": "André Builder",
      "avatar": "A",
      "novos_seguidores": 78,
      "total_seguidores": 6480,
      "posts_periodo": 7,
      "alcance": 16900,
      "engajamento": 5.8,
      "conversoes": 3
    }
  ],
  "top_posts": [
    {
      "thumb_emoji": "🎬",
      "tipo": "Reel",
      "titulo": "Cansei de sofrer pra crescer · 32s",
      "perfil": "@raphael.carv",
      "data": "04/05",
      "alcance": 18400,
      "engaj": 11.2,
      "salvos": 287
    },
    {
      "thumb_emoji": "🎬",
      "tipo": "Reel",
      "titulo": "Building como esse não dá pra perder · 28s",
      "perfil": "@imperio.cleaning",
      "data": "03/05",
      "alcance": 12800,
      "engaj": 9.6,
      "salvos": 198
    },
    {
      "thumb_emoji": "📷",
      "tipo": "Carrossel",
      "titulo": "5 erros que matam sua escala (slide-by-slide)",
      "perfil": "@raphael.carv",
      "data": "06/05",
      "alcance": 9200,
      "engaj": 8.4,
      "salvos": 142
    },
    {
      "thumb_emoji": "🎬",
      "tipo": "Reel",
      "titulo": "Aspirar de manhã, faturar à noite",
      "perfil": "@andre.builder",
      "data": "02/05",
      "alcance": 6800,
      "engaj": 7.9,
      "salvos": 89
    },
    {
      "thumb_emoji": "📷",
      "tipo": "Estático",
      "titulo": "Antes × Depois · Casa do Pedro",
      "perfil": "@imperio.cleaning",
      "data": "01/05",
      "alcance": 4900,
      "engaj": 7.1,
      "salvos": 67
    }
  ],
  "temas": [
    {
      "rank": 1,
      "nome": "Cansaço / motivação pra escalar",
      "posts": 6,
      "engaj_medio": 9.2
    },
    {
      "rank": 2,
      "nome": "Casos de cliente real (antes/depois)",
      "posts": 4,
      "engaj_medio": 8.4
    },
    {
      "rank": 3,
      "nome": "Erros / aprendizados (negativos)",
      "posts": 3,
      "engaj_medio": 7.8
    },
    {
      "rank": 4,
      "nome": "Bastidores da operação",
      "posts": 5,
      "engaj_medio": 6.9
    },
    {
      "rank": 5,
      "nome": "Dicas práticas de gestão",
      "posts": 4,
      "engaj_medio": 5.4
    }
  ],
  "seguidores_8sem": {
    "labels": [
      "S11",
      "S12",
      "S13",
      "S14",
      "S15",
      "S16",
      "S17",
      "S18"
    ],
    "raphael": [
      13800,
      14010,
      14180,
      14320,
      14470,
      14580,
      14680,
      14820
    ],
    "imperio": [
      8400,
      8520,
      8650,
      8780,
      8900,
      9020,
      9100,
      9200
    ],
    "andre": [
      6100,
      6160,
      6220,
      6280,
      6340,
      6390,
      6440,
      6480
    ]
  },
  "insights": [
    {
      "tipo": "O que funcionou",
      "texto": "Tema \"cansaço/motivação\" rendeu engajamento médio 9,2% (1,4× o average). Vale aumentar frequência desse pilar de 1×/sem pra 2×/sem."
    },
    {
      "tipo": "O que funcionou",
      "texto": "@raphael.carv puxou 46% das novas conversões orgânicas atribuídas · perfil mais maduro · usar como hub principal."
    },
    {
      "tipo": "Não funcionou",
      "texto": "Posts estáticos sem case real tiveram engaj médio 4,2% · pior tipo do mês. Migrar quase tudo pra Reels e Carrossel narrativo."
    },
    {
      "tipo": "Melhorar",
      "texto": "@andre.builder com retenção de vídeo 32% (média 38%) · ganchos de 3s genéricos · revisar abertura nos próximos 5 reels."
    }
  ]
};

export const DISTRIBUICAO = {
  "verba_mes": 1000,
  "gasto_mtd": 287,
  "dias_decorridos": 8,
  "dias_total": 31,
  "kpis": {
    "investido": 287,
    "saldo": 713,
    "conversoes": 9,
    "custo_por_conversao": 31.89
  },
  "posts_boosteados": [
    {
      "thumb_emoji": "🎬",
      "titulo": "Cansei de sofrer pra crescer (Reel)",
      "perfil": "@raphael.carv",
      "investido": 95,
      "alcance_pago": 32400,
      "conversoes": 4,
      "cpc": 23.75,
      "roi_categoria": "bom"
    },
    {
      "thumb_emoji": "🎬",
      "titulo": "Building como esse não dá pra perder (Reel)",
      "perfil": "@imperio.cleaning",
      "investido": 80,
      "alcance_pago": 24800,
      "conversoes": 3,
      "cpc": 26.67,
      "roi_categoria": "bom"
    },
    {
      "thumb_emoji": "📷",
      "titulo": "5 erros que matam sua escala (Carrossel)",
      "perfil": "@raphael.carv",
      "investido": 60,
      "alcance_pago": 14200,
      "conversoes": 1,
      "cpc": 60,
      "roi_categoria": "medio"
    },
    {
      "thumb_emoji": "🎬",
      "titulo": "Aspirar de manhã, faturar à noite (Reel)",
      "perfil": "@andre.builder",
      "investido": 32,
      "alcance_pago": 8400,
      "conversoes": 1,
      "cpc": 32,
      "roi_categoria": "medio"
    },
    {
      "thumb_emoji": "📷",
      "titulo": "Antes × Depois · Casa do Pedro (Estático)",
      "perfil": "@imperio.cleaning",
      "investido": 20,
      "alcance_pago": 3800,
      "conversoes": 0,
      "cpc": null,
      "roi_categoria": "ruim"
    }
  ],
  "comparacao": {
    "alcance": {
      "organico_medio": 9100,
      "boost_medio": 16720,
      "multiplier": 1.84
    },
    "conversao": {
      "organico_medio": 1.7,
      "boost_medio": 2.3,
      "multiplier": 1.35
    }
  }
};

export const REUNIOES = [
  {
    "id": "r-08",
    "tipo": "weekly_trafego",
    "data": "2026-05-06",
    "dia": "06",
    "mes": "Mai",
    "dow": "terça",
    "tipo_label": "Weekly Tráfego",
    "tipo_icon": "⚡",
    "titulo": "Revisão de pace · ajustes da semana",
    "duracao": 60,
    "participantes": [
      "Pablo (gestão dados)",
      "Mickael",
      "Felipe (estrategista)"
    ],
    "clientes": [
      "Carv Group",
      "Stella"
    ],
    "decisoes": [
      "Pausar LAL2% Stella · saturação confirmada · substituir por LAL5%",
      "Acelerar verba do teste Imperial Carv · de R$ 800 pra R$ 1.500",
      "Pablo configura tracking de Google Ads pra T-04 essa semana"
    ],
    "acoes": [
      {
        "acao": "Pausar LAL2% Stella",
        "resp": "Pablo",
        "prazo": "07/05"
      },
      {
        "acao": "Aumentar budget Imperial Carv pra R$ 1.500",
        "resp": "Pablo",
        "prazo": "06/05"
      },
      {
        "acao": "Configurar conversão Google Ads",
        "resp": "Pablo",
        "prazo": "08/05"
      },
      {
        "acao": "Briefing de tráfego para Cristina (cliente novo)",
        "resp": "Felipe",
        "prazo": "09/05"
      },
      {
        "acao": "Refresh thumbnail AD263 Carv",
        "resp": "Shayna",
        "prazo": "10/05"
      }
    ],
    "insights": [
      "Padrão claro: LAL2% satura entre 14-21 dias em todas as contas. Migrar pra LAL5% como default na captação.",
      "Imperial está rendendo o dobro do esperado · vale propor formato pra Stella e Kedma também."
    ]
  },
  {
    "id": "r-07",
    "tipo": "deep_dive",
    "data": "2026-05-05",
    "dia": "05",
    "mes": "Mai",
    "dow": "segunda",
    "tipo_label": "Deep-dive Cliente",
    "tipo_icon": "🔍",
    "titulo": "Carv Group · pace de leads abaixo da meta",
    "duracao": 90,
    "participantes": [
      "Mickael",
      "Pablo",
      "Higor (comercial)",
      "Bianca (CS)"
    ],
    "clientes": [
      "Carv Group"
    ],
    "decisoes": [
      "Acionar plano de aceleração · 3 frentes simultâneas em 14 dias",
      "Reservar 30min na próxima reunião com cliente pra alinhar narrativa",
      "Ativar bot Z-API Carv pra capturar respostas perdidas no WhatsApp"
    ],
    "acoes": [
      {
        "acao": "Plano de aceleração · documento estratégico",
        "resp": "Mickael",
        "prazo": "07/05"
      },
      {
        "acao": "Pauta narrativa pra reunião 09/05 com Carv",
        "resp": "Bianca",
        "prazo": "08/05"
      },
      {
        "acao": "Ativar bot Z-API + tracking de respostas perdidas",
        "resp": "Pablo",
        "prazo": "12/05"
      },
      {
        "acao": "Higor revisa qualificação dos últimos 7 dias",
        "resp": "Higor",
        "prazo": "06/05"
      },
      {
        "acao": "Mapear cidades com alto custo · ajustar geo-fence",
        "resp": "Pablo",
        "prazo": "08/05"
      },
      {
        "acao": "Treinar Carolina pra perseguir não-contactados em 30min",
        "resp": "Higor",
        "prazo": "07/05"
      },
      {
        "acao": "Bianca prepara comparativo histórico saúde Carv",
        "resp": "Bianca",
        "prazo": "08/05"
      }
    ],
    "insights": [
      "Pace tá em 91 leads/dia · meta exige 130/dia. Gap de 30% que se acumular vira -R$ 30k de receita ao final do mês.",
      "Maior parte do gap vem de leads que entram em horário fora-do-expediente (18h-22h) sem follow-up rápido.",
      "Bot Z-API resolve isso · captura mensagens perdidas e devolve no Kommo automaticamente."
    ]
  },
  {
    "id": "r-06",
    "tipo": "weekly_comercial",
    "data": "2026-05-04",
    "dia": "04",
    "mes": "Mai",
    "dow": "domingo",
    "tipo_label": "Weekly Comercial",
    "tipo_icon": "💼",
    "titulo": "Performance dos closers e plano da semana",
    "duracao": 45,
    "participantes": [
      "Higor",
      "Carolina",
      "Juliana",
      "Pedro Henrique",
      "Camila"
    ],
    "clientes": [
      "Carv Group"
    ],
    "decisoes": [
      "Camila segue em treinamento de objeção de preço · agenda mantida 06/05",
      "Reagendar treinamento de agenda condicional do Pedro pra próxima semana"
    ],
    "acoes": [
      {
        "acao": "Carolina pega 5 calls extras de leads não-contactados",
        "resp": "Carolina",
        "prazo": "08/05"
      },
      {
        "acao": "Camila grava 3 calls dela e envia pra Juliana revisar",
        "resp": "Camila",
        "prazo": "10/05"
      },
      {
        "acao": "Juliana documenta 5 frases-âncora de objeção em PDF",
        "resp": "Juliana",
        "prazo": "09/05"
      },
      {
        "acao": "Pedro estuda playbook de agenda condicional (Juliana)",
        "resp": "Pedro",
        "prazo": "11/05"
      }
    ],
    "insights": [
      "Talk-ratio do Pedro caiu de 50% pra 44% nos últimos 7 dias · sinal de melhora.",
      "Camila mostrando abertura pra mudar · primeiro tracking positivo desde abril."
    ]
  },
  {
    "id": "r-05",
    "tipo": "weekly_cs",
    "data": "2026-05-03",
    "dia": "03",
    "mes": "Mai",
    "dow": "sábado",
    "tipo_label": "Weekly CS",
    "tipo_icon": "🤝",
    "titulo": "Saúde da carteira · sinais de risco",
    "duracao": 30,
    "participantes": [
      "Bianca (CS)",
      "Mickael"
    ],
    "clientes": [
      "Stella",
      "Kedma",
      "Giulia",
      "Paula"
    ],
    "decisoes": [
      "Stella precisa de plano de retenção · saturação + pace fraco há 21 dias",
      "Kedma vai pra renovação em 30 dias · começar narrativa de impacto agora"
    ],
    "acoes": [
      {
        "acao": "Plano de retenção Stella · 3 hipóteses",
        "resp": "Bianca",
        "prazo": "08/05"
      },
      {
        "acao": "Coletar prints de impacto Kedma últimos 6 meses",
        "resp": "Bianca",
        "prazo": "10/05"
      },
      {
        "acao": "Reunião de retenção com Stella",
        "resp": "Bianca + Mickael",
        "prazo": "12/05"
      }
    ],
    "insights": [
      "Cadência de NPS interno tá inconsistente · 4 clientes sem registro nas últimas 4 semanas. Padronizar.",
      "Padrão observado: clientes que tiveram 2 meses seguidos abaixo da meta começam a falar de churn no 3o mês. Stella e Paula no risco."
    ]
  },
  {
    "id": "r-04",
    "tipo": "all_hands",
    "data": "2026-05-02",
    "dia": "02",
    "mes": "Mai",
    "dow": "sexta",
    "tipo_label": "All-hands Semanal",
    "tipo_icon": "👥",
    "titulo": "Status geral da agência · semana 18",
    "duracao": 75,
    "participantes": [
      "Mickael",
      "Pablo",
      "Higor",
      "Bianca",
      "Felipe",
      "Shayna",
      "Bia (criativos)",
      "Carolina",
      "Juliana",
      "Pedro"
    ],
    "clientes": [
      "Carv Group",
      "Stella",
      "Kedma",
      "Giulia",
      "Cristina"
    ],
    "decisoes": [
      "Cliente Cristina entra oficialmente em 06/05 · Pablo lidera onboarding",
      "Aprovar contratação de mais 1 SDR júnior (recurso operacional)",
      "Migrar reunião weekly Stella de quinta pra terça (ajuste de horário)",
      "Fechar bug do Typebot até 08/05 · prioridade alta"
    ],
    "acoes": [
      {
        "acao": "Mickael formaliza contratação SDR júnior",
        "resp": "Mickael",
        "prazo": "08/05"
      },
      {
        "acao": "Onboarding técnico cliente Cristina",
        "resp": "Pablo",
        "prazo": "06/05"
      },
      {
        "acao": "Movimentar reunião Stella no calendário",
        "resp": "Bianca",
        "prazo": "05/05"
      },
      {
        "acao": "Investigar bug Typebot · pular pergunta 3",
        "resp": "Pablo",
        "prazo": "08/05"
      },
      {
        "acao": "Briefing criativo cliente Cristina · 5 ganchos",
        "resp": "Bia",
        "prazo": "09/05"
      },
      {
        "acao": "Apresentar Cristina pro Higor · estrutura SDR",
        "resp": "Mickael",
        "prazo": "06/05"
      }
    ],
    "insights": [
      "Time tá em ritmo bom · 3 clientes acima da meta (Carv, Giulia, Alex), 2 borderline (Kedma, Paula), 2 em risco (Stella, Cristina nova).",
      "Bug do Typebot pode estar perdendo até 8% dos leads · auditar urgente.",
      "Bia tá entregando 3x mais criativos que abril · time de mídia agradece."
    ]
  },
  {
    "id": "r-03",
    "tipo": "retro",
    "data": "2026-04-30",
    "dia": "30",
    "mes": "Abr",
    "dow": "quinta",
    "tipo_label": "Retrospectiva Mensal",
    "tipo_icon": "🔄",
    "titulo": "Retrô de Abril · o que aprendemos",
    "duracao": 90,
    "participantes": [
      "Mickael",
      "Pablo",
      "Higor",
      "Bianca",
      "Felipe"
    ],
    "clientes": [
      "Geral"
    ],
    "decisoes": [
      "Adotar template de Otimização Diária no ClickUp como padrão de TODAS as contas",
      "Centralizar atas de reunião na pasta única do Drive (não mais por cliente espalhado)",
      "Escalar uso da plataforma Inteligência de Dados pra todos os clientes em 30 dias"
    ],
    "acoes": [
      {
        "acao": "Documentar template de Otimização Diária no Notion",
        "resp": "Pablo",
        "prazo": "05/05"
      },
      {
        "acao": "Reorganizar Drive · pasta única de Atas",
        "resp": "Bianca",
        "prazo": "06/05"
      },
      {
        "acao": "Plano de rollout Inteligência de Dados nos 7 clientes",
        "resp": "Mickael",
        "prazo": "15/05"
      }
    ],
    "insights": [
      "Maior aprendizado de abril: clientes que adotaram weekly fixo cresceram 23% mais que os de cadência irregular.",
      "Decisões anotadas em ClickUp têm 78% de execução · decisões só em Slack têm 31%. Padronizar uso do ClickUp.",
      "Padrão: o que mata cliente B2B mentoria não é CPL · é gap entre lead e call. Endurecer SLA de follow-up."
    ]
  },
  {
    "id": "r-02",
    "tipo": "deep_dive",
    "data": "2026-04-29",
    "dia": "29",
    "mes": "Abr",
    "dow": "quarta",
    "tipo_label": "Deep-dive Cliente",
    "tipo_icon": "🔍",
    "titulo": "Stella · saturação de público e plano de virada",
    "duracao": 60,
    "participantes": [
      "Pablo",
      "Felipe (estrategista)",
      "Bianca"
    ],
    "clientes": [
      "Stella"
    ],
    "decisoes": [
      "Pausar LAL2% imediatamente · validado já em duas contas (Carv também)",
      "Acelerar teste de público novo (LAL5%) com budget reduzido pra validar antes de escalar",
      "Marcar reunião com cliente Stella pra alinhar narrativa antes do plano virar visível"
    ],
    "acoes": [
      {
        "acao": "Pausar LAL2% Stella",
        "resp": "Pablo",
        "prazo": "30/04"
      },
      {
        "acao": "Subir teste LAL5% com budget de R$ 600",
        "resp": "Pablo",
        "prazo": "02/05"
      },
      {
        "acao": "Reunião alinhamento Stella",
        "resp": "Bianca",
        "prazo": "04/05"
      }
    ],
    "insights": [
      "Stella já é o terceiro cliente em 6 meses com mesmo padrão de saturação no LAL2%. Pode virar processo padronizado.",
      "Felipe sugeriu testar combinação LAL5% + interesses como hedge · vale quando volume é menor."
    ]
  },
  {
    "id": "r-01",
    "tipo": "1on1",
    "data": "2026-04-28",
    "dia": "28",
    "mes": "Abr",
    "dow": "terça",
    "tipo_label": "1:1",
    "tipo_icon": "💬",
    "titulo": "Mickael × Bianca · plano de evolução CS",
    "duracao": 45,
    "participantes": [
      "Mickael",
      "Bianca"
    ],
    "clientes": [
      "Geral"
    ],
    "decisoes": [
      "Bianca passa a ter visão de saúde de cada cliente · plataforma Central CS sendo construída",
      "Cadência de check-in interno por cliente: quinzenal pra Bianca documentar saúde"
    ],
    "acoes": [
      {
        "acao": "Bianca cria checklist de check-in quinzenal",
        "resp": "Bianca",
        "prazo": "05/05"
      },
      {
        "acao": "Mickael acompanha Bianca em 2 atendimentos pra calibrar",
        "resp": "Mickael",
        "prazo": "12/05"
      }
    ],
    "insights": [
      "Bianca quer evoluir pra liderar CS de forma autônoma em 6 meses · plano de desenvolvimento pessoal.",
      "Time vê CS como atendimento reativo · precisamos virar isso pra CS proativo (preventivo de churn)."
    ]
  },
  {
    "id": "r-c01",
    "tipo": "cliente",
    "data": "2026-05-02",
    "dia": "02",
    "mes": "Mai",
    "dow": "sexta",
    "tipo_label": "Weekly com Cliente",
    "tipo_icon": "🤝",
    "titulo": "Carv Group · weekly de status e decisões da semana",
    "duracao": 60,
    "participantes": [
      "Mickael",
      "Pablo",
      "Higor",
      "Bianca",
      "Fernanda Losada (cliente)",
      "Mateus Carv (cliente)"
    ],
    "clientes": [
      "Carv Group"
    ],
    "decisoes": [
      "Aprovar plano de teste com 6 hipóteses (T-01 a T-06) · execução em 14 dias",
      "Aumentar verba de mídia em 15% se o realista virar otimista",
      "Cliente assume produção dos depoimentos pra prova social nos novos criativos"
    ],
    "acoes": [
      {
        "acao": "Subir T-01 (LAL5%) e T-02 (Imperial) na segunda",
        "resp": "Pablo",
        "prazo": "06/05"
      },
      {
        "acao": "Cliente entrega 3 depoimentos em vídeo até 15/05",
        "resp": "Fernanda (cliente)",
        "prazo": "15/05"
      },
      {
        "acao": "Bianca prepara comparativo financeiro do mês pra próxima reunião",
        "resp": "Bianca",
        "prazo": "08/05"
      },
      {
        "acao": "Higor revisa qualificação do final de semana",
        "resp": "Higor",
        "prazo": "05/05"
      }
    ],
    "insights": [
      "Cliente alinhado com o plano de testes · sinaliza disposição pra dobrar verba se 2 testes validarem.",
      "Fernanda (decisora) trouxe ela mesma 2 ideias de copy · sinal de engajamento alto · usar pra acelerar."
    ]
  },
  {
    "id": "r-c02",
    "tipo": "cliente",
    "data": "2026-04-25",
    "dia": "25",
    "mes": "Abr",
    "dow": "sexta",
    "tipo_label": "Weekly com Cliente",
    "tipo_icon": "🤝",
    "titulo": "Carv Group · revisão de saturação e ajustes",
    "duracao": 50,
    "participantes": [
      "Mickael",
      "Pablo",
      "Fernanda Losada (cliente)"
    ],
    "clientes": [
      "Carv Group"
    ],
    "decisoes": [
      "Pausar funil hispânico até cliente estruturar closer dedicado · retomada prevista 15/05",
      "Reduzir quantidade de criativos ativos · focar nos 4 validados",
      "Reativar AD262 com refresh visual (já validado em 5 dias)"
    ],
    "acoes": [
      {
        "acao": "Pausar campanha hispânica",
        "resp": "Pablo",
        "prazo": "26/04"
      },
      {
        "acao": "Pausar 8 criativos não-validados",
        "resp": "Shayna",
        "prazo": "27/04"
      },
      {
        "acao": "Briefing refresh AD262",
        "resp": "Shayna",
        "prazo": "28/04"
      }
    ],
    "insights": [
      "Cliente trouxe novo gatilho descoberto (carga laboral) · vale testar como copy.",
      "Padrão: cada vez que reduzimos quantidade de criativos pra focar nos top, CPL cai. 4o caso."
    ]
  },
  {
    "id": "r-c03",
    "tipo": "cliente",
    "data": "2026-04-18",
    "dia": "18",
    "mes": "Abr",
    "dow": "sexta",
    "tipo_label": "Weekly com Cliente",
    "tipo_icon": "🤝",
    "titulo": "Carv Group · plano mensal e direcionamento de testes",
    "duracao": 75,
    "participantes": [
      "Mickael",
      "Pablo",
      "Higor",
      "Fernanda Losada (cliente)",
      "Bia (criativos)"
    ],
    "clientes": [
      "Carv Group"
    ],
    "decisoes": [
      "Concluir integração WhatsApp/Typebot pra remarketing · prioridade alta",
      "Iniciar produção do formato Imperial · 3 ganchos pré-aprovados pelo cliente"
    ],
    "acoes": [
      {
        "acao": "Pablo finaliza integração WhatsApp",
        "resp": "Pablo",
        "prazo": "11/04"
      },
      {
        "acao": "Bia inicia gravação Imperial",
        "resp": "Bia",
        "prazo": "20/04"
      },
      {
        "acao": "Cliente aprova roteiro final dos 3 ganchos",
        "resp": "Fernanda",
        "prazo": "15/04"
      }
    ],
    "insights": [
      "Cliente disposto a investir em produção (formato Imperial · vídeo profissional) · prioritário.",
      "Integração WhatsApp pode resolver 80% do gargalo de follow-up dos leads de fim de semana."
    ]
  }
];

