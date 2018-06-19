// Copyright 2016-2017 Rigo Investment Sarl.

import {
  UPDATE_INTERFACE,
  UPDATE_SELECTED_DRAGO_DETAILS,
  FETCH_ASSETS_PRICE_DATA,
  UPDATE_SELECTED_VAULT_DETAILS
} from './const'

class actions {

  drago = {
    updateSelectedDragoAction: (results) => {
      return {
        type: UPDATE_SELECTED_DRAGO_DETAILS,
        payload: results
      }
    },
    getAssetsPriceData: (assets, networkId, quoteToken) => {
      return {
        type: FETCH_ASSETS_PRICE_DATA,
        payload: {
          assets,
          networkId,
          quoteToken
        }
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
  }

  endpoint = {
    updateInterfaceAction: (endpoint) => {
      return {
        type: UPDATE_INTERFACE,
        payload: endpoint
      }
    }
  }

}

var Actions = new actions();
export { Actions };