// Copyright 2016-2017 Rigo Investment Sarl.

// import { Observable } from 'rxjs';
import { Observable } from 'rxjs/Observable'
import 'rxjs/add/observable/dom/webSocket';
import 'rxjs/add/operator/delay';
import 'rxjs/add/operator/mapTo';
import 'rxjs/add/operator/bufferTime';
import 'rxjs/add/operator/bufferCount';
import 'rxjs/add/operator/map';
import 'rxjs/add/operator/switchMap';
import 'rxjs/add/operator/mergeMap';
import 'rxjs/add/operator/takeUntil';
import 'rxjs/add/operator/retryWhen';
import 'rxjs/add/operator/filter';
import 'rxjs/observable/timer';
import 'rxjs/observable/fromEvent';
import 'rxjs/add/observable/fromPromise';
import { timer } from 'rxjs/observable/timer'
import rp from 'request-promise'
import { getOrderBookFromRelayERCDex } from '../../_utils/exchange'
// import ReconnectingWebSocket from 'reconnectingwebsocket'

import {
  ORDERBOOK_UPDATE,
  RELAY_OPEN_WEBSOCKET,
  RELAY_MSG_FROM_WEBSOCKET,
  RELAY_CLOSE_WEBSOCKET,
  RELAY_INIT_ORDERS,
  ORDERBOOK_INIT

} from '../../_utils/const'


//
// GETTING ORDERS FROM RELAY ERCDex
//

// Creating an observable from the promise
const getOrderBookFromRelayERCDex$ = (uri, baseTokenAddress, quoteTokenAddress) =>
  Observable.fromPromise(getOrderBookFromRelayERCDex(uri, baseTokenAddress, quoteTokenAddress));

// Setting the epic
export const initOrderBookFromRelayERCDexEpic = (action$, store) =>
  action$.ofType(RELAY_INIT_ORDERS)
    .mergeMap((action) => {
      console.log(action)
      console.log('initOrderBookFromRelayERCDexEpic');
      const state = store.getState()
      const baseTokenAddress = state.exchange.selectedTokensPair.baseToken.address
      const quoteTokenAddress = state.exchange.selectedTokensPair.quoteToken.address
      const uri = `${state.exchange.relay.url}/${state.exchange.relay.networkID}/v0/orderbook`
      return getOrderBookFromRelayERCDex$(
        uri, 
        baseTokenAddress, 
        quoteTokenAddress
      )
        .map(payload => ({ type: ORDERBOOK_INIT, payload }))
    });

//
// GETTING UPDATES FROM RELAY ERCDex
//

function updateOrderBook(orders) {
  console.log(orders)
  return {
    type: ORDERBOOK_UPDATE,
    payload: orders
  };
}

export const webSocketReducer = (state = 0, action) => {
  switch (action.type) {
    case RELAY_OPEN_WEBSOCKET:
      console.log(RELAY_OPEN_WEBSOCKET);
      return {};
    case ORDERBOOK_UPDATE:
      console.log(action.payload)
      console.log(ORDERBOOK_UPDATE);
      return {};
    case RELAY_CLOSE_WEBSOCKET:
      console.log(RELAY_CLOSE_WEBSOCKET);
      return {};
    case RELAY_MSG_FROM_WEBSOCKET:
      console.log(RELAY_MSG_FROM_WEBSOCKET);
      return {};
    case 'RELAY_UPDATE_ORDERS':
      console.log(action)
      console.log('RELAY_UPDATE_ORDERS');
      return {};
    default:
      return state;
  }
};


// https://github.com/ReactiveX/rxjs/issues/2048


const websocketStream$ = Observable.create(observer => {
  const websocket = new WebSocket('wss://api.ercdex.com');
  console.log('websocketStream$')
  // websocket.on('open', () => {
  //   console.info('connection opened');
  //   websocket.send(`sub:ticker`);
  // });
  websocket.onopen = (msg) => {
    console.log(msg)
    console.log('websocket open')
    websocket.send(`sub:ticker`);
    return observer.next(msg.data);
  }
  websocket.onmessage = (msg) => {
    console.log(msg)
    return observer.next(msg.data);
  }
  websocket.onclose = (msg) => {
    console.log(msg)
    return observer.error(msg);
  }
  websocket.onerror = function (error) {
    console.log('WebSocket Error ' + error);
    return observer.error(error)
  };

  console.log(websocket)
  return () => websocket.close();
});

// const socket$ = Observable.webSocket('wss://api.ercdex.com');

export const relayWebSocketEpic = (action$) =>
  action$.ofType(RELAY_OPEN_WEBSOCKET)
    .mergeMap((action) => {
      console.log('in epic mergeMap');
      console.log(action)

      // We are doing this so the data passed are not enclosed in ""
      // const webSocket$ = socket$
      // webSocket$._config.serializer = function (value) { return value; }

      // return webSocket$.multiplex(
      //   () => {
      //     console.log('sub');
      //     return action.payload.sub
      //   },
      //   () => {
      //     console.log('unsub');
      //     return { unsub: '' }
      //   },
      //   msg => msg
      // )
      return websocketStream$
        .retryWhen((err) => {
          console.log('retry when err ');
          console.log(err)
          return window.navigator.onLine ? timer(1000) : Observable.fromEvent(window, 'online')
        })
        .takeUntil(
          action$.ofType('CLOSE_TICKER_STREAM')
            .filter(closeAction => closeAction.ticker === action.ticker)
        )
        .map(payload => ({ type: RELAY_MSG_FROM_WEBSOCKET, payload }))
    });


export const orderBookEpic = action$ => {
  return action$.ofType(RELAY_MSG_FROM_WEBSOCKET)
    .map(action => action.payload)
    .bufferTime(2000)
    .filter(value => {
      value.lenght !==0
    })
    .bufferCount(1)
    .map(updateOrderBook)
    // .map(payload => ({ type: RELAY_INIT_ORDERS }))
}



