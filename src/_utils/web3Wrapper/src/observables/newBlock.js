import { CALL_TIMEOUT, RETRY_DELAY } from '../utils/const'
import { Observable, timer } from 'rxjs'
import { delay, exhaustMap, retryWhen } from 'rxjs/operators'

export default web3 =>
  timer(0, 2000).pipe(
    exhaustMap(() =>
      Observable.create(async observer => {
        const blockPromise = web3.eth.getBlockNumber()
        const timeoutPromise = new Promise((resolve, reject) =>
          setTimeout(
            () => reject(new Error('Request timed out.')),
            CALL_TIMEOUT
          )
        )
        try {
          const blockNumber = await Promise.race([blockPromise, timeoutPromise])

          observer.next(blockNumber)
          observer.complete()
        } catch (e) {
          return observer.error(e)
        }
        return () => observer.complete()
      })
    ),
    retryWhen(error$ => error$.pipe(delay(RETRY_DELAY)))
  )
