import { updateAccounts } from './updateAccounts'

import { MSG_NETWORK_STATUS_OK, NETWORK_OK } from '../../_utils/const'
import BigNumber from 'bignumber.js'
import PoolsApi from '../../PoolsApi/src/index.js'
import deepFreeze from 'deep-freeze'

jest.mock('../../PoolsApi/src/index.js')

const accounts = new Map([
  [
    '0x01',
    {
      balance: {
        eth: 10000000000000000000,
        grg: 20000000000000000000
      },
      nonce: 0
    }
  ],
  [
    '0x02',
    {
      balance: {
        eth: 10000000000000000000,
        grg: 20000000000000000000
      },
      nonce: 0
    }
  ]
])
let initialState_1
let initialState_2

let balanceIncrease = 0
let nonceIncrease = 0

// Mock Api
let api

// Mock PoolApi
const rigotoken = {
  init: jest.fn(),
  balanceOf: jest.fn(async address => {
    const balance = accounts.get(address).balance.grg + balanceIncrease
    return balance.toString()
  })
}
PoolsApi.mockImplementation(() => {
  return {
    contract: {
      rigotoken
    }
  }
})

let prevLog

beforeEach(function() {
  prevLog = console.log
  console.log = () => {}
  balanceIncrease = 0
  nonceIncrease = 0
  api = {
    isConnected: false,
    noncePlus: 0,
    output: {
      syncing: false
    },
    eth: {
      getBalance: jest.fn(async address => {
        const balance = accounts.get(address).balance.eth + balanceIncrease
        return balance.toString()
      }),
      getTransactionCount: jest.fn(async address => {
        const nonce = accounts.get(address).nonce + nonceIncrease
        return nonce
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
          ethBalanceWei: new BigNumber('10000000000000000000'),
          grgBalanceWei: new BigNumber('20000000000000000000')
        },
        {
          name: 'Parity',
          address: '0x02',
          ethBalance: '10.000',
          grgBalance: '20.000',
          ethBalanceWei: new BigNumber('10000000000000000000'),
          grgBalanceWei: new BigNumber('20000000000000000000')
        }
      ],
      prevBlockNumber: 10,
      ethBalance: new BigNumber('20000000000000000000'),
      grgBalance: new BigNumber('40000000000000000000')
    }
  }

  initialState_2 = {
    endpoint: {
      accounts: [],
      prevBlockNumber: 10
    }
  }
})

afterEach(() => {
  console.log = prevLog
})

const createMockStore = state => {
  return {
    state,
    getState: function() {
      return deepFreeze(this.state)
    }
  }
}

describe('update account balance', () => {
  it('1 -> Detect prevBlockNumber > currentBlockNumber success', async () => {
    const newBlockNumber = 5
    const results = await updateAccounts(
      api,
      newBlockNumber,
      createMockStore(initialState_1).getState().endpoint
    )
    expect(results).toEqual([
      {
        prevBlockNumber: initialState_1.endpoint.prevBlockNumber
      },
      Array(0),
      false
    ])
  })
  it('2 -> Detect accounts !==0 success', async () => {
    const newBlockNumber = 15
    const results = await updateAccounts(
      api,
      newBlockNumber,
      createMockStore(initialState_2).getState().endpoint
    )
    expect(results).toEqual([
      {
        ...initialState_2.endpoint,
        loading: false,
        prevBlockNumber: newBlockNumber.toString()
      },
      Array(0),
      false
    ])
  })
  it('3 -> Detect no balance difference', async () => {
    const newBlockNumber = 15
    balanceIncrease = 0
    nonceIncrease = 1
    const results = await updateAccounts(
      api,
      newBlockNumber,
      createMockStore(initialState_1).getState().endpoint
    )
    expect(results).toEqual([
      {
        ...initialState_1.endpoint,
        loading: false,
        networkError: NETWORK_OK,
        networkStatus: MSG_NETWORK_STATUS_OK,
        accountsBalanceError: false,
        loading: false,
        prevBlockNumber: newBlockNumber.toString(),
        prevNonce: '1',
        grgBalance: new BigNumber('40000000000000000000'),
        ethBalance: new BigNumber('20000000000000000000')
      },
      Array(0),
      false
    ])
  })
  it('4 -> Detect increased balance difference', async () => {
    const newBlockNumber = 15
    balanceIncrease = 20000000000000000000
    nonceIncrease = 1
    const results = await updateAccounts(
      api,
      newBlockNumber,
      createMockStore(initialState_1).getState().endpoint
    )
    expect(results).toEqual([
      {
        loading: false,
        networkError: NETWORK_OK,
        networkStatus: MSG_NETWORK_STATUS_OK,
        accountsBalanceError: false,
        loading: false,
        prevBlockNumber: newBlockNumber.toString(),
        grgBalance: new BigNumber('80000000000000000000'),
        ethBalance: new BigNumber('60000000000000000000'),
        prevNonce: '1',
        accounts: [
          {
            name: 'MetaMask',
            address: '0x01',
            ethBalance: '30.000',
            grgBalance: '40.000',
            ethBalanceWei: new BigNumber('30000000000000000000'),
            grgBalanceWei: new BigNumber('40000000000000000000')
          },
          {
            name: 'Parity',
            address: '0x02',
            ethBalance: '30.000',
            grgBalance: '40.000',
            ethBalanceWei: new BigNumber('30000000000000000000'),
            grgBalanceWei: new BigNumber('40000000000000000000')
          }
        ]
      },
      Array(0),
      true
    ])
  })
})
