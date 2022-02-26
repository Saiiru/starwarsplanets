import React from 'react';
import ReactDOM from 'react-dom';
import App from './App'
import { Provider } from 'react-redux'

import { createStore, applyMiddleware, combineReducers } from 'redux';
import { searchPlanets, requestPlanets } from './redux/reducers';
import { createLogger } from 'redux-logger';
import thunk from 'redux-thunk'

import registerServiceWorker from './registerServiceWorker';
import 'tachyons'
import './index.css'

const logger = createLogger();
const rootReducer = combineReducers({ searchPlanets, requestPlanets });
const store = createStore(rootReducer, applyMiddleware(thunk, logger))

ReactDOM.render(
  <React.StrictMode>
    <Provider store={store}>
      <App />
    </Provider>
  </React.StrictMode>,
  document.getElementById('root')
);

registerServiceWorker();
