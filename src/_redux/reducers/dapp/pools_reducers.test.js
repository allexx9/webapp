import * as ACTION_ from '../../actions/dapp'
import { poolsList } from '../initialState/poolsList_state'
import { poolsListReducer } from './pools_reducers'
import deepFreeze from 'deep-freeze'

let prevLog

beforeEach(function() {
  prevLog = console.log
  console.log = () => {}
})

afterEach(() => {
  console.log = prevLog
})

describe('pools reducer', () => {
  it(`${
    ACTION_.pools.writeItemPoolsList
  } in cache details update success`, () => {
    const payload = {
      details: {
        address: '0x9a08A7Fd52c67c53351c02ffc72161731B3ADb23',
        name: 'Grasslands Utility Tokens Co',
        symbol: 'GLD',
        dragoId: '8',
        addressOwner: '0x96B795b19eA44a018E73Ac0a00D2ECD23B11267A',
        addressGroup: '0x6000f8fD5dB35e17b4e25CbA72933165708fBF86',
        sellPrice: '1.0000',
        buyPrice: '1.0000',
        totalSupply: '0.5100',
        dragoETHBalance: '0.0100',
        dragoWETHBalance: '0.0000',
        balanceDRG: '0.0100'
      }
    }
    const cachePayload = {
      payload: { ...payload },
      meta: { poolId: 8 }
    }
    const newPoolList = {
      lastFetchRange: {
        chunk: {
          fromBlock: 0,
          key: 0,
          progress: 0,
          toBlock: 0,
          total: 0
        },
        lastBlock: 0,
        startBlock: 0
      },
      list: {
        8: {
          details: {
            address: '0x9a08A7Fd52c67c53351c02ffc72161731B3ADb23',
            addressGroup: '0x6000f8fD5dB35e17b4e25CbA72933165708fBF86',
            addressOwner: '0x96B795b19eA44a018E73Ac0a00D2ECD23B11267A',
            balanceDRG: '0.0100',
            buyPrice: '1.0000',
            dragoETHBalance: '0.0100',
            dragoId: '8',
            dragoWETHBalance: '0.0000',
            name: 'Grasslands Utility Tokens Co',
            sellPrice: '1.0000',
            symbol: 'GLD',
            totalSupply: '0.5100'
          },
          values: {},
          transactions: [],
          assets: [],
          assetsCharts: {}
        }
      }
    }
    const action = ACTION_.pools.writeItemPoolsList(cachePayload)
    const state = {
      lastFetchRange: {
        chunk: {
          fromBlock: 0,
          key: 0,
          progress: 0,
          toBlock: 0,
          total: 0
        },
        lastBlock: 0,
        startBlock: 0
      },
      list: {
        8: {
          details: {
            address: '0x9a08A7Fd52c67c53351c02ffc72161731B3ADb23',
            addressGroup: '0x6000f8fD5dB35e17b4e25CbA72933165708fBF86',
            addressOwner: '0x96B795b19eA44a018E73Ac0a00D2ECD23B11267A',
            balanceDRG: '',
            buyPrice: '',
            dragoETHBalance: '',
            dragoId: '8',
            dragoWETHBalance: '',
            name: 'Grasslands Utility Tokens Co',
            sellPrice: '',
            symbol: 'GLD',
            totalSupply: '0.5100'
          }
        }
      }
    }
    deepFreeze(state)
    deepFreeze(action)
    const results = poolsListReducer(state, action)
    expect(results).toEqual(newPoolList)
  })
  it(`${ACTION_.pools.writeItemPoolsList} not in cache details success`, () => {
    const payload = {
      details: {
        address: '0x9a08A7Fd52c67c53351c02ffc72161731B3ADb23',
        name: 'Grasslands Utility Tokens Co',
        symbol: 'GLD',
        dragoId: '8',
        addressOwner: '0x96B795b19eA44a018E73Ac0a00D2ECD23B11267A',
        addressGroup: '0x6000f8fD5dB35e17b4e25CbA72933165708fBF86',
        sellPrice: '1.0000',
        buyPrice: '1.0000',
        totalSupply: '0.5100',
        dragoETHBalance: '0.0100',
        dragoWETHBalance: '0.0000',
        balanceDRG: '0.0100'
      }
    }
    const cachePayload = {
      payload: { ...payload },
      meta: { poolId: 8 }
    }
    const newPoolList = {
      lastFetchRange: {
        chunk: {
          fromBlock: 0,
          key: 0,
          progress: 0,
          toBlock: 0,
          total: 0
        },
        lastBlock: 0,
        startBlock: 0
      },
      list: {
        8: {
          details: {
            address: '0x9a08A7Fd52c67c53351c02ffc72161731B3ADb23',
            addressGroup: '0x6000f8fD5dB35e17b4e25CbA72933165708fBF86',
            addressOwner: '0x96B795b19eA44a018E73Ac0a00D2ECD23B11267A',
            balanceDRG: '0.0100',
            buyPrice: '1.0000',
            dragoETHBalance: '0.0100',
            dragoId: '8',
            dragoWETHBalance: '0.0000',
            name: 'Grasslands Utility Tokens Co',
            sellPrice: '1.0000',
            symbol: 'GLD',
            totalSupply: '0.5100'
          }
        }
      }
    }
    const action = ACTION_.pools.writeItemPoolsList(cachePayload)
    const state = poolsList
    deepFreeze(state)
    deepFreeze(action)
    const results = poolsListReducer(state, action)
    expect(results).toEqual(newPoolList)
  })
  it(`${
    ACTION_.pools.writeItemPoolsList
  } in cache assets undefined update success`, () => {
    const payload = {
      assets: [
        {
          symbol: 'ETHW',
          isOldERC20: false,
          address: '0xaa7427d8f17d87a28f5e1ba3adbb270badbe1011',
          decimals: 18,
          name: 'Wrapped Ether EFX',
          wrappers: {},
          balances: {
            token: '100000000000000000',
            wrappers: {},
            total: '100000000000000000'
          }
        },
        {
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
          },
          balances: {
            token: '0',
            wrappers: {
              Ethfinex: '10673250'
            },
            total: '10673250'
          }
        }
      ]
    }
    const cachePayload = {
      payload: { ...payload },
      meta: { poolId: 8 }
    }
    const newPoolList = {
      lastFetchRange: {
        chunk: {
          fromBlock: 0,
          key: 0,
          progress: 0,
          toBlock: 0,
          total: 0
        },
        lastBlock: 0,
        startBlock: 0
      },
      list: {
        8: {
          details: {
            address: '0x9a08A7Fd52c67c53351c02ffc72161731B3ADb23',
            addressGroup: '0x6000f8fD5dB35e17b4e25CbA72933165708fBF86',
            addressOwner: '0x96B795b19eA44a018E73Ac0a00D2ECD23B11267A',
            balanceDRG: '0.0100',
            buyPrice: '1.0000',
            dragoETHBalance: '0.0100',
            dragoId: '8',
            dragoWETHBalance: '0.0000',
            name: 'Grasslands Utility Tokens Co',
            sellPrice: '1.0000',
            symbol: 'GLD',
            totalSupply: '0.5100'
          },
          values: {},
          transactions: [],
          assets: [
            {
              symbol: 'ETHW',
              isOldERC20: false,
              address: '0xaa7427d8f17d87a28f5e1ba3adbb270badbe1011',
              decimals: 18,
              name: 'Wrapped Ether EFX',
              wrappers: {},
              balances: {
                token: '100000000000000000',
                wrappers: {},
                total: '100000000000000000'
              }
            },
            {
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
              },
              balances: {
                token: '0',
                wrappers: {
                  Ethfinex: '10673250'
                },
                total: '10673250'
              }
            }
          ],
          assetsCharts: {}
        }
      }
    }
    const action = ACTION_.pools.writeItemPoolsList(cachePayload)
    const state = {
      lastFetchRange: {
        chunk: {
          fromBlock: 0,
          key: 0,
          progress: 0,
          toBlock: 0,
          total: 0
        },
        lastBlock: 0,
        startBlock: 0
      },
      list: {
        8: {
          details: {
            address: '0x9a08A7Fd52c67c53351c02ffc72161731B3ADb23',
            addressGroup: '0x6000f8fD5dB35e17b4e25CbA72933165708fBF86',
            addressOwner: '0x96B795b19eA44a018E73Ac0a00D2ECD23B11267A',
            balanceDRG: '0.0100',
            buyPrice: '1.0000',
            dragoETHBalance: '0.0100',
            dragoId: '8',
            dragoWETHBalance: '0.0000',
            name: 'Grasslands Utility Tokens Co',
            sellPrice: '1.0000',
            symbol: 'GLD',
            totalSupply: '0.5100'
          }
        }
      }
    }
    deepFreeze(state)
    deepFreeze(action)
    const results = poolsListReducer(state, action)
    expect(results).toEqual(newPoolList)
  })
  it(`${
    ACTION_.pools.writeItemPoolsList
  } in cache assets defined update success`, () => {
    const payload = {
      assets: [1, 2, 3, 4, 5]
    }
    const cachePayload = {
      payload: { ...payload },
      meta: { poolId: 8 }
    }
    const newPoolList = {
      lastFetchRange: {
        chunk: {
          fromBlock: 0,
          key: 0,
          progress: 0,
          toBlock: 0,
          total: 0
        },
        lastBlock: 0,
        startBlock: 0
      },
      list: {
        8: {
          details: {
            address: '0x9a08A7Fd52c67c53351c02ffc72161731B3ADb23',
            addressGroup: '0x6000f8fD5dB35e17b4e25CbA72933165708fBF86',
            addressOwner: '0x96B795b19eA44a018E73Ac0a00D2ECD23B11267A',
            balanceDRG: '0.0100',
            buyPrice: '1.0000',
            dragoETHBalance: '0.0100',
            dragoId: '8',
            dragoWETHBalance: '0.0000',
            name: 'Grasslands Utility Tokens Co',
            sellPrice: '1.0000',
            symbol: 'GLD',
            totalSupply: '0.5100'
          },
          values: {},
          transactions: [],
          assets: [1, 2, 3, 4, 5],
          assetsCharts: {}
        }
      }
    }
    const action = ACTION_.pools.writeItemPoolsList(cachePayload)
    const state = {
      lastFetchRange: {
        chunk: {
          fromBlock: 0,
          key: 0,
          progress: 0,
          toBlock: 0,
          total: 0
        },
        lastBlock: 0,
        startBlock: 0
      },
      list: {
        8: {
          details: {
            address: '0x9a08A7Fd52c67c53351c02ffc72161731B3ADb23',
            addressGroup: '0x6000f8fD5dB35e17b4e25CbA72933165708fBF86',
            addressOwner: '0x96B795b19eA44a018E73Ac0a00D2ECD23B11267A',
            balanceDRG: '0.0100',
            buyPrice: '1.0000',
            dragoETHBalance: '0.0100',
            dragoId: '8',
            dragoWETHBalance: '0.0000',
            name: 'Grasslands Utility Tokens Co',
            sellPrice: '1.0000',
            symbol: 'GLD',
            totalSupply: '0.5100'
          },
          assets: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10]
        }
      }
    }
    deepFreeze(state)
    deepFreeze(action)
    const results = poolsListReducer(state, action)
    expect(results).toEqual(newPoolList)
  })
  it(`${
    ACTION_.pools.writeItemPoolsList
  } in cache assetsCharts undefined update success`, () => {
    const payload = {
      assetsCharts: { test1: 'test1', test2: 'test2' }
    }
    const cachePayload = {
      payload: { ...payload },
      meta: { poolId: 8 }
    }
    const newPoolList = {
      lastFetchRange: {
        chunk: {
          fromBlock: 0,
          key: 0,
          progress: 0,
          toBlock: 0,
          total: 0
        },
        lastBlock: 0,
        startBlock: 0
      },
      list: {
        8: {
          details: {
            address: '0x9a08A7Fd52c67c53351c02ffc72161731B3ADb23',
            addressGroup: '0x6000f8fD5dB35e17b4e25CbA72933165708fBF86',
            addressOwner: '0x96B795b19eA44a018E73Ac0a00D2ECD23B11267A',
            balanceDRG: '0.0100',
            buyPrice: '1.0000',
            dragoETHBalance: '0.0100',
            dragoId: '8',
            dragoWETHBalance: '0.0000',
            name: 'Grasslands Utility Tokens Co',
            sellPrice: '1.0000',
            symbol: 'GLD',
            totalSupply: '0.5100'
          },
          values: {},
          transactions: [],
          assets: [],
          assetsCharts: { test1: 'test1', test2: 'test2' }
        }
      }
    }
    const action = ACTION_.pools.writeItemPoolsList(cachePayload)
    const state = {
      lastFetchRange: {
        chunk: {
          fromBlock: 0,
          key: 0,
          progress: 0,
          toBlock: 0,
          total: 0
        },
        lastBlock: 0,
        startBlock: 0
      },
      list: {
        8: {
          details: {
            address: '0x9a08A7Fd52c67c53351c02ffc72161731B3ADb23',
            addressGroup: '0x6000f8fD5dB35e17b4e25CbA72933165708fBF86',
            addressOwner: '0x96B795b19eA44a018E73Ac0a00D2ECD23B11267A',
            balanceDRG: '0.0100',
            buyPrice: '1.0000',
            dragoETHBalance: '0.0100',
            dragoId: '8',
            dragoWETHBalance: '0.0000',
            name: 'Grasslands Utility Tokens Co',
            sellPrice: '1.0000',
            symbol: 'GLD',
            totalSupply: '0.5100'
          }
        }
      }
    }
    deepFreeze(state)
    deepFreeze(action)
    const results = poolsListReducer(state, action)
    expect(results).toEqual(newPoolList)
  })
  it(`${
    ACTION_.pools.writeItemPoolsList
  } in cache assetsCharts defined update success`, () => {
    const payload = {
      assetsCharts: { test1: 'test1', test2: 'test2' }
    }
    const cachePayload = {
      payload: { ...payload },
      meta: { poolId: 8 }
    }
    const newPoolList = {
      lastFetchRange: {
        chunk: {
          fromBlock: 0,
          key: 0,
          progress: 0,
          toBlock: 0,
          total: 0
        },
        lastBlock: 0,
        startBlock: 0
      },
      list: {
        8: {
          details: {
            address: '0x9a08A7Fd52c67c53351c02ffc72161731B3ADb23',
            addressGroup: '0x6000f8fD5dB35e17b4e25CbA72933165708fBF86',
            addressOwner: '0x96B795b19eA44a018E73Ac0a00D2ECD23B11267A',
            balanceDRG: '0.0100',
            buyPrice: '1.0000',
            dragoETHBalance: '0.0100',
            dragoId: '8',
            dragoWETHBalance: '0.0000',
            name: 'Grasslands Utility Tokens Co',
            sellPrice: '1.0000',
            symbol: 'GLD',
            totalSupply: '0.5100'
          },
          values: {},
          transactions: [],
          assets: [],
          assetsCharts: { test1: 'test1', test2: 'test2' }
        }
      }
    }
    const action = ACTION_.pools.writeItemPoolsList(cachePayload)
    const state = {
      lastFetchRange: {
        chunk: {
          fromBlock: 0,
          key: 0,
          progress: 0,
          toBlock: 0,
          total: 0
        },
        lastBlock: 0,
        startBlock: 0
      },
      list: {
        8: {
          details: {
            address: '0x9a08A7Fd52c67c53351c02ffc72161731B3ADb23',
            addressGroup: '0x6000f8fD5dB35e17b4e25CbA72933165708fBF86',
            addressOwner: '0x96B795b19eA44a018E73Ac0a00D2ECD23B11267A',
            balanceDRG: '0.0100',
            buyPrice: '1.0000',
            dragoETHBalance: '0.0100',
            dragoId: '8',
            dragoWETHBalance: '0.0000',
            name: 'Grasslands Utility Tokens Co',
            sellPrice: '1.0000',
            symbol: 'GLD',
            totalSupply: '0.5100'
          },
          assetsCharts: { test1: 'test1', test2: 'test2', test3: 'test3' }
        }
      }
    }
    deepFreeze(state)
    deepFreeze(action)
    const results = poolsListReducer(state, action)
    console.log(results)
    expect(results).toEqual(newPoolList)
  })
})
