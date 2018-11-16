import * as CONSTANTS from '../utils/const'
import { Observable, defer, from } from 'rxjs'
import { delay, retryWhen, switchMap, tap } from 'rxjs/operators'
import exchangeEfxV0Abi from '../abis/exchange-efx-v0.json'

const exchangeEfxV0$ = (web3, networkId) => {
  const efxEchangeContract = new web3.eth.Contract(
    exchangeEfxV0Abi,
    CONSTANTS.EFX_EXCHANGE_CONTRACT[networkId].toLowerCase()
  )
  let fromBlock

  return defer(() => from(web3.eth.getBlockNumber())).pipe(
    tap(latestBlock => (fromBlock = latestBlock)),
    switchMap(() =>
      Observable.create(observer => {
        const subscription = efxEchangeContract.events.allEvents(
          {
            fromBlock
          },
          (err, msg) => {
            if (err) {
              return observer.error(err)
            }
            fromBlock = msg.blockNumber
            return observer.next(msg)
          }
        )
        return () => subscription.unsubscribe()
      }).pipe(retryWhen(retryStrategy))
    ),
    retryWhen(retryStrategy)
  )
}

const retryStrategy = error$ =>
  error$.pipe(
    tap(err => {
      console.error(err)
    }),
    tap(() => {
      console.info(`Retrying in: ${CONSTANTS.RETRY_DELAY} ms.`)
    }),
    delay(CONSTANTS.RETRY_DELAY)
  )

export default exchangeEfxV0$
