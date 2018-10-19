// Copyright 2016-2017 Rigo Investment Sagl.

import * as TYPE_ from './const'

const vault = {
  updateSelectedVault: results => {
    return {
      type: TYPE_.UPDATE_SELECTED_VAULT_DETAILS,
      payload: results
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
