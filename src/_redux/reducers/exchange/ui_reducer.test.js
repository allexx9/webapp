import * as ACTION_ from '../../actions/exchange'
import { Actions } from '../../actions'
import { uiReducer } from './ui_reducer'
import deepFreeze from 'deep-freeze'

let prevLog

beforeEach(function() {
  prevLog = console.log
  console.log = () => {}
})

afterEach(() => {
  console.log = prevLog
})

describe('exchange ui reducer', () => {
  it(`${ACTION_.updateUiPanelProperties} update success`, () => {
    const payload = {
      panels: { relayBox: { disabled: false } }
    }
    const action = Actions.exchange.updateUiPanelProperties(payload)
    const newExchangeState = {
      tradesHistory: [],
      ui: {
        panels: {
          relayBox: {
            expanded: true,
            disabled: false,
            disabledMsg: ''
          },
          orderBox: {
            expanded: true,
            disabled: true,
            disabledMsg: ''
          },
          ordersHistoryBox: {
            expanded: true,
            disabled: false,
            disabledMsg: ''
          },
          chartBox: {
            expanded: true,
            disabled: false,
            disabledMsg: '',
            loading: {
              isLoading: true,
              isError: false,
              errorMsg: '',
              reduxRetryAction: {}
            }
          }
        }
      },
      loading: {
        liquidity: true,
        orderSummary: true,
        orderBox: true,
        marketBox: true
      },
      prices: {
        previous: {},
        current: {}
      }
    }
    const state = {
      tradesHistory: [],
      ui: {
        panels: {
          relayBox: {
            expanded: true,
            disabled: true,
            disabledMsg: ''
          },
          orderBox: {
            expanded: true,
            disabled: true,
            disabledMsg: ''
          },
          ordersHistoryBox: {
            expanded: true,
            disabled: false,
            disabledMsg: ''
          },
          chartBox: {
            expanded: true,
            disabled: false,
            disabledMsg: '',
            loading: {
              isLoading: true,
              isError: false,
              errorMsg: '',
              reduxRetryAction: {}
            }
          }
        }
      },
      loading: {
        liquidity: true,
        orderSummary: true,
        orderBox: true,
        marketBox: true
      },
      prices: {
        previous: {},
        current: {}
      }
    }
    deepFreeze(state)
    deepFreeze(action)
    const results = uiReducer(state, action)
    expect(results).toEqual(newExchangeState)
  })
})
