import * as CONST_ from '../utils/const'
import { Observable, timer } from 'rxjs'
import { finalize, mergeMap, retryWhen, timeout } from 'rxjs/operators'
import exchangeEfxV0Abi from '../abis/exchange-efx-v0.json'

const exchangeEfxV0$ = (web3, networkId) => {
  let subscription = null
  let retryAttemptNewBlock$ = 0
  return Observable.create(observer => {
    if (subscription !== null) {
      subscription.unsubscribe(function(error, success) {
        if (success) {
          console.log('**** exchangeEfxV0$ Successfully UNSUBSCRIBED! ****')
        }
        if (error) {
          console.log('**** exchangeEfxV0$ UNSUBSCRIBE error ****')
          console.warn(error)
        }
      })
    }
    let efxEchangeContract
    try {
      efxEchangeContract = new web3.eth.Contract(
        exchangeEfxV0Abi,
        CONST_.EFX_EXCHANGE_CONTRACT[networkId].toLowerCase()
      )
      // efxEchangeContract
      //   .getPastEvents(
      //     "allEvents",
      //     {
      //       fromBlock: 0,
      //       toBlock: "latest"
      //     },
      //     function(error, events) {
      //       console.log(events);
      //     }
      //   )
      //   .then(function(events) {
      //     console.log(events); // same results as the optional callback above
      //   });
      subscription = efxEchangeContract.events
        .allEvents(
          {
            fromBlock: 'latest'
          },
          function(error, event) {
            if (error !== null) {
              console.warn(`WS error 1 ${error}`)
              return observer.error(error)
            }
            console.log(error, event)
          }
        )
        .on('data', function(event) {
          console.log('Event: ' + JSON.stringify(event)) // same results as the optional callback above
          return observer.next(event)
        })
        .on('error', function(error) {
          console.warn(`WS error 2 ${error}`)
          return observer.error(error)
        })
    } catch (error) {
      console.log(`Catch ${error}`)
      return observer.error(error)
    }
    return () => {
      // efxEchangeContract.clearSubscriptions();
      console.log(subscription)
      subscription.unsubscribe()
      console.log(`Observable exit`)
      // observer.complete();
    }
  }).pipe(
    timeout(120000),
    retryWhen(error => {
      let scalingDuration = 5000
      error.error()
      return error.pipe(
        mergeMap(error => {
          if (subscription !== null) {
            subscription.unsubscribe(function(error, success) {
              if (success) {
                console.log('**** newBlock$ Successfully UNSUBSCRIBED! ****')
              }
              if (error) {
                console.log('**** newBlock$ UNSUBSCRIBE error ****')
                console.log(error)
              }
            })
          }
          console.log(`****  newBlock$ error: ${error.message} ****`)
          retryAttemptNewBlock$++
          console.log(`**** newBlock$ Attempt ${retryAttemptNewBlock$} ****`)
          return timer(scalingDuration)
        }),
        finalize(() => console.log('We are done!'))
      )
    })
  )
}

export default exchangeEfxV0$
