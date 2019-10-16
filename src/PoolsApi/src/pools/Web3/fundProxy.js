// Copyright 2017 Rigo Investment Sagl.
// This file is part of RigoBlock.

import * as abis from '../../contracts/abi'
import Registry from '../registry'

class FundProxyWeb3 {
  constructor(api) {
    if (!api) {
      throw new Error('API instance needs to be provided to Contract')
    }
    this._api = api
    this._abi = abis.fundproxy
    this._registry = new Registry(api)
    this._constunctorName = this.constructor.name
  }

  get instance() {
    if (typeof this._instance === 'undefined') {
      throw new Error('The contract needs to be initialized.')
    }
    return this._instance
  }

  init = () => {
    const api = this._api
    const abi = this._abi

    const address = api._rb.network.fundProxyContractAddress
    this._instance = new api.eth.Contract(abi)
    this._instance.options.address = address
    return this._instance
  }

  balanceOf = accountAddress => {
    if (!accountAddress) {
      throw new Error('accountAddress needs to be provided')
    }
    const instance = this._instance
    return instance.methods.balanceOf(accountAddress).call({})
  }

  unwrapETH = (fromAddress, amount) => {
    if (!fromAddress) {
      throw new Error('toAddress needs to be provided')
    }
    if (!amount) {
      throw new Error('amount needs to be provided')
    }
    const instance = this._instance
    const options = {
      from: fromAddress
    }

    return instance.methods
      .unwrapEth(amount)
      .estimateGas(options)
      .then(gasEstimate => {

        options.gas = gasEstimate
      })
      .then(() => {
        return instance.methods.unwrapEth(amount).send(options)
      })
  }

  wrapETH = (fromAddress, amount) => {
    if (!fromAddress) {
      throw new Error('toAddress needs to be provided')
    }
    if (!amount) {
      throw new Error('amount needs to be provided')
    }
    const instance = this._instance
    const options = {
      from: fromAddress
    }

    return instance.methods
      .wrapEth(amount)
      .estimateGas(options)
      .then(gasEstimate => {

        options.gas = gasEstimate
      })
      .then(() => {
        return instance.methods.wrapEth(amount).send(options)
      })
  }
}

export default FundProxyWeb3
