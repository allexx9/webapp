// Copyright 2016-2017 Rigo Investment Sagl.

import * as TYPE_ from '../../actions/const'
import { Actions } from '../../actions/'
import { BigNumber } from 'bignumber.js'
import { Observable, from, timer } from 'rxjs'
import { finalize, flatMap, map, mergeMap, retryWhen } from 'rxjs/operators'
import { ofType } from 'redux-observable'
import utils from '../../../_utils/utils'

//
// GET DETAILS FOR A GROUP OF POOLS
//

const getPoolsGroupDetails$ = (poolsIdArray, networkInfo) => {
  return from(utils.getPoolsGroupDetails(poolsIdArray, networkInfo))
}

export const getPoolsGroupDetailsEpic = (action$, state$) => {
  return action$.pipe(
    ofType(TYPE_.POOLS_GROUP_DETAILS_GET),
    mergeMap(action => {
      const { networkInfo } = state$.value.endpoint
      return getPoolsGroupDetails$(
        action.payload.poolsIdArray,
        networkInfo,
        state$
      ).pipe(
        map(results => {
          console.log(results)
          return results
        }),
        flatMap(results => {
          let actionsArray = results.map(pool => {
            Actions.drago.updateDragoSelectedDetails(pool)
          })
          return from(actionsArray)
        })
        // retryWhen(error => {
        //   let scalingDuration = 5000
        //   return error.pipe(
        //     mergeMap(error => {
        //       console.warn(error)
        //       return timer(scalingDuration)
        //     }),
        //     finalize(() => console.log('We are done!'))
        //   )
        // })
      )
    }),
    retryWhen(error => {
      let scalingDuration = 5000
      return error.pipe(
        mergeMap(error => {
          console.warn(error)
          return timer(scalingDuration)
        }),
        finalize(() => console.log('We are done!'))
      )
    })
  )
}
