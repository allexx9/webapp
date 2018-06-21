// Copyright 2016-2017 Rigo Investment Sarl.

import {
  UPDATE_SELECTED_DRAGO_DETAILS,
  FETCH_ASSETS_PRICE_DATA,
  UPDATE_TRANSACTIONS_DRAGO_HOLDER,
  UPDATE_TRANSACTIONS_DRAGO_MANAGER,
} from './const'

const drago = {
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

export default drago;