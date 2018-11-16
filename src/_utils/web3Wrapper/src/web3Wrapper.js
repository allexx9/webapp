import { ENDPOINTS } from './utils/const'
import Web3 from 'web3'
import contract from './utils/contract'
import getEventful$ from './observables/eventful'

const nodeStatus = {
  isConnected: false,
  isSyncing: false,
  syncStatus: {},
  error: {}
}
class Web3Wrapper {
  web3 = null
  instance = null
  obs

  get status$() {
    return timer(0, 1000).pipe(
      exhaustMap(() => from(this.web3.eth.isSyncing())),
      map(
        syncStatus =>
          syncStatus
            ? {
                ...nodeStatus,
                isConnected: true,
                isSyncing: true,
                syncStatus
              }
            : { ...nodeStatus, isConnected: true }
      )
    )
  }

  init(networkId, protocol = 'wss') {
    const transport = ENDPOINTS[protocol][networkId].prod
    const provider = new Web3.providers.WebsocketProvider(transport)

    this.web3 = new Web3(provider)
    this.status$
      .pipe(
        timeout(10000),
        retryWhen(errors =>
          errors.pipe(
            tap(() => {
              console.error('Websocket disconnected. Setting new provider.')
            }),
            map(() =>
              this.web3.setProvider(
                new Web3.providers.WebsocketProvider(transport)
              )
            ),
            delay(5000)
          )
        )
      )
      .subscribe()
    return Object.assign(this.web3, {
      rigoblock: {
        eventful$: getEventful$(this.web3, networkId),
        nodeStatus$: this.status$,
        utils: { contract },
        endpoint: transport
      }
    })
  }

  getInstance = (networkId, protocol) => {
    if (!this.instance) {
      this.instance = this.init(networkId, protocol)
    }
    return this.instance
  }
}

export default new Web3Wrapper()
