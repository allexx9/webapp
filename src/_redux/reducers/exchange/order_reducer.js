import * as ACTION_ from '../../actions/exchange'
import { exchange } from '../initialState/index'
import { handleActions } from 'redux-actions'
import initialState from '../initialState'

export const ordersReducer = handleActions(
  {
    [ACTION_.updateOrder]: (state, action) => {
      return {
        ...state,
        selectedOrder: { ...state.selectedOrder, ...action.payload }
      }
    },
    [ACTION_.cancelOrder]: state => {
      return {
        ...state,
        selectedOrder: { ...initialState.exchange.selectedOrder }
      }
    }
  },
  { ...exchange }
)
