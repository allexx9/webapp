// https://github.com/redux-observable/redux-observable/issues/477#issuecomment-393516995
/* eslint-disable */

import { Server } from 'mock-socket'
import Web3Wrapper from './web3Wrapper'
import WebSocket from 'ws'

beforeEach(function() {})

const createMockStore = state => {
  return {
    state,
    getState: function() {
      return this.state
    }
  }
}

describe('Create an instance', async () => {
  it('1 -> create an instance success', async () => {
    let instance = await Web3Wrapper.getInstance('KOVAN')
    expect(instance).toContainKeys([
      'web3',
      'endpoint',
      'eventfull$',
      'nodeStatus$'
    ])
    expect(instance).toBeObject()
    expect(instance.web3).toBeObject()
    expect(instance.endpoint).toBeObject()
    expect(instance.eventfull$).toBeObject()
    expect(instance.nodeStatus$).toBeObject()
  })
  it('2 -> is a singleton success', async () => {
    let instance = await Web3Wrapper.getInstance('KOVAN')
    let instance2 = await Web3Wrapper.getInstance('KOVAN')
    expect(instance).toStrictEqual(instance2)
  })
  // it(
  //   '2 -> node is connected success',
  //   () => {
  //     api.isConnected = true
  //     api.output.syncing = false
  //     isConnectedToNode$(api).subscribe(data => {
  //       expect(data).toEqual({
  //         isConnected: true,
  //         isSyncing: false,
  //         syncStatus: {}
  //       })
  //     })
  //   },
  //   5000
  // )
  // it('3 -> node is connected and syncing success', done => {
  //   api.isConnected = true
  //   api.output.syncing = { syncing: 'yes' }
  //   let ob = isConnectedToNode$(api)
  //   ob.subscribe(data => {
  //     expect(data).toEqual({
  //       isConnected: true,
  //       isSyncing: true,
  //       syncStatus: { syncing: 'yes' }
  //     })
  //     done()
  //   })
  // })
  // it('4 -> node is connected and NOT syncing success', async () => {
  //   api.isConnected = true
  //   api.output.syncing = false
  //   isConnectedToNode$(api).subscribe(data => {
  //     console.log(data)
  //     expect(data).toEqual(
  //       {
  //         isConnected: true,
  //         isSyncing: false,
  //         syncStatus: {},
  //       })
  //   })
  // })
  // it('5 -> node timeout success', async () => {
  //   api.isConnected = true
  //   api.output.syncing = false
  //   isConnectedToNode$(api).subscribe(data => {
  //     expect(data).toThrow()
  //   })
  // })
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
