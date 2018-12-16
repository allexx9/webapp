import * as ACTION_ from '../../actions/dapp'
import { handleActions } from 'redux-actions'
import { poolsList } from '../initialState/index'

console.log(ACTION_)

export const poolsListReducer = handleActions(
  {
    [ACTION_.pools.updatePoolsList]: (state, action) => {
      const newList = { ...state.list, ...action.payload.list }
      return {
        ...{
          list: newList,
          lastFetchRange: action.payload.lastFetchRange
        }
      }
    },
    [ACTION_.pools.writeItemPoolsList]: (state, action) => {
      const { poolId } = action.meta
      const oldDetails = { ...state.list[poolId] }
      const newDetails = {
        [poolId]: {
          ...oldDetails,
          values: {
            ...oldDetails.values,
            ...(action.payload.values || {})
          },
          details: {
            ...oldDetails.details,
            ...(action.payload.details || {})
          },
          transactions: [
            ...(action.payload.transactions ||
              [].concat(oldDetails.transactions))
          ],
          assets: [...(action.payload.assets || [].concat(oldDetails.assets))],
          assetsCharts: {
            ...oldDetails.assetsCharts,
            ...(action.payload.assetsCharts || {})
          }
        }
      }
      return {
        ...{
          list: { ...state.list, ...newDetails },
          lastFetchRange: { ...state.lastFetchRange }
        }
      }
    }
  },
  { ...poolsList }
)
