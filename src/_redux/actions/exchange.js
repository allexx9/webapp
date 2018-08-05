// Copyright 2016-2017 Rigo Investment Sagl.

import * as TYPE_ from './const'

const exchange = {
  getChartData: (selectedRelay, networkId, baseToken, quoteToken, startDate) => {
    const payload = {
      selectedRelay,
      networkId,
      baseToken,
      quoteToken,
      startDate
    }
    return {
      type: TYPE_.FETCH_MARKET_PRICE_DATA,
      payload: payload
    }
  },
  getTradeHistoryLogs: (networkId, baseTokenAddress, quoteTokenAddress) => {
    const payload = {
      networkId,
      baseTokenAddress,
      quoteTokenAddress,
    }
    return {
      type: TYPE_.FETCH_HISTORY_TRANSACTION_LOGS,
      payload: payload
    }
  },
  relayGetOrders: (payload) => {
    return {
      type: TYPE_.RELAY_GET_ORDERS,
      payload: payload
    }
  },
  setAggregateOrders: (isInputChecked) => {
    return {
      type: TYPE_.SET_ORDERBOOK_AGGREGATE_ORDERS,
      payload: isInputChecked
    }
  },
  updateSelectedRelayAction: (payload) => {
    return {
      type: TYPE_.UPDATE_SELECTED_RELAY,
      payload: payload
    }
  },
  updateSelectedTradeTokensPair: (tradeTokensPair) => {
    return {
      type: TYPE_.UPDATE_TRADE_TOKENS_PAIR,
      payload: tradeTokensPair
    }
  },
  updateAvailableTradeTokensPairs: (payload) => {
    return {
      type: TYPE_.UPDATE_AVAILABLE_TRADE_TOKENS_PAIRS,
      payload: payload
    }
  }
}

export default exchange;