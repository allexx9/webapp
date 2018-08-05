import exchangeReducer from './exchange';
import deepFreeze from 'deep-freeze'
// import {
//   UPDATE_CURRENT_TOKEN_PRICE,
// } from './const'

const UPDATE_CURRENT_TOKEN_PRICE = 'UPDATE_CURRENT_TOKEN_PRICE'
describe("exchange reducer", () => {
  it(`${UPDATE_CURRENT_TOKEN_PRICE} init success`, () => {
    const action = {
      type: UPDATE_CURRENT_TOKEN_PRICE,
      payload: {
          current: { 
            price: "0.0023582047733391154"
          }
      }
    }
    const state = {
      selectedTokensPair: {
        ticker: {
          current: {
            price: "0"
          },
          previous: {
            price: "0"
          },
          variation: 0
        }
      }
    }
    deepFreeze(state)
    deepFreeze(action)
    const results = exchangeReducer(state, action)
    expect(results)
      .toEqual({
        selectedTokensPair: {
          ticker: {
            current: {
              price: "0.0023582047733391154"
            },
            previous: {
              price: "0"
            },
            variation: 0
          }
        }
      }
      )
  })
  it(`${UPDATE_CURRENT_TOKEN_PRICE} update success`, () => {
    const action = {
      type: UPDATE_CURRENT_TOKEN_PRICE,
      payload: {
          current: { 
            price: "2"
          }
      }
    }
    const state = {
      selectedTokensPair: {
        ticker: {
          current: {
            price: "1.5"
          },
          previous: {
            price: "3"
          },
          variation: 0
        }
      }
    }
    deepFreeze(state)
    deepFreeze(action)
    const results = exchangeReducer(state, action)
    expect(results)
      .toEqual({
        selectedTokensPair: {
          ticker: {
            current: {
              price: "2"
            },
            previous: {
              price: "1.5"
            },
            variation: "33.3333"
          }
        }
      }
      )
  })
})