import * as CONSTANTS from '../utils/const'
import { Observable, defer, from, merge } from 'rxjs'
import {
  delay,
  ignoreElements,
  retryWhen,
  switchMap,
  tap
} from 'rxjs/operators'
import exchangeEfxV0Abi from '../abis/exchange-efx-v0.json'

const exchangeEfxV0$ = (web3, networkId) => {
  const efxEchangeContract = new web3.eth.Contract(
    exchangeEfxV0Abi,
    CONSTANTS.EFX_EXCHANGE_CONTRACT[networkId].toLowerCase()
  )
  let fromBlock

  const retryStrategy = error$ =>
    error$.pipe(
      tap(err => {
        console.error(err)
        console.info(`Retrying in: ${CONSTANTS.RETRY_DELAY} ms.`)
      }),
      delay(CONSTANTS.RETRY_DELAY)
    )

  return defer(() => from(web3.eth.getBlockNumber())).pipe(
    tap(latestBlock => (fromBlock = latestBlock)),
    tap(val => console.log(val)),
    switchMap(() =>
      merge(
        Observable.create(observer => {
          const subscription = efxEchangeContract.events.allEvents(
            {
              fromBlock
            },
            (err, msg) => {
              if (err) {
                return observer.error(err)
              }
              // fromBlock = msg.blockNumber
              return observer.next(msg)
            }
          )
          return () => subscription.unsubscribe()
        }),
        web3.rigoblock.ob.nodeStatus$.pipe(ignoreElements())
      ).pipe(retryWhen(retryStrategy))
    ),
    retryWhen(retryStrategy)
  )
}

export default exchangeEfxV0$
