export const ERC20_TOKENS = {
  kovan: {
    WETH: {
      symbol: 'WETH',
      address: '0xd0a1e359811322d97991e03f863a0c30c2cf029c',
      decimals: 18,
      name: 'Wrapped Ether'
    },
    ZRX: {
      symbol: 'ZRX',
      address: '0x6ff6c0ff1d68b964901f986d4c9fa3ac68346570',
      decimals: 18,
      name: '0x Protocol Token'
    },
    GNT: {
      symbol: 'GNT',
      address: '0xef7fff64389b814a946f3e92105513705ca6b990',
      decimals: 18,
      name: 'Golem Network Token'
    },
    MKR: {
      symbol: 'MKR',
      address: '0x1dad4783cf3fe3085c1426157ab175a6119a04ba',
      decimals: 18,
      name: 'MakerDAO'
    }
  },
  mainnet: {
    WETH: {
      symbol: 'WETH',
      address: '0xc02aaa39b223fe8d0a0e5c4f27ead9083c756cc2',
      decimals: 18,
      name: 'Wrapped Ether'
    },
    ZRX: {
      symbol: 'ZRX',
      address: '0xe41d2489571d322189246dafa5ebde1f4699f498',
      decimals: 18,
      name: '0x Protocol Token'
    },
    GNT: {
      symbol: 'GNT',
      address: '0xa74476443119A942dE498590Fe1f2454d7D4aC0d',
      decimals: 18,
      name: 'Golem Network Token'
    },
    MKR: {
      symbol: 'MKR',
      address: '0x9f8f72aa9304c8b593d555f12ef6589cc3a579a2',
      decimals: 18,
      name: 'MakerDAO'
    }
  }, 
  ropsten: {
    ETHW: {
      symbol: 'WETH',
      address: '0xc778417E063141139Fce010982780140Aa0cD5Ab',
      decimals: 18,
      name: 'Wrapped Ether',
      wrappers: {
        Ethfinex: {
          symbol: 'ETHW',
          decimals: 18,
          address: "0x965808e7F815CfffD4c018ef2Ba4C5A65EBa087e",
          name: 'ETHWrapper',
        }
      }
    },
    USDT: {
      symbol: 'USDT',
      address: '0x0736d0c130b2eAD47476cC262dbed90D7C4eeABD',
      decimals: 18,
      name: 'Tether USD',
      wrappers: {
        Ethfinex: {
          symbol: 'USDT',
          decimals: 18,
          address: "0x83E42e6d1ac009285376340ef64BaC1C7d106C89",
          name: 'USDTWrapper',
        }
      }
    }
  }, 
}