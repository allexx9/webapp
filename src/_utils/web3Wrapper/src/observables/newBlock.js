import { Observable } from 'rxjs'
import { delay, retryWhen, tap, timeout } from 'rxjs/operators'

export default web3 => {
  const timeoutMs = 120000
  const retryDelay = 10000

  return Observable.create(observer => {
    const subscription = web3.eth.subscribe('newBlockHeaders', (err, msg) =>
      err ? observer.error(err) : observer.next(msg)
    )
    return () => subscription.unsubscribe()
  }).pipe(
    timeout(timeoutMs),
    retryWhen(error$ =>
      error$.pipe(
        tap(err => console.log(`blockHeaders$ error: ${err.message}`)),
        delay(retryDelay)
      )
    )
  )
}
