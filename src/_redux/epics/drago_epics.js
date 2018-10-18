// Copyright 2016-2017 Rigo Investment Sagl.

import { Actions } from '../actions/'
import { Observable, from, merge } from 'rxjs'
import PoolApi from '../../PoolsApi/src'

import * as TYPE_ from '../actions/const'
import { catchError, flatMap, map, mergeMap, tap } from 'rxjs/operators'
import { ofType } from 'redux-observable'

import { BigNumber } from '../../../node_modules/bignumber.js/bignumber'
import { DEBUGGING, ERCdEX, Ethfinex } from '../../_utils/const'
import { ERC20_TOKENS } from '../../_utils/tokens'
import utils from '../../_utils/utils'

const getTokensBalances$ = (dragoAddress, api) => {
  //
  // Initializing Drago API
  //
  const poolApi = new PoolApi(api)
  try {
    poolApi.contract.drago.init(dragoAddress)
  } catch (err) {
    throw this._error
  }

  const getTokensBalances = async () => {
    let allowedTokens = ERC20_TOKENS[api._rb.network.name]
    let dragoAssets = {}
    for (let token in allowedTokens) {
      let balances = {
        token: new BigNumber(0),
        wrappers: {},
        total: new BigNumber(0)
      }
      if (allowedTokens[token].address !== '0x0') {
        let total = new BigNumber(0)
        try {
          balances.token = await poolApi.contract.drago.getTokenBalance(
            allowedTokens[token].address
          )
          // console.log(`${token} - ${allowedTokens[token].address} -> ${balances.token}`)
          total = total.plus(balances.token)
          if (typeof allowedTokens[token].wrappers !== 'undefined') {
            for (let wrapper in allowedTokens[token].wrappers) {
              balances.wrappers[
                wrapper
              ] = await poolApi.contract.drago.getTokenBalance(wrapper.address)
              total = total.plus(balances.wrappers[wrapper])
            }
          }
          // Only add tokens with balance > 0
          if (!total.eq(0)) {
            balances.total = total
            dragoAssets[token] = allowedTokens[token]
            dragoAssets[token].balances = balances
          }
        } catch (err) {
          console.log(err)
          throw err
        }
      } else {
      }
    }
    return dragoAssets
  }
  return from(
    getTokensBalances().catch(err => {
      throw err
    })
  )
}

export const getTokensBalancesEpic = action$ => {
  return action$.pipe(
    ofType(TYPE_.GET_TOKEN_BALANCES_DRAGO),
    mergeMap(action => {
      return getTokensBalances$(
        action.payload.dragoDetails,
        action.payload.api
      ).pipe(
        map(dragoAssets => {
          const ordered = {}
          Object.keys(dragoAssets)
            .sort()
            .forEach(function(key) {
              ordered[key] = dragoAssets[key]
            })
          return ordered
        }),
        tap(val => {
          console.log(val)
          return val
        }),
        mergeMap(dragoAssets =>
          Observable.concat(
            // Observable.of(
            //   Actions.drago.getAssetsPriceData(
            //     dragoAssets,
            //     42,
            //     ERC20_TOKENS['kovan'].WETH.address
            //   )
            // ),
            // Observable.of({
            //   type: UPDATE_ELEMENT_LOADING,
            //   payload: { marketBox: true }
            // }),
            Observable.of(
              Actions.drago.updateSelectedDrago({
                assets: Object.values(dragoAssets)
              })
            ),
            Observable.of(
              Actions.tokens.priceTickersStart(
                action.payload.relay,
                action.payload.api._rb.network.id
              )
            ),
            Observable.of(
              Actions.exchange.getPortfolioChartDataStart(
                action.payload.relay,
                action.payload.api._rb.network.id
              )
            )
            // Observable.of({
            //   type: UPDATE_ELEMENT_LOADING,
            //   payload: { marketBox: false }
            // })
          )
        ),
        catchError(error => {
          console.log(error)
          return Observable.of({
            type: TYPE_.QUEUE_ERROR_NOTIFICATION,
            payload: 'Error fetching fund assets balances.'
          })
        })
      )
    })
  )
}

//
// GET DETAILS FOR A DRAGO
//

const getPoolDetails$ = (dragoId, api, state$) => {
  return Observable.create(observer => {
    let dragoDetails

    utils
      .getDragoDetailsFromId(dragoId, api)
      .then(details => {
        dragoDetails = details
        return observer.next({
          address: details[0][0],
          name: details[0][1].charAt(0).toUpperCase() + details[0][1].slice(1),
          symbol: details[0][2],
          dragoId: details[0][3].toFixed(),
          addressOwner: details[0][4],
          addressGroup: details[0][5]
        })
      })
      .then(() => {
        const accounts = state$.value.endpoint.accounts
        utils.getDragoDetails(dragoDetails, accounts, api).then(details => {
          console.log(details)
          return observer.next(details)
        })
      })
      .catch(error => {
        return observer.error(error)
      })
  })
}

export const getPoolDetailsEpic = (action$, state$) => {
  return action$.pipe(
    ofType(TYPE_.GET_DRAGO_DETAILS),
    mergeMap(action => {
      console.log(action)
      return getPoolDetails$(
        action.payload.dragoId,
        action.payload.api,
        state$
      ).pipe(
        flatMap(details => {
          console.log(details)
          let options = {
            balance: true,
            supply: false,
            limit: 20,
            trader: !state$.value.user.isManager,
            drago: action.payload.options.poolType === 'drago' ? true : false
          }
          let relayName
          switch (action.payload.api._rb.network.id) {
            case 1:
              relayName = Ethfinex
              break
            case 3:
              relayName = Ethfinex
              break
            case 42:
              relayName = ERCdEX
              break
          }
          const relay = {
            name: relayName
          }
          if (typeof details.totalSupply !== 'undefined')
            return Observable.concat(
              Observable.of(Actions.drago.updateSelectedDrago({ details })),
              Observable.of(
                Actions.drago.getPoolTransactions(
                  action.payload.api,
                  details.address,
                  state$.value.endpoint.accounts,
                  options
                )
              ),
              Observable.of(
                Actions.drago.getTokenBalancesDrago(
                  details.address,
                  action.payload.api,
                  relay
                )
              )
            )
          return Observable.concat(
            Observable.of(Actions.drago.updateSelectedDrago({ details }))
          )

          // return DEBUGGING.DUMB_ACTION
        }),
        catchError(error => {
          console.log(error)
          return Observable.of({
            type: TYPE_.QUEUE_ERROR_NOTIFICATION,
            payload: 'Error fetching Drago details.'
          })
        })
      )
    })
  )
}
