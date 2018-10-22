// Copyright 2016-2017 Rigo Investment Sagl.

import * as TYPE_ from './const'

const vault = {
  updateSelectedVault: (results = {}, options = { reset: false }) => {
    console.log(options)
    switch (options.reset) {
      case true:
        return {
          type: TYPE_.UPDATE_SELECTED_VAULT_DETAILS_RESET,
          payload: results
        }
      case false:
        return {
          type: TYPE_.UPDATE_SELECTED_VAULT_DETAILS,
          payload: results
        }
      default:
        return {
          type: TYPE_.UPDATE_SELECTED_VAULT_DETAILS,
          payload: results
        }
    }
  },
  updateTransactionsVaultHolder: results => {
    return {
      type: TYPE_.UPDATE_TRANSACTIONS_VAULT_HOLDER,
      payload: results
    }
  },
  updateTransactionsVaultManager: results => {
    return {
      type: TYPE_.UPDATE_TRANSACTIONS_VAULT_MANAGER,
      payload: results
    }
  }
}

export default vault
