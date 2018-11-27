// Copyright 2016-2017 Rigo Investment Sarl.

import * as TYPE_ from './const'

const app = {
  updateAppStatus: status => {
    return {
      type: TYPE_.UPDATE_APP_STATUS,
      payload: status
    }
  },
  updateAppConfig: config => {
    return {
      type: TYPE_.UPDATE_APP_CONFIG,
      payload: config
    }
  },

  queueErrorNotification: error => {
    return {
      type: TYPE_.QUEUE_ERROR_NOTIFICATION,
      payload: error
    }
  }
}

export default app
