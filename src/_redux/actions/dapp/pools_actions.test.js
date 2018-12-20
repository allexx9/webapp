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
})
