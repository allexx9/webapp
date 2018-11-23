import * as TYPE_ from '../actions_const'
import { createAction } from 'redux-actions'

export const createOrder = createAction(
  TYPE_.ORDER_CREATE,
  (orderSide = 'asks', options = { protocol: 'v0', type: 'LIMIT_ORDER' }) => ({
    orderSide,
    options
  })
)

export const updateOrder = createAction(TYPE_.ORDER_UPDATE)
export const cancelOrder = createAction(TYPE_.ORDER_CANCEL)
