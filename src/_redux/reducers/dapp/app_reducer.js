import * as ACTION_ from '../../actions/dapp'
import { app } from '../initialState/index'
import { handleActions } from 'redux-actions'
import u from 'updeep'

export const appReducer = handleActions(
  {
    [ACTION_.app.updateAppStatus]: (state, action) => {
      return { ...state, ...action.payload }
    },
    [ACTION_.app.updateAppConfig]: (state, action) => {
      const newConfig = u(action.payload, state.config)
      return { ...state, config: { ...newConfig } }
    }
  },
  { ...app }
)
