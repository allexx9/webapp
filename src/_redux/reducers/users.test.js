import usersReducer from './users';
import deepFreeze from 'deep-freeze'
import {
  IS_MANAGER,
} from '../actions/const'

describe("users Reducer", () =>{
  it('IS_MANAGER success', () => {
    const state = {
      test: 'test',
      isManager: false
    }
    const action ={
      type: IS_MANAGER,
      payload: true
    }
    deepFreeze(state)
    deepFreeze(action)
    const results = usersReducer(state, action)
    expect(results)
      .toEqual({
        test: 'test',
        isManager: true
      })
  })
})