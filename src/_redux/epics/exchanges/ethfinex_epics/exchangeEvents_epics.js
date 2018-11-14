// Copyright 2016-2017 Rigo Investment Sagl.

// import { Observable } from 'rxjs';
import * as ERRORS from '../../../../_const/errors'
import * as TYPE_ from '../../../actions/const'
import { Actions } from '../../../actions/'
import { BigNumber } from '@0xproject/utils'
import {
  ERC20_TOKENS,
  Ethfinex,
  TRADE_TOKENS_PAIRS
} from '../../../../_utils/tokens'
import { Observable, defer, timer } from 'rxjs'
import {
  buffer,
  delayWhen,
  finalize,
  first,
  map,
  mergeMap,
  retryWhen,
  skipWhile,
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
          topics: [null, makerAddress, null, null]
          // topics: [null, makerAddress, null, [tokens1, tokens2]]
        },
        function(error) {
          if (error) {
            return error
          }
        }
      )
      .then(events => {
        // console.log(events)
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

const processTradesHistory = (trades, state$) => {
  // console.log(tokens)
  let networkName = state$.value.endpoint.networkInfo.name
  let quoteTokensWrappers = new Map()
  let baseTokensWrappers = new Map()
  let tokensSymbols = new Map()
  Object.keys(state$.value.exchange.availableTradeTokensPairs).forEach(
    quoteToken => {
      quoteTokensWrappers.set(
        ERC20_TOKENS[networkName][
          quoteToken
        ].wrappers.Ethfinex.address.toLowerCase(),
        ERC20_TOKENS[networkName][quoteToken].wrappers.Ethfinex
      )
    }
  )

  Object.keys(ERC20_TOKENS[networkName]).forEach(token => {
    if (Object.keys(ERC20_TOKENS[networkName][token].wrappers).length !== 0) {
      baseTokensWrappers.set(
        ERC20_TOKENS[networkName][
          token
        ].wrappers.Ethfinex.address.toLowerCase(),
        ERC20_TOKENS[networkName][token].wrappers.Ethfinex
      )
      // console.log(
      //   ERC20_TOKENS[networkName][
      //     token
      //   ].wrappers.Ethfinex.address.toLowerCase(),
      //   ERC20_TOKENS[networkName][token].symbolTicker.Ethfinex
      // )
      tokensSymbols.set(
        ERC20_TOKENS[networkName][
          token
        ].wrappers.Ethfinex.address.toLowerCase(),
        ERC20_TOKENS[networkName][token].symbolTicker.Ethfinex
      )
    }
  })

  let tradeHistory = trades.map(trade => {
    let transaction = {
      type: '',
      baseTokenSymbol: '',
      quoteTokenSymbol: '',
      transactionHash: trade.transactionHash,
      price: '0',
      amount: '0'
    }
    // console.log(
    //   trade.returnValues.makerToken.toLowerCase(),
    //   tokensSymbols.get(trade.returnValues.makerToken.toLowerCase())
    // )
    transaction.baseTokenSymbol = tokensSymbols.get(
      trade.returnValues.makerToken.toLowerCase()
    )
    transaction.quoteTokenSymbol = tokensSymbols.get(
      trade.returnValues.takerToken.toLowerCase()
    )
    let makerAmount, takerAmount
    if (
      // trade.returnValues.makerToken.toLowerCase() ===
      // tokens.baseToken.wrappers.Ethfinex.address.toLowerCase()
      !quoteTokensWrappers.has(trade.returnValues.makerToken.toLowerCase())
    ) {
      transaction.type = 'sell'
      let makerDecimals = baseTokensWrappers.get(
        trade.returnValues.makerToken.toLowerCase()
      ).decimals
      let takerDecimals = quoteTokensWrappers.get(
        trade.returnValues.takerToken.toLowerCase()
      ).decimals
      makerAmount = toUnitAmount(
        new BigNumber(trade.returnValues.filledMakerTokenAmount),
        makerDecimals
      )
      // console.log(makerAmount.toFixed(5))
      takerAmount = toUnitAmount(
        new BigNumber(trade.returnValues.filledTakerTokenAmount),
        takerDecimals
      )
      // console.log(takerAmount.toFixed(5))
      transaction.price = takerAmount.div(makerAmount).toFixed(5)
      transaction.amount = makerAmount.toFixed(5)
    }
    if (
      // trade.returnValues.makerToken.toLowerCase() ===
      // tokens.quoteToken.wrappers.Ethfinex.address.toLowerCase()
      quoteTokensWrappers.has(trade.returnValues.makerToken.toLowerCase())
    ) {
      transaction.type = 'buy'
      let makerDecimals = quoteTokensWrappers.get(
        trade.returnValues.makerToken.toLowerCase()
      ).decimals
      let takerDecimals = baseTokensWrappers.get(
        trade.returnValues.takerToken.toLowerCase()
      ).decimals
      makerAmount = toUnitAmount(
        new BigNumber(trade.returnValues.filledTakerTokenAmount),
        takerDecimals
      )
      takerAmount = toUnitAmount(
        new BigNumber(trade.returnValues.filledMakerTokenAmount),
        takerDecimals
      )
      transaction.amount = toUnitAmount(
        new BigNumber(trade.returnValues.filledTakerTokenAmount),
        makerDecimals
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
  const appIsConnected = state$.pipe(
    map(val => {
      return typeof val.exchange.selectedFund.details.address === 'undefined'
    }),
    skipWhile(val => val === true)
  )

  return action$.pipe(
    ofType(utils.customRelayAction(TYPE_.MONITOR_EXCHANGE_EVENTS_START)),
    buffer(appIsConnected),
    first(),
    mergeMap(action => {
      console.log(action)
      const { fund, tokens, exchange } = action[0].payload
      // console.log(action)
      return Observable.concat(
        getPastExchangeEvents$(fund, tokens, exchange, state$)
        // monitorExchangeEvents$(
        //   fund,
        //   tokens,
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
        map(trades => {
          let tradesHistory = processTradesHistory(trades.reverse(), state$)
          return Actions.exchange.updateTradesHistory(tradesHistory)
        })
        // retryWhen(error => {
        //   let scalingDuration = 10000
        //   return error.pipe(
        //     mergeMap((error, i) => {
        //       console.warn(error)
        //       const retryAttempt = i + 1
        //       console.log(`monitorExchangeEventsEpic Attempt ${retryAttempt}`)
        //       return timer(scalingDuration)
        //     }),
        //     finalize(() => console.log('We are done!'))
        //   )
        // })
      )
    })
  )
}
