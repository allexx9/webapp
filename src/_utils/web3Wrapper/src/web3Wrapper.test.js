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
