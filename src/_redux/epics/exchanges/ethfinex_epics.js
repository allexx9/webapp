// Copyright 2016-2017 Rigo Investment Sagl.

// import { Observable } from 'rxjs';
import { BigNumber } from '@0xproject/utils'
import { Observable, from, merge, timer, zip } from 'rxjs'
import {
  bufferCount,
  bufferTime,
  catchError,
  concat,
  exhaustMap,
  filter,
  map,
  mergeMap,
  skip,
  takeUntil,
  tap,
  throttleTime
} from 'rxjs/operators'
import { ofType } from 'redux-observable'
import CRC from 'crc-32'
import _ from 'lodash'
import moment from 'moment'

import Exchange from '../../../_utils/exchange/src'
import utils from '../../../_utils/utils'

import { Actions } from '../../actions/'
import { Ethfinex } from '../../../_utils/const'

import * as TYPE_ from '../../actions/const'

import exchangeConnector from '@rigoblock/exchange-connector'

const customRelayAction = action => {
  // console.log(`${Ethfinex.toUpperCase()}_${action}`)
  return `${Ethfinex.toUpperCase()}_${action}`
}

//
// FETCH HISTORICAL MARKET DATA FOR A SPECIFIC TRADING PAIR
//

const candlesSingleWebsocket$ = (relay, networkId, baseToken, quoteToken) => {
  return Observable.create(observer => {
    // const relay = {
    //   name: 'Ethfinex'
    // }
    console.log('candles')
    const exchange = new Exchange(relay.name, networkId, 'ws')
    const websocket = exchange.getHistoricalPricesData(
      // utils.getTockenSymbolForRelay(relay.name, baseToken),
      // utils.getTockenSymbolForRelay(relay.name, quoteToken),
      'test',
      'test',
      '1m'
    )
    const baseTokenSymbol = utils.getTockenSymbolForRelay(relay.name, baseToken)
    const quoteTokenSymbol = utils.getTockenSymbolForRelay(
      relay.name,
      quoteToken
    )
    websocket.addEventListener('open', () => {
      let msg = JSON.stringify({
        event: `subscribe`,
        channel: `candles`,
        key: `trade:1m:t${baseTokenSymbol}${quoteTokenSymbol}`
      })
      websocket.send(msg)
    })

    websocket.onmessage = msg => {
      // console.log('WebSocket message.');
      // console.log(msg)
      return observer.next(msg.data)
    }
    websocket.onclose = msg => {
      // websocket.send(`unsub:ticker`);
      console.log(`Candle WS closed`)
      // console.log(msg)
      return msg.wasClean ? observer.complete() : null
    }
    websocket.onerror = error => {
      // console.log(error)
      console.log('WebSocket error.')
      return observer.error(error)
    }
    return () => websocket.close(1000, 'Closed by client', { keepClosed: true })
  })
}

const updateSingleCandles = tickerOutput => {
  let ticker = JSON.parse(tickerOutput)
  // console.log(ticker)
  // console.log(Array.isArray(ticker))

  if (ticker[1].length !== 6 && ticker[1] !== 'hb') {
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
  if (ticker[1].length === 6 && ticker[1] !== 'hb') {
    // console.log(`${ticker[1][0]} -> ${date}`)
    // console.log(new Date(ticker[1][0]))
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

export const getCandlesSingleDataEpic = action$ => {
  return action$.pipe(
    ofType(customRelayAction(TYPE_.FETCH_CANDLES_DATA_SINGLE)),
    mergeMap(action => {
      console.log(action)
      return Observable.concat(
        // Observable.of({ type: UPDATE_ELEMENT_LOADING, payload: { marketBox: true } }),
        candlesSingleWebsocket$(
          action.payload.relay,
          action.payload.networkId,
          action.payload.baseToken,
          action.payload.quoteToken,
          action.payload.startDate
        ).pipe(
          takeUntil(
            action$.ofType(customRelayAction(TYPE_.RELAY_CLOSE_WEBSOCKET))
          ),
          skip(2),
          filter(val => {
            let tick = JSON.parse(val)
            return tick[1] !== 'hb'
          }),
          filter(val => {
            let tick = JSON.parse(val)
            return (
              typeof tick[1] !== 'undefined' || typeof tick[0] !== 'undefined'
            )
          }),
          tap(val => {
            // console.log(val)
            return val
          }),
          map(historical => {
            return updateSingleCandles(historical)
          }),
          catchError(() => {
            return Observable.of({
              type: TYPE_.QUEUE_ERROR_NOTIFICATION,
              payload: 'Error fetching candles data.'
            })
          })
        )
        // Observable.of({ type: UPDATE_ELEMENT_LOADING, payload: { marketBox: false } }),
      )
    })
  )
}

//
// CONNECTING TO WS AND GETTING BOOK UPDATES
//
// THIS EPIC IS CALLED WHEN THE EXCHANGE IS INITALIZED
//

const reconnectingWebsocketBook$ = (
  relay,
  networkId,
  baseToken,
  quoteToken
) => {
  return Observable.create(observer => {
    const BOOK = {}
    let seq = null
    let pair = 'ETHUSD'

    const checkCross = () => {
      let bid = BOOK.psnap.bids[0]
      let ask = BOOK.psnap.asks[0]
      if (bid >= ask) {
        let lm = [moment.utc().format(), 'bid(' + bid + ')>=ask(' + ask + ')']
        console.log(lm.join('/') + '\n')
        console.log(lm.join('/'))
      }
    }

    const exchange = new Exchange(relay.name, networkId, 'ws')
    const websocket = exchange.getAggregatedOrders(
      utils.getTockenSymbolForRelay(relay.name, baseToken),
      utils.getTockenSymbolForRelay(relay.name, quoteToken)
    )
    pair =
      utils.getTockenSymbolForRelay(relay.name, baseToken) +
      utils.getTockenSymbolForRelay(relay.name, quoteToken)
    console.log(pair)
    websocket.addEventListener('open', () => {
      console.log('WebSocket open.')
      BOOK.bids = {}
      BOOK.asks = {}
      BOOK.psnap = {}
      BOOK.mcnt = 0

      let msg = JSON.stringify({
        event: `subscribe`,
        channel: 'book',
        pair: 't' + pair,
        prec: 'P2',
        freq: 'F1',
        len: 25
      })
      websocket.send(JSON.stringify({ event: 'conf', flags: 65536 + 131072 }))
      websocket.send(msg)
    })

    websocket.onmessage = msgWs => {
      // console.log('WebSocket message.')
      // console.log(msgWs)
      let msg = JSON.parse(msgWs.data)
      if (msg.event) return
      if (msg[1] === 'hb') {
        seq = +msg[2]
        return
      } else if (msg[1] === 'cs') {
        seq = +msg[3]

        const checksum = msg[2]
        const csdata = []
        const bids_keys = BOOK.psnap['bids']
        const asks_keys = BOOK.psnap['asks']

        for (let i = 0; i < 25; i++) {
          if (bids_keys[i]) {
            const price = bids_keys[i]
            const pp = BOOK.bids[price]
            csdata.push(pp.price, pp.amount)
          }
          if (asks_keys[i]) {
            const price = asks_keys[i]
            const pp = BOOK.asks[price]
            csdata.push(pp.price, -pp.amount)
          }
        }

        const cs_str = csdata.join(':')
        const cs_calc = CRC.str(cs_str)

        // console.log(
        //   '[' +
        //     moment().format('YYYY-MM-DDTHH:mm:ss.SSS') +
        //     '] ' +
        //     pair +
        //     ' | ' +
        //     JSON.stringify([
        //       'cs_string=' + cs_str,
        //       'cs_calc=' + cs_calc,
        //       'server_checksum=' + checksum
        //     ]) +
        //     '\n'
        // )
        if (cs_calc !== checksum) {
          console.error('CHECKSUM_FAILED')
        }
        return
      }

      // console.log(
      //   '[' +
      //     moment().format('YYYY-MM-DDTHH:mm:ss.SSS') +
      //     '] ' +
      //     pair +
      //     ' | ' +
      //     JSON.stringify(msg) +
      //     '\n'
      // )

      if (BOOK.mcnt === 0) {
        _.each(msg[1], function(pp) {
          pp = { price: pp[0], cnt: pp[1], amount: pp[2] }
          const side = pp.amount >= 0 ? 'bids' : 'asks'
          pp.amount = Math.abs(pp.amount)
          if (BOOK[side][pp.price]) {
            console.log(
              '[' +
                moment().format() +
                '] ' +
                pair +
                ' | ' +
                JSON.stringify(pp) +
                ' BOOK snap existing bid override\n'
            )
          }
          BOOK[side][pp.price] = pp
        })
      } else {
        const cseq = +msg[2]
        msg = msg[1]

        if (!seq) {
          seq = cseq - 1
        }

        if (cseq - seq !== 1) {
          console.error('OUT OF SEQUENCE', seq, cseq)
        }

        seq = cseq

        let pp = { price: msg[0], cnt: msg[1], amount: msg[2] }

        if (!pp.cnt) {
          let found = true

          if (pp.amount > 0) {
            if (BOOK['bids'][pp.price]) {
              delete BOOK['bids'][pp.price]
            } else {
              found = false
            }
          } else if (pp.amount < 0) {
            if (BOOK['asks'][pp.price]) {
              delete BOOK['asks'][pp.price]
            } else {
              found = false
            }
          }

          if (!found) {
            console.log(
              '[' +
                moment().format() +
                '] ' +
                pair +
                ' | ' +
                JSON.stringify(pp) +
                ' BOOK delete fail side not found\n'
            )
          }
        } else {
          let side = pp.amount >= 0 ? 'bids' : 'asks'
          pp.amount = Math.abs(pp.amount)
          BOOK[side][pp.price] = pp
        }
      }

      _.each(['bids', 'asks'], function(side) {
        let sbook = BOOK[side]
        let bprices = Object.keys(sbook)

        let prices = bprices.sort(function(a, b) {
          if (side === 'bids') {
            return +a >= +b ? -1 : 1
          } else {
            return +a <= +b ? -1 : 1
          }
        })

        BOOK.psnap[side] = prices
      })

      BOOK.mcnt++
      // const now = moment.utc().format('YYYYMMDDHHmmss')
      // console.log('bids', now, { bids: BOOK.bids })
      // console.log('asks', now, { asks: BOOK.asks })

      checkCross(msg)
      return observer.next({ asks: BOOK.asks, bids: BOOK.bids })
    }
    websocket.onclose = msg => {
      seq = null
      console.log(msg)
      return msg.wasClean ? observer.complete() : null
    }
    websocket.onerror = error => {
      console.log('WebSocket error.')
      console.log(error)
      return observer.error(error)
    }
    return () => websocket.close(1000, 'Closed by client', { keepClosed: true })
  })
}

export const initRelayWebSocketBookEpic = action$ =>
  action$.pipe(
    ofType(customRelayAction(TYPE_.RELAY_OPEN_WEBSOCKET_BOOK)),
    mergeMap(action => {
      return reconnectingWebsocketBook$(
        action.payload.relay,
        action.payload.networkId,
        action.payload.baseToken,
        action.payload.quoteToken
      ).pipe(
        takeUntil(
          action$.ofType(customRelayAction(TYPE_.RELAY_CLOSE_WEBSOCKET))
        ),
        throttleTime(2000),
        map(payload => {
          console.log('*** Orderbook epic update ***')
          const calculateSpread = (asksOrders, bidsOrders) => {
            let spread = 0
            if (bidsOrders.length !== 0 && asksOrders.length !== 0) {
              spread = new BigNumber(
                asksOrders[asksOrders.length - 1].orderPrice
              )
                .minus(new BigNumber(bidsOrders[0].orderPrice))
                .toFixed(6)
            } else {
              spread = new BigNumber(0).toFixed(6)
            }
            return spread
          }
          let asks = Object.values(payload.asks)
            .map(element => {
              return {
                orderAmount: element.amount,
                orderPrice: element.price,
                orderCount: element.cnt
              }
            })
            .reverse()
          let bids = Object.values(payload.bids)
            .map(element => {
              return {
                orderAmount: element.amount,
                orderPrice: element.price,
                orderCount: element.cnt
              }
            })
            .reverse()
          const spread = calculateSpread(asks, bids)
          return { type: TYPE_.ORDERBOOK_INIT, payload: { asks, bids, spread } }
        }),
        catchError(() => {
          return Observable.of({
            type: TYPE_.QUEUE_ERROR_NOTIFICATION,
            payload: 'Error connecting to order book.'
          })
        })
      )
    })
  )

//
// CONNECTING TO WS AND GETTING UPDATES FOR A SPECIFIC TRADING PAIR
//
// THIS EPIC IS CALLED WHEN THE EXCHANGE IS INITALIZED
//

// const reconnectingWebsocketTicker$ = (
//   relay,
//   networkId,
//   baseToken,
//   quoteToken
// ) => {
//   return Observable.create(observer => {
//     const exchange = new Exchange(relay.name, networkId, 'ws')
//     const websocket = exchange.getTicker(
//       utils.getTockenSymbolForRelay(relay.name, baseToken),
//       utils.getTockenSymbolForRelay(relay.name, quoteToken)
//     )
//     websocket.onmessage = msg => {
//       // console.log('WebSocket message.');
//       // console.log(msg)
//       return observer.next(msg.data)
//     }
//     websocket.onclose = msg => {
//       // websocket.send(`unsub:ticker`);
//       console.log(msg)
//       return msg.wasClean ? observer.complete() : null
//     }
//     websocket.onerror = error => {
//       console.log(error)
//       console.log('WebSocket error.')
//       return observer.error(error)
//     }
//     return () => websocket.close(1000, 'Closed by client', { keepClosed: true })
//   })
// }

const reconnectingWebsocketTicker$ = (
  relay,
  networkId,
  baseToken,
  quoteToken
) => {
  return Observable.create(observer => {
    const ethfinex = exchangeConnector(relay.name, {
      networkId: networkId
    })
    const baseTokenSymbol = utils.getTockenSymbolForRelay(relay.name, baseToken)
    const quoteTokenSymbol = utils.getTockenSymbolForRelay(
      relay.name,
      quoteToken
    )
    return ethfinex.raw.ws
      .getTickers(
        { symbols: baseTokenSymbol + quoteTokenSymbol },
        (error, msg) => {
          if (error) {
            return observer.error(error)
          } else {
            if (Array.isArray(msg)) {
              return observer.next(msg)
            }
            return observer.next('')
          }
        }
      )
      .then(unsubscribe => {
        console.log(unsubscribe)
        return () => ethfinex.ws.close()
      })
  })
}

const updateCurrentTokenPrice = ticker => {
  // console.log(tickerOutput)
  // let ticker = JSON.parse(tickerOutput)
  // console.log(ticker)
  if (Array.isArray(ticker[1])) {
    let current = {
      price: ticker[1][6]
    }
    return {
      type: TYPE_.UPDATE_CURRENT_TOKEN_PRICE,
      payload: {
        current
      }
    }
  } else {
    return {
      type: TYPE_.UPDATE_CURRENT_TOKEN_PRICE,
      payload: {}
    }
  }
}

export const initRelayWebSocketTickerEpic = (action$, state$) =>
  action$.pipe(
    ofType(customRelayAction(TYPE_.RELAY_OPEN_WEBSOCKET_TICKER)),
    mergeMap(action => {
      return reconnectingWebsocketTicker$(
        action.payload.relay,
        action.payload.networkId,
        action.payload.baseToken,
        action.payload.quoteToken
      ).pipe(
        takeUntil(
          action$.ofType(customRelayAction(TYPE_.RELAY_CLOSE_WEBSOCKET))
        ),
        bufferTime(1000),
        filter(value => {
          // console.log(value)
          return value.length !== 0
        }),
        bufferCount(1),
        map(ticker => {
          // console.log(customRelayAction((RELAY_MSG_FROM_WEBSOCKET)))
          const currentState = state$.value
          const lastItem = ticker[0].pop()
          // console.log(currentState)
          // return [ lastItem, currentState ]
          return updateCurrentTokenPrice(
            lastItem,
            currentState.exchange.selectedTokensPair.baseToken
          )
        }),
        catchError(() => {
          return Observable.of({
            type: TYPE_.QUEUE_ERROR_NOTIFICATION,
            payload: 'Error connecting to price ticker.'
          })
        })
      )
    })
  )

//
// FETCHING THE ORDER BOOK AND UPDATING THE CURRENT PRICE FOR A SPECIFIC TRADING PAIR
//

// export const orderBookEpic = (action$, state$) => {
//   return action$
//     .ofType(customRelayAction(TYPE_.RELAY_MSG_FROM_WEBSOCKET))
//     .map(action => action.payload)
//     .bufferTime(1000)
//     .filter(value => {
//       // console.log(value)
//       return value.length !== 0
//     })
//     .bufferCount(1)
//     .map(ticker => {
//       // console.log(customRelayAction((RELAY_MSG_FROM_WEBSOCKET)))
//       const currentState = state$.value
//       const lastItem = ticker[0].pop()
//       console.log(currentState)
//       // return [ lastItem, currentState ]
//       return {
//         item: lastItem,
//         state: currentState
//       }
//     })
//     .do(val => {
//       // console.log(val)
//       return val
//     })
//     .switchMap(ticker =>
//       Observable.of(
//         // {
//         //   type: RELAY_GET_ORDERS,
//         //   payload: {
//         //     relay: ticker.state.exchange.selectedRelay,
//         //     networkId: ticker.state.endpoint.networkInfo.id,
//         //     baseToken: ticker.state.exchange.selectedTokensPair.baseToken,
//         //     quoteToken: ticker.state.exchange.selectedTokensPair.quoteToken,
//         //     aggregated: ticker.state.exchange.orderBookAggregated
//         //   }
//         // },
//         updateCurrentTokenPrice(
//           ticker.item,
//           ticker.state.exchange.selectedTokensPair.baseToken
//         )
//       )
//     )
// }

//
// FETCH OPEN ORDERS
//

const getAccountOrdersFromRelay$ = (
  relay,
  networkId,
  account,
  baseToken,
  quoteToken
) => {
  const exchange = new Exchange(relay.name, networkId)
  console.log('getAccountOrdersFromRelay$')
  return zip(
    from(exchange.getAccountOrders(account, baseToken, quoteToken)),
    from(exchange.getAccountHistory(account, baseToken, quoteToken))
  )
  // return from(exchange.getAccountOrdersStart(account, baseToken, quoteToken))
}

export const getAccountOrdersEpic = action$ => {
  return action$.pipe(
    ofType(customRelayAction(TYPE_.FETCH_ACCOUNT_ORDERS_START)),
    mergeMap(action => {
      // console.log(customRelayAction(TYPE_.FETCH_ACCOUNT_ORDERS_START))
      return timer(0, 5000).pipe(
        takeUntil(
          action$.ofType(customRelayAction(TYPE_.FETCH_ACCOUNT_ORDERS_STOP))
        ),
        exhaustMap(() =>
          getAccountOrdersFromRelay$(
            action.payload.relay,
            action.payload.networkId,
            action.payload.account,
            action.payload.quoteToken,
            action.payload.baseToken
          ).pipe(
            map(orders => {
              return {
                type: TYPE_.UPDATE_FUND_ORDERS,
                payload: {
                  open: orders[0],
                  history: orders[1]
                }
              }
            }),
            catchError(() => {
              return Observable.concat(
                Observable.of({
                  type: TYPE_.QUEUE_ERROR_NOTIFICATION,
                  payload: 'Error fetching account orders.'
                }),
                Observable.of(
                  Actions.exchange.updateAccountSignature({ valid: false })
                )
              )
            })
          )
        )
      )
    })
  )
}
