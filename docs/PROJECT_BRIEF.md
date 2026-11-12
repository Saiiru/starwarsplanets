# Star Wars Planet Explorer

> Curadoria técnica · 12/11/2026 · **projeto independente**, não integrado à KORA.

**Repositório atual:** https://github.com/Saiiru/starwarsplanets
**Nome anterior:** `starwarsplanets` (preservado por dependências de publicação/treinamento)
**Tecnologias observadas:** React · Redux · JavaScript
**Estado verificado por inspeção:** Exercício com Github Pages legado; funcionamento da fonte de dados exige verificação.

## Problema e objetivo

Experimentar listagem, busca e gerenciamento de estado em um catálogo de planetas com dados externos.

Este é um estudo/experimento de engenharia de software; não é declarado como serviço comercial, produto em produção ou solução universal.

## O que existe atualmente

Exercício com Github Pages legado; funcionamento da fonte de dados exige verificação. Os arquivos originais, licenças, histórico e eventuais instruções de instalação permanecem no repositório. Esta curadoria não executou todas as dependências nem comprovou operação funcional. Para executar, use as instruções originais do README se disponíveis; quando ausentes, a preparação do ambiente é uma tarefa pendente, não um comando inventado.

## Projeto, autoria e referências

Estudo React/Redux; nome real preservado para não quebrar Pages. Créditos, fontes de tutoriais e colaboradores devem continuar associados ao trabalho original. O fato de um repositório estar nesta conta não significa que todo o conteúdo foi escrito individualmente.

## Próximo incremento verificável

**Primeiro passo:** Testar busca, estado sem rede e conferir integridade da demo pública.

**Critério de conclusão:** README com setup reproduzível, pelo menos uma verificação automatizada que detecte falhas relevantes, tratamento de entradas inválidas e demonstração com dados fictícios. Só alegar testes aprovados após execução registrada.

## Como apresentar no portfólio

**Nome editorial:** Star Wars Planet Explorer
**Problema:** Experimentar listagem, busca e gerenciamento de estado em um catálogo de planetas com dados externos.
**Evidência:** código público no branch padrão; estado e limitações declarados nesta nota.
**Ainda não é:** sistema integrado à KORA, serviço em produção ou prova de maturidade sem testes.

[Voltar ao portfólio SAIRU/BLACKSITE](https://saiiru.github.io/#projetos-independentes)


## Verificação de funcionamento — 12/11/2026

**Estado confirmado:** Frontend React validado localmente

**Evidência:** Node 24 · npm test: 3/3; Vite build; Playwright 390/1280; API SWAPI ao vivo com 60 planetas

**Limites e bloqueios:** Depende de SWAPI externa; exibe erro e permite tentar novamente se a API estiver indisponível.

Esta validação não implica integração à KORA nem certificação de produção. Não alterar histórico, licença e autoria dos tutoriais.
