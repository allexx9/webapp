// Copyright 2016-2017 Rigo Investment Sagl.
// By the Power of Grayskull! I Have the Power!

import * as TYPE_ from '../actions/const'
import { notificationWrapper } from '../../_utils/notificationWrapper'
import serializeError from 'serialize-error'
import utils from '../../_utils/utils'

export const notificationsMiddleWare = store => next => action => {
  // const state = store.getState()
  const notificationEngine = notificationWrapper.getInstance()
  if (action.type === TYPE_.QUEUE_ACCOUNT_NOTIFICATION) {
    action.payload.forEach(notification => {
      utils.notificationAccount(notificationEngine, notification, 'info')
    })
  }
  if (action.type === TYPE_.QUEUE_ERROR_NOTIFICATION) {
    utils.notificationError(
      notificationEngine,
      serializeError(action.payload),
      'error'
    )
  }
  if (action.type === TYPE_.QUEUE_WARNING_NOTIFICATION) {
    utils.notificationError(
      notificationEngine,
      serializeError(action.payload),
      'warning'
    )
  }
  next(action)
}
