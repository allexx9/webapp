// Copyright 2016-2017 Rigo Investment Sarl.

import * as TYPE_ from './const'

const notifications = {
  initNotificationsSystemAction: notificationSystem => {
    return {
      type: TYPE_.INIT_NOTIFICATION,
      payload: notificationSystem
    }
  },
  queueWarningNotification: message => {
    return {
      type: TYPE_.QUEUE_WARNING_NOTIFICATION,
      payload: message
    }
  },
  queueErrorNotification: error => {
    return {
      type: TYPE_.QUEUE_ERROR_NOTIFICATION,
      payload: error
    }
  }
}

export default notifications
