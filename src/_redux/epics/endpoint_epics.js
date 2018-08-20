// Copyright 2016-2017 Rigo Investment Sagl.

// import { Observable } from 'rxjs';
import { Observable } from 'rxjs/Observable'
// import 'rxjs/add/observable/dom/webSocket';
import 'rxjs/add/operator/delay';
import 'rxjs/add/operator/mapTo';
import 'rxjs/add/operator/bufferTime';
import 'rxjs/add/operator/bufferCount';
import 'rxjs/add/operator/map';
import 'rxjs/add/operator/reduce';
import 'rxjs/add/operator/switchMap';
import 'rxjs/add/operator/mergeMap';
import 'rxjs/add/operator/takeUntil';
import 'rxjs/add/operator/retryWhen';
import 'rxjs/add/operator/filter';
import 'rxjs/add/operator/catch';
import 'rxjs/add/operator/last';
import 'rxjs/add/operator/skip';
import 'rxjs/add/operator/takeLast';
import 'rxjs/add/observable/concat';
import 'rxjs/add/observable/of';
import 'rxjs/observable/timer';
import 'rxjs/observable/fromEvent';
import 'rxjs/add/observable/fromPromise';
import 'rxjs/add/observable/forkJoin';
import * as TYPE_ from '../actions/const'
import { Actions } from '../actions/'
import { Interfaces } from '../../_utils/interfaces'
import BigNumber from 'bignumber.js';
import utils from '../../_utils/utils'

//
// CHECK THAT METAMASK IS UNLOCKED AND UPDATE ACTIVE ACCOUNT
//

const getAccountsTransactions$ = (api, dragoAddress, accounts, options) => {
  return Observable.fromPromise(
    utils.getTransactionsDragoOptV2(api, dragoAddress, accounts, options)
  )
}

export const getAccountsTransactionsEpic = (action$) =>
  action$.ofType(TYPE_.GET_ACCOUNTS_TRANSACTIONS)
    .mergeMap((action) => {
      return getAccountsTransactions$(
        action.payload.api,
        action.payload.dragoAddress,
        action.payload.accounts,
        action.payload.options
      )
        .map(results => {
          console.log(results)
          return Actions.drago.updateTransactionsDragoHolderAction(results)
        })
        .catch(() => {
          return Observable.of({
            type: TYPE_.ADD_ERROR_NOTIFICATION,
            payload: 'Error fetching account transactions.'
          })
        }
        )
    });

//
// CHECK THAT METAMASK IS UNLOCKED AND UPDATE ACTIVE ACCOUNT
//

const checkMetaMaskIsUnlocked$ = (api, web3, endpoint) => {
  let newEndpoint = {}
  let newAccounts = [].concat(endpoint.accounts)
  return Observable.fromPromise(
    web3.eth.getAccounts()
      .then((accountsMetaMask) => {
        // If MetaMask is unlocked then remove from accounts list.
        if (accountsMetaMask.length === 0) {
          // Check if MetaMask was already locked in order to avoid unnecessary update of the state
          let metaMaskAccountIndex = endpoint.accounts.findIndex(account => {
            return (account.source === 'MetaMask')
          });
          if (metaMaskAccountIndex !== -1) {
            newAccounts.splice(metaMaskAccountIndex, 1)
            newEndpoint.accounts = newAccounts
          }
        } else {
          // Check if a MetaMask account is already in accounts list.
          let metaMaskAccountIndex = endpoint.accounts.findIndex(account => {
            return (account.address === accountsMetaMask[0])
          });
          // If it is NOT then remove any other MetaMask account and add this one to the accounts list.
          if (metaMaskAccountIndex < 0) {
            let indexAccountToBeRemove = endpoint.accounts.findIndex(account => {
              return (account.source === 'MetaMask')
            });
            newAccounts.splice(indexAccountToBeRemove, 1)
            const networkId = endpoint.networkInfo.id
            const blockchain = new Interfaces(api, networkId)
            return blockchain.attachInterfaceInfuraV2()
              .then((result) => {
                console.log(result)
                if (result.accounts.length !== 0) {
                  newAccounts.push(result.accounts[0])
                }
                newEndpoint = { ...result }
                newEndpoint.accounts = newAccounts
                // Update total ETH and GRG balance
                newEndpoint.ethBalance = newEndpoint.accounts.reduce((total, account) => total.add(account.ethBalanceWei), new BigNumber(0))
                newEndpoint.grgBalance = newEndpoint.accounts.reduce((total, account) => total.add(account.grgBalanceWei), new BigNumber(0))
                return newEndpoint
              })
          }
        }
        return newEndpoint
      }
      )
      .catch((error) => {
        console.log(error)
        let metaMaskAccountIndex = endpoint.accounts.findIndex(account => {
          return (account.source === 'MetaMask')
        });
        if (metaMaskAccountIndex !== -1) {
          newAccounts.splice(metaMaskAccountIndex, 1)
          newEndpoint.accounts = newAccounts
          return newEndpoint
        }
      })
  )
}

export const checkMetaMaskIsUnlockedEpic = (action$, state$) => {
  const options = { balance: true, supply: false, limit: 10, trader: true }
  return action$.ofType(TYPE_.CHECK_METAMASK_IS_UNLOCKED)
    .mergeMap((action) => {
      return Observable
        .timer(0, 1000)
        .exhaustMap(() => {
          const currentState = state$.getState()
          // console.log(currentState)
          return checkMetaMaskIsUnlocked$(
            action.payload.api,
            action.payload.web3,
            currentState.endpoint,
          )
            .filter(val => {
              return Object.keys(val).length !== 0
            })
            .flatMap(newEndpoint =>
              // Concat 2 observables so they fire sequentially
              Observable.concat(
                Observable.of(Actions.endpoint.updateInterfaceAction(newEndpoint)),
                Observable.of(Actions.endpoint.getAccountsTransactions(
                  action.payload.api, 
                  null, 
                  newEndpoint.accounts, 
                  options))
              )
            )
            .catch((error) => {
              console.log(error)
              return Observable.of({
                type: TYPE_.ADD_WARNING_NOTIFICATION,
                payload: 'Unable to fetch accounts from MetaMask. Is it unlocket?'
              })
            }
            )
        }

        )
    })
}