// Copyright 2016-2017 Rigo Investment Sagl.

import initialState from './initialState'
import {
  UPDATE_APP_STATUS
} from '../actions/const'

function appReducer(state = initialState.app, action) {

  switch (action.type) {
    case UPDATE_APP_STATUS:
    return {
      ...state, ...action.payload
    };
    default: return state;
  }
}

export default appReducer