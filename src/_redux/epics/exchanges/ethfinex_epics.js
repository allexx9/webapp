// Copyright 2016-2017 Rigo Investment Sagl.

// import { Observable } from 'rxjs';
import { BigNumber } from '@0xproject/utils'
import { Observable, from, timer, zip } from 'rxjs'
import {
  bufferCount,
  bufferTime,
  catchError,
  exhaustMap,
  filter,
  map,
  mergeMap,
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

import * as ERRORS from '../../../_const/errors'
import * as TYPE_ from '../../actions/const'

import ExchangeConnectorWrapper from '../../../_utils/exchangeConnector'

const customRelayAction = action => {
  // console.log(`${Ethfinex.toUpperCase()}_${action}`)
  return `${Ethfinex.toUpperCase()}_${action}`
}

//
// FETCH HISTORICAL MARKET DATA FOR A SPECIFIC TRADING PAIR
//

const candlesSingleWebsocket$ = (relay, networkId, baseToken, quoteToken) => {
  return Observable.create(observer => {
    const baseTokenSymbol = utils.getTockenSymbolForRelay(relay.name, baseToken)
    const quoteTokenSymbol = utils.getTockenSymbolForRelay(
      relay.name,
      quoteToken
    )

    const ethfinex = ExchangeConnectorWrapper.getInstance().getExchange(
      relay.name,
      {
        networkId: networkId
      }
    )
    const unsubscribePromise = ethfinex.raw.ws.getCandles(
      {
        timeframe: '1m',
        symbols: baseTokenSymbol + quoteTokenSymbol
      },
      (err, msg) => (err ? observer.error(err) : observer.next(msg))
    )
    return async () => {
      const unsub = await unsubscribePromise
      return unsub()
    }
  })
}

const updateSingleCandles = tickerOutput => {
  let ticker = tickerOutput
  console.log(ticker)
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
    ofType(customRelayAction(TYPE_.FETCH_CANDLES_DATA_SINGLE_START)),
    mergeMap(action =>
      candlesSingleWebsocket$(
        action.payload.relay,
        action.payload.networkId,
        action.payload.baseToken,
        action.payload.quoteToken,
        action.payload.startDate
      ).pipe(
        takeUntil(
          action$.ofType(
            customRelayAction(TYPE_.FETCH_CANDLES_DATA_SINGLE_STOP)
          )
        ),
        filter(tick => {
          return tick[1] !== 'hb'
        }),
        filter(tick => {
          return (
            typeof tick[1] !== 'undefined' || typeof tick[0] !== 'undefined'
          )
        }),
        tap(tick => {
          return tick
        }),
        map(historical => {
          return updateSingleCandles(historical)
        }),
        catchError(error => {
          console.warn(error)
          return Observable.of({
            type: TYPE_.QUEUE_ERROR_NOTIFICATION,
            payload: error
          })
        })
      )
    )
  )

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
    let seq = null

    let pair =
      utils.getTockenSymbolForRelay(relay.name, baseToken) +
      utils.getTockenSymbolForRelay(relay.name, quoteToken)
    const ethfinex = ExchangeConnectorWrapper.getNewInstance().getExchange(
      relay.name,
      {
        networkId: networkId
      }
    )
    const BOOK = {
      bids: [],
      asks: [],
      psnap: [],
      mcnt: 0
    }
    const checkCross = () => {
      let bid = BOOK.psnap.bids[0]
      let ask = BOOK.psnap.asks[0]
      if (bid >= ask) {
        let lm = [moment.utc().format(), 'bid(' + bid + ')>=ask(' + ask + ')']
        console.log(lm.join('/') + '\n')
        console.log(lm.join('/'))
      }
    }
    let chanId = 0

    const interval = setInterval(() => {
      if (ethfinex.raw.wsStatus === 'closed') {
        ethfinex.raw.ws
          .getAggregatedOrders(
            {
              symbols: pair,
              precision: 'P2',
              frequency: 'F1',
              len: 25
            },
            (error, msgWs) => {
              if (error) {
                console.warn('WebSocket order book error.')
                return observer.error(error)
              }
              let msg = msgWs
              if (msg.event === 'subscribed' && msg.channel === 'book') {
                chanId = msg.chanId
              }

              if (!Array.isArray(msg)) {
                return
              }
              if (msg[0] !== chanId) {
                return
              }
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

                // erroronsole.log(
                // error '[' +
                // error   moment().format('YYYY-MM-DDTHH:mm:ss.SSS') +
                // error   '] ' +
                // error   pair +
                // error   ' | ' +
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
                  pp = {
                    price: pp[0],
                    cnt: pp[1],
                    amount: pp[2]
                  }
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

                let pp = {
                  price: msg[0],
                  cnt: msg[1],
                  amount: msg[2]
                }

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
              return observer.next({
                asks: BOOK.asks,
                bids: BOOK.bids
              })
            }
          )
          .catch(() => {
            observer.error(ERRORS.ERR_EXCHANGE_WS_ORDERBOOK_FETCH)
          })

        clearInterval(interval)
      }
    }, 1000)

    return () =>
      from(
        ethfinex.ws.close().then(() => {
          clearInterval(interval)
          return observer.complete()
        })
      )
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
          let asks = Object.values(payload.asks).map(element => {
            return {
              orderAmount: element.amount,
              orderPrice: element.price,
              orderCount: element.cnt
            }
          })
          asks.sort(function(a, b) {
            return b.orderPrice - a.orderPrice
          })
          let bids = Object.values(payload.bids).map(element => {
            return {
              orderAmount: element.amount,
              orderPrice: element.price,
              orderCount: element.cnt
            }
          })
          bids.sort(function(a, b) {
            return b.orderPrice - a.orderPrice
          })
          const spread = calculateSpread(asks, bids)
          return {
            type: TYPE_.ORDERBOOK_INIT,
            payload: {
              asks,
              bids,
              spread
            }
          }
        }),
        catchError(error => {
          console.warn(error)
          return Observable.of({
            type: TYPE_.QUEUE_ERROR_NOTIFICATION,
            payload: error
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

const websocketTicker$ = (relay, networkId, baseToken, quoteToken) => {
  return Observable.create(observer => {
    const ethfinex = ExchangeConnectorWrapper.getInstance().getExchange(
      relay.name,
      {
        networkId: networkId
      }
    )
    const baseTokenSymbol = utils.getTockenSymbolForRelay(relay.name, baseToken)
    const quoteTokenSymbol = utils.getTockenSymbolForRelay(
      relay.name,
      quoteToken
    )
    let chanId = 0

    const interval = setInterval(() => {
      if (
        ethfinex.raw.wsStatus === 'closed' ||
        ethfinex.raw.wsStatus === 'open'
      ) {
        ethfinex.raw.ws
          .getTickers(
            {
              symbols: [baseTokenSymbol + quoteTokenSymbol]
            },
            (error, msgWs) => {
              if (error) {
                return observer.error(error)
              } else {
                if (
                  msgWs.event === 'subscribed' &&
                  msgWs.channel === 'ticker'
                ) {
                  chanId = msgWs.chanId
                }
                if (msgWs[0] === chanId) {
                  if (Array.isArray(msgWs)) {
                    return observer.next(msgWs)
                  }
                }
                // return observer.next('')
              }
            }
          )
          .catch(() => {
            observer.error(ERRORS.ERR_EXCHANGE_WS_TICKER_FETCH)
          })

        clearInterval(interval)
      }
    }, 500)

    return () =>
      from(
        ethfinex.ws.close().then(() => {
          clearInterval(interval)
          return observer.complete()
        })
      )
  })
}

const updateCurrentTokenPrice = ticker => {
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
      return websocketTicker$(
        action.payload.relay,
        action.payload.networkId,
        action.payload.baseToken,
        action.payload.quoteToken
      ).pipe(
        tap(val => {
          return val
        }),
        takeUntil(
          action$.ofType(customRelayAction(TYPE_.RELAY_CLOSE_WEBSOCKET))
        ),
        bufferTime(1000),
        filter(value => {
          return value.length !== 0
        }),
        bufferCount(1),
        map(ticker => {
          const currentState = state$.value
          const lastItem = ticker[0].pop()
          return updateCurrentTokenPrice(
            lastItem,
            currentState.exchange.selectedTokensPair.baseToken
          )
        }),
        catchError(error => {
          console.warn(error)
          return Observable.of({
            type: TYPE_.QUEUE_ERROR_NOTIFICATION,
            payload: 'Error connecting to price ticker.'
          })
        })
      )
    })
  )

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
                  Actions.exchange.updateAccountSignature({
                    valid: false
                  })
                )
              )
            })
          )
        )
      )
    })
  )
}
