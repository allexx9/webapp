import { HTTP_EVENT_FETCHING, METAMASK } from '../const'
import Web3 from 'web3'
import Web3Wrapper from '../web3Wrapper/src'

export const getWeb3 = (options, networkInfo) => {
  if (networkInfo.id === 5777) {
    return new Web3(new Web3.providers.HttpProvider('http://localhost:8545'))
  }
  let web3
  switch (options.wallet) {
    case METAMASK: {
      if (typeof window !== 'undefined') {
        web3 = window.web3
      } else {
        web3 = 'Test env'
      }
      break
    }
    default: {
      if (HTTP_EVENT_FETCHING) {
        web3 = new Web3(networkInfo.transportHttp)
      } else {
        web3 = Web3Wrapper.getInstance(networkInfo.id)
      }
    }
  }
  return web3
}
