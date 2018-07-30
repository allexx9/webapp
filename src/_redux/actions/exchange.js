// Copyright 2016-2017 Rigo Investment Sagl.

import {
  UPDATE_SELECTED_RELAY,
} from './const'

const exchange = {
  updateSelectedRelayAction: (payload) => {
    return {
      type: UPDATE_SELECTED_RELAY,
      payload: payload
    }
  }
}

export default exchange;