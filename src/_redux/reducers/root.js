// Copyright 2016-2017 Rigo Investment Sarl.

import transactionsReducer from './transactions'
import usersReducer from './users'
import endpointsReducer from './endpoints'
import exchangeReducer from './exchange'
import pingReducer from './ping'
import {
  eventfulDragoReducer,
  eventfulVaultReducer
} from './eventful'
import {combineReducers } from "redux"

class reducers {

  rootReducer = combineReducers({
    ping: pingReducer,
    exchange: exchangeReducer,
    transactions: transactionsReducer,
    user: usersReducer,
    endpoint: endpointsReducer,
    transactionsDrago: eventfulDragoReducer,
    transactionsVault: eventfulVaultReducer
  });

}

var Reducers = new reducers();
export { Reducers };