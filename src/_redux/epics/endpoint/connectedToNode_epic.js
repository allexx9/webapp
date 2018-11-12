// Copyright 2016-2017 Rigo Investment Sagl.

// import { Observable } from 'rxjs';
import * as TYPE_ from '../../actions/const'
import { Actions } from '../../actions/'
import { Observable } from 'rxjs'
import { flatMap, tap } from 'rxjs/operators'
import Web3Wrapper from '../../../_utils/web3Wrapper/src'

//
// CHECK IF THE APP If NETWORK IS UP AND THERE IS A CONNECTION TO A NODE
//

export const isConnectedToNodeWeb3Wrapper$ = state$ => {
  return Observable.create(observer => {
    Web3Wrapper.getInstance(
      state$.value.endpoint.networkInfo.name.toUpperCase()
    ).then(instance => {
      console.log(instance)
      instance.ob.nodeStatus$.subscribe(val => {
        if (Object.keys(val.error).length === 0) {
          // console.log('Msg: ', val)
          observer.next(val)
        } else {
          // console.log('Err: ', val)
          observer.next(val)
        }
      })
    })
  })
}

export const connectedToNodeEpic = (action$, state$) =>
  action$.ofType(TYPE_.CHECK_APP_IS_CONNECTED).switchMap(() => {
    return isConnectedToNodeWeb3Wrapper$(state$).pipe(
      tap(result => {
        // console.log(result)
        return result
      }),
      flatMap(result => {
        let actionsArray = Array(0)
        actionsArray = [
          Observable.of(
            Actions.app.updateAppStatus({
              ...result
            })
          )
        ]
        return Observable.concat(...actionsArray)
      })
    )
  })
