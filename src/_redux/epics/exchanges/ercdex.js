// Copyright 2016-2017 Rigo Investment Sagl.

// import { Observable } from 'rxjs';
import { Observable } from 'rxjs/Observable'
import 'rxjs/add/observable/dom/webSocket';
import 'rxjs/add/operator/delay';
import 'rxjs/add/operator/mapTo';
import 'rxjs/add/operator/bufferTime';
import 'rxjs/add/operator/bufferCount';
import 'rxjs/add/operator/map';
import 'rxjs/add/operator/reduce';
import 'rxjs/add/operator/switchMap';
import 'rxjs/add/operator/mergeMap';
import 'rxjs/add/operator/takeUntil';
import 'rxjs/add/operator/retryWhen';
import 'rxjs/add/operator/filter';
import 'rxjs/add/operator/catch';
import 'rxjs/add/observable/concat';
import 'rxjs/add/observable/of';
import 'rxjs/observable/timer';
import 'rxjs/observable/fromEvent';
import 'rxjs/add/observable/fromPromise';
// import { timer } from 'rxjs/observable/timer'
import 'rxjs/add/observable/forkJoin';
import Exchange from '../../../_utils/exchange/src/index'
import utils from '../../../_utils/utils'


import {
  ERCdEX,
  Ethfinex
} from '../../../_utils/const'

import {
  RELAY_OPEN_WEBSOCKET,
  RELAY_MSG_FROM_WEBSOCKET,
  RELAY_CLOSE_WEBSOCKET,
  RELAY_GET_ORDERS,
  UPDATE_CURRENT_TOKEN_PRICE,
  UPDATE_ELEMENT_LOADING,
  UPDATE_MARKET_DATA,
  FETCH_CANDLES_DATA,
} from '../../../_redux/actions/const'


//
// CONNECTING TO WS AND GETTING UPDATES FROM RELAY ERCdEX
//

// https://github.com/ReactiveX/rxjs/issues/2048

const customRelayAction = (action) =>
{
 return `${ERCdEX}_${action}`
}

const reconnectingWebsocket$ = (relay, networkId, baseToken, quoteToken) => {
  return Observable.create(observer => {
    // const relay = {
    //   name: 'Ethfinex'
    // }
    const exchange = new Exchange(relay.name, networkId, 'ws')
    const websocket = exchange.getTicker(
      utils.getTockenSymbolForRelay(relay.name, baseToken),
      utils.getTockenSymbolForRelay(relay.name, quoteToken)
    )
    websocket.onmessage = (msg) => {
      console.log('WebSocket message.');
      console.log(msg)
      return observer.next(msg.data);
    }
    websocket.onclose = (msg) => {
      // websocket.send(`unsub:ticker`);
      console.log(msg)
      // return msg.wasClean ? observer.complete() : null
    };
    websocket.onerror = (error) => {
      console.log(error)
      console.log('WebSocket error.');
      // return observer.error(error)
    };
    return () => websocket.close();
  })
}

export const initRelayWebSocketEpic = (action$) => {
  return action$.ofType(customRelayAction(RELAY_OPEN_WEBSOCKET))
    .mergeMap((action) => {
      return reconnectingWebsocket$(
        action.payload.relay,
        action.payload.networkId,
        action.payload.baseToken,
        action.payload.quoteToken
      )
        .takeUntil(
          action$.ofType(RELAY_CLOSE_WEBSOCKET)
            .filter(closeAction => closeAction.ticker === action.ticker)
        )
        .do(() => {
        })
        .map(payload => ({ type: customRelayAction(RELAY_MSG_FROM_WEBSOCKET), payload }))
    });
}

const updateCurrentTokenPrice = (tickerOutput, baseToken) => {
  let ticker = JSON.parse(tickerOutput)
  if (ticker.channel === "ticker") {
    const arrayToObject = (ticker, keyField) =>
      Object.assign({}, ...ticker.data.tickers.map(item => ({ [item[keyField]]: item })))
    const tokenList = arrayToObject(ticker, 'symbol')
    let current = {
      price: tokenList[baseToken.symbol].priceEth
    }
    return {
      type: UPDATE_CURRENT_TOKEN_PRICE,
      payload: {
        current
      }
    }
  } else {
    return {
      type: UPDATE_CURRENT_TOKEN_PRICE,
      payload: {
      }
    }
  }
}

export const orderBookEpic = (action$, state$) => {
  return action$.ofType(customRelayAction(RELAY_MSG_FROM_WEBSOCKET))
    .map(action => action.payload)
    .bufferTime(1000)
    .filter(value => {
      return value.length !== 0
    })
    .bufferCount(1)
    .map(ticker => {  
      console.log(RELAY_MSG_FROM_WEBSOCKET)
      const currentState = state$.getState()
      const lastItem = ticker[0].pop()
      return [ lastItem, currentState ]
    })
    .do(val => {
      console.log(val)
      return val
    })
    .switchMap((ticker) => Observable.of(
      {
        type: RELAY_GET_ORDERS,
        payload: {
          relay: ticker[1].exchange.selectedRelay,
          networkId: '42',
          baseToken: ticker[1].exchange.selectedTokensPair.baseToken,
          quoteToken: ticker[1].exchange.selectedTokensPair.quoteToken,
          aggregated: ticker[1].exchange.orderBookAggregated,
        }
      },
      updateCurrentTokenPrice(ticker[0], ticker[1].exchange.selectedTokensPair.baseToken)
    )
    )
}

//
// FETCH HISTORICAL MARKET DATA
//


const getCandlesData$ = (relay, networkId, baseToken, quoteToken, startDate) => {
  // const relay = {
  //   name: 'ERCdEX'
  // }
  const exchange = new Exchange(relay.name, networkId)
  return Observable.fromPromise(exchange.getHistoricalPricesData(
    utils.getTockenSymbolForRelay(relay.name, baseToken),
    utils.getTockenSymbolForRelay(relay.name, quoteToken),
    startDate))
}

// const getHistoricalPricesData$ = (networkId, baseToken, quoteToken, startDate) =>
//   Observable.fromPromise(getHistoricalPricesDataFromERCdEX(networkId, baseToken.address, quoteToken.address, startDate))

export const getCandlesDataEpic = (action$) => {
  return action$.ofType(customRelayAction(FETCH_CANDLES_DATA))
    .mergeMap((action) => {
      console.log(action)
      return Observable.concat(
        Observable.of({ type: UPDATE_ELEMENT_LOADING, payload: { marketBox: true } }),
        getCandlesData$(
          action.payload.selectedRelay,
          action.payload.networkId,
          action.payload.baseToken,
          action.payload.quoteToken,
          action.payload.startDate
        )
        .map(historical => {
          return {
            type: UPDATE_MARKET_DATA,
            payload: historical
          }
        })
        ,
        Observable.of({ type: UPDATE_ELEMENT_LOADING, payload: { marketBox: false } }),
      )
    });
}