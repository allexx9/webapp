import * as TYPE_ from '../const'
import { Actions } from '../index'

describe('pools actions creator', () => {
  it(`${TYPE_.POOLS_LIST_GET} success`, () => {
    let options = {
      topics: ['test', null, null, null],
      fromBlock: 0,
      toBlock: 'latest',
      poolType: 'drago'
    }
    const results = Actions.pools.getPoolsList(options)
    expect(results).toEqual({
      type: TYPE_.POOLS_LIST_GET,
      payload: { options: options }
    })
  })
  it(`${TYPE_.POOLS_LIST_UPDATE} success`, () => {
    let payload = {
      test: 'test'
    }
    const results = Actions.pools.updatePoolsList(payload)
    expect(results).toEqual({
      type: TYPE_.POOLS_LIST_UPDATE,
      payload: { test: 'test' }
    })
  })
  it(`${TYPE_.POOLS_LIST_ITEM_READ} success`, () => {
    let payload = {
      test: 'test'
    }
    const results = Actions.pools.readItemPoolsList(payload)
    expect(results).toEqual({
      type: TYPE_.POOLS_LIST_ITEM_READ,
      payload: { test: 'test' }
    })
  })
  it(`${TYPE_.POOLS_LIST_ITEM_WRITE} success`, () => {
    let payload = {
      test: 'test'
    }
    let meta = {
      poolId: 1
    }
    const results = Actions.pools.writeItemPoolsList({ payload, meta })
    expect(results).toEqual({
      type: TYPE_.POOLS_LIST_ITEM_WRITE,
      payload,
      meta
    })
  })
  it(`${TYPE_.POOLS_SINGLE_TRANSACTIONS_GET} success`, () => {
    let poolAddress = '0x'
    let accounts = [1, 2]
    let options = { test: test }
    const results = Actions.pools.getPoolsSingleTransactions(
      poolAddress,
      accounts,
      options
    )
    expect(results).toEqual({
      type: TYPE_.POOLS_SINGLE_TRANSACTIONS_GET,
      payload: {
        poolAddress,
        accounts,
        options
      }
    })
  })
  it(`${TYPE_.POOLS_SINGLE_DETAILS_GET} without options success`, () => {
    let poolId = 1
    let options = { poolType: 'drago', wallet: '' }
    const results = Actions.pools.getPoolsSingleDetails(poolId)
    expect(results).toEqual({
      type: TYPE_.POOLS_SINGLE_DETAILS_GET,
      payload: {
        poolId: 1,
        options
      }
    })
  })
  it(`${TYPE_.POOLS_SINGLE_DETAILS_GET} with options success`, () => {
    let poolId = 1
    let options = { poolType: 'test', wallet: 'metaMask' }
    const results = Actions.pools.getPoolsSingleDetails(poolId, options)
    expect(results).toEqual({
      type: TYPE_.POOLS_SINGLE_DETAILS_GET,
      payload: {
        poolId: 1,
        options
      }
    })
  })
  it(`${TYPE_.POOLS_GROUP_DETAILS_GET} with options success`, () => {
    let poolsIdArray = [1, 2, 3]
    const results = Actions.pools.getPoolsGroupDetails(poolsIdArray)
    expect(results).toEqual({
      type: TYPE_.POOLS_GROUP_DETAILS_GET,
      payload: {
        poolsIdArray
      }
    })
  })
})
