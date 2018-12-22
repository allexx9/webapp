// Copyright 2017 Rigo Investment Sagl.
// This file is part of RigoBlock.

import * as abis from '../../contracts/abi'
import {
  DRAGOREGISTRY,
  MULTI_POOL_DATA_CONTRACT_ADDRESS
} from '../../utils/const'
import Registry from '../registry'

class DragoRegistryWeb3 {
  constructor(api) {
    if (!api) {
      throw new Error('API instance needs to be provided to Contract')
    }
    this._api = api
    this._abi = abis.dragoregistry
    this._registry = new Registry(api)
    this._constunctorName = this.constructor.name
    this._contractName = DRAGOREGISTRY
    this._contractAddress = ''
  }

  get instance() {
    if (typeof this._instance === 'undefined') {
      throw new Error('The contract needs to be initialized.')
    }
    return this._instance
  }

  init = () => {
    const contractAbi = this._abi
    const contractName = this._contractName
    return this._registry.instance(contractAbi, contractName).then(contract => {
      this._instance = contract
      this._contractAddress = contract._address
      return this._instance
    })
  }

  fromId = dragoID => {
    if (!dragoID) {
      throw new Error('DragoID needs to be provided to fromId')
    }
    const instance = this._instance
    return Promise.all([instance.methods.fromId(dragoID).call({})])
  }

  fromAddress = dragoAddress => {
    if (!dragoAddress) {
      throw new Error(`dragoAddress needs to be provided to fromAddress`)
    }
    const instance = this._instance
    return instance.methods.fromAddress(dragoAddress).call({})
  }

  queryMultiDataFromId = async poolsIdArray => {
    if (!Array.isArray(poolsIdArray)) {
      throw new Error('poolsIdArray needs to be an array of token addresses')
    }
    console.log(this._contractAddress)
    const api = this._api
    const networkId = await api.eth.net.getId()
    const getMultiPoolsDataInstance = new api.eth.Contract(
      abis.getMultiPoolsData,
      MULTI_POOL_DATA_CONTRACT_ADDRESS[networkId]
    )
    return getMultiPoolsDataInstance.methods
      .queryMultiDataFromId(this._contractAddress, poolsIdArray)
      .call({})
  }
}

export default DragoRegistryWeb3
