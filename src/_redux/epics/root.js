// Copyright 2016-2017 Rigo Investment Sagl.

import { combineEpics } from 'redux-observable';
import { 
  // relayWebSocketEpic, 
  getOrderBookFromRelayEpic,
  updateFundLiquidityEpic,
  getHistoricalPricesDataFromERCdEXEpic,
  getTradeHistoryLogsFromRelayERCdEXEpic,
  getOrdersFromRelayERCdEXEpic,
  getAssetsPricesDataFromERCdEXEpic
} from './exchange'
import { setTokenAllowanceEpic,
  getPricesERCdEXEpic
} from './token'

import { Ethfinex, ERCdEX } from './exchanges'

export const rootEpic = combineEpics (
  // relayWebSocketEpic,
  ERCdEX.initRelayWebSocketEpic,
  ERCdEX.orderBookEpic,
  setTokenAllowanceEpic,
  getOrderBookFromRelayEpic,
  getPricesERCdEXEpic,
  updateFundLiquidityEpic,
  getHistoricalPricesDataFromERCdEXEpic,
  getTradeHistoryLogsFromRelayERCdEXEpic,
  getOrdersFromRelayERCdEXEpic,
  getAssetsPricesDataFromERCdEXEpic
);