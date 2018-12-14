import * as TYPE_ from './const'
import { Actions } from './index'

describe('drago actions creator', () => {
  it(`${TYPE_.FETCH_ASSETS_PRICE_DATA} success`, () => {
    const assets = []
    const networkId = 1
    const quoteToken = {}
    const results = Actions.drago.getAssetsPriceData(
      assets,
      networkId,
      quoteToken
    )
    expect(results).toEqual({
      type: TYPE_.FETCH_ASSETS_PRICE_DATA,
      payload: {
        assets,
        networkId,
        quoteToken
      }
    })
  })
  it(`${TYPE_.POOLS_GET_LIST} success`, () => {
    let options = {
      topics: ['test', null, null, null],
      fromBlock: 0,
      toBlock: 'latest',
      poolType: 'drago'
    }
    const results = Actions.drago.getPoolsList(options)
    expect(results).toEqual({
      type: TYPE_.POOLS_GET_LIST,
      payload: options
    })
  })
})
