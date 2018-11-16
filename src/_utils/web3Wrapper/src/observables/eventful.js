import * as CONSTANTS from '../utils/const'
import { Observable, from, merge, zip } from 'rxjs'
import { mergeMap } from 'rxjs/operators'
import dragoeventfulAbi from '../abis/dragoEventful-v2.json'
import parityregisterAbi from '../abis/parityRegister.json'
import vaulteventfulAbi from '../abis/vaultEventful-v2.json'

const filterOptions = {
  fromBlock: 'latest'
}

export default (web3, networkId) => {
  const parityRegistry = new web3.eth.Contract(
    parityregisterAbi,
    CONSTANTS.PARITY_REGISTRY_ADDRESSES[networkId]
  )

  return zip(
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
    mergeMap(([dragoEventfulAddress, vaultEventfulAddress]) => {
      const dragoEventful = new web3.eth.Contract(
        dragoeventfulAbi,
        dragoEventfulAddress
      )
      const vaultEventful = new web3.eth.Contract(
        vaulteventfulAbi,
        vaultEventfulAddress
      )
      return merge(
        createEventful$(dragoEventful),
        createEventful$(vaultEventful)
      )
    })
  )
}

const createEventful$ = eventfulContract =>
  Observable.create(observer => {
    const subscription = eventfulContract.events.allEvents(
      filterOptions,
      (err, msg) => (err ? observer.error(err) : observer.next(msg))
    )
    return () => subscription.unsubscribe()
  })
