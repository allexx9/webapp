import * as ACTION_ from '../../actions/dapp'
import { handleActions } from 'redux-actions'
import { poolsList } from '../initialState/index'

export const poolsListReducer = handleActions(
  {
    [ACTION_.updatePoolsList]: (state, action) => {
      const newList = { ...state.list, ...action.payload.list }
      return {
        ...{
          list: newList,
          lastFetchRange: action.payload.lastFetchRange
        }
      }
    }
  },
  { ...poolsList }
)
