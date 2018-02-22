// Copyright 2016-2017 Rigo Investment Sarl.

import initialState from './initialState'
import {IS_MANAGER} from '../utils/const'

function usersReducer (state = initialState.user, action) {
  switch (action.type) {
    case IS_MANAGER:
    var isManager = action.payload
    return {
      ...state, isManager
    };
    default: return state;
  }
}

export default usersReducer