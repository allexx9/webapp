// Copyright 2016-2017 Rigo Investment Sagl.

import { combineEpics } from 'redux-observable';
// import pingEpic from './ping';
import { 
  relayWebSocketEpic, 
  orderBookEpic,
  initOrderBookFromRelayERCdEXEpic,
  updateFundLiquidityEpic,
  getHistoricalPricesDataFromERCdEXEpic,
  getTradeHistoryLogsFromRelayERCdEXEpic,
  getOrdersFromRelayERCdEXEpic,
  getAssetsPricesDataFromERCdEXEpic
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
  getHistoricalPricesDataFromERCdEXEpic,
  getTradeHistoryLogsFromRelayERCdEXEpic,
  getOrdersFromRelayERCdEXEpic,
  getAssetsPricesDataFromERCdEXEpic
);