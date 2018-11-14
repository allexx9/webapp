import { ZeroEx } from '0x.js'
import Web3 from 'web3'

const newMakerOrder = (
  orderType,
  selectedTokensPair,
  selectedExchange,
  selectedFund,
  isTokenWrapper
) => {
  let makerTokenAddress, takerTokenAddress
  if (isTokenWrapper) {
    makerTokenAddress =
      orderType === 'asks'
        ? selectedTokensPair.baseToken.wrappers[selectedExchange.name].address
        : selectedTokensPair.quoteToken.wrappers[selectedExchange.name].address
    takerTokenAddress =
      orderType === 'asks'
        ? selectedTokensPair.quoteToken.wrappers[selectedExchange.name].address
        : selectedTokensPair.baseToken.wrappers[selectedExchange.name].address
  } else {
    makerTokenAddress =
      orderType === 'asks'
        ? selectedTokensPair.baseToken.address
        : selectedTokensPair.quoteToken.address
    takerTokenAddress =
      orderType === 'asks'
        ? selectedTokensPair.quoteToken.address
        : selectedTokensPair.baseToken.address
  }

  // const expirationUnixTimestampSec = new BigNumber(
  //   Math.round(new Date().getTime() / 1000) + (defaultExpiry || 60) * 60 * 12
  // ).toNumber()

  let defaultConfig = 3600
  let expiration
  expiration = Math.round(new Date().getTime() / 1000)
  expiration += defaultConfig

  // part after the plus can be replaced, first part is constant
  const web3 = new Web3()
  const order = {
    expirationUnixTimestampSec: web3.utils.toBN(expiration).toString(10),
    feeRecipient: selectedExchange.feeRecipient.toLowerCase(),

    maker: selectedFund.details.address.toLowerCase(),
    makerFee: web3.utils.toBN('0'),
    makerTokenAddress: makerTokenAddress.toLowerCase(),

    salt: ZeroEx.generatePseudoRandomSalt(),
    taker: selectedExchange.taker.toLowerCase(),
    takerFee: web3.utils.toBN('0'),
    takerTokenAddress: takerTokenAddress.toLowerCase(),

    exchangeContractAddress: selectedExchange.exchangeContractAddress.toLowerCase()
  }
  console.log(order)
  return order
}

export const createOrderEthfinexV0 = (action$, state$) => {
  return action$.pipe(
    ofType(utils.customRelayAction(TYPE_.ORDER_CREATE)),
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
