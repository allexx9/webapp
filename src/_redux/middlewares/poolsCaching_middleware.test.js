import * as TYPE_ from '../actions/const'
import { Actions } from '../actions'
import { poolsCachingMiddleWare } from './poolsCaching_middleware'

let prevLog

beforeEach(function() {
  prevLog = console.log
  console.log = () => {}
})

afterEach(() => {
  console.log = prevLog
})

const create = initialState => {
  const store = {
    getState: jest.fn(() => {
      return initialState
    }),
    dispatch: jest.fn()
  }
  const next = jest.fn()
  const invoke = action => poolsCachingMiddleWare(store)(next)(action)
  return { store, next, invoke }
}

describe('pools caching middleware', () => {
  it(`it runs on ${
    TYPE_.DRAGO_SELECTED_DETAILS_UPDATE
  } with dragoId success`, () => {
    const initialState = {
      transactionsDrago: {
        selectedDrago: {
          dragoId: '1'
        }
      }
    }
    const payload = {
      details: { dragoId: '1' }
    }
    const action = {
      type: TYPE_.DRAGO_SELECTED_DETAILS_UPDATE,
      payload,
      meta: { updateCache: true }
    }
    const cachePayload = {
      payload: { ...action.payload },
      meta: { poolId: payload.details.dragoId }
    }
    const dispatchedAction = Actions.pools.writeItemPoolsList(cachePayload)
    const { store, invoke } = create(initialState)
    invoke(action)
    expect(store.dispatch).toHaveBeenCalledWith(dispatchedAction)
  })
  it(`it runs on ${
    TYPE_.DRAGO_SELECTED_DETAILS_UPDATE
  } with id success`, () => {
    const initialState = {
      transactionsDrago: {
        selectedDrago: {
          id: '1'
        }
      }
    }
    const payload = {
      details: { id: '1' }
    }
    const action = {
      type: TYPE_.DRAGO_SELECTED_DETAILS_UPDATE,
      payload,
      meta: { updateCache: true }
    }
    const cachePayload = {
      payload: { ...action.payload },
      meta: { poolId: payload.details.id }
    }
    const dispatchedAction = Actions.pools.writeItemPoolsList(cachePayload)
    const { store, invoke } = create(initialState)
    invoke(action)
    expect(store.dispatch).toHaveBeenCalledWith(dispatchedAction)
  })
  it(`it does not run on ${
    TYPE_.DRAGO_SELECTED_DETAILS_UPDATE
  } with updateCache = false success`, () => {
    const initialState = {
      transactionsDrago: {
        selectedDrago: {
          id: '1'
        }
      }
    }
    const payload = {
      details: { id: '1' }
    }
    const action = {
      type: TYPE_.DRAGO_SELECTED_DETAILS_UPDATE,
      payload,
      meta: { updateCache: false }
    }
    const cachePayload = {
      payload: { ...action.payload },
      meta: { poolId: payload.details.id }
    }
    const dispatchedAction = Actions.pools.writeItemPoolsList(cachePayload)
    const { store, invoke } = create(initialState)
    invoke(action)
    expect(store.dispatch).not.toHaveBeenCalledWith(dispatchedAction)
  })
  it(`it does not run on ${
    TYPE_.DRAGO_SELECTED_DETAILS_UPDATE
  } with meta = undefined success`, () => {
    const initialState = {
      transactionsDrago: {
        selectedDrago: {
          id: '1'
        }
      }
    }
    const payload = {
      details: { id: '1' }
    }
    const action = {
      type: TYPE_.DRAGO_SELECTED_DETAILS_UPDATE,
      payload
    }
    const cachePayload = {
      payload: { ...action.payload },
      meta: { poolId: payload.details.id }
    }
    const dispatchedAction = Actions.pools.writeItemPoolsList(cachePayload)
    const { store, invoke } = create(initialState)
    invoke(action)
    expect(store.dispatch).not.toHaveBeenCalledWith(dispatchedAction)
  })
  it(`it only runs on ${TYPE_.DRAGO_SELECTED_DETAILS_UPDATE} success`, () => {
    const initialState = {
      transactionsDrago: {
        selectedDrago: {
          id: '1'
        }
      }
    }
    const payload = {
      details: { id: '1' }
    }
    const action = {
      type: 'TEST',
      payload
    }
    const cachePayload = {
      payload: { ...action.payload },
      meta: { poolId: payload.details.id }
    }
    const dispatchedAction = Actions.pools.writeItemPoolsList(cachePayload)
    const { store, invoke } = create(initialState)
    invoke(action)
    expect(store.dispatch).not.toHaveBeenCalledWith(dispatchedAction)
  })
})
