// Copyright 2016-2017 Rigo Investment Sagl.

import { IS_MANAGER } from './const'
import { drago, pools } from './dapp/'
import app from './app_actions'
import endpoint from './endpoint_actions'
import exchange from './exchange_actions'
import notifications from './notifications_actions'
import tokens from './tokens_actions'
import transactions from './transactions'
import vault from './vault_actions'

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
