// Copyright 2016-2017 Rigo Investment Sagl.

import * as TYPE_ from '../../actions/const'
import { Actions } from '../../actions/'
import { BigNumber } from 'bignumber.js'
import { from, timer } from 'rxjs'
import { finalize, flatMap, map, mergeMap, retryWhen } from 'rxjs/operators'
import { ofType } from 'redux-observable'
import utils from '../../../_utils/utils'
import { formatCoins, formatEth } from '../../../_utils/format'

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
        map(poolsArray => {
          const formattedArray = poolsArray.map(pool => {
            const [
              name,
              symbol,
              sellPrice,
              buyPrice,
              owner,
              feeCollector,
              dragoDao,
              ratio,
              transactionFee,
              totalSupply,
              ethBalance,
              minPeriod,
              id,
              ,
            ] = pool
            return {
              id,
              name: name.charAt(0).toUpperCase() + name.slice(1),
              symbol: symbol,
              addressOwner: owner.toLowerCase(),
              addressDao: dragoDao.toLowerCase(),
              sellPrice: formatEth(sellPrice, 4),
              buyPrice: formatEth(buyPrice, 4),
              totalSupply: formatCoins(new BigNumber(totalSupply), 4),
              totalSupplyBaseUnits: new BigNumber(totalSupply),
              dragoETHBalance: formatEth(ethBalance, 4),
              dragoETHBalanceWei: new BigNumber(ethBalance),
              minPeriod,
              ratio,
              transactionFee,
              feeCollector: feeCollector.toLowerCase()

            }
          })

          return formattedArray
        }),
        flatMap(poolsArray => {
          let actionsArray = poolsArray.map(pool => {
            const payload = {
              payload: { details: { ...pool } },
              meta: { poolId: pool.id }
            }
            return Actions.pools.writeItemPoolsList(payload)
          }
          )
          return from(actionsArray)
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
