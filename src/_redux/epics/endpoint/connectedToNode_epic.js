// Copyright 2016-2017 Rigo Investment Sagl.

// import { Observable } from 'rxjs';
import * as TYPE_ from '../../actions/const'
import { Actions } from '../../actions/'
import { Observable, timer } from 'rxjs'
import {
  distinctUntilChanged,
  finalize,
  flatMap,
  mergeMap,
  retryWhen,
  tap
} from 'rxjs/operators'
import Web3Wrapper from '../../../_utils/web3Wrapper/src'
import shallowequal from 'shallowequal'

//
// CHECK IF THE APP If NETWORK IS UP AND THERE IS A CONNECTION TO A NODE
//

export const isConnectedToNodeWeb3Wrapper$ = state$ => {
  return Observable.create(observer => {
    const instance = Web3Wrapper.getInstance(
      state$.value.endpoint.networkInfo.id
    )
    instance.rigoblock.ob.nodeStatus$.subscribe(val => {
      // console.log('Msg: ', val)
      if (val === 0) return
      if (Object.keys(val.error).length === 0) {
        // console.log('Msg: ', val)
        observer.next(val)
      } else {
        // console.log('Err: ', val)
        observer.next(val)
      }
    })
  })
}

export const connectedToNodeEpic = (action$, state$) =>
  action$.ofType(TYPE_.CHECK_APP_IS_CONNECTED).switchMap(() => {
    return isConnectedToNodeWeb3Wrapper$(state$).pipe(
      tap(result => {
        return result
      }),
      distinctUntilChanged((a, b) => {
        return shallowequal(JSON.stringify(a), JSON.stringify(b))
      }),
      flatMap(result => {
        let actionsArray = Array(0)
        // console.log('connectedToNodeEpic')
        actionsArray = [
          Observable.of(
            Actions.app.updateAppStatus({
              ...result
            })
          )
        ]
        return Observable.concat(...actionsArray)
      }),
      retryWhen(error => {
        let scalingDuration = 5000
        return error.pipe(
          mergeMap((error, i) => {
            console.warn(error)
            return timer(scalingDuration)
          }),
          finalize(() => console.log('We are done!'))
        )
      })
    )
  })
