// Copyright 2017 Rigo Investment Sagl.
// This file is part of RigoBlock.

import * as abis from '../../contracts/abi'
import { DRAGOEVENTFUL } from '../../utils/const'
import { toHex } from '../../utils'
import Registry from '../registry'

const Web3 = require('web3')

class DragoEventfulWeb3 {
  constructor(api) {
    if (!api) {
      throw new Error('API instance needs to be provided to Contract')
    }
    this._api = api
    this._abi = abis.dragoeventful
    this._registry = new Registry(api)
    this._constunctorName = this.constructor.name
    this._contractName = DRAGOEVENTFUL
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
    const contractAbi = this._abi
    const contractName = this._contractName
    return typeof this._contract !== 'undefined'
      ? this._contract
      : this._registry.instance(contractAbi, contractName).then(contract => {
          console.log(contract)
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
    // // console.log(options)
    // const contractAddress = this._contractAddress
    // const web3 = new Web3(this._api.provider._url)

    // const contractWeb3 = new web3.eth.Contract(
    //   this._abi,
    //   contractAddress.toLowerCase()
    // )
    return this._contract
      .getPastEvents('allEvents', {
        fromBlock: options.fromBlock,
        toBlock: options.toBlock,
        topics: options.topics
      })
      .then(function(logs) {
        return logs
      })
    // return this._api.eth.getLogs(options).then(function(logs) {
    //   console.log(logs)
    //   return contract.parseEventLogs(logs)
    // })
  }
}

export default DragoEventfulWeb3
