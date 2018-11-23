// Copyright 2016-2017 Rigo Investment Sagl.

import * as TYPE_ from '../../actions/const'
import { Actions } from '../../actions/'
import { distinctUntilChanged, map, mergeMap, tap } from 'rxjs/operators'
import Web3Wrapper from '../../../_utils/web3Wrapper/src'

//
// CHECK IF THE APP If NETWORK IS UP AND THERE IS A CONNECTION TO A NODE
//

export const connectedToNodeEpic = (action$, state$) =>
  action$.ofType(TYPE_.CHECK_APP_IS_CONNECTED).pipe(
    mergeMap(() => {
      const instance = Web3Wrapper.getInstance(
        state$.value.endpoint.networkInfo.id
      )
      return instance.rigoblock.ob.nodeStatus$.pipe(
        distinctUntilChanged((a, b) => JSON.stringify(a) === JSON.stringify(b))
      )
    }),
    tap(val => {
      console.log(val)
      return val
    }),
    map(res => Actions.app.updateAppStatus(res))
  )
