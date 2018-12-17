// Copyright 2016-2017 Rigo Investment Sagl.

import * as TYPE_ from '../../actions/const'
import { Actions } from '../../actions/'
import { BigNumber } from 'bignumber.js'
import { ERCdEX, Ethfinex } from '../../../_utils/const'
import { Observable, from, timer } from 'rxjs'
import {
  finalize,
  flatMap,
  map,
  mergeMap,
  retryWhen,
  takeUntil
} from 'rxjs/operators'
import { ofType } from 'redux-observable'
import utils from '../../../_utils/utils'

//
// GET DETAILS FOR A DRAGO
//

const getPoolsSingleDetails$ = (poolId, networkInfo, options, state$) => {
  return Observable.create(observer => {
    const getDetails = async () => {
      let poolDetails = {
        address: null,
        name: null,
        symbol: null,
        addressOwner: null,
        addressGroup: null,
        buyPrice: null,
        sellPrice: null,
        totalSupply: null,
        created: '-',
        balanceDRG: null
      }
      const { accounts } = state$.value.endpoint
      const list = Object.assign({}, state$.value.poolsList.list)
      try {
        let details
        if (typeof list[poolId] !== 'undefined') {
          poolDetails = { ...poolDetails, ...list[poolId].details }
          observer.next([list[poolId], { updateCache: false }])
        }
        try {
          details = await utils.getPoolDetailsFromId(poolId, networkInfo)
          if (options.poolType === 'drago') {
            poolDetails = {
              ...poolDetails,
              ...{
                address: details[0][0],
                name:
                  details[0][1].charAt(0).toUpperCase() +
                  details[0][1].slice(1),
                symbol: details[0][2],
                dragoId: new BigNumber(details[0][3]).toFixed(),
                addressOwner: details[0][4],
                addressGroup: details[0][5]
              }
            }
            observer.next([{ details: poolDetails }])
          } else {
            poolDetails = {
              ...poolDetails,
              ...{
                address: details[0][0],
                name:
                  details[0][1].charAt(0).toUpperCase() +
                  details[0][1].slice(1),
                symbol: details[0][2],
                vaultId: new BigNumber(details[0][3]).toFixed(),
                addressOwner: details[0][4],
                addressGroup: details[0][5]
              }
            }
            observer.next([{ details: poolDetails }])
          }
        } catch (err) {
          console.warn(err)
          observer.error(err)
        }

        try {
          poolDetails =
            options.poolType === 'drago'
              ? await utils.getDragoDetails(
                  details,
                  accounts,
                  networkInfo,
                  options
                )
              : await utils.getVaultDetails(
                  details,
                  accounts,
                  networkInfo,
                  options
                )

          observer.next([{ details: poolDetails }])
        } catch (err) {
          console.warn(err)
          observer.error(err)
        }
        try {
          poolDetails =
            options.poolType === 'drago'
              ? await utils.getDragoDetails(details, accounts, networkInfo, {
                  ...options,
                  dateOnly: true
                })
              : await utils.getVaultDetails(details, accounts, networkInfo, {
                  ...options,
                  dateOnly: true
                })

          observer.next([{ details: poolDetails }])
        } catch (err) {
          console.warn(err)
          observer.error(err)
        }
      } catch (err) {
        console.warn(err)
        observer.error(err)
      }
    }

    getDetails()

    return () => observer.complete()
  })
}

export const getPoolDetailsEpic = (action$, state$) => {
  return action$.pipe(
    ofType(TYPE_.POOLS_SINGLE_DETAILS_GET),
    mergeMap(action => {
      const { networkInfo, accounts } = state$.value.endpoint
      let i = 0
      return getPoolsSingleDetails$(
        action.payload.dragoId,
        networkInfo,
        action.payload.options,
        state$
      ).pipe(
        map(result => {
          return result.length === 1
            ? { details: result[0], meta: { updateCache: true } }
            : { details: result[0], meta: result[1] }
        }),
        flatMap(result => {
          let drago = action.payload.options.poolType === 'drago' ? true : false
          let options = {
            balance: true,
            supply: false,
            limit: 20,
            trader: !state$.value.user.isManager,
            drago
          }
          const { details, meta } = result

          let relayName
          switch (networkInfo.id) {
            case 1:
              relayName = Ethfinex
              break
            case 3:
              relayName = Ethfinex
              break
            case 42:
              relayName = ERCdEX
              break
            default:
              relayName = Ethfinex
          }
          const relay = {
            name: relayName
          }
          let actionsArray = []
          if (drago) {
            actionsArray.push(
              Actions.drago.updateDragoSelectedDetails(details, meta)
            )
            if (i === 0) {
              const { address } = details.details
              actionsArray.push(
                Actions.pools.getPoolsSingleTransactions(
                  address,
                  accounts,
                  options
                ),
                Actions.drago.getTokenBalancesDrago(address, relay)
              )
            }
          } else {
            actionsArray.push(
              Actions.vault.updateVaultSelectedDetails(details, meta)
            )
            if (i === 0) {
              actionsArray.push(
                Actions.pools.getPoolsSingleTransactions(
                  details.address,
                  accounts,
                  options
                )
              )
            }
          }
          i++
          return from(actionsArray)
        }),
        takeUntil(
          action$.pipe(
            ofType(
              TYPE_.DRAGO_SELECTED_DETAILS_RESET,
              TYPE_.VAULT_SELECTED_DETAILS_RESET
            )
          )
        ),
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
