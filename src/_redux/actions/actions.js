// Copyright 2016-2017 Rigo Investment Sarl.

import {
  UPDATE_INTERFACE,
  UPDATE_SELECTED_DRAGO_DETAILS,
  FETCH_ASSETS_PRICE_DATA,
  UPDATE_SELECTED_VAULT_DETAILS,
  IS_MANAGER,
  UPDATE_TRANSACTIONS_VAULT_HOLDER,
  UPDATE_TRANSACTIONS_VAULT_MANAGER,
  UPDATE_TRANSACTIONS_DRAGO_HOLDER,
  UPDATE_TRANSACTIONS_DRAGO_MANAGER,
  INIT_NOTIFICATION,
  TOKEN_PRICE_TICKER_OPEN_WEBSOCKET
} from './const'

class actions {

  drago = {
    updateSelectedDragoAction: (results) => {
      return {
        type: UPDATE_SELECTED_DRAGO_DETAILS,
        payload: results
      }
    },
    getAssetsPriceDataAction: (assets, networkId, quoteToken) => {
      return {
        type: FETCH_ASSETS_PRICE_DATA,
        payload: {
          assets,
          networkId,
          quoteToken
        }
      }
    },
    updateTransactionsDragoHolderAction: (results) => {
      return {
        type: UPDATE_TRANSACTIONS_DRAGO_HOLDER,
        payload: results
      }
    },
    updateTransactionsDragoManagerAction: (results) => {
      return {
        type: UPDATE_TRANSACTIONS_DRAGO_MANAGER,
        payload: results
      }
    }
  }

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

  endpoint = {
    updateInterfaceAction: (endpoint) => {
      return {
        type: UPDATE_INTERFACE,
        payload: endpoint
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

  tokens = {
    priceTickerOpenWsAction: () => {
      return {
        type: TOKEN_PRICE_TICKER_OPEN_WEBSOCKET,
      }
    }
  }

}

var Actions = new actions();
export { Actions };