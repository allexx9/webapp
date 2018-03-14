// Copyright 2017 Rigo Investment Sarl.
// This file is part of RigoBlock.

import * as abis from '../../contracts/abi';
import Registry from '../registry';
import { toHex } from '../../utils';
import {RIGOTOKEN_ADDRESSES} from '../../utils/const'

class RigoToken {
  constructor (api) {
    if (!api) {
      throw new Error('API instance needs to be provided to Contract')
    }
    this._api = api
    this._abi = abis.rigotoken
    this._registry = new Registry(api)
    this._constunctorName = this.constructor.name
  }

  get instance () {
    if (typeof this._instance === 'undefined') {
      throw new Error('The contract needs to be initialized.')
    }
    return this._instance;
  }

  // init = () => {
  //   const contractAbi = this._abi
  //   const contractName = this._contractName
  //   return this._registry.instance(contractAbi, contractName)
  //     .then (contract => {
  //       this._instance = contract.instance
  //       this._contract = contract
  //       const hexSignature = this._contract._events.reduce((events, event) => {
  //         events[event._name] = toHex(event._signature)
  //         return events
  //       }, {})
  //       this._hexSignature = hexSignature
  //       return this._instance
  //     })
  // }

  init = () => {
    const api = this._api
    const abi = this._abi
    const address = RIGOTOKEN_ADDRESSES[api._rb.network.id]
    this._instance = api.newContract(abi, address).instance
    return this._instance
  }

  balanceOf = (accountAddress) => {
    if (!accountAddress) {
      throw new Error('accountAddress needs to be provided')
    }
    const instance = this._instance
    return instance.balanceOf.call({}, [accountAddress])
  }

  transfer = (toAddress, amount) => {
    if (!toAddress) {
      throw new Error('toAddress needs to be provided')
    }
    if (!amount) {
      throw new Error('amount needs to be provided')
    }
    const instance = this._instance
    const values = [toAddress, amount]
    const options = {
      // value: amount
    }
    return instance.transfer
    .estimateGas(options, values)
    .then((gasEstimate) => {
      options.gas =  gasEstimate.mul(1.2).toFixed(0);
      console.log(`Buy Vault: gas estimated as ${gasEstimate.toFixed(0)} setting to ${options.gas}`)
      return instance.transfer.postTransaction(options, values)
    })
  }

}

export default RigoToken;
