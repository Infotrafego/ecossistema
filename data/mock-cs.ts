/**
 * Central CS · Gestão de Carteira — dados mockados (Fase 6 · front-end)
 *
 * Extraídos do mockup oficial (módulo `cs`): 7 clientes com risk score,
 * touchpoints, pendências cruzadas, alertas automáticos e calendário de 15 dias.
 */

export const DADOS_CS = {
  "cs_responsavel": "Bianca (CS · Infotráfego)",
  "data_referencia": "04/05/2026",
  "kpis_carteira": {
    "total_clientes": 7,
    "saudaveis": 4,
    "atencao": 2,
    "em_risco": 1,
    "receita_carteira_mes": 568000,
    "nps_medio": 8.4,
    "renovacoes_proximas_30d": 2,
    "pendencias_abertas": 14
  },
  "clientes": [
    {
      "id": "kedma",
      "nome": "Grupo Kedma",
      "tipo": "Mentoria · Vendas Online",
      "status": "risco",
      "risk_score": 78,
      "saude_emoji": "🔴",
      "ultima_reuniao": "13/04/2026",
      "proxima_reuniao": "06/05/2026 (em 2 dias)",
      "dias_sem_touchpoint": 5,
      "nps": 6,
      "nps_anterior": 8,
      "metrica_mom": -22,
      "ata_pendente_followup": true,
      "renovacao_em": 38,
      "ticket_mensal": 8500,
      "proxima_acao": "🔴 LIGAR HOJE — métrica caiu 22%, NPS de 8 pra 6, sem mensagem há 5 dias",
      "indicadores": {
        "campanhas_ativas": 3,
        "leads_mes": 142,
        "vendas_mes": 4,
        "receita_mes": 32000
      },
      "touchpoints_recentes": [
        {
          "data": "29/04",
          "canal": "WhatsApp",
          "tipo": "Cliente perguntou sobre report mensal",
          "sentimento": "neutro"
        },
        {
          "data": "27/04",
          "canal": "Reunião",
          "tipo": "Weekly · 5 ações decididas",
          "sentimento": "neutro"
        },
        {
          "data": "21/04",
          "canal": "WhatsApp",
          "tipo": "Cliente reclamou de queda nos leads",
          "sentimento": "negativo"
        },
        {
          "data": "18/04",
          "canal": "WhatsApp",
          "tipo": "Resposta sobre criativos",
          "sentimento": "neutro"
        }
      ],
      "pendencias": {
        "nossas": [
          {
            "item": "Entregar análise de funil mensal",
            "prazo": "Vencido (3 dias)",
            "responsavel": "Mickael"
          },
          {
            "item": "Subir 3 novos criativos pra teste",
            "prazo": "06/05",
            "responsavel": "Bia"
          }
        ],
        "deles": [
          {
            "item": "Aprovar texto da nova landing",
            "prazo": "Pendente há 7 dias",
            "responsavel": "Cliente"
          }
        ]
      },
      "alertas": [
        {
          "tipo": "metrica",
          "msg": "Leads/dia caiu de 8 pra 5,5 (-31%) nos últimos 14 dias"
        },
        {
          "tipo": "engajamento",
          "msg": "Cliente sem mensagem ativa há 5 dias (média histórica: 2 dias)"
        },
        {
          "tipo": "compromisso",
          "msg": "Análise mensal vencida há 3 dias — provavelmente o gatilho da queda de NPS"
        }
      ]
    },
    {
      "id": "giulia",
      "nome": "Giulia Molinari",
      "tipo": "Mentoria · Publicação Internacional",
      "status": "atencao",
      "risk_score": 52,
      "saude_emoji": "🟡",
      "ultima_reuniao": "29/04/2026",
      "proxima_reuniao": "06/05/2026 (em 2 dias)",
      "dias_sem_touchpoint": 1,
      "nps": 8,
      "nps_anterior": 9,
      "metrica_mom": -8,
      "ata_pendente_followup": false,
      "renovacao_em": 92,
      "ticket_mensal": 12000,
      "proxima_acao": "🟡 Acompanhar reposicionamento da oferta · próxima reunião 06/05",
      "indicadores": {
        "campanhas_ativas": 4,
        "leads_mes": 287,
        "vendas_mes": 8,
        "receita_mes": 96000
      },
      "touchpoints_recentes": [
        {
          "data": "03/05",
          "canal": "WhatsApp",
          "tipo": "Carolina (CS) confirmou agenda 06/05",
          "sentimento": "positivo"
        },
        {
          "data": "29/04",
          "canal": "Reunião",
          "tipo": "Weekly · decisão de mudar foco da oferta",
          "sentimento": "positivo"
        },
        {
          "data": "26/04",
          "canal": "WhatsApp",
          "tipo": "Cliente compartilhou case de cliente premium",
          "sentimento": "positivo"
        }
      ],
      "pendencias": {
        "nossas": [
          {
            "item": "Criar nova landing com foco em best-seller Amazon",
            "prazo": "10/05",
            "responsavel": "Time criativo"
          },
          {
            "item": "Mapear novos perfis de público (creators)",
            "prazo": "08/05",
            "responsavel": "Shayna"
          }
        ],
        "deles": [
          {
            "item": "Aprovar nova mensagem da campanha",
            "prazo": "06/05 (na reunião)",
            "responsavel": "Cliente"
          }
        ]
      },
      "alertas": [
        {
          "tipo": "estrategia",
          "msg": "Reposicionamento aprovado em 29/04 · primeira semana de transição"
        }
      ]
    },
    {
      "id": "stella",
      "nome": "Stella Santini",
      "tipo": "Estética · Cursos",
      "status": "atencao",
      "risk_score": 45,
      "saude_emoji": "🟡",
      "ultima_reuniao": "23/03/2026",
      "proxima_reuniao": "Não agendada",
      "dias_sem_touchpoint": 12,
      "nps": 7,
      "nps_anterior": 7,
      "metrica_mom": 5,
      "ata_pendente_followup": true,
      "renovacao_em": 18,
      "ticket_mensal": 6500,
      "proxima_acao": "🟡 AGENDAR REUNIÃO — última foi 23/03 (43 dias) · renovação em 18 dias",
      "indicadores": {
        "campanhas_ativas": 2,
        "leads_mes": 89,
        "vendas_mes": 3,
        "receita_mes": 19500
      },
      "touchpoints_recentes": [
        {
          "data": "22/04",
          "canal": "WhatsApp",
          "tipo": "CS perguntou se está tudo bem",
          "sentimento": "neutro"
        },
        {
          "data": "23/03",
          "canal": "Reunião",
          "tipo": "Última weekly · 6 ações decididas",
          "sentimento": "positivo"
        }
      ],
      "pendencias": {
        "nossas": [
          {
            "item": "Reagendar weekly",
            "prazo": "Hoje",
            "responsavel": "Bianca (CS)"
          },
          {
            "item": "Preparar pauta de renovação",
            "prazo": "15/05",
            "responsavel": "Mickael"
          }
        ],
        "deles": []
      },
      "alertas": [
        {
          "tipo": "engajamento",
          "msg": "12 dias sem touchpoint · padrão pre-churn detectado"
        },
        {
          "tipo": "renovacao",
          "msg": "Contrato vence em 18 dias · sem conversa de renovação ainda"
        }
      ]
    },
    {
      "id": "carv",
      "nome": "Carv Group",
      "tipo": "MLC · Aceleração de Receita",
      "status": "saudavel",
      "risk_score": 18,
      "saude_emoji": "🟢",
      "ultima_reuniao": "29/04/2026",
      "proxima_reuniao": "06/05/2026 (em 2 dias)",
      "dias_sem_touchpoint": 1,
      "nps": 9,
      "nps_anterior": 9,
      "metrica_mom": 12,
      "ata_pendente_followup": false,
      "renovacao_em": 156,
      "ticket_mensal": 18500,
      "proxima_acao": "🟢 Validar formato Imperial · acompanhar teste em curso",
      "indicadores": {
        "campanhas_ativas": 5,
        "leads_mes": 487,
        "vendas_mes": 14,
        "receita_mes": 175000
      },
      "touchpoints_recentes": [
        {
          "data": "03/05",
          "canal": "WhatsApp",
          "tipo": "Compartilhou prévia do criativo Imperial",
          "sentimento": "positivo"
        },
        {
          "data": "29/04",
          "canal": "Reunião",
          "tipo": "Weekly · 5 decisões · todas em andamento",
          "sentimento": "positivo"
        },
        {
          "data": "26/04",
          "canal": "WhatsApp",
          "tipo": "Aprovação dos novos criativos",
          "sentimento": "positivo"
        },
        {
          "data": "23/04",
          "canal": "Ligação",
          "tipo": "Discussão estratégica sobre escala",
          "sentimento": "positivo"
        }
      ],
      "pendencias": {
        "nossas": [
          {
            "item": "Acelerar teste Imperial (3 ganchos)",
            "prazo": "06/05",
            "responsavel": "Bia"
          },
          {
            "item": "Apresentar plano Google Ads",
            "prazo": "13/05",
            "responsavel": "Pablo"
          }
        ],
        "deles": [
          {
            "item": "Confirmar nome de novo lugar pra calls em espanhol",
            "prazo": "08/05",
            "responsavel": "Cliente"
          }
        ]
      },
      "alertas": []
    },
    {
      "id": "cristina",
      "nome": "Cristina Florentino",
      "tipo": "Curso · Marketing",
      "status": "saudavel",
      "risk_score": 22,
      "saude_emoji": "🟢",
      "ultima_reuniao": "13/04/2026",
      "proxima_reuniao": "11/05/2026",
      "dias_sem_touchpoint": 3,
      "nps": 9,
      "nps_anterior": 8,
      "metrica_mom": 18,
      "ata_pendente_followup": false,
      "renovacao_em": 67,
      "ticket_mensal": 9500,
      "proxima_acao": "🟢 Manter ritmo · cliente subindo NPS · pronta pra upsell",
      "indicadores": {
        "campanhas_ativas": 3,
        "leads_mes": 198,
        "vendas_mes": 9,
        "receita_mes": 81000
      },
      "touchpoints_recentes": [
        {
          "data": "01/05",
          "canal": "WhatsApp",
          "tipo": "Cliente elogiou novo criativo",
          "sentimento": "positivo"
        },
        {
          "data": "13/04",
          "canal": "Reunião",
          "tipo": "Weekly · NPS subiu de 8 pra 9",
          "sentimento": "positivo"
        }
      ],
      "pendencias": {
        "nossas": [
          {
            "item": "Preparar proposta de upsell (módulo VIP)",
            "prazo": "11/05",
            "responsavel": "Mickael"
          }
        ],
        "deles": []
      },
      "alertas": [
        {
          "tipo": "oportunidade",
          "msg": "🚀 NPS subiu · candidata forte pra upsell na próxima reunião"
        }
      ]
    },
    {
      "id": "paula",
      "nome": "Paula Eskinazi",
      "tipo": "Coaching · Performance",
      "status": "saudavel",
      "risk_score": 28,
      "saude_emoji": "🟢",
      "ultima_reuniao": "10/04/2026",
      "proxima_reuniao": "08/05/2026",
      "dias_sem_touchpoint": 4,
      "nps": 8,
      "nps_anterior": 8,
      "metrica_mom": 7,
      "ata_pendente_followup": false,
      "renovacao_em": 88,
      "ticket_mensal": 7500,
      "proxima_acao": "🟢 Acompanhamento normal · próxima reunião 08/05",
      "indicadores": {
        "campanhas_ativas": 2,
        "leads_mes": 124,
        "vendas_mes": 5,
        "receita_mes": 37500
      },
      "touchpoints_recentes": [
        {
          "data": "30/04",
          "canal": "WhatsApp",
          "tipo": "Aprovação de nova copy",
          "sentimento": "positivo"
        },
        {
          "data": "10/04",
          "canal": "Reunião",
          "tipo": "Weekly · 4 ações decididas",
          "sentimento": "neutro"
        }
      ],
      "pendencias": {
        "nossas": [
          {
            "item": "Análise de criativos Q1",
            "prazo": "08/05",
            "responsavel": "Shayna"
          }
        ],
        "deles": []
      },
      "alertas": []
    },
    {
      "id": "alex",
      "nome": "Alex Pinz",
      "tipo": "Curso · Gastronomia",
      "status": "saudavel",
      "risk_score": 31,
      "saude_emoji": "🟢",
      "ultima_reuniao": "02/04/2026",
      "proxima_reuniao": "07/05/2026",
      "dias_sem_touchpoint": 6,
      "nps": 8,
      "nps_anterior": 8,
      "metrica_mom": 3,
      "ata_pendente_followup": false,
      "renovacao_em": 121,
      "ticket_mensal": 5500,
      "proxima_acao": "🟢 Weekly amanhã · revisar pauta na manhã",
      "indicadores": {
        "campanhas_ativas": 2,
        "leads_mes": 95,
        "vendas_mes": 3,
        "receita_mes": 27000
      },
      "touchpoints_recentes": [
        {
          "data": "28/04",
          "canal": "WhatsApp",
          "tipo": "Cliente perguntou sobre relatório semanal",
          "sentimento": "neutro"
        },
        {
          "data": "02/04",
          "canal": "Reunião",
          "tipo": "Weekly · ata KEDM consolidada",
          "sentimento": "positivo"
        }
      ],
      "pendencias": {
        "nossas": [
          {
            "item": "Enviar relatório semanal",
            "prazo": "Hoje 18h",
            "responsavel": "Bianca (CS)"
          }
        ],
        "deles": []
      },
      "alertas": [
        {
          "tipo": "rotina",
          "msg": "Ritmo de touchpoint normal · sem sinais de risco"
        }
      ]
    }
  ],
  "alertas_globais": [
    {
      "prioridade": "alta",
      "cliente": "Grupo Kedma",
      "padrao": "Métrica caindo + NPS descendo + 5 dias sem mensagem + análise vencida",
      "sugestao": "🔴 LIGAR HOJE · não esperar reunião de 06/05 · risco real de churn",
      "fonte": "automatico"
    },
    {
      "prioridade": "alta",
      "cliente": "Stella Santini",
      "padrao": "12 dias sem touchpoint + renovação em 18 dias sem conversa iniciada",
      "sugestao": "🔴 Agendar reunião + iniciar conversa de renovação esta semana",
      "fonte": "automatico"
    },
    {
      "prioridade": "media",
      "cliente": "Grupo Kedma",
      "padrao": "Análise de funil mensal vencida há 3 dias · prometida no contrato",
      "sugestao": "Entregar até final do dia · CS já pode comunicar pro cliente que está vindo",
      "fonte": "automatico"
    },
    {
      "prioridade": "media",
      "cliente": "Cristina Florentino",
      "padrao": "NPS subiu de 8 pra 9 + métrica subindo + perto de renovação",
      "sugestao": "🚀 OPORTUNIDADE · preparar proposta de upsell pra reunião de 11/05",
      "fonte": "automatico"
    },
    {
      "prioridade": "baixa",
      "cliente": "Carv Group",
      "padrao": "Cliente sugeriu nome de espaço pra calls em espanhol · sem retorno nosso",
      "sugestao": "Confirmar agendamento da call de espanhol até 08/05",
      "fonte": "manual"
    }
  ],
  "calendario_proximos_15d": [
    {
      "data": "06/05/2026",
      "tipo": "reuniao",
      "cliente": "Carv Group",
      "horario": "14h",
      "status": "confirmada"
    },
    {
      "data": "06/05/2026",
      "tipo": "reuniao",
      "cliente": "Giulia Molinari",
      "horario": "10h",
      "status": "confirmada"
    },
    {
      "data": "06/05/2026",
      "tipo": "reuniao",
      "cliente": "Grupo Kedma",
      "horario": "16h",
      "status": "confirmada (CRÍTICA)"
    },
    {
      "data": "07/05/2026",
      "tipo": "reuniao",
      "cliente": "Alex Pinz",
      "horario": "11h",
      "status": "confirmada"
    },
    {
      "data": "08/05/2026",
      "tipo": "deadline",
      "cliente": "Paula Eskinazi",
      "descricao": "Análise criativos Q1"
    },
    {
      "data": "08/05/2026",
      "tipo": "reuniao",
      "cliente": "Paula Eskinazi",
      "horario": "15h",
      "status": "confirmada"
    },
    {
      "data": "10/05/2026",
      "tipo": "deadline",
      "cliente": "Giulia Molinari",
      "descricao": "Nova landing best-seller"
    },
    {
      "data": "11/05/2026",
      "tipo": "reuniao",
      "cliente": "Cristina Florentino",
      "horario": "10h",
      "status": "confirmada (UPSELL)"
    },
    {
      "data": "13/05/2026",
      "tipo": "deadline",
      "cliente": "Carv Group",
      "descricao": "Plano Google Ads"
    },
    {
      "data": "15/05/2026",
      "tipo": "deadline",
      "cliente": "Stella Santini",
      "descricao": "Pauta de renovação"
    },
    {
      "data": "22/05/2026",
      "tipo": "renovacao",
      "cliente": "Stella Santini",
      "descricao": "🔴 RENOVAÇÃO · contrato vence"
    },
    {
      "data": "13/06/2026",
      "tipo": "renovacao",
      "cliente": "Grupo Kedma",
      "descricao": "Renovação · contrato vence"
    }
  ]
};

