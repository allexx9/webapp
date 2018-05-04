// Copyright 2016-2017 Rigo Investment Sarl.
import 'rxjs/add/operator/delay';
import 'rxjs/add/operator/mapTo';
import 'rxjs/add/operator/bufferTime';
import 'rxjs/add/operator/map';
import 'rxjs/add/operator/mergeMap';

import {
  ORDER_UPDATE_FROM_RELAY
} from '../../_utils/const'

const PING = 'NEW_ORDER';
var orders = Array()

function processOrderBook(orders) {
  return {
    type: 'UPDATE_ORDER_BOOK',
    paloard: orders
  };
}

export const orderUpdateFromRelayEpic = action$ => {
  return action$.ofType(ORDER_UPDATE_FROM_RELAY)
    .map(action => action.payload)
    .bufferTime(4000)
    .map(processOrderBook)
}
