// Copyright 2016-2017 Rigo Investment Sagl.

// import { Observable } from 'rxjs';
import * as TYPE_ from '../../actions/const'
import { Actions } from '../../actions/'
import { Observable, timer } from 'rxjs'
import {
  delay,
  distinctUntilChanged,
  finalize,
  map,
  mergeMap,
  retryWhen,
  tap
} from 'rxjs/operators'
import Web3Wrapper from '../../../_utils/web3Wrapper/src'
import shallowEqualObjects from 'shallow-equal/objects'
import shallowequal from 'shallowequal'

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
        tap(val => console.log('DEBUG status value', val)),
        distinctUntilChanged((a, b) => {
          console.log('DEBUG OLD VALUE', a)
          console.log('DEBUG NEW VALUE', b)
          console.log('DEBUG RESULT', JSON.stringify(a) === JSON.stringify(b))
          return JSON.stringify(a) === JSON.stringify(b)
        })
      )
    }),
    tap(res => console.log('DEBUG TAP RESULT: ', res)),
    map(res => Actions.app.updateAppStatus(res))
    // mergeMap(res => {
    //   let actionsArray = Array(0)
    //   actionsArray = [
    //     Observable.of(
    //       Actions.app.updateAppStatus({
    //         ...res
    //       })
    //     )
    //   ]
    //   return Observable.concat(...actionsArray)
    // }),
  )

// export const connectedToNodeEpic = (action$, state$) =>
//   action$.ofType(TYPE_.CHECK_APP_IS_CONNECTED).switchMap(() => {
//     return isConnectedToNodeWeb3Wrapper$(state$).pipe(
//       tap(result => {
//         // console.log(result)
//         return result
//       }),
// distinctUntilChanged((a, b) => {
//   // console.log(JSON.stringify(a), JSON.stringify(b))
//   // console.log(shallowequal(JSON.stringify(a), JSON.stringify(b)))
//   return shallowequal(JSON.stringify(a), JSON.stringify(b))
// }),
// mergeMap(result => {
//   let actionsArray = Array(0)
//   // console.log('connectedToNodeEpic')
//   actionsArray = [
//     Observable.of(
//       Actions.app.updateAppStatus({
//         ...result
//       })
//     )
//   ]
//   return Observable.concat(...actionsArray)
// }),
//       retryWhen(error => {
//         let scalingDuration = 5000
//         return error.pipe(
//           mergeMap((error, i) => {
//             console.warn(error)
//             return timer(scalingDuration)
//           }),
//           finalize(() => console.log('We are done!'))
//         )
//       })
//     )
//   })
