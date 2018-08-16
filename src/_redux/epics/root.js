// Copyright 2016-2017 Rigo Investment Sagl.

import { combineEpics } from 'redux-observable';
import { 
  // relayWebSocketEpic, 
  getOrderBookFromRelayEpic,
  updateFundLiquidityEpic,
  getTradeHistoryLogsFromRelayERCdEXEpic,
  getAssetsPricesDataFromERCdEXEpic
} from './exchange'
import { setTokenAllowanceEpic,
  getPricesERCdEXEpic
} from './token'

import { Ethfinex, ERCdEX } from './exchanges'

import { getTokensBalancesEpic } from './drago'

const ERCdEX_Epics = [
  ERCdEX.getCandlesDataEpic,
  ERCdEX.initRelayWebSocketEpic,
  ERCdEX.orderBookEpic,
  ERCdEX.getAccountOrdersEpic,
]

const Ethfinex_Epics = [
  Ethfinex.getCandlesDataEpic,
  Ethfinex.initRelayWebSocketEpic,
  Ethfinex.orderBookEpic,
  Ethfinex.getAccountOrdersEpic,
]

export const rootEpic = combineEpics (
  // relayWebSocketEpic,
  getTokensBalancesEpic,
  ...ERCdEX_Epics,
  ...Ethfinex_Epics,
  setTokenAllowanceEpic,
  getOrderBookFromRelayEpic,
  getPricesERCdEXEpic,
  updateFundLiquidityEpic,
  // Ethfinex.candelsWebSocketEpic,
  getTradeHistoryLogsFromRelayERCdEXEpic,
  getAssetsPricesDataFromERCdEXEpic
);