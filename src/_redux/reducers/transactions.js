// Copyright 2016-2017 Rigo Investment Sarl.

import initialState from './initialState'
import {
  ADD_TRANSACTION,
  UPDATE_TRANSACTIONS,
} from '../../_utils/const'

function transactionsReducer(state = initialState.transactions, action) {
  var pendingTransactions = 0
  switch (action.type) {
    case ADD_TRANSACTION:
      var transactions = Object.assign({}, state)
      transactions.queue.set(action.payload.transactionId, action.payload.transactionDetails)
      transactions.queue.forEach((value) => {
        if (value.status !== 'executed' && value.status !== 'error') {
          pendingTransactions = pendingTransactions + 1
        }
      })
      transactions.pending = pendingTransactions
      return {
        ...state,
        ...transactions,
      };
    case UPDATE_TRANSACTIONS:
      pendingTransactions = 0
      transactions = new Map(action.transactions)
      transactions.forEach((value) => {
        if (value.status !== 'executed' && value.status !== 'error') {
          pendingTransactions = pendingTransactions + 1
        }
      })
      return {
        ...state,
        queue: new Map(action.transactions),
        pending: pendingTransactions
      };
    default: return state;
  }
}

export default transactionsReducer
