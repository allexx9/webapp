// Copyright 2016-2017 Rigo Investment Sagl.
// By the Power of Grayskull! I Have the Power!

import React from 'react';
import ReactDOM from 'react-dom';
import registerServiceWorker from './registerServiceWorker';
import App from './App';
import { Provider } from 'react-redux';
import { createStore, applyMiddleware, compose } from 'redux';
import promiseMiddleware from 'redux-promise-middleware';
import thunkMiddleware from 'redux-thunk';
import { Reducers } from './_redux/reducers/root'
import persistState, {mergePersistedState} from 'redux-localstorage';
import adapter from 'redux-localstorage/lib/adapters/localStorage';
import filter from 'redux-localstorage-filter';
import logger from 'redux-logger'
import { createEpicMiddleware } from 'redux-observable';
import { rootEpic } from './_redux/epics/root';

import './index.module.css';

const epicMiddleware = createEpicMiddleware(rootEpic);

const middlewares = [
    thunkMiddleware,
    epicMiddleware,
    promiseMiddleware()
];

// if (process.env.NODE_ENV === `development`) {
//   middlewares.push(logger);
// }

const reducer = compose(
    mergePersistedState()
  )(Reducers.rootReducer);

const storage = compose(
    filter(['user', 'endpoint'])
  )(adapter(window.localStorage));

const enhancer = compose(
    applyMiddleware(...middlewares),
    persistState(storage, 'rigoblock')
  );

const store = createStore(reducer, enhancer);

ReactDOM.render(
    <Provider store={store}><App /></Provider>,
    document.getElementById('root'))

registerServiceWorker()

// Hot Module Reload
if (module.hot) {
    module.hot.accept();
}
