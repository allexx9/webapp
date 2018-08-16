// Copyright 2016-2017 Rigo Investment Sagl.

import { Observable } from 'rxjs/Observable'
import 'rxjs/add/observable/from';
import 'rxjs/add/operator/delay';
import 'rxjs/add/operator/mapTo';
import 'rxjs/add/operator/bufferTime';
import 'rxjs/add/operator/map';
import 'rxjs/add/operator/do';
import 'rxjs/add/operator/concat';
import 'rxjs/add/operator/mergeMap';
import 'rxjs/add/operator/exhaustMap';
import 'rxjs/add/observable/timer'
import 'rxjs/observable/timer'
import PoolApi from '../../PoolsApi/src'
import { Actions } from '../actions/'

import {
  GET_TOKEN_BALANCES_DRAGO,
  ADD_ERROR_NOTIFICATION
} from '../actions/const'

import {
  ERC20_TOKENS
} from '../../_utils/tokens'


const getTokensBalances$ = (dragoDetails, api) => {
  //
  // Initializing Drago API
  //      
  const poolApi = new PoolApi(api)
  const dragoAddress = dragoDetails[0][0]
  poolApi.contract.drago.init(dragoAddress)

  const getTokensBalances = async () => {
    let allowedTokens = ERC20_TOKENS[api._rb.network.name]
    let dragoAssets = {}
    for (let token in allowedTokens) {
      if (allowedTokens[token].address !== "0x") {
        try {
          let balance = await poolApi.contract.drago.getTokenBalance(allowedTokens[token].address)
          if (!balance.eq(0) ) {
            dragoAssets[token] = allowedTokens[token]
            dragoAssets[token].balance = balance
          }
        } catch (err) {
          console.log(err)
          // dragoAssets[token].balance = 0
        }
      } else {
        // dragoAssets[token].balance = 0
      }
    }
    console.log(dragoAssets)

    return dragoAssets
  }
  return Observable
    .fromPromise(getTokensBalances())
}

export const getTokensBalancesEpic = (action$) => {
  return action$.ofType(GET_TOKEN_BALANCES_DRAGO)
    .mergeMap((action) => {
      return getTokensBalances$(
        action.payload.dragoDetails,
        action.payload.api,
      )
        .mergeMap(dragoAssets =>
          Observable.concat(
            Observable.of(
              Actions.drago.getAssetsPriceDataAction(
                dragoAssets,
                42,
                ERC20_TOKENS['kovan'].WETH.address
              )
            ),
            Observable.of(
              Actions.drago.updateSelectedDragoAction(
                { assets: Object.values(dragoAssets) }
              )
            ),
          )
        )
        .catch(() => {
          return Observable.of({
            type: ADD_ERROR_NOTIFICATION,
            payload: 'Error fetching fund assets balances.'
          })
        }
        )
    });
}