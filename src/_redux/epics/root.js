// Copyright 2016-2017 Rigo Investment Sagl.

import { combineEpics } from 'redux-observable';
import { 
  // relayWebSocketEpic, 
  getOrderBookFromRelayEpic,
  updateFundLiquidityEpic,
  getTradeHistoryLogsFromRelayERCdEXEpic,
  // getAssetsPricesDataFromERCdEXEpic
} from './exchange'

import * as Tokens from './token'
import { Ethfinex, ERCdEX } from './exchanges'
import { getTokensBalancesEpic } from './drago'

const ERCdEX_Epics = [
  ERCdEX.getCandlesSingleDataEpic,
  ERCdEX.initRelayWebSocketEpic,
  ERCdEX.orderBookEpic,
  ERCdEX.getAccountOrdersEpic,
]

const Tokens_Epics = [
  Tokens.setTokenAllowanceEpic,
  Tokens.getPricesEpic,
  Tokens.getCandlesGroupDataEpic,
]

const Ethfinex_Epics = [
  Ethfinex.getCandlesSingleDataEpic,
  Ethfinex.initRelayWebSocketEpic,
  Ethfinex.orderBookEpic,
  Ethfinex.getAccountOrdersEpic,
]

export const rootEpic = combineEpics (
  // relayWebSocketEpic,
  ...ERCdEX_Epics,
  ...Ethfinex_Epics,
  ...Tokens_Epics,
  getTokensBalancesEpic,
  getOrderBookFromRelayEpic,
  updateFundLiquidityEpic,
  getTradeHistoryLogsFromRelayERCdEXEpic,
  // getAssetsPricesDataFromERCdEXEpic
);