// Copyright 2016-2017 Rigo Investment Sagl.

import {
  DEFAULT_ENDPOINT,
  DEFAULT_NETWORK_NAME,
  MSG_NETWORK_STATUS_OK,
  NETWORK_OK,
  ENDPOINTS,
  NETWORKS,
  ERC20_TOKENS,
  EXCHANGES,
  RELAYS,
  ERCdEX,
  Ethfinex,
  TRADE_TOKENS_PAIRS
} from '../../_utils/const'
import BigNumber from 'bignumber.js';

const initialState = {
  notifications: {
    engine: ''
  },
  exchange: {
    loading: {
      liquidity: true,
      orderSummary: true,
      orderBox: true,
      marketBox: true,
    },
    chartData: [],
    selectedFund: {
      details: {},
      liquidity: {
        ETH: new BigNumber(0),
        WETH: new BigNumber(0),
        ZRX: new BigNumber(0),
      },
      managerAccount: '',
    },
    makerAddress: '',
    selectedExchange: EXCHANGES.zeroEx[DEFAULT_NETWORK_NAME],
    selectedRelay: RELAYS[Ethfinex],
    // selectedExchange: EXCHANGES.rigoBlock[DEFAULT_NETWORK_NAME],
    selectedTokensPair: {
      baseToken: ERC20_TOKENS[DEFAULT_NETWORK_NAME].ZRX,
      quoteToken: ERC20_TOKENS[DEFAULT_NETWORK_NAME].WETH,
      baseTokenAllowance: false,
      quoteTokenAllowance: false
    },
    availableTradeTokensPairs: TRADE_TOKENS_PAIRS,
    fundOrders: {
      open: [],
      cancelled: [],
      executed: []
    },
    selectedOrder: {
      details: {},
      orderAmountError: true,
      orderPriceError: true,
      orderFillAmount: '0',
      orderMaxAmount: '0',
      orderPrice: '0',
      orderType: 'asks',
      takerOrder: false,
      selectedTokensPair: {
        baseToken: ERC20_TOKENS[DEFAULT_NETWORK_NAME].ZRX,
        quoteToken: ERC20_TOKENS[DEFAULT_NETWORK_NAME].WETH
      },
    },
    orderBook: {
      aggregated: true,
      asks: [],
      bids: [],
      spread: '0'
    },
    relay: {
      url: 'https://api.ercdex.com/api/standard',
      networkId: '42'
    },
    prices: {}
  },
  transactions: {
    queue: new Map(),
    pending: 0
  },
  transactionsDrago: {
    holder: {
      balances: [],
      logs: []
    },
    manager: {
      list: [],
      logs: []
    },
    selectedDrago: {
      details: {},
      transactions: [],
      assets: [],
      assetsCharts: {},
    },
  },
  transactionsVault: {
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
      transactions: [],
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
    warnMsg: '',
  },
  user :{
    isManager: false
  }
};

export default initialState