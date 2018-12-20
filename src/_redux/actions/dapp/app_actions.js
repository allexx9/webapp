import * as TYPE_ from '../actions_const/app_const'
import { createAction } from 'redux-actions'

export const updateAppStatus = createAction(TYPE_.APP_STATUS_UPDATE)
export const updateAppConfig = createAction(TYPE_.APP_CONFIG_UPDATE)
