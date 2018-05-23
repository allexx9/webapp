// Copyright 2016-2017 Rigo Investment Sarl.
import { Observable } from 'rxjs/Observable'
import 'rxjs/add/operator/delay';
import 'rxjs/add/operator/mapTo';
import 'rxjs/add/operator/bufferTime';
import 'rxjs/add/operator/map';
import 'rxjs/add/operator/do';
import 'rxjs/add/operator/concat';
import 'rxjs/add/operator/mergeMap';
import { 
  setTokenAllowance,
  getPricesFromRelayERCDex 
} from '../../_utils/exchange'
import 'rxjs/observable/timer'
import { fromPromise } from 'rxjs/add/observable/fromPromise';
import {
  SET_TOKEN_ALLOWANCE,
  UPDATE_TRADE_TOKENS_PAIR,
  GET_PRICES_BITFINEX,
  TOKEN_PRICE_TICKER_OPEN_WEBSOCKET,
  TOKEN_PRICE_TICKER_CLOSE_WEBSOCKET,
  TOKEN_PRICE_TICKER_UPDATE
} from '../../_utils/const'
import ReconnectingWebSocket from 'reconnecting-websocket/dist/reconnecting-websocket-cjs'

// Setting allowance for a token
const setTokenAllowance$ = (tokenAddress, ownerAddress, spenderAddress, ZeroExConfig) =>
  Observable.fromPromise(setTokenAllowance(tokenAddress, ownerAddress, spenderAddress, ZeroExConfig))


export const setTokenAllowanceEpic = action$ => {
  return action$.ofType(SET_TOKEN_ALLOWANCE)
    .mergeMap((action) => {
      console.log(action)
      return setTokenAllowance$(
        action.payload.tokenAddress,
        action.payload.ownerAddress,
        action.payload.spenderAddress,
        action.payload.ZeroExConfig
      )
        .map(() => {
          return { type: UPDATE_TRADE_TOKENS_PAIR, payload: { baseTokenAllowance: true } }

        })
    });
}

// Getting token prices on Bitfinex

// const getTokenPricesBitfinex$ = () => {
//   return Observable.timer(0, 1000)
//     .exhaustMap(() =>
//       fromPromise(this.api.web3.getAvailableAddressesAsync(), this.scheduler)
//     )
//     .map(accounts => {
//       if (!accounts.length && this.account) {
//         this.account = null
//         return blockChainActions.blockChainLogout()
//       }

//       // Using != to check if this.account is '' or null
//       if (accounts[0] != this.account) {
//         this.account = accounts[0]
//         return blockChainActions.blockChainLogIn(this.account)
//       }
//     })
//     .filter(action => !!action)
// }

const getPricesERCdEXWebsocket$ = () => {
  // console.log(new ReconnectingWebSocket())
  return Observable.create(observer => {
    var websocket = new ReconnectingWebSocket('wss://api.ercdex.com')
    websocket.addEventListener('open', (msg) => {
      console.log('WebSocket open.')
      console.log(websocket.retryCount)
      websocket.send(`sub:ticker`);
    });
    websocket.onmessage = (msg) => {
      console.log(msg)
      const data = JSON.parse(msg.data)
      return observer.next(data.data.tickers);
    }
    websocket.onclose = (msg) => {
      // websocket.send(`unsub:ticker`);
      console.log('WebSocket closed.');
      return msg.wasClean ? observer.complete() : null
    };
    websocket.onerror = (error) => {
      console.log(error)
      console.log('WebSocket error.');
      return observer.error(error)
    };
    return () => websocket.close();
  })
}

const getPricesERCdEXREST$ = () => {
  return Observable.fromPromise(getPricesFromRelayERCDex())
}

export const getPricesERCdEXEpic = (action$) =>
  action$.ofType(TOKEN_PRICE_TICKER_OPEN_WEBSOCKET)
    .mergeMap((action) => {
      console.log(action)
      // return getPricesERCdEXWebsocket$()
        // .retryWhen((err) => {
        //   console.log('Retry when error');
        //   console.log(err)
        //   return window.navigator.onLine ? timer(1000) : Observable.fromEvent(window, 'online')
        // })
        return getPricesERCdEXREST$().concat(getPricesERCdEXWebsocket$())
        // .do({ error: (err) => console.log(err) })
        .takeUntil(
          action$.ofType(TOKEN_PRICE_TICKER_CLOSE_WEBSOCKET)
            .filter(closeAction => closeAction.ticker === action.ticker)
        )
        // .filter(message => {
        //   console.log(message)
        //   return message[1] !== 'hb' && Array.isArray(message)
        // })
        .bufferCount(1)
        .map(message => {
          const arrayToObject = (arr, keyField) =>
            Object.assign({}, ...arr.map(item => ({ [item[keyField]]: item })))
          const tokenList = arrayToObject(message[0], 'symbol')
          return tokenList
        })
        .map(payload => ({ type: TOKEN_PRICE_TICKER_UPDATE, payload }))
    });