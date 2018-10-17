// Copyright 2016-2017 Rigo Investment Sagl.

import * as TYPE_ from './const'

const drago = {
  getTokenBalancesDrago: (dragoDetails, api, relay) => {
    return {
      type: TYPE_.GET_TOKEN_BALANCES_DRAGO,
      payload: {
        dragoDetails,
        api,
        relay
      }
    }
  },
  getPoolTransactions: (api, dragoAddress, accounts, options) => {
    return {
      type: TYPE_.GET_POOL_TRANSACTIONS,
      payload: {
        api,
        dragoAddress,
        accounts,
        options
      }
    }
  },
  getAssetsPriceDataAction: (assets, networkId, quoteToken) => {
    return {
      type: TYPE_.FETCH_ASSETS_PRICE_DATA,
      payload: {
        assets,
        networkId,
        quoteToken
      }
    }
  },
  getDragosSearchList: (
    api,
    options = {
      topics: [null, null, null, null],
      fromBlock: 0,
      toBlock: 'latest'
    }
  ) => {
    return {
      type: TYPE_.GET_DRAGOS_SEARCH_LIST,
      payload: {
        api,
        options
      }
    }
  },
  updateSelectedDragoAction: results => {
    return {
      type: TYPE_.UPDATE_SELECTED_DRAGO_DETAILS,
      payload: results
    }
  },
  updateDragosSearchList: results => {
    return {
      type: TYPE_.UPDATE_DRAGOS_LIST,
      payload: results
    }
  },
  updateTransactionsDragoHolderAction: results => {
    return {
      type: TYPE_.UPDATE_TRANSACTIONS_DRAGO_HOLDER,
      payload: results
    }
  },
  updateTransactionsDragoManagerAction: results => {
    return {
      type: TYPE_.UPDATE_TRANSACTIONS_DRAGO_MANAGER,
      payload: results
    }
  },
  updateTransactionsVaultHolderAction: results => {
    return {
      type: TYPE_.UPDATE_TRANSACTIONS_VAULT_HOLDER,
      payload: results
    }
  },
  updateTransactionsVaultManagerAction: results => {
    return {
      type: TYPE_.UPDATE_TRANSACTIONS_VAULT_MANAGER,
      payload: results
    }
  }
}

export default drago
