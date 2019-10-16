import * as ACTION_ from '../../actions/exchange'
import { exchange } from '../initialState/index'
import { handleActions } from 'redux-actions'
import u from 'updeep'

export const uiReducer = handleActions(
  {
    [ACTION_.updateUiPanelProperties]: (state, action) => {
      const newUi = u(action.payload, state.ui)
      return {
        ...state,
        ui: { ...newUi }
      }
    }
  },
  { ...exchange }
)
