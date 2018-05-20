// Copyright 2016-2017 Rigo Investment Sarl.

import { combineEpics } from 'redux-observable';
// import pingEpic from './ping';
import { 
  relayWebSocketEpic, 
  orderBookEpic,
  initOrderBookFromRelayERCDexEpic   
} from './exchange'
import { setTokenAllowanceEpic,
  getPricesERCdEXWebSocketEpic
} from './token'

export const rootEpic = combineEpics (
  // pingEpic,
  relayWebSocketEpic,
  orderBookEpic,
  setTokenAllowanceEpic,
  initOrderBookFromRelayERCDexEpic,
  getPricesERCdEXWebSocketEpic
);