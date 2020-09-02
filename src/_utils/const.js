import * as HELP_ from '../_const/helpMsg'
import { APP_VERSION } from './version'
import BigNumber from 'bignumber.js'

export * from './version_git'
export { APP_VERSION }
export { HELP_ }
export const UNLIMITED_ALLOWANCE_IN_BASE_UNITS = new BigNumber(2)
  .pow(256)
  .minus(1)

export const DEBUGGING = {
  initAccountsTransactionsInEpic: true,
  DUMB_ACTION: {
    type: 'DUMB',
    payload: 'DUMB'
  }
}

export const METAMASK = 'MetaMask'
export const HTTP_EVENT_FETCHING = true
export const APP = 'app'
export const DS = '/'
export const DRG_ISIN = 'DR'
export const LOGGER = true
// Set connetions to production server
export const PROD = false
// Set connetions to WebSocketSecure or HTTPs
export const WS = false
// Address of the Parity registry of smart contracts
export const REGISTRY_KOVAN = '0xfAb104398BBefbd47752E7702D9fE23047E1Bca3'
// Address of RigoToken GRG
// export const GRG_ADDRESS_KV = "0x56B28058d303bc0475a34D439aa586307adAc1f5";

export const NULL_ADDRESS = '0x0000000000000000000000000000000000000000'

export * from './tokens'
export * from '../_const/helpMsg'

export const RELAYS = {
  ERCdEX: {
    name: 'ERCdEX',
    icon: 'ercdex.png',
    supported: true,
    initOrdeBookAggregated: false,
    onlyAggregateOrderbook: false,
    defaultTokensPair: {
      baseTokenSymbol: 'ZRX',
      quoteTokenSymbol: 'WETH'
    },
    supportedNetworks: ['42'],
    isTokenWrapper: false,
    meta: {}
  },
  Radarrelay: {
    name: 'Radarrelay',
    icon: 'radarrelay.png',
    supported: true,
    initOrdeBookAggregated: false,
    onlyAggregateOrderbook: false,
    defaultTokensPair: {
      baseTokenSymbol: 'ZRX',
      quoteTokenSymbol: 'WETH'
    },
    supportedNetworks: ['42'],
    isTokenWrapper: false,
    meta: {}
  },
  Ethfinex: {
    name: 'Ethfinex',
    icon: 'ethfinex.png',
    supported: true,
    initOrdeBookAggregated: true,
    onlyAggregateOrderbook: true,
    defaultTokensPair: {
      // baseTokenSymbol: 'GRG',
      // quoteTokenSymbol: 'ETH'
      baseTokenSymbol: 'ETH',
      quoteTokenSymbol: 'USDT'
    },
    supportedNetworks: ['1', '3', '42'],
    isTokenWrapper: true,
    meta: {}
  }
}

export const DEFAULT_RELAY = {
  kovan: 'Ethfinex',
  ropsten: 'Ethfinex',
  mainnet: 'Ethfinex'
}

// export const ERCdEX = "ERCdEX"
// export const Ethfinex = "Ethfinex"

// Blockchain endpoint
export const EP_INFURA_KV = 'https://kovan.infura.io/v3/849b88c4f4314d85ab768b15adcc99fd'
export const EP_INFURA_RP = 'https://ropsten.infura.io/v3/849b88c4f4314d85ab768b15adcc99fd'
export const EP_INFURA_MN =
  'https://mainnet.infura.io/v3/849b88c4f4314d85ab768b15adcc99fd'
export const EP_INFURA_KV_WS = 'wss://kovan.infura.io/ws/v3/849b88c4f4314d85ab768b15adcc99fd'
export const EP_INFURA_RP_WS = 'wss://ropsten.infura.io/ws/v3/849b88c4f4314d85ab768b15adcc99fd'
export const EP_INFURA_MN_WS = 'wss://mainnet.infura.io/ws/v3/849b88c4f4314d85ab768b15adcc99fd'

// Parity - Kovan
export const EP_RIGOBLOCK_KV_DEV = 'https://kovan.dev.endpoint.network/rpc'
export const EP_RIGOBLOCK_KV_DEV_WS = 'wss://kovan.dev.endpoint.network/ws'
export const EP_RIGOBLOCK_KV_PROD = 'https://kovan..dev.endpoint.network/rpc'
export const EP_RIGOBLOCK_KV_PROD_WS = 'wss://kovan.dev.endpoint.network/ws'

// Parity - Ropsten
export const EP_RIGOBLOCK_RP_DEV = 'https://ropsten.dev.endpoint.network/rpc'
export const EP_RIGOBLOCK_RP_DEV_WS = 'wss://ropsten.dev.endpoint.network/ws'
export const EP_RIGOBLOCK_RP_PROD = 'https://ropsten.dev.endpoint.network/rpc'
export const EP_RIGOBLOCK_RP_PROD_WS = 'wss://ropsten.dev.endpoint.network/ws'

// Parity - Mainnet
export const EP_RIGOBLOCK_MN_DEV = 'https://mainnet.dev.endpoint.network/rpc'
export const EP_RIGOBLOCK_MN_DEV_WS = 'wss://mainnet.dev.endpoint.network/ws'
export const EP_RIGOBLOCK_MN_PROD = 'https://mainnet.dev.endpoint.network/rpc'
export const EP_RIGOBLOCK_MN_PROD_WS = 'wss://mainnet.dev.endpoint.network/ws'

// Allowed endpoints in config section
export const INFURA = 'infura'
export const RIGOBLOCK = 'rigoblock'
export const LOCAL = 'local'
export const CUSTOM = 'custom'
export const ALLOWED_ENDPOINTS = [
  ['infura', false],
  ['rigoblock', false],
  ['local', false],
  ['custom', false]
]
export const PARITY_NETWORKS_ID = {
  kovan: 42,
  ropsten: 3,
  foundation: 1
}

export const KOVAN = 'kovan'
export const KOVAN_ID = 42
export const ROPSTEN = 'ropsten'
export const ROPSTEN_ID = 3
export const MAINNET = 'mainnet'
export const MAINNET_ID = 1

export const DEFAULT_ENDPOINT = 'infura'
// Please refert to the following link for network IDs
// https://github.com/ethereum/EIPs/blob/master/EIPS/eip-155.md
// kovan = 42
export const DEFAULT_NETWORK_NAME = MAINNET
export const DEFAULT_NETWORK_ID = ROPSTEN_ID
export const DEFAULT_ETHERSCAN = 'https://etherscan.io/'

export const NETWORK_OK = 'networkOk'
export const NETWORK_WARNING = 'networkWarning'

export const KOVAN_ETHERSCAN = 'https://kovan.etherscan.io/'
export const ROPSTEN_ETHERSCAN = 'https://ropsten.etherscan.io/'
export const MAINNET_ETHERSCAN = 'https://etherscan.io/'

//mainnet.infura.io/v3/849b88c4f4314d85ab768b15adcc99fd

export const ENDPOINTS = {
  infura: {
    name: 'infura',
    https: {
      kovan: {
        dev: 'https://kovan.infura.io/v3/849b88c4f4314d85ab768b15adcc99fd',
        prod: 'https://kovan.infura.io/v3/849b88c4f4314d85ab768b15adcc99fd'
      },
      ropsten: {
        dev: 'https://ropsten.infura.io/v3/849b88c4f4314d85ab768b15adcc99fd',
        prod: 'https://ropsten.infura.io/v3/849b88c4f4314d85ab768b15adcc99fd'
      },
      // mainnet: {
      //   dev: 'https://mainnet.infura.io/v3/849b88c4f4314d85ab768b15adcc99fd',
      //   prod: 'https://mainnet.infura.io/v3/849b88c4f4314d85ab768b15adcc99fd'
      // }
      mainnet: {
        dev: 'https://mainnet.infura.io/v3/849b88c4f4314d85ab768b15adcc99fd',
        prod: 'https://mainnet.infura.io/v3/849b88c4f4314d85ab768b15adcc99fd'
      }
    },
    wss: {
      kovan: {
        dev: 'wss://kovan.infura.io/ws/v3/849b88c4f4314d85ab768b15adcc99fd',
        prod: 'wss://kovan.infura.io/ws/v3/849b88c4f4314d85ab768b15adcc99fd'
      },
      ropsten: {
        dev: 'wss://ropsten.infura.io/ws/v3/849b88c4f4314d85ab768b15adcc99fd',
        prod: 'wss://ropsten.infura.io/ws/v3/849b88c4f4314d85ab768b15adcc99fd'
      },
      mainnet: {
        dev: 'wss://mainnet.infura.io/ws/v3/849b88c4f4314d85ab768b15adcc99fd',
        prod: 'wss://mainnet.infura.io/ws/v3/849b88c4f4314d85ab768b15adcc99fd'
      }
    }
  },
  rigoblock: {
    name: 'rigoblock',
    https: {
      kovan: {
        dev: EP_RIGOBLOCK_KV_DEV,
        prod: EP_RIGOBLOCK_KV_PROD
      },
      ropsten: {
        dev: EP_RIGOBLOCK_RP_DEV,
        prod: EP_RIGOBLOCK_RP_PROD
      },
      mainnet: {
        dev: EP_RIGOBLOCK_MN_DEV,
        prod: EP_RIGOBLOCK_MN_PROD
      }
    },
    wss: {
      kovan: {
        dev: EP_RIGOBLOCK_KV_DEV_WS,
        prod: EP_RIGOBLOCK_KV_PROD_WS
      },
      ropsten: {
        dev: EP_RIGOBLOCK_RP_DEV_WS,
        prod: EP_RIGOBLOCK_RP_PROD_WS
      },
      mainnet: {
        dev: EP_RIGOBLOCK_MN_DEV_WS,
        prod: EP_RIGOBLOCK_MN_PROD_WS
      }
    }
  },
  local: {
    name: 'local',
    https: {
      kovan: {
        dev: 'http://localhost:8545',
        prod: 'http://localhost:8545'
      },
      ropsten: {
        dev: 'http://localhost:8545',
        prod: 'http://localhost:8545'
      },
      mainnet: {
        dev: 'http://localhost:8545',
        prod: 'http://localhost:8545'
      }
    },
    wss: {
      kovan: {
        dev: 'ws://localhost:8546',
        prod: 'ws://localhost:8546'
      },
      ropsten: {
        dev: 'ws://localhost:8546',
        prod: 'ws://localhost:8546'
      },
      mainnet: {
        dev: 'ws://localhost:8546',
        prod: 'ws://localhost:8546'
      }
    }
  }
}

export const NETWORKS = {
  kovan: {
    id: 42,
    name: 'kovan',
    etherscan: 'https://kovan.etherscan.io/',
    zeroExExchangeContractAddress: '0x90fe2af704b34e0224bf2299c838e04d4dcf1364'
  },
  ropsten: {
    id: 3,
    name: 'ropsten',
    etherscan: 'https://ropsten.etherscan.io/',
    fundProxyContractAddress: ''
  },
  mainnet: {
    id: 1,
    name: 'mainnet',
    etherscan: 'https://etherscan.io/',
    zeroExExchangeContractAddress: '0x12459c951127e0c374ff9105dda097662a027093'
  }
}

export const EXCHANGES = {
  ERCdEX: {
    kovan: {
      tokenTransferProxy: '0x087eed4bc1ee3de49befbd66c662b434b15d49d4',
      exchangeAddress: '0x90fe2af704b34e0224bf2299c838e04d4dcf1364',
      feeRecipientAddress: '',
      networkId: 42,
      name: 'ERCdEX',
      taker: 'NULL_ADDRESS'
    },
    ropsten: {
      tokenTransferProxy: '0x4e9aad8184de8833365fea970cd9149372fdf1e6',
      exchangeAddress: '0x1d8643aae25841322ecde826862a9fa922770981',
      feeRecipientAddress: '',
      networkId: 3,
      name: 'ERCdEX',
      taker: 'NULL_ADDRESS'
    },
    mainnet: {}
  },
  Rigoblock: {
    kovan: {
      tokenTransferProxy: '0xcc040edf6e508c4372a62b1a902c69dcc52ceb1d',
      exchangeAddress: '0xf307de6528fa16473d8f6509b7b1d8851320dba5',
      feeRecipientAddress: '',
      networkId: 42,
      name: 'Rigoblock',
      taker: 'NULL_ADDRESS'
    },
    mainnet: {}
  },
  Ethfinex: {
    kovan: {
      tokenTransferProxy: '0x0000000000000000000000000000000000000000',
      exchangeAddress: '0x35dd2932454449b14cee11a94d3674a936d5d7b2', // 0x V2 address EFX HOT WALLET 0x9faf5515f177F3A8a845D48C19032b33Cc54C09C
      feeRecipientAddress: '0x9faf5515f177f3a8a845d48c19032b33cc54c09c',
      networkId: 42,
      name: 'Ethfinex',
      taker: 'NULL_ADDRESS'
    },
    ropsten: {
      // Old contracts
      // tokenTransferProxy: '0xcc040edf6e508c4372a62b1a902c69dcc52ceb1d'
      // exchangeAddress: '0x1d8643aae25841322ecde826862a9fa922770981',

      // Rigoblock ammended contract for EFX
      tokenTransferProxy: '0xeea64eebd1f2dc273cfc79cbdda23b69c6b5588',
      exchangeAddress: '0x1d8643aae25841322ecde826862a9fa922770981',
      feeRecipientAddress: '0x9faf5515f177f3a8a845d48c19032b33cc54c09c',
      networkId: 3,
      name: 'Ethfinex',
      taker: '0x9faf5515f177f3a8a845d48c19032b33cc54c09c'
    },
    mainnet: {
      tokenTransferProxy: '0x7e03d2b8edc3585ecd8a5807661fff0830a0b603',
      exchangeAddress: '0x4f833a24e1f95d70f028921e27040ca56e09ab0b',
      feeRecipientAddress: '0x61b9898c9b60a159fc91ae8026563cd226b7a0c1',
      networkId: 1,
      name: 'Ethfinex',
      taker: '0x61b9898c9b60a159fc91ae8026563cd226b7a0c1'
    }
  }
}

export const defaultDragoDetails = {
  address: null,
  name: null,
  symbol: null,
  addressOwner: null,
  addressGroup: null,
  buyPrice: null,
  sellPrice: null,
  created: '-',
  totalSupply: null,
  totalSupplyBaseUnits: null,
  dragoETHBalance: null,
  dragoETHBalanceWei: null,
  dragoWETHBalance: null,
  balanceDRG: null
}

export const poolStyle = {
  drago: {
    color: '#054186'
  },
  vault: {
    color: '#607D8B'
  }
}

// Default messages
export const MSG_NO_SUPPORTED_NETWORK =
  'We have detected that MetaMask is not connected to the correct network.'
export const MSG_NETWORK_STATUS_OK = 'Service is operating normally.'
export const MSG_NETWORK_STATUS_ERROR =
  'Service disruption. Cannot update accounts balances. Account balances could be out of date.'

export const THEME_COLOR = {
  drago: 'linear-gradient(135deg,rgb(5, 65, 134),rgb(1, 17, 36))',
  vault: 'linear-gradient(135deg,rgb(96, 125, 139),rgb(40, 41, 41))'
}
