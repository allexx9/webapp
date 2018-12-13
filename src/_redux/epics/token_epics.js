// Copyright 2016-2017 Rigo Investment Sagl.

import {
  FETCH_CANDLES_DATA_PORTFOLIO_START,
  FETCH_CANDLES_DATA_PORTFOLIO_STOP,
  QUEUE_ERROR_NOTIFICATION,
  SET_TOKEN_ALLOWANCE,
  TOKENS_TICKERS_UPDATE,
  TOKEN_PRICE_TICKERS_FETCH_START,
  TOKEN_PRICE_TICKERS_FETCH_STOP,
  UPDATE_SELECTED_DRAGO_DETAILS_CHART_ASSETS_MARKET_ADD_DATAPOINT,
  UPDATE_SELECTED_DRAGO_DETAILS_CHART_ASSETS_MARKET_DATA_INIT,
  UPDATE_TRADE_TOKENS_PAIR
} from '../actions/const'
import { Observable, from, merge, of, timer } from 'rxjs'
import {
  catchError,
  exhaustMap,
  filter,
  finalize,
  map,
  mergeMap,
  retryWhen,
  switchMap,
  takeUntil,
  tap
} from 'rxjs/operators'
import { ofType } from 'redux-observable'
import { setTokenAllowance } from '../../_utils/exchange'
import Exchange from '../../_utils/exchange/src/index'
import ExchangeConnectorWrapper from '../../_utils/exchangeConnector'
import moment from 'moment'
import utils from '../../_utils/utils'

// Setting allowance for a token
const setTokenAllowance$ = (
  tokenAddress,
  ownerAddress,
  spenderAddress,
  ZeroExConfig
) =>
  Observable.fromPromise(
    setTokenAllowance(tokenAddress, ownerAddress, spenderAddress, ZeroExConfig)
  )

export const setTokenAllowanceEpic = action$ => {
  return action$.ofType(SET_TOKEN_ALLOWANCE).mergeMap(action => {
    return setTokenAllowance$(
      action.payload.tokenAddress,
      action.payload.ownerAddress,
      action.payload.spenderAddress,
      action.payload.ZeroExConfig
    )
      .map(() => {
        return {
          type: UPDATE_TRADE_TOKENS_PAIR,
          payload: {
            baseTokenAllowance: true
          }
        }
      })
      .catch(err => {
        console.warn(err)
        return of(false)
      })
  })
}

//
// FETCH WS CANDLES DATA FOR A GROUP TRADING PAIRS
//
// PRICES ON THE FUNDS PAGE ARE FETCHED FROM ETHFINEX ONLY

const candlesGroupWebsocket$ = (relay, networkId, symbols) => {
  const timeframe = '15m'
  let subscribedSymbols = []
  const exchange = ExchangeConnectorWrapper.getInstance().getExchange(
    relay.name,
    {
      networkId: networkId
    }
  )
  const observables = symbols.map(symbols =>
    Observable.create(observer => {
      const unsubPromise = exchange.ws
        .getCandles({ timeframe, symbols }, (err, msg) => {
          if (err) {
            return observer.error(err)
          }
          if (msg.event === 'subscribed') {
            subscribedSymbols[msg.chanId] = msg.key.split(':t')[1].slice(0, -3)
          }
          if (Array.isArray(msg)) {
            return observer.next([subscribedSymbols[msg[0]], msg[1]])
          }
        })
        .catch(err => console.error(err))
      return async () => {
        const unsub = await unsubPromise
        if (unsub) {
          return unsub()
        }
      }
    })
  )
  return merge(...observables)
}

const updateGroupCandles = ticker => {
  const USDT = 'USDT'
  let symbol = ticker[0]
  const oneDayAgo = moment()
    .startOf('hour')
    .subtract(24, 'hours')
    .valueOf()
  const convertToETH = (symbol, value) => {
    return symbol === USDT ? 1 / value : value
  }
  // We need to express USD valuation in ETH
  if (symbol === 'ETH') {
    symbol = USDT
  }
  // console.log(symbol)
  // INITIAL SHAPSHOT
  if (Array.isArray(ticker[1][0])) {
    // console.log(`snapshot full ${symbol}:`, ticker[1])
    let candles = ticker[1]
      .filter(tick => {
        return tick[0] >= oneDayAgo
      })
      .map(tick => {
        let entry = {
          date: new Date(tick[0]),
          low: convertToETH(symbol, tick[4]),
          high: convertToETH(symbol, tick[3]),
          open: convertToETH(symbol, tick[1]),
          close: convertToETH(symbol, tick[2]),
          volume: convertToETH(symbol, tick[5]),
          epoch: tick[0]
        }
        // console.log(entry)
        return entry
      })
    const nowPrice = {
      ...candles[0],
      ...{ date: moment().toDate(), epoch: moment().valueOf() }
    }
    candles.unshift(nowPrice)
    const oneDayAgoPrice = {
      ...candles[candles.length - 1],
      ...{ date: moment(oneDayAgo).toDate(), epoch: oneDayAgo }
    }
    candles.push(oneDayAgoPrice)
    // console.log(`snapshot 24h ${symbol}:`, candles)
    return {
      type: UPDATE_SELECTED_DRAGO_DETAILS_CHART_ASSETS_MARKET_DATA_INIT,
      payload: {
        [symbol]: {
          data: candles.reverse()
        }
      }
    }
  }

  // UPDATE
  if (!Array.isArray[ticker[1][0]]) {
    // console.log(`${ticker[1][0]} -> ${date}`)
    // console.log(new Date(ticker[1][0]))
    // console.log('update:', ticker)
    let candles = {
      date: new Date(ticker[1][0]),
      low: convertToETH(symbol, ticker[1][4]),
      high: convertToETH(symbol, ticker[1][3]),
      open: convertToETH(symbol, ticker[1][1]),
      close: convertToETH(symbol, ticker[1][2]),
      volume: convertToETH(symbol, ticker[1][5]),
      epoch: ticker[1][0]
    }
    return {
      type: UPDATE_SELECTED_DRAGO_DETAILS_CHART_ASSETS_MARKET_ADD_DATAPOINT,
      payload: {
        [symbol]: {
          data: candles
        }
      }
    }
  }
}

export const getCandlesGroupDataEpic = (action$, state$) => {
  return action$.pipe(
    ofType(FETCH_CANDLES_DATA_PORTFOLIO_START),
    mergeMap(action => {
      return candlesGroupWebsocket$(
        action.payload.relay,
        action.payload.networkId,
        utils.ethfinexTickersToArray(
          state$.value.transactionsDrago.selectedDrago.assets
        ),
        action.payload.startDate
      ).pipe(
        filter(val => {
          return val[1] !== 'hb'
        }),
        filter(val => {
          return val[1].length !== 0
        }),
        map(historical => {
          return updateGroupCandles(historical)
        }),
        takeUntil(action$.ofType(FETCH_CANDLES_DATA_PORTFOLIO_STOP)),
        catchError(error => {
          console.warn(error)
          return Observable.of({
            type: QUEUE_ERROR_NOTIFICATION,
            payload: 'Error fetching candles data.'
          })
        })
      )
    })
  )
}

//
// FETCH REST TICKERS DATA FOR A GROUP TRADING PAIRS
//
// PRICES ON THE FUNDS PAGE ARE FETCHED FROM ETHFINEX ONLY

const getTickersWs$ = (relay, networkId, symbols) =>
  Observable.create(observer => {
    const ethfinex = ExchangeConnectorWrapper.getInstance().getExchange(
      relay.name,
      {
        networkId: networkId
      }
    )
    let subscribedSymbols = Array(0)
    let symbolsArray = symbols.split(',')
    if (symbolsArray.length) {
      const unsubPromise = ethfinex.raw.ws.getTickers(
        {
          symbols: symbolsArray
        },
        (err, msgWs) => {
          if (err) {
            return observer.error(err)
          }
          if (msgWs.event === 'subscribed') {
            subscribedSymbols[msgWs.chanId] = msgWs.symbol
              .split('t')[1]
              .slice(0, -3)
          }
          if (Array.isArray(msgWs)) {
            let tick = []
            if (msgWs[1] !== 'hb') {
              if (subscribedSymbols[msgWs[0]] === 'ETH') {
                tick = [
                  {
                    priceEth: 1 / msgWs[1][6],
                    priceUsd: '',
                    symbol: 'USDT'
                  }
                ]
              } else {
                tick = [
                  {
                    priceEth: msgWs[1][6],
                    priceUsd: '',
                    symbol: subscribedSymbols[msgWs[0]]
                  }
                ]
              }
              return observer.next(tick)
            }
          }
        }
      )
      return async () => {
        const unsub = await unsubPromise
        return unsub()
      }
    }
    return observer.complete()
  })

const getTickers$ = (relay, networkId, symbols, protocol = 'ws') => {
  if (relay.name === 'ERCdEX') {
    protocol = 'http'
  }
  if (protocol === 'ws') {
    return getTickersWs$(relay, networkId, symbols)
  }
  const exchange = new Exchange(relay.name, networkId, 'http')
  return timer(0, 3000).pipe(
    exhaustMap(() => {
      return from(exchange.getTickers(symbols))
    })
  )
}

export const getPricesEpic = (action$, state$) =>
  action$.pipe(
    ofType(TOKEN_PRICE_TICKERS_FETCH_START),
    switchMap(action => {
      console.log('DEBUG GET PRICES EPIC')
      const currentState = state$.value
      const symbols =
        Object.keys(action.payload.assetsList).length === 0
          ? utils
              .ethfinexTickersToArray(
                currentState.transactionsDrago.selectedDrago.assets
              )
              .toString()
          : utils.ethfinexTickersToArray(action.payload.assetsList).toString()

      return getTickers$(
        action.payload.relay,
        action.payload.networkId,
        symbols,
        'ws'
      ).pipe(
        tap(val => console.log('DEBUG GET TICKERS VALUE', val)),
        map(message => {
          try {
            const arrayToObject = (arr, keyField) =>
              Object.assign(
                {},
                ...arr.map(item => ({
                  [item[keyField]]: item
                }))
              )
            const tokenList = arrayToObject(message, 'symbol')
            tokenList.WETH = {
              priceEth: 1,
              priceUsd: '',
              symbol: 'WETH'
            }
            tokenList.ETHW = {
              priceEth: 1,
              priceUsd: '',
              symbol: 'ETHW'
            }
            return tokenList
          } catch (error) {
            console.warn(error)
            return {}
          }
        }),
        map(payload => ({
          type: TOKENS_TICKERS_UPDATE,
          payload
        })),
        takeUntil(action$.ofType(TOKEN_PRICE_TICKERS_FETCH_STOP)),
        retryWhen(error => {
          let scalingDuration = 5000
          return error.pipe(
            mergeMap(error => {
              console.warn(error)
              return timer(scalingDuration)
            }),
            finalize(() => console.log('We are done!'))
          )
        })
      )
    })
  )
