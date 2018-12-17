import * as TYPE_ from '../const'

export const updateVaultSelectedDetails = (results = {}) => {
  return {
    type: TYPE_.VAULT_SELECTED_DETAILS_UPDATE,
    payload: results
  }
}
export const resetVaultSelectedDetails = () => {
  return {
    type: TYPE_.VAULT_SELECTED_DETAILS_RESET
  }
}
export const updateVaultTransactionsHolder = results => {
  return {
    type: TYPE_.VAULT_HOLDER_TRANSACTIONS_UPDATE,
    payload: results
  }
}

export const updateVaultTransactionsManager = results => {
  return {
    type: TYPE_.VAULT_MANAGER_TRANSACTIONS_UPDATE,
    payload: results
  }
}
