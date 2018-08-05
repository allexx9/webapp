// Copyright 2016-2017 Rigo Investment Sagl.

import initialState from './initialState'
import BigNumber from 'bignumber.js';
import {
  UPDATE_SELECTED_FUND,
  UPDATE_SELECTED_ORDER,
  UPDATE_TRADE_TOKENS_PAIR,
  CANCEL_SELECTED_ORDER,
  ORDERBOOK_UPDATE,
  ORDERBOOK_INIT,
  SET_ORDERBOOK_AGGREGATE_ORDERS,
  SET_MAKER_ADDRESS,
  TOKENS_TICKERS_UPDATE,
  UPDATE_ELEMENT_LOADING,
  UPDATE_MARKET_DATA,
  UPDATE_FUND_ORDERS,
  UPDATE_SELECTED_RELAY,
  UPDATE_AVAILABLE_TRADE_TOKENS_PAIRS,
  UPDATE_CURRENT_TOKEN_PRICE
} from '../actions/const'



function exchangeReducer(state = initialState.exchange, action) {
  switch (action.type) {

    case UPDATE_FUND_ORDERS:
      return {
        ...state,
        fundOrders: { ...state.fundOrders, ...action.payload }
      };

    case UPDATE_MARKET_DATA:
      return {
        ...state,
        chartData: action.payload
      };

    case UPDATE_ELEMENT_LOADING:
      const elementLoading = action.payload
      return {
        ...state,
        loading: { ...state.loading, ...elementLoading }
      };

    case UPDATE_SELECTED_FUND:
      return {
        ...state,
        selectedFund: { ...state.selectedFund, ...action.payload }
      };

    case UPDATE_SELECTED_RELAY:
      return {
        ...state,
        selectedRelay: { ...state.selectedRelay, ...action.payload }
      };

    case UPDATE_SELECTED_ORDER:
      var orderDetails = action.payload
      var selectedOrder = { ...state.selectedOrder, ...orderDetails }
      return {
        ...state,
        selectedOrder: selectedOrder
      };

    case UPDATE_TRADE_TOKENS_PAIR:
      return {
        ...state,
        selectedTokensPair: { ...state.selectedTokensPair, ...action.payload }
      };

    case UPDATE_AVAILABLE_TRADE_TOKENS_PAIRS:
      return {
        ...state,
        availableTradeTokensPairs: { ...action.payload }
      };

    case SET_MAKER_ADDRESS:
      return {
        ...state,
        makerAddress: action.payload
      };


    case CANCEL_SELECTED_ORDER:
      return {
        ...state,
        selectedOrder: initialState.exchange.selectedOrder
      };

    case SET_ORDERBOOK_AGGREGATE_ORDERS:
      console.log(action.payload)
      return {
        ...state,
        orderBookAggregated: action.payload
      };

    case ORDERBOOK_INIT:
      const newOrderBook = { ...state.orderBook, ...action.payload }
      return {
        ...state,
        orderBook: newOrderBook
      }

    case ORDERBOOK_UPDATE:
      return { ...state, webSocket: { ...action.payload } }

    case TOKENS_TICKERS_UPDATE:
      var prices = {
        ...action.payload,
        previous: { ...state.prices }
      }
      return { ...state, prices }

    case UPDATE_CURRENT_TOKEN_PRICE:
      var ticker
      if (typeof action.payload.current !== 'undefined') {
        var ticker = {
          current: action.payload.current,
          previous: { ...state.selectedTokensPair.ticker.current }
        }
        var currentPrice = new BigNumber(ticker.current.price)
        var previousPrice = new BigNumber(ticker.previous.price)
        if (!previousPrice.eq(0)) {
          ticker.variation = currentPrice.sub(previousPrice).div(previousPrice).mul(100).toFixed(4)
        } else {
          ticker.variation = 0

        }
      }
      else {
        var ticker = {
          current: { ...state.selectedTokensPair.ticker.current },
          previous: { ...state.selectedTokensPair.ticker.current },
          variation: state.selectedTokensPair.ticker.variation 
        }
      }
      return {
        ...state,
        selectedTokensPair: { ...state.selectedTokensPair, ticker: {...ticker} }
      };

    default: return state;
  }



}

export default exchangeReducer