# HOLO-NET — Arquitetura de frota e roteiro de leitura

**Estado:** aplicação demonstrativa independente da KORA, com frontend público e backend local. **Não é software de produção.**

## Objetivo de engenharia

Um sistema de controle de estoque precisa responder a quatro questões verificáveis:

1. **Identificação:** qual nave, facção, período e localização?
2. **Disponibilidade:** qual a quantidade total e quantas unidades podem operar?
3. **Movimentação:** transferir unidades entre posições sem criar ou perder estoque.
4. **Responsabilidade:** quem executou a ação e o que mudou?

A identidade ficcional de Star Wars torna os cenários memoráveis, mas a lógica é reutilizável para peças do laboratório SENAI, módulos eletrônicos e ativos de manutenção.

## Subsistemas

| Camada | Localização | Responsabilidade |
| --- | --- | --- |
| Interface | `src/App.jsx`, `src/components/` | Navigation, estoque, consulta por fontes, perguntas naturais |
| Cadastro histórico | `src/data/galactic-registry.js` | Canon por era com controle, alinhamento, confiança e URLs |
| Catálogo externo | `src/api/api.js` | SWAPI paginada, com domínio e recurso verificados |
| Respostas read-only | `src/ai/query-core.js` | Extração de entidades, intenção, consulta e citação |
| API | `server/src/app.js` | Rotas Fastify, esquema HTTP, limite de requisições |
| Banco | `server/src/store.js` | SQLite, usuários, sessões, inventário, transferências, auditoria |
| Modelo opcional | `server/src/llm-router.js` | Interpretação de chamada de ferramenta local, com validação |
| Avaliação | `server/eval/`, `server/scripts/evaluate.mjs` | Questões, gabaritos e relatório quantitativo |

A documentação de contexto está aqui; o código permanece focado na implementação.

## Entidades principais

```text
User 1 ── N Session
User 1 ── N Movement ── 1 Origin / 1 Destination
User 1 ── N AuditEvent
Inventory ── unique(Era, Faction, Planet, Ship)
LorePlanet ── N EraRecord(PoliticalControl, PoliticalAlignment, Status, Source)
```

O banco armazena **somente o inventário de simulação** e ações de exemplo. A lore vem de um conjunto de registros curados no código; consultas SWAPI são uma terceira fonte, que **não** fornece alinhamento político. Manter essas três origens separadas impede atribuições indevidas.

Invariantes: `quantity >= 0`, `0 <= ready <= quantity`. Uma transferência só pode ocorrer se não houver saldo negativo na origem, se a facção estiver autorizada e se origem e destino forem distintos. Cada pedido tem `requestId`; repetir o mesmo pedido não faz o débito novamente. Alterar o conteúdo de um pedido com o mesmo ID resulta em conflito.

## Autorização

| Papel | Consultar | Transferir | Ajustar quantidades | Criar usuário | Auditoria |
| --- | --- | --- | --- | --- | --- |
| Público (GitHub Pages) | Cenário fictício e lore | Não | Não | Não | Não |
| Viewer autenticado | Sim | Não | Não | Não | Não |
| Operator | Sim | Só sua facção | Não | Não | Apenas histórico da própria facção |
| Admin | Sim | Sim | Sim | Sim | Sim |

Sessões são tokens aleatórios; apenas o hash SHA-256 é persistido. Senhas usam `scrypt` com sal independente. O frontend mantém o token **apenas em memória** (não em localStorage). Não existe conta demo publicada, e o servidor exige uma senha criada pelo operador. O serviço inicia no loopback, sem TLS público.

**Pendências antes de abrir à internet:** autenticação com proteções adicionais, políticas de revogação/rotação de credenciais, segurança dos deployments, revisão de exposição de dados, auditoria de dependências, banco gerenciado, backup, rastreio e testes externos. Não basta configurar Vercel para considerar a API segura.

## Fluxo para estudar em sessões curtas

### Sessão 1 — Ler o domínio

Abra `src/data/galactic-registry.js` e responda: por que Coruscant tem dois registros de controle? Por que Mon Cala pode estar sob domínio imperial e apoiar a Aliança? Onde o programa identifica informação indeterminada?

Critério de conclusão: localizar no código uma prova de que `control` e `alignment` não são o mesmo campo.

### Sessão 2 — Entender o banco

Abra `server/src/store.js`. Identifique quais tabelas guardam saldo, usuários e movimentos. Encontre o índice único de inventário, a restrição `ready <= quantity`, a transação de transferência e o registro de auditoria.

Exercício: tente mover mais unidades prontas do que a origem possui nos testes. O saldo não deve mudar e o endpoint deve retornar conflito.

### Sessão 3 — Autorização

Abra `server/src/app.js` e `server/tests/api.test.mjs`. Identifique como o bearer token é verificado e por que um operador do Império não pode mover X-wings da Aliança.

Critério de conclusão: reproduzir um caso HTTP 403 e descrever a verificação da facção feita no servidor, não apenas no React.

### Sessão 4 — Consulta natural

Abra `src/ai/query-core.js` e siga “Quantos X-wings estão prontos em Yavin 4?”: reconhecimento → intenção `stock` → filtro de inventário → evidência de simulação.

Em seguida, siga “Quem controlava Coruscant nas Guerras Clônicas?” e encontre a fonte histórica. A resposta de lore não pode virar uma contagem de estoque.

### Sessão 5 — Modelo e avaliação

Leia `server/src/llm-router.js` e `server/tests/ask.test.mjs`. O modelo escolhe apenas uma ferramenta autorizada; o backend descarta argumentos incompatíveis e ignora texto de resposta não fundamentado. Execute o conjunto de avaliação e compare acertos, abstenções, bloqueios e latência.

**Gabarito de arquitetura:** dados históricos têm fonte por era; saldos têm restrições no SQLite; o backend aplica autorização independente do frontend; o modelo não recebe nenhuma ferramenta de escrita; toda resposta precisa declarar se sua origem é Canon, simulação ou evidência insuficiente.

## Produção versus simulação

- **Validado:** build React, testes da API de permissão/estoque, fluxo de perguntas baseado em regras, respostas com proveniência e navegador nas larguras testadas.
- **Experimental:** chamada de ferramenta por LLM local compatível; os testes atuais usam provedor simulado.
- **Pendente:** avaliação com um modelo carregado na RX 7600, cobertura de perguntas inéditas, busca semântica real, autenticação endurecida e deploy backend seguro.
- **Bloqueado deliberadamente:** alterar inventário por linguagem natural sem confirmação.

Referências oficiais: [Star Wars Databank](https://www.starwars.com/databank), [SWAPI](https://swapi.dev/), [OpenAI function calling](https://developers.openai.com/api/docs/guides/function-calling), [Ollama OpenAI compatibility](https://github.com/ollama/ollama/blob/main/docs/api/openai-compatibility.mdx).
