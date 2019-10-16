// Copyright 2016-2017 Rigo Investment Sagl.

import * as Endpoint from './endpoint'
import * as Eventful from './eventful_epics'
import * as Pools from './pools'
import * as Tokens from './token_epics'
import { ERCdEX, Ethfinex } from './exchanges'
import { catchError } from 'rxjs/operators'
import { combineEpics } from 'redux-observable'
import {
  getLiquidityAndTokenBalancesEpic,
  getOrderBookFromRelayEpic,
  getTradeHistoryLogsFromRelayERCdEXEpic,
  resetLiquidityAndTokenBalancesEpic,
  updateLiquidityAndTokenBalancesEpic
} from './exchange_epics'

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
  Ethfinex.createOrderEthfinexV0Epic,
  Ethfinex.connectToRelayEpic
]

const Endpoint_Epics = [
  Endpoint.checkMetaMaskIsUnlockedEpic,
  Endpoint.monitorAccountsEpic,
  Endpoint.monitorEventfulEpic,
  Endpoint.connectedToNodeEpic,
  Endpoint.attachInterfaceEpic,
  Endpoint.delayShowAppEpic
]

const Eventful_Epics = [
  Eventful.getPoolsListEpic,
  Eventful.getAccountsTransactionsEpic,
  Eventful.getPoolTransactionsEpic
]

const Pools_Epics = [
  Pools.getPoolDetailsEpic,
  Pools.getTokensBalancesEpic,
  Pools.getPoolsGroupDetailsEpic
]

// https://github.com/redux-observable/redux-observable/issues/263#issuecomment-334625730

const combineAndIsolateEpics = (...epics) => (...args) => {
  const isolatedEpics = epics.map(epic => (...args) =>
    epic(...args).pipe(
      catchError((e, source) => {
        console.warn(
          `${epic.name} terminated with error: ${e}, restarting it...`
        )
        return source
      })
    )
  )
  return combineEpics(...isolatedEpics)(...args)
}

export const rootEpic = combineAndIsolateEpics(
  ...Endpoint_Epics,
  ...ERCdEX_Epics,
  ...Ethfinex_Epics,
  ...Tokens_Epics,
  ...Eventful_Epics,
  ...Pools_Epics,
  getOrderBookFromRelayEpic,
  getLiquidityAndTokenBalancesEpic,
  updateLiquidityAndTokenBalancesEpic,
  resetLiquidityAndTokenBalancesEpic,
  getTradeHistoryLogsFromRelayERCdEXEpic
)
