#!/usr/bin/env node

import Endpoint from './endpoint'
import utils from './utils'

const endpointInfo = {
  name: 'infura',
  https: {
    kovan: {
      dev: 'https://kovan.infura.io/metamask',
      prod: 'https://kovan.infura.io/metamask'
    },
    ropsten: {
      dev: 'https://ropsten.infura.io/metamask',
      prod: 'https://ropsten.infura.io/metamask'
    },
    mainnet: {
      dev: 'https://mainnet.infura.io/metamask',
      prod: 'https://mainnet.infura.io/metamask'
    }
  },
  wss: {
    kovan: {
      dev: 'wss://kovan.infura.io/ws',
      prod: 'wss://kovan.infura.io/ws'
    },
    ropsten: {
      dev: 'wss://ropsten.infura.io/ws',
      prod: 'wss://ropsten.infura.io/ws'
    },
    mainnet: {
      dev: 'wss://mainnet.infura.io/ws',
      prod: 'wss://mainnet.infura.io/ws'
    }
  }
}
const NETWORKS = {
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
    etherscan: 'https://etherscan.io',
    zeroExExchangeContractAddress: '0x12459c951127e0c374ff9105dda097662a027093'
  }
}

// Set connetions to production server
export const PROD = false
// Set connetions to WebSocketSecure or HTTPs
export const WS = false

let endpoint = new Endpoint(endpointInfo, NETWORKS.ropsten, PROD, WS)
this._api = endpoint.connect()
let accounts = [{ address: '0xc8DCd42e846466F2D2b89F3c54EBa37bf738019B' }]
let options = { balance: true, supply: false, limit: 20, trader: true }
let dragoAddress = null
utils.getTransactionsDragoOptV2(api, dragoAddress, accounts, options)
