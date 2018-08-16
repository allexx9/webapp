// Copyright 2016-2017 Rigo Investment Sagl.

import {
  UPDATE_SELECTED_DRAGO_DETAILS,
  FETCH_ASSETS_PRICE_DATA,
  UPDATE_TRANSACTIONS_DRAGO_HOLDER,
  UPDATE_TRANSACTIONS_DRAGO_MANAGER,
  GET_TOKEN_BALANCES_DRAGO
} from './const'

const drago = {
  getTokenBalancesDrago: (dragoDetails, api) => {
    return {
      type: GET_TOKEN_BALANCES_DRAGO,
      payload: {
        dragoDetails,
        api,
      }
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
  updateSelectedDragoAction: (results) => {
    return {
      type: UPDATE_SELECTED_DRAGO_DETAILS,
      payload: results
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