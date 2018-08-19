// Copyright 2016-2017 Rigo Investment Sarl.

import {
  CHECK_METAMASK_IS_UNLOCKED,
  UPDATE_INTERFACE,
} from './const'

const endpoint = {
  checkMetaMaskIsUnlocked: (api, web3) => {
    const payload = {
      api,
      web3,
    }
    return {
      type: CHECK_METAMASK_IS_UNLOCKED,
      payload
    }
  },
  updateInterfaceAction: (endpoint) => {
    return {
      type: UPDATE_INTERFACE,
      payload: endpoint
    }
  }
}

export default endpoint;