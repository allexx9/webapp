// Copyright 2016-2017 Rigo Investment Sagl.

import { UPDATE_INTERFACE } from '../actions/const'
import initialState from './initialState'

function endpointsReducer(state = initialState.endpoint, action) {
  switch (action.type) {
    case UPDATE_INTERFACE:
      return {
        ...state,
        ...action.payload
      }

    default:
      return state
  }
}

export default endpointsReducer
