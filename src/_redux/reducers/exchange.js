// Copyright 2016-2017 Rigo Investment Sagl.

import {
  CANCEL_SELECTED_ORDER,
  CHART_MARKET_DATA_ADD_DATAPOINT,
  CHART_MARKET_DATA_INIT,
  CHART_MARKET_DATA_UPDATE,
  ORDERBOOK_INIT,
  ORDERBOOK_UPDATE,
  SET_MAKER_ADDRESS,
  SET_ORDERBOOK_AGGREGATE_ORDERS,
  TOKENS_TICKERS_UPDATE,
  UPDATE_AVAILABLE_RELAYS,
  UPDATE_AVAILABLE_TRADE_TOKENS_PAIRS,
  UPDATE_CURRENT_TOKEN_PRICE,
  UPDATE_ELEMENT_LOADING,
  UPDATE_FUND_ORDERS,
  UPDATE_SELECTED_FUND,
  UPDATE_SELECTED_ORDER,
  UPDATE_SELECTED_RELAY,
  UPDATE_TRADE_TOKENS_PAIR
} from '../actions/const'
import BigNumber from 'bignumber.js'
import initialState from './initialState'

function exchangeReducer(state = initialState.exchange, action) {
  switch (action.type) {
    case UPDATE_FUND_ORDERS:
      return {
        ...state,
        fundOrders: { ...state.fundOrders, ...action.payload }
      }

    case CHART_MARKET_DATA_UPDATE:
      if (action.payload !== '') {
        return {
          ...state,
          chartData: action.payload
        }
      } else {
        return {
          ...state
        }
      }

    case CHART_MARKET_DATA_INIT:
      if (action.payload !== '') {
        return {
          ...state,
          chartData: action.payload
        }
      } else {
        return {
          ...state
        }
      }

    case CHART_MARKET_DATA_ADD_DATAPOINT:
      let newChartData = [...state.chartData]
      if (
        action.payload.epoch === newChartData[newChartData.length - 1].epoch
      ) {
        newChartData[newChartData.length - 1] = action.payload
        // console.log('first')
        return {
          ...state,
          chartData: newChartData
        }
      }
      if (
        action.payload.epoch === newChartData[newChartData.length - 2].epoch
      ) {
        // console.log('second')
        newChartData[newChartData.length - 2] = action.payload
        return {
          ...state,
          chartData: newChartData
        }
      }
      // console.log('***** NEW *****')
      newChartData.push(action.payload)
      return {
        ...state,
        chartData: newChartData
      }

    case UPDATE_ELEMENT_LOADING:
      const elementLoading = action.payload
      return {
        ...state,
        loading: { ...state.loading, ...elementLoading }
      }

    case UPDATE_SELECTED_FUND:
      return {
        ...state,
        selectedFund: { ...state.selectedFund, ...action.payload }
      }

    case UPDATE_SELECTED_RELAY:
      return {
        ...state,
        selectedRelay: { ...state.selectedRelay, ...action.payload }
      }

    case UPDATE_SELECTED_ORDER:
      let orderDetails = action.payload
      let selectedOrder = { ...state.selectedOrder, ...orderDetails }
      return {
        ...state,
        selectedOrder: selectedOrder
      }

    case UPDATE_TRADE_TOKENS_PAIR:
      return {
        ...state,
        selectedTokensPair: { ...state.selectedTokensPair, ...action.payload }
      }

    case UPDATE_AVAILABLE_TRADE_TOKENS_PAIRS:
      return {
        ...state,
        availableTradeTokensPairs: { ...action.payload }
      }

    case UPDATE_AVAILABLE_RELAYS:
      return {
        ...state,
        availableRelays: action.payload
      }

    case SET_MAKER_ADDRESS:
      return {
        ...state,
        makerAddress: action.payload
      }

    case CANCEL_SELECTED_ORDER:
      return {
        ...state,
        selectedOrder: initialState.exchange.selectedOrder
      }

    case SET_ORDERBOOK_AGGREGATE_ORDERS:
      return {
        ...state,
        orderBookAggregated: action.payload
      }

    case ORDERBOOK_INIT:
      const newOrderBook = { ...state.orderBook, ...action.payload }
      return {
        ...state,
        orderBook: newOrderBook
      }

    case ORDERBOOK_UPDATE:
      return { ...state, webSocket: { ...action.payload } }

    case TOKENS_TICKERS_UPDATE:
      let prices = {
        ...action.payload,
        previous: { ...state.prices }
      }
      return { ...state, prices }

    case UPDATE_CURRENT_TOKEN_PRICE:
      let ticker
      if (typeof action.payload.current !== 'undefined') {
        ticker = {
          current: action.payload.current,
          previous: { ...state.selectedTokensPair.ticker.current }
        }
        let currentPrice = new BigNumber(ticker.current.price)
        let previousPrice = new BigNumber(ticker.previous.price)
        if (!previousPrice.eq(0)) {
          ticker.variation = currentPrice
            .sub(previousPrice)
            .div(previousPrice)
            .times(100)
            .toFixed(4)
        } else {
          ticker.variation = 0
        }
      } else {
        ticker = {
          current: { ...state.selectedTokensPair.ticker.current },
          previous: { ...state.selectedTokensPair.ticker.current },
          variation: state.selectedTokensPair.ticker.variation
        }
      }
      return {
        ...state,
        selectedTokensPair: {
          ...state.selectedTokensPair,
          ticker: { ...ticker }
        }
      }

    default:
      return state
  }
}

export default exchangeReducer
