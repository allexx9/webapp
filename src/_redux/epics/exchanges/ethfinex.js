// // Copyright 2016-2017 Rigo Investment Sagl.

// // import { Observable } from 'rxjs';
// import { Observable } from 'rxjs/Observable'
// import 'rxjs/add/observable/dom/webSocket';
// import 'rxjs/add/operator/delay';
// import 'rxjs/add/operator/mapTo';
// import 'rxjs/add/operator/bufferTime';
// import 'rxjs/add/operator/bufferCount';
// import 'rxjs/add/operator/map';
// import 'rxjs/add/operator/reduce';
// import 'rxjs/add/operator/switchMap';
// import 'rxjs/add/operator/mergeMap';
// import 'rxjs/add/operator/takeUntil';
// import 'rxjs/add/operator/retryWhen';
// import 'rxjs/add/operator/filter';
// import 'rxjs/add/operator/catch';
// import 'rxjs/add/observable/concat';
// import 'rxjs/add/observable/of';
// import 'rxjs/observable/timer';
// import 'rxjs/observable/fromEvent';
// import 'rxjs/add/observable/fromPromise';
// // import { timer } from 'rxjs/observable/timer'
// import 'rxjs/add/observable/forkJoin';
// import Exchange from '../../../_utils/exchange/src/index'
// import utils from '../../../_utils/utils'


// // import {
// //   ERCdEX,
// //   Ethfinex
// // } from '../../../_utils/const'

// import {
//   RELAY_OPEN_WEBSOCKET,
//   RELAY_MSG_FROM_WEBSOCKET,
//   RELAY_CLOSE_WEBSOCKET,
//   RELAY_GET_ORDERS,
//   UPDATE_CURRENT_TOKEN_PRICE

// } from '../../../_redux/actions/const'

// //
// // CONNECTING TO WS AND GETTING UPDATES FROM RELAY ERCdEX
// //

// // https://github.com/ReactiveX/rxjs/issues/2048

// const reconnectingWebsocket$ = (relay, baseToken, quoteToken) => {
//   return Observable.create(observer => {
//     const exchange = new Exchange(relay.name, '1', 'ws')
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
//       console.log(msg)
//     };
//     websocket.onerror = (error) => {
//       console.log(error)
//       console.log('WebSocket error.');
//     };
//     return () => websocket.close();
//   })
// }

// export const relayWebSocketEpic = (action$) =>
//   action$.ofType(RELAY_OPEN_WEBSOCKET)
//     .mergeMap((action) => {
//       return reconnectingWebsocket$(
//         action.payload.relay,
//         action.payload.baseToken,
//         action.payload.quoteToken
//       )
//       .takeUntil(
//         action$.ofType(RELAY_CLOSE_WEBSOCKET)
//           .filter(closeAction => closeAction.ticker === action.ticker)
//       )
//       .map(payload => ({ type: RELAY_MSG_FROM_WEBSOCKET, payload }))
//     });

// const updateCurrentTokenPrice = (tickerOutput, relay, baseToken) => {
//   var ticker = JSON.parse(tickerOutput)
//   console.log(ticker)
//   if (Array.isArray(ticker[1])) {
//     var current = {
//       price: ticker[1][6],
//     }
//     return {
//       type: UPDATE_CURRENT_TOKEN_PRICE,
//       payload: {
//         current
//       }
//     }
//   } else {
//     return {
//       type: UPDATE_CURRENT_TOKEN_PRICE,
//       payload: {
//       }
//     }
//   }
// }

// export const orderBookEpic = (action$, store) => {
//   const state = store.getState()
//   const relay = state.exchange.selectedRelay
//   const networkId = state.exchange.relay.networkId
//   const baseToken = state.exchange.selectedTokensPair.baseToken
//   const quoteToken = state.exchange.selectedTokensPair.quoteToken
//   const aggregated = state.exchange.orderBook.aggregated
//   return action$.ofType(RELAY_MSG_FROM_WEBSOCKET)
//     .map(action => action.payload)
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

