// Copyright 2016-2017 Rigo Investment Sarl.

import initialState from './initialState'
import {
  UPDATE_SELECTED_FUND,
  UPDATE_SELECTED_ORDER,
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
      return {
        ...state,
        selectedOrder: orderDetails
      };
    default: return state;
  }
}

export default transactionsReducer