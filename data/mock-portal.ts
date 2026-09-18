/**
 * Portal Cliente — dados mockados (Fase 6 · front-end)
 *
 * Extraídos do mockup oficial (módulo `pc`). É a visão que o CLIENTE enxerga:
 * InfoNews do dia, mídia, comercial, tráfego estratégico e próximos passos.
 */

export const DADOS_PORTAL = {
  "cliente": "Carv Group · MLC",
  "semana": "Semana 18 · 28/Abr a 04/Mai 2026",
  "resumo_semana": "Esta semana mantivemos o ritmo de leads (média 91/dia, abaixo da meta de 130/dia) mas com qualificação subindo 8pts vs semana anterior. Dois ajustes principais foram feitos: pausamos o público LAL2% que estava saturando e aceleramos o teste do novo formato Imperial. Resultado: CPL caiu de R$ 9,40 pra R$ 8,05 nos últimos 5 dias. Para a próxima semana, priorizamos validar o novo formato e reativar o AD262 com refresh visual.",
  "meta": {
    "receita_alvo_mes": 100000,
    "receita_realizada": 13000,
    "atingimento_pct": 13,
    "dias_decorridos": 4,
    "dias_total": 30,
    "ritmo_status": "ajustando",
    "narrativa_meta": "Mês ainda nos primeiros dias. Ritmo atual exige aceleração. Plano com 3 ações em curso pra recuperar o gap."
  },
  "funil": {
    "investimento": 12500,
    "leads": 365,
    "mqls": 195,
    "agendamentos": 128,
    "vendas": 4,
    "receita": 50000,
    "roas": 4,
    "deltas": {
      "investimento": 5,
      "leads": -3,
      "mqls": 8,
      "agendamentos": 5,
      "vendas": 25,
      "receita": 22
    }
  },
  "aquisicao": {
    "criativo_destaque": "AD262_VID_CansouDeSofrer · vídeo · 23 leads esta semana",
    "novo_em_teste": "Formato Imperial · 3 ganchos novos rodando desde 02/05",
    "publico_top": "LAL1% LeadsMQL_Premium · qualifica 58% dos leads em MQL",
    "saturacao_alerta": "Público LAL2% saturando — reduzido budget em 30%",
    "investimento_canal": [
      {
        "canal": "Meta Ads",
        "pct": 100,
        "ev": "Performance forte"
      },
      {
        "canal": "Google Ads",
        "pct": 0,
        "ev": "Em avaliação · teste em 14 dias"
      }
    ]
  },
  "conversao": {
    "show_rate": 67.9,
    "close_rate": 22,
    "ticket_medio": 12500,
    "delta_show": 5.3,
    "delta_close": 3.7,
    "destaque": "Time comercial fechou 4 vendas esta semana, com ticket médio 4% acima da média histórica.",
    "atencao": "1 padrão recorrente identificado: 70% das calls perdidas têm objeção de preço aparecendo no minuto 40+ (tarde). Treinamento de objeção marcado pra 06/05 com gestor comercial.",
    "objecao_top": "Preço · 38% das objeções"
  },
  "decisoes_semana": [
    {
      "acao": "Pausar público LAL2% saturando",
      "responsavel": "Mickael",
      "status": "feito",
      "impacto": "🟢 CPL caiu 14% nos 5 dias seguintes"
    },
    {
      "acao": "Acelerar teste do formato Imperial (3 ganchos novos)",
      "responsavel": "Bia / Imperial",
      "status": "andamento",
      "impacto": "⏳ Em produção · estreia 06/05"
    },
    {
      "acao": "Reativar AD262 com refresh visual",
      "responsavel": "Shayna",
      "status": "feito",
      "impacto": "🟢 Validado · CTR voltou pra 2,1%"
    },
    {
      "acao": "Treinar time comercial em objeção de preço",
      "responsavel": "Mickael + Camila",
      "status": "agendado",
      "impacto": "⚪ Marcado pra 06/05"
    }
  ],
  "proxima_semana": [
    "🚀 Validar novo formato Imperial (3 criativos rodando, decisão até 09/05)",
    "📈 Escalar verba no AD262 reativado (+30% se mantiver CTR > 1,8%)",
    "🎯 Treinamento comercial em objeção de preço (06/05)",
    "🔄 Iniciar teste Google Ads como canal complementar (T-04 do plano)"
  ],
  "forecast": {
    "pessimista": {
      "valor": 78000,
      "vs_meta": -22,
      "label": "Sem ajustes"
    },
    "realista": {
      "valor": 96000,
      "vs_meta": -4,
      "label": "Com 3 ajustes em curso"
    },
    "otimista": {
      "valor": 124000,
      "vs_meta": 24,
      "label": "Se 2 testes validarem"
    }
  },
  "indicadores_saude": [
    {
      "area": "📈 Aquisição (mídia)",
      "status": "verde",
      "nota": "CPL caindo · qualificação subindo · 1 teste validado"
    },
    {
      "area": "💼 Conversão (comercial)",
      "status": "amarelo",
      "nota": "Show rate ok · gap em objeção de preço identificado"
    },
    {
      "area": "🎯 Estratégia",
      "status": "verde",
      "nota": "Plano de testes em execução · 3 de 6 hipóteses ativas"
    },
    {
      "area": "📋 Decisões da semana",
      "status": "verde",
      "nota": "3 de 4 ações executadas · 1 agendada pra 06/05"
    }
  ],
  "midia": {
    "kpis_ytd": {
      "investimento": 29555,
      "leads": 3670,
      "mqls": 1931,
      "agendamentos": 1295,
      "vendas_proj": 133,
      "receita_proj": 320123,
      "roas": 10.83,
      "cpl_medio": 8.05,
      "cpmql_medio": 15.31
    },
    "funil_cone": [
      {
        "label": "Investimento",
        "value": "R$ 29.555",
        "pct": 100,
        "cor": "navy"
      },
      {
        "label": "Leads",
        "value": "3.670",
        "pct": 80,
        "cor": "navy",
        "taxa": "CPL R$ 8,05"
      },
      {
        "label": "MQLs",
        "value": "1.931",
        "pct": 60,
        "cor": "navy-light",
        "taxa": "↓ 52,6% qualifica"
      },
      {
        "label": "Agendamentos",
        "value": "1.295",
        "pct": 45,
        "cor": "rocket",
        "taxa": "↓ 67,1% agenda"
      },
      {
        "label": "Vendas (proj.)",
        "value": "133",
        "pct": 30,
        "cor": "success",
        "taxa": "↓ 13,8% close"
      },
      {
        "label": "Receita (proj.)",
        "value": "R$ 320k",
        "pct": 22,
        "cor": "success",
        "taxa": "ROAS 10,83x"
      }
    ],
    "criativos_destaque": [
      {
        "posicao": 1,
        "conceito": "Vídeo · 'Cansou de sofrer pra crescer'",
        "leads": 489,
        "cpl": 7.2,
        "status": "ativo",
        "performance": "🟢 Top 1 do período · escalando",
        "tipo": "video",
        "cor_fundo": "#1A3D70",
        "thumb_emoji": "🎬",
        "thumb_label": "AD262",
        "link_instagram": "https://www.instagram.com/p/DSpV4pQjLpm/",
        "duracao": "0:32"
      },
      {
        "posicao": 2,
        "conceito": "Vídeo · 'Building como esse'",
        "leads": 342,
        "cpl": 8.9,
        "status": "ativo",
        "performance": "🟢 Estável · alta qualificação",
        "tipo": "video",
        "cor_fundo": "#2563EB",
        "thumb_emoji": "🏢",
        "thumb_label": "AD225",
        "link_instagram": "https://www.instagram.com/p/DRes4CQDFS7/",
        "duracao": "0:28"
      },
      {
        "posicao": 3,
        "conceito": "Vídeo · 'Aspirar e crescer'",
        "leads": 287,
        "cpl": 9.3,
        "status": "ativo",
        "performance": "🟢 Bom desempenho · evergreen",
        "tipo": "video",
        "cor_fundo": "#16A34A",
        "thumb_emoji": "🚀",
        "thumb_label": "AD263",
        "link_instagram": "https://www.instagram.com/p/DSpV4AbjFSH/",
        "duracao": "0:35"
      },
      {
        "posicao": 4,
        "conceito": "Imagem · 'Fature mais'",
        "leads": 198,
        "cpl": 11.4,
        "status": "atencao",
        "performance": "🟡 CPL acima da meta · revisar",
        "tipo": "imagem",
        "cor_fundo": "#D97706",
        "thumb_emoji": "💰",
        "thumb_label": "AD261",
        "link_instagram": "https://www.instagram.com/p/DRPHLp6jKTR/",
        "duracao": null
      },
      {
        "posicao": 5,
        "conceito": "Vídeo · Banheiro Building",
        "leads": 156,
        "cpl": 10.2,
        "status": "atencao",
        "performance": "🟡 Saturando · trocar em 7 dias",
        "tipo": "video",
        "cor_fundo": "#9333EA",
        "thumb_emoji": "🚿",
        "thumb_label": "AD251",
        "link_instagram": "https://www.instagram.com/p/DSGQQ2dDEGs/",
        "duracao": "0:22"
      }
    ],
    "publicos": [
      {
        "nome": "Lookalike 1% LeadsMQL Premium",
        "performance": "Top performer",
        "qual": 58,
        "cpl": 6.8
      },
      {
        "nome": "Lookalike 1% Compradores",
        "performance": "Estável",
        "qual": 51,
        "cpl": 8.2
      },
      {
        "nome": "Lookalike 2% LeadsMQL",
        "performance": "Saturando",
        "qual": 38,
        "cpl": 12.4
      },
      {
        "nome": "Interesses · Cleaning",
        "performance": "Volume sem qualidade",
        "qual": 28,
        "cpl": 14.2
      }
    ],
    "canal_dist": [
      {
        "canal": "Meta Ads",
        "pct": 100,
        "obs": "100% do investimento atual"
      },
      {
        "canal": "Google Ads",
        "pct": 0,
        "obs": "Em avaliação · teste em 14 dias (T-04)"
      }
    ]
  },
  "comercial": {
    "kpis_periodo": {
      "calls_realizadas": 127,
      "calls_agendadas": 187,
      "show_rate": 67.9,
      "close_rate": 22,
      "vendas": 28,
      "receita": 350000,
      "ticket_medio": 12500,
      "ciclo_medio_dias": 8.4
    },
    "funil_comercial": [
      {
        "label": "Leads qualificados",
        "value": "299",
        "pct": 100
      },
      {
        "label": "Calls agendadas",
        "value": "187",
        "pct": 62
      },
      {
        "label": "Calls realizadas",
        "value": "127",
        "pct": 42
      },
      {
        "label": "Vendas",
        "value": "28",
        "pct": 9
      },
      {
        "label": "Receita",
        "value": "R$ 350k",
        "pct": 0
      }
    ],
    "objecoes_dist": [
      {
        "tipo": "Preço",
        "pct": 38,
        "cor": "warn",
        "tratamento": "Top performer redireciona pra ROI cedo · funcionou em 78% das vezes"
      },
      {
        "tipo": "Timing",
        "pct": 24,
        "cor": "attention",
        "tratamento": "Criar urgência com bonus de tempo · não desconto"
      },
      {
        "tipo": "Autoridade",
        "pct": 18,
        "cor": "rocket",
        "tratamento": "Técnica de agenda condicional · converte 89% dos casos"
      },
      {
        "tipo": "Necessidade",
        "pct": 12,
        "cor": "purple",
        "tratamento": "Pergunta de descoberta · revela trigger oculto"
      },
      {
        "tipo": "Outros",
        "pct": 8,
        "cor": "muted",
        "tratamento": ""
      }
    ],
    "tendencia_mensal": {
      "labels": [
        "Jan",
        "Fev",
        "Mar",
        "Abr",
        "Mai (parcial)"
      ],
      "close_rate": [
        16,
        18,
        19,
        22,
        22
      ],
      "vendas": [
        12,
        15,
        18,
        28,
        4
      ]
    },
    "destaques": [
      {
        "icone": "🟢",
        "texto": "Close rate subiu 6 pontos nos últimos 4 meses (16% → 22%)"
      },
      {
        "icone": "🟢",
        "texto": "Ticket médio R$ 12.500 — 4% acima da média histórica do período"
      },
      {
        "icone": "🟡",
        "texto": "Objeção de preço aparece em 38% das calls — treinamento agendado pra 06/05"
      },
      {
        "icone": "🟢",
        "texto": "Show rate em 67,9% — 5pts acima da média B2B mentoria"
      }
    ]
  },
  "estrategia": {
    "forecast_full": {
      "pessimista": {
        "valor": 78000,
        "vs_meta": -22,
        "label": "Sem ajustes · ritmo atual continua",
        "premissa": "Mantém ritmo atual sem ajustes. Saturação dos top criativos continua. Sem novos testes."
      },
      "realista": {
        "valor": 96000,
        "vs_meta": -4,
        "label": "Com 3 ajustes em curso",
        "premissa": "Implementar os 3 ajustes priorizados desta semana (rotação de criativo, lookalike novo, pausa de público saturado)."
      },
      "otimista": {
        "valor": 124000,
        "vs_meta": 24,
        "label": "Se 2 testes validarem",
        "premissa": "Aprovar e executar os 6 testes do plano + aumentar budget em 25% nos validados. Forecast otimista assume 2 dos 6 testes validados."
      }
    },
    "testes_ativos": [
      {
        "nome": "Lookalike 5% LeadsMQL_Top",
        "tipo": "Público novo",
        "status": "rodando",
        "prazo": "7 dias",
        "expectativa": "+15% volume com mesmo CPL"
      },
      {
        "nome": "Formato vídeo vertical 30s · Imperial",
        "tipo": "Criativo",
        "status": "rodando",
        "prazo": "5 dias",
        "expectativa": "Novo top performer · vida útil +30 dias"
      },
      {
        "nome": "Reativar AD262 com refresh visual",
        "tipo": "Criativo",
        "status": "validado",
        "prazo": "concluído",
        "expectativa": "🟢 Validado · CTR 2,1% · escalar"
      },
      {
        "nome": "Google Ads como canal complementar",
        "tipo": "Canal",
        "status": "agendado",
        "prazo": "início 14/05",
        "expectativa": "Diversificação · -30% risco saturação"
      },
      {
        "nome": "Copy 'limpeza profissional' vs 'renda recorrente'",
        "tipo": "Copy",
        "status": "agendado",
        "prazo": "início 11/05",
        "expectativa": "Direcionamento estratégico de mensagem"
      }
    ],
    "saturacao_alertas": [
      {
        "item": "Público LAL2% LeadsMQL",
        "saturacao": 84,
        "acao": "Pausar e substituir por lookalike 5% (em teste)"
      },
      {
        "item": "Criativo AD262 (top antigo)",
        "saturacao": 68,
        "acao": "Reativado com refresh · validado · CTR voltou pra 2,1%"
      },
      {
        "item": "Canal Meta Ads (concentração)",
        "saturacao": 60,
        "acao": "Diversificar com Google em 14 dias"
      }
    ],
    "decisoes_estrategicas": [
      {
        "data": "Esta semana",
        "decisao": "Aprovar plano de teste com 6 hipóteses",
        "status": "pendente"
      },
      {
        "data": "Próxima semana",
        "decisao": "Decidir se Google Ads entra como canal",
        "status": "agendada"
      },
      {
        "data": "Em 14 dias",
        "decisao": "Aumentar budget total se realista virar otimista",
        "status": "condicional"
      }
    ]
  },
  "recortes_temporais": {
    "data_referencia": "03/05/2026",
    "data_atualizacao": "04/05/2026 09:42",
    "ontem": {
      "label": "Ontem · 03/05/2026 (sábado)",
      "periodo_anterior": "vs sexta 02/05",
      "investimento": 320,
      "leads": 38,
      "mqls": 22,
      "agendamentos": 15,
      "vendas": 1,
      "receita": 12500,
      "cpl": 8.42,
      "cpmql": 14.55,
      "deltas": {
        "investimento": 5,
        "leads": 8,
        "mqls": 12,
        "agendamentos": 6,
        "vendas": 0,
        "receita": 0,
        "cpl": -3,
        "cpmql": -7
      },
      "destaque": "Sábado tradicionalmente tem volume menor mas qualificação subiu 12% — leads de fim de semana convertendo melhor.",
      "atencao": null
    },
    "ultimos_7d": {
      "label": "Últimos 7 dias · 27/04 a 03/05/2026",
      "periodo_anterior": "vs 7 dias anteriores (20/04 a 26/04)",
      "investimento": 2850,
      "leads": 287,
      "mqls": 156,
      "agendamentos": 89,
      "vendas": 6,
      "receita": 75000,
      "cpl": 9.93,
      "cpmql": 18.27,
      "deltas": {
        "investimento": 12,
        "leads": 15,
        "mqls": 18,
        "agendamentos": 9,
        "vendas": 50,
        "receita": 50,
        "cpl": -3,
        "cpmql": -8
      },
      "destaque": "Vendas dobraram nos últimos 7 dias (3 → 6) com aumento moderado de investimento (+12%). ROAS subiu de 16x pra 26x.",
      "atencao": null
    },
    "mes_ate_ontem": {
      "label": "Mês até ontem · 01/05 a 03/05/2026 (3 dias)",
      "periodo_anterior": "vs mesmos 3 dias de abril",
      "investimento": 985,
      "leads": 121,
      "mqls": 64,
      "agendamentos": 38,
      "vendas": 1,
      "receita": 12500,
      "cpl": 8.14,
      "cpmql": 15.39,
      "deltas": {
        "investimento": 8,
        "leads": 10,
        "mqls": 12,
        "agendamentos": 5,
        "vendas": 0,
        "receita": 0,
        "cpl": -2,
        "cpmql": -2
      },
      "destaque": "Início do mês mantendo ritmo de qualificação acima da meta (53% L→M vs 48% planejado). 1 venda registrada — comum para primeiros 3 dias.",
      "atencao": "Ritmo de leads em 40/dia — meta exige 130/dia · gap de 90 leads/dia precisa ser fechado nas próximas 2 semanas."
    }
  }
};


/** Próximos passos do portal: marcos, pendências do cliente e agenda. */
export const PROXIMOS_PASSOS = {
  "marcos_mes": [
    {
      "titulo": "Atingir R$ 100k de receita",
      "prazo": "31/05",
      "status": "em-progresso",
      "detalhe": "R$ 13k realizados · 13% · pace exige aceleração nos próximos 14 dias"
    },
    {
      "titulo": "Validar 3 dos 6 testes do plano",
      "prazo": "20/05",
      "status": "em-progresso",
      "detalhe": "1 validado (AD262 refresh) · 2 rodando · 3 agendados"
    },
    {
      "titulo": "Treinamento comercial de objeção de preço",
      "prazo": "06/05",
      "status": "agendado",
      "detalhe": "Mickael + Camila · 90min · foco no padrão \"vou pensar\""
    },
    {
      "titulo": "Decidir entrada do Google Ads como canal",
      "prazo": "14/05",
      "status": "pendente",
      "detalhe": "Aguardando aprovação do investimento adicional · diversifica risco de saturação"
    }
  ],
  "pendencias_cliente": [
    {
      "item": "Aprovar 3 criativos novos do formato Imperial",
      "prazo": "06/05",
      "urgencia": "alta",
      "detalhe": "Ganchos novos prontos no Drive · sua aprovação destrava produção dos finais"
    },
    {
      "item": "Confirmar disponibilidade da Bia pra reunião 09/05",
      "prazo": "07/05",
      "urgencia": "media",
      "detalhe": "Reunião de validação dos resultados do teste Imperial · 60min"
    },
    {
      "item": "Enviar depoimento em vídeo de cliente fechado",
      "prazo": "Sem prazo · quando puder",
      "urgencia": "baixa",
      "detalhe": "Pra usar como prova social nos novos criativos · 60-90s gravado no celular já basta"
    }
  ],
  "proximas_reunioes": [
    {
      "data": "06/05 · terça",
      "horario": "14:00",
      "titulo": "Treinamento comercial · objeção de preço",
      "participantes": "Mickael · Camila · Time comercial",
      "tipo": "treinamento"
    },
    {
      "data": "09/05 · sexta",
      "horario": "10:00",
      "titulo": "Validação do teste Imperial",
      "participantes": "Mickael · Bia · Higor",
      "tipo": "estrategica"
    },
    {
      "data": "13/05 · terça",
      "horario": "15:00",
      "titulo": "Reunião semanal de status",
      "participantes": "Mickael · todos os times",
      "tipo": "recorrente"
    },
    {
      "data": "14/05 · quarta",
      "horario": "11:00",
      "titulo": "Decisão · Google Ads como canal",
      "participantes": "Mickael · Pablo · Bia",
      "tipo": "estrategica"
    }
  ]
};

/** Verba do cliente no mês — o portal mostra saldo, não só gasto. */
export const ORCAMENTO_CLIENTE = {
  "tipo": "pos-pago",
  "verba_mensal": 12000,
  "saldo_prepago": 0,
  "hoje": "2026-05-08",
  "dias_decorridos": 8,
  "dias_mes": 31,
  "gasto_mtd": 1560
};
