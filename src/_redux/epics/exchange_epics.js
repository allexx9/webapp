// Copyright 2016-2017 Rigo Investment Sagl.

// import { Observable } from 'rxjs';
import 'rxjs/add/observable/concat'
import 'rxjs/add/observable/dom/webSocket'
import 'rxjs/add/observable/fromPromise'
import 'rxjs/add/observable/of'
import 'rxjs/add/operator/bufferCount'
import 'rxjs/add/operator/bufferTime'
import 'rxjs/add/operator/catch'
import 'rxjs/add/operator/delay'
import 'rxjs/add/operator/filter'
import 'rxjs/add/operator/map'
import 'rxjs/add/operator/mapTo'
import 'rxjs/add/operator/mergeMap'
import 'rxjs/add/operator/reduce'
import 'rxjs/add/operator/retryWhen'
import 'rxjs/add/operator/switchMap'
import 'rxjs/add/operator/takeUntil'
import 'rxjs/observable/fromEvent'
import 'rxjs/observable/timer'
import { Observable } from 'rxjs/Observable'
// import { timer } from 'rxjs/observable/timer'
import 'rxjs/add/observable/forkJoin'
import {
  // getHistoricalPricesDataFromERCdEX,
  getTradeHistoryLogsFromRelayERCdEX
} from '../../_utils/exchange'
// import io from 'socket.io-client'
//import ReconnectingWebSocket from 'reconnecting-websocket/dist/reconnecting-websocket-cjs'
import * as ERRORS from '../../_const/errors'
import * as TYPE_ from '../actions/const'
import {
  FETCH_HISTORY_TRANSACTION_LOGS,
  ORDERBOOK_INIT,
  RELAY_GET_ORDERS,
  UPDATE_ELEMENT_LOADING,
  UPDATE_FUND_LIQUIDITY,
  UPDATE_HISTORY_TRANSACTION_LOGS,
  UPDATE_SELECTED_FUND
} from '../actions/const'
import Exchange from '../../_utils/exchange/src/index'
import utils from '../../_utils/utils'

export * from './exchanges'

//
// GETTING ORDERS FROM RELAY
//

// Creating an observable from the promise
const getOrderBookFromRelay$ = (
  relay,
  networkId,
  baseToken,
  quoteToken,
  aggregated
) => {
  if (aggregated) {
    const exchange = new Exchange(relay.name, networkId)
    return Observable.fromPromise(
      exchange.getAggregatedOrders(
        utils.getTockenSymbolForRelay(relay.name, baseToken),
        utils.getTockenSymbolForRelay(relay.name, quoteToken)
      )
    )
  } else {
    const exchange = new Exchange(relay.name, networkId)
    return Observable.fromPromise(
      exchange.getOrders(
        utils.getTockenSymbolForRelay(relay.name, baseToken),
        utils.getTockenSymbolForRelay(relay.name, quoteToken)
      )
    )
  }
}

// Setting the epic
export const getOrderBookFromRelayEpic = action$ => {
  return action$.ofType(RELAY_GET_ORDERS).mergeMap(action => {
    return getOrderBookFromRelay$(
      action.payload.relay,
      action.payload.networkId,
      action.payload.baseToken,
      action.payload.quoteToken,
      action.payload.aggregated
    )
      .map(payload => {
        // const aggregate = { aggregated: action.payload.aggregated }
        return { type: ORDERBOOK_INIT, payload: { ...payload } }
      })
      .catch(error => {
        console.log(error)
        return Observable.of({
          type: TYPE_.QUEUE_ERROR_NOTIFICATION,
          payload: ERRORS.E001
        })
      })
  })
}

//
// UPDATE FUND LIQUIDITY
//

const updateFundLiquidity$ = (fundAddress, api) =>
  Observable.fromPromise(utils.getDragoLiquidity(fundAddress, api)).map(
    liquidity => {
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
    }
  )

export const updateFundLiquidityEpic = action$ => {
  return action$.ofType(UPDATE_FUND_LIQUIDITY).mergeMap(action => {
    return Observable.concat(
      Observable.of({
        type: UPDATE_ELEMENT_LOADING,
        payload: { liquidity: true }
      }),
      updateFundLiquidity$(action.payload.fundAddress, action.payload.api),
      Observable.of({
        type: UPDATE_ELEMENT_LOADING,
        payload: { liquidity: false }
      })
    )
  })
}

//
// FETCH HISTORICAL TRANSCATION LOGS DATA
//

const getTradeHistoryLogsFromRelayERCdEX$ = (
  networkId,
  baseTokenAddress,
  quoteTokenAddress
) =>
  Observable.fromPromise(
    getTradeHistoryLogsFromRelayERCdEX(
      networkId,
      baseTokenAddress,
      quoteTokenAddress
    )
  )

export const getTradeHistoryLogsFromRelayERCdEXEpic = action$ => {
  return action$.ofType(FETCH_HISTORY_TRANSACTION_LOGS).mergeMap(action => {
    return Observable.concat(
      // Observable.of({ type: UPDATE_ELEMENT_LOADING, payload: { marketBox: true }}),
      getTradeHistoryLogsFromRelayERCdEX$(
        action.payload.networkId,
        action.payload.baseTokenAddress,
        action.payload.quoteTokenAddress
      ).map(logs => {
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
      // Observable.of({ type: UPDATE_ELEMENT_LOADING, payload: { marketBox: false }}),
    )
  })
}
