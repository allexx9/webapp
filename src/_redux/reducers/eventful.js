// Copyright 2016-2017 Rigo Investment Sarl.

import initialState from './initialState'
import {
  UPDATE_TRANSACTIONS_DRAGO_HOLDER,
  UPDATE_TRANSACTIONS_DRAGO_MANAGER,
  UPDATE_TRANSACTIONS_VAULT_HOLDER,
  UPDATE_TRANSACTIONS_VAULT_MANAGER
} from '../../_utils/const'

export function eventfulDragoReducer(state = initialState.transactionsDrago, action) {
  switch (action.type) {
    case UPDATE_TRANSACTIONS_DRAGO_HOLDER:
      return {
        ...state,
        holder: {
          balances: action.payload[0],
          logs: action.payload[1]         
        }
      };
      case UPDATE_TRANSACTIONS_DRAGO_MANAGER:
      return {
        ...state,
        manager: {
          list: action.payload[2],
          logs: action.payload[1]         
        }
      };
    default: return state;
  }
}

export function eventfulVaultReducer(state = initialState.transactionsVault, action) {
  switch (action.type) {
    case UPDATE_TRANSACTIONS_VAULT_HOLDER:
      return {
        ...state,
        holder: {
          balances: action.payload[0],
          logs: action.payload[1]         
        }
      };
      case UPDATE_TRANSACTIONS_VAULT_MANAGER:
      return {
        ...state,
        manager: {
          list: action.payload[2],
          logs: action.payload[1]         
        }
      };
    default: return state;
  }
}