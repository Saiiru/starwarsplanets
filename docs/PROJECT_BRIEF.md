# HOLO-NET Fleet Registry — contexto técnico e origem

**Identidade atual:** HOLO-NET Fleet Registry
**Slug histórico:** `Saiiru/starwarsplanets` (preservado por continuidade do GitHub Pages)
**Escopo:** portfólio independente, simulação de logística com tema Star Wars; não há integração à KORA.

## Origem

O trabalho começou como um exercício de React/Redux para listar e pesquisar planetas pela SWAPI. O código original continua em `src/components/Card*`, `src/redux/` e na aba **SWAPI Original**. A migração do build para Vite e a correção de paginação foram documentadas anteriormente.

A expansão de 12/11/2026 acrescentou uma interface HOLO-NET, histórico territorial dependente de era, catálogo de classes de naves, inventário didático, API Fastify local com SQLite e autorização, consulta em linguagem natural com roteamento limitado a ferramentas read-only, avaliação e documentação.

## Problema e decisões

O requisito demonstrado é consultar e movimentar equipamentos com **consistência, autorização, rastreabilidade e proveniência**. Os planetas e as naves são elementos de uma simulação; não inventamos quantidades históricas. Registros de controle político têm era, fonte, confiança e campo separado de alinhamento.

Frontend estático público (GitHub Pages) sem autenticação e **somente leitura**. O backend e a administração de estoque ficam em `127.0.0.1` e não foram publicados. O modo IA local usa modelos OpenAI-compatible apenas se já estiverem configurados; os testes atuais não executaram inferência real.

## Evidência e reprodução

- `npm test` na raiz: testes de API SWAPI, proveniência histórica e consultas determinísticas.
- `cd server && npm test`: autenticação, permissões por facção, saldos, transações, auditoria, roteamento de ferramentas e casos de falha.
- `cd server && npm run eval`: 30 perguntas com acertos, abstenções e bloqueios; o dataset não é um conjunto de avaliação cego.
- `npm run build`: geração do frontend de produção, incluindo versão para Pages com `GITHUB_PAGES=true`.
- Browser tests: perguntas, fontes, estoque, navegação, overflow e disponibilidade de API.
- Documentos: [FLEET_OPERATIONS.md](FLEET_OPERATIONS.md) e [AI_QUERY_EVALUATION.md](AI_QUERY_EVALUATION.md).

## Limites

Aplicação de estudo, sem hardening para internet. O conteúdo de lore precisa de revisão contínua por época; não há busca semântica, treinamento de modelos, RAG vetorial, login SSO ou agentes com execução externa. A UI pública não modifica o backend.

Histórico de autoria e referências acadêmicas continuam identificados no Git e no README. Não representar esta simulação como produto comercial ou oficial da Lucasfilm.
