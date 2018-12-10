// Copyright 2017 Rigo Investment Sagl.
// This file is part of RigoBlock.

import * as abis from '../../contracts/abi'
import { VAULTEVENTFUL } from '../../utils/const'
import Registry from '../registry'

class VaultEventfulWeb3 {
  constructor(api) {
    if (!api) {
      throw new Error('API instance needs to be provided to Contract')
    }
    this._api = api
    this._abi = abis.vaulteventful
    this._registry = new Registry(api)
    this._constunctorName = this.constructor.name
    this._contractName = VAULTEVENTFUL
    this._contractAddress = ''
  }

  get instance() {
    if (typeof this._instance === 'undefined') {
      throw new Error('The contract needs to be initialized.')
    }
    return this._instance
  }

  get contract() {
    if (typeof this._contract === 'undefined') {
      throw new Error('The contract needs to be initialized.')
    }
    return this._contract
  }

  get hexSignature() {
    return this._hexSignature
  }

  get abi() {
    return this._abi
  }

  init = () => {
    if (typeof global.baseContracts !== 'undefined') {
      const instance = new this._api.eth.Contract(
        global.baseContracts['VaultEventful'].abi,
        global.baseContracts['VaultEventful'].address
      )
      this._contract = instance
      this._contractAddress = global.baseContracts['VaultEventful'].address
      let hexSignature = []
      global.baseContracts['VaultEventful'].abi.map(function(element) {
        if (element.type === 'event') {
          return (hexSignature[element.name] = element.signature)
        }
        return true
      })
      this._hexSignature = hexSignature
      return this._contract
    }

    const contractAbi = this._abi
    const contractName = this._contractName
    return typeof this._contract !== 'undefined'
      ? this._contract
      : this._registry.instance(contractAbi, contractName).then(contract => {
          this._contract = contract
          this._contractAddress = contract._address
          let hexSignature = []
          this._abi.map(function(element) {
            if (element.type === 'event') {
              return (hexSignature[element.name] = element.signature)
            }
            return true
          })

          this._hexSignature = hexSignature
          return this._contract
        })
  }

  getAllLogs = (
    options = {
      topics: [null, null, null, null],
      fromBlock: 0,
      toBlock: 'latest'
    }
  ) => {
    return this._contract
      .getPastEvents('allEvents', {
        fromBlock: options.fromBlock,
        toBlock: options.toBlock,
        topics: options.topics
      })
      .then(function(logs) {
        return logs
      })
  }
}

export default VaultEventfulWeb3
