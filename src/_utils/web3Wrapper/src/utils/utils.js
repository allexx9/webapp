import Web3 from 'web3'

export const newWeb3 = provider => {
  return new Web3(provider)
}

export const errorMsg = error => {
  return error.charAt(0).toUpperCase() + error.slice(1)
}
