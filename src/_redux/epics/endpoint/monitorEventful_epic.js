// Copyright 2016-2017 Rigo Investment Sagl.

// import { Observable } from 'rxjs';
import * as TYPE_ from '../../actions/const'
// import { Actions } from '../../actions'
import { DEBUGGING } from '../../../_utils/const'
import { Observable, merge, of, timer,   concat, } from 'rxjs'
import {
  finalize,
  flatMap,
  mergeMap,
  retryWhen,
  takeUntil,
  tap
} from 'rxjs/operators'
import { ofType } from 'redux-observable'
import Web3Wrapper from '../../../_utils/web3Wrapper/src'

//
// SUBSCRIBES TO EVENTFULL CONTRACTS AND EMIT NEW EVENTS
//

const monitorEventful$ = state$ => {
  return merge(
    Observable.create(observer => {
      const api = Web3Wrapper.getInstance(state$.value.endpoint.networkInfo.id)
      const subscription = api.rigoblock.ob.eventful$.subscribe(val => {
        return observer.next(val)
      })
      return () => subscription.unsubscribe
    })
  )
}

export const monitorEventfulEpic = (action$, state$) => {
  return action$.pipe(
    ofType(TYPE_.MONITOR_ACCOUNTS_START),
    mergeMap(action => {
      return monitorEventful$(state$).pipe(
        takeUntil(action$.pipe(ofType(TYPE_.MONITOR_ACCOUNTS_STOP))),
        tap(val => {
          console.log(val)
          return val
        }),
        flatMap(() => {
          const observablesArray = Array(0)
          // const currentState = state$.value
          observablesArray.push(of(DEBUGGING.DUMB_ACTION))
          // if (currentState.transactionsDrago.selectedDrago.details.dragoId) {
          //   console.log('Account monitoring - > DRAGO details fetch.')
          //   observablesArray.push(
          //     of(
          //       Actions.drago.getPoolDetails(
          //         currentState.transactionsDrago.selectedDrago.details.dragoId,
          //
          //         {
          //           poolType: 'drago'
          //         }
          //       )
          //     )
          //   )
          // }

          // if (currentState.transactionsVault.selectedVault.details.vaultId) {
          //   console.log('Account monitoring - > VAULT details fetch.')
          //   observablesArray.push(
          //     of(
          //       Actions.drago.getPoolDetails(
          //         currentState.transactionsVault.selectedVault.details.vaultId,

          //         {
          //           poolType: 'vault'
          //         }
          //       )
          //     )
          //   )
          // }
          return concat(...observablesArray)
        }),
        retryWhen(error => {
          console.log('monitorEventfulEpic')
          let scalingDuration = 10000
          return error.pipe(
            mergeMap((error, i) => {
              console.warn(error)
              const retryAttempt = i + 1
              console.log(`monitorEventfulEpic Attempt ${retryAttempt}`)
              return timer(scalingDuration)
            }),
            finalize(() => console.log('We are done!'))
          )
        })
        // catchError(error => {
        //   console.log(error)
        //   return of({
        //     type: TYPE_.QUEUE_ERROR_NOTIFICATION,
        //     payload: 'Error: cannot subscribe to eventful.'
        //   })
        // })
      )
    })
  )
}
