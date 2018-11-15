import {
  DEFAULT_NETWORK_NAME,
  ERC20_TOKENS,
  ERCdEX,
  EXCHANGES,
  RELAYS,
  TRADE_TOKENS_PAIRS
} from '../../../_utils/const'
import BigNumber from 'bignumber.js'

const NETWORK_NAME = DEFAULT_NETWORK_NAME
const BASE_TOKEN = ERC20_TOKENS[NETWORK_NAME].ZRX
const QUOTE_TOKEN = ERC20_TOKENS[NETWORK_NAME].WETH

export const exchange = {
  tradesHistory: [],
  ui: {
    panels: {
      relayBox: {
        expanded: true
      },
      orderBox: {
        expanded: true
      },
      ordersHistoryBox: {
        expanded: true
      }
    }
  },
  loading: {
    liquidity: true,
    orderSummary: true,
    orderBox: true,
    marketBox: true
  },
  availableFunds: [],
  chartData: [],
  selectedFund: {
    details: {},
    liquidity: {
      loading: true,
      ETH: new BigNumber(0),
      WETH: new BigNumber(0),
      ZRX: new BigNumber(0),
      baseToken: {
        balance: new BigNumber(0),
        balanceWrapper: new BigNumber(0)
      },
      quoteToken: {
        balance: new BigNumber(0),
        balanceWrapper: new BigNumber(0)
      }
    },
    managerAccount: ''
  },
  accountSignature: {
    signature: '',
    nonce: '',
    valid: false
  },
  walletAddress: '',
  selectedExchange: EXCHANGES.ERCdEX[NETWORK_NAME],
  selectedRelay: RELAYS[ERCdEX],
  availableRelays: {},
  // selectedExchange: EXCHANGES.rigoBlock[DEFAULT_NETWORK_NAME],
  selectedTokensPair: {
    baseToken: BASE_TOKEN,
    baseTokenLockedAmount: new BigNumber(0),
    baseTokenAvailableAmount: new BigNumber(0),
    quoteToken: QUOTE_TOKEN,
    quoteTokenLockedAmount: new BigNumber(0),
    quoteTokenAvailableAmount: new BigNumber(0),
    baseTokenWrapperBalance: new BigNumber(0),
    quoteTokenWrapperBalance: new BigNumber(0),
    baseTokenAllowance: false,
    quoteTokenAllowance: false,
    baseTokenLockWrapExpire: '0',
    quoteTokenLockWrapExpire: '0',
    ticker: {
      current: {
        price: '0'
      },
      previous: {
        price: '0'
      },
      variation: 0
    }
  },
  availableTradeTokensPairs: TRADE_TOKENS_PAIRS,
  fundOrders: {
    open: [],
    history: [],
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
      baseToken: BASE_TOKEN,
      quoteToken: QUOTE_TOKEN
    }
  },
  orderBookAggregated: true,
  orderBook: {
    asks: [],
    bids: [],
    spread: '0'
  },
  relay: {
    url: 'https://api.ercdex.com/api/standard',
    networkId: '42'
  },
  prices: {
    previous: {},
    current: {}
  }
}
