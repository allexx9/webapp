// Copyright 2016-2017 Rigo Investment Sarl.

import initialState from './initialState'
import {
  ADD_TRANSACTION,
  UPDATE_TRANSACTIONS,
} from '../../_utils/const'

function transactionsReducer(state = initialState.transactions, action) {
  switch (action.type) {
    case ADD_TRANSACTION:
      var transactions = Object.assign({}, state)
      console.log(transactions)
      transactions.queue.set(action.transaction.transactionId, action.transaction.transactionDetails)
      return {
        ...state,
        ...transactions
      };
    case UPDATE_TRANSACTIONS:
      
      return {
        ...state,
        queue: new Map(action.transactions)
      };
    default: return state;
  }
}

export default transactionsReducer
