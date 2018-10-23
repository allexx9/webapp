// Copyright 2016-2017 Rigo Investment Sagl.

// import { Observable } from 'rxjs';
import * as TYPE_ from '../actions/const'
import { Actions } from '../actions/'
import { DEBUGGING, INFURA, LOCAL, RIGOBLOCK } from '../../_utils/const'
import { Interfaces } from '../../_utils/interfaces'
import { Observable, defer, from, merge, observable, timer } from 'rxjs'
import {
  catchError,
  delay,
  exhaustMap,
  filter,
  finalize,
  flatMap,
  map,
  // merge,
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
import Web3 from 'web3'
import utils from '../../_utils/utils'

//
// CHECK IF THE APP If NETWORK IS UP AND THERE IS A CONNECTION TO A NODE
//

export const isConnectedToNode$ = api => {
  let nodeStatus = {
    isConnected: false,
    isSyncing: false,
    syncStatus: {}
  }
  return defer(() => api.eth.syncing()).pipe(
    timeout(2500),
    map(result => {
      // console.log(result)
      if (result !== false) {
        if (result.highestBlock.minus(result.currentBlock).gt(2)) {
          nodeStatus.isConnected = true
          nodeStatus.isSyncing = true
          nodeStatus.syncStatus = result
        } else {
          nodeStatus.isConnected = true
          nodeStatus.isSyncing = false
          nodeStatus.syncStatus = {}
        }
      } else {
        nodeStatus.isConnected = true
        nodeStatus.isSyncing = false
        nodeStatus.syncStatus = {}
      }
      return nodeStatus
    }),
    catchError(error => {
      console.log(error)
      nodeStatus.isConnected = false
      nodeStatus.isSyncing = false
      nodeStatus.syncStatus = {}
      throw new Error(nodeStatus)
    })
  )
}

export const isConnectedToNodeEpic = (action$, $state) =>
  action$.ofType(TYPE_.CHECK_APP_IS_CONNECTED).switchMap(action => {
    let scalingDuration = 1000
    let timeInterval = 0
    let retryAttempt = 0
    return timer(0, 2000).pipe(
      exhaustMap(() => {
        return isConnectedToNode$(action.payload.api, $state).pipe(
          tap(result => {
            // console.log(result)
            return result
          }),
          flatMap(result => {
            retryAttempt = 0
            timeInterval = 0
            let actionsArray = Array(0)
            actionsArray = [
              Observable.of(Actions.app.updateAppStatus({ ...result }))
            ]
            return Observable.concat(...actionsArray)
          }),
          catchError(() => {
            console.warn('Connection error to node. Retrying.')
            retryAttempt++
            retryAttempt > 5
              ? (timeInterval = scalingDuration * 5)
              : (timeInterval = scalingDuration * retryAttempt)
            return Observable.concat(
              Observable.of(
                Actions.app.updateAppStatus({
                  isConnected: false,
                  isSyncing: false,
                  // syncStatus: {},
                  retryTimeInterval: timeInterval,
                  connectionRetries: retryAttempt
                })
              )
            )
          })
        )
      })
    )
  })

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
  console.log(newEndpoint)
  // throw new Error('error')
  return newEndpoint
}

const attachInterface$ = (api, endpoint) => {
  return defer(() => attachInterfacePromise(api, endpoint))
}

export const delayShowAppEpic = action$ =>
  action$.pipe(
    ofType(TYPE_.ATTACH_INTERFACE),
    delay(7000),
    map(() => {
      return Actions.app.updateAppStatus({ appLoading: false })
    })
  )

export const attacheInterfaceEpic = action$ =>
  action$.pipe(
    ofType(TYPE_.ATTACH_INTERFACE),
    switchMap(action => {
      return attachInterface$(action.payload.api, action.payload.endpoint).pipe(
        flatMap(endpoint => {
          console.log(action.payload)
          return Observable.concat(
            Observable.of(
              Actions.app.updateAppStatus({
                appLoading: false,
                isConnected: true
              })
            ),
            Observable.of(Actions.endpoint.updateInterface(endpoint)),
            Observable.of(
              Actions.endpoint.monitorAccountsStart(
                action.payload.web3,
                action.payload.api
              )
            )
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

//
// SUBSCRIBES TO EVENTFULL CONTRACTS AND EMIT NEW EVENTS
//

const monitorEventful$ = (web3, api, state$) => {
  console.log('monitorEventful$')
  let hexAccounts = state$.value.endpoint.accounts.map(account => {
    const hexAccount =
      '0x' +
      account.address
        .toLocaleLowerCase()
        .substr(2)
        .padStart(64, '0')
    return hexAccount
  })

  return merge(
    Observable.create(observer => {
      console.log('subscription Create event DRAGO')
      let web3New = new Web3(window.web3._rb.wss)
      const poolApi = new PoolsApi(api)
      // DRAGO
      poolApi.contract.dragoeventful.init().then(() => {
        let subscriptionCreate = web3New.eth.subscribe(
          'logs',
          {
            address: poolApi.contract.dragoeventful._contract._address[0].toLocaleLowerCase(),
            topics: [null, null, null, hexAccounts]
          },
          function(error, result) {
            if (!error) {
              console.log(result)
              return observer.next(result)
            } else {
              return observer.error(error)
            }
          }
        )
        return () => {
          subscriptionCreate.unsubscribe(function(error, success) {
            if (success) console.log('Successfully unsubscribed!')
          })
        }
      })

      console.log('subscription Create event VAULT')

      // VAULT
      poolApi.contract.vaulteventful.init().then(() => {
        let subscriptionCreate = web3New.eth.subscribe(
          'logs',
          {
            address: poolApi.contract.vaulteventful._contract._address[0].toLocaleLowerCase(),
            topics: [null, null, null, hexAccounts]
          },
          function(error, result) {
            if (!error) {
              console.log(result)
              return observer.next(result)
            } else {
              return observer.error(error)
            }
          }
        )
        return () => {
          subscriptionCreate.unsubscribe(function(error, success) {
            if (success) console.log('Successfully unsubscribed!')
          })
        }
      })
    }),
    Observable.create(observer => {
      console.log('subscription BuySell DRAGO events')
      let web3New = new Web3(window.web3._rb.wss)
      const poolApi = new PoolsApi(api)
      // DRAGO
      poolApi.contract.dragoeventful.init().then(() => {
        let subscriptionBuySell = web3New.eth.subscribe(
          'logs',
          {
            address: poolApi.contract.dragoeventful._contract._address[0].toLocaleLowerCase(),
            topics: [null, null, hexAccounts, null]
          },
          function(error, result) {
            if (!error) {
              console.log(result)
              return observer.next(result)
            } else {
              return observer.error(error)
            }
          }
        )
        return () => {
          subscriptionBuySell.unsubscribe(function(error, success) {
            if (success) console.log('Successfully unsubscribed!')
          })
        }
      })

      console.log('subscription BuySell VAULT events')

      // VAULT
      poolApi.contract.vaulteventful.init().then(() => {
        let subscriptionBuySell = web3New.eth.subscribe(
          'logs',
          {
            address: poolApi.contract.vaulteventful._contract._address[0].toLocaleLowerCase(),
            topics: [null, null, hexAccounts, null]
          },
          function(error, result) {
            if (!error) {
              console.log(result)
              return observer.next(result)
            } else {
              return observer.error(error)
            }
          }
        )
        return () => {
          subscriptionBuySell.unsubscribe(function(error, success) {
            if (success) console.log('Successfully unsubscribed!')
          })
        }
      })
    })
  )
}

export const monitorEventfulEpic = (action$, state$) => {
  return action$.pipe(
    ofType(TYPE_.MONITOR_ACCOUNTS_START),
    mergeMap(action => {
      return monitorEventful$(
        action.payload.web3,
        action.payload.api,
        state$
      ).pipe(
        takeUntil(action$.pipe(ofType(TYPE_.MONITOR_ACCOUNTS_STOP))),
        tap(val => {
          console.log(val)
          return val
        }),
        flatMap(event => {
          const observablesArray = Array(0)
          const currentState = state$.value
          console.log(event)
          console.log(
            'Eventful subscription - > DRAGO transactions fetch trader'
          )
          observablesArray.push(Observable.of(DEBUGGING.DUMB_ACTION))
          // observablesArray.push(
          //   Observable.of(
          //     Actions.endpoint.getAccountsTransactions(
          //       action.payload.api,
          //       null,
          //       currentState.endpoint.accounts,
          //       {
          //         balance: false,
          //         supply: true,
          //         limit: 20,
          //         trader: false,
          //         drago: true
          //       }
          //     )
          //   )
          // )
          console.log(
            'Eventful subscription - > DRAGO transactions fetch manager'
          )
          // observablesArray.push(
          //   Observable.of(
          //     Actions.endpoint.getAccountsTransactions(
          //       action.payload.api,
          //       null,
          //       currentState.endpoint.accounts,
          //       {
          //         balance: true,
          //         supply: false,
          //         limit: 20,
          //         trader: true,
          //         drago: true
          //       }
          //     )
          //   )
          // )

          console.log(
            'Eventful subscription - > VAULT transactions fetch trader'
          )
          observablesArray.push(Observable.of(DEBUGGING.DUMB_ACTION))
          // observablesArray.push(
          //   Observable.of(
          //     Actions.endpoint.getAccountsTransactions(
          //       action.payload.api,
          //       null,
          //       currentState.endpoint.accounts,
          //       {
          //         balance: false,
          //         supply: true,
          //         limit: 20,
          //         trader: false,
          //         drago: false
          //       }
          //     )
          //   )
          // )
          console.log(
            'Eventful subscription - > VAULT transactions fetch manager'
          )
          // observablesArray.push(
          //   Observable.of(
          //     Actions.endpoint.getAccountsTransactions(
          //       action.payload.api,
          //       null,
          //       currentState.endpoint.accounts,
          //       {
          //         balance: true,
          //         supply: false,
          //         limit: 20,
          //         trader: true,
          //         drago: false
          //       }
          //     )
          //   )
          // )

          return Observable.concat(...observablesArray)
        }),
        retryWhen(error => {
          console.log('monitorEventfulEpic')
          let scalingDuration = 10000
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
              // const _rb = window.web3._rb
              // window.web3 = new Web3(window.web3.currentProvider)
              // window.web3._rb = _rb
              console.log(`monitorEventfulEpic Attempt ${retryAttempt}`)
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
        //     payload: 'Error: cannot subscribe to eventful.'
        //   })
        // })
      )
    })
  )
}

//
// SUBSCRIBE TO NEW BLOCK AND MONITOR ACCOUNTS
//

const monitorAccounts$ = (web3, api, state$) => {
  return Observable.create(observer => {
    let web3New = new Web3(window.web3._rb.wss)
    let subscription = web3New.eth.subscribe(
      'newBlockHeaders',
      (_error, blockNumber) => {
        if (!_error) {
          utils.updateAccounts(api, blockNumber, state$).then(result => {
            return observer.next(result)
          })
        } else {
          return observer.error(_error)
        }
      }
    )
    return () => {
      subscription.unsubscribe(function(error, success) {
        if (success) console.log('Successfully unsubscribed!')
      })
    }
  })
}

export const monitorAccountsEpic = (action$, state$) => {
  return action$.pipe(
    ofType(TYPE_.MONITOR_ACCOUNTS_START),
    mergeMap(action => {
      return monitorAccounts$(
        action.payload.web3,
        action.payload.api,
        state$
      ).pipe(
        takeUntil(action$.pipe(ofType(TYPE_.MONITOR_ACCOUNTS_STOP))),
        tap(val => {
          // console.log(val)
          return val
        }),
        flatMap(accountsUpdate => {
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
              if (
                currentState.transactionsDrago.selectedDrago.details.dragoId
              ) {
                console.log(
                  'Account monitoring - > DRAGO transactions fetch: Trader: ' +
                    state$.value.user.isManager
                )
                observablesArray.push(
                  Observable.of(
                    Actions.drago.getPoolDetails(
                      currentState.transactionsDrago.selectedDrago.details
                        .dragoId,
                      action.payload.api,
                      {
                        poolType: 'drago'
                      }
                    )
                  )
                )
              }

              if (
                currentState.transactionsVault.selectedVault.details.vaultId
              ) {
                console.log(
                  'Account monitoring - > VAULT transactions fetch. Trader ' +
                    state$.value.user.isManager
                )
                observablesArray.push(
                  Observable.of(
                    Actions.drago.getPoolDetails(
                      currentState.transactionsVault.selectedVault.details
                        .vaultId,
                      action.payload.api,
                      {
                        poolType: 'vault'
                      }
                    )
                  )
                )
              }
              // observablesArray.push(Observable.of(DEBUGGING.DUMB_ACTION))
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
                'Account monitoring - > DRAGO transactions fetch manager'
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
                'Account monitoring - > VAULT transactions fetch trader'
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
                'Account monitoring - > VAULT transactions fetch manager'
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
              console.log('was NOT locket')
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
                newEndpoint = { ...result }
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
          flatMap(newEndpoint => {
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
            let arrayObservables = DEBUGGING.initAccountsTransactionsInEpic
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
                      { ...optionsHolder, ...{ drago: false } }
                    )
                  ),
                  Observable.of(
                    Actions.endpoint.getAccountsTransactions(
                      action.payload.api,
                      null,
                      newEndpoint.accounts,
                      { ...optionsManager, ...{ drago: false } }
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
            // return Observable.of({
            //   type: TYPE_.QUEUE_WARNING_NOTIFICATION,
            //   payload:
            //     'Unable to fetch accounts from MetaMask. Is MetaMask unlocket?'
            // })
          })
        )
      })
    )
  })
}
