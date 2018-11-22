import { Observable, timer } from 'rxjs'
import { delay, exhaustMap, retryWhen } from 'rxjs/operators'

const defaultStatus = {
  isConnected: false,
  isSyncing: false,
  syncStatus: {},
  error: {}
}

export default web3 =>
  timer(0, 2000).pipe(
    exhaustMap(() =>
      Observable.create(async observer => {
        const syncPromise = web3.eth.isSyncing()
        const timeoutPromise = new Promise((resolve, reject) =>
          setTimeout(() => reject(new Error('Request timed out.')), 10000)
        )
        try {
          const status = await Promise.race([syncPromise, timeoutPromise])
          const nodeStatus = status
            ? { ...defaultStatus, isConnected: true, isSyncing: true }
            : { ...defaultStatus, isConnected: true }

          observer.next(nodeStatus)
          observer.complete()
        } catch (e) {
          observer.next({ ...defaultStatus, error: e })
          return observer.error(e)
        }
        return () => observer.complete()
      })
    ),
    retryWhen(error$ => error$.pipe(delay(5000)))
  )
