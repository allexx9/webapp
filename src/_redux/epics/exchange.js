// Copyright 2016-2017 Rigo Investment Sarl.

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
import { zip } from 'rxjs/observable/zip';
// import rp from 'request-promise'
import {
  getOrderBookFromRelayERCdEX,
  getAggregatedOrdersFromRelayERCdEX,
  getHistoricalPricesDataFromERCdEX,
  getTradeHistoryLogsFromRelayERCdEX,
  getOrdersFromRelayERCdEX,
  formatOrders
} from '../../_utils/exchange'
// import io from 'socket.io-client'
import ReconnectingWebSocket from 'reconnecting-websocket'
//import ReconnectingWebSocket from 'reconnecting-websocket/dist/reconnecting-websocket-cjs'
import utils from '../../_utils/utils'

import {
  ORDERBOOK_UPDATE,
  RELAY_OPEN_WEBSOCKET,
  RELAY_MSG_FROM_WEBSOCKET,
  RELAY_CLOSE_WEBSOCKET,
  RELAY_GET_ORDERS,
  ORDERBOOK_INIT,
  RELAY_UPDATE_ORDERS,
  UPDATE_FUND_LIQUIDITY,
  UPDATE_SELECTED_FUND,
  UPDATE_ELEMENT_LOADING,
  UPDATE_MARKET_DATA,
  FETCH_MARKET_PRICE_DATA,
  FETCH_HISTORY_TRANSACTION_LOGS,
  UPDATE_HISTORY_TRANSACTION_LOGS,
  FETCH_FUND_ORDERS,
  UPDATE_FUND_ORDERS,
  FETCH_ASSETS_PRICE_DATA,
  UPDATE_SELECTED_DRAGO_DETAILS
} from '../../_utils/const'


//
// GETTING ORDERS FROM RELAY ERCdEX
//

// Creating an observable from the promise
const getOrderBookFromRelayERCdEX$ = (networkId, baseTokenAddress, quoteTokenAddress, aggregated) =>
  aggregated
    ? Observable.fromPromise(getAggregatedOrdersFromRelayERCdEX(networkId, baseTokenAddress, quoteTokenAddress))
    : Observable.fromPromise(getOrderBookFromRelayERCdEX(networkId, baseTokenAddress, quoteTokenAddress))

// Setting the epic
export const initOrderBookFromRelayERCdEXEpic = (action$) =>
  action$.ofType(RELAY_GET_ORDERS)
    .mergeMap((action) => {
      return getOrderBookFromRelayERCdEX$(
        action.payload.networkId,
        action.payload.baseTokenAddress,
        action.payload.quoteTokenAddress,
        action.payload.aggregated
      )
        .map(payload => {
          const aggregate = { aggregated: action.payload.aggregated }
          return { type: ORDERBOOK_INIT, payload: { ...payload, ...aggregate } }
        })
    });

//
// GETTING UPDATES FROM RELAY ERCdEX
//

export const webSocketReducer = (state = 0, action) => {
  switch (action.type) {
    case RELAY_OPEN_WEBSOCKET:
      return {};
    case ORDERBOOK_UPDATE:
      return {};
    case RELAY_CLOSE_WEBSOCKET:
      return {};
    case RELAY_MSG_FROM_WEBSOCKET:
      return {};
    case RELAY_UPDATE_ORDERS:
      return {};
    default:
      return state;
  }
};


// https://github.com/ReactiveX/rxjs/issues/2048

const reconnectingWebsocket$ = (baseTokenAddress, quoteTokenAddress) => {
  return Observable.create(observer => {
    var websocket = new ReconnectingWebSocket('wss://api.ercdex.com')
    websocket.addEventListener('open', (msg) => {
      console.log('WebSocket open.')
      // websocket.send(`sub:ticker`);
      websocket.send(`sub:pair-order-change/${baseTokenAddress}/${quoteTokenAddress}`);
      websocket.send(`sub:pair-order-change/${quoteTokenAddress}/${baseTokenAddress}`);
      return observer.next(msg.data);
    });
    // websocket.addEventListener('close', () => {
    //   websocket._shouldReconnect && websocket._connect();
    //   console.log('WebSocket reconnecting.');
    // })
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

// const socket$ = Observable.webSocket('wss://api.ercdex.com');

export const relayWebSocketEpic = (action$) =>
  action$.ofType(RELAY_OPEN_WEBSOCKET)
    .mergeMap((action) => {
      return reconnectingWebsocket$(
        action.payload.baseTokenAddress,
        action.payload.quoteTokenAddress
      )
        // .retryWhen((err) => {
        //   console.log('Retry when error');
        //   console.log(err)
        //   return window.navigator.onLine ? timer(1000) : Observable.fromEvent(window, 'online')
        // })
        .takeUntil(
          action$.ofType('RELAY_CLOSE_WEBSOCKET')
            .filter(closeAction => closeAction.ticker === action.ticker)
        )
        .map(payload => ({ type: RELAY_MSG_FROM_WEBSOCKET, payload }))
    });


export const orderBookEpic = (action$, store) => {
  const state = store.getState()
  const networkId = state.exchange.relay.networkId
  const baseTokenAddress = state.exchange.selectedTokensPair.baseToken.address
  const quoteTokenAddress = state.exchange.selectedTokensPair.quoteToken.address
  const aggregated = state.exchange.orderBook.aggregated
  return action$.ofType(RELAY_MSG_FROM_WEBSOCKET)
    .map(action => action.payload)
    .bufferTime(2000)
    .filter(value => {
      // console.log(value)
      return value.length !== 0
    })
    .bufferCount(1)
    // .map(updateOrderBook)
    .map(() => ({
      type: RELAY_GET_ORDERS,
      payload: {
        networkId,
        baseTokenAddress,
        quoteTokenAddress,
        aggregated
      }
    }))
}

//
// UPDATE FUND LIQUIDITY
//

const updateFundLiquidity$ = (fundAddress, api) =>
  Observable.fromPromise(utils.getDragoLiquidity(fundAddress, api))
    .map(liquidity => {
      const payload = {
        liquidity: {
          ETH: liquidity[0],
          WETH: liquidity[1],
          ZRX: liquidity[2]
        }
      }
      return {
        type: UPDATE_SELECTED_FUND,
        payload: payload
      }
    })

export const updateFundLiquidityEpic = (action$) => {
  return action$.ofType(UPDATE_FUND_LIQUIDITY)
    .mergeMap((action) => {
      return Observable.concat(
        Observable.of({ type: UPDATE_ELEMENT_LOADING, payload: { liquidity: true } }),
        updateFundLiquidity$(
          action.payload.fundAddress,
          action.payload.api,
        ),
        Observable.of({ type: UPDATE_ELEMENT_LOADING, payload: { liquidity: false } }),
      )
    });
}

//
// FETCH ASSETS PRICES DATA
//

const getAssetsPricesDataFromERCdEX$ = (networkId, symbol,baseTokenAddress, quoteTokenAddress, startDate) =>
  Observable
    .fromPromise(getHistoricalPricesDataFromERCdEX(networkId, baseTokenAddress, quoteTokenAddress, startDate))
    .map(result =>{
      const data = {
        symbol: symbol,
        startDate,
        data: result.map(entry => {
          const date = new Date(entry.date)
          entry.date = date
          return entry
        }),
        error: ''
      }
      return data
    })
    .catch(error => {
      const data = {
        symbol: symbol,
        startDate,
        data: [],
        error
      }
      return Observable.of(data)
    })

export const getAssetsPricesDataFromERCdEXEpic = (action$) => {
  return action$.ofType(FETCH_ASSETS_PRICE_DATA)
    .mergeMap((action) => {
      const observableArray = () => {
        const observableArray = Array()
        for (var property in action.payload.assets) {
          if (action.payload.assets.hasOwnProperty(property)) {
            // console.log(action.payload.assets[property])
            observableArray.push(
              getAssetsPricesDataFromERCdEX$(
                action.payload.networkId,
                action.payload.assets[property].symbol,
                action.payload.assets[property].address,
                action.payload.quoteToken,
                new Date((Math.floor(Date.now() / 1000) - 86400 * 7) * 1000).toISOString()
              )
            )
          }
        }
        return observableArray
      }
      return Observable.forkJoin(observableArray())
        .map((result) => {
          const arrayToObject = (arr, keyField) =>
          Object.assign({}, ...arr.map(item => ({ [item[keyField]]: item })))
          const assetsCharts = arrayToObject(result, 'symbol')
          return {
            type: UPDATE_SELECTED_DRAGO_DETAILS,
            payload: {
              assetsCharts
            }
          }
        }
        )

    });
}

//
// FETCH HISTORICAL MARKET DATA
//

const getHistoricalPricesDataFromERCdEX$ = (networkId, baseTokenAddress, quoteTokenAddress, startDate) =>
  Observable.fromPromise(getHistoricalPricesDataFromERCdEX(networkId, baseTokenAddress, quoteTokenAddress, startDate))

export const getHistoricalPricesDataFromERCdEXEpic = (action$) => {
  return action$.ofType(FETCH_MARKET_PRICE_DATA)
    .mergeMap((action) => {
      return Observable.concat(
        Observable.of({ type: UPDATE_ELEMENT_LOADING, payload: { marketBox: true } }),
        getHistoricalPricesDataFromERCdEX$(
          action.payload.networkId,
          action.payload.baseTokenAddress,
          action.payload.quoteTokenAddress,
          action.payload.startDate
        )
          .map(historical => {
            // const payload = historical.map(entry =>{
            //   const date = new Date(entry.date)
            //   entry.date = date
            //   return entry
            // })
            // console.log(payload)
            return {
              type: UPDATE_MARKET_DATA,
              payload: historical.map(entry => {
                const date = new Date(entry.date)
                entry.date = date
                return entry
              })
            }
          })
        ,
        Observable.of({ type: UPDATE_ELEMENT_LOADING, payload: { marketBox: false } }),
      )
    });
}

//
// FETCH HISTORICAL TRANSCATION LOGS DATA
//

const getTradeHistoryLogsFromRelayERCdEX$ = (networkId, baseTokenAddress, quoteTokenAddress) =>
  Observable.fromPromise(getTradeHistoryLogsFromRelayERCdEX(networkId, baseTokenAddress, quoteTokenAddress))

export const getTradeHistoryLogsFromRelayERCdEXEpic = (action$) => {
  return action$.ofType(FETCH_HISTORY_TRANSACTION_LOGS)
    .mergeMap((action) => {
      return Observable.concat(
        // Observable.of({ type: UPDATE_ELEMENT_LOADING, payload: { marketBox: true }}),
        getTradeHistoryLogsFromRelayERCdEX$(
          action.payload.networkId,
          action.payload.baseTokenAddress,
          action.payload.quoteTokenAddress,
        )
          .map(logs => {
            // const payload = historical.map(entry =>{
            //   const date = new Date(entry.date)
            //   entry.date = date
            //   return entry
            // })
            // console.log(payload)
            console.log(logs)
            return {
              type: UPDATE_HISTORY_TRANSACTION_LOGS,
              payload: logs
            }
          })
        ,
        // Observable.of({ type: UPDATE_ELEMENT_LOADING, payload: { marketBox: false }}),
      )
    });
}

//
// FETCH OPEN ORDERS
//

const getOrdersFromRelayERCdEX$ = (networkId, maker, baseTokenAddress, quoteTokenAddress) =>
  Observable.fromPromise(getOrdersFromRelayERCdEX(networkId, maker, baseTokenAddress, quoteTokenAddress))

export const getOrdersFromRelayERCdEXEpic = (action$) => {
  return action$.ofType(FETCH_FUND_ORDERS)
    .mergeMap((action) => {
      return Observable.concat(
        // Observable.of({ type: UPDATE_ELEMENT_LOADING, payload: { marketBox: true }}),
        zip(
          getOrdersFromRelayERCdEX$(
            action.payload.networkId,
            action.payload.maker,
            action.payload.baseTokenAddress,
            action.payload.quoteTokenAddress,
          )
            .map(orders => {
              return formatOrders(orders, 'asks')
            })
          ,
          getOrdersFromRelayERCdEX$(
            action.payload.networkId,
            action.payload.maker,
            action.payload.quoteTokenAddress,
            action.payload.baseTokenAddress,
          )
            .map(orders => {
              return formatOrders(orders, 'bids')
            })
        )

          .map(orders => {
            console.log(orders[0].concat(orders[1]))
            return {
              type: UPDATE_FUND_ORDERS,
              payload: {
                open: orders[0].concat(orders[1])
              }
            }
          })
        ,
        // Observable.of({ type: UPDATE_ELEMENT_LOADING, payload: { marketBox: false }}),
      )
    });
}

