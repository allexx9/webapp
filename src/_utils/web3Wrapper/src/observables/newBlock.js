import { Observable, from, of } from 'rxjs'
import { catchError, concat, filter, map, timeout } from 'rxjs/operators'

export default web3 => {
  const timeoutMs = 60000
  const newBlock$ = Observable.create(observer => {
    const subscription = web3.eth.subscribe('newBlockHeaders', (err, msg) =>
      err ? observer.error(err) : observer.next(msg)
    )
    return () => subscription.unsubscribe()
  })

  const newBlockProxy$ = () =>
    from(
      fetch('https://api.endpoint.network/blockNumber').then(res => res.json())
    ).pipe(
      map(response => Number(response.result)),
      catchError(() => of(false))
    )

  const subScription$ = source$ =>
    source$.pipe(
      timeout(timeoutMs),
      catchError(() => newBlockProxy$().pipe(concat(subScription$(newBlock$))))
    )
  return subScription$(newBlock$).pipe(filter(val => !!val))
}
