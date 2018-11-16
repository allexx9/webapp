import * as CONST_ from '../utils/const'
import { Observable, from } from 'rxjs'
import { delay, mergeMap, retryWhen, timeout } from 'rxjs/operators'
import exchangeEfxV0Abi from '../abis/exchange-efx-v0.json'

const exchangeEfxV0$ = (web3, networkId) => {
  const efxEchangeContract = new web3.eth.Contract(
    exchangeEfxV0Abi,
    CONST_.EFX_EXCHANGE_CONTRACT[networkId].toLowerCase()
  )
  const timeoutMs = 120000
  const retryDelay = 10000
  let fromBlock

  return from(web3.eth.getBlockNumber()).pipe(
    mergeMap(latestBlock => {
      fromBlock = latestBlock
      return Observable.create(observer => {
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
      }).pipe(
        timeout(timeoutMs),
        retryWhen(error$ =>
          error$.pipe(
            tap(err => console.log(`Ethfinex eventful$ error: ${err.message}`)),
            delay(retryDelay)
          )
        )
      )
    })
  )
}

export default exchangeEfxV0$
