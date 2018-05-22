// Copyright 2016-2017 Rigo Investment Sarl.

import initialState from './initialState'
import {
  ADD_NOTIFICATION
} from '../../_utils/const'

function notificationsReducer (state = initialState.notifications, action) {
  switch (action.type) {
    case ADD_NOTIFICATION:
    return {
      ...state, message: action.payload
    }
    default: return state;
  }
  
}

export default notificationsReducer