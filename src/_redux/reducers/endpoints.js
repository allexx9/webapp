// Copyright 2016-2017 Rigo Investment Sagl.
import initialState from './initialState'
import {
  ATTACH_INTERFACE_PENDING,
  ATTACH_INTERFACE_FULFILLED,
  ATTACH_INTERFACE_REJECTED,
  UPDATE_INTERFACE
} from '../actions/const'

function endpointsReducer(state = initialState.endpoint, action) {
  let endpoint = {}
  switch (action.type) {

    case ATTACH_INTERFACE_PENDING:
      return state;

    case ATTACH_INTERFACE_FULFILLED:
      endpoint = { ...state.endpoint, ...{ ...action.payload }, isFulfilled: true }
      return {
        ...state, ...endpoint
      };

    case ATTACH_INTERFACE_REJECTED:
      return {
        isRejected: true,
        interface: action.payload
      };

    case UPDATE_INTERFACE:
      endpoint = { ...state.endpoint, ...{ ...action.payload } }
      return {
        ...state, ...endpoint
      };

    default: return state;
  }
}

export default endpointsReducer
