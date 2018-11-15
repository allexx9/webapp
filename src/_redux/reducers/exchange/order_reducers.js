import * as ACTION_ from '../../actions/exchange'
import { exchange } from '../initialState/index'
import { handleActions } from 'redux-actions'

export const ordersReducer = handleActions(
  {
    [ACTION_.updateOrder]: (state, action) => {
      return {
        ...state,
        selectedOrder: { ...state.selectedOrder, ...action.payload }
      }
    }
  },
  { ...exchange }
)
