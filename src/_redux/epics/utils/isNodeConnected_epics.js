import { map, skipWhile, tap } from 'rxjs/operators'

export const isNodeConnected$ = (action$, state$) =>
  state$.pipe(
    map(currentState => {
      // console.log(
      //   val.app.isConnected,
      //   val.exchange.selectedFund.details.address === 'undefined'
      // )
      return !currentState.app.isConnected
    }),
    tap(val => {

      return val
    }),
    skipWhile(val => val === true),
    tap(val => {

      return val
    })
  )
