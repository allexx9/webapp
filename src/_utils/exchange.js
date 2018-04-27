// Copyright 2017 Rigo Investment Sarl.
// This file is part of RigoBlock.

import Web3 from 'web3'
import {
  INFURA,
  KOVAN,
  PROD,
  WS
} from './const'
import * as abis from '../PoolsApi/src/contracts/abi'
import { ZeroEx } from '0x.js';
import BigNumber from 'bignumber.js'

class Exchange {

  constructor(endpointInfo, networkInfo = { name: KOVAN }, prod = PROD, ws = WS) {
    if (!endpointInfo) {
      throw new Error('endpointInfo connection data needs to be provided to Endpoint')
    }
    if (!networkInfo) {
      throw new Error('network name needs to be provided to Endpoint')
    }
    this._timeout = 1000
    this._endpoint = endpointInfo
    this._network = networkInfo
    this._exchangeAddress = this._network.zeroExExchangeContractAddress
    this._prod = prod
    this._exchangeAbi = abis.zeroExExchange
    this._baseTokenAddress = null
    this._quoteTokenAddress = null
    // Infura does not support WebSocket on Kovan network yet. Disabling.
    this._onWs = (this._network.name === KOVAN && this._endpoint.name === INFURA) ? false : ws
    // Setting production or development endpoints
    if (prod) {
      this._https = endpointInfo.https[this._network.name].prod
      this._wss = endpointInfo.wss[this._network.name].prod
    } else {
      this._https = endpointInfo.https[this._network.name].dev
      this._wss = endpointInfo.wss[this._network.name].dev
    }
  }

  get timeout() {
    return this._timeout;
  }

  set timeout(timeout) {
    this._timeout = timeout
  }

  set baseTokenAddress(baseTokenAddress) {
    console.log(baseTokenAddress)
    this._baseTokenAddress = baseTokenAddress
  }

  set quoteTokenAddress(quoteTokenAddress) {
    console.log(quoteTokenAddress)
    this._quoteTokenAddress = quoteTokenAddress
  }

  init = () => {
    if (this._onWs) {
      var api
      try {
        console.log("Network: ", this._network.name)
        console.log("Connecting to: ", this._wss)
        api = new Web3(this._wss)
        api._rb = {}
        api._rb.network = this._network
        this.api = api
        return new api.eth.Contract(this._exchangeAbi, this._exchangeAddress)
      } catch (error) {
        console.warn('Connection error: ', error)
        return error
      }
    } else {
      try {
        console.log("Network: ", this._network.name)
        console.log("Connecting to: ", this._https)
        api = new Web3(this._https)
        api._rb = {}
        api._rb.network = this._network
        this.api = api
        return new api.eth.Contract(this._exchangeAbi, this._exchangeAddress)
      } catch (error) {
        console.warn('Connection error: ', error)
        return error
      }
    }
  }

  getOrdersFromRelay = (relay = 'wss://ws.radarrelay.com/0x/v0/ws') => {
    if (!this._baseTokenAddress) {
      throw new Error('baseTokenAddress needs to be set')
    }
    if (!this._quoteTokenAddress) {
      throw new Error('quoteTokenAddress needs to be set')
    }
    const subscribeMsg = `{
      "type": "subscribe",
      "channel": "orderbook",
      "requestId": 1,
      "payload": {
          "baseTokenAddress": "${this._baseTokenAddress}",
          "quoteTokenAddress": "${this._quoteTokenAddress}",
          "snapshot": true,
          "limit": 100
      }
  }`
    var ws = new WebSocket(relay);
    ws.onopen = function () {
      console.log(`Connected to ${relay}`);
      ws.send(subscribeMsg);
    };
    ws.onmessage = function (event) {
      console.log(event.data)
      const data = JSON.parse(event.data)
      if (data.type === 'snapshot') {
        console.log(data.payload)
        return (data.payload)
      }
    };
  }

  formatOrders = (orders, orderType) =>{
    var ordersMap = new Map() 
    var orderPrice, orderAmount
    var formattedOrders = orders.map((order) => {
      switch (orderType) {
        case "asks":
          orderPrice = new BigNumber(order.takerTokenAmount).div(new BigNumber(order.makerTokenAmount)).toFixed(7)
          orderAmount = new BigNumber(this.api.utils.fromWei(order.makerTokenAmount, 'ether')).toFixed(5)
          break;
        case "bids":
          orderPrice = new BigNumber(1).div(new BigNumber(order.takerTokenAmount).div(new BigNumber(order.makerTokenAmount))).toFixed(7)
          orderAmount = new BigNumber(this.api.utils.fromWei(order.takerTokenAmount, 'ether')).toFixed(5)
          break;
      }
      var orderHash = ZeroEx.getOrderHashHex(order)
      var orderObject = {
        order,
        orderAmount,
        orderType,
        orderPrice,
        orderHash
      }
      return orderObject
    })
    return formattedOrders
  }
}

export default Exchange;