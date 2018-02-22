// Copyright 2016-2017 Rigo Investment Sarl.

import {
  MSG_NETWORK_STATUS_OK,
  NETWORK_OK,
} from '../utils/const'
import utils from '../utils/utils'
import transactionsReducer from './transactions'
import usersReducer from './users'
import endpointsReducer from './endpoints'
import {IS_MANAGER} from '../utils/const'
import {combineReducers } from "redux"

class reducers {

  initialState = {
    transactions: {
      queue: new Map(),
    },
    endpoint: {
      accounts: [],
      accountsBalanceError: false,
      rigoTokenBalance: null,
      ethBalance: null,
      networkError: NETWORK_OK,
      networkStatus: MSG_NETWORK_STATUS_OK,
      warnMsg: null,
      loading: true,
      prevBlockNumber: "0"
    },
    user :{
      isManager: utils.isManager()
    }
  };
  
  rootReducer = combineReducers({
    transactions: transactionsReducer,
    user: usersReducer,
    endpoint: endpointsReducer
  });

  reducer = (state, action) => {
    console.log('Reducer loaded.')
    console.log('PrevState: ', state)
    console.log('Action: ', action)
    var endpoint = {}
    switch (action.type) {
      case `ADD_TRANSACTION`:
        var transactions = Object.assign({}, state.transactions)
        transactions.queue.set(action.transaction.transactionId, action.transaction.transactionDetails)
        return {
          ...state,
          transactions
        };
      case `UPDATE_TRANSACTIONS`:
        return {
          ...state,
          transactions: {
            queue: new Map(action.transactions)
          }
        };
      case `ATTACH_INTERFACE_PENDING`:
        return state;
      case `ATTACH_INTERFACE_FULFILLED`:
        endpoint = { ...state.endpoint, ...{ ...action.payload }, isFulfilled: true }
        // var endpoint = { ...action.payload, isFulfilled: true }
        return {
          ...state, endpoint
        };
      case `ATTACH_INTERFACE_REJECTED`:
  
        return {
          isRejected: true,
          interface: action.payload
        };
      case `UPDATE_INTERFACE`:
      endpoint = { ...state.endpoint, ...{...action.payload } }
      return {
        ...state, endpoint
      };
      case IS_MANAGER:
      var isManager = action.payload
      return {
        ...state, isManager
      };
      default: return state;
    }
  }

}

var Reducers = new reducers();
export { Reducers };