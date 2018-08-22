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
import { persistStore, persistReducer } from 'redux-persist'
import logger from 'redux-logger'
import { createEpicMiddleware } from 'redux-observable';
import { rootEpic } from './_redux/epics/root_epics';
// import { composeWithDevTools } from 'redux-devtools-extension';
import * as ACTIONS from './_redux/actions/const'
import utils from './_utils/utils'
import serializeError from 'serialize-error';
import { PersistGate } from 'redux-persist/integration/react'
import storage from 'redux-persist/lib/storage'
import { createFilter, createBlacklistFilter } from 'redux-persist-transform-filter';
import autoMergeLevel2 from 'redux-persist/lib/stateReconciler/autoMergeLevel2'

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
    // console.log(action)
    if (action.type === ACTIONS.ADD_ACCOUNT_NOTIFICATION) {
        action.payload.map((notification) => {
            utils.notificationAccount(
                state.notifications.engine,
                notification,
                'info'
            )
        })
    }
    if (action.type === ACTIONS.ADD_ERROR_NOTIFICATION) {
        utils.notificationError(
            state.notifications.engine,
            serializeError(action.payload),
            'error'
        )
    }
    if (action.type === ACTIONS.ADD_WARNING_NOTIFICATION) {
        utils.notificationError(
            state.notifications.engine,
            serializeError(action.payload),
            'warning'
        )
    }
    next(action);
}

const middlewares = [
    thunkMiddleware,
    epicMiddleware,
    relayActionsMiddleWare,
    notificationsMiddleWare,
    // promiseMiddleware()
];

// if (process.env.NODE_ENV === `development`) {
//   middlewares.push(logger);
// }

// Redux Persist
const saveSubsetFilter = createFilter(
    'endpoint',
    [
        'endpointInfo',
        'prevBlockNumber',
        'networkInfo',
        'prevBlockNumber',
        'networkError',
        'networkStatus'
    ]
);
//   const saveSubsetBlacklistFilter = createBlacklistFilter(
//     'endpoint',
//     ['accounts']
//   );

const persistConfig = {
    key: 'rigoblock',
    storage,
    stateReconciler: autoMergeLevel2,
    whitelist: ['endpoint', 'user'],
    transforms: [
        saveSubsetFilter,
        // saveSubsetBlacklistFilter
    ]
}
const persistedReducer = persistReducer(persistConfig, Reducers.rootReducer)

const composeEnhancers = window.__REDUX_DEVTOOLS_EXTENSION_COMPOSE__ || compose

const enhancer = composeEnhancers(
    applyMiddleware(...middlewares),
);

let store = createStore(persistedReducer, enhancer);
let persistor = persistStore(store)

ReactDOM.render(
    <Provider store={store}>
        <PersistGate loading={null} persistor={persistor}>
            <App />
        </PersistGate>
    </Provider>,
    document.getElementById('root'))

registerServiceWorker()

// Hot Module Reload
if (module.hot) {
    module.hot.accept();
}
