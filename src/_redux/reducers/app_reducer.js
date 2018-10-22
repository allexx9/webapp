// Copyright 2016-2017 Rigo Investment Sagl.

import * as TYPE_ from '../actions/const'
import initialState from './initialState'

function appReducer(state = initialState.app, action) {
  switch (action.type) {
    case TYPE_.UPDATE_APP_STATUS:
      return {
        ...state,
        ...action.payload
      }
    case TYPE_.UPDATE_APP_CONFIG:
      return {
        ...state,
        config: {
          ...state.config,
          ...action.payload
        }
      }
    default:
      return state
  }
}

export default appReducer
