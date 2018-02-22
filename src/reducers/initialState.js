// Copyright 2016-2017 Rigo Investment Sarl.

import utils from '../utils/utils'
import {
  MSG_NETWORK_STATUS_OK,
  NETWORK_OK,
} from '../utils/const'

const initialState = {
  transactions: {
    queue: new Map(),
  },
  endpoint: {
    accounts: [],
    accountsBalanceError: false,
    rigoTokenBalance: null,
    ethBalance: null,
    networkError: NETWORK_OK,
    networkStatus: MSG_NETWORK_STATUS_OK,
    warnMsg: null,
    loading: true,
    prevBlockNumber: "0"
  },
  user :{
    isManager: utils.isManager()
  }
};

export default initialState