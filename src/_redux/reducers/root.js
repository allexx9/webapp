// Copyright 2016-2017 Rigo Investment Sagl.

import transactionsReducer from './transactions'
import usersReducer from './users'
import endpointsReducer from './endpoint_reducer'
import exchangeReducer from './exchange'
import notificationsReducer from './notification'
import appReducer from './app_reducer'
import {
  eventfulDragoReducer,
  eventfulVaultReducer
} from './eventful'
// import { webSocketReducer } from '../epics/exchange'
import {combineReducers } from "redux"

class reducers {

  rootReducer = combineReducers({
    app: appReducer,
    exchange: exchangeReducer,
    transactions: transactionsReducer,
    user: usersReducer,
    endpoint: endpointsReducer,
    transactionsDrago: eventfulDragoReducer,
    transactionsVault: eventfulVaultReducer,
    // webSocketReducer: webSocketReducer,
    notifications: notificationsReducer
  });

}

let Reducers = new reducers();
export { Reducers };