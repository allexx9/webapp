import * as TYPE_ from '../actions/const'
import { Actions } from '../actions/'
import { eventfulDragoReducer } from './eventful_reducer'
import deepFreeze from 'deep-freeze'

describe('eventful reducer', () => {
  // it(`${
  //   TYPE_.SELECTED_DRAGO_DETAILS_UPDATE_CHART_ASSETS_MARKET_DATA_INIT
  // } detect no new epoch success`, () => {
  //   const action1 = {
  //     payload: {
  //       USDT: {
  //         data: {
  //           close: 0.011337868480725623,
  //           epoch: 1545042600000,
  //           high: 0.011337868480725623,
  //           low: 0.011337973817186906,
  //           open: 0.011337868480725623,
  //           volume: 0.0028571240113079823
  //         }
  //       }
  //     },
  //     type: 'SELECTED_DRAGO_DETAILS_UPDATE_CHART_ASSETS_MARKET_ADD_DATAPOINT'
  //   }
  //   const action2 = {
  //     payload: {
  //       USDT: {
  //         data: {
  //           close: 0.011337868480725623,
  //           epoch: 1545042600001,
  //           high: 0.011337868480725623,
  //           low: 0.011337973817186906,
  //           open: 0.011337868480725623,
  //           volume: 0.0028571240113079823
  //         }
  //       }
  //     },
  //     type: 'SELECTED_DRAGO_DETAILS_UPDATE_CHART_ASSETS_MARKET_ADD_DATAPOINT'
  //   }
  //   const state = {
  //     selectedDrago: {
  //       assetsCharts: {
  //         USDT: {
  //           data: [
  //             {
  //               close: 0.01130135051138611,
  //               epoch: 1544954400000,
  //               high: 0.01130135051138611,
  //               low: 0.011348161597821153,
  //               open: 0.01134365606034825,
  //               volume: 0.0013204291697982945
  //             },
  //             {
  //               close: 0.01130135051138611,
  //               epoch: 1545042600001,
  //               high: 0.01130135051138611,
  //               low: 0.011348161597821153,
  //               open: 0.01134365606034825,
  //               volume: 0.0013204291697982945
  //             },
  //             {
  //               close: 0.011287063896068716,
  //               epoch: 1545042600000,
  //               high: 0.011260880826098218,
  //               low: 0.011308254041688873,
  //               open: 0.011301478233352924,
  //               volume: 0.0005551484029347803
  //             }
  //           ]
  //         }
  //       }
  //     }
  //   }
  //   deepFreeze(state)
  //   deepFreeze(action1)
  //   deepFreeze(action2)
  //   const results1 = eventfulDragoReducer(state, action1)
  //   expect(results1).toEqual(state)
  //   const results2 = eventfulDragoReducer(state, action2)
  //   expect(results2).toEqual(state)
  // })
  // it(`${
  //   TYPE_.SELECTED_DRAGO_DETAILS_UPDATE_CHART_ASSETS_MARKET_DATA_INIT
  // } detect new epoch success`, () => {
  //   const action1 = {
  //     payload: {
  //       USDT: {
  //         data: {
  //           close: 0.011337868480725623,
  //           epoch: 1545042600020,
  //           high: 0.011337868480725623,
  //           low: 0.011337973817186906,
  //           open: 0.011337868480725623,
  //           volume: 0.0028571240113079823
  //         }
  //       }
  //     },
  //     type: 'SELECTED_DRAGO_DETAILS_UPDATE_CHART_ASSETS_MARKET_ADD_DATAPOINT'
  //   }
  //   const state = {
  //     selectedDrago: {
  //       assetsCharts: {
  //         USDT: {
  //           data: [
  //             {
  //               close: 0.01130135051138611,
  //               epoch: 1544954400000,
  //               high: 0.01130135051138611,
  //               low: 0.011348161597821153,
  //               open: 0.01134365606034825,
  //               volume: 0.0013204291697982945
  //             },
  //             {
  //               close: 0.01130135051138611,
  //               epoch: 1545042600001,
  //               high: 0.01130135051138611,
  //               low: 0.011348161597821153,
  //               open: 0.01134365606034825,
  //               volume: 0.0013204291697982945
  //             },
  //             {
  //               close: 0.011287063896068716,
  //               epoch: 1545042600000,
  //               high: 0.011260880826098218,
  //               low: 0.011308254041688873,
  //               open: 0.011301478233352924,
  //               volume: 0.0005551484029347803
  //             }
  //           ]
  //         }
  //       }
  //     }
  //   }
  //   const newState = {
  //     selectedDrago: {
  //       assetsCharts: {
  //         USDT: {
  //           data: [
  //             {
  //               close: 0.01130135051138611,
  //               epoch: 1544954400000,
  //               high: 0.01130135051138611,
  //               low: 0.011348161597821153,
  //               open: 0.01134365606034825,
  //               volume: 0.0013204291697982945
  //             },
  //             {
  //               close: 0.01130135051138611,
  //               epoch: 1545042600001,
  //               high: 0.01130135051138611,
  //               low: 0.011348161597821153,
  //               open: 0.01134365606034825,
  //               volume: 0.0013204291697982945
  //             },
  //             {
  //               close: 0.011287063896068716,
  //               epoch: 1545042600000,
  //               high: 0.011260880826098218,
  //               low: 0.011308254041688873,
  //               open: 0.011301478233352924,
  //               volume: 0.0005551484029347803
  //             },
  //             {
  //               close: 0.011337868480725623,
  //               epoch: 1545042600020,
  //               high: 0.011337868480725623,
  //               low: 0.011337973817186906,
  //               open: 0.011337868480725623,
  //               volume: 0.0028571240113079823
  //             }
  //           ]
  //         }
  //       }
  //     }
  //   }
  //   deepFreeze(state)
  //   deepFreeze(action1)

  //   const results1 = eventfulDragoReducer(state, action1)
  //   expect(results1).toEqual(newState)
  // })
  it(`${TYPE_.DRAGO_SELECTED_DETAILS_UPDATE} assets update success`, () => {
    const assets = [1, 2, 3, 4, 5]

    const actionPayload = {
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
    const meta = { poolId: 8 }
    const newDetails = {
      selectedDrago: {
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
    const action = Actions.drago.updateDragoSelectedDetails(actionPayload, meta)
    const state = {
      selectedDrago: {
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
    deepFreeze(state)
    deepFreeze(action)
    const results = eventfulDragoReducer(state, action)
    expect(results).toEqual(newDetails)
  })
})
