// Copyright 2016-2017 Rigo Investment Sarl.

import * as TYPE_ from './const'

const endpoint = {
  attachInterface: endpoint => {
    return {
      type: TYPE_.ATTACH_INTERFACE,
      payload: {
        endpoint
      }
    }
  },
  checkMetaMaskIsUnlocked: () => {
    return {
      type: TYPE_.CHECK_METAMASK_IS_UNLOCKED,
      payload: {}
    }
  },
  checkIsConnectedToNode: () => {
    return {
      type: TYPE_.CHECK_APP_IS_CONNECTED,
      payload: {}
    }
  },
  getAccountsTransactions: (dragoAddress, accounts, options) => {
    return {
      type: TYPE_.GET_ACCOUNTS_TRANSACTIONS,
      payload: {
        dragoAddress,
        accounts,
        options
      }
    }
  },
  monitorAccountsStart: () => {
    return {
      type: TYPE_.MONITOR_ACCOUNTS_START,
      payload: {}
    }
  },
  monitorAccountsStop: () => {
    return {
      type: TYPE_.MONITOR_ACCOUNTS_STOP,
      payload: {}
    }
  },
  updateInterface: endpoint => {
    return {
      type: TYPE_.UPDATE_INTERFACE,
      payload: endpoint
    }
  }
}

export default endpoint
