// Copyright 2016-2017 Rigo Investment Sagl.

// import { Observable } from 'rxjs';
import * as ERRORS from '../../../../_const/errors'
import * as TYPE_ from '../../../actions/const'
import { Actions } from '../../../actions/'
import { BigNumber } from '@0xproject/utils'
import { Observable, defer, timer } from 'rxjs'
import {
  finalize,
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
import { toUnitAmount } from '../../../../_utils/format'
import exchangeEfxV0Abi from '../../../../PoolsApi/src/contracts/abi/v2/exchange-efx-v0.json'
import utils from '../../../../_utils/utils'

const getPastExchangeEvents$ = (fund, tokens, exchange, state$) => {
  return defer(async () => {
    const web3 = await Web3Wrapper.getInstance(
      state$.value.endpoint.networkInfo.id
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
    console.log(tokens1)
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
    console.log(tokens2)
    // 0x3f3fb7135a4e1512b508f90733145ab182cc196e127cd9281a8e9f636de79a67
    // console.log(fund)
    const makerAddress = '0x' + fund.address.substr(2).padStart(64, '0')
    return efxEchangeContract
      .getPastEvents(
        'allEvents',
        {
          fromBlock: 0,
          toBlock: 'latest',
          // topics: [null, null, null, null]
          topics: [null, makerAddress, null, [tokens1, tokens2]]
        },
        function(error) {
          if (error) {
            return error
          }
        }
      )
      .then(events => {
        console.log(events)
        return events
      })
      .catch(error => {
        return error
      })
  })
}

// const monitorExchangeEvents$ = (fund, tokens, state$) => {
//   let subscription
//   return Observable.create(observer => {
//     Web3Wrapper.getInstance(state$.value.endpoint.networkInfo.id).then(web3 => {
//       subscription = web3.rb.ob.exchangeEfxV0$.subscribe(val => {
//         if (Object.keys(val.error).length === 0) {
//           console.log(val)
//           observer.next(val)
//         } else {
//           console.log(val)
//           observer.error(val)
//         }
//       })
//     })
//     return () => {
//       console.log('monitorExchangeEvents$ closed')
//       console.log(subscription)
//       subscription.unsubscribe()
//       observer.complete()
//     }
//   })
// }

const processTradeHistory = (trades, tokens) => {
  console.log(tokens)
  let tradeHistory = trades.map(trade => {
    let transaction = {
      type: '',
      baseTokenSymbol: tokens.baseToken.symbol,
      quoteTokenSymbol: tokens.quoteToken.symbol,
      transactionHash: trade.transactionHash,
      price: '0',
      amount: '0'
    }
    let makerAmount, takerAmount
    if (
      trade.returnValues.makerToken.toLowerCase() ===
      tokens.baseToken.wrappers.Ethfinex.address.toLowerCase()
    ) {
      transaction.type = 'sell'
      makerAmount = toUnitAmount(
        new BigNumber(trade.returnValues.filledMakerTokenAmount),
        tokens.baseToken.decimals
      )
      console.log(makerAmount.toFixed(5))
      takerAmount = toUnitAmount(
        new BigNumber(trade.returnValues.filledTakerTokenAmount),
        tokens.quoteToken.decimals
      )
      console.log(takerAmount.toFixed(5))
      transaction.price = takerAmount.div(makerAmount).toFixed(5)
      transaction.amount = makerAmount.toFixed(5)
    }
    if (
      trade.returnValues.makerToken.toLowerCase() ===
      tokens.quoteToken.wrappers.Ethfinex.address.toLowerCase()
    ) {
      transaction.type = 'buy'
      makerAmount = toUnitAmount(
        new BigNumber(trade.returnValues.filledTakerTokenAmount),
        tokens.quoteToken.decimals
      )
      takerAmount = toUnitAmount(
        new BigNumber(trade.returnValues.filledMakerTokenAmount),
        tokens.baseToken.decimals
      )
      transaction.amount = toUnitAmount(
        new BigNumber(trade.returnValues.filledTakerTokenAmount),
        tokens.quoteToken.decimals
      ).toFixed(5)

      transaction.price = new BigNumber(1)
        .div(new BigNumber(makerAmount).div(new BigNumber(takerAmount)))
        .toFixed(5)
    }
    return transaction
  })
  return tradeHistory
}

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
        )
        // monitorExchangeEvents$(
        //   action.payload.fund,
        //   action.payload.tokens,
        //   state$
        // ).pipe(
        //   takeUntil(
        //     action$.ofType(
        //       utils.customRelayAction(TYPE_.MONITOR_EXCHANGE_EVENTS_STOP)
        //     )
        //   )
        // )
      ).pipe(
        takeUntil(action$.ofType(TYPE_.MONITOR_EXCHANGE_EVENTS_STOP)),
        tap(val => {
          console.log(val)
          console.log(processTradeHistory(val, action.payload.tokens))
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
