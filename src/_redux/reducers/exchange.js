// Copyright 2016-2017 Rigo Investment Sarl.

import initialState from './initialState'
import {
  UPDATE_SELECTED_FUND,
  UPDATE_SELECTED_ORDER,
  UPDATE_TRADE_TOKENS_PAIR,
  CANCEL_SELECTED_ORDER
} from '../../_utils/const'

function transactionsReducer(state = initialState.exchange, action) {
  switch (action.type) {
    case UPDATE_SELECTED_FUND:
      var fundDetails = action.payload
      return {
        ...state,
        selectedFund: fundDetails
      };

    case UPDATE_SELECTED_ORDER:
      var orderDetails = action.payload
      var selectedOrder = { ...state.selectedOrder, ...orderDetails }
      return {
        ...state,
        selectedOrder: selectedOrder
      };

    case UPDATE_TRADE_TOKENS_PAIR:
      var tradeTokensPair = action.payload
      return {
        ...state,
        selectedTokensPair: tradeTokensPair
      };

      case CANCEL_SELECTED_ORDER:
      return {
        ...state,
        selectedOrder: initialState.exchange.selectedOrder
      };

    default: return state;
  }
}

export default transactionsReducer