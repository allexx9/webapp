// Copyright 2016-2017 Rigo Investment Sagl.

import {
  UPDATE_SELECTED_VAULT_DETAILS,
  IS_MANAGER,
  UPDATE_TRANSACTIONS_VAULT_HOLDER,
  UPDATE_TRANSACTIONS_VAULT_MANAGER,
  INIT_NOTIFICATION,
} from './const'
import app from './app_actions'
import drago from './drago_actions'
import transactions from './transactions'
import endpoint from './endpoint_actions'
import exchange from './exchange'
import tokens from './tokens'

class actions {

  app = app

  drago = drago

  exchange = exchange

  endpoint = endpoint

  transactions = transactions

  vault = {
    updateSelectedVaultAction: (results) => {
      return {
        type: UPDATE_SELECTED_VAULT_DETAILS,
        payload: results
      }
    },
    updateTransactionsVaultHolderAction: (results) => {
      return {
        type: UPDATE_TRANSACTIONS_VAULT_HOLDER,
        payload: results
      }
    },
    updateTransactionsVaultManagerAction: (results) => {
      return {
        type: UPDATE_TRANSACTIONS_VAULT_MANAGER,
        payload: results
      }
    }
  }

  users = {
    isManagerAction: (isManager) => {
      return {
        type: IS_MANAGER,
        payload: isManager
      }
    }
  }

  notifications = {
    initNotificationsSystemAction: (notificationSystem) => {
      return {
        type: INIT_NOTIFICATION,
        payload: notificationSystem
      }
    }
  }

  tokens = tokens

}

let Actions = new actions();
export { Actions };