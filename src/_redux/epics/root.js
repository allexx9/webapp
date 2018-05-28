// Copyright 2016-2017 Rigo Investment Sarl.

import { combineEpics } from 'redux-observable';
// import pingEpic from './ping';
import { 
  relayWebSocketEpic, 
  orderBookEpic,
  initOrderBookFromRelayERCdEXEpic,
  updateFundLiquidityEpic,
  getHistoricalFromERCdEXEpic,
  getTradeHistoryLogsFromRelayERCdEXEpic,
  getOrdersFromRelayERCdEXEpic
} from './exchange'
import { setTokenAllowanceEpic,
  getPricesERCdEXEpic
} from './token'

export const rootEpic = combineEpics (
  // pingEpic,
  relayWebSocketEpic,
  orderBookEpic,
  setTokenAllowanceEpic,
  initOrderBookFromRelayERCdEXEpic,
  getPricesERCdEXEpic,
  updateFundLiquidityEpic,
  getHistoricalFromERCdEXEpic,
  getTradeHistoryLogsFromRelayERCdEXEpic,
  getOrdersFromRelayERCdEXEpic
);