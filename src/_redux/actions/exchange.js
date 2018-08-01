// Copyright 2016-2017 Rigo Investment Sagl.

import {
  UPDATE_SELECTED_RELAY,
  UPDATE_AVAILABLE_TRADE_TOKENS_PAIRS
} from './const'

const exchange = {
  updateSelectedRelayAction: (payload) => {
    return {
      type: UPDATE_SELECTED_RELAY,
      payload: payload
    }
  },
  updateAvailableTradeTokensPairs: (payload) => {
    return {
      type: UPDATE_AVAILABLE_TRADE_TOKENS_PAIRS,
      payload: payload
    }
  }
}

export default exchange;