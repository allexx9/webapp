// Copyright 2016-2017 Rigo Investment Sagl.

// import { Observable } from 'rxjs';
import * as TYPE_ from '../actions/const'
import { Actions } from '../actions'
import {
  DEBUGGING,
  INFURA,
  LOCAL,
  MSG_NETWORK_STATUS_ERROR,
  MSG_NETWORK_STATUS_OK,
  NETWORK_OK,
  NETWORK_WARNING,
  RIGOBLOCK
} from '../../_utils/const'
import { Interfaces } from '../../_utils/interfaces'
import { Observable, defer, from, merge, timer } from 'rxjs'
import {
  catchError,
  concat,
  delay,
  exhaustMap,
  filter,
  finalize,
  flatMap,
  map,
  mergeMap,
  retryWhen,
  switchMap,
  takeUntil,
  tap,
  timeout
} from 'rxjs/operators'
import { ofType } from 'redux-observable'
import { sha3_512 } from 'js-sha3'
import BigNumber from 'bignumber.js'
import PoolsApi from '../../PoolsApi/src'
import utils from '../../_utils/utils'
// import { race } from 'rxjs/observable/race';

//
// FETCH LIST OF DRAGOS
//

const getChunkedEvents$ = (api, options, state$) => {
  return Observable.create(observer => {
    let startBlock =
      state$.value.transactionsDrago.dragosList.lastFetchRange.lastBlock
    // console.log(fromBlock)
    const poolApi = new PoolsApi(api)
    if (startBlock === 0) {
      switch (api._rb.network.id) {
        case 1:
          startBlock = '6000000'
          break
        case 42:
          startBlock = '7000000'
          break
        case 3:
          startBlock = '3000000'
          break
        default:
          '3000000'
      }
    }

    const logToEvent = log => {
      // const key = api.util.sha3(JSON.stringify(log))
      const { params } = log
      return {
        symbol: params.symbol.value,
        dragoId: params.dragoId.value.toFixed(),
        name: params.name.value,
        address: params.drago.value
      }
    }

    poolApi.contract.dragoeventful.init().then(() => {
      api.eth.blockNumber().then(lastBlock => {
        lastBlock = lastBlock.toFixed()
        let chunck = 100000
        console.log(startBlock, lastBlock, chunck)
        const chunks = utils.blockChunks(startBlock, lastBlock, chunck)
        console.log(chunks)
        chunks.map(async (chunk, key) => {
          // Pushing chunk logs into array
          let options = {
            topics: [
              poolApi.contract.dragoeventful.hexSignature.DragoCreated,
              null,
              null,
              null
            ],
            fromBlock: chunk.fromBlock,
            toBlock: chunk.toBlock
          }
          poolApi.contract.dragoeventful
            .getAllLogs(options)
            .then(dragoCreatedLogs => {
              const list = [].concat(dragoCreatedLogs.map(logToEvent))
              let result = {
                list,
                lastFetchRange: {
                  chunk: {
                    key: key,
                    toBlock:
                      chunk.toBlock === 'latest'
                        ? Number(lastBlock)
                        : Number(chunk.toBlock),
                    fromBlock: chunk.fromBlock
                  },
                  startBlock: Number(startBlock),
                  lastBlock: Number(lastBlock)
                }
              }
              // console.log(result)
              return observer.next(result)
            })
            .catch(error => {
              return observer.error(error)
            })
        })
      })
    })
  })
}

const getDragosList$ = (api, options, state$) => {
  return getChunkedEvents$(api, options, state$)
}

export const getDragosListEpic = (action$, state$) =>
  action$.pipe(
    ofType(TYPE_.GET_DRAGOS_SEARCH_LIST),
    mergeMap(action => {
      return getDragosList$(
        action.payload.api,
        action.payload.options,
        state$
      ).pipe(
        map(results => {
          // console.log(results)
          // console.log(new Map(results.list))
          // console.log(new Map([[1, 2], [2, 3]]))
          // console.log(results.list)
          return Actions.drago.updateDragosSearchList(results)
        }),
        catchError(error => {
          console.warn(error)
          return Observable.of({
            type: TYPE_.QUEUE_ERROR_NOTIFICATION,
            payload: 'Error fetching list of dragos.'
          })
        })
      )
    })
  )

//
// FETCH ACCOUNT TRANSACTIONS
//

const getPoolTransactions$ = (api, dragoAddress, accounts, options) => {
  return options.drago
    ? from(
        utils.getTransactionsDragoOptV2(api, dragoAddress, accounts, options)
      )
    : from(
        utils.getTransactionsVaultOptV2(api, dragoAddress, accounts, options)
      )
}

export const getAccountsTransactionsEpic = action$ =>
  action$.pipe(
    ofType(TYPE_.GET_ACCOUNTS_TRANSACTIONS),
    mergeMap(action => {
      return getPoolTransactions$(
        action.payload.api,
        action.payload.dragoAddress,
        action.payload.accounts,
        action.payload.options
      ).pipe(
        tap(results => {
          console.log(results)
          return results
        }),
        map(results => {
          if (action.payload.options.drago) {
            if (!action.payload.options.trader) {
              return Actions.drago.updateTransactionsDragoManager(
                results.length === 0 ? [Array(0), Array(0), Array(0)] : results
              )
            }
            return Actions.drago.updateTransactionsDragoHolder(results)
            // return DEBUGGING.DUMB_ACTION
          } else {
            // if (!action.payload.options.trader) {
            //   return Actions.drago.updateTransactionsVaultManager(
            //     results.length === 0 ? [Array(0), Array(0), Array(0)] : results
            //   )
            // }
            // return Actions.drago.updateTransactionsVaultHolder(results)
            return DEBUGGING.DUMB_ACTION
          }
        }),
        retryWhen(error => {
          console.log(error)
          console.log('getAccountsTransactionsEpic')
          let scalingDuration = 3000
          return error.pipe(
            mergeMap((error, i) => {
              const retryAttempt = i + 1
              // if maximum number of retries have been met
              // or response is a status code we don't wish to retry, throw error
              // if (
              //   retryAttempt > maxRetryAttempts ||
              //   excludedStatusCodes.find(e => e === error.status)
              // ) {
              //   throw(error);
              // }
              // const _rb = window.web3._rb
              // window.web3 = new Web3(window.web3.currentProvider)
              // window.web3._rb = _rb
              console.log(`getAccountsTransactionsEpic Attempt ${retryAttempt}`)
              // retry after 1s, 2s, etc...
              return timer(scalingDuration)
            }),
            finalize(() => console.log('We are done!'))
          )
        })
        // catchError(error => {
        //   console.warn(error)
        //   return Observable.of({
        //     type: TYPE_.QUEUE_ERROR_NOTIFICATION,
        //     payload: 'Error fetching account transactions.'
        //   })
        // })
      )
    })
  )

//
// FETCH POOL TRANSACTIONS
//

export const getPoolTransactionsEpic = action$ =>
  action$.pipe(
    ofType(TYPE_.GET_POOL_TRANSACTIONS),
    mergeMap(action => {
      console.log(action.payload)
      return getPoolTransactions$(
        action.payload.api,
        action.payload.dragoAddress,
        action.payload.accounts,
        action.payload.options
      ).pipe(
        tap(results => {
          console.log(results)
          return results
        }),
        map(results => {
          if (action.payload.options.drago) {
            return Actions.drago.updateSelectedDrago({
              transactions: results
            })
          } else {
            return Actions.drago.updateSelectedVault({
              transactions: results
            })
          }
          // return DEBUGGING.DUMB_ACTION
        }),
        catchError(error => {
          console.warn(error)
          return Observable.of({
            type: TYPE_.QUEUE_ERROR_NOTIFICATION,
            payload: 'Error fetching account transactions.'
          })
        })
      )
    })
  )
