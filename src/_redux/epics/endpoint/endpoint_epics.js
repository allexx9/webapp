// Copyright 2016-2017 Rigo Investment Sagl.

// import { Observable } from 'rxjs';
import * as TYPE_ from '../../actions/const'
import { Actions } from '../../actions'
import { DEBUGGING, INFURA, LOCAL, RIGOBLOCK } from '../../../_utils/const'
import { Interfaces } from '../../../_utils/interfaces'
import { Observable, defer, from, timer } from 'rxjs'
import {
  catchError,
  delay,
  exhaustMap,
  filter,
  finalize,
  map,
  mergeMap,
  retryWhen,
  switchMap,
  takeUntil,
  tap
} from 'rxjs/operators'
import { ofType } from 'redux-observable'
import { sha3_512 } from 'js-sha3'
import BigNumber from 'bignumber.js'
import PoolApi from '../../../PoolsApi/src'
import Web3 from 'web3'
import Web3Wrapper from '../../../_utils/web3Wrapper/src'
import utils from '../../../_utils/utils'

//
// CONNECT TO SOURCES OF ACCOUNTS AND POPULATE STATE WITH ACCOUNTS DATA
//

const attachInterfacePromise = async (api, endpoint) => {
  const selectedEndpointName = endpoint.endpointInfo.name
  const networkId = endpoint.networkInfo.id
  const blockchain = new Interfaces(api, networkId)
  let newEndpoint
  switch (selectedEndpointName) {
    case INFURA:
      console.log(`endpoint_epic -> ${INFURA}`)
      newEndpoint = await blockchain.attachInterfaceInfuraV2(api, networkId)
      break
    case RIGOBLOCK:
      console.log(`endpoint_epic -> ${RIGOBLOCK}`)
      newEndpoint = await blockchain.attachInterfaceRigoBlockV2(api, networkId)
      break
    case LOCAL:
      console.log(`endpoint_epic -> ${LOCAL}`)
      newEndpoint = await blockchain.attachInterfaceRigoBlockV2(api, networkId)
      break
    default:
      console.log(`endpoint_epic -> ${INFURA}`)
      newEndpoint = await blockchain.attachInterfaceInfuraV2(api, networkId)
      break
  }
  // console.log(newEndpoint)
  // throw new Error('error')
  return newEndpoint
}

const attachInterface$ = (api, endpoint) => {
  return defer(() =>
    attachInterfacePromise(api, endpoint).catch(error => error)
  )
}

export const attacheInterfaceEpic = action$ =>
  action$.pipe(
    ofType(TYPE_.ATTACH_INTERFACE),
    switchMap(action => {
      return attachInterface$(action.payload.api, action.payload.endpoint).pipe(
        mergeMap(endpoint => {
          return Observable.concat(
            Observable.of(
              Actions.app.updateAppStatus({
                appLoading: false
                // isConnected: true
              })
            ),
            Observable.of(Actions.endpoint.updateInterface(endpoint))
            // Observable.of(
            //   Actions.endpoint.monitorAccountsStart(
            //     action.payload.web3,
            //     action.payload.api
            //   )
            // )
          )
        })
      )
    }),
    retryWhen(error => {
      let scalingDuration = 1000
      return error.pipe(
        mergeMap((error, i) => {
          console.warn(error)
          const retryAttempt = i + 1
          // if maximum number of retries have been met
          // or response is a status code we don't wish to retry, throw error
          // if (
          //   retryAttempt > maxRetryAttempts ||
          //   excludedStatusCodes.find(e => e === error.status)
          // ) {
          //   throw(error);
          // }
          console.log(`Attempt ${retryAttempt}`)
          // retry after 1s, 2s, etc...
          return timer(scalingDuration)
        }),
        finalize(() => console.log('We are done!'))
      )
    })
  )

export const delayShowAppEpic = action$ =>
  action$.pipe(
    ofType(TYPE_.ATTACH_INTERFACE),
    delay(7000),
    map(() => {
      return Actions.app.updateAppStatus({
        appLoading: false
      })
    })
  )

//
// SUBSCRIBE TO NEW BLOCK AND MONITOR ACCOUNTS
//

const monitorAccounts$ = (api, state$) => {
  return Observable.create(observer => {
    const instance = Web3Wrapper.getInstance(
      state$.value.endpoint.networkInfo.id
    )
    instance.rigoblock.ob.newBlock$.subscribe(newBlock => {
      return utils
        .updateAccounts(api, newBlock, state$)
        .then(result => observer.next(result))
    })
  })
}

export const monitorAccountsEpic = (action$, state$) => {
  return action$.pipe(
    ofType(TYPE_.MONITOR_ACCOUNTS_START),
    mergeMap(action => {
      return monitorAccounts$(action.payload.api, state$).pipe(
        takeUntil(action$.pipe(ofType(TYPE_.MONITOR_ACCOUNTS_STOP))),
        mergeMap(accountsUpdate => {
          const observablesArray = Array(0)

          observablesArray.push(
            Observable.of(Actions.endpoint.updateInterface(accountsUpdate[0]))
          )
          if (accountsUpdate[1].length !== 0)
            observablesArray.push(
              Observable.of({
                type: TYPE_.QUEUE_ACCOUNT_NOTIFICATION,
                payload: accountsUpdate[1]
              })
            )
          if (DEBUGGING.initAccountsTransactionsInEpic) {
            const currentState = state$.value
            if (accountsUpdate[2]) {
              // if (
              //   currentState.transactionsDrago.selectedDrago.details.dragoId
              // ) {
              //   console.log('Account monitoring - > DRAGO details fetch.')
              //   observablesArray.push(
              //     Observable.of(
              //       Actions.drago.getPoolDetails(
              //         currentState.transactionsDrago.selectedDrago.details
              //           .dragoId,
              //         action.payload.api,
              //         {
              //           poolType: 'drago'
              //         }
              //       )
              //     )
              //   )
              // }

              // if (
              //   currentState.transactionsVault.selectedVault.details.vaultId
              // ) {
              //   console.log('Account monitoring - > VAULT details fetch.')
              //   observablesArray.push(
              //     Observable.of(
              //       Actions.drago.getPoolDetails(
              //         currentState.transactionsVault.selectedVault.details
              //           .vaultId,
              //         action.payload.api,
              //         {
              //           poolType: 'vault'
              //         }
              //       )
              //     )
              //   )
              // }
              // observablesArray.push(Observable.of(DEBUGGING.DUMB_ACTION))
              console.log(
                'Account monitoring - > DRAGO transactions fetch trader'
              )
              observablesArray.push(
                Observable.of(
                  Actions.endpoint.getAccountsTransactions(
                    action.payload.api,
                    null,
                    currentState.endpoint.accounts,
                    {
                      balance: true,
                      supply: false,
                      limit: 20,
                      trader: true,
                      drago: true
                    }
                  )
                )
              )
              console.log(
                'Account monitoring - > DRAGO transactions fetch manager'
              )
              observablesArray.push(
                Observable.of(
                  Actions.endpoint.getAccountsTransactions(
                    action.payload.api,
                    null,
                    currentState.endpoint.accounts,
                    {
                      balance: false,
                      supply: true,
                      limit: 20,
                      trader: false,
                      drago: true
                    }
                  )
                )
              )

              console.log(
                'Account monitoring - > VAULT transactions fetch manager'
              )
              observablesArray.push(Observable.of(DEBUGGING.DUMB_ACTION))
              observablesArray.push(
                Observable.of(
                  Actions.endpoint.getAccountsTransactions(
                    action.payload.api,
                    null,
                    currentState.endpoint.accounts,
                    {
                      balance: false,
                      supply: true,
                      limit: 20,
                      trader: false,
                      drago: false
                    }
                  )
                )
              )
              console.log(
                'Account monitoring - > VAULT transactions fetch trader'
              )
              observablesArray.push(
                Observable.of(
                  Actions.endpoint.getAccountsTransactions(
                    action.payload.api,
                    null,
                    currentState.endpoint.accounts,
                    {
                      balance: true,
                      supply: false,
                      limit: 20,
                      trader: true,
                      drago: false
                    }
                  )
                )
              )
            }
          }

          return Observable.concat(...observablesArray)
        }),
        retryWhen(error => {
          console.log('monitorAccountsEpic')
          let scalingDuration = 3000
          return error.pipe(
            mergeMap((error, i) => {
              console.warn(error)
              const retryAttempt = i + 1
              console.log(` monitorAccountsEpic Attempt ${retryAttempt}`)
              // retry after 1s, 2s, etc...
              return timer(scalingDuration)
            }),
            finalize(() => console.log('We are done!'))
          )
        })
        // catchError(error => {
        //   console.log(error)
        //   return Observable.of({
        //     type: TYPE_.QUEUE_ERROR_NOTIFICATION,
        //     payload: 'Error: cannot update accounts balance.'
        //   })
        // })
      )
    })
  )
}

//
// CHECK THAT METAMASK IS UNLOCKED AND UPDATE ACTIVE ACCOUNT
//

const checkMetaMaskIsUnlocked$ = (api, web3, endpoint) => {
  let newEndpoint = {}
  let newAccounts = [].concat(endpoint.accounts)
  return from(
    new Promise(resolve => {
      const getAccounts = async () => {
        try {
          const accountsMetaMask = await web3.eth.getAccounts()
          // If MetaMask is unlocked then remove from accounts list.
          if (accountsMetaMask.length === 0) {
            // newEndpoint.isMetaMaskLocked = true
            // Check if MetaMask was already locked in order to avoid unnecessary update of the state
            let metaMaskAccountIndex = endpoint.accounts.findIndex(account => {
              return account.source === 'MetaMask'
            })
            if (metaMaskAccountIndex !== -1) {
              newAccounts.splice(metaMaskAccountIndex, 1)
              newEndpoint.accounts = newAccounts
              newEndpoint.isMetaMaskLocked = true
              newEndpoint.lastMetaMaskUpdateTime = new Date().getTime()
            }
          } else {
            // Check if a MetaMask account is already in accounts list.
            let metaMaskAccountIndex = endpoint.accounts.findIndex(account => {
              return account.address === accountsMetaMask[0]
            })
            // If it is NOT then remove any other MetaMask account and add this one to the accounts list.
            if (metaMaskAccountIndex < 0) {
              let indexAccountToBeRemove = endpoint.accounts.findIndex(
                account => {
                  return account.source === 'MetaMask'
                }
              )
              newAccounts.splice(indexAccountToBeRemove, 1)
              const networkId = endpoint.networkInfo.id
              const blockchain = new Interfaces(api, networkId)
              return blockchain.attachInterfaceInfuraV2().then(result => {
                if (result.accounts.length !== 0) {
                  newAccounts.push(result.accounts[0])
                }
                newEndpoint = {
                  ...result
                }
                newEndpoint.accounts = newAccounts
                // Update total ETH and GRG balance
                newEndpoint.ethBalance = newEndpoint.accounts.reduce(
                  (total, account) => total.plus(account.ethBalanceWei),
                  new BigNumber(0)
                )
                newEndpoint.grgBalance = newEndpoint.accounts.reduce(
                  (total, account) => total.plus(account.grgBalanceWei),
                  new BigNumber(0)
                )
                return newEndpoint
              })
            }
          }
          if (!endpoint.isMetaMaskNetworkCorrect) {
            newEndpoint.accounts = Array(0)
            newEndpoint.isMetaMaskLocked = true
            newEndpoint.lastMetaMaskUpdateTime = new Date().getTime()
          }
          return newEndpoint
        } catch (error) {
          console.log(error)
          let metaMaskAccountIndex = endpoint.accounts.findIndex(account => {
            return account.source === 'MetaMask'
          })
          if (metaMaskAccountIndex !== -1) {
            newAccounts.splice(metaMaskAccountIndex, 1)
            newEndpoint.accounts = newAccounts
            return newEndpoint
          }
          // return newEndpoint
        }
      }
      resolve(getAccounts())
    })
  )
}

export const checkMetaMaskIsUnlockedEpic = (action$, state$) => {
  return action$.ofType(TYPE_.CHECK_METAMASK_IS_UNLOCKED).mergeMap(action => {
    return timer(0, 1000).pipe(
      exhaustMap(() => {
        const currentState = state$.value
        // console.log(currentState)
        return checkMetaMaskIsUnlocked$(
          action.payload.api,
          action.payload.web3,
          currentState.endpoint
        ).pipe(
          filter(val => {
            // console.log(val)
            return Object.keys(val).length !== 0
          }),
          // filter(val => {
          //   console.log(val.isMetaMaskLocked)
          //   return !val.isMetaMaskLocked
          // }),
          tap(results => {
            console.log(results)
            return results
          }),
          mergeMap(newEndpoint => {
            let optionsManager = {
              balance: false,
              supply: true,
              limit: 20,
              trader: false,
              drago: true
            }
            let optionsHolder = {
              balance: true,
              supply: false,
              limit: 20,
              trader: true,
              drago: true
            }
            let accountsAddressHash
            if (typeof newEndpoint.accounts !== 'undefined') {
              let accounts = newEndpoint.accounts.map(element => {
                return element.address
              })
              // console.log(sha3_512(accounts.toString()))
              accountsAddressHash = sha3_512(accounts.toString())
            }
            // console.log(newEndpoint)
            let arrayObservables =
              DEBUGGING.initAccountsTransactionsInEpic &&
              !newEndpoint.isMetaMaskLocked
                ? [
                    Observable.of(
                      Actions.endpoint.getAccountsTransactions(
                        action.payload.api,
                        null,
                        newEndpoint.accounts,
                        optionsHolder
                      )
                    ),
                    Observable.of(
                      Actions.endpoint.getAccountsTransactions(
                        action.payload.api,
                        null,
                        newEndpoint.accounts,
                        optionsManager
                      )
                    ),
                    Observable.of(
                      Actions.endpoint.getAccountsTransactions(
                        action.payload.api,
                        null,
                        newEndpoint.accounts,
                        {
                          ...optionsHolder,
                          ...{
                            drago: false
                          }
                        }
                      )
                    ),
                    Observable.of(
                      Actions.endpoint.getAccountsTransactions(
                        action.payload.api,
                        null,
                        newEndpoint.accounts,
                        {
                          ...optionsManager,
                          ...{
                            drago: false
                          }
                        }
                      )
                    )
                  ]
                : []
            return Observable.concat(
              Observable.of(
                Actions.app.updateAppStatus({
                  accountsAddressHash: accountsAddressHash
                })
              ),
              Observable.of(Actions.endpoint.updateInterface(newEndpoint)),
              ...arrayObservables
            )
          }),
          catchError(error => {
            console.warn(error)
            return Observable.of({
              type: TYPE_.QUEUE_WARNING_NOTIFICATION,
              payload:
                'Unable to fetch accounts from MetaMask. Is MetaMask unlocket?'
            })
          })
        )
      })
    )
  })
}
