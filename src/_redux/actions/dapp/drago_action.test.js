import * as TYPE_ from '../const'
import { Actions } from '../index'

describe('drago actions creator', () => {
  it(`${
    TYPE_.DRAGO_SELECTED_DETAILS_UPDATE
  } updateCache = true success`, () => {
    const details = {
      details: {
        address: '0x0D9E347bDd380783ead06af6A95A69EC3A460d30',
        addressGroup: '0x6000f8fD5dB35e17b4e25CbA72933165708fBF86',
        addressOwner: '0xc8DCd42e846466F2D2b89F3c54EBa37bf738019B',
        balanceDRG: '0.4740',
        buyPrice: '1.0000',
        created: '20 November 2018',
        dragoETHBalance: '0.4740',
        dragoId: '2',
        dragoWETHBalance: '0.0000',
        id: '2',
        name: 'Drago Pool 2',
        poolType: 'drago',
        sellPrice: '0.9500',
        symbol: 'DP2',
        totalSupply: '0.6740'
      }
    }
    const meta = { updateCache: false }

    const results = Actions.drago.updateDragoSelectedDetails(details, meta)

    expect(results).toEqual({
      type: TYPE_.DRAGO_SELECTED_DETAILS_UPDATE,
      payload: { ...details },
      meta
    })
  })
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
})
