// Copyright 2016-2017 Rigo Investment Sagl.

import { combineReducers } from 'redux'
import { eventfulDragoReducer, eventfulVaultReducer } from './eventful_reducer'
import endpointsReducer from './endpoint_reducer'
// import exchangeReducer, { ordersReducer } from './exchange_reducer'
import { appReducer, poolsListReducer } from './dapp'
import exchangeReducer from './exchange_reducer'
import notificationsReducer from './notifications_reducer'
import transactionsReducer from './transactions_reducer'
import usersReducer from './users_reducer'

class reducers {
  rootReducer = combineReducers({
    app: appReducer,
    exchange: exchangeReducer,
    transactions: transactionsReducer,
    user: usersReducer,
    endpoint: endpointsReducer,
    poolsList: poolsListReducer,
    transactionsDrago: eventfulDragoReducer,
    transactionsVault: eventfulVaultReducer,
    notifications: notificationsReducer
  })
}

let Reducers = new reducers()
export { Reducers }
