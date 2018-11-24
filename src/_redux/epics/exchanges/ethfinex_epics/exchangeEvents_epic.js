// Copyright 2016-2017 Rigo Investment Sagl.

// import { Observable } from 'rxjs';
import * as TYPE_ from '../../../actions/const'
import { Actions } from '../../../actions'
import { BigNumber } from '@0xproject/utils'
import { ERC20_TOKENS } from '../../../../_utils/tokens'
import { Observable, defer, of, timer } from 'rxjs'
import { blockChunks } from '../../../../_utils/utils/blockChunks'
import {
  concat,
  distinctUntilChanged,
  exhaustMap,
  filter,
  finalize,
  map,
  mergeMap,
  retryWhen,
  switchMap
} from 'rxjs/operators'
import { ofType } from 'redux-observable'
import { toUnitAmount } from '../../../../_utils/format'
import Web3Wrapper from '../../../../_utils/web3Wrapper/src'
import _ from 'lodash'
import exchangeEfxV0Abi from '../../../../PoolsApi/src/contracts/abi/v2/exchange-efx-v0.json'
import utils from '../../../../_utils/utils'

const getPastExchangeEvents$ = (fund, exchange, state) => {
  const web3 = Web3Wrapper.getInstance(state.value.endpoint.networkInfo.id)
  const efxEchangeContract = new web3.eth.Contract(
    exchangeEfxV0Abi,
    exchange.exchangeContractAddress.toLowerCase()
  )

  // This code may be used to filter by tokens. Do not remove.

  // console.log(
  //   '0x3f3fb7135a4e1512b508f90733145ab182cc196e127cd9281a8e9f636de79a67'
  // )
  // let tokens1 = web3.utils.soliditySha3(
  //   {
  //     t: 'address',
  //     v: tokens.quoteToken.wrappers.Ethfinex.address.toLowerCase()
  //   },
  //   {
  //     t: 'address',
  //     v: tokens.baseToken.wrappers.Ethfinex.address.toLowerCase()
  //   }
  // )
  // tokens1 = web3.utils.padLeft(tokens1, 64)
  // let tokens2 = web3.utils.soliditySha3(
  //   {
  //     t: 'address',
  //     v: tokens.baseToken.wrappers.Ethfinex.address.toLowerCase()
  //   },
  //   {
  //     t: 'address',
  //     v: tokens.quoteToken.wrappers.Ethfinex.address.toLowerCase()
  //   }
  // )
  // tokens2 = web3.utils.padLeft(tokens2, 64)
  // 0x3f3fb7135a4e1512b508f90733145ab182cc196e127cd9281a8e9f636de79a67
  // console.log(fund)

  const makerAddress = '0x' + fund.address.substr(2).padStart(64, '0')

  return defer(() => from(web3.eth.getBlockNumber())).pipe(
    switchMap(lastBlock => {
      const chunkSize = 100000
      const chunks = blockChunks(0, lastBlock, chunkSize)
      const eventsPromises = chunks.map(chunk => {
        const options = {
          fromBlock: chunk.fromBlock,
          toBlock: chunk.toBlock,
          topics: [null, makerAddress, null, null]
        }
        return efxEchangeContract.getPastEvents(
          'allEvents',
          options,
          (err, res) => (err ? console.error(err) : res)
        )
      })
      return from(Promise.all(eventsPromises))
    })
  )
}

const onNewBlock$ = (fund, exchange, state$) => {
  let fromBlock
  return timer(0, 1000).pipe(
    switchMap(() => {
      return of(state$.value.endpoint.prevBlockNumber)
    }),
    distinctUntilChanged((a, b) => {
      return a === b
    }),
    exhaustMap(blockNumber => {
      return defer(async () => {
        const web3 = await Web3Wrapper.getInstance(
          state$.value.endpoint.networkInfo.id
        )
        const makerAddress = '0x' + fund.address.substr(2).padStart(64, '0')
        const efxEchangeContract = new web3.eth.Contract(
          exchangeEfxV0Abi,
          exchange.exchangeContractAddress.toLowerCase()
        )
        const options = {
          fromBlock,
          toBlock: 'latest',
          topics: [null, makerAddress, null, null]
        }
        const events = await efxEchangeContract.getPastEvents(
          'allEvents',
          options,
          function(error) {
            if (error) {
              return error
            }
          }
        )
        fromBlock = blockNumber++
        return events
      })
    })
  )
}

const processTradesHistory = (trades, state$) => {
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
    let makerTokenAddress = trade.returnValues.makerToken.toLowerCase()
    let takerTokenAddress = trade.returnValues.takerToken.toLowerCase()
    let makerAmount, takerAmount

    // Trade between ETH and USD

    if (
      (tokensSymbols.get(makerTokenAddress) === 'ETH' &&
        tokensSymbols.get(takerTokenAddress) === 'USD') ||
      (tokensSymbols.get(makerTokenAddress) === 'USD' &&
        tokensSymbols.get(takerTokenAddress) === 'ETH')
    ) {
      let makerTokenSymbol = tokensSymbols.get(makerTokenAddress)

      // SYMBOLS
      transaction.baseTokenSymbol = 'ETH'
      transaction.quoteTokenSymbol = 'USD'

      if (makerTokenSymbol === 'ETH') {
        transaction.type = 'sell'
        let makerDecimals = 18
        let takerDecimals = 6
        makerAmount = toUnitAmount(
          new BigNumber(trade.returnValues.filledMakerTokenAmount),
          makerDecimals
        )
        takerAmount = toUnitAmount(
          new BigNumber(trade.returnValues.filledTakerTokenAmount),
          takerDecimals
        )
        transaction.price = takerAmount.div(makerAmount).toFixed(5)
        transaction.amount = makerAmount.toFixed(5)
        return transaction
      } else {
        let makerDecimals = 6
        let takerDecimals = 18
        makerAmount = toUnitAmount(
          new BigNumber(trade.returnValues.filledTakerTokenAmount),
          takerDecimals
        )
        takerAmount = toUnitAmount(
          new BigNumber(trade.returnValues.filledMakerTokenAmount),
          makerDecimals
        )
        transaction.amount = toUnitAmount(
          new BigNumber(trade.returnValues.filledTakerTokenAmount),
          takerDecimals
        ).toFixed(5)

        transaction.price = new BigNumber(1)
          .div(new BigNumber(makerAmount).div(new BigNumber(takerAmount)))
          .toFixed(5)
        return transaction
      }
    }

    // Trade betweem ERC20 token and ETH or USD

    if (!quoteTokensWrappers.has(makerTokenAddress)) {
      transaction.type = 'sell'
      let makerDecimals = baseTokensWrappers.get(makerTokenAddress).decimals
      let takerDecimals = quoteTokensWrappers.get(takerTokenAddress).decimals
      makerAmount = toUnitAmount(
        new BigNumber(trade.returnValues.filledMakerTokenAmount),
        makerDecimals
      )
      console.log(makerAmount.toFixed(5))
      takerAmount = toUnitAmount(
        new BigNumber(trade.returnValues.filledTakerTokenAmount),
        takerDecimals
      )
      console.log(takerAmount.toFixed(5))
      transaction.price = takerAmount.div(makerAmount).toFixed(5)
      transaction.amount = makerAmount.toFixed(5)

      // SYMBOLS
      transaction.baseTokenSymbol = tokensSymbols.get(makerTokenAddress)
      transaction.quoteTokenSymbol = tokensSymbols.get(takerTokenAddress)
      return transaction
    }
    if (quoteTokensWrappers.has(makerTokenAddress)) {
      transaction.type = 'buy'
      let makerDecimals = quoteTokensWrappers.get(makerTokenAddress).decimals
      let takerDecimals = baseTokensWrappers.get(takerTokenAddress).decimals
      makerAmount = toUnitAmount(
        new BigNumber(trade.returnValues.filledTakerTokenAmount),
        takerDecimals
      )
      console.log(makerAmount.toFixed(5))
      takerAmount = toUnitAmount(
        new BigNumber(trade.returnValues.filledMakerTokenAmount),
        takerDecimals
      )
      console.log(takerAmount.toFixed(5), takerDecimals)
      transaction.amount = toUnitAmount(
        new BigNumber(trade.returnValues.filledTakerTokenAmount),
        makerDecimals
      ).toFixed(5)

      transaction.price = new BigNumber(1)
        .div(new BigNumber(makerAmount).div(new BigNumber(takerAmount)))
        .toFixed(5)

      // SYMBOLS
      transaction.baseTokenSymbol = tokensSymbols.get(takerTokenAddress)
      transaction.quoteTokenSymbol = tokensSymbols.get(makerTokenAddress)
      return transaction
    }
  })
  return tradeHistory
}

export const monitorExchangeEventsEpic = (action$, state) => {
  const web3 = Web3Wrapper.getInstance(state$.value.endpoint.networkInfo.id)
  const ethfinexEventful$ = web3.rigoblock.ob.exchangeEfxV0$
  return action$.pipe(
    ofType(utils.customRelayAction(TYPE_.MONITOR_EXCHANGE_EVENTS_START)),
    switchMap(action => {
      const { fund, tokens, exchange } = action.payload
      return getPastExchangeEvents$(fund, exchange, state).pipe(
        concat(ethfinexEventful$)
      )
    })
  )
}

// return Observable.concat(
//   getPastExchangeEvents$(fund, exchange, state$),
//   onNewBlock$(fund, exchange, state$)
// ).pipe(
//   filter(trades => Array.isArray(trades)),
//   map(trades => {
//     let tradesHistory = processTradesHistory(trades.reverse(), state$)
//     return Actions.exchange.updateTradesHistory(tradesHistory)
//   }),
//   retryWhen(error => {
//     let scalingDuration = 10000
//     return error.pipe(
//       mergeMap(error => {
//         console.warn(error)
//         return timer(scalingDuration)
//       }),
//       finalize(() => console.log('We are done!'))
//     )
//   })
// )
