// Copyright 2016-2017 Rigo Investment Sagl.
// By the Power of Grayskull! I Have the Power!

import { Provider } from 'react-redux'
import { Reducers } from './_redux/reducers/root_reducer'
import { applyMiddleware, compose, createStore } from 'redux'
import { createEpicMiddleware } from 'redux-observable'
import { persistReducer, persistStore } from 'redux-persist'
import { rootEpic } from './_redux/epics/root_epics'
import App from './App'
import React from 'react'
import ReactDOM from 'react-dom'
// import logger from 'redux-logger'
import registerServiceWorker from './registerServiceWorker'
// import { composeWithDevTools } from 'redux-devtools-extension';
import { PersistGate } from 'redux-persist/integration/react'
import { createFilter } from 'redux-persist-transform-filter'
import {
  notificationsMiddleWare,
  poolCalculateValueMiddleWare,
  relayActionsMiddleWare
} from './_redux/middlewares'
import autoMergeLevel2 from 'redux-persist/lib/stateReconciler/autoMergeLevel2'
import storage from 'redux-persist/lib/storage'

import './index.module.css'

function noop() {}

if (process.env.NODE_ENV !== 'development') {
  console.log = noop
  // console.warn = noop
  console.error = noop
}

const epicMiddleware = createEpicMiddleware()

const middlewares = [
  epicMiddleware,
  relayActionsMiddleWare,
  notificationsMiddleWare,
  poolCalculateValueMiddleWare
]

// if (process.env.NODE_ENV === `development`) {
//   middlewares.push(logger);
// }

// Redux Persist
const saveSubsetFilterEndpoint = createFilter('endpoint', [
  'endpointInfo',
  'networkInfo'
])
const saveSubsetFilterApp = createFilter('app', [
  // 'isConnected',
  // 'isSyncing',
  'lastBlockNumberUpdate',
  // 'accountsAddressHash',
  'config'
])
// const saveSubsetFilterTransactionsDrago = createFilter('transactionsDrago', [
//   'dragosList'
// ])
//   const saveSubsetBlacklistFilter = createBlacklistFilter(
//     'endpoint',
//     ['accounts']
//   );

const persistConfig = {
  key: 'rigoblock',
  storage,
  stateReconciler: autoMergeLevel2,
  whitelist: ['endpoint', 'app', 'user'],
  transforms: [
    saveSubsetFilterEndpoint,
    saveSubsetFilterApp
    // saveSubsetFilterTransactionsDrago
    // saveSubsetFilterApp
    // saveSubsetBlacklistFilter
  ]
}
const persistedReducer = persistReducer(persistConfig, Reducers.rootReducer)

const composeEnhancers = window.__REDUX_DEVTOOLS_EXTENSION_COMPOSE__ || compose

const enhancer = composeEnhancers(applyMiddleware(...middlewares))

let store = createStore(persistedReducer, enhancer)
epicMiddleware.run(rootEpic)

let persistor = persistStore(store)

ReactDOM.render(
  <Provider store={store}>
    <PersistGate loading={null} persistor={persistor}>
      <App />
    </PersistGate>
  </Provider>,
  document.getElementById('root')
)

registerServiceWorker()

// Hot Module Reload
if (module.hot) {
  module.hot.accept()
}
