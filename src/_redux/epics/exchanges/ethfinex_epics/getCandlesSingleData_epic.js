// Copyright 2016-2017 Rigo Investment Sagl.

import * as TYPE_ from '../../../actions/const'
import { Observable, of, race } from 'rxjs'
import { catchError, filter, map, mergeMap, takeUntil } from 'rxjs/operators'
import { ofType } from 'redux-observable'
import ExchangeConnectorWrapper from '../../../../_utils/exchangeConnector'
import utils from '../../../../_utils/utils'

//
// FETCH HISTORICAL MARKET DATA FOR A SPECIFIC TRADING PAIR
//

const candlesSingleWebsocket$ = (relay, networkId, baseToken, quoteToken) =>
  Observable.create(observer => {
    const baseTokenSymbol = utils.getTokenSymbolForRelay(relay.name, baseToken)
    const quoteTokenSymbol = utils.getTokenSymbolForRelay(
      relay.name,
      quoteToken
    )

    const ethfinex = ExchangeConnectorWrapper.getInstance().getExchange(
      relay.name,
      {
        networkId: networkId
      }
    )
    const unsubscribePromise = ethfinex.raw.ws
      .getCandles(
        {
          timeframe: '1m',
          symbols: baseTokenSymbol + quoteTokenSymbol
        },
        (err, msg) => (err ? observer.error(err) : observer.next(msg))
      )
      .catch(err => console.error(err))

    return async () => {
      const unsub = await unsubscribePromise
      if (unsub) {
        return unsub()
      }
    }
  })

const updateSingleCandles = tickerOutput => {
  let ticker = tickerOutput
  if (Array.isArray(ticker[1][0]) && ticker[1] !== 'hb') {
    let candles = ticker[1].map(tick => {
      let entry = {
        date: new Date(tick[0]),
        low: tick[4],
        high: tick[3],
        open: tick[1],
        close: tick[2],
        volume: tick[5],
        epoch: tick[0]
      }
      return entry
    })
    return {
      type: TYPE_.CHART_MARKET_DATA_INIT,
      payload: candles.reverse()
    }
  }
  if (!Array.isArray(ticker[1][0]) && ticker[1] !== 'hb') {
    let candles = {
      date: new Date(ticker[1][0]),
      low: ticker[1][4],
      high: ticker[1][3],
      open: ticker[1][1],
      close: ticker[1][2],
      volume: ticker[1][5],
      epoch: ticker[1][0]
    }

    return {
      type: TYPE_.CHART_MARKET_DATA_ADD_DATAPOINT,
      payload: candles
    }
  }
  return {
    type: TYPE_.CHART_MARKET_DATA_ADD_DATAPOINT,
    payload: ''
  }
}

export const getCandlesSingleDataEpic = action$ =>
  action$.pipe(
    ofType(utils.customRelayAction(TYPE_.FETCH_CANDLES_DATA_SINGLE_START)),
    mergeMap(action => {
      const {
        relay,
        networkId,
        baseToken,
        quoteToken,
        startDate
      } = action.payload

      return race(
        candlesSingleWebsocket$(
          relay,
          networkId,
          baseToken,
          quoteToken,
          startDate
        ).pipe(
          filter(tick => tick[0] && tick[1] && tick[1] !== 'hb'),
          map(historical => updateSingleCandles(historical)),
          takeUntil(
            action$.ofType(
              utils.customRelayAction(TYPE_.FETCH_CANDLES_DATA_SINGLE_STOP)
            )
          ),
          catchError(err => {
            console.warn(err)
            return of({
              type: TYPE_.QUEUE_ERROR_NOTIFICATION,
              payload: err
            })
          })
        )
      )
    })
  )
