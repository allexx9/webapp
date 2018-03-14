// Copyright 2017 Rigo Investment Sarl.
// This file is part of RigoBlock.

import * as abis from '../../contracts/abi';
import Registry from '../registry';
import { RIGOTOKEN } from '../../utils/const'

class RigoTokenWeb3 {
  constructor (api) {
    if (!api) {
      throw new Error('API instance needs to be provided to Contract')
    }
    this._api = api
    this._abi = abis.rigotoken
    this._registry = new Registry(api)
    this._constunctorName = this.constructor.name
    this._contractName = RIGOTOKEN
  }

  get instance () {
    if (typeof this._instance === 'undefined') {
      throw new Error('The contract needs to be initialized.')
    }
    return this._instance;
  }

  init = () => {
    const contractAbi = this._abi
    const contractName = this._contractName
    return this._registry.instance(contractAbi, contractName)
      .then (contract => {
        this._instance = contract
        return this._instance
      })
  }

  balanceOf = (accountAddress) =>{
    if (!accountAddress) {
      throw new Error('accountAddress needs to be provided')
    }
    const instance = this._instance
    console.log(instance)
    return instance.methods.balanceOf(accountAddress).call({},)
  }

  transfer = (toAddress, amount) => {
    if (!toAddress) {
      throw new Error('toAddress needs to be provided')
    }
    if (!amount) {
      throw new Error('amount needs to be provided')
    }
    const instance = this._instance
    const options = {
      // value: amount
    }

    return instance.methods.transfer(toAddress, amount).estimateGas(options)
    .then((gasEstimate) => {
      console.log(gasEstimate)
      options.gas = gasEstimate
    })
    .then(()=>{
      return instance.methods.transfer(toAddress, amount).send(options)
    })
  }

}

export default RigoTokenWeb3;
