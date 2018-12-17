import * as TYPE_ from '../const'

export const updateVaultSelectedDetails = (
  results = {},
  options = { reset: false }
) => {
  switch (options.reset) {
    case true:
      return {
        type: TYPE_.VAULT_SELECTED_DETAILS_RESET,
        payload: results
      }
    case false:
      return {
        type: TYPE_.VAULT_SELECTED_DETAILS_UPDATE,
        payload: results
      }
    default:
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
