import { ENDPOINTS, INFURA } from './utils/const'
import Web3 from 'web3'
import Web3WsProvider from './utils/reconnectingWsProvider'
import exchangeEfxV0$ from './observables/exchangeEfx'
import getEventful$ from './observables/eventful'
import newBlock from './observables/newBlock'
import nodeStatus$ from './observables/nodeStatus'

class Web3Wrapper {
  web3 = null
  instance = null

  init(networkId, endpoint = INFURA, protocol = 'wss') {
    const transport = ENDPOINTS[endpoint][protocol][networkId].prod
    const provider = new Web3WsProvider(transport)
    this.web3 = new Web3(provider)

    return Object.assign(this.web3, {
      rigoblock: {
        ob: {
          eventful$: getEventful$(this.web3, networkId),
          exchangeEfxV0$: exchangeEfxV0$(this.web3, networkId),
          nodeStatus$: nodeStatus$(this.web3),
          newBlock$: newBlock(this.web3, networkId)
        },
        endpoint: transport
      }
    })
  }

  getInstance = (networkId, endpoint, protocol) => {
    if (!this.instance) {
      this.instance = this.init(networkId, endpoint, protocol)
    }
    return this.instance
  }
}

export default new Web3Wrapper()
