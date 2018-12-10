export const KOVAN = 'KOVAN'
export const ROPSTEN = 'ROPSTEN'
export const MAINNET = 'MAINNET'

export const INFURA = 'infura'

export const DRAGOEVENTFUL = 'dragoeventful-v2'
export const VAULTEVENTFUL = 'vaulteventful-v2'

export const CALL_TIMEOUT = 10000
export const RETRY_DELAY = 5000

export const PARITY_REGISTRY_ADDRESSES = {
  42: '0xfAb104398BBefbd47752E7702D9fE23047E1Bca3',
  3: '0x81a4B044831C4F12bA601aDB9274516939e9B8a2',
  1: '0xe3389675d0338462dC76C6f9A3e432550c36A142',
  [KOVAN]: '0xfAb104398BBefbd47752E7702D9fE23047E1Bca3',
  [ROPSTEN]: '0x81a4B044831C4F12bA601aDB9274516939e9B8a2',
  [MAINNET]: '0xe3389675d0338462dC76C6f9A3e432550c36A142'
}

export const RB_API = {
  3: 'https://api-ropsten.endpoint.network',
  1: 'https://api.endpoint.network',
  [ROPSTEN]: 'https://api-ropsten.endpoint.network',
  [MAINNET]: 'https://api.endpoint.network'
}

export const EFX_EXCHANGE_CONTRACT = {
  3: '0x1D8643aaE25841322ecdE826862A9FA922770981',
  1: '0xdcDb42C9a256690bd153A7B409751ADFC8Dd5851',
  [ROPSTEN]: '0x1D8643aaE25841322ecdE826862A9FA922770981',
  [MAINNET]: '0xdcDb42C9a256690bd153A7B409751ADFC8Dd5851'
}

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

export const ENDPOINTS = {
  infura: {
    name: 'INFURA',
    https: {
      42: {
        dev: 'https://kovan.infura.io/metamask',
        prod: 'https://kovan.infura.io/metamask'
      },
      3: {
        dev: 'https://ropsten.infura.io/metamask',
        prod: 'https://ropsten.infura.io/metamask'
      },
      1: {
        dev: 'https://mainnet.infura.io/metamask',
        prod: 'https://mainnet.infura.io/metamask'
      }
    },
    wss: {
      42: {
        dev: 'wss://kovan.infura.io/ws',
        prod: 'wss://kovan.infura.io/ws'
      },
      3: {
        dev: 'wss://ropsten.infura.io/ws',
        prod: 'wss://ropsten.infura.io/ws'
      },
      1: {
        dev: 'wss://mainnet.infura.io/ws',
        prod: 'wss://mainnet.infura.io/ws'
      }
    }
  },
  rigoblock: {
    name: 'rigoblock',
    https: {
      42: {
        dev: EP_RIGOBLOCK_KV_DEV,
        prod: EP_RIGOBLOCK_RP_PROD
      },
      3: {
        dev: EP_RIGOBLOCK_RP_DEV,
        prod: EP_RIGOBLOCK_RP_PROD
      },
      1: {
        dev: EP_RIGOBLOCK_MN_DEV,
        prod: EP_RIGOBLOCK_MN_PROD
      }
    },
    wss: {
      42: {
        dev: EP_RIGOBLOCK_KV_DEV_WS,
        prod: EP_RIGOBLOCK_KV_PROD_WS
      },
      3: {
        dev: EP_RIGOBLOCK_RP_DEV_WS,
        prod: EP_RIGOBLOCK_RP_PROD_WS
      },
      1: {
        dev: EP_RIGOBLOCK_MN_DEV_WS,
        prod: EP_RIGOBLOCK_MN_PROD_WS
      }
    }
  },
  local: {
    name: 'local',
    https: {
      42: {
        dev: 'http://localhost:8545',
        prod: 'http://localhost:8545'
      },
      3: {
        dev: 'http://localhost:8545',
        prod: 'http://localhost:8545'
      },
      1: {
        dev: 'http://localhost:8545',
        prod: 'http://localhost:8545'
      }
    },
    wss: {
      42: {
        dev: 'ws://localhost:8546',
        prod: 'ws://localhost:8546'
      },
      3: {
        dev: 'ws://localhost:8546',
        prod: 'ws://localhost:8546'
      },
      1: {
        dev: 'ws://localhost:8546',
        prod: 'ws://localhost:8546'
      }
    }
  }
}
