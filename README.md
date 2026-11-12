# Star Wars Planet Explorer

**Objetivo:** Experimentar listagem, busca e gerenciamento de estado em um catálogo de planetas com dados externos.

**Estado:** Exercício com Github Pages legado; funcionamento da fonte de dados exige verificação.

**Documentação técnica, origem e próximos passos:** [docs/PROJECT_BRIEF.md](docs/PROJECT_BRIEF.md)

---

## Material original preservado

### STAR WARS PLANETS

um simples projeto para revisar alguns conceitos do react e poder avançar para o redux,
https://saiiru.github.io/starwarsplanets/ Link para acesso no github pages





# Getting Started with Create React App

This project was bootstrapped with [Create React App](https://github.com/facebook/create-react-app).

## Available Scripts

In the project directory, you can run:

### `npm start`

Runs the app in the development mode.\
Open [http://localhost:3000](http://localhost:3000) to view it in your browser.

The page will reload when you make changes.\
You may also see any lint errors in the console.

### `npm test`

Launches the test runner in the interactive watch mode.\
See the section about [running tests](https://facebook.github.io/create-react-app/docs/running-tests) for more information.

### `npm run build`

Builds the app for production to the `build` folder.\
It correctly bundles React in production mode and optimizes the build for the best performance.

The build is minified and the filenames include the hashes.\
Your app is ready to be deployed!

See the section about [deployment](https://facebook.github.io/create-react-app/docs/deployment) for more information.

### `npm run eject`

**Note: this is a one-way operation. Once you `eject`, you can't go back!**

If you aren't satisfied with the build tool and configuration choices, you can `eject` at any time. This command will remove the single build dependency from your project.

Instead, it will copy all the configuration files and the transitive dependencies (webpack, Babel, ESLint, etc) right into your project so you have full control over them. All of the commands except `eject` will still work, but they will point to the copied scripts so you can tweak them. At this point you're on your own.

You don't have to ever use `eject`. The curated feature set is suitable for small and middle deployments, and you shouldn't feel obligated to use this feature. However we understand that this tool wouldn't be useful if you couldn't customize it when you are ready for it.

## Learn More

You can learn more in the [Create React App documentation](https://facebook.github.io/create-react-app/docs/getting-started).

To learn React, check out the [React documentation](https://reactjs.org/).

### Code Splitting

This section has moved here: [https://facebook.github.io/create-react-app/docs/code-splitting](https://facebook.github.io/create-react-app/docs/code-splitting)

### Analyzing the Bundle Size

This section has moved here: [https://facebook.github.io/create-react-app/docs/analyzing-the-bundle-size](https://facebook.github.io/create-react-app/docs/analyzing-the-bundle-size)

### Making a Progressive Web App

This section has moved here: [https://facebook.github.io/create-react-app/docs/making-a-progressive-web-app](https://facebook.github.io/create-react-app/docs/making-a-progressive-web-app)

### Advanced Configuration

This section has moved here: [https://facebook.github.io/create-react-app/docs/advanced-configuration](https://facebook.github.io/create-react-app/docs/advanced-configuration)

### Deployment

This section has moved here: [https://facebook.github.io/create-react-app/docs/deployment](https://facebook.github.io/create-react-app/docs/deployment)

### `npm run build` fails to minify

This section has moved here: [https://facebook.github.io/create-react-app/docs/troubleshooting#npm-run-build-fails-to-minify](https://facebook.github.io/create-react-app/docs/troubleshooting#npm-run-build-fails-to-minify)


## Execução atual (Vite)

Node.js 20.19+ ou 22+ e npm. Dependências legadas do Create React App foram substituídas por Vite para permitir builds atuais.

```bash
npm ci
npm test
npm run build
npm run dev
```

O diretório de saída é **dist/**. Para hospedar na Vercel, importe o repositório com framework Vite, comando npm run build e saída dist. Nenhum endereço de deploy Vercel é declarado sem deploy verificado.


## Publicação como frontend estático

O repositório inclui `vercel.json` com build Vite e saída `dist/`.
O site é totalmente estático: não há backend em Vercel nem banco remoto a configurar.
Build local: `npm ci` (nos estudos React 17, `npm ci --legacy-peer-deps`), `npm test` quando existir e `npm run build`.
Uma URL de produção somente é anunciada após deploy e teste HTTP/navegador. Nenhuma transação real ou credencial deve ser inserida.


## Verificação do código em 12/11/2026

Node 24 · npm test: 3/3; Vite build; Playwright 390/1280; API SWAPI ao vivo com 60 planetas

**Limitações:** Depende de SWAPI externa; exibe erro e permite tentar novamente se a API estiver indisponível.



## Publicação GitHub Pages (alternativa a Vercel)

A página estática é construída com a base específica do repositório; o branch de publicação é `gh-pages`. O código e os testes permanecem na branch `main`.

1. Execute localmente `npm test` (quando disponível), `npm run build` e verifique no navegador.
2. Compile com `GITHUB_PAGES=true npm run build` e publique a pasta `dist` com uma ferramenta como `gh-pages` usando a autenticação GitHub autorizada.
3. Confira a resposta HTTP e as interações em `https://saiiru.github.io/starwarsplanets/`.
