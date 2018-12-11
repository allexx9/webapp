// https://github.com/redux-observable/redux-observable/issues/477#issuecomment-393516995

import { getTokensBalances } from './getTokensBalances'
import BigNumber from 'bignumber.js'
import PoolsApi from '../../PoolsApi/src/index.js'
import Web3 from 'web3'
import _ from 'lodash'

jest.mock('../../PoolsApi/src/index.js')

const allowedTokens = {
  WETH: {
    symbol: 'WETH',
    symbolTicker: {
      Ethfinex: 'ETH'
    },
    address: '0xc778417e063141139fce010982780140aa0cd5ab',
    decimals: 18,
    name: 'Wrapped Ether 0x',
    wrappers: {}
  },
  ZRX: {
    symbol: 'ZRX',
    isOldERC20: false,
    symbolTicker: {
      Ethfinex: 'ZRX'
    },
    address: '0xA8E9Fa8f91e5Ae138C74648c9C304F1C75003A8D',
    decimals: 18,
    name: '0x Protocol Token',
    wrappers: {
      Ethfinex: {
        symbol: 'ZRXW',
        decimals: 18,
        address: '0xFF32E76EAdc11Fc816A727980E92805D237CDB28',
        name: 'ZRX Wrapper'
      }
    }
  },
  ETHW: {
    symbol: 'ETHW',
    address: '0x06da2eb72279c1cec53c251bbff4a06fbfb93a5b',
    decimals: 18,
    name: 'Wrapped Ether EFX',
    wrappers: {}
  },
  ETH: {
    symbol: 'ETH',
    isOldERC20: false,
    symbolTicker: {
      Ethfinex: 'ETH'
    },
    address: '0x0',
    decimals: 18,
    name: 'Ether',
    wrappers: {
      Ethfinex: {
        symbol: 'ETHW',
        decimals: 18,
        address: '0x06da2eb72279c1cec53c251bbff4a06fbfb93a5b',
        name: 'ETH Wrapper'
      }
    }
  },
  USDT: {
    symbol: 'USDT',
    isOldERC20: true,
    symbolTicker: {
      Ethfinex: 'USD'
    },
    address: '0x0736d0c130b2eAD47476cC262dbed90D7C4eeABD',
    decimals: 6,
    name: 'Tether USD',
    wrappers: {
      Ethfinex: {
        symbol: 'USDTW',
        decimals: 6,
        address: '0x84442a4518126ed25a548fe3392f6021e3ccd5bb',
        name: 'USDT Wrapper'
      }
    }
  },
  GRG: {
    symbol: 'GRG',
    isOldERC20: false,
    symbolTicker: {
      Ethfinex: 'GRG'
    },
    address: '0x6FA8590920c5966713b1a86916f7b0419411e474',
    decimals: 18,
    faucetAddress: '0x756519e3A48d5E4A02e0a6197A0cBb783ff06738',
    name: 'GRG Token',
    wrappers: {
      Ethfinex: {
        symbol: 'GRGW',
        decimals: 18,
        address: '0xacfb4c79259e3c2c1bf054f136e6d75f7cc2b07e',
        name: 'GRG Wrapper'
      }
    }
  }
}

const web3 = new Web3()
const dragoAddress = '0x300f68D9aed119b26F3F410cAc78aA7249f41987'
const tokenAddresses = [
  '0xc778417e063141139fce010982780140aa0cd5ab',
  '0xA8E9Fa8f91e5Ae138C74648c9C304F1C75003A8D',
  '0x06da2eb72279c1cec53c251bbff4a06fbfb93a5b',
  '0x0736d0c130b2eAD47476cC262dbed90D7C4eeABD',
  '0x6FA8590920c5966713b1a86916f7b0419411e474'
]
const tokenWrapperAddresses = [
  '0xFF32E76EAdc11Fc816A727980E92805D237CDB28',
  '0x06da2eb72279c1cec53c251bbff4a06fbfb93a5b',
  '0x84442a4518126ed25a548fe3392f6021e3ccd5bb',
  '0xacfb4c79259e3c2c1bf054f136e6d75f7cc2b07e'
]
const balancesTokens = {
  '0': ['0', '0', '1160000000000000000', '661017913', '5000000000000000000000'],
  '1': [
    '0xc778417E063141139Fce010982780140Aa0cD5Ab',
    '0xA8E9Fa8f91e5Ae138C74648c9C304F1C75003A8D',
    '0x06dA2eB72279C1CeC53C251BbFf4a06fBFb93a5B',
    '0x0736d0c130b2eAD47476cC262dbed90D7C4eeABD',
    '0x6FA8590920c5966713b1a86916f7b0419411e474'
  ],
  balances: [
    '0',
    '0',
    '1160000000000000000',
    '661017913',
    '5000000000000000000000'
  ],
  tokenAddresses: [
    '0xc778417e063141139fce010982780140aa0cd5ab',
    '0xa8e9fa8f91e5ae138c74648c9c304f1c75003a8d',
    '0x06da2eb72279c1cec53c251bbff4a06fbfb93a5b',
    '0x0736d0c130b2ead47476cc262dbed90d7c4eeabd',
    '0x6fa8590920c5966713b1a86916f7b0419411e474'
  ]
}

const balancesWrappers = {
  '0': ['0', '1160000000000000000', '89216450', '0'],
  '1': [
    '0xFF32E76EAdc11Fc816A727980E92805D237CDB28',
    '0x06dA2eB72279C1CeC53C251BbFf4a06fBFb93a5B',
    '0x84442A4518126ED25A548Fe3392F6021e3CCD5bb',
    '0xACFB4c79259e3C2c1Bf054f136E6D75F7cc2B07e'
  ],
  balances: ['0', '1160000000000000000', '89216450', '0'],
  tokenAddresses: [
    '0xff32e76eadc11fc816a727980e92805d237cdb28',
    '0x06da2eb72279c1cec53c251bbff4a06fbfb93a5b',
    '0x84442a4518126ed25a548fe3392f6021e3ccd5bb',
    '0xacfb4c79259e3c2c1bf054f136e6d75f7cc2b07e'
  ]
}

const assetsResult = {
  ETHW: {
    symbol: 'ETHW',
    address: '0x06da2eb72279c1cec53c251bbff4a06fbfb93a5b',
    decimals: 18,
    name: 'Wrapped Ether EFX',
    wrappers: {},
    balances: {
      token: new BigNumber('1160000000000000000'),
      wrappers: {},
      total: new BigNumber('1160000000000000000')
    }
  },
  USDT: {
    symbol: 'USDT',
    isOldERC20: true,
    symbolTicker: {
      Ethfinex: 'USD'
    },
    address: '0x0736d0c130b2eAD47476cC262dbed90D7C4eeABD',
    decimals: 6,
    name: 'Tether USD',
    wrappers: {
      Ethfinex: {
        symbol: 'USDTW',
        decimals: 6,
        address: '0x84442a4518126ed25a548fe3392f6021e3ccd5bb',
        name: 'USDT Wrapper'
      }
    },
    balances: {
      token: new BigNumber('661017913'),
      wrappers: {
        Ethfinex: new BigNumber('89216450')
      },
      total: new BigNumber('750234363')
    }
  },
  GRG: {
    symbol: 'GRG',
    isOldERC20: false,
    symbolTicker: {
      Ethfinex: 'GRG'
    },
    address: '0x6FA8590920c5966713b1a86916f7b0419411e474',
    decimals: 18,
    faucetAddress: '0x756519e3A48d5E4A02e0a6197A0cBb783ff06738',
    name: 'GRG Token',
    wrappers: {
      Ethfinex: {
        symbol: 'GRGW',
        decimals: 18,
        address: '0xacfb4c79259e3c2c1bf054f136e6d75f7cc2b07e',
        name: 'GRG Wrapper'
      }
    },
    balances: {
      token: new BigNumber('5000000000000000000000'),
      wrappers: {
        Ethfinex: new BigNumber('0')
      },
      total: new BigNumber('5000000000000000000000')
    }
  }
}

// Mock PoolApi
const drago = {
  init: jest.fn(),
  getMultiBalancesAndAddressesFromAddresses: jest.fn(addresses => {
    if (_.isEqual(addresses, tokenAddresses)) {
      return balancesTokens
    }
    if (_.isEqual(addresses, tokenWrapperAddresses)) {
      return balancesWrappers
    }
  })
}
PoolsApi.mockImplementation(() => {
  return {
    contract: {
      drago
    }
  }
})

beforeEach(function() {})

describe('get pool tokens and wrappers balances', () => {
  it('1 -> get balances success', async () => {
    const assets = await getTokensBalances(dragoAddress, allowedTokens, web3)
    expect(assets).toEqual(assetsResult)
  })
})
