import drago from './drago';
import {
  FETCH_ASSETS_PRICE_DATA,
} from './const'

describe("drago actions creator", () =>{
  it('FETCH_ASSETS_PRICE_DATA success', () => {
    const assets = []
    const networkId = 1
    const quoteToken = {}
    const results = drago.getAssetsPriceDataAction(assets, networkId, quoteToken)
    expect(results)
      .toEqual({
        type: FETCH_ASSETS_PRICE_DATA,
        payload: {
          assets,
          networkId,
          quoteToken
        }
      })
  })
})

