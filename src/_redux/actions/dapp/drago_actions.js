import * as TYPE_ from '../const'

export const getTokenBalancesDrago = (dragoDetails, relay) => {
  return {
    type: TYPE_.GET_TOKEN_BALANCES_DRAGO,
    payload: {
      dragoDetails,
      relay
    }
  }
}
export const getAssetsPriceData = (assets, networkId, quoteToken) => {
  return {
    type: TYPE_.FETCH_ASSETS_PRICE_DATA,
    payload: {
      assets,
      networkId,
      quoteToken
    }
  }
}
export const updateDragoSelectedDetails = (
  data = {},
  meta = { updateCache: true },
  options = { reset: false }
) => {
  switch (options.reset) {
    case true:
      return {
        type: TYPE_.DRAGO_SELECTED_DETAILS_RESET,
        payload: data
      }
    case false:
      return {
        type: TYPE_.DRAGO_SELECTED_DETAILS_UPDATE,
        payload: data,
        meta
      }
    default:
  }
}
export const updateDragoTransactionsHolder = results => {
  return {
    type: TYPE_.DRAGO_HOLDER_TRANSACTIONS_UPDATE,
    payload: results
  }
}
export const updateDragoTransactionsManager = results => {
  return {
    type: TYPE_.DRAGO_MANAGER_TRANSACTIONS_UPDATE,
    payload: results
  }
}
