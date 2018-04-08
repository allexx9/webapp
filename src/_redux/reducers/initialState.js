// Copyright 2016-2017 Rigo Investment Sarl.

import {
  DEFAULT_ENDPOINT,
  DEFAULT_NETWORK_NAME,
  MSG_NETWORK_STATUS_OK,
  NETWORK_OK,
  ENDPOINTS,
  NETWORKS,
} from '../../_utils/const'
import BigNumber from 'bignumber.js';

const initialState = {
  transactions: {
    queue: new Map(),
  },
  transactionsDrago: {
    holder: {
      balances: [],
      logs: []
    },
    manager: {
      list: [],
      logs: []
    }
  },
  transactionsVault: {
    holder: {
      balances: [],
      logs: []
    },
    manager: {
      list: [],
      logs: []
    }
  },
  endpoint: {
    accounts: [],
    accountsBalanceError: false,
    ethBalance: new BigNumber(0),
    endpointInfo: ENDPOINTS[DEFAULT_ENDPOINT],
    networkInfo: NETWORKS[DEFAULT_NETWORK_NAME],
    loading: true,
    networkError: NETWORK_OK,
    networkStatus: MSG_NETWORK_STATUS_OK,
    prevBlockNumber: "0",
    rigoTokenBalance: null,
    warnMsg: null,
  },
  user :{
    isManager: false
  }
};

export default initialState