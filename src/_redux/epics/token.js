// Copyright 2016-2017 Rigo Investment Sagl.

import { Observable } from 'rxjs/Observable'
import 'rxjs/add/operator/delay';
import 'rxjs/add/operator/mapTo';
import 'rxjs/add/operator/bufferTime';
import 'rxjs/add/operator/map';
import 'rxjs/add/operator/do';
import 'rxjs/add/operator/concat';
import 'rxjs/add/operator/mergeMap';
import 'rxjs/add/operator/exhaustMap';
import 'rxjs/add/observable/timer'

import {
  setTokenAllowance,
} from '../../_utils/exchange'
import 'rxjs/observable/timer'
// import { fromPromise } from 'rxjs/add/observable/fromPromise';
import {
  SET_TOKEN_ALLOWANCE,
  UPDATE_TRADE_TOKENS_PAIR,
  TOKEN_PRICE_TICKERS_FETCH_START,
  TOKEN_PRICE_TICKERS_FETCH_STOP,
  TOKENS_TICKERS_UPDATE
} from '../actions/const'
import Exchange from '../../_utils/exchange/src/index'

// import ReconnectingWebSocket from 'reconnecting-websocket/dist/reconnecting-websocket-cjs'

// Setting allowance for a token
const setTokenAllowance$ = (tokenAddress, ownerAddress, spenderAddress, ZeroExConfig) =>
  Observable.fromPromise(setTokenAllowance(tokenAddress, ownerAddress, spenderAddress, ZeroExConfig))


export const setTokenAllowanceEpic = action$ => {
  return action$.ofType(SET_TOKEN_ALLOWANCE)
    .mergeMap((action) => {
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

//       // Using !== to check if this.account is '' or null
//       if (accounts[0] !== this.account) {
//         this.account = accounts[0]
//         return blockChainActions.blockChainLogIn(this.account)
//       }
//     })
//     .filter(action => !!action)
// }

// const getPricesERCdEXWebsocket$ = () => {
//   // console.log(new ReconnectingWebSocket())
//   return Observable.create(observer => {
//     var websocket = new ReconnectingWebSocket('wss://api.ercdex.com')
//     websocket.addEventListener('open', (msg) => {
//       console.log('WebSocket open.')
//       // console.log(msg)
//       websocket.send(`sub:ticker`);
//     });
//     websocket.onmessage = (msg) => {
//       console.log('WebSocket message.');
//       console.log(msg)
//       const data = JSON.parse(msg.data)
//       return observer.next(data.data.tickers);
//     }
//     // websocket.addEventListener('close', () => {
//     //   websocket._shouldReconnect && websocket._connect();
//     //   console.log('WebSocket reconnecting.');
//     // })
//     websocket.onclose = (msg) => {
//       // websocket.send(`unsub:ticker`);
//       console.log('WebSocket closed.');
//       // console.log(msg)

//       // return msg.wasClean ? observer.complete() : null
//       return observer.error(msg)
//     };
//     websocket.onerror = (error) => {
//       console.log('WebSocket error.');
//       // console.log(error)
//       return observer.error(error)
//     };
//     return () => websocket.close();
//   })
// }

const getTickers$ = () => {
  const exchange = new Exchange('Ethfinex', '1')
  // console.log(exchange2.getTickers())
  // const exchange = new Exchange('ERCdEX', '1')
  return Observable
    .fromPromise(exchange.getTickers())
    .catch((error) => {
      console.log(error)
      return Observable.of(Array(0))
    })
}

export const getPricesERCdEXEpic = (action$) =>
  action$.ofType(TOKEN_PRICE_TICKERS_FETCH_START)
    .switchMap(() => {
      return Observable
        .timer(0, 5000)
        .takeUntil(
          action$.ofType(TOKEN_PRICE_TICKERS_FETCH_STOP)
        )
        .exhaustMap(() =>
        getTickers$()
            .map(message => {
              try {
                const arrayToObject = (arr, keyField) =>
                  Object.assign({}, ...arr.map(item => ({ [item[keyField]]: item })))
                const tokenList = arrayToObject(message, 'symbol')
                return tokenList
              } catch (err) {
                return {}
              }

            })
            .map(payload => ({ type: TOKENS_TICKERS_UPDATE, payload }))
            // .catch(error => Observable.of(getDataFailureAction(error)))
        )
    });