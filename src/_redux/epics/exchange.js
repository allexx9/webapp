// Copyright 2016-2017 Rigo Investment Sarl.
import 'rxjs/add/operator/delay';
import 'rxjs/add/operator/mapTo';
import 'rxjs/add/operator/bufferTime';
import 'rxjs/add/operator/map';
import 'rxjs/add/operator/mergeMap';

import {
  NEW_ORDER_FROM_RELAY
} from '../../_utils/const'

const PING = 'NEW_ORDER';
var orders = Array()

function setMe(user) {
  return {
    type: 'PONG',
    paloard: user
  };
}

export const newOrderEpic = action$ => {
  console.log(action$)
  console.log(orders)
  return action$.ofType(NEW_ORDER_FROM_RELAY)
    .delay(1000)
    .map(_ => Math.floor(Math.random() * 100))
    .bufferTime(4000)
    .map(setMe)
}
