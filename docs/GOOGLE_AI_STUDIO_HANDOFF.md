# Tarefa para Google AI Studio Build / Gemini Editor

**Repositório existente:** https://github.com/Saiiru/starwarsplanets  
**Aplicação pública:** https://saiiru.github.io/starwarsplanets/  
**Objetivo:** uma segunda passada profissional de produto e design sobre o HOLO-NET; **não criar outro aplicativo e não refazer o backend**.

## Como entregar esta tarefa ao editor do Google

O Google AI Studio Build oferece **Import from GitHub** pelo menu de anexar arquivos (+) e sincronização bidirecional pelo painel GitHub em Configurações. Esse fluxo requer que o usuário conecte sua conta do GitHub à interface do Google; não foi acionado por ChatGPT.

1. Abra https://aistudio.google.com/ e entre em **Build**.
2. Escolha **Import from GitHub** e selecione `Saiiru/starwarsplanets`. Confira se o projeto importado contém `src/App.jsx`, `src/components/CommandDeck.jsx`, `server/`, `PRODUCT.md` e `DESIGN.md`.
3. **Antes de sincronizar alterações**, preserve uma branch de segurança no GitHub. Se o AI Studio não permitir escolher a branch de destino, use a prévia e baixe um ZIP/diff antes de autorizar qualquer push para `main`.
4. Cole integralmente o prompt abaixo.
5. Exija testes, capturas 390px e 1440px e uma lista exata de arquivos alterados; recuse mudanças no backend que não sejam justificadas por testes existentes.
6. Revise o diff. Prefira um PR separado à atualização direta da `main`.

O AI Studio pode inserir seu próprio runtime em projetos novos; nesta tarefa ele é **editor de código existente**. Não enviar `server/.env`, tokens, bancos locais ou credenciais.

## PROMPT PARA COPIAR NO GEMINI

Você está editando o projeto GitHub `Saiiru/starwarsplanets`, que **já funciona**. Não crie outro projeto, outro assistente, um chatbot fictício nem reimplemente as operações administrativas.

**Leia antes de editar:**
- `PRODUCT.md`: objetivos reais, limitações e requisitos.
- `DESIGN.md`: tokens normativos e princípios de interface extraídos do projeto.
- `docs/FLEET_OPERATIONS.md`: domínio, auditoria e autorização.
- `docs/AI_QUERY_EVALUATION.md`: roteamento de consultas, origem e limites.
- `docs/GENAI_ENGINEERING_SPRINT.md`: o que precisa de evidência para GenAI.
- `src/App.jsx`, `src/components/CommandDeck.jsx`, `src/components/AskPanel.jsx`, `src/components/GalacticPanels.jsx`, `src/components/Operations.jsx`, `src/cockpit.css` e `src/index.css`.
- `scripts/e2e_holonet.py` e `server/tests/`: contratos de regressão que **não podem ser quebrados**.

**Missão de UI/UX**

Redesenhe/refine as superfícies React como um **terminal de logística militar futurista** inspirado em holotables, displays industriais e datapads de Star Wars, mas com uma execução visual original. Não copie assets ou capturas protegidas. A identidade deve ter uma presença visual memorável, sem parecer uma coleção de cards genéricos nem atrapalhar a operação.

Foque o primeiro viewport do desktop no usuário **fazendo algo**: consultar estoque por pergunta natural, analisar a disponibilidade e explorar um setor no mapa. Evite hero gigantesco, espaço vazio improdutivo e fake terminal. As informações devem ter densidade e ritmo bem resolvidos.

Aprimore estes pontos:

1. **Cockpit / hierarquia:** mapa tático esquemático à esquerda e consulta read-only à direita, manifesto de frota compacto abaixo. Corrija qualquer espaçamento morto, desequilíbrio ou hierarquia confusa. Mantenha quantidades derivadas dos dados reais do código.
2. **Arte vetorial própria:** criar ao menos uma peça original de SVG ou Canvas, por exemplo uma visualização de esquadrões, silhuetas técnicas abstratas de classes de naves ou diagrama de movimentação de estoque. Deve ter significado técnico e não usar sprites, logos ou fotos comerciais de Star Wars.
3. **Controle por época/facção:** deixar claro que `control` e `alignment` podem divergir. Em outro período, a classificação de Coruscant muda. Planetas sem evidência suficiente permanecem UNKNOWN, nunca invente filiações.
4. **Consulta em linguagem natural:** o usuário escreve e recebe resposta reproduzível; mostrar estado, ferramenta, proveniência, fonte e indicação de simulação. A UI precisa bloquear visualmente operações de escrita e ser útil sem LLM.
5. **Design responsivo:** 320, 390, 768, 1280 e 1440px sem overflow. No celular, deixar os botões da navegação alcançáveis, o mapa legível e a resposta acessível sem dezenas de scrolls.
6. **Acessibilidade:** HTML semântico, foco visível, estados de loading/erro/vazio, prefer-reduced-motion, contraste de texto, interação por teclado e labels adequadas.
7. **Materialidade:** Oxanium, IBM Plex Sans/Mono já estão instaladas. Empregar os tokens `--holo-*` existentes e o DESIGN.md; adicionar tokens somente se houver padrão repetido. Não importar um framework visual pesado.
8. **Provas:** desenhar uma interface que um recrutador de AI Engineering consiga testar em 15–30 segundos, não apenas observar.

**Limites técnicos absolutos**

- Preservar React/Redux/Vite, rota `/#command`, `/#worlds`, `/#fleet`, `/#ships`, `/#ask`, `/#operations`, `/#archive`; backend Fastify/SQLite e o formato de resposta `/api/v1/ask`.
- Não expor `server/` via GitHub Pages nem criar login público ou contas padrão.
- Não substituir `answerQuestion()`, `planQuestion()` ou `executeQuestionPlan()` por respostas geradas sem fonte.
- Não adicionar ferramentas de escrita ao LLM. Não integrar KORA, LUKA, OpenJarvis ou serviços externos.
- Não alegar fine-tuning, embeddings, RAG vetorial, inferência real ou produção se não existirem testes que os comprovem.
- Não modificar lore nem quantidades fictícias para fazer a interface ficar bonita.
- Não instalar modelos ou gerar gastos de API/Cloud Run sem autorização.

**Critérios de aceite**

- `npm test` (frontend), `npm run build`, `cd server && npm test`, `cd server && npm run eval`, `python -m unittest discover -s tools -p 'test_*.py'`.
- Rodar `scripts/e2e_holonet.py` após servir a aplicação local. Confirmar pergunta X-wings, referência de Coruscant, bloqueio de transferência, mapa acessível e ausência de overflow em cinco larguras.
- Registrar screenshots de desktop 1440px e celular 390px e compará-los com `docs/screenshots/`.
- Atualizar `DESIGN.md` apenas se mudanças aprovadas alterarem tokens realmente usados; manter o formato YAML + seções canônicas.
- Entregar changelog objetivo com arquivos alterados, testes aprovados/reprovados, limitações e preview. Não declarar êxito quando testes falharem.

**Ordem:** auditar UX existente → propor direção concreta → implementar frontend em escopo → validar testes → capturar desktop/mobile → corrigir problemas encontrados → produzir diff/PR. Faça a primeira passada no frontend e preserve backend/testes.

## Depois que o Gemini devolver o código

1. Compare o diff com `main` antes de mesclar.
2. Reexecute os testes de ferramentas, autenticação, auditoria e avaliação.
3. Confira que os links oficiais de lore continuam intactos.
4. Só publique GitHub Pages depois do smoke test local. 
5. Se o Google alterar arquivos fora do escopo, reverta ou separe em outro PR antes de publicar.

## O que não podemos considerar concluído por esse handoff

A importação, a autorização da conta, a execução do Google AI Studio e o resultado visual que ele eventualmente gerar **dependem de uma ação real do usuário nesse editor**. Este documento prepara o fluxo e seus critérios; não afirma que o Google já editou o código.
