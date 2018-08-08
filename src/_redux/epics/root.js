// Copyright 2016-2017 Rigo Investment Sagl.

import { combineEpics } from 'redux-observable';
import { 
  // relayWebSocketEpic, 
  getOrderBookFromRelayEpic,
  updateFundLiquidityEpic,
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
  ERCdEX.getCandlesDataEpic,
  ERCdEX.initRelayWebSocketEpic,
  ERCdEX.orderBookEpic,
  Ethfinex.getCandlesDataEpic,
  Ethfinex.initRelayWebSocketEpic,
  Ethfinex.orderBookEpic,
  setTokenAllowanceEpic,
  getOrderBookFromRelayEpic,
  getPricesERCdEXEpic,
  updateFundLiquidityEpic,
  // Ethfinex.candelsWebSocketEpic,
  getTradeHistoryLogsFromRelayERCdEXEpic,
  getOrdersFromRelayERCdEXEpic,
  getAssetsPricesDataFromERCdEXEpic
);