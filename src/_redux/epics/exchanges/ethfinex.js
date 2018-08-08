// // Copyright 2016-2017 Rigo Investment Sagl.

// import { Observable } from 'rxjs';
import { Observable } from 'rxjs/Observable'
// import 'rxjs/add/observable/dom/webSocket';
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
import 'rxjs/add/operator/last';
import 'rxjs/add/operator/skip';
import 'rxjs/add/operator/takeLast';
// import 'rxjs/add/operator/catchError';
import 'rxjs/add/observable/concat';
import 'rxjs/add/observable/of';
import 'rxjs/observable/timer';
import 'rxjs/observable/fromEvent';
import 'rxjs/add/observable/fromPromise';
// import { timer } from 'rxjs/observable/timer'
import 'rxjs/add/observable/forkJoin';
import Exchange from '../../../_utils/exchange/src/index'
import utils from '../../../_utils/utils'
// import { catchError } from 'rxjs/operators';
// import { catchError } from 'rxjs/operators';


import {
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
  INIT_MARKET_DATA,
  ADD_DATAPOINT_MARKET_DATA,

  FETCH_CANDLES_DATA,
  ADD_ERROR_NOTIFICATION

} from '../../../_redux/actions/const'

const customRelayAction = (action) => {
  // console.log(`${Ethfinex.toUpperCase()}_${action}`)
  return `${Ethfinex.toUpperCase()}_${action}`
}


// //
// // CONNECTING TO WS AND GETTING UPDATES FROM RELAY ERCdEX
// //

// // https://github.com/ReactiveX/rxjs/issues/2048

// const reconnectingWebsocket$ = (relay, baseToken, quoteToken) => {
//   return Observable.create(observer => {
//     // const relay = {
//     //   name: 'Ethfinex'
//     // }
//     const exchange = new Exchange(relay.name, '42', 'ws')
//     const websocket = exchange.getTicker(
//       utils.getTockenSymbolForRelay(relay.name, baseToken),
//       utils.getTockenSymbolForRelay(relay.name, quoteToken)
//     )
//     websocket.onmessage = (msg) => {
//       console.log('WebSocket message.');
//       console.log(msg)
//       return observer.next(msg.data);
//     }
//     websocket.onclose = (msg) => {
//       // websocket.send(`unsub:ticker`);
//       console.log(msg)
//       // return msg.wasClean ? observer.complete() : null
//     };
//     websocket.onerror = (error) => {
//       console.log(error)
//       console.log('WebSocket error.');
//       // return observer.error(error)
//     };
//     return () => websocket.close();
//   })
// }

//
// FETCH HISTORICAL MARKET DATA
//


// const getHistoricalPricesData$ = (relay, networkId, baseToken, quoteToken, startDate) => {
//   const exchange = new Exchange(relay.name, networkId)
//   return Observable.fromPromise(exchange.getHistoricalPricesData(
//     utils.getTockenSymbolForRelay(relay.name, baseToken),
//     utils.getTockenSymbolForRelay(relay.name, quoteToken),
//     startDate))
// }

// const getHistoricalPricesData$ = (networkId, baseToken, quoteToken, startDate) =>
//   Observable.fromPromise(getHistoricalPricesDataFromERCdEX(networkId, baseToken.address, quoteToken.address, startDate))


// export const getCandlesDataEpic = (action$) => {
//   return action$.ofType(customRelayAction(FETCH_CANDLES_DATA))
//     .mergeMap((action) => {
//       console.log(action)
//       return Observable.concat(
//         Observable.of({ type: UPDATE_ELEMENT_LOADING, payload: { marketBox: true } }),
//         getHistoricalPricesData$(
//           action.payload.selectedRelay,
//           action.payload.networkId,
//           action.payload.baseToken,
//           action.payload.quoteToken,
//           action.payload.startDate
//         )
//         .map(historical => {
//           return {
//             type: UPDATE_MARKET_DATA,
//             payload: historical
//           }
//         })
//         ,
//         Observable.of({ type: UPDATE_ELEMENT_LOADING, payload: { marketBox: false } }),
//       )
//     });
// }

const candelsWebsocket$ = (relay, networkId, baseToken, quoteToken) => {
  return Observable.create(observer => {
    // const relay = {
    //   name: 'Ethfinex'
    // }
    console.log('candels')
    const exchange = new Exchange(relay.name, networkId, 'ws')
    const websocket = exchange.getHistoricalPricesData(
      utils.getTockenSymbolForRelay(relay.name, baseToken),
      utils.getTockenSymbolForRelay(relay.name, quoteToken),
      '1m'
    )
    websocket.onmessage = (msg) => {
      // console.log('WebSocket message.');
      // console.log(msg)
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

const updateCandles = (tickerOutput) => {
  let ticker = JSON.parse(tickerOutput)
  // console.log(ticker)
  // console.log(Array.isArray(ticker))

    if (ticker[1].length !== 6 && ticker[1] !== "hb") {
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
        type: INIT_MARKET_DATA,
        payload: candles.reverse()
      }

    }
    if (ticker[1].length === 6 && ticker[1] !== "hb") {
      let date = new Date(ticker[1][0])
      console.log(`${ticker[1][0]} -> ${date}`)
      // console.log(new Date(ticker[1][0]))
      let candles = 
        {
          date: new Date(ticker[1][0]),
          low: ticker[1][4],
          high: ticker[1][3],
          open: ticker[1][1],
          close: ticker[1][2],
          volume: ticker[1][5],
          epoch: ticker[1][0]
        }
      
      return {
        type: ADD_DATAPOINT_MARKET_DATA,
        payload: candles
      }
    }
    return {
      type: ADD_DATAPOINT_MARKET_DATA,
      payload: ""
    }

}


export const getCandlesDataEpic = (action$) => {
  return action$.ofType(customRelayAction(FETCH_CANDLES_DATA))
    .mergeMap((action) => {
      console.log(action)
      return Observable.concat(
        // Observable.of({ type: UPDATE_ELEMENT_LOADING, payload: { marketBox: true } }),
        candelsWebsocket$(
          action.payload.relay,
          action.payload.networkId,
          action.payload.baseToken,
          action.payload.quoteToken,
          action.payload.startDate
        )
        .skip(2)
        // .filter(val => { 
        //   return Array.isArray(JSON.parse(val)) 
        // })
        .filter(val => { 
          let tick = JSON.parse(val)
          return tick[1] !== "hb"
        }
        )
        // .bufferCount(2)
        // .do(val => {
        //   console.log(val)
        //   return val
        // })
        // .takeLast(1)
        .do(val => {
          // console.log(val)
          return val
        })
        // .last()
        .map(historical => {
          return updateCandles(historical)
        }),
        // Observable.of({ type: UPDATE_ELEMENT_LOADING, payload: { marketBox: false } }),
      )
    });
}


//
// CONNECTING TO WS AND GETTING UPDATES FROM RELAY
//

const reconnectingWebsocket$ = (relay, networkId, baseToken, quoteToken) => {
  return Observable.create(observer => {
    console.log(networkId)
    const exchange = new Exchange(relay.name, networkId, 'ws')
    const websocket = exchange.getTicker(
      utils.getTockenSymbolForRelay(relay.name, baseToken),
      utils.getTockenSymbolForRelay(relay.name, quoteToken)
    )
    websocket.onmessage = (msg) => {
      console.log('WebSocket message.');
      // console.log(msg)
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
      return observer.error(error)
    };
    return () => websocket.close();
  })
}


export const initRelayWebSocketEpic = (action$) =>
  action$.ofType(customRelayAction(RELAY_OPEN_WEBSOCKET))
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
        .map(payload => ({ type: customRelayAction(RELAY_MSG_FROM_WEBSOCKET), payload }))
        .catch(() => {
          // console.log(val)
          return Observable.of({
            type: ADD_ERROR_NOTIFICATION,
            payload: 'Error connecting to price ticker.'
          })
        }
        )
    });

const updateCurrentTokenPrice = (tickerOutput) => {
  let ticker = JSON.parse(tickerOutput)
  // console.log(ticker)
  if (Array.isArray(ticker[1])) {
    let current = {
      price: ticker[1][6],
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

// export const orderBookEpic = (action$, store) => {
//   const state = store.getState()
//   const relay = state.exchange.selectedRelay
//   const networkId = state.exchange.relay.networkId
//   const baseToken = state.exchange.selectedTokensPair.baseToken
//   const quoteToken = state.exchange.selectedTokensPair.quoteToken
//   const aggregated = state.exchange.orderBook.aggregated
//   return action$.ofType(customRelayAction(RELAY_MSG_FROM_WEBSOCKET))
//     .map(action => {
//       console.log(action)
//       return action.payload
//     })
//     .bufferTime(1000)
//     .filter(value => {
//       return value.length !== 0
//     })
//     .bufferCount(1)
//     .map(ticker => {

//       const lastItem = ticker[0].pop()
//       return lastItem
//     })
//     .switchMap((ticker) => Observable.of(
//       {
//         type: RELAY_GET_ORDERS,
//         payload: {
//           relay,
//           networkId,
//           baseToken,
//           quoteToken,
//           aggregated
//         }
//       },
//       updateCurrentTokenPrice(ticker, relay, baseToken)
//     )
//     )
// }

export const orderBookEpic = (action$, state$) => {
  return action$.ofType(customRelayAction(RELAY_MSG_FROM_WEBSOCKET))
    .map(action => action.payload)
    .bufferTime(1000)
    .filter(value => {
      return value.length !== 0
    })
    .bufferCount(1)
    .map(ticker => {
      // console.log(customRelayAction((RELAY_MSG_FROM_WEBSOCKET)))
      const currentState = state$.getState()
      const lastItem = ticker[0].pop()
      // return [ lastItem, currentState ]
      return {
        item: lastItem,
        state: currentState
      }
    })
    .do(val => {
      // console.log(val)
      return val
    })
    .switchMap((ticker) => Observable.of(
      {
        type: RELAY_GET_ORDERS,
        payload: {
          relay: ticker.state.exchange.selectedRelay,
          networkId: ticker.state.endpoint.networkInfo.id,
          baseToken: ticker.state.exchange.selectedTokensPair.baseToken,
          quoteToken: ticker.state.exchange.selectedTokensPair.quoteToken,
          aggregated: ticker.state.exchange.orderBookAggregated,
        }
      },
      updateCurrentTokenPrice(ticker.item, ticker.state.exchange.selectedTokensPair.baseToken)
    )
    )
}

