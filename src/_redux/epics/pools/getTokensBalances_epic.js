// Copyright 2016-2017 Rigo Investment Sagl.

import * as TYPE_ from '../../actions/const'
import { Actions } from '../../actions'
import { catchError, flatMap, map, mergeMap } from 'rxjs/operators'
import { from, of } from 'rxjs'
import { ofType } from 'redux-observable'
// import { DEBUGGING } from '../../_utils/const'
import { ERC20_TOKENS } from '../../../_utils/tokens'
import { getTokensBalances } from '../../../_utils/pools/getTokensBalances'
import Web3Wrapper from '../../../_utils/web3Wrapper/src'
import utils from '../../../_utils/utils'

const getTokensBalances$ = (dragoAddress, networkInfo) => {
  const allowedTokens = ERC20_TOKENS[networkInfo.name]
  const web3 = Web3Wrapper.getInstance(networkInfo.id)

  return from(
    getTokensBalances(dragoAddress, allowedTokens, web3).catch(err => {
      console.warn(err)
      throw err
    })
  )
}

export const getTokensBalancesEpic = (action$, state$) => {
  return action$.pipe(
    ofType(TYPE_.GET_TOKEN_BALANCES_DRAGO),
    mergeMap(action => {
      const { networkInfo } = state$.value.endpoint
      return getTokensBalances$(action.payload.dragoDetails, networkInfo).pipe(
        map(dragoAssets => {
          const ordered = {}
          Object.keys(dragoAssets)
            .sort()
            .forEach(function(key) {
              ordered[key] = dragoAssets[key]
            })
          return ordered
        }),
        map(dragoAssets => {
          if (state$.value.app.config.isMock) {
            if (
              Object.keys(state$.value.transactionsDrago.selectedDrago.assets)
                .length === 0
            ) {
              dragoAssets = utils.generateMockAssets(networkInfo.name)
            }
          }
          return dragoAssets
        }),
        flatMap(dragoAssets => {
          const actionsArray = [
            Actions.drago.updateDragoSelectedDetails({
              assets: Object.values(dragoAssets)
            }),
            Actions.tokens.priceTickersStart(
              action.payload.relay,
              networkInfo.id,
              dragoAssets
            )
          ]
          if (action.payload.relay.name === 'Ethfinex') {
            actionsArray.push(
              Actions.exchange.getPortfolioChartDataStart(
                action.payload.relay,
                networkInfo.id
              )
            )
          }
          return from(actionsArray)
        }),
        catchError(error => {
          console.warn(error)
          return of({
            type: TYPE_.QUEUE_ERROR_NOTIFICATION,
            payload: 'Error fetching fund assets balances.'
          })
        })
      )
    })
  )
}
