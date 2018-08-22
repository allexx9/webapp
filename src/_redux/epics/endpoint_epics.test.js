// https://github.com/redux-observable/redux-observable/issues/477#issuecomment-393516995


import { updateAccounts, checkConnection } from './endpoint_epics'
import PoolsApi from '../../PoolsApi/src/index.js'
import {
  NETWORK_OK,
  MSG_NETWORK_STATUS_OK,
  NETWORK_WARNING,
  MSG_NETWORK_STATUS_ERROR,
} from '../../_utils/const'
jest.mock('../../PoolsApi/src/index.js');

const accounts = new Map([
  ['0x01', {
    balance: {
      eth: 30000000000000000000,
      grg: 50000000000000000000,
    }
  }],
  ['0x02', {
    balance: {
      eth: 30000000000000000000,
      grg: 50000000000000000000,
    }
  }],
])
let initialState_1
let initialState_2

// Mock Api
let api

// Mock PoolApi
const rigotoken = {
  init: jest.fn(),
  balanceOf: jest.fn((address) => {
    return accounts.get(address).balance.grg
  })
};
PoolsApi.mockImplementation(() => {
  return {
    contract: {
      rigotoken
    }
  };
});



beforeEach(function () {
  api = {
    isConnected: false,
    plus: 0,
    output: {
      syncing: false
    },
    eth: {
      getBalance: jest.fn((address) => {
        return accounts.get(address).balance.eth - api.plus
      }),
      syncing: jest.fn(() => {
        return api.output.syncing
      })
    }
  }

  initialState_1 = {
    endpoint: {
      accounts: [
        {
          name: 'MetaMask',
          address: '0x01',
          ethBalance: "10.000",
          grgBalance: "20.000",
          ethBalanceWei: "10000000000000000000",
          grgBalanceWei: "20000000000000000000"
        },
        {
          name: 'Parity',
          address: '0x02',
          ethBalance: "10.000",
          grgBalance: "20.000",
          ethBalanceWei: "10000000000000000000",
          grgBalanceWei: "20000000000000000000"
        },
      ],
      prevBlockNumber: 10
    },
  };

  initialState_2 = {
    endpoint: {
      accounts: [
      ],
      prevBlockNumber: 10
    },
  };
});

const createMockStore = (state) => {
  return {
    state,
    getState: function () {
      return this.state;
    }
  }
}

describe("monitor connection to node", () => {
  it('1 -> node is NOT connected success', async () => {
    api.isConnected = false
    api.output.syncing = false
    const results = await checkConnection(api)
    expect(results)
      .toEqual(
        {
          isConnected: false,
          isSyncing: false,
          syncStatus: {},
        })
  })
  it('2 -> node is connected success', async () => {
    api.isConnected = true
    api.output.syncing = false
    const results = await checkConnection(api)
    expect(results)
      .toEqual(
        {
          isConnected: true,
          isSyncing: false,
          syncStatus: {},
        })
  })
  it('3 -> node is connected and syncing success', async () => {
    api.isConnected = true
    api.output.syncing = { syncing: "yes" }
    const results = await checkConnection(api)
    expect(results)
      .toEqual(
        {
          isConnected: true,
          isSyncing: true,
          syncStatus: { syncing: "yes" },
        })
  })
  it('4 -> node is connected and NOT syncing success', async () => {
    api.isConnected = true
    api.output.syncing = false
    const results = await checkConnection(api)
    expect(results)
      .toEqual(
        {
          isConnected: true,
          isSyncing: false,
          syncStatus: {},
        })
  })
})


// describe("update account balance", () => {
//   it('1 -> Detect prevBlockNumber > currentBlockNumber success', async () => {
//     const newBlockNumber = 5
//     const results = await updateAccounts(api, newBlockNumber, createMockStore(initialState_1))
//     expect(results)
//       .toEqual([{
//         prevBlockNumber: initialState_1.endpoint.prevBlockNumber
//       },
//       Array(0)
//       ])
//   })
//   it('2 -> Detect accounts !==0 success', async () => {
//     const newBlockNumber = 15
//     const results = await updateAccounts(api, newBlockNumber, createMockStore(initialState_2))
//     expect(results)
//       .toEqual([{
//         ...initialState_2.endpoint,
//         loading: false,
//         prevBlockNumber: newBlockNumber.toString()
//       },
//       Array(0)
//       ])
//   })
//   it('3 -> Detect increased balance difference', async () => {
//     const newBlockNumber = 15
//     const results = await updateAccounts(api, newBlockNumber, createMockStore(initialState_1))
//     expect(results)
//       .toEqual([{
//         ...initialState_1.endpoint,
//         loading: false,
//         networkError: NETWORK_OK,
//         networkStatus: MSG_NETWORK_STATUS_OK,
//         accountsBalanceError: false,
//         loading: false,
//         prevBlockNumber: newBlockNumber.toString()
//       },
//       Array(0)
//       ])
//   })
//   it('4 -> Detect no balance difference', async () => {
//     const newBlockNumber = 15
//     api.plus = 20000000000000000000
//     const results = await updateAccounts(api, newBlockNumber, createMockStore(initialState_1))
//     expect(results)
//       .toEqual([{
//         loading: false,
//         networkError: NETWORK_OK,
//         networkStatus: MSG_NETWORK_STATUS_OK,
//         accountsBalanceError: false,
//         loading: false,
//         prevBlockNumber: newBlockNumber.toString(),
//         ethBalance: "20000000000000000000",
//         grgBalance: "40000000000000000000",
//         accounts: [
//           { 
//             name: 'MetaMask',
//             address: '0x01',
//             ethBalance : "10.000",
//             grgBalance: "20.000",
//             ethBalanceWei : "10000000000000000000",
//             grgBalanceWei: "20000000000000000000"
//           },
//           {
//             name: 'Parity',
//             address: '0x02',
//             ethBalance : "10.000",
//             grgBalance: "20.000",
//             ethBalanceWei : "10000000000000000000",
//             grgBalanceWei: "20000000000000000000"
//           },
//         ],
//       },
//       Array(0)
//       ])
//   })
// })