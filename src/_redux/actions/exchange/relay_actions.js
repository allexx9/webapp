import * as TYPE_ from '../actions_const/relay_const'
import { createAction } from 'redux-actions'

export const connectRelay = createAction(
  TYPE_.RELAY_CONNECT,
  (relay, tokensPair) => ({
    relay,
    tokensPair
  })
)
