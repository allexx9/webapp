// Copyright 2016-2017 Rigo Investment Sagl.

import { combineEpics } from 'redux-observable'
import {
  // relayWebSocketEpic,
  getLiquidityAndTokenBalancesEpic,
  getOrderBookFromRelayEpic,
  getTradeHistoryLogsFromRelayERCdEXEpic,
  resetLiquidityAndTokenBalancesEpic,
  updateFundLiquidityEpic,
  updateLiquidityAndTokenBalancesEpic
  // getAssetsPricesDataFromERCdEXEpic
} from './exchange_epics'

import * as Drago from './drago_epics'
import * as Endpoint from './endpoint'
import * as Eventful from './eventful_epics'
import * as Tokens from './token_epics'
import { ERCdEX, Ethfinex } from './exchanges'

const ERCdEX_Epics = [
  ERCdEX.getCandlesSingleDataEpic,
  ERCdEX.initRelayWebSocketTickerEpic,
  ERCdEX.orderBookEpic,
  ERCdEX.getAccountOrdersEpic
]

const Tokens_Epics = [
  Tokens.setTokenAllowanceEpic,
  Tokens.getPricesEpic,
  Tokens.getCandlesGroupDataEpic
]

const Ethfinex_Epics = [
  Ethfinex.getCandlesSingleDataEpic,
  Ethfinex.initRelayWebSocketTickerEpic,
  Ethfinex.initRelayWebSocketBookEpic,
  Ethfinex.getAccountOrdersEpic,
  Ethfinex.monitorExchangeEventsEpic,
  Ethfinex.createOrderEthfinexV0Epic
]

const Endpoint_Epics = [
  Endpoint.checkMetaMaskIsUnlockedEpic,
  Endpoint.monitorAccountsEpic,
  Endpoint.monitorEventfulEpic,
  // Endpoint.connectedToNodeEpic,
  Endpoint.attacheInterfaceEpic,
  Endpoint.delayShowAppEpic
]

const Eventful_Epics = [
  Eventful.getPoolsListEpic,
  Eventful.getAccountsTransactionsEpic,
  Eventful.getPoolTransactionsEpic
]

const Drago_Epics = [Drago.getPoolDetailsEpic, Drago.getTokensBalancesEpic]

export const rootEpic = combineEpics(
  ...Endpoint_Epics,
  ...ERCdEX_Epics,
  ...Ethfinex_Epics,
  ...Tokens_Epics,
  ...Eventful_Epics,
  ...Drago_Epics,
  getOrderBookFromRelayEpic,
  getLiquidityAndTokenBalancesEpic,
  updateLiquidityAndTokenBalancesEpic,
  updateFundLiquidityEpic,
  resetLiquidityAndTokenBalancesEpic,
  getTradeHistoryLogsFromRelayERCdEXEpic
  // getAssetsPricesDataFromERCdEXEpic
)
