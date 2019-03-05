export const ERCdEX = 'ERCdEX'
export const Ethfinex = 'Ethfinex'
export const ETH = 'ETH'
export const GRG = 'GRG'
export const ZRX = 'ZRX'
export const GNT = 'GNT'
export const USDT = 'USDT'
export const WETH = 'WETH'
export const OMG = 'OMG'
export const SAN = 'SAN'
export const EDO = 'EDO'
export const FUN = 'FUN'
export const REP = 'REP'
export const MKR = 'MKR'
export const DAI = 'DAI'
export const BAT = 'BAT'
export const NIO = 'NIO'
export const SPK = 'SPK'
export const SNT = 'SNT'

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
      address: '0x4fbb350052bca5417566f188eb2ebce5b19bc964',
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
      address: '0x06da2eb72279c1cec53c251bbff4a06fbfb93a5b',
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
    GRG: {
      symbol: 'GRG',
      isOldERC20: false,
      symbolTicker: {
        Ethfinex: 'GRG'
      },
      address: '0x4fbb350052bca5417566f188eb2ebce5b19bc964',
      decimals: 18,
      name: 'GRG Token',
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
    ETHW: {
      symbol: 'ETHW',
      isOldERC20: false,
      address: '0xaa7427d8f17d87a28f5e1ba3adbb270badbe1011',
      decimals: 18,
      name: 'Wrapped Ether EFX',
      wrappers: {}
    },
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
    OMG: {
      symbol: 'OMG',
      isOldERC20: false,
      symbolTicker: {
        Ethfinex: 'OMG'
      },
      address: '0xd26114cd6EE289AccF82350c8d8487fedB8A0C07',
      decimals: 18,
      name: 'OmiseGO Token',
      wrappers: {
        Ethfinex: {
          symbol: 'OMGW',
          decimals: 18,
          address: '0x60f8526f09caaf0008187945ccd88bc43790042c',
          name: 'OMG Wrapper'
        }
      }
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
    SAN: {
      symbol: 'SAN',
      isOldERC20: false,
      symbolTicker: {
        Ethfinex: 'SAN'
      },
      address: '0x7c5a0ce9267ed19b22f8cae653f198e3e8daf098',
      decimals: 18,
      name: 'Santiment Token',
      wrappers: {
        Ethfinex: {
          symbol: 'SANW',
          decimals: 18,
          address: '0xb0abd4cc5195560209492b6854c666d7cff8c03c',
          name: 'SAN Wrapper'
        }
      }
    },
    SNT: {
      symbol: 'SNT',
      isOldERC20: false,
      symbolTicker: {
        Ethfinex: 'SNT'
      },
      address: '0x744d70fdbe2ba4cf95131626614a1763df805b9e',
      decimals: 18,
      name: 'StatusNetwork Token',
      wrappers: {
        Ethfinex: {
          symbol: 'SNTW',
          decimals: 18,
          address: '0x8aa72dd6045505836f643b39b82e70fd705f9686',
          name: 'SNT Wrapper'
        }
      }
    },
    EDO: {
      symbol: 'EDO',
      isOldERC20: false,
      symbolTicker: {
        Ethfinex: 'EDO'
      },
      address: '0xced4e93198734ddaff8492d525bd258d49eb388e',
      decimals: 18,
      name: 'Eidoo Token',
      wrappers: {
        Ethfinex: {
          symbol: 'EDO',
          decimals: 18,
          address: '0xab056a8119bb91ca50631bd319ee3df654bebfa2',
          name: 'EDO Wrapper'
        }
      }
    },
    FUN: {
      symbol: 'FUN',
      isOldERC20: false,
      symbolTicker: {
        Ethfinex: 'FUN'
      },
      address: '0x419d0d8bdd9af5e606ae2232ed285aff190e711b',
      decimals: 8,
      name: 'FunFair Token',
      wrappers: {
        Ethfinex: {
          symbol: 'FUN',
          decimals: 8,
          address: '0xb33ce6b1e48f450b4c6d4c0a3f281237eeea2dec',
          name: 'FUN Wrapper'
        }
      }
    },
    REP: {
      symbol: 'REP',
      isOldERC20: false,
      symbolTicker: {
        Ethfinex: 'REP'
      },
      address: '0x1985365e9f78359a9b6ad760e32412f4a445e862',
      decimals: 18,
      name: 'Reputation Token',
      wrappers: {
        Ethfinex: {
          symbol: 'REP',
          decimals: 18,
          address: '0x1488f99d305990694e19b3e72f6f0307cfa1df4e',
          name: 'REP Wrapper'
        }
      }
    },
    MKR: {
      symbol: 'MKR',
      isOldERC20: false,
      symbolTicker: {
        Ethfinex: 'MKR'
      },
      address: '0x9f8f72aa9304c8b593d555f12ef6589cc3a579a2',
      decimals: 18,
      name: 'Maker Token',
      wrappers: {
        Ethfinex: {
          symbol: 'MKR',
          decimals: 18,
          address: '0x38ae374ecf4db50b0ff37125b591a04997106a32',
          name: 'MKR Wrapper'
        }
      }
    },
    DAI: {
      symbol: 'DAI',
      isOldERC20: false,
      symbolTicker: {
        Ethfinex: 'DAI'
      },
      address: '0x89d24a6b4ccb1b6faa2625fe562bdd9a23260359',
      decimals: 18,
      name: 'Dai Stablecoin',
      wrappers: {
        Ethfinex: {
          symbol: 'DAI',
          decimals: 18,
          address: '0xd9ebebfdab08c643c5f2837632de920c70a56247',
          name: 'DAI Wrapper'
        }
      }
    },
    BAT: {
      symbol: 'BAT',
      isOldERC20: false,
      symbolTicker: {
        Ethfinex: 'BAT'
      },
      address: '0x0d8775f648430679a709e98d2b0cb6250d2887ef',
      decimals: 18,
      name: 'Basic Attention Token',
      wrappers: {
        Ethfinex: {
          symbol: 'BAT',
          decimals: 18,
          address: '0xe82cfc4713598dc7244368cf5aca1b102a04ce33',
          name: 'BAT Wrapper'
        }
      }
    },
    NIO: {
      symbol: 'NIO',
      isOldERC20: false,
      symbolTicker: {
        Ethfinex: 'NIO'
      },
      address: '0x5554e04e76533e1d14c52f05beef6c9d329e1e30',
      decimals: 0,
      name: 'Autonio Token',
      wrappers: {
        Ethfinex: {
          symbol: 'NIO',
          decimals: 0,
          address: '0x680bf2eebf0ad9b183ac2ff88d16f5a4e41480e9',
          name: 'NIO Wrapper'
        }
      }
    },
    SPK: {
      symbol: 'SPK',
      isOldERC20: false,
      symbolTicker: {
        Ethfinex: 'SPK'
      },
      address: '0x42d6622dece394b54999fbd73d108123806f6a18',
      decimals: 18,
      name: 'SPANK Token',
      wrappers: {
        Ethfinex: {
          symbol: 'SPK',
          decimals: 18,
          address: '0x70b04d0684ea9dc0c8e244e0a1453744350f3864',
          name: 'SPK Wrapper'
        }
      }
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
    [GRG]: {
      networks: [3],
      symbol: GRG,
      exchanges: [Ethfinex]
    },
    [ETH]: {
      networks: [1, 3, 42],
      symbol: ETH,
      exchanges: [Ethfinex]
    },
    [OMG]: {
      networks: [1],
      symbol: OMG,
      exchanges: [Ethfinex]
    },
    [ZRX]: {
      networks: [1],
      symbol: ZRX,
      exchanges: [Ethfinex]
    },
    [SAN]: {
      networks: [1],
      symbol: SAN,
      exchanges: [Ethfinex]
    },
    [SNT]: {
      networks: [1],
      symbol: SNT,
      exchanges: [Ethfinex]
    },
    [EDO]: {
      networks: [1],
      symbol: EDO,
      exchanges: [Ethfinex]
    },
    [FUN]: {
      networks: [1],
      symbol: FUN,
      exchanges: [Ethfinex]
    },
    [REP]: {
      networks: [1],
      symbol: REP,
      exchanges: [Ethfinex]
    },
    [MKR]: {
      networks: [1],
      symbol: MKR,
      exchanges: [Ethfinex]
    },
    [BAT]: {
      networks: [1],
      symbol: BAT,
      exchanges: [Ethfinex]
    },
    [NIO]: {
      networks: [1],
      symbol: NIO,
      exchanges: [Ethfinex]
    }
  },
  [ETH]: {
    [GRG]: {
      networks: [3],
      symbol: GRG,
      exchanges: [Ethfinex]
    },
    [OMG]: {
      networks: [1],
      symbol: OMG,
      exchanges: [Ethfinex]
    },
    [ZRX]: {
      networks: [1],
      symbol: ZRX,
      exchanges: [Ethfinex]
    },
    [SAN]: {
      networks: [1],
      symbol: SAN,
      exchanges: [Ethfinex]
    },
    [SNT]: {
      networks: [1],
      symbol: SNT,
      exchanges: [Ethfinex]
    },
    [EDO]: {
      networks: [1],
      symbol: EDO,
      exchanges: [Ethfinex]
    },
    [FUN]: {
      networks: [1],
      symbol: FUN,
      exchanges: [Ethfinex]
    },
    [REP]: {
      networks: [1],
      symbol: REP,
      exchanges: [Ethfinex]
    },
    [MKR]: {
      networks: [1],
      symbol: MKR,
      exchanges: [Ethfinex]
    },
    [BAT]: {
      networks: [1],
      symbol: BAT,
      exchanges: [Ethfinex]
    },
    [NIO]: {
      networks: [1],
      symbol: NIO,
      exchanges: [Ethfinex]
    }
  }
}
