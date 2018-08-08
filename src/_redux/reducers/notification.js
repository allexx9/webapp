// Copyright 2016-2017 Rigo Investment Sagl.

import initialState from './initialState'
import {
  INIT_NOTIFICATION
} from '../../_utils/const'

function notificationsReducer(state = initialState.notifications, action) {
  switch (action.type) {
    case INIT_NOTIFICATION:
      console.log(action)
      return {
        ...state, engine: action.payload
      }
    default: return state;
  }

}

export default notificationsReducer