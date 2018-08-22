// Copyright 2016-2017 Rigo Investment Sagl.

import initialState from './initialState'
import {
  UPDATE_INTERFACE
} from '../actions/const'

function endpointsReducer(state = initialState.endpoint, action) {
  let endpoint = {}
  switch (action.type) {

    case UPDATE_INTERFACE:
      endpoint = { ...state.endpoint, ...{ ...action.payload } }
      return {
        ...state, ...endpoint
      };

    default: return state;
  }
}

export default endpointsReducer
