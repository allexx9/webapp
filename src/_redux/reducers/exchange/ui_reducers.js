import * as ACTION_ from '../../actions/exchange'
import { exchange } from '../initialState/index'
import { handleActions } from 'redux-actions'

export const uiReducer = handleActions(
  {
    [ACTION_.updateUiPanelProperties]: (state, action) => {
      return {
        ...state,
        ui: { ...state.ui, ...action.payload }
      }
    }
  },
  { ...exchange }
)
