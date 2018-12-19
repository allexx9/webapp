// Copyright 2016-2017 Rigo Investment Sarl.

import * as TYPE_ from './const'

const app = {
  updateAppStatus: status => {
    return {
      type: TYPE_.APP_STATUS_UPDATE,
      payload: status
    }
  },
  updateAppConfig: config => {
    return {
      type: TYPE_.APP_CONFIG_UPDATE,
      payload: config
    }
  }
}

export default app
