// Copyright 2016-2017 Rigo Investment Sagl.
// By the Power of Grayskull! I Have the Power!

import * as TYPE_ from '../actions/const'

export const relayActionsMiddleWare = store => next => action => {
  const state = store.getState()
  if (TYPE_.CUSTOM_EXCHANGE_ACTIONS.includes(action.type)) {
    action.type = `${state.exchange.selectedRelay.name.toUpperCase()}_${
      action.type
    }`
  }
  next(action)
}
