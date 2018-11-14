export const ERCdEX = 'ERCdEX'
export const Ethfinex = 'Ethfinex'
export const ETH = 'ETH'
export const GRG = 'GRG'
export const ZRX = 'ZRX'
export const GNT = 'GNT'
export const USDT = 'USDT'
export const WETH = 'WETH'

export const MOCK_ERC20_TOKENS = {
  kovan: {
    WETH: {
      symbol: 'WETH',
      symbolTicker: {
        Ethfinex: 'ETH'
      },
      address: '0xd0a1e359811322d97991e03f863a0c30c2cf029c',
      decimals: 18,
      name: 'Wrapped Ether',
      wrappers: {}
    },
    ZRX: {
      symbol: 'ZRX',
      symbolTicker: {
        Ethfinex: 'ZRX'
      },
      address: '0x6ff6c0ff1d68b964901f986d4c9fa3ac68346570',
      decimals: 18,
      name: '0x Protocol Token',
      wrappers: {}
    },
    GNT: {
      symbol: 'GNT',
      symbolTicker: {
        Ethfinex: 'GNT'
      },
      address: '0xef7fff64389b814a946f3e92105513705ca6b990',
      decimals: 18,
      name: 'Golem Network Token',
      wrappers: {}
    },
    MKR: {
      symbol: 'MKR',
      symbolTicker: {
        Ethfinex: 'MKR'
      },
      address: '0x1dad4783cf3fe3085c1426157ab175a6119a04ba',
      decimals: 18,
      name: 'MakerDAO',
      wrappers: {}
    },
    USDT: {
      symbol: 'USDT',
      symbolTicker: {
        Ethfinex: 'USD'
      },
      address: '0x3487A04103859A6d95ba0bAFdCf1Ca521490176E',
      decimals: 18,
      name: 'Tether USD',
      wrappers: {}
    },
    GRG: {
      symbol: 'GRG',
      symbolTicker: {
        Ethfinex: 'GRG'
      },
      faucetAddress: '0x22974713439f6b74a1ea247ce6d42b285d12c8e0',
      address: '0x9F121AFBc98A7a133fbb31fE975205f39e8f08D2',
      decimals: 6,
      name: 'GRG Token',
      wrappers: {}
    }
  },
  mainnet: {
    WETH: {
      isMock: true,
      symbol: 'WETH',
      isOldERC20: false,
      symbolTicker: {
        Ethfinex: 'ETH'
      },
      address: '0xc02aaa39b223fe8d0a0e5c4f27ead9083c756cc2',
      decimals: 18,
      name: 'Wrapped Ether 0x',
      wrappers: {}
    },
    ETHW: {
      symbol: 'ETHW',
      isOldERC20: false,
      address: '0xaa7427d8f17d87a28f5e1ba3adbb270badbe1011',
      decimals: 18,
      name: 'Wrapped Ether EFX',
      wrappers: {}
    },
    FUN: {
      isMock: true,
      symbol: 'FUN',
      isOldERC20: false,
      symbolTicker: {
        Ethfinex: 'FUN'
      },
      address: '0x419d0d8bdd9af5e606ae2232ed285aff190e711b',
      decimals: 18,
      name: 'FunFair Token',
      wrappers: {
        Ethfinex: {
          symbol: 'FUNW',
          decimals: 18,
          address: '0xB33CE6b1e48F450b4c6D4C0A3f281237Eeea2DEc',
          name: 'SAN Wrapper'
        }
      }
    },
    SAN: {
      isMock: true,
      symbol: 'SAN',
      isOldERC20: false,
      symbolTicker: {
        Ethfinex: 'SAN'
      },
      address: '0x7c5a0ce9267ed19b22f8cae653f198e3e8daf098',
      decimals: 18,
      name: 'Santiment Network Token',
      wrappers: {
        Ethfinex: {
          symbol: 'SANW',
          decimals: 18,
          address: '0xB0Abd4cC5195560209492b6854c666d7CFF8C03c',
          name: 'SAN Wrapper'
        }
      }
    },
    OMG: {
      isMock: true,
      symbol: 'OMG',
      isOldERC20: false,
      symbolTicker: {
        Ethfinex: 'OMG'
      },
      address: '0xd26114cd6ee289accf82350c8d8487fedb8a0c07',
      decimals: 18,
      name: 'OmiseGO Token',
      wrappers: {
        Ethfinex: {
          symbol: 'OMGW',
          decimals: 18,
          address: '0x60f8526f09caaF0008187945ccd88Bc43790042C',
          name: 'OMG Wrapper'
        }
      }
    },
    ZRX: {
      isMock: true,
      symbol: 'ZRX',
      isOldERC20: false,
      symbolTicker: {
        Ethfinex: 'ZRX'
      },
      address: '0xe41d2489571d322189246dafa5ebde1f4699f498',
      decimals: 18,
      name: '0x Protocol Token',
      wrappers: {
        Ethfinex: {
          symbol: 'ZRXW',
          decimals: 18,
          address: '0xCf67d7A481CEEca0a77f658991A00366FED558F7',
          name: 'ZRX Wrapper'
        }
      }
    },
    ETH: {
      isMock: true,
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
          address: '0xaa7427d8f17d87a28f5e1ba3adbb270badbe1011',
          name: 'ETH Wrapper'
        }
      }
    },
    GNT: {
      isMock: false,
      symbol: 'GNT',
      isOldERC20: false,
      symbolTicker: {
        Ethfinex: 'GNT'
      },
      address: '0xa74476443119A942dE498590Fe1f2454d7D4aC0d',
      decimals: 18,
      name: 'Golem Network Token',
      wrappers: {}
    },
    MKR: {
      isMock: false,
      symbol: 'MKR',
      isOldERC20: false,
      symbolTicker: {
        Ethfinex: 'MKR'
      },
      address: '0x9f8f72aa9304c8b593d555f12ef6589cc3a579a2',
      decimals: 18,
      name: 'MakerDAO',
      wrappers: {}
    },
    USDT: {
      isMock: true,
      symbol: 'USDT',
      isOldERC20: true,
      symbolTicker: {
        Ethfinex: 'USD'
      },
      address: '0xdAC17F958D2ee523a2206206994597C13D831ec7',
      decimals: 6,
      name: 'Tether USD',
      wrappers: {
        Ethfinex: {
          symbol: 'USDT',
          decimals: 6,
          address: '0x1a9B2d827F26B7d7C18fEC4c1B27c1E8dEeBa26e',
          name: 'USDTWrapper'
        }
      }
    },
    GRG: {
      isMock: false,
      symbol: 'GRG',
      isOldERC20: false,
      symbolTicker: {
        Ethfinex: 'GRG'
      },
      address: '0xd56b064c185b8e057a9ff3cf022323276441f8df',
      decimals: 18,
      name: 'GRG Token',
      wrappers: {}
    }
  },
  ropsten: {
    WETH: {
      isMock: true,
      symbol: 'WETH',
      symbolTicker: {
        Ethfinex: 'ETH'
      },
      address: '0xc778417e063141139fce010982780140aa0cd5ab',
      decimals: 18,
      name: 'Wrapped Ether 0x',
      wrappers: {}
    },
    ETHW: {
      isMock: true,
      symbol: 'ETHW',
      address: '0x965808e7F815CfffD4c018ef2Ba4C5A65EBa087e',
      decimals: 18,
      name: 'Wrapped Ether EFX',
      wrappers: {}
    },
    ETH: {
      isMock: true,
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
      isMock: true,
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
      isMock: true,
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
}

export const ERC20_TOKENS = {
  kovan: {
    WETH: {
      symbol: 'WETH',
      symbolTicker: {
        Ethfinex: 'ETH'
      },
      address: '0xd0a1e359811322d97991e03f863a0c30c2cf029c',
      decimals: 18,
      name: 'Wrapped Ether',
      wrappers: {}
    },
    ZRX: {
      symbol: 'ZRX',
      symbolTicker: {
        Ethfinex: 'ZRX'
      },
      address: '0x6ff6c0ff1d68b964901f986d4c9fa3ac68346570',
      decimals: 18,
      name: '0x Protocol Token',
      wrappers: {}
    },
    GNT: {
      symbol: 'GNT',
      symbolTicker: {
        Ethfinex: 'GNT'
      },
      address: '0xef7fff64389b814a946f3e92105513705ca6b990',
      decimals: 18,
      name: 'Golem Network Token',
      wrappers: {}
    },
    MKR: {
      symbol: 'MKR',
      symbolTicker: {
        Ethfinex: 'MKR'
      },
      address: '0x1dad4783cf3fe3085c1426157ab175a6119a04ba',
      decimals: 18,
      name: 'MakerDAO',
      wrappers: {}
    },
    USDT: {
      symbol: 'USDT',
      symbolTicker: {
        Ethfinex: 'USD'
      },
      address: '0x3487A04103859A6d95ba0bAFdCf1Ca521490176E',
      decimals: 18,
      name: 'Tether USD',
      wrappers: {}
    },
    GRG: {
      symbol: 'GRG',
      symbolTicker: {
        Ethfinex: 'GRG'
      },
      faucetAddress: '0x22974713439f6b74a1ea247ce6d42b285d12c8e0',
      address: '0x9F121AFBc98A7a133fbb31fE975205f39e8f08D2',
      decimals: 6,
      name: 'GRG Token',
      wrappers: {}
    }
  },
  mainnet: {
    WETH: {
      symbol: 'WETH',
      isOldERC20: false,
      symbolTicker: {
        [Ethfinex]: 'ETH'
      },
      address: '0xc02aaa39b223fe8d0a0e5c4f27ead9083c756cc2',
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
      address: '0xe41d2489571d322189246dafa5ebde1f4699f498',
      decimals: 18,
      name: '0x Protocol Token',
      wrappers: {
        Ethfinex: {
          symbol: 'ZRXW',
          decimals: 18,
          address: '0xCf67d7A481CEEca0a77f658991A00366FED558F7',
          name: 'ZRX Wrapper'
        }
      }
    },
    ETHW: {
      symbol: 'ETHW',
      isOldERC20: false,
      address: '0xaa7427d8f17d87a28f5e1ba3adbb270badbe1011',
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
          address: '0xaa7427d8f17d87a28f5e1ba3adbb270badbe1011',
          name: 'ETH Wrapper'
        }
      }
    },
    GNT: {
      symbol: 'GNT',
      isOldERC20: false,
      symbolTicker: {
        Ethfinex: 'GNT'
      },
      address: '0xa74476443119A942dE498590Fe1f2454d7D4aC0d',
      decimals: 18,
      name: 'Golem Network Token',
      wrappers: {}
    },
    MKR: {
      symbol: 'MKR',
      isOldERC20: false,
      symbolTicker: {
        Ethfinex: 'MKR'
      },
      address: '0x9f8f72aa9304c8b593d555f12ef6589cc3a579a2',
      decimals: 18,
      name: 'MakerDAO',
      wrappers: {}
    },
    USDT: {
      symbol: 'USDT',
      isOldERC20: true,
      symbolTicker: {
        Ethfinex: 'USD'
      },
      address: '0xdAC17F958D2ee523a2206206994597C13D831ec7',
      decimals: 6,
      name: 'Tether USD',
      wrappers: {
        Ethfinex: {
          symbol: 'USDT',
          decimals: 6,
          address: '0x1a9B2d827F26B7d7C18fEC4c1B27c1E8dEeBa26e',
          name: 'USDTWrapper'
        }
      }
    },
    GRG: {
      symbol: 'GRG',
      isOldERC20: false,
      symbolTicker: {
        Ethfinex: 'GRG'
      },
      address: '0xd56b064c185b8e057a9ff3cf022323276441f8df',
      decimals: 18,
      name: 'GRG Token',
      wrappers: {}
    }
  },
  ropsten: {
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
      address: '0x965808e7F815CfffD4c018ef2Ba4C5A65EBa087e',
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
}

// Supported tokens for trading in the form of base tokens for each quote tokens.
// USDT and WETH are quote tokens, meaning the tokens in which the price are expressed.

export const TRADE_TOKENS_PAIRS = {
  [WETH]: {
    [GNT]: {
      networks: [42],
      symbol: GNT,
      exchanges: [ERCdEX]
    },
    [ZRX]: {
      networks: [42],
      symbol: ZRX,
      exchanges: [ERCdEX]
    }
  },
  [USDT]: {
    [ETH]: {
      networks: [1, 3],
      symbol: ETH,
      exchanges: [Ethfinex]
    }
  },
  [ETH]: {
    [GRG]: {
      networks: [3],
      symbol: GRG,
      exchanges: [Ethfinex]
    }
  }
}
