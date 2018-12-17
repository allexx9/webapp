// Copyright 2016-2017 Rigo Investment Sagl.

import * as TYPE_ from '../actions/const'
import { Actions } from '../actions'
// import { DEBUGGING } from '../../_utils/const'
import * as utils from '../../_utils/pools'
import { Observable, from, of, timer } from 'rxjs'
import {
  catchError,
  finalize,
  map,
  mergeMap,
  retryWhen,
  takeUntil
} from 'rxjs/operators'
import { getBlockChunks } from '../../_utils/blockChain'
import { getFromBlock, getWeb3 } from '../../_utils/misc'
import { ofType } from 'redux-observable'
import BigNumber from 'bignumber.js'
import PoolsApi from '../../PoolsApi/src'

//
// FETCH LIST OF DRAGOS
//

const getPoolsChunkedEvents$ = (options, state$) => {
  return Observable.create(observer => {
    let { startBlock, lastBlock } = state$.value.poolsList.lastFetchRange
    let { networkInfo } = state$.value.endpoint
    const web3 = getWeb3(networkInfo)
    const poolApi = new PoolsApi(web3)
    startBlock === 0
      ? (startBlock = getFromBlock(networkInfo))
      : (startBlock = lastBlock)

    const logToEvent = log => {
      const hexToString = hex => {
        let string = ''
        for (let i = 0; i < hex.length; i += 2) {
          string += String.fromCharCode(parseInt(hex.substr(i, 2), 16))
        }
        return string
      }
      const { returnValues } = log
      let symbol
      if (typeof returnValues.symbol === 'string') {
        '0x' === returnValues.symbol.substring(0, 2)
          ? (symbol = hexToString(returnValues.symbol.substring(2)))
          : (symbol = returnValues.symbol)
      } else {
        for (let i = 0; i < returnValues.symbol.length; ++i) {
          symbol += String.fromCharCode(returnValues.symbol[i])
        }
      }
      let id = returnValues.dragoId || returnValues.vaultId
      let poolType = returnValues.dragoId ? 'drago' : 'vault'
      return {
        symbol,
        id,
        name: returnValues.name,
        address: returnValues.drago,
        poolType
      }
    }

    Promise.all([
      poolApi.contract.vaulteventful.init(),
      poolApi.contract.dragoeventful.init(),
      web3.eth.getBlockNumber()
    ])
      .then(async results => {
        lastBlock = new BigNumber(results[2]).toNumber()
        let chunck = 250000
        let chunks
        try {
          chunks = await getBlockChunks(startBlock, lastBlock, chunck, web3)
        } catch (err) {
          return observer.error(err)
        }
        let i = 0
        chunks.map(async (chunk, key) => {
          let optionsVault = {
            topics: [
              poolApi.contract.vaulteventful.hexSignature.VaultCreated,
              null,
              null,
              null
            ],
            fromBlock: chunk.fromBlock,
            toBlock: chunk.toBlock
          }
          let optionsDrago = {
            topics: [
              poolApi.contract.dragoeventful.hexSignature.DragoCreated,
              null,
              null,
              null
            ],
            fromBlock: chunk.fromBlock,
            toBlock: chunk.toBlock
          }
          const vaultPromise = poolApi.contract.vaulteventful.getAllLogs(
            optionsVault
          )
          const dragoPromise = poolApi.contract.dragoeventful.getAllLogs(
            optionsDrago
          )
          try {
            const [logsVault, logsDrago] = await Promise.all([
              vaultPromise,
              dragoPromise
            ])
            i++
            const list = [...logsVault, ...logsDrago].map(logToEvent)
            let listId = {}
            list.forEach(pool => {
              listId[pool.id] = { details: pool }
            })
            let result = {
              list: listId,
              lastFetchRange: {
                chunk: {
                  key: key,
                  total: chunks.length,
                  progress: i / chunks.length,
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

            observer.next(result)
          } catch (err) {
            return observer.error(err)
          }
        })
      })
      .catch(err => {
        return observer.error(err)
      })
  })
}

export const getPoolsListEpic = (action$, state$) =>
  action$.pipe(
    ofType(TYPE_.POOLS_LIST_GET),
    mergeMap(action => {
      return getPoolsChunkedEvents$(action.payload.options, state$).pipe(
        map(results => {
          return Actions.pools.updatePoolsList(results)
        }),
        catchError(error => {
          console.warn(error)
          return of({
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

const getPoolsSingleTransactions$ = (
  networkInfo,
  dragoAddress,
  accounts,
  options
) => {
  return options.drago
    ? from(
        utils.getTransactionsDragoOptV2(
          networkInfo,
          dragoAddress,
          accounts,
          options
        )
      )
    : from(
        utils.getTransactionsVaultOptV2(
          networkInfo,
          dragoAddress,
          accounts,
          options
        )
      )
}

export const getAccountsTransactionsEpic = (action$, state$) => {
  return action$.pipe(
    ofType(TYPE_.GET_ACCOUNTS_TRANSACTIONS),
    mergeMap(action => {
      const { networkInfo } = state$.value.endpoint
      return getPoolsSingleTransactions$(
        networkInfo,
        action.payload.dragoAddress,
        action.payload.accounts,
        action.payload.options
      ).pipe(
        map(results => {
          if (action.payload.options.drago) {
            if (!action.payload.options.trader) {
              return Actions.drago.updateDragoTransactionsManager(
                results.length === 0 ? [Array(0), Array(0), Array(0)] : results
              )
            }
            return Actions.drago.updateDragoTransactionsHolder(results)
            // return DEBUGGING.DUMB_ACTION
          } else {
            if (!action.payload.options.trader) {
              return Actions.vault.updateVaultTransactionsManager(
                results.length === 0 ? [Array(0), Array(0), Array(0)] : results
              )
            }
            return Actions.vault.updateVaultTransactionsHolder(results)
            // return DEBUGGING.DUMB_ACTION
          }
        }),
        retryWhen(error => {
          console.warn('getAccountsTransactionsEpic error')
          let scalingDuration = 10000
          return error.pipe(
            mergeMap((error, i) => {
              console.warn(error)
              return timer(scalingDuration)
            }),
            finalize(() => console.log('We are done!'))
          )
        })
      )
    })
  )
}

//
// FETCH POOL TRANSACTIONS
//

export const getPoolTransactionsEpic = (action$, state$) =>
  action$.pipe(
    ofType(TYPE_.POOLS_SINGLE_TRANSACTIONS_GET),
    mergeMap(action => {
      const { networkInfo } = state$.value.endpoint
      return getPoolsSingleTransactions$(
        networkInfo,
        action.payload.dragoAddress,
        action.payload.accounts,
        action.payload.options
      ).pipe(
        map(results => {
          if (action.payload.options.drago) {
            return Actions.drago.updateDragoSelectedDetails({
              transactions: results
            })
          } else {
            return Actions.vault.updateVaultSelectedDetails({
              transactions: results
            })
          }
        }),
        takeUntil(
          action$.pipe(
            ofType(
              TYPE_.DRAGO_SELECTED_DETAILS_RESET,
              TYPE_.VAULT_SELECTED_DETAILS_RESET
            )
          )
        ),
        catchError(error => {
          console.warn(error)
          return of({
            type: TYPE_.QUEUE_ERROR_NOTIFICATION,
            payload: 'Error fetching account transactions.'
          })
        })
      )
    })
  )
