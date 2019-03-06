import {
  DEFAULT_NETWORK_NAME,
  ERC20_TOKENS,
  //ERCdEX,
  Ethfinex,
  EXCHANGES,
  RELAYS,
  TRADE_TOKENS_PAIRS
} from '../../../_utils/const'
import BigNumber from 'bignumber.js'

const NETWORK_NAME = DEFAULT_NETWORK_NAME
const BASE_TOKEN = ERC20_TOKENS[NETWORK_NAME].ETH // ZRX
const QUOTE_TOKEN = ERC20_TOKENS[NETWORK_NAME].USDT // WETH

export const exchange = {
  tradesHistory: [],
  ui: {
    panels: {
      relayBox: {
        expanded: true,
        disabled: true,
        disabledMsg: ''
      },
      orderBox: {
        expanded: true,
        disabled: true,
        disabledMsg: ''
      },
      ordersHistoryBox: {
        expanded: true,
        disabled: false,
        disabledMsg: ''
      },
      chartBox: {
        expanded: true,
        disabled: false,
        disabledMsg: '',
        loading: {
          isLoading: true,
          isError: false,
          errorMsg: '',
          reduxRetryAction: {}
        }
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
  selectedExchange: EXCHANGES.Ethfinex[NETWORK_NAME], // ERCdEX
  selectedRelay: RELAYS[Ethfinex], // ERCdEX
  availableRelays: {},
  selectedTokensPair: {
    baseToken: BASE_TOKEN,
    quoteToken: QUOTE_TOKEN,
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
    //url: 'https://api.ercdex.com/api/standard',
    url: 'https://test.ethfinex.com/trustless/v1/w/on',
    networkId: '42'
  },
  prices: {
    previous: {},
    current: {}
  }
}
