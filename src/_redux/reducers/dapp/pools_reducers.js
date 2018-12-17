import * as ACTION_ from '../../actions/dapp'
import { handleActions } from 'redux-actions'
import { poolsList } from '../initialState/index'

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
      // console.log(action)
      const { poolId } = action.meta
      const {
        values,
        details,
        transactions,
        assets,
        assetsCharts
      } = action.payload
      let newDetails
      let cachedDetails
      let cachedTransactions
      let cachedAssets
      let cachedAssetsCharts
      let cachedValues

      if (typeof state.list[poolId] !== 'undefined') {
        cachedDetails = Object.assign({}, state.list[poolId])
        typeof cachedDetails.transactions !== 'undefined'
          ? (cachedTransactions = [].concat(cachedDetails.transactions))
          : (cachedTransactions = [])
        typeof cachedDetails.assets !== 'undefined'
          ? (cachedAssets = [].concat(cachedDetails.assets))
          : (cachedAssets = [])
        typeof cachedDetails.assetsCharts !== 'undefined'
          ? (cachedAssetsCharts = Object.assign({}, cachedDetails.assetsCharts))
          : (cachedAssetsCharts = {})
        typeof cachedDetails.values !== 'undefined'
          ? (cachedValues = Object.assign({}, cachedDetails.values))
          : (cachedValues = {})

        newDetails = {
          [poolId]: {
            ...cachedDetails,
            values: {
              ...(values || cachedValues)
            },
            details: {
              ...cachedDetails.details,
              ...(details || {})
            },
            transactions: [...(transactions || cachedTransactions)],
            assets: [...(assets || cachedAssets)],
            assetsCharts: {
              ...(assetsCharts || cachedAssetsCharts)
            }
          }
        }
      } else {
        newDetails = { [poolId]: Object.assign({}, action.payload) }
      }

      return {
        ...{
          list: { ...state.list, ...newDetails },
          lastFetchRange: { ...{}, ...state.lastFetchRange }
        }
      }
    }
  },
  { ...poolsList }
)
