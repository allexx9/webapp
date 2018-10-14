// Copyright 2016-2017 Rigo Investment Sagl.

// import { Observable } from 'rxjs';
import * as TYPE_ from '../actions/const'
import { Actions } from '../actions/'
import {
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
// CHECK IF THE APP If NETWORK IS UP AND THERE IS A CONNECTION TO A NODE
//

export const isConnectedToNode$ = (api, $state) => {
  let nodeStatus = {
    isConnected: false,
    isSyncing: false,
    syncStatus: {}
  }
  return defer(() => api.eth.syncing()).pipe(
    timeout(2500),
    map(result => {
      if (result !== false) {
        nodeStatus.isConnected = true
        nodeStatus.isSyncing = true
        nodeStatus.syncStatus = result
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
              // Observable.of(
              //   Actions.app.updateAppStatus({
              //     isConnected: false,
              //     isSyncing: false,
              //     syncStatus: {},
              //     connectionRetries: retryAttempt
              //   })
              // ),
              Observable.of(
                Actions.app.updateAppStatus({
                  isConnected: false,
                  isSyncing: false,
                  // syncStatus: {},
                  retryTimeInterval: timeInterval,
                  connectionRetries: retryAttempt
                })
              )
              // .pipe(
              //   map(result => {
              //     return result
              //   }),
              //   delay(timeInterval)
              // )
            )
          })
        )
      })
    )
  })

//
// CONNECT TO SOURCES OF ACCOUNTS AND POPULATE STATE WITH ACCOUNTS DATA
//

export const attachInterfacePromise = async (api, endpoint) => {
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
        // tap(result => {
        //   console.log(result)
        //   return result
        // }),
        flatMap(endpoint => {
          console.log(action.payload)
          return Observable.concat(
            Observable.of(
              Actions.app.updateAppStatus({
                appLoading: false,
                isConnected: true
              })
            ),
            // Observable.of(Actions.endpoint.checkIsConnectedToNode(action.payload.api)),
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
// SUBSCRIBE TO NEW BLOCK AND MONITOR ACCOUNTS
//

export const updateAccounts = async (api, blockNumber, state$) => {
  const currentState = state$.value
  const { endpoint } = currentState
  let newEndpoint = {}
  const prevBlockNumber = endpoint.prevBlockNumber
  const prevNonce = endpoint.prevNonce
  let newBlockNumber = new BigNumber(0)
  let notifications = Array(0)
  let fetchTransactions = false
  console.log(currentState)
  // Checking if blockNumber is passed by Parity Api or Web3
  if (typeof blockNumber.number !== 'undefined') {
    newBlockNumber = new BigNumber(blockNumber.number)
  } else {
    newBlockNumber = blockNumber
  }
  console.log(`endpoint_epic -> Last block: ` + prevBlockNumber)
  console.log(`endpoint_epic -> New block: ` + newBlockNumber.toFixed())
  console.log(`endpoint_epic -> Last nonce: ` + prevNonce)

  if (new BigNumber(prevBlockNumber).gte(new BigNumber(newBlockNumber))) {
    console.log(
      `endpoint_epic -> Detected prevBlockNumber > currentBlockNumber. Skipping accounts update.`
    )
    newEndpoint = {
      prevBlockNumber: prevBlockNumber
    }
    return [newEndpoint, notifications, fetchTransactions]
  }

  const accounts = [].concat(endpoint.accounts)
  if (accounts.length !== 0) {
    console.log(`endpoint_epic -> New nonce: ` + endpoint.accounts[0].nonce)
    try {
      const poolsApi = new PoolsApi(api)
      poolsApi.contract.rigotoken.init()
      // Checking GRG balance
      const grgQueries = accounts.map(account => {
        // console.log(
        //   `endpoint_epic -> API call getBalance RigoToken-> applicationDragoHome: Getting balance of account ${
        //     account.address
        //   }`
        // )
        return poolsApi.contract.rigotoken.balanceOf(account.address)
      })

      // Checking ETH balance
      const ethQueries = accounts.map(account => {
        // console.log(
        //   `endpoint_epic -> API call getBalance -> applicationDragoHome: Getting balance of account ${
        //     account.address
        //   }`
        // )
        return api.eth.getBalance(account.address, 'latest')
      })
      const ethBalances = await Promise.all(ethQueries)
      const grgBalances = await Promise.all(grgQueries)
      const prevAccounts = [].concat(endpoint.accounts)
      prevAccounts.forEach(function(account, index) {
        // Checking ETH balance
        const newEthBalance = new BigNumber(ethBalances[index])
        const prevEthBalance = new BigNumber(account.ethBalanceWei)
        console.log(
          `Old balance at block ${prevBlockNumber} -> ${prevEthBalance.toFixed()}`
        )
        console.log(
          `New balance at block ${newBlockNumber} -> ${newEthBalance.toFixed()}`
        )
        if (
          !new BigNumber(newEthBalance).eq(prevEthBalance) &&
          prevBlockNumber !== 0
        ) {
          console.log(`${account.name} balance changed.`)
          fetchTransactions = true
          let secondaryText = []
          let balDifference = prevEthBalance.minus(newEthBalance)
          // console.log(prevEthBalance.toFixed(), newEthBalance.toFixed())
          // console.log(balDifference.toFixed())
          if (balDifference.gt(new BigNumber(0))) {
            console.log(
              `endpoint_epic -> You transferred ${utils.formatFromWei(
                balDifference
              )} ETH!`
            )
            secondaryText[0] = `You transferred ${utils.formatFromWei(
              balDifference
            )} ETH!`
            secondaryText[1] = utils.dateFromTimeStamp(new Date())
          } else {
            console.log(
              `endpoint_epic -> You received ${Math.abs(
                utils.formatFromWei(balDifference)
              )} ETH!`
            )
            secondaryText[0] = `You received ${Math.abs(
              utils.formatFromWei(balDifference)
            )} ETH!`
            secondaryText[1] = utils.dateFromTimeStamp(new Date())
          }
          if (endpoint.accountsBalanceError === false) {
            notifications.push({
              primaryText: account.name,
              secondaryText: secondaryText,
              eventType: 'transfer'
            })
          }
        }

        // Checking GRG balance
        const newgrgBalance = new BigNumber(grgBalances[index])
        const prevGrgBalance = new BigNumber(account.grgBalanceWei)
        // console.log(newgrgBalance, prevGrgBalance)
        if (
          !new BigNumber(newgrgBalance).eq(prevGrgBalance) &&
          prevBlockNumber !== 0
        ) {
          console.log(`${account.name} balance changed.`)
          fetchTransactions = true
          let secondaryText = []
          let balDifference = prevGrgBalance.minus(newgrgBalance)
          if (balDifference.gt(new BigNumber(0))) {
            console.log(
              `endpoint_epic -> You transferred ${utils.formatFromWei(
                balDifference
              )} GRG!`
            )
            secondaryText[0] = `You transferred ${utils.formatFromWei(
              balDifference
            )} GRG!`
            secondaryText[1] = utils.dateFromTimeStamp(new Date())
          } else {
            console.log(
              `endpoint_epic -> You received ${Math.abs(
                utils.formatFromWei(balDifference)
              )} GRG!`
            )
            secondaryText[0] = `You received ${Math.abs(
              utils.formatFromWei(balDifference)
            )} GRG!`
            secondaryText[1] = utils.dateFromTimeStamp(new Date())
          }
          if (endpoint.accountsBalanceError === false) {
            notifications.push({
              primaryText: account.name,
              secondaryText: secondaryText,
              eventType: 'transfer'
            })
          }
        }
      })
      newEndpoint = {
        prevBlockNumber: newBlockNumber.toFixed(),
        prevNonce: endpoint.accounts[0].nonce,
        loading: false,
        networkError: NETWORK_OK,
        networkStatus: MSG_NETWORK_STATUS_OK,
        accountsBalanceError: false,
        grgBalance: grgBalances.reduce(
          (total, balance) => total.plus(balance),
          new BigNumber(0)
        ),
        ethBalance: ethBalances.reduce(
          (total, balance) => total.plus(balance),
          new BigNumber(0)
        ),
        accounts: [].concat(
          accounts.map((account, index) => {
            const ethBalance = ethBalances[index]
            account.ethBalance = utils.formatFromWei(ethBalance)
            account.ethBalanceWei = new BigNumber(ethBalance)
            const grgBalance = grgBalances[index]
            account.grgBalance = utils.formatFromWei(grgBalance)
            account.grgBalanceWei = new BigNumber(grgBalance)
            return account
          })
        )
      }
      return [newEndpoint, notifications, fetchTransactions]
    } catch (error) {
      console.log(`endpoint_epic -> ${error}`)
      // Setting the balances to 0 if receiving an error from the endpoint. It happens with Infura.
      newEndpoint = {
        prevBlockNumber: newBlockNumber.toFixed(),
        loading: false,
        networkError: NETWORK_WARNING,
        networkStatus: MSG_NETWORK_STATUS_ERROR,
        accountsBalanceError: true
        // ethBalance: new BigNumber(0),
        // grgBalance: new BigNumber(0),
        // accounts: [].concat(accounts.map((account) => {
        //   account.ethBalance = utils.formatFromWei(new BigNumber(0))
        //   account.grgBalance = utils.formatFromWei(new BigNumber(0))
        //   return account;
        // })
        // )
      }
      return [newEndpoint, notifications, fetchTransactions]
    }
  } else {
    const newEndpoint = { ...endpoint }
    newEndpoint.loading = false
    newEndpoint.prevBlockNumber = newBlockNumber.toFixed()
    return [newEndpoint, notifications, fetchTransactions]
  }
}

const monitorEventful$ = (web3, api, state$) => {
  const currentState = state$.value
  // const networkName = currentState.endpoint.networkInfo.name
  console.log('monitorEventful$')
  // let subscriptionCreate = web3.eth
  //   .subscribe(
  //     'logs',
  //     {
  //       address: '0x35d3ab6b7917d03050423f7E43d4D9Cff155a685'.toLocaleLowerCase(),
  //       topics: [null, null, null, currentState.endpoint.accounts[0].address]
  //     },
  //     function(error, result) {
  //       if (!error) console.log(result)
  //     }
  //   )
  //   .on('data', function(log) {
  //     console.log(log)
  //   })

  // unsubscribes the subscription
  // console.log(subscription)
  let hexAccounts = currentState.endpoint.accounts.map(account => {
    const hexAccount =
      '0x' +
      account.address
        .toLocaleLowerCase()
        .substr(2)
        .padStart(64, '0')
    return hexAccount
  })
  console.log(hexAccounts)

  const observableCreate = Observable.create(observer => {
    let subscriptionCreate = web3.eth.subscribe(
      'logs',
      {
        address: '0x35d3ab6b7917d03050423f7E43d4D9Cff155a685'.toLocaleLowerCase(),
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

  const observableBuySell = Observable.create(observer => {
    let subscriptionCreate = web3.eth.subscribe(
      'logs',
      {
        address: '0x35d3ab6b7917d03050423f7E43d4D9Cff155a685'.toLocaleLowerCase(),
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
      subscriptionCreate.unsubscribe(function(error, success) {
        if (success) console.log('Successfully unsubscribed!')
      })
    }
  })

  return merge(observableCreate, observableBuySell)
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
          //   let options = state$.value.user.isManager
          //   ? { balance: false, supply: true, limit: 20, trader: false }
          //   : { balance: true, supply: false, limit: 20, trader: true }
          // console.log(options)
          console.log('transactions fetch trader')
          observablesArray.push(
            Observable.of(
              Actions.endpoint.getAccountsTransactions(
                action.payload.api,
                null,
                currentState.endpoint.accounts,
                { balance: false, supply: true, limit: 20, trader: false }
              )
            )
          )
          console.log('transactions fetch manager')
          observablesArray.push(
            Observable.of(
              Actions.endpoint.getAccountsTransactions(
                action.payload.api,
                null,
                currentState.endpoint.accounts,
                { balance: true, supply: false, limit: 20, trader: true }
              )
            )
          )

          return Observable.concat(...observablesArray)
        }),
        catchError(error => {
          console.log(error)
          return Observable.of({
            type: TYPE_.QUEUE_ERROR_NOTIFICATION,
            payload: 'Error: cannot subscribe to eventful.'
          })
        })
      )
    })
  )
}

const monitorAccounts$ = (web3, api, state$) => {
  // const currentState = state$.value
  // const networkName = currentState.endpoint.networkInfo.name
  console.log('newBlockHeaders')
  // let subscription = web3.eth
  //   .subscribe(
  //     'logs',
  //     {
  //       address: '0x35d3ab6b7917d03050423f7E43d4D9Cff155a685'.toLocaleLowerCase(),
  //       topics: [null, null, null, null]
  //     },
  //     function(error, result) {
  //       if (!error) console.log(result)
  //     }
  //   )
  //   .on('data', function(log) {
  //     console.log(log)
  //   })

  // // unsubscribes the subscription
  // console.log(subscription)

  return Observable.create(observer => {
    // It seems that Infura supports Websocket for Kovan, now.
    // Leaving the following legacy code commented for reference.

    // if (networkName === KOVAN) {
    //   api.subscribe('eth_blockNumber', (_error, blockNumber) => {
    //     if (!_error) {
    //       updateAccounts(api, blockNumber, state$)
    //         .then(result => {
    //           return observer.next(result)
    //         })
    //       // return observer.next(Observable.fromPromise(updateAccounts(api, blockNumber, state$)))
    //     } else {
    //       return observer.error(_error)
    //     }
    //   })
    //     .then((result) => {
    //       console.log(`Subscribed to eth_blockNumber -> Subscription ID: ${subscriptionData}`);
    //       subscriptionData = result
    //     })
    // } else {
    //   subscriptionData = web3.eth.subscribe('newBlockHeaders', (_error, blockNumber) => {
    //     if (!_error) {
    //       updateAccounts(api, blockNumber, state$)
    //         .then(result => {
    //           return observer.next(result)
    //         })
    //     } else {
    //       return observer.error(_error)
    //     }
    //   })
    // }
    console.log('newBlockHeaders')
    let subscription = web3.eth.subscribe(
      'newBlockHeaders',
      (_error, blockNumber) => {
        if (!_error) {
          updateAccounts(api, blockNumber, state$).then(result => {
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
          console.log(val)
          return val
        }),
        flatMap(accountsUpdate => {
          const observablesArray = Array(0)

          observablesArray.push(
            Observable.of(Actions.endpoint.updateInterface(accountsUpdate[0]))
          )
          observablesArray.push(
            Observable.of({
              type: TYPE_.QUEUE_ACCOUNT_NOTIFICATION,
              payload: accountsUpdate[1]
            })
          )
          if (accountsUpdate[2]) {
            //   let options = state$.value.user.isManager
            //   ? { balance: false, supply: true, limit: 20, trader: false }
            //   : { balance: true, supply: false, limit: 20, trader: true }
            // console.log(options)
            console.log('transactions fetch trader')
            // observablesArray.push(
            //   Observable.of(
            //     Actions.endpoint.getAccountsTransactions(
            //       action.payload.api,
            //       null,
            //       accountsUpdate[0].accounts,
            //       { balance: false, supply: true, limit: 20, trader: false }
            //     )
            //   )
            // )
            console.log('transactions fetch manager')
            // observablesArray.push(
            //   Observable.of(
            //     Actions.endpoint.getAccountsTransactions(
            //       action.payload.api,
            //       null,
            //       accountsUpdate[0].accounts,
            //       { balance: true, supply: false, limit: 20, trader: true }
            //     )
            //   )
            // )
          }

          return Observable.concat(...observablesArray)
        }),
        catchError(error => {
          console.log(error)
          return Observable.of({
            type: TYPE_.QUEUE_ERROR_NOTIFICATION,
            payload: 'Error: cannot update accounts balance.'
          })
        })
      )
    })
  )
}

//
// FETCH ACCOUNT TRANSACTIONS
//

const getAccountsTransactions$ = (api, dragoAddress, accounts, options) => {
  // console.log(accounts)
  // console.log(dragoAddress)
  return Observable.fromPromise(
    utils.getTransactionsDragoOptV2(api, dragoAddress, accounts, options)
  )
}

export const getAccountsTransactionsEpic = (action$, state$) =>
  action$.ofType(TYPE_.GET_ACCOUNTS_TRANSACTIONS).mergeMap(action => {
    return getAccountsTransactions$(
      action.payload.api,
      action.payload.dragoAddress,
      action.payload.accounts,
      action.payload.options
    )
      .map(results => {
        console.log(results)
        // const currentState = state$.value
        if (!action.payload.options.trader) {
          return Actions.drago.updateTransactionsDragoManagerAction(
            results.length === 0 ? [Array(0), Array(0), Array(0)] : results
          )
        }
        return Actions.drago.updateTransactionsDragoHolderAction(results)
      })
      .catch(() => {
        return Observable.of({
          type: TYPE_.QUEUE_ERROR_NOTIFICATION,
          payload: 'Error fetching account transactions.'
        })
      })
  })

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
              trader: false
            }
            let optionsHolder = {
              balance: true,
              supply: false,
              limit: 20,
              trader: true
            }
            // if (currentState.user.isManager) {
            //   options = {
            //     balance: false,
            //     supply: true,
            //     limit: 20,
            //     trader: false
            //   }
            // } else {
            //   options = {
            //     balance: true,
            //     supply: false,
            //     limit: 20,
            //     trader: true
            //   }
            // }
            let accountsAddressHash
            if (typeof newEndpoint.accounts !== 'undefined') {
              let accounts = newEndpoint.accounts.map(element => {
                return element.address
              })
              // console.log(sha3_512(accounts.toString()))
              accountsAddressHash = sha3_512(accounts.toString())
            }
            // console.log(newEndpoint)
            return Observable.concat(
              Observable.of(
                Actions.app.updateAppStatus({
                  accountsAddressHash: accountsAddressHash
                })
              ),
              Observable.of(Actions.endpoint.updateInterface(newEndpoint)),
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
              )
            )
          }),
          catchError(error => {
            console.log(error)
            // return Observable.of({
            //   type: TYPE_.QUEUE_WARNING_NOTIFICATION,
            //   payload: 'Unable to fetch accounts from MetaMask. Is it unlocket?'
            // })
          })
        )
      })
    )
  })
}
