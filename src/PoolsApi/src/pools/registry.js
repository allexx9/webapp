// Copyright 2017 Rigo Investment Sagl.
// This file is part of RigoBlock.

// kovan register address 0xfAb104398BBefbd47752E7702D9fE23047E1Bca3

import * as abis from '../contracts/abi'
import { PARITY_REGISTRY_ADDRESSES } from '../utils/const'
import { isMetamask } from './../utils/utils'

class Registry {
  constructor(api) {
    if (!api) {
      throw new Error('API instance needs to be provided to Registry')
    }
    this._api = api
    this._constunctorName = this.constructor.name
    this._getContractAddressFromRegister = this._getContractAddressFromRegister.bind(
      this
    )
    this._getParityRegistryContractAddress = this._getParityRegistryContractAddress.bind(
      this
    )
    this._isWeb3 = isMetamask(api)
    this._isParity = typeof api._parity !== 'undefined' ? true : false
    this._isInfura = () => {
      if (typeof api.provider !== 'undefined') {
        if (api.provider._url.includes('infura')) {
          return true
        }
      } else {
        return false
      }
    }
  }

  _getParityRegistryContractAddress = () => {
    const api = this._api
    // Checking if using Web3
    // if (typeof api.version !== 'undefined') {
    //   return api.eth.net.getId()
    //     .then((id) => {
    //       return PARITY_REGISTRY_ADDRESSES[id]
    //     }
    //     )
    // }
    // // Using Parity API
    // return api.parity.chain()
    //   .then((id) => {
    //     return PARITY_REGISTRY_ADDRESSES[id]
    //   }
    //   )
    return api.eth.net.getId().then(networkId => {
      return PARITY_REGISTRY_ADDRESSES[networkId]
    })
  }

  /**
   * @param  {} contractName
   */
  _getContractAddressFromRegister = async contractName => {
    const api = this._api
    const parityRegistryContractAddress = await this._getParityRegistryContractAddress()
    if (!contractName) {
      throw new Error('contractName needs to be provided to Registry')
    }
    // console.log(`${this.constructor.name} -> Looking for contract: ${contractName}`)

    // Checking if using Web3
    if (typeof api.version !== 'undefined') {
      const registryContract = new api.eth.Contract(abis.parityregister)
      // console.log(`${this.constructor.name} -> Web3 detected.`)
      // console.log(
      //   `${
      //     this.constructor.name
      //   } -> Registry found at ${parityRegistryContractAddress}`
      // )
      registryContract.options.address = parityRegistryContractAddress
      return Promise.all([
        registryContract.methods
          .getAddress(api.utils.sha3(contractName), 'A')
          .call()
      ]).then(address => {
        // console.log(address)
        return address[0]
      })
    }
  }

  /**
   * @param  {} abi
   * @param  {} contractName
   */
  instance = (abi, contractName) => {
    if (!abi) {
      throw new Error('Contract ABI needs to be provided to Registry')
    }
    if (!contractName) {
      throw new Error('contractName needs to be provided to Registry')
    }
    const api = this._api
    const contract = this._getContractAddressFromRegister(contractName).then(
      address => {
        // console.log(`${contractName} -> ${address}`)
        if (address[0] === '0x0000000000000000000000000000000000000000') {
          throw new Error('The contract address was not found in the Register.')
        }
        if (!api) {
          throw new Error('API instance needs to be provided to Contract')
        }
        if (isMetamask(api)) {
          // console.log(
          //   `${
          //     this.constructor.name
          //   } -> Contract ${contractName} found at ${address}`
          // )
          return new api.eth.Contract(abi, address)
        }
        // console.log(
        //   `${
        //     this.constructor.name
        //   } -> Contract ${contractName} found at ${address}`
        // )
        return api.newContract(abi, address)
      }
    )
    return contract
  }
}

export default Registry
