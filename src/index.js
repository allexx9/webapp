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
import { composeWithDevTools } from 'redux-devtools-extension';
import * as ACTIONS  from './_redux/actions/const'
import utils from './_utils/utils'
import serializeError from 'serialize-error';

import './index.module.css';

const epicMiddleware = createEpicMiddleware(rootEpic);

const relayActionsMiddleWare = store => next => action => {
    const state = store.getState()
    // console.log("relayActionsMiddleWare triggered:", action)
    // console.log(state.exchange.selectedRelay.name)

    // console.log(ACTIONS.CUSTOM_EXCHANGE_ACTIONS)
    if (ACTIONS.CUSTOM_EXCHANGE_ACTIONS.includes(action.type)) {
        console.log(`relayActionsMiddleWare  action: ${state.exchange.selectedRelay.name.toUpperCase()}_${action.type}`)
        action.type = `${state.exchange.selectedRelay.name.toUpperCase()}_${action.type}`  
        console.log(action.type)   
    }
    next(action);
  }

  const notificationsMiddleWare = store => next => action => {
    const state = store.getState()
    // console.log("notificationsMiddleWare triggered:", action)
    // console.log(state.exchange.selectedRelay.name)

    // console.log(ACTIONS.CUSTOM_EXCHANGE_ACTIONS)
    if (action.type === ACTIONS.ADD_ERROR_NOTIFICATION) {
        utils.notificationError(state.notifications.engine, serializeError(action.payload))
    }
    next(action);
  }

const middlewares = [
    thunkMiddleware,
    epicMiddleware,
    relayActionsMiddleWare,
    notificationsMiddleWare,
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

  const composeEnhancers = window.__REDUX_DEVTOOLS_EXTENSION_COMPOSE__ || compose

const enhancer = composeEnhancers(
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
