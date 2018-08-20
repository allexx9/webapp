// Copyright 2016-2017 Rigo Investment Sarl.

import * as TYPE_ from './const'

const endpoint = {
  checkMetaMaskIsUnlocked: (api, web3) => {
    return {
      type: TYPE_.CHECK_METAMASK_IS_UNLOCKED,
      payload: {
        api,
        web3,
      }
    }
  },
  getAccountsTransactions: (api, dragoAddress, accounts, options) => {
    return {
      type: TYPE_.GET_ACCOUNTS_TRANSACTIONS,
      payload: {
        api,
        dragoAddress,
        accounts,
        options
      }
    }
  },
  monitorAccounts: (api) => {
    return {
      type: TYPE_.MONITOR_ACCOUNTS,
      payload: {
        api,
      }
    }
  },
  updateInterfaceAction: (endpoint) => {
    return {
      type: TYPE_.UPDATE_INTERFACE,
      payload: endpoint
    }
  }
}

export default endpoint;