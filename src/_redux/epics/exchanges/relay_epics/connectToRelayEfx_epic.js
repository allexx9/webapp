// Copyright 2016-2017 Rigo Investment Sagl.

import * as TYPE_ from '../../../actions/const'
import { Actions } from '../../../actions'
import { concat, of } from 'rxjs'
import { mergeMap } from 'rxjs/operators'
import { ofType } from 'redux-observable'
import utils from '../../../../_utils/utils'

//
// CONNECT TO RELAY DATA FEEDS
//

export const connectToRelayEpic = (action$, state$) =>
  action$.pipe(
    ofType(utils.customRelayAction(TYPE_.RELAY_CONNECT)),
    mergeMap(action => {
      console.log(action)
      const { relay, tokensPair } = action.payload
      const networkId = state$.value.endpoint.networkInfo.id
      const tsYesterday = new Date(
        (Math.floor(Date.now() / 1000) - 86400 * 7) * 1000
      ).toISOString()
      return concat(
        of({
          type: TYPE_.CHART_MARKET_DATA_INIT,
          payload: []
        }),
        of({
          type: TYPE_.ORDERBOOK_INIT,
          payload: {
            asks: [],
            bids: [],
            spread: '0'
          }
        }),
        of(
          Actions.exchange.relayOpenWsTicker(
            relay,
            networkId,
            tokensPair.baseToken,
            tokensPair.quoteToken
          )
        ),
        of(
          Actions.exchange.relayOpenWsBook(
            relay,
            networkId,
            tokensPair.baseToken,
            tokensPair.quoteToken
          )
        ),
        of(
          Actions.exchange.fetchCandleDataSingleStart(
            relay,
            networkId,
            tokensPair.baseToken,
            tokensPair.quoteToken,
            tsYesterday
          )
        )
      )
    })
  )
