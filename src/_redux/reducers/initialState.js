// Copyright 2016-2017 Rigo Investment Sagl.

import {
  DEFAULT_ENDPOINT,
  DEFAULT_NETWORK_NAME,
  ENDPOINTS,
  MSG_NETWORK_STATUS_OK,
  NETWORKS,
  NETWORK_OK
} from '../../_utils/const'

import { exchange } from './initialState/index'

import BigNumber from 'bignumber.js'

const initialState = {
  app: {
    isConnected: false,
    isSyncing: false,
    syncStatus: {},
    appLoading: true,
    retryTimeInterval: 0,
    connectionRetries: 0,
    lastBlockNumberUpdate: 0,
    accountsAddressHash: '',
    errorEventfulSubscription: false,
    config: {
      isMock: false
    },
    transactionsDrawerOpen: false
  },
  notifications: {
    engine: ''
  },
  exchange: exchange,
  transactions: {
    queue: new Map(),
    pending: 0
  },
  transactionsDrago: {
    dragosList: {
      list: [],
      lastFetchRange: {
        chunk: {
          key: 0,
          toBlock: 0,
          fromBlock: 0
        },
        startBlock: 0,
        lastBlock: 0
      }
    },
    holder: {
      balances: [],
      logs: []
    },
    manager: {
      list: [],
      logs: []
    },
    selectedDrago: {
      values: {
        portfolioValue: -1,
        totalAssetsValue: -1,
        estimatedPrice: -1
      },
      details: {},
      transactions: [],
      assets: [],
      assetsCharts: {}
    }
  },
  transactionsVault: {
    vaultsList: {
      list: [],
      lastFetchRange: {
        chunk: {
          key: 0,
          toBlock: 0,
          fromBlock: 0
        },
        startBlock: 0,
        lastBlock: 0
      }
    },
    holder: {
      balances: [],
      logs: []
    },
    manager: {
      list: [],
      logs: []
    },
    selectedVault: {
      details: {},
      transactions: []
    }
  },
  endpoint: {
    accounts: [],
    accountsBalanceError: false,
    ethBalance: new BigNumber(0),
    grgBalance: new BigNumber(0),
    endpointInfo: ENDPOINTS[DEFAULT_ENDPOINT],
    networkInfo: NETWORKS[DEFAULT_NETWORK_NAME],
    loading: true,
    networkError: NETWORK_OK,
    networkStatus: MSG_NETWORK_STATUS_OK,
    prevBlockNumber: '0',
    prevNonce: '0',
    warnMsg: '',
    isMetaMaskNetworkCorrect: false,
    isMetaMaskLocked: false,
    lastMetaMaskUpdateTime: 0,
    openWalletSetup: false
  },
  user: {
    isManager: false
  }
}

export default initialState
