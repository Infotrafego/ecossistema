/**
 * Comercial Consultivo — dados mockados (Fase 5 · front-end)
 *
 * Extraídos do mockup oficial `docs/mockups/app-unificado-v1.5-COMPLETO.html`
 * (módulo `cc`). Cliente e números são fictícios: a tela existe pra validar
 * layout e navegação antes de plugar CRM/telefonia.
 */

export const DADOS_COMERCIAL = {
  "cliente": "Cliente Beta · Mentoria Premium",
  "periodo": "Fev/2026 a Abr/2026",
  "kpis": {
    "calls_realizadas": 127,
    "calls_agendadas": 187,
    "show_rate": 67.9,
    "close_rate": 22,
    "vendas": 28,
    "receita": 350000,
    "ticket_medio": 12500,
    "ciclo_medio_dias": 8.4
  },
  "kpis_prev": {
    "calls_realizadas": 109,
    "calls_agendadas": 174,
    "show_rate": 62.6,
    "close_rate": 18.3,
    "vendas": 20,
    "receita": 260000,
    "ticket_medio": 13000,
    "ciclo_medio_dias": 9.7
  },
  "team": {
    "sdrs": [
      {
        "nome": "Carolina Vieira",
        "origem": "cliente",
        "calls": 38,
        "qual_rate": 71,
        "show_rate": 75,
        "rank": 1,
        "obs": "Mais consistente · qualificação forte"
      },
      {
        "nome": "Roberta Lima",
        "origem": "cliente",
        "calls": 31,
        "qual_rate": 65,
        "show_rate": 70,
        "rank": 2,
        "obs": "Boa em criar urgência no agendamento"
      },
      {
        "nome": "Mariana Santos",
        "origem": "cliente",
        "calls": 27,
        "qual_rate": 58,
        "show_rate": 64,
        "rank": 3,
        "obs": "Velocidade ok mas peca na qualificação"
      },
      {
        "nome": "Lucas Ferreira",
        "origem": "cliente",
        "calls": 22,
        "qual_rate": 41,
        "show_rate": 49,
        "rank": 6,
        "obs": "🔴 Discovery fraco · 51% no-show das calls dele"
      },
      {
        "nome": "Felipe Costa",
        "origem": "infotrafego",
        "calls": 18,
        "qual_rate": 78,
        "show_rate": 81,
        "rank": 4,
        "obs": "Operação Infotráfego · benchmark interno"
      },
      {
        "nome": "Bruno Almeida",
        "origem": "infotrafego",
        "calls": 14,
        "qual_rate": 73,
        "show_rate": 76,
        "rank": 5,
        "obs": "Operação Infotráfego · em rampagem"
      }
    ],
    "closers": [
      {
        "nome": "Juliana Reis",
        "origem": "cliente",
        "calls": 36,
        "vendas": 12,
        "close_rate": 33.3,
        "ticket_medio": 13800,
        "rank": 1,
        "obs": "🟢 Top performer · maestria em quebra de objeção de preço"
      },
      {
        "nome": "Pedro Henrique",
        "origem": "cliente",
        "calls": 41,
        "vendas": 9,
        "close_rate": 22,
        "ticket_medio": 12000,
        "rank": 2,
        "obs": "Líder · sólido em discovery, perde fechamento"
      },
      {
        "nome": "Camila Rocha",
        "origem": "cliente",
        "calls": 28,
        "vendas": 5,
        "close_rate": 17.9,
        "ticket_medio": 12200,
        "rank": 3,
        "obs": "🟡 Calls com 53min de média (meta 35) · prolixa"
      },
      {
        "nome": "André Nogueira",
        "origem": "cliente",
        "calls": 22,
        "vendas": 2,
        "close_rate": 9.1,
        "ticket_medio": 11000,
        "rank": 4,
        "obs": "🔴 Júnior · deixa preço pra última hora · 80% das perdidas têm 'vou pensar'"
      }
    ]
  },
  "calls": [
    {
      "id": "C-127",
      "data": "29/04/2026",
      "lead": "Empresa Alpha · CEO",
      "sdr": "Carolina Vieira",
      "closer": "Juliana Reis",
      "duracao": 38,
      "status": "ganha",
      "valor": 14000,
      "objecoes": [
        "preço"
      ],
      "frase_chave": "fechou após Juliana mostrar ROI de mentoria anterior",
      "score": 92,
      "detalhe": {
        "resumo": "Empresa Alpha (CEO, 38 anos, B2B SaaS de logistica). Lead morno trazido pela Carolina apos discovery cuidadoso. Juliana reconheceu padrao (cliente igual ao Cliente Y) e usou caso de sucesso pra fechar com upsell.",
        "talk_ratio": {
          "closer": 38,
          "lead": 50,
          "sdr": 12
        },
        "origem_lead": {
          "criativo": "AD262_VID_CansouDeSofrer",
          "publico": "LAL2%LeadsMQL",
          "campanha": "CADASTRO_CAPTACAO_TESTE"
        },
        "script": [
          {
            "fase": "Discovery (0-10min)",
            "highlight": false,
            "texto": "Carolina ja tinha qualificado bem: orcamento 15-20k, timing 'agora', autoridade do CEO. Juliana confirmou em 8min e foi direto pro pitch."
          },
          {
            "fase": "Pitch (10-22min)",
            "highlight": false,
            "texto": "Apresentou mentoria conectando com a dor declarada. Usou case da Empresa Y (similar) com numeros: 'em 6 meses ela saiu de R$80k pra R$340k receita mensal'."
          },
          {
            "fase": "Objecao (22-26min)",
            "highlight": true,
            "texto": "Lead: 'achei que ia ser mais barato'. Juliana respondeu em 12s: 'Entendo. Posso te mostrar o que esse investimento gerou pra Empresa Y nos primeiros 6 meses?' — Lead aceitou ver. Objecao quebrada em 3 minutos."
          },
          {
            "fase": "Fechamento (26-38min)",
            "highlight": true,
            "texto": "Ofereceu parcelamento 12x + bonus de implementacao acelerada se assinasse ate sexta. Apresentou contrato simplificado. Lead assinou na call."
          }
        ],
        "frases_chave": [
          {
            "momento": "min 24",
            "tipo": "vencedora",
            "texto": "Posso te mostrar o que esse investimento gerou pra cliente similar?"
          },
          {
            "momento": "min 33",
            "tipo": "vencedora",
            "texto": "Implementacao acelerada se assinar ate sexta-feira"
          }
        ],
        "porque_ganhou": "Discovery solido da Carolina + Juliana reconheceu padrao e usou case especifico. Tempo otimo de objecao (apareceu cedo, foi tratada rapido). Urgencia criada com bonus de tempo, nao desconto."
      }
    },
    {
      "id": "C-126",
      "data": "29/04/2026",
      "lead": "Studio Bravo · Founder",
      "sdr": "Roberta Lima",
      "closer": "Pedro Henrique",
      "duracao": 42,
      "status": "perdida",
      "valor": 0,
      "objecoes": [
        "timing",
        "autoridade"
      ],
      "frase_chave": "lead disse 'preciso falar com sócia' · sem follow-up agendado",
      "score": 58,
      "detalhe": {
        "resumo": "Studio Bravo (Founder, 28 anos, agencia digital). Lead qualificado pela Roberta. Pedro (closer #2 do time) fez call boa mas perdeu por nao tratar bem a objecao 'preciso falar com socia'.",
        "talk_ratio": {
          "closer": 44,
          "lead": 46,
          "sdr": 10
        },
        "origem_lead": {
          "criativo": "AD225_VID_BuildingComoEsse",
          "publico": "00_AUTO_F_LAL1",
          "campanha": "CADASTRO_CAPTACAO_TESTE"
        },
        "script": [
          {
            "fase": "Discovery (0-13min)",
            "highlight": false,
            "texto": "Roberta tinha qualificado bem. Pedro confirmou BANT, lead estava engajado."
          },
          {
            "fase": "Pitch (13-28min)",
            "highlight": false,
            "texto": "Apresentacao solida. Pedro usou case de cliente similar, deu numeros. Lead reagiu positivamente."
          },
          {
            "fase": "Objecao (28-38min)",
            "highlight": true,
            "texto": "🟡 Lead: 'preciso falar com minha socia, nao posso decidir sozinho'. Pedro aceitou de cara — 'tudo bem, me retorne'. Nao tentou agenda condicional, nao incluiu socia em nova call."
          },
          {
            "fase": "Fechamento (38-42min)",
            "highlight": true,
            "texto": "🔴 Encerrou sem proximo passo concreto. Lead ficou de retornar 'em alguns dias'. Sem follow-up automatico, esfriou."
          }
        ],
        "frases_chave": [
          {
            "momento": "min 30",
            "tipo": "neutra",
            "texto": "Tudo bem, me retorne quando tiver alinhado"
          },
          {
            "momento": "min 41",
            "tipo": "perdedora",
            "texto": "Sem problemas, fica a vontade pra decidir"
          }
        ],
        "porque_perdeu": "Pedro perde 60% das calls que terminam em 'preciso falar com socio/a'. Nao usa tecnica de agenda condicional (que Juliana usa em 89% desses casos). Recomendacao especifica: treinar Pedro nessa abordagem."
      }
    },
    {
      "id": "C-125",
      "data": "28/04/2026",
      "lead": "Charlie Inc · Marketing",
      "sdr": "Carolina Vieira",
      "closer": "Juliana Reis",
      "duracao": 35,
      "status": "ganha",
      "valor": 12500,
      "objecoes": [
        "preço"
      ],
      "frase_chave": "Juliana parcelou em 12x · lead aceitou na hora",
      "score": 88,
      "detalhe": {
        "resumo": "Call ganha com Charlie Inc · Marketing. Juliana parcelou em 12x · lead aceitou na hora",
        "talk_ratio": {
          "closer": 55,
          "lead": 35,
          "sdr": 10
        },
        "origem_lead": {
          "criativo": "—",
          "publico": "—",
          "campanha": "—"
        },
        "script": [
          {
            "fase": "Detalhes completos disponíveis na V1 produção",
            "highlight": false,
            "texto": "Esta call não foi processada com detalhe completo no MVP. Quando a V1 estiver em produção, todas as calls têm transcrição estruturada, frases-chave grifadas e análise por fase."
          }
        ],
        "frases_chave": [],
        "porque_ganhou": "Juliana parcelou em 12x · lead aceitou na hora"
      }
    },
    {
      "id": "C-124",
      "data": "28/04/2026",
      "lead": "Delta Group · COO",
      "sdr": "Mariana Santos",
      "closer": "Camila Rocha",
      "duracao": 67,
      "status": "perdida",
      "valor": 0,
      "objecoes": [
        "necessidade",
        "preço"
      ],
      "frase_chave": "call durou 67min · lead saiu sem decisão · 'vou pensar'",
      "score": 41,
      "detalhe": {
        "resumo": "Call perdida com Delta Group · COO. call durou 67min · lead saiu sem decisão · 'vou pensar'",
        "talk_ratio": {
          "closer": 55,
          "lead": 35,
          "sdr": 10
        },
        "origem_lead": {
          "criativo": "—",
          "publico": "—",
          "campanha": "—"
        },
        "script": [
          {
            "fase": "Detalhes completos disponíveis na V1 produção",
            "highlight": false,
            "texto": "Esta call não foi processada com detalhe completo no MVP. Quando a V1 estiver em produção, todas as calls têm transcrição estruturada, frases-chave grifadas e análise por fase."
          }
        ],
        "frases_chave": [],
        "porque_perdeu": "call durou 67min · lead saiu sem decisão · 'vou pensar'"
      }
    },
    {
      "id": "C-123",
      "data": "27/04/2026",
      "lead": "Echo Solutions · CEO",
      "sdr": "Roberta Lima",
      "closer": "Pedro Henrique",
      "duracao": 39,
      "status": "ganha",
      "valor": 12000,
      "objecoes": [
        "timing"
      ],
      "frase_chave": "Pedro criou urgência com bonus de implementação",
      "score": 86,
      "detalhe": {
        "resumo": "Call ganha com Echo Solutions · CEO. Pedro criou urgência com bonus de implementação",
        "talk_ratio": {
          "closer": 55,
          "lead": 35,
          "sdr": 10
        },
        "origem_lead": {
          "criativo": "—",
          "publico": "—",
          "campanha": "—"
        },
        "script": [
          {
            "fase": "Detalhes completos disponíveis na V1 produção",
            "highlight": false,
            "texto": "Esta call não foi processada com detalhe completo no MVP. Quando a V1 estiver em produção, todas as calls têm transcrição estruturada, frases-chave grifadas e análise por fase."
          }
        ],
        "frases_chave": [],
        "porque_ganhou": "Pedro criou urgência com bonus de implementação"
      }
    },
    {
      "id": "C-122",
      "data": "26/04/2026",
      "lead": "Foxtrot · Sócio",
      "sdr": "Lucas Ferreira",
      "closer": "André Nogueira",
      "duracao": 28,
      "status": "no-show",
      "valor": 0,
      "objecoes": [],
      "frase_chave": "lead não compareceu · 3a no-show da Lucas no mês",
      "score": 0,
      "detalhe": {
        "resumo": "Call no-show com Foxtrot · Sócio. lead não compareceu · 3a no-show da Lucas no mês",
        "talk_ratio": {
          "closer": 55,
          "lead": 35,
          "sdr": 10
        },
        "origem_lead": {
          "criativo": "—",
          "publico": "—",
          "campanha": "—"
        },
        "script": [
          {
            "fase": "Detalhes completos disponíveis na V1 produção",
            "highlight": false,
            "texto": "Esta call não foi processada com detalhe completo no MVP. Quando a V1 estiver em produção, todas as calls têm transcrição estruturada, frases-chave grifadas e análise por fase."
          }
        ],
        "frases_chave": [],
        "porque_perdeu": "lead não compareceu · 3a no-show da Lucas no mês"
      }
    },
    {
      "id": "C-121",
      "data": "26/04/2026",
      "lead": "Golf Ventures · CEO",
      "sdr": "Carolina Vieira",
      "closer": "Juliana Reis",
      "duracao": 41,
      "status": "ganha",
      "valor": 15500,
      "objecoes": [
        "preço",
        "autoridade"
      ],
      "frase_chave": "ticket acima da média · upsell aceito (mentoria + acelerador)",
      "score": 95,
      "detalhe": {
        "resumo": "Golf Ventures (CEO de holding com 3 negocios). Lead premium qualificado pela Carolina. Juliana fez discovery aprofundada, identificou multiplas dores e fechou com ticket 24% acima da media.",
        "talk_ratio": {
          "closer": 41,
          "lead": 48,
          "sdr": 11
        },
        "origem_lead": {
          "criativo": "AD262_VID_CansouDeSofrer",
          "publico": "LAL1%LeadsMQL_alto",
          "campanha": "CADASTRO_PREMIUM"
        },
        "script": [
          {
            "fase": "Discovery (0-15min)",
            "highlight": false,
            "texto": "Juliana fez discovery aprofundada. Lead falou de 3 negocios e dores diferentes. Identificou que precisava de algo alem da mentoria padrao."
          },
          {
            "fase": "Pitch (15-28min)",
            "highlight": false,
            "texto": "Em vez de pitch padrao, Juliana propos pacote 'mentoria + acelerador' personalizado. Tickket 50% acima."
          },
          {
            "fase": "Objecao (28-35min)",
            "highlight": true,
            "texto": "Lead: 'preciso falar com socio'. Juliana usou tecnica de 'agenda condicional': 'vou marcar o kickoff pra terca pressupondo aprovacao do socio. Se ele nao aprovar, cancelamos sem custo'."
          },
          {
            "fase": "Fechamento (35-41min)",
            "highlight": true,
            "texto": "Lead aceitou agenda condicional. Pagou metade na call, metade apos aprovacao do socio. Fechou em R$15.500 (vs ticket medio R$12.500)."
          }
        ],
        "frases_chave": [
          {
            "momento": "min 18",
            "tipo": "vencedora",
            "texto": "Vou propor algo diferente — pacote dedicado pras tres frentes"
          },
          {
            "momento": "min 32",
            "tipo": "vencedora",
            "texto": "Agenda condicional: marcamos pressupondo aprovacao, e cancelamos sem custo se nao rolar"
          }
        ],
        "porque_ganhou": "Juliana detectou perfil acima da media na discovery e adaptou oferta. Quebrou objecao 'falar com socio' (que normalmente perde) com tecnica de agenda condicional. Resultado: ticket 24% acima da media + 0 atrito."
      }
    },
    {
      "id": "C-120",
      "data": "25/04/2026",
      "lead": "Hotel Dynamics · Diretora",
      "sdr": "Mariana Santos",
      "closer": "Camila Rocha",
      "duracao": 58,
      "status": "perdida",
      "valor": 0,
      "objecoes": [
        "preço"
      ],
      "frase_chave": "Camila não tratou objeção de preço até min 50 · perdeu o tempo",
      "score": 36,
      "detalhe": {
        "resumo": "Hotel Dynamics (Diretora, B2B turismo). Lead bem qualificado pela Mariana, mas Camila perdeu na execucao da call: durou 58min, preco apareceu no min 50 e nao soube responder objecao.",
        "talk_ratio": {
          "closer": 64,
          "lead": 28,
          "sdr": 8
        },
        "origem_lead": {
          "criativo": "AD263_VID_ASPIRAR",
          "publico": "LAL2%LeadsMQL",
          "campanha": "CADASTRO_CAPTACAO_TESTE"
        },
        "script": [
          {
            "fase": "Discovery (0-12min)",
            "highlight": false,
            "texto": "Comecou bem. Mariana ja tinha qualificado, Camila confirmou BANT em 12min."
          },
          {
            "fase": "Pitch (12-50min)",
            "highlight": true,
            "texto": "🟡 38 minutos de pitch. Camila explicou tudo em detalhes — modulos, metodologia, materiais, comunidade. Lead foi perdendo o foco. Sem check-ins."
          },
          {
            "fase": "Objecao (50-55min)",
            "highlight": true,
            "texto": "🔴 Preco aparece somente min 50. Lead: 'tah caro pro momento'. Camila tentou criar urgencia mas errou: 'a gente ta com promocao' (sinal de fraqueza). Nao usou ROI."
          },
          {
            "fase": "Fechamento (55-58min)",
            "highlight": true,
            "texto": "🔴 Lead pediu 'mandar proposta por email'. Camila aceitou (deveria ter feito mais 1 tentativa). Follow-up nao agendado, lead esfriou."
          }
        ],
        "frases_chave": [
          {
            "momento": "min 51",
            "tipo": "perdedora",
            "texto": "A gente ta com uma promocao especial..."
          },
          {
            "momento": "min 55",
            "tipo": "perdedora",
            "texto": "Tudo bem, posso te mandar a proposta por email"
          }
        ],
        "porque_perdeu": "Padrao classico Camila: pitch longo (58min vs meta 35), preco tarde, oferta de desconto em vez de ROI, sem follow-up agendado. 4o caso identico no mes."
      }
    },
    {
      "id": "C-119",
      "data": "24/04/2026",
      "lead": "India Tech · CTO",
      "sdr": "Felipe Costa",
      "closer": "Pedro Henrique",
      "duracao": 33,
      "status": "ganha",
      "valor": 11500,
      "objecoes": [
        "necessidade"
      ],
      "frase_chave": "Felipe (Infotráfego) qualificou bem · Pedro fechou rápido",
      "score": 84,
      "detalhe": {
        "resumo": "Call ganha com India Tech · CTO. Felipe (Infotráfego) qualificou bem · Pedro fechou rápido",
        "talk_ratio": {
          "closer": 55,
          "lead": 35,
          "sdr": 10
        },
        "origem_lead": {
          "criativo": "—",
          "publico": "—",
          "campanha": "—"
        },
        "script": [
          {
            "fase": "Detalhes completos disponíveis na V1 produção",
            "highlight": false,
            "texto": "Esta call não foi processada com detalhe completo no MVP. Quando a V1 estiver em produção, todas as calls têm transcrição estruturada, frases-chave grifadas e análise por fase."
          }
        ],
        "frases_chave": [],
        "porque_ganhou": "Felipe (Infotráfego) qualificou bem · Pedro fechou rápido"
      }
    },
    {
      "id": "C-118",
      "data": "23/04/2026",
      "lead": "Juliet Studios · Founder",
      "sdr": "Lucas Ferreira",
      "closer": "André Nogueira",
      "duracao": 45,
      "status": "perdida",
      "valor": 0,
      "objecoes": [
        "preço",
        "timing"
      ],
      "frase_chave": "André deixou preço pra final · lead disse 'vou pensar' aos 44min",
      "score": 28,
      "detalhe": {
        "resumo": "Juliet Studios (Founder, 32 anos, agencia de design). Lead frio trazido pelo Lucas com discovery superficial. Andre (junior) nao se preparou adequadamente e perdeu pelo classico 'vou pensar'.",
        "talk_ratio": {
          "closer": 71,
          "lead": 22,
          "sdr": 7
        },
        "origem_lead": {
          "criativo": "AD124_VID_ClienteRapidoD",
          "publico": "00_AUTO_F_LAL1",
          "campanha": "CADASTRO_CAPTACAO_TESTE"
        },
        "script": [
          {
            "fase": "Discovery (0-3min)",
            "highlight": true,
            "texto": "🔴 Andre pulou BANT. Nao perguntou orcamento, nao confirmou autoridade. Foi direto pro pitch achando que Lucas ja tinha qualificado."
          },
          {
            "fase": "Pitch (3-30min)",
            "highlight": true,
            "texto": "🔴 27 minutos de pitch monologo. Talk ratio dele: 71%. Lead falou pouco e perdeu interesse. Andre nao fez 'check-ins' no meio do caminho."
          },
          {
            "fase": "Objecao (30-44min)",
            "highlight": true,
            "texto": "🔴 Preco aparecu somente no minuto 30. Lead: 'tah, achei que era diferente'. Andre tentou justificar com beneficios (errou) em vez de ROI. Lead foi recuando."
          },
          {
            "fase": "Fechamento (44-45min)",
            "highlight": true,
            "texto": "🔴 Lead disse 'vou pensar' aos 44min. Andre nao tentou criar urgencia, nao agendou follow-up especifico. Encerrou com 'me chama se decidir'."
          }
        ],
        "frases_chave": [
          {
            "momento": "min 32",
            "tipo": "perdedora",
            "texto": "Eu sei que parece caro, mas tem todos esses beneficios..."
          },
          {
            "momento": "min 44",
            "tipo": "perdedora",
            "texto": "Tudo bem, me chama se decidir"
          }
        ],
        "porque_perdeu": "Tres erros sequenciais: (1) Lucas nao qualificou bem na origem, Andre nao recuperou no discovery; (2) talk ratio 71% — pitch monologo cansativo; (3) preco tarde demais (min 30) e tratamento ruim — defendeu vs redirecionou pra ROI. Padrao de 80% das perdas do Andre."
      }
    },
    {
      "id": "C-117",
      "data": "22/04/2026",
      "lead": "Kilo Co · CEO",
      "sdr": "Carolina Vieira",
      "closer": "Juliana Reis",
      "duracao": 37,
      "status": "ganha",
      "valor": 13000,
      "objecoes": [
        "timing"
      ],
      "frase_chave": "Juliana usou case de cliente similar · fechou no mesmo dia",
      "score": 90,
      "detalhe": {
        "resumo": "Call ganha com Kilo Co · CEO. Juliana usou case de cliente similar · fechou no mesmo dia",
        "talk_ratio": {
          "closer": 55,
          "lead": 35,
          "sdr": 10
        },
        "origem_lead": {
          "criativo": "—",
          "publico": "—",
          "campanha": "—"
        },
        "script": [
          {
            "fase": "Detalhes completos disponíveis na V1 produção",
            "highlight": false,
            "texto": "Esta call não foi processada com detalhe completo no MVP. Quando a V1 estiver em produção, todas as calls têm transcrição estruturada, frases-chave grifadas e análise por fase."
          }
        ],
        "frases_chave": [],
        "porque_ganhou": "Juliana usou case de cliente similar · fechou no mesmo dia"
      }
    },
    {
      "id": "C-116",
      "data": "22/04/2026",
      "lead": "Lima Group · Sócia",
      "sdr": "Roberta Lima",
      "closer": "Camila Rocha",
      "duracao": 49,
      "status": "perdida",
      "valor": 0,
      "objecoes": [
        "necessidade"
      ],
      "frase_chave": "lead achou que o programa era pra estágio mais avançado",
      "score": 52,
      "detalhe": {
        "resumo": "Call perdida com Lima Group · Sócia. lead achou que o programa era pra estágio mais avançado",
        "talk_ratio": {
          "closer": 55,
          "lead": 35,
          "sdr": 10
        },
        "origem_lead": {
          "criativo": "—",
          "publico": "—",
          "campanha": "—"
        },
        "script": [
          {
            "fase": "Detalhes completos disponíveis na V1 produção",
            "highlight": false,
            "texto": "Esta call não foi processada com detalhe completo no MVP. Quando a V1 estiver em produção, todas as calls têm transcrição estruturada, frases-chave grifadas e análise por fase."
          }
        ],
        "frases_chave": [],
        "porque_perdeu": "lead achou que o programa era pra estágio mais avançado"
      }
    }
  ],
  "diagnosticos": [
    {
      "id": 1,
      "severidade": "alta",
      "titulo": "Objeção de preço não tratada cedo na call",
      "descricao": "70% das calls perdidas têm objeção de preço aparecendo após o minuto 40, quando lead já está cansado. Top performer Juliana toca preço entre min 15-20.",
      "afetados": [
        "André Nogueira",
        "Camila Rocha",
        "Pedro Henrique (parcial)"
      ],
      "calls_relacionadas": 23,
      "impacto_estimado": "+8pts close rate"
    },
    {
      "id": 2,
      "severidade": "alta",
      "titulo": "Lucas Ferreira (SDR) qualifica leads frios",
      "descricao": "Calls agendadas pelo Lucas têm 51% de no-show — 2x a média do time. Discovery superficial: pula perguntas BANT de orçamento e timing.",
      "afetados": [
        "Lucas Ferreira"
      ],
      "calls_relacionadas": 11,
      "impacto_estimado": "+15 reuniões realizadas/mês"
    },
    {
      "id": 3,
      "severidade": "media",
      "titulo": "Calls Camila Rocha duram 53min médio (meta 35)",
      "descricao": "Calls longas correlacionam com perda. Camila não usa frases de fechamento progressivo ('faz sentido até aqui?'). Acaba perdendo fôlego e o lead.",
      "afetados": [
        "Camila Rocha"
      ],
      "calls_relacionadas": 28,
      "impacto_estimado": "+5pts close rate"
    },
    {
      "id": 4,
      "severidade": "media",
      "titulo": "Frase 'vou pensar' em 43% das calls perdidas",
      "descricao": "Falta de urgência criada na call. Top performer fecha com bonus por tempo (ex: implementação acelerada se assinar até X data) — replicar.",
      "afetados": [
        "André Nogueira",
        "Camila Rocha"
      ],
      "calls_relacionadas": 18,
      "impacto_estimado": "+6pts close rate"
    },
    {
      "id": 5,
      "severidade": "baixa",
      "titulo": "SDRs Infotráfego performam 12pts acima dos do cliente",
      "descricao": "Felipe e Bruno (operação Infotráfego) qualificam melhor — 75% show vs 63% médio do cliente. Oportunidade de transferir playbook pros SDRs do cliente.",
      "afetados": [
        "SDRs cliente"
      ],
      "calls_relacionadas": 91,
      "impacto_estimado": "+8pts show rate cliente"
    }
  ],
  "recomendacoes": [
    {
      "id": 1,
      "data": "15/04/2026",
      "titulo": "Treinamento de objeção de preço — discovery cedo",
      "destinatarios": "André, Camila, Pedro",
      "status": "feito",
      "impacto": "🟢 Close rate da Camila subiu de 12% pra 18% em 2 semanas · André +3pts"
    },
    {
      "id": 2,
      "data": "20/04/2026",
      "titulo": "Padronizar discovery do SDR (BANT obrigatório)",
      "destinatarios": "Todos os SDRs",
      "status": "andamento",
      "impacto": "⏳ Documento entregue · Carolina e Roberta já adotaram · Lucas resistente"
    },
    {
      "id": 3,
      "data": "25/04/2026",
      "titulo": "Refresh do playbook de fechamento — frases de urgência",
      "destinatarios": "André, Camila",
      "status": "pendente",
      "impacto": "⚪ Aguardando aceite do gestor comercial"
    },
    {
      "id": 4,
      "data": "28/04/2026",
      "titulo": "Treinar 1 SDR cliente com playbook Infotráfego",
      "destinatarios": "Lucas (1:1 com Felipe)",
      "status": "agendado",
      "impacto": "⚪ Sessão marcada pra 03/05"
    }
  ],
  "playbook": [
    {
      "cenario": "Objecao de preco",
      "freq": "38% das objeções",
      "top": [
        {
          "frase": "Posso te mostrar o que esse investimento gerou pra cliente similar?",
          "explicacao": "Redireciona pra ROI concreto · Juliana usa em 89% das objeções de preço · close rate dessas calls: 78%"
        },
        {
          "frase": "Vamos pensar de outra forma — quanto vale pra você não resolver isso nos próximos 6 meses?",
          "explicacao": "Inverte perspectiva · faz lead calcular custo de inação · usado quando ROI direto não funciona"
        }
      ],
      "bottom": [
        {
          "frase": "Eu sei que parece caro, mas...",
          "explicacao": "Valida a objeção · perde poder · André usa em 78% das suas objeções de preço · close rate dessas calls: 12%"
        },
        {
          "frase": "A gente está com promoção especial...",
          "explicacao": "Sinal de fraqueza · margem cai · Camila usa quando se sente apertada · não funciona em 92% dos casos"
        }
      ]
    },
    {
      "cenario": "Objecao de timing (não é o momento)",
      "freq": "24% das objeções",
      "top": [
        {
          "frase": "Faz total sentido. Pra eu te ajudar a decidir o melhor momento, posso te mostrar o que aconteceu com [Cliente Z] que adiou 6 meses?",
          "explicacao": "Cria custo de oportunidade com case real · Pedro usa bem · close rate: 65%"
        },
        {
          "frase": "Vamos marcar pra próxima quinzena com agenda flexível — se não rolar, cancelamos sem custo",
          "explicacao": "Agenda condicional · não fecha mas mantém aquecido · Juliana converte 40% dessas em venda futura"
        }
      ],
      "bottom": [
        {
          "frase": "Tudo bem, me chama quando estiver pronto",
          "explicacao": "Fim sem próximo passo · esfria 100% · André faz isso em 60% das objeções de timing"
        },
        {
          "frase": "Ah, sim, entendo. Quando seria melhor então?",
          "explicacao": "Aceita objeção sem trabalhar · transfere decisão · perde controle"
        }
      ]
    },
    {
      "cenario": "Objecao de autoridade (preciso falar com sócio)",
      "freq": "18% das objeções",
      "top": [
        {
          "frase": "Vamos marcar o kickoff pra terça pressupondo aprovação. Se o sócio não topar, cancelamos sem custo.",
          "explicacao": "Agenda condicional · Juliana converte 89% dessas calls · técnica que ninguém mais do time usa"
        },
        {
          "frase": "Faz sentido. Que tal a gente marcar uma call rápida com você e o sócio na sexta?",
          "explicacao": "Inclui decisor na conversa · evita telefone surdo · acelera ciclo"
        }
      ],
      "bottom": [
        {
          "frase": "Tudo bem, me retorne quando tiver alinhado",
          "explicacao": "Pedro faz isso · perde 60% dessas calls · sem próximo passo agendado"
        },
        {
          "frase": "Sem problemas, fica à vontade",
          "explicacao": "Encerra sem ação · lead esfria em 48h"
        }
      ]
    },
    {
      "cenario": "Objecao de necessidade (não vejo valor agora)",
      "freq": "12% das objeções",
      "top": [
        {
          "frase": "Faz sentido, o que precisaria mudar pra isso ser prioridade pra você?",
          "explicacao": "Pergunta de descoberta · revela trigger oculto · Pedro usa bem"
        },
        {
          "frase": "Posso te mostrar 3 sinais que clientes nossos tinham 6 meses antes de virar prioridade?",
          "explicacao": "Cria autodiagnóstico · lead se identifica · taxa de retorno: 45%"
        }
      ],
      "bottom": [
        {
          "frase": "Mas você não acha que faz sentido?",
          "explicacao": "Pressão direta · empurra lead · close rate: 8%"
        },
        {
          "frase": "Ok, deixa eu te explicar de novo os benefícios...",
          "explicacao": "Repetição de pitch · lead não escuta · perde ainda mais o interesse"
        }
      ]
    }
  ],
  "coaching": {
    "Juliana Reis": {
      "perfil": "🟢 Top performer · referência do time",
      "pontos_fortes": [
        "Maestria em quebra de objeção de preço (89% sucesso)",
        "Discovery rápida e precisa (12min médio)",
        "Criação de urgência com bonus de tempo (não desconto)",
        "Reconhecimento de perfil acima da média (upsell em 30% das calls)"
      ],
      "gaps": [
        "Pode aumentar ainda mais o ticket médio explorando upsell sistematicamente",
        "Algumas calls finalizadas sem qualificar follow-up de indicação"
      ],
      "recomendacoes": [
        {
          "acao": "Testar offering premium em todos os leads acima de R$20k orçamento declarado",
          "exemplo": "Call C-121 (Golf Ventures) — fechou 15.5k, mas perfil aceitaria 25k"
        },
        {
          "acao": "Adicionar pergunta de indicação no fechamento",
          "exemplo": "Após fechar, perguntar: 'conhece outro CEO que estaria nessa fase?' — historicamente gera 1 lead a cada 3 perguntas"
        }
      ],
      "evolucao": {
        "30d_atras": {
          "close_rate": 28,
          "talk_ratio": 42
        },
        "hoje": {
          "close_rate": 33,
          "talk_ratio": 38
        },
        "trend": "↑ subindo"
      }
    },
    "Pedro Henrique": {
      "perfil": "🟢 Closer sólido · líder do time",
      "pontos_fortes": [
        "Discovery aprofundada e BANT bem trabalhado",
        "Criação de urgência com bonus de implementação",
        "Apresentação técnica clara e concisa"
      ],
      "gaps": [
        "🔴 Perde 60% das calls com objeção 'preciso falar com sócio/a' — nunca usa agenda condicional",
        "Encerra calls sem próximo passo concreto quando lead pede tempo",
        "Não inclui decisor secundário em nova call"
      ],
      "recomendacoes": [
        {
          "acao": "Treinamento 1:1 com Juliana sobre técnica de agenda condicional",
          "exemplo": "Call C-126 (Studio Bravo) — perdeu por aceitar 'me retorne' em vez de marcar call com a sócia"
        },
        {
          "acao": "Implementar regra: toda call termina com próxima ação agendada",
          "exemplo": "Mesmo perdas devem ter follow-up de 7-14 dias agendado na hora"
        }
      ],
      "evolucao": {
        "30d_atras": {
          "close_rate": 24,
          "talk_ratio": 50
        },
        "hoje": {
          "close_rate": 22,
          "talk_ratio": 44
        },
        "trend": "→ estável"
      }
    },
    "Camila Rocha": {
      "perfil": "🟡 Em ajuste · gaps identificados",
      "pontos_fortes": [
        "Conhecimento técnico do produto",
        "Boa conexão inicial com lead (rapport forte)",
        "Material de pitch completo"
      ],
      "gaps": [
        "🔴 Calls duram 53min médio (meta: 35) — pitch monólogo de 38min",
        "🔴 Preço aparece tarde (min 50 médio) — lead já está cansado",
        "🔴 Oferece desconto em vez de redirecionar pra ROI",
        "🔴 Aceita 'mando proposta por email' sem mais uma tentativa"
      ],
      "recomendacoes": [
        {
          "acao": "Time-box do pitch em 15min — usar check-ins a cada 5min ('faz sentido até aqui?')",
          "exemplo": "Call C-120 (Hotel Dynamics) — 38min de pitch sem interação · lead desligou mentalmente"
        },
        {
          "acao": "Trazer preço entre min 15-20 sempre — substituir desconto por ROI concreto",
          "exemplo": "Estudar técnica de Juliana (call C-127): traz preço aos 24min e quebra com case"
        },
        {
          "acao": "Implementar regra de 1 tentativa adicional antes de aceitar 'proposta por email'",
          "exemplo": "Frase âncora: 'antes de eu te mandar, posso te fazer 1 pergunta?'"
        }
      ],
      "evolucao": {
        "30d_atras": {
          "close_rate": 12,
          "talk_ratio": 70
        },
        "hoje": {
          "close_rate": 18,
          "talk_ratio": 64
        },
        "trend": "↑ melhorando após treino de objeção"
      }
    },
    "André Nogueira": {
      "perfil": "🔴 Júnior · em rampagem · maior atenção",
      "pontos_fortes": [
        "Energia e disposição",
        "Aprendizado rápido",
        "Boa receptividade a feedback"
      ],
      "gaps": [
        "🔴 Pula BANT no discovery — confia demais na qualificação do SDR",
        "🔴 Talk ratio 71% (top performer: 38%) — pitch monólogo",
        "🔴 Preço sempre tarde (min 30+) tratado como justificativa, não ROI",
        "🔴 80% das perdas terminam com 'vou pensar' sem urgência criada"
      ],
      "recomendacoes": [
        {
          "acao": "Shadowing de 5 calls da Juliana (top performer) por semana nas próximas 4 semanas",
          "exemplo": "Foco especial em quebra de objeção de preço (call C-127 é referência)"
        },
        {
          "acao": "Implementar checklist de discovery obrigatório antes do pitch",
          "exemplo": "Não passar pra pitch sem confirmar BANT mesmo se SDR já qualificou"
        },
        {
          "acao": "Treino de redução de talk ratio — máximo 50% nas próximas 4 semanas",
          "exemplo": "Inserir check-in a cada 4-5min: 'isso faz sentido pro seu caso?' · 'qual sua reação até aqui?'"
        }
      ],
      "evolucao": {
        "30d_atras": {
          "close_rate": 8,
          "talk_ratio": 75
        },
        "hoje": {
          "close_rate": 9,
          "talk_ratio": 71
        },
        "trend": "→ estagnado · necessita intervenção"
      }
    }
  },
  "origem_performance": [
    {
      "criativo": "AD262_VID_CansouDeSofrer",
      "calls": 14,
      "vendas": 6,
      "close_rate": 42.9,
      "ticket_medio": 13800,
      "ciclo_dias": 6.2,
      "delta_close": "+95%",
      "highlight": "top"
    },
    {
      "criativo": "AD225_VID_BuildingComoEsse",
      "calls": 11,
      "vendas": 4,
      "close_rate": 36.4,
      "ticket_medio": 12200,
      "ciclo_dias": 7.1,
      "delta_close": "+65%",
      "highlight": "top"
    },
    {
      "criativo": "AD263_VID_ASPIRAR",
      "calls": 8,
      "vendas": 2,
      "close_rate": 25,
      "ticket_medio": 11500,
      "ciclo_dias": 9.8,
      "delta_close": "+14%"
    },
    {
      "criativo": "AD261_IMG_FatureMais",
      "calls": 7,
      "vendas": 1,
      "close_rate": 14.3,
      "ticket_medio": 11000,
      "ciclo_dias": 12.4,
      "delta_close": "-35%"
    },
    {
      "criativo": "AD124_VID_ClienteRapidoD",
      "calls": 5,
      "vendas": 0,
      "close_rate": 0,
      "ticket_medio": 0,
      "ciclo_dias": null,
      "delta_close": "-100%",
      "highlight": "bottom"
    },
    {
      "criativo": "AD251_VID_Banheiro",
      "calls": 4,
      "vendas": 1,
      "close_rate": 25,
      "ticket_medio": 12000,
      "ciclo_dias": 8.1,
      "delta_close": "+14%"
    }
  ],
  "anomalias": [
    {
      "severidade": "alta",
      "pessoa": "Pedro Henrique",
      "padrao": "3 perdas seguidas em calls com objeção 'falar com sócio'",
      "sugestao": "Treinamento imediato de agenda condicional (técnica Juliana). Padrão repetitivo identificado nos últimos 14 dias."
    },
    {
      "severidade": "alta",
      "pessoa": "Lucas Ferreira (SDR)",
      "padrao": "No-show subiu de 35% pra 51% em 3 semanas",
      "sugestao": "Auditar 5 últimos discoveries · provável queda na qualidade da qualificação BANT. Risco de afetar todo o funil."
    },
    {
      "severidade": "media",
      "pessoa": "Camila Rocha",
      "padrao": "Duração média de call subiu de 47 pra 53min",
      "sugestao": "Reforçar time-box de 35min · provável retorno do padrão de pitch monólogo após melhora inicial."
    },
    {
      "severidade": "baixa",
      "pessoa": "Time todo",
      "padrao": "Frase 'vou pensar' apareceu em 7 das últimas 15 perdas",
      "sugestao": "Refresh do playbook de criação de urgência no fechamento."
    }
  ],
  "speech_analytics": {
    "top_performers": {
      "talk_ratio_closer": 40,
      "talk_ratio_lead": 48,
      "talk_ratio_sdr": 12
    },
    "bottom_performers": {
      "talk_ratio_closer": 68,
      "talk_ratio_lead": 22,
      "talk_ratio_sdr": 10
    },
    "media_time": {
      "talk_ratio_closer": 53,
      "talk_ratio_lead": 36,
      "talk_ratio_sdr": 11
    },
    "insight": "Diferença de 28pts no talk-ratio do closer entre top e bottom performers. Top fala 40% — escuta 60%. Bottom fala 68% — escuta 32%. Correlação direta com close rate."
  }
};


/** Fila de leads qualificados do dia (aba Leads do Comercial Consultivo). */
export const LEADS_DIA = {
  "data_referencia": "03/05/2026 · sábado",
  "total_ontem": 38,
  "qualificacao_dist": {
    "alta": 7,
    "media": 13,
    "baixa": 18
  },
  "criterios_top": [
    {
      "nome": "Investe ≥ meta (R$15k+)",
      "pct": 78,
      "icon": "💵"
    },
    {
      "nome": "Decisão própria",
      "pct": 64,
      "icon": "🎯"
    },
    {
      "nome": "Faturamento ≥ alvo (R$30k+)",
      "pct": 56,
      "icon": "📊"
    },
    {
      "nome": "Resposta rápida (<3min)",
      "pct": 48,
      "icon": "⚡"
    },
    {
      "nome": "Cidade tier 1 (capital)",
      "pct": 32,
      "icon": "🌎"
    },
    {
      "nome": "Cansou de sofrer (motivação)",
      "pct": 28,
      "icon": "🔥"
    }
  ],
  "origem_top": [
    {
      "criativo": "AD262_VID_CansouDeSofrer",
      "leads_top": 4,
      "pct": 40,
      "cor": "#1A3D70"
    },
    {
      "criativo": "AD225_VID_BuildingComoEsse",
      "leads_top": 3,
      "pct": 30,
      "cor": "#2563EB"
    },
    {
      "criativo": "AD263_VID_ASPIRAR",
      "leads_top": 2,
      "pct": 20,
      "cor": "#16A34A"
    },
    {
      "criativo": "AD261_IMG_FatureMais",
      "leads_top": 1,
      "pct": 10,
      "cor": "#D97706"
    }
  ],
  "heatmap_horas": [
    {
      "hora": "08-10h",
      "leads": 4,
      "top_pct": 25
    },
    {
      "hora": "10-12h",
      "leads": 7,
      "top_pct": 43
    },
    {
      "hora": "12-14h",
      "leads": 5,
      "top_pct": 20
    },
    {
      "hora": "14-16h",
      "leads": 6,
      "top_pct": 33
    },
    {
      "hora": "16-18h",
      "leads": 8,
      "top_pct": 50
    },
    {
      "hora": "18-20h",
      "leads": 5,
      "top_pct": 40
    },
    {
      "hora": "20-22h",
      "leads": 3,
      "top_pct": 33
    }
  ],
  "leads": [
    {
      "id": "L-2603",
      "nome": "Maria S.",
      "telefone": "(11) 98***-2310",
      "score": 92,
      "criterios": [
        {
          "icon": "💵",
          "label": "Investe R$25k",
          "color": "verde"
        },
        {
          "icon": "🎯",
          "label": "Decisão própria",
          "color": "verde"
        },
        {
          "icon": "⚡",
          "label": "Respondeu em 2min",
          "color": "verde"
        },
        {
          "icon": "🌎",
          "label": "São Paulo capital",
          "color": "azul"
        }
      ],
      "criativo": "AD262_CansouDeSofrer",
      "publico": "LAL1% Premium",
      "horario": "16:42",
      "status": "nao_contactado",
      "obs": "Faturamento R$ 80k declarado · perfil ideal"
    },
    {
      "id": "L-2598",
      "nome": "João P.",
      "telefone": "(21) 99***-8745",
      "score": 88,
      "criterios": [
        {
          "icon": "💵",
          "label": "Investe R$30k+",
          "color": "verde"
        },
        {
          "icon": "📊",
          "label": "Fat. R$120k",
          "color": "verde"
        },
        {
          "icon": "🎯",
          "label": "Sócio decisor",
          "color": "verde"
        },
        {
          "icon": "⚡",
          "label": "Respondeu em 1min",
          "color": "verde"
        }
      ],
      "criativo": "AD262_CansouDeSofrer",
      "publico": "LAL2% LeadsMQL",
      "horario": "11:18",
      "status": "em_conversa",
      "obs": "🔥 Maior potencial · Higor já em contato"
    },
    {
      "id": "L-2589",
      "nome": "Carla M.",
      "telefone": "(11) 97***-1265",
      "score": 85,
      "criterios": [
        {
          "icon": "💵",
          "label": "Investe R$20k",
          "color": "verde"
        },
        {
          "icon": "🎯",
          "label": "Decisão própria",
          "color": "verde"
        },
        {
          "icon": "🌎",
          "label": "São Paulo",
          "color": "azul"
        },
        {
          "icon": "🔥",
          "label": "Cansou de sofrer",
          "color": "amarelo"
        }
      ],
      "criativo": "AD225_BuildingComoEsse",
      "publico": "LAL1% Premium",
      "horario": "10:55",
      "status": "agendado",
      "obs": "📅 Call agendada 06/05 · Juliana fecha"
    },
    {
      "id": "L-2576",
      "nome": "Ricardo F.",
      "telefone": "(31) 98***-4521",
      "score": 78,
      "criterios": [
        {
          "icon": "💵",
          "label": "Investe R$15k",
          "color": "verde"
        },
        {
          "icon": "📊",
          "label": "Fat. R$45k",
          "color": "verde"
        },
        {
          "icon": "🌎",
          "label": "Belo Horizonte",
          "color": "azul"
        }
      ],
      "criativo": "AD263_ASPIRAR",
      "publico": "LAL2% LeadsMQL",
      "horario": "17:23",
      "status": "nao_contactado",
      "obs": "Bom perfil · perseguir HOJE"
    },
    {
      "id": "L-2567",
      "nome": "Patrícia L.",
      "telefone": "(41) 99***-3344",
      "score": 75,
      "criterios": [
        {
          "icon": "💵",
          "label": "Investe R$15k",
          "color": "verde"
        },
        {
          "icon": "⚡",
          "label": "Respondeu em 4min",
          "color": "amarelo"
        },
        {
          "icon": "🌎",
          "label": "Curitiba",
          "color": "azul"
        }
      ],
      "criativo": "AD225_BuildingComoEsse",
      "publico": "LAL2%",
      "horario": "14:08",
      "status": "nao_contactado",
      "obs": "Pediu material · enviar deck antes da call"
    },
    {
      "id": "L-2554",
      "nome": "André S.",
      "telefone": "(51) 98***-9876",
      "score": 72,
      "criterios": [
        {
          "icon": "🎯",
          "label": "Decisão própria",
          "color": "verde"
        },
        {
          "icon": "📊",
          "label": "Fat. R$35k",
          "color": "amarelo"
        },
        {
          "icon": "🔥",
          "label": "Quer escalar",
          "color": "amarelo"
        }
      ],
      "criativo": "AD262_CansouDeSofrer",
      "publico": "Interesses Cleaning",
      "horario": "16:50",
      "status": "em_conversa",
      "obs": "Carolina (SDR) já qualificou"
    },
    {
      "id": "L-2541",
      "nome": "Sandra R.",
      "telefone": "(31) 99***-2244",
      "score": 68,
      "criterios": [
        {
          "icon": "💵",
          "label": "Investe R$12k",
          "color": "amarelo"
        },
        {
          "icon": "🌎",
          "label": "Belo Horizonte",
          "color": "azul"
        },
        {
          "icon": "📊",
          "label": "Fat. R$28k",
          "color": "amarelo"
        }
      ],
      "criativo": "AD261_FatureMais",
      "publico": "LAL2%",
      "horario": "19:12",
      "status": "nao_contactado",
      "obs": "Investe um pouco abaixo da meta · mas perfil consistente"
    },
    {
      "id": "L-2532",
      "nome": "Pedro M.",
      "telefone": "(11) 98***-7733",
      "score": 64,
      "criterios": [
        {
          "icon": "📊",
          "label": "Fat. R$50k",
          "color": "verde"
        },
        {
          "icon": "⚡",
          "label": "Respondeu em 3min",
          "color": "verde"
        },
        {
          "icon": "🌎",
          "label": "São Paulo",
          "color": "azul"
        }
      ],
      "criativo": "AD263_ASPIRAR",
      "publico": "LAL1% Premium",
      "horario": "11:30",
      "status": "agendado",
      "obs": "📅 Call 07/05 · perfil de mid-tier"
    },
    {
      "id": "L-2528",
      "nome": "Lucia C.",
      "telefone": "(11) 99***-1290",
      "score": 62,
      "criterios": [
        {
          "icon": "💵",
          "label": "Investe R$10k",
          "color": "amarelo"
        },
        {
          "icon": "🌎",
          "label": "São Paulo",
          "color": "azul"
        },
        {
          "icon": "🎯",
          "label": "Decisão própria",
          "color": "verde"
        }
      ],
      "criativo": "AD262_CansouDeSofrer",
      "publico": "LAL2%",
      "horario": "20:15",
      "status": "nao_contactado",
      "obs": "Borderline · ligar pra qualificar melhor"
    },
    {
      "id": "L-2521",
      "nome": "Felipe V.",
      "telefone": "(81) 99***-4400",
      "score": 58,
      "criterios": [
        {
          "icon": "🎯",
          "label": "Decisão própria",
          "color": "verde"
        },
        {
          "icon": "⚡",
          "label": "Respondeu em 2min",
          "color": "verde"
        },
        {
          "icon": "🌎",
          "label": "Recife",
          "color": "azul"
        }
      ],
      "criativo": "AD225_BuildingComoEsse",
      "publico": "LAL2%",
      "horario": "15:22",
      "status": "nao_contactado",
      "obs": "Sem dado de orçamento ainda"
    }
  ]
};
