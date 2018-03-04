// Copyright 2017 Rigo Investment Sarl.
// This file is part of RigoBlock.

// kovan register address 0xfAb104398BBefbd47752E7702D9fE23047E1Bca3

import * as abis from './abi/';
import { PARITY_REGISTRY_KOVAN, PARITY_REGISTRY_HOMESTEAD } from '../Utils/const'


class Registry {
  constructor (api) {
    if (!api) {
      throw new Error('API instance needs to be provided to Registry')
    }
    this._api = api
    this._constunctorName = this.constructor.name
    this._getContractAddressFromRegister = this._getContractAddressFromRegister.bind(this);
  }

  /**
   * @param  {} contractName
   */
  _getContractAddressFromRegister = (contractName) =>{
    const api = this._api
    console.log(`${this.constructor.name} -> Looking for contract: ${contractName}`)
    if (!contractName) {
      throw new Error('contractName needs to be provided to Registry')
    }
    // Checking if using Parity API and/or connected to Infura
    if (typeof api._parity !== 'undefined') {
      if (typeof api.provider !== 'undefined') {
        if (api.provider._url.includes("infura")) {
          console.log(`${this.constructor.name} -> Infura/MetaMask detected.`)
          const registry = api.newContract(abis.parityregister, PARITY_REGISTRY_KOVAN).instance;
          return Promise.all([
            registry.getAddress.call({}, [api.util.sha3(contractName), 'A'])
          ])
        }
      }
      console.log(`${this.constructor.name} -> RigoBlock node detected.`)
      return api.parity
      .registryAddress()
      .then((registryAddress) => {
        const registry = api.newContract(abis.parityregister, registryAddress).instance;
        return Promise.all([
          registry.getAddress.call({}, [api.util.sha3(contractName), 'A'])
        ])

      })
    }
    // Checking if using Web3
    if (typeof api.version !== 'undefined') {
      const registryContract = new api.eth.Contract(abis.parityregister)
      console.log('Web3 detected.')
      registryContract.options.address = PARITY_REGISTRY_KOVAN
      return Promise.all([
        registryContract.methods.getAddress(api.utils.sha3(contractName), 'A').call()
      ])
      .then((address) =>{
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
    var isMetaMask = false
    const contract = this._getContractAddressFromRegister(contractName)
    .then((address) => {
      if (address[0] == "0x0000000000000000000000000000000000000000") {
        throw new Error('The contract address was not found in the Register.')
      }
      if (!api) {
        throw new Error('API instance needs to be provided to Contract');
      }
      if (typeof api._provider === 'undefined') {
        isMetaMask = false
      } else {
        isMetaMask = api._provider.isMetaMask
      }
      if (isMetaMask) {
        return new api.eth.Contract(abi, address)
      }
      return api.newContract(abi, address)
    })
    .catch(error => {
      console.warn(error)
    })
    return contract
  }
}

export default Registry;
