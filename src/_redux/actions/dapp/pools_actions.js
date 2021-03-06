import * as TYPE_ from '../actions_const/pools_const'
import { createAction } from 'redux-actions'

export const getPoolsList = createAction(
  TYPE_.POOLS_LIST_GET,
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

export const readItemPoolsList = createAction(TYPE_.POOLS_LIST_ITEM_READ)

export const writeItemPoolsList = createAction(
  TYPE_.POOLS_LIST_ITEM_WRITE,
  ({ payload }) => payload,
  ({ meta }) => meta
)

export const getPoolsSingleTransactions = createAction(
  TYPE_.POOLS_SINGLE_TRANSACTIONS_GET,
  (poolAddress, accounts, options) => ({
    poolAddress,
    accounts,
    options
  })
)

export const getPoolsSingleDetails = createAction(
  TYPE_.POOLS_SINGLE_DETAILS_GET,
  (poolId, options = { poolType: 'drago', wallet: '' }) => ({
    poolId,
    options
  })
)

export const getPoolsGroupDetails = createAction(
  TYPE_.POOLS_GROUP_DETAILS_GET,
  poolsIdArray => ({
    poolsIdArray
  })
)
