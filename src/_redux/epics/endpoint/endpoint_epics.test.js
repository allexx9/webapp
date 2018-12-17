// https://github.com/redux-observable/redux-observable/issues/477#issuecomment-393516995

import { isConnectedToNode$, updateAccounts } from './endpoint_epics'

// import {
//   MSG_NETWORK_STATUS_ERROR,
//   MSG_NETWORK_STATUS_OK,
//   NETWORK_OK,
//   NETWORK_WARNING
// } from '../../_utils/const'
import PoolsApi from '../../../PoolsApi/src/index.js'

jest.mock('../../../PoolsApi/src/index.js')

const accounts = new Map([
  [
    '0x01',
    {
      balance: {
        eth: 30000000000000000000,
        grg: 50000000000000000000
      }
    }
  ],
  [
    '0x02',
    {
      balance: {
        eth: 30000000000000000000,
        grg: 50000000000000000000
      }
    }
  ]
])
let initialState_1
let initialState_2

// Mock Api
let api

// Mock PoolApi
const rigotoken = {
  init: jest.fn(),
  balanceOf: jest.fn(address => {
    return accounts.get(address).balance.grg
  })
}
PoolsApi.mockImplementation(() => {
  return {
    contract: {
      rigotoken
    }
  }
})

beforeEach(function() {
  api = {
    isConnected: false,
    plus: 0,
    output: {
      syncing: false
    },
    eth: {
      getBalance: jest.fn(address => {
        return accounts.get(address).balance.eth - api.plus
      }),
      syncing: jest.fn(async () => {
        return await api.output.syncing
      })
    }
  }

  initialState_1 = {
    endpoint: {
      accounts: [
        {
          name: 'MetaMask',
          address: '0x01',
          ethBalance: '10.000',
          grgBalance: '20.000',
          ethBalanceWei: '10000000000000000000',
          grgBalanceWei: '20000000000000000000'
        },
        {
          name: 'Parity',
          address: '0x02',
          ethBalance: '10.000',
          grgBalance: '20.000',
          ethBalanceWei: '10000000000000000000',
          grgBalanceWei: '20000000000000000000'
        }
      ],
      prevBlockNumber: 10
    }
  }

  initialState_2 = {
    endpoint: {
      accounts: [],
      prevBlockNumber: 10
    }
  }
})

const createMockStore = state => {
  return {
    state,
    getState: function() {
      return this.state
    }
  }
}

describe('update account balance', () => {
  it('0 -> empty test', async () => {
    // const newBlockNumber = 5
    // const results = await updateAccounts(
    //   api,
    //   newBlockNumber,
    //   createMockStore(initialState_1)
    // )
    // expect(results).toEqual([
    //   {
    //     prevBlockNumber: initialState_1.endpoint.prevBlockNumber
    //   },
    //   Array(0)
    // ])
  })
})
