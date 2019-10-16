// Copyright 2016-2017 Rigo Investment Sagl.

import { IS_MANAGER } from './const'
import { app, drago, pools, vault } from './dapp/'
import endpoint from './endpoint_actions'
import exchange from './exchange_actions'
import notifications from './notifications_actions'
import tokens from './tokens_actions'
import transactions from './transactions'

class actions {
  app = app

  drago = drago

  pools = pools

  exchange = exchange

  endpoint = endpoint

  notifications = notifications

  transactions = transactions

  vault = vault

  users = {
    isManagerAction: isManager => {
      return {
        type: IS_MANAGER,
        payload: isManager
      }
    }
  }

  tokens = tokens
}

let Actions = new actions()
export { Actions }
