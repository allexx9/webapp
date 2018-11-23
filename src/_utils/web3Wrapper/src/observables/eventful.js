import * as CONSTANTS from '../utils/const'
import {
  Observable,
  defer,
  empty,
  from,
  merge,
  throwError,
  timer,
  zip
} from 'rxjs'
import {
  delay,
  exhaustMap,
  map,
  retryWhen,
  switchMap,
  tap
} from 'rxjs/operators'
import dragoeventfulAbi from '../abis/dragoEventful-v2.json'
import parityregisterAbi from '../abis/parityRegister.json'
import vaulteventfulAbi from '../abis/vaultEventful-v2.json'

export default (web3, networkId) => {
  const parityRegistry = new web3.eth.Contract(
    parityregisterAbi,
    CONSTANTS.PARITY_REGISTRY_ADDRESSES[networkId]
  )
  let fromBlock

  const connection$ = timer(0, 1000).pipe(
    exhaustMap(() => {
      const status = web3.currentProvider.connection.readyState
      return status === 1
        ? empty()
        : throwError(new Error(`Websocket not connected: status ${status}`))
    })
  )

  const getEventful$ = eventfulContract =>
    Observable.create(observer => {
      const subscription = eventfulContract.events.allEvents(
        {
          fromBlock
        },
        (err, msg) => {
          if (err) {
            return observer.error(err)
          }
          fromBlock = fromBlock > msg.blockNumber ? fromBlock : msg.blockNumber
          return observer.next(msg)
        }
      )
      return () => subscription.unsubscribe()
    }).pipe()

  const retryStrategy = error$ =>
    error$.pipe(
      tap(err => {
        console.error(err.message)
        console.info(`Retrying in: ${CONSTANTS.RETRY_DELAY} ms.`)
      }),
      delay(4000)
    )

  return defer(() => from(web3.eth.getBlockNumber())).pipe(
    tap(latestBlock => (fromBlock = latestBlock)),
    switchMap(() =>
      zip(
        from(
          parityRegistry.methods
            .getAddress(web3.utils.sha3(CONSTANTS.DRAGOEVENTFUL), 'A')
            .call()
        ),
        from(
          parityRegistry.methods
            .getAddress(web3.utils.sha3(CONSTANTS.VAULTEVENTFUL), 'A')
            .call()
        )
      ).pipe(
        map(([dragoEventfulAddress, vaultEventfulAddress]) => {
          const dragoEventful = new web3.eth.Contract(
            dragoeventfulAbi,
            dragoEventfulAddress
          )
          const vaultEventful = new web3.eth.Contract(
            vaulteventfulAbi,
            vaultEventfulAddress
          )
          return [dragoEventful, vaultEventful]
        }),
        switchMap(([dragoEventful, vaultEventful]) =>
          merge(
            getEventful$(dragoEventful),
            getEventful$(vaultEventful)
            // connection$
          ).pipe(retryWhen(retryStrategy))
        )
      )
    ),
    retryWhen(retryStrategy)
  )
}
