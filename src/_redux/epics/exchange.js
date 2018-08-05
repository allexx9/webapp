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
import { zip } from 'rxjs/observable/zip';
// import rp from 'request-promise'
import {
  getHistoricalPricesDataFromERCdEX,
  getTradeHistoryLogsFromRelayERCdEX,
  getOrdersFromRelayERCdEX,
  formatOrders
} from '../../_utils/exchange'
// import io from 'socket.io-client'
//import ReconnectingWebSocket from 'reconnecting-websocket/dist/reconnecting-websocket-cjs'
import Exchange from '../../_utils/exchange/src/index'
import utils from '../../_utils/utils'


import {
  ERCdEX,
  Ethfinex
} from '../../_utils/const'

import {
  RELAY_GET_ORDERS,
  ORDERBOOK_INIT,
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
  UPDATE_SELECTED_DRAGO_DETAILS,

} from '../../_redux/actions/const'
export * from './exchanges'


//
// GETTING ORDERS FROM RELAY
//

// Creating an observable from the promise
const getOrderBookFromRelay$ = (relay, networkId, baseToken, quoteToken, aggregated) => {

  if (aggregated) {
    const exchange = new Exchange(relay.name, networkId)
    return Observable.fromPromise(exchange.getAggregatedOrders(
      utils.getTockenSymbolForRelay(relay.name, baseToken),
      utils.getTockenSymbolForRelay(relay.name, quoteToken)
    )
    )
  } else {
    const exchange = new Exchange(relay.name, networkId)
    return Observable.fromPromise(exchange.getOrders(
      utils.getTockenSymbolForRelay(relay.name, baseToken),
      utils.getTockenSymbolForRelay(relay.name, quoteToken)
    )
    )
  }
}

// Setting the epic
export const getOrderBookFromRelayEpic = (action$) => {
  return action$.ofType(RELAY_GET_ORDERS)
    .mergeMap((action) => {
      console.log(RELAY_GET_ORDERS)
      return getOrderBookFromRelay$(
        action.payload.relay,
        action.payload.networkId,
        // '42',
        action.payload.baseToken,
        action.payload.quoteToken,
        action.payload.aggregated
      )
        .map(payload => {
          // const aggregate = { aggregated: action.payload.aggregated }
          return { type: ORDERBOOK_INIT, payload: { ...payload } }
        })
    });
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

const getAssetsPricesDataFromERCdEX$ = (networkId, symbol, baseTokenAddress, quoteTokenAddress, startDate) =>
  Observable
    .fromPromise(getHistoricalPricesDataFromERCdEX(networkId, baseTokenAddress, quoteTokenAddress, startDate))
    .map(result => {
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


const getHistoricalPricesData$ = (relay, networkId, baseToken, quoteToken, startDate) => {
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

export const getHistoricalPricesDataFromERCdEXEpic = (action$) => {
  return action$.ofType(FETCH_MARKET_PRICE_DATA)
    .mergeMap((action) => {
      console.log(action)
      return Observable.concat(
        Observable.of({ type: UPDATE_ELEMENT_LOADING, payload: { marketBox: true } }),
        getHistoricalPricesData$(
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

