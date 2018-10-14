// Copyright 2016-2017 Rigo Investment Sarl.

import { QUEUE_ERROR_NOTIFICATION, UPDATE_APP_STATUS } from './const'

const tokens = {
  updateAppStatus: status => {
    return {
      type: UPDATE_APP_STATUS,
      payload: status
    }
  },

  queueErrorNotification: error => {
    return {
      type: QUEUE_ERROR_NOTIFICATION,
      payload: error
    }
  }
}

export default tokens
