import BigNumber from 'bignumber.js';
import { APP_VERSION } from './version'

export { APP_VERSION  }
export const UNLIMITED_ALLOWANCE_IN_BASE_UNITS = new BigNumber(2).pow(256).minus(1)

export const APP = "app";
export const DS = "/";
export const DRG_ISIN = "DR";
export const LOGGER = true;
// Set connetions to production server
export const PROD = false;
// Set connetions to WebSocketSecure or HTTPs
export const WS = true;
// Address of the Parity registry of smart contracts
export const REGISTRY_KOVAN = '0xfAb104398BBefbd47752E7702D9fE23047E1Bca3';
// Address of RigoToken GRG
// export const GRG_ADDRESS_KV = "0x56B28058d303bc0475a34D439aa586307adAc1f5";

export const GRG = "GRG"
export const ETH = "ETH"

export * from './tokens';

export const RELAYS = {
  ERCdEX: {
    name: 'ERCdEX',
    icon: 'ercdex.png',
    supported: true,
    onlyAggregateOrderbook: false
  },
  Ethfinex: {
    name: 'Ethfinex',
    icon: 'ethfinex.png',
    supported: true,
    onlyAggregateOrderbook: true
  }
}

// export const ERCdEX = "ERCdEX"
// export const Ethfinex = "Ethfinex"

// Blockchain endpoint
export const EP_INFURA_KV = "https://kovan.infura.io/metamask"
export const EP_INFURA_RP = "https://ropsten.infura.io/metamask"
export const EP_INFURA_MN = "https://mainnet.infura.io/metamask"
export const EP_INFURA_KV_WS = "wss://kovan.infura.io/ws"
export const EP_INFURA_RP_WS = "wss://ropsten.infura.io/ws"
export const EP_INFURA_MN_WS = "wss://mainnet.infura.io/ws"

// Parity on ports 85xx
export const EP_RIGOBLOCK_KV_DEV = "https://srv03.endpoint.network:8545"
export const EP_RIGOBLOCK_KV_DEV_WS = "wss://srv03.endpoint.network:8546"
export const EP_RIGOBLOCK_KV_PROD = "https://kovan.endpoint.network:8545"
export const EP_RIGOBLOCK_KV_PROD_WS = "wss://kovan.endpoint.network:8546"

// Parity on ports 86xx
export const EP_RIGOBLOCK_RP_DEV = "https://srv03.endpoint.network:8645"
export const EP_RIGOBLOCK_RP_DEV_WS = "wss://srv03.endpoint.network:8646"
export const EP_RIGOBLOCK_RP_PROD = "https://ropsten.endpoint.network:8645"
export const EP_RIGOBLOCK_RP_PROD_WS = "wss://ropsten.endpoint.network:8646"

// Parity on ports 87xx
export const EP_RIGOBLOCK_MN_DEV = "https://srv03.endpoint.network:8745"
export const EP_RIGOBLOCK_MN_DEV_WS = "wss://srv03.endpoint.network:8746"
export const EP_RIGOBLOCK_MN_PROD = "https://mainnet.endpoint.network:8745"
export const EP_RIGOBLOCK_MN_PROD_WS = "wss://mainnet.endpoint.network:8746"

// Allowed endpoints in config section
export const INFURA = 'infura'
export const RIGOBLOCK = 'rigoblock'
export const LOCAL = 'local'
export const CUSTOM = 'custom'
export const ALLOWED_ENDPOINTS = [
  ['infura', false],
  ['rigoblock', false],
  ['local', false],
  ['custom', false],
]
export const PARITY_NETWORKS_ID = {
  kovan: 42,
  ropsten: 3,
  foundation: 1
}
export const DEFAULT_ENDPOINT = 'rigoblock';
// Please refert to the following link for network IDs
// https://github.com/ethereum/EIPs/blob/master/EIPS/eip-155.md
// kovan = 42
export const DEFAULT_NETWORK_NAME = 'kovan';
export const DEFAULT_NETWORK_ID = 42;
export const DEFAULT_ETHERSCAN = "https://kovan.etherscan.io/"


export const NETWORK_OK = "networkOk"
export const NETWORK_WARNING = "networkWarning"

export const KOVAN = "kovan"
export const KOVAN_ID = 42
export const ROPSTEN = "ropsten"
export const ROPSTEN_ID = 3
export const MAINNET = "mainnet"
export const MAINNET_ID = 1

export const KOVAN_ETHERSCAN = "https://kovan.etherscan.io/"
export const ROPSTEN_ETHERSCAN = "https://ropsten.etherscan.io/"
export const MAINNET_ETHERSCAN = "https://etherscan.io"

export const ENDPOINTS = {
  infura: {
    name: "infura",
    https: {
      kovan: {
        dev: "https://kovan.infura.io/metamask",
        prod: "https://kovan.infura.io/metamask"
      },
      ropsten: {
        dev: "https://ropsten.infura.io/metamask",
        prod: "https://ropsten.infura.io/metamask"
      },
      mainnet: {
        dev: "https://mainnet.infura.io/metamask",
        prod: "https://mainnet.infura.io/metamask"
      },
    },
    wss: {
      kovan: {
        dev: "wss://kovan.infura.io/ws",
        prod: "wss://kovan.infura.io/ws"
      },
      ropsten: {
        dev: "wss://ropsten.infura.io/ws",
        prod: "wss://ropsten.infura.io/ws"
      },
      mainnet: {
        dev: "wss://mainnet.infura.io/ws",
        prod: "wss://mainnet.infura.io/ws"
      },
    }
  },
  rigoblock: {
    name: "rigoblock",
    https: {
      kovan: {
        dev: "https://srv03.endpoint.network:8545",
        prod: "https://kovan.endpoint.network:8545"
      },
      ropsten: {
        dev: "https://srv03.endpoint.network:8645",
        prod: "https://ropsten.endpoint.network:8645"
      },
      mainnet: {
        dev: "wss://mainnet.endpoint.network:8945",
        prod: "https://mainnet.endpoint.network:8945"
      },
    },
    wss: {
      kovan: {
        dev: "wss://srv03.endpoint.network:8546",
        prod: "wss://kovan.endpoint.network:8546"
      },
      ropsten: {
        dev: "wss://srv03.endpoint.network:8646",
        prod: "wss://ropsten.endpoint.network:8646"
      },
      mainnet: {
        dev: "wss://mainnet.endpoint.network:8946",
        prod: "wss://mainnet.endpoint.network:8946"
      },
    }
  },
  local: {
    name: "local",
    https: {
      kovan: {
        dev: "http://localhost:8545",
        prod: "http://localhost:8545"
      },
      ropsten: {
        dev: "http://localhost:8545",
        prod: "http://localhost:8545"
      },
      mainnet: {
        dev: "http://localhost:8545",
        prod: "http://localhost:8545"
      },
    },
    wss: {
      kovan: {
        dev: "ws://localhost:8546",
        prod: "ws://localhost:8546"
      },
      ropsten: {
        dev: "ws://localhost:8546",
        prod: "ws://localhost:8546"
      },
      mainnet: {
        dev: "ws://localhost:8546",
        prod: "ws://localhost:8546"
      },
    }
  }, 
}


export const NETWORKS = {
  kovan: {
    id: 42,
    name: "kovan",
    etherscan: "https://kovan.etherscan.io/",
    zeroExExchangeContractAddress: "0x90fe2af704b34e0224bf2299c838e04d4dcf1364"
  },
  ropsten: {
    id: 3,
    name: "ropsten",
    etherscan: "https://ropsten.etherscan.io/",
    fundProxyContractAddress: ""
  },
  mainnet: {
    id: 1,
    name: "mainnet",
    etherscan: "https://etherscan.io",
    zeroExExchangeContractAddress: "0x12459c951127e0c374ff9105dda097662a027093"
  }, 
}

export const EXCHANGES = {
  zeroEx: {
    kovan :{
      tokenTransferProxyAddress: "0x087eed4bc1ee3de49befbd66c662b434b15d49d4",
      exchangeContractAddress: "0x90fe2af704b34e0224bf2299c838e04d4dcf1364", 
      networkId: 42
    },
    ropsten :{
      tokenTransferProxyAddress: "0x4e9aad8184de8833365fea970cd9149372fdf1e6",
      exchangeContractAddress: "0x479cc461fecd078f766ecc58533d6f69580cf3ac", 
      networkId: 3
    },
    mainnet:{

    }
  },
  rigoBlock: {
    kovan: {
      tokenTransferProxy: "0xcc040edf6e508c4372a62b1a902c69dcc52ceb1d",
      exchangeContractAddress: "0xf307de6528fa16473d8f6509b7b1d8851320dba5",
      networkId: 42
    },
    mainnet:{

    }
  }
}

export const defaultDragoDetails = {
  address: '0x0',
  name: 'Null',
  symbol: 'Null',
  dragoId: 'Null',
  addressOwner: '0x0',
  addressGroup: '0x0',
  sellPrice: '0.0000',
  buyPrice: '0.0000',
  fee: '0.0000',
  created: '0000-00-00',
  totalSupply: '0.0000',
  dragoETHBalance: '0.0000',
  dragoWETHBalance: '0.0000',
}

export const poolStyle = {
  drago: {
    color: "#054186"
  },
  vault: {
    color: "#607D8B"
  },
  
}

// Default messages
export const MSG_NO_SUPPORTED_NETWORK = "We have detected that MetaMask is not connected to the correct network."
export const MSG_NETWORK_STATUS_OK = "Service is operating normally."
export const MSG_NETWORK_STATUS_ERROR = "Service disruption. Cannot update accounts balances. Account balances could be out of date."

// Redux actions
// Interface
export const ATTACH_INTERFACE = 'ATTACH_INTERFACE'
export const UPDATE_INTERFACE = 'UPDATE_INTERFACE'
export const ATTACH_INTERFACE_PENDING = 'ATTACH_INTERFACE_PENDING'
export const ATTACH_INTERFACE_FULFILLED = 'ATTACH_INTERFACE_FULFILLED'
export const ATTACH_INTERFACE_REJECTED = 'ATTACH_INTERFACE_REJECTED'

// User
export const IS_MANAGER = 'IS_MANAGER'

// Transactions
export const ADD_TRANSACTION = 'ADD_TRANSACTION'
export const UPDATE_TRANSACTIONS = 'UPDATE_TRANSACTIONS'

// Eventful
export const UPDATE_TRANSACTIONS_DRAGO_HOLDER = 'UPDATE_TRANSACTIONS_DRAGO_HOLDER'
export const UPDATE_TRANSACTIONS_DRAGO_MANAGER = 'UPDATE_TRANSACTIONS_DRAGO_MANAGER'
export const UPDATE_TRANSACTIONS_VAULT_HOLDER = 'UPDATE_TRANSACTIONS_VAULT_HOLDER'
export const UPDATE_TRANSACTIONS_VAULT_MANAGER = 'UPDATE_TRANSACTIONS_VAULT_MANAGER'
export const UPDATE_SELECTED_DRAGO_DETAILS = 'UPDATE_SELECTED_DRAGO_DETAILS'

// Notification
export const INIT_NOTIFICATION = 'INIT_NOTIFICATION'

// EXCHANGE

// User oders
export const FETCH_FUND_ORDERS = 'FETCH_FUND_ORDERS'
export const UPDATE_FUND_ORDERS = 'UPDATE_FUND_ORDERS'

// Market
export const UPDATE_MARKET_DATA = 'UPDATE_MARKET_DATA'
export const FETCH_MARKET_PRICE_DATA = 'FETCH_MARKET_PRICE_DATA'
export const FETCH_HISTORY_TRANSACTION_LOGS = 'FETCH_HISTORY_TRANSACTION_LOGS'
export const UPDATE_HISTORY_TRANSACTION_LOGS = 'UPDATE_HISTORY_TRANSACTION_LOGS'
export const FETCH_ASSETS_PRICE_DATA = 'FETCH_ASSETS_PRICE_DATA'


// UI Elements
export const UPDATE_ELEMENT_LOADING = 'UPDATE_ELEMENT_LOADING'

// Account
export const SET_MAKER_ADDRESS = 'SET_MAKER_ADDRESS'

// Order selection
export const UPDATE_SELECTED_FUND = 'UPDATE_SELECTED_FUND'
export const UPDATE_SELECTED_ORDER = 'UPDATE_SELECTED_ORDER'
export const ORDER_UPDATE_FROM_RELAY = 'ORDER_UPDATE_FROM_RELAY'
export const UPDATE_TRADE_TOKENS_PAIR = 'UPDATE_TRADE_TOKENS_PAIR'
export const CANCEL_SELECTED_ORDER = 'CANCEL_SELECTED_ORDER'

// Orderbook
export const ORDERBOOK_UPDATE = 'ORDERBOOK_UPDATE'
export const ORDERBOOK_INIT = 'ORDERBOOK_INIT'
export const SET_ORDERBOOK_AGGREGATE_ORDERS = 'SET_ORDERBOOK_AGGREGATE_ORDERS'

// Websocket
export const RELAY_OPEN_WEBSOCKET = 'RELAY_OPEN_WEBSOCKET'
export const RELAY_MSG_FROM_WEBSOCKET = 'RELAY_MSG_FROM_WEBSOCKET'
export const RELAY_CLOSE_WEBSOCKET = 'RELAY_CLOSE_WEBSOCKET'
export const RELAY_GET_ORDERS = 'RELAY_GET_ORDERS'
export const RELAY_UPDATE_ORDERS = 'RELAY_UPDATE_ORDERS'

// Tokens
export const SET_TOKEN_ALLOWANCE = 'SET_TOKEN_ALLOWANCE'
export const GET_PRICES_BITFINEXE = 'GET_PRICES_BITFINEX'
export const TOKEN_PRICE_TICKER_OPEN_WEBSOCKET = "TOKEN_PRICE_TICKER_OPEN_WEBSOCKET"
export const TOKENS_TICKERS_UPDATE = "TOKENS_TICKERS_UPDATE"
export const TOKEN_PRICE_TICKER_CLOSE_WEBSOCKET = "TOKEN_PRICE_TICKER_CLOSE_WEBSOCKET"
export const UPDATE_FUND_LIQUIDITY = "UPDATE_FUND_LIQUIDITY"




