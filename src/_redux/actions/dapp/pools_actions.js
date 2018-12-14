import * as TYPE_ from '../actions_const/pools_const'
import { createAction } from 'redux-actions'

export const getPoolsList = createAction(
  TYPE_.POOLS_GET_LIST,
  (
    options = {
      topics: [null, null, null, null],
      fromBlock: 0,
      toBlock: 'latest'
    }
  ) => ({
    options
  })
)

export const updatePoolsList = createAction(TYPE_.POOLS_LIST_UPDATE)
