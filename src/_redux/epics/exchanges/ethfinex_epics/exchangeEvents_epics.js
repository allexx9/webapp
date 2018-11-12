// Copyright 2016-2017 Rigo Investment Sagl.

// import { Observable } from 'rxjs';
import * as ERRORS from '../../../../_const/errors'
import * as TYPE_ from '../../../actions/const'
import { Actions } from '../../../actions/'
import { BigNumber } from '@0xproject/utils'
import { Observable, defer, from, timer, zip } from 'rxjs'
import {
  concat,
  finalize,
  flatMap,
  map,
  mergeMap,
  retryWhen,
  takeUntil,
  tap
} from 'rxjs/operators'
import { ofType } from 'redux-observable'
import Web3Wrapper from '../../../../_utils/web3Wrapper/src'
import _ from 'lodash'
// import moment from 'moment'
import exchangeEfxV0Abi from '../../../../PoolsApi/src/contracts/abi/v2/exchange-efx-v0.json'
import utils from '../../../../_utils/utils'

const getPastExchangeEvents$ = (fund, tokens, exchange, state$) => {
  return defer(async () => {
    const web3 = await Web3Wrapper.getInstance(
      state$.value.endpoint.networkInfo.name.toLowerCase()
    )
    const efxEchangeContract = new web3.eth.Contract(
      exchangeEfxV0Abi,
      exchange.exchangeContractAddress.toLowerCase()
    )

    // console.log(
    //   '0x3f3fb7135a4e1512b508f90733145ab182cc196e127cd9281a8e9f636de79a67'
    // )
    let tokens1 = web3.utils.soliditySha3(
      {
        t: 'address',
        v: tokens.quoteToken.wrappers.Ethfinex.address.toLowerCase()
      },
      {
        t: 'address',
        v: tokens.baseToken.wrappers.Ethfinex.address.toLowerCase()
      }
    )
    tokens1 = web3.utils.padLeft(tokens1, 64)
    // console.log(tokens1)
    let tokens2 = web3.utils.soliditySha3(
      {
        t: 'address',
        v: tokens.baseToken.wrappers.Ethfinex.address.toLowerCase()
      },
      {
        t: 'address',
        v: tokens.quoteToken.wrappers.Ethfinex.address.toLowerCase()
      }
    )
    tokens2 = web3.utils.padLeft(tokens2, 64)
    // console.log(tokens2)
    // 0x3f3fb7135a4e1512b508f90733145ab182cc196e127cd9281a8e9f636de79a67
    // console.log(fund)
    const makerAddress = '0x' + fund.address.substr(2).padStart(64, '0')
    return efxEchangeContract
      .getPastEvents(
        'allEvents',
        {
          fromBlock: 0,
          toBlock: 'latest',
          topics: [null, makerAddress, null, [tokens1, tokens2]]
        },
        function(error) {
          if (error) {
            return error
          }
        }
      )
      .then(function(events) {
        return events
      })
      .catch(error => {
        return error
      })
  })
}

const monitorExchangeEvents$ = (fund, tokens, state$) => {
  let subscription
  return Observable.create(observer => {
    Web3Wrapper.getInstance(
      state$.value.endpoint.networkInfo.name.toUpperCase()
    ).then(web3 => {
      subscription = web3.rb.ob.exchangeEfxV0$.subscribe(val => {
        if (Object.keys(val.error).length === 0) {
          console.log(val)
          observer.next(val)
        } else {
          console.log(val)
          observer.error(val)
        }
      })
    })
    return () => {
      console.log('monitorExchangeEvents$ closed')
      console.log(subscription)
      subscription.unsubscribe()
      observer.complete()
    }
  })
}

// export const monitorExchangeEventsEpic = (action$, state$) => {
//   return action$.pipe(
//     ofType(utils.customRelayAction(TYPE_.MONITOR_EXCHANGE_EVENTS_START)),
//     mergeMap(action => {
//       // console.log(action)
//       return monitorExchangeEvents$(
//         action.payload.fund,
//         action.payload.tokens,
//         state$
//       ).pipe(
//         takeUntil(
//           action$.ofType(
//             utils.customRelayAction(TYPE_.MONITOR_EXCHANGE_EVENTS_STOP)
//           )
//         ),
//         tap(val => {
//           console.log(val)
//           return val
//         }),
//         map(event => {
//           return {
//             type: 'DUMB',
//             payload: 'Dumb'
//           }
//           // return Observable.concat(...observablesArray)
//         }),
//         retryWhen(error => {
//           let scalingDuration = 10000
//           return error.pipe(
//             mergeMap((error, i) => {
//               console.warn(error)
//               const retryAttempt = i + 1
//               console.log(`monitorExchangeEventsEpic Attempt ${retryAttempt}`)
//               return timer(scalingDuration)
//             }),
//             finalize(() => console.log('We are done!'))
//           )
//         })
//       )
//     })
//   )
// }

export const monitorExchangeEventsEpic = (action$, state$) => {
  return action$.pipe(
    ofType(utils.customRelayAction(TYPE_.MONITOR_EXCHANGE_EVENTS_START)),
    mergeMap(action => {
      // console.log(action)
      return Observable.concat(
        getPastExchangeEvents$(
          action.payload.fund,
          action.payload.tokens,
          action.payload.exchange,
          state$
        ),
        monitorExchangeEvents$(
          action.payload.fund,
          action.payload.tokens,
          state$
        ).pipe(
          takeUntil(
            action$.ofType(
              utils.customRelayAction(TYPE_.MONITOR_EXCHANGE_EVENTS_STOP)
            )
          )
        )
      ).pipe(
        takeUntil(action$.ofType(TYPE_.MONITOR_EXCHANGE_EVENTS_STOP)),
        tap(val => {
          console.log(val)
          return val
        }),
        map(event => {
          return {
            type: 'DUMB',
            payload: 'Dumb'
          }
          // return Observable.concat(...observablesArray)
        }),
        retryWhen(error => {
          let scalingDuration = 10000
          return error.pipe(
            mergeMap((error, i) => {
              console.warn(error)
              const retryAttempt = i + 1
              console.log(`monitorExchangeEventsEpic Attempt ${retryAttempt}`)
              return timer(scalingDuration)
            }),
            finalize(() => console.log('We are done!'))
          )
        })
      )
    })
  )
}
