# HOLO-NET → GenAI Engineering Sprint

**Corte:** 12/11/2026. **Prioridade externa:** prazo informado de inscrição no Programa GenAI iFood em **17/11/2026**.
**Objetivo:** converter o sistema existente num caso de engenharia de IA explicável, sem fingir treinamento ou inferência real.

A candidatura é independente do desenvolvimento: **não espere terminar a IA para se inscrever**. Não há confirmação aqui de que a inscrição foi enviada.

## Regras de execução

- Uma sessão tem **25 minutos**, seguida de pausa de **10–15 minutos**.
- Planeje sessões de manhã ou à noite, sem invadir as aulas vespertinas do SENAI.
- Antes de editar, registre hipótese, arquivo relevante, comando de teste e estado do Git.
- Ao encerrar, produza uma evidência verificável: resultado de teste, análise Markdown, diff, screenshot ou falha documentada.
- Não iniciar treinamento de modelo, download de pesos, framework ou novo banco antes de validar o baseline.
- Distinguir **VALIDADO / EXPERIMENTAL / BLOQUEADO / PENDENTE** em cada nota; não declarar concluídas tarefas que não foram executadas.

## O que fazer agora

**Próxima sessão de 25 minutos:** execute os testes de API e a avaliação existente e explique, com seu próprio raciocínio, por que a resposta de X-wings em Yavin 4 é 28 disponíveis e 36 totais. Não altere a implementação nesse primeiro contato.

Arquivos de entrada: `src/ai/query-core.js`, `src/data/galactic-registry.js`, `server/src/app.js`, `server/eval/questions.json`.
Evidência: `server/eval/latest-results.json` e `server/eval/REPORT.md`.

## Agenda até a candidatura

| Data | Sessão A (25 min) | Sessão B (25 min) | Evidência e condição de parada |
| --- | --- | --- | --- |
| **12/11, qui** | Conferir HOLO-NET publicado e testes | Curar BLACKSITE com apenas demos reais | README com provas; não anunciar backend público |
| **13/11, sex** | Traçar pergunta → intenção → ferramenta → banco | Ler e repetir `npm run eval` + relatório Python | Explicar entrada, saída, fonte e erro sem olhar anotações |
| **14/11, sáb** | Criar 10 perguntas inéditas em português | Criar outras 10, incluindo ambiguidade, negação e períodos | Conjunto de teste **separado** de 20 perguntas; registrar falhas sem ajustar o gabarito |
| **15/11, dom** | Inventário de GPU/modelos **somente leitura** | Se já houver modelo funcional: comparar 5 consultas de regras × LLM | Tabela com nome, VRAM observada, tokens, latência e falhas; se não houver backend GPU, marcar BLOQUEADO e seguir |
| **16/11, seg** | Exercícios de Python/SQL/APIs ligados ao próprio projeto | Ensaiar explicação técnica: autenticação, abstenção e custos | Responder um exercício de SQL, um de Python e um caso de erro; registrar tempo |
| **17/11, ter** | Verificar status da inscrição iFood e links do portfólio | Revisão de 10 perguntas de entrevista; não criar funcionalidade nova | Checklist da candidatura, links que abrem e limite de escopo claramente descrito |

**Pausas:** entre A e B, interromper 10–15 minutos. Se houver fadiga ou conflito com aula, reduzir para uma sessão e manter o progresso registrado.

## Trilha de competências com critérios concretos

| Etapa | Requisito | Arquivos | Critério mensurável | Estado em 12/11 |
| --- | --- | --- | --- | --- |
| 0 — Frontend demonstrável | Consulta e atlas usáveis no navegador | `src/components/CommandDeck.jsx`, `src/App.jsx` | Playwright 320–1440px, links e controles funcionais | VALIDADO localmente |
| 1 — Domínio/SQL | Estoque consistente, sessões e RBAC | `server/src/store.js`, `server/src/app.js` | Testes de 403, transferência e replay sem saldo negativo | VALIDADO localmente |
| 2 — Baseline de NL | Entidades → ferramenta read-only → fonte | `src/ai/query-core.js` | 30/30 casos do conjunto **curado**, sem alegar generalização | VALIDADO |
| 3 — Avaliação externa ao código | Relatório Python e perguntas inéditas | `tools/evaluation_report.py`, `server/eval/` | 20 perguntas não vistas, resultados por classe, P50/P95, erros auditáveis | PARCIAL / TESTE INÉDITO PENDENTE |
| 4 — Modelo local real | Tool calls na máquina RX 7600 | `server/src/llm-router.js` | Pelo menos 10 chamadas reais, tokens, latência, 0 escrituras inesperadas | PENDENTE |
| 5 — Recuperação documental | Fonte/trecho de lore com recusa | `src/data/galactic-registry.js` | 10 perguntas de fatos com fontes independentes e desconhecido explícito | EXPLORATÓRIO; busca lexical |
| 6 — Python orientado a IA | Reproduzir preparação, métricas e API | `tools/` e laboratórios Python futuros | Código Python testado + decisão técnica no README | INICIADO com análise do relatório |
| 7 — Produto com segurança | Revisar autorização, rate limits e secrets | `server/src/` | Não expor serviço sem teste de isolamento e banco persistente | BACKEND PÚBLICO BLOQUEADO |
| 8 — Treino/fine-tuning opcional | Dataset apropriado, baseline e melhoria demonstrável | projeto futuro separado | Evidência de ganho fora do treino, custo e licença de dados | NÃO INICIADO |

## Roteiro técnico de estudo após 17/11

**Semana 1 — Engenharia de avaliação.** Congelar 20 perguntas inéditas antes de mudar regras. Identificar taxas separadas de: resposta correta, recuperação inadequada, abstenção correta, falso bloqueio e operação recusada. Revisar o relatório Python; nunca usar o mesmo conjunto para ajustar e avaliar.

**Semana 2 — Modelo local.** Inspecionar versão de ROCm/Vulkan, memória, modelo já existente e capacidade de `tool_calls`. Executar o mesmo conjunto com regras e modelo local, observando P50, P95, tokens e erros. Um modelo sem suporte a ferramentas é um resultado de compatibilidade, não uma falha de você.

**Semana 3 — Retrieval.** Comparar busca lexical atual com um índice vetorial **somente se houver corpus real e exemplos que a busca lexical não resolve**. Manter o mesmo conjunto de avaliação e registrar fontes e casos de alucinação.

**Semana 4 — Segurança e aplicações reais.** Aplicar o mesmo princípio a um inventário fictício de componentes eletromecânicos, sem criar outra infraestrutura. Só depois estudar publicação de API com autenticação, database gerenciado e testes externos.

**Semana 5 — Preparação da demonstração técnica.** Gerar uma apresentação curta com arquitetura, trade-offs, falhas, testes reproduzíveis e decisões de custo. Evitar linguagem de senioridade artificial: mostrar código revisável e explicar o que foi assistido por IA.

## Três exercícios de cada sessão

**A — SQL (10 minutos).** Em `server/src/store.js`, localize a regra `ready <= quantity`. Explique o resultado de tentar retirar 40 unidades prontas quando só existem 28.

**B — Interpretação (10 minutos).** Por que `Quem controlava Lothal nas Guerras Clônicas?` precisa retornar `UNKNOWN`, mesmo existindo Lothal no catálogo?

**C — Segurança (5 minutos).** Se o LLM retornar uma ferramenta `transfer` no lugar de `stock`, qual código deve impedi-la de ser executada?

### Gabarito separado

- **A:** a transação deve rejeitar a operação e preservar o saldo; a prontidão nunca fica negativa.
- **B:** catálogo de planeta e comprovação de filiação para uma era são registros diferentes; falta de fonte não implica neutralidade.
- **C:** o roteador valida a lista de ferramentas read-only, e o backend de perguntas não expõe a ação de transferência; alterações passam pela API autenticada.

## Registro de sessão para Obsidian

Use o padrão abaixo; não replique um tutorial inteiro dentro do código.

```markdown
## HOLO-NET / GenAI — sessão AAAA-MM-DD
Objetivo:
Código lido:
Hipótese:
Passos executados:
Entrada / saída observada:
Testes e medições:
O que falhou (com evidência):
Estado: VALIDADO | EXPERIMENTAL | BLOQUEADO | PENDENTE
Decisão:
Próxima ação (até 25 min):
Rollback necessário?:
```

## Gates de avanço e rollback

- **PARAR** se o build, os testes de autorização ou o bloqueio de ferramentas de escrita falharem. Não adicionar IA sobre uma API inconsistente.
- **ROLLBACK** da UI se houver erro JavaScript, transbordamento horizontal ou perda de acessibilidade em 320/390/768/1280/1440 px.
- **NÃO TREINAR** modelo com conversas privadas, dados pessoais, informações sobre crises ou materiais sem licença/consentimento.
- **NÃO PROMOVER** para produção o backend SQLite local, nem dizer que um modelo real foi medido quando só um mock foi testado.
- **ALTA PRIORIDADE:** finalizar inscrição da vaga antes do prazo; isso não depende de completar todas as etapas.

A estratégia é **um projeto-âncora de IA com evidência**, não dez demonstrações parciais competindo pelo tempo de estudo.
