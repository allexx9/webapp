import * as ACTION_ from '../../actions/dapp'
import { app } from '../initialState/app_state'
import { appReducer } from './app_reducer'
import deepFreeze from 'deep-freeze'

let prevLog

beforeEach(function() {
  prevLog = console.log
  console.log = () => {}
})

afterEach(() => {
  console.log = prevLog
})

describe('app reducer', () => {
  it(`${ACTION_.app.updateAppStatus} update success`, () => {
    const payload = {
      isConnected: true,
      isSyncing: false,
      syncStatus: { test: 'test' },
      error: { test: 'test' }
    }
    const newAppState = {
      isConnected: true,
      isSyncing: false,
      syncStatus: {},
      error: { test: 'test' },
      appLoading: true,
      retryTimeInterval: 0,
      connectionRetries: 0,
      lastBlockNumberUpdate: 0,
      accountsAddressHash: '',
      errorEventfulSubscription: false,
      config: {
        isMock: false
      },
      transactionsDrawerOpen: false
    }
    const action = ACTION_.app.updateAppStatus(payload)
    const state = app
    deepFreeze(state)
    deepFreeze(action)
    const results = appReducer(state, action)
    expect(results).toEqual(newAppState)
  })
  it(`${ACTION_.app.updateAppConfig} update success`, () => {
    const payload = {
      isMock: true
    }
    const newAppState = {
      isConnected: false,
      isSyncing: false,
      syncStatus: {},
      error: {},
      appLoading: true,
      retryTimeInterval: 0,
      connectionRetries: 0,
      lastBlockNumberUpdate: 0,
      accountsAddressHash: '',
      errorEventfulSubscription: false,
      config: {
        isMock: true
      },
      transactionsDrawerOpen: false
    }
    const action = ACTION_.app.updateAppConfig(payload)
    const state = app
    deepFreeze(state)
    deepFreeze(action)
    const results = appReducer(state, action)
    expect(results).toEqual(newAppState)
  })
})
