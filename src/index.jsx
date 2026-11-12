import React from 'react';
import ReactDOM from 'react-dom';
import App from './App'
import { Provider } from 'react-redux'

import { createStore, applyMiddleware, combineReducers } from 'redux';
import { searchPlanets, requestPlanets } from './redux/reducers';
import thunk from 'redux-thunk'

import './index.css'

const rootReducer = combineReducers({ searchPlanets, requestPlanets });
const store = createStore(rootReducer, applyMiddleware(thunk))

ReactDOM.render(
  <React.StrictMode>
    <Provider store={store}>
      <App />
    </Provider>
  </React.StrictMode>,
  document.getElementById('root')
);
