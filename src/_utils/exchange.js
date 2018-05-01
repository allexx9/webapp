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
import { BigNumber } from '@0xproject/utils';
import ReconnectingWebSocket from 'reconnectingwebsocket'
import { HttpClient } from '@0xproject/connect';
import rp from 'request-promise'
import { Aqueduct } from 'aqueduct';

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
    this._tradeTokensPair = null
    this._baseTokenAddress = null
    this._quoteTokenAddress = null
    this._supportedRelays = [
      "wss://ws.kovan.radarrelay.com/0x/v0/ws",
      ""
    ]
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
    
    const ZeroExConfig = {
      networkId: this._network.id,
      // exchangeContractAddress: this._network.id
    }
    this._zeroEx = new ZeroEx(window.web3.currentProvider, ZeroExConfig);
  }

  get timeout() {
    return this._timeout;
  }

  set timeout(timeout) {
    this._timeout = timeout
  }

  get tradeTokensPair() {
    return this._tradeTokensPair;
  }

  set tradeTokensPair(tradeTokensPair) {
    this._baseTokenAddress = tradeTokensPair.baseToken.address
    this._quoteTokenAddress = tradeTokensPair.quoteToken.address
    this._tradeTokensPair = tradeTokensPair
  }

  init = () => {
    // console.log(Aqueduct.Initialize())
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

  getOrderBookFromRelay = (relay = 'wss://ws.kovan.radarrelay.com/0x/v0/ws') => {
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
    console.log(subscribeMsg)
    var ws = new ReconnectingWebSocket(relay);
    ws.onopen = function () {
      console.log(`Connected to ${relay}`);
      ws.send(subscribeMsg);
    };
    ws.onerror = (event) => {
      console.log(event)
      console.log('Connection error')
    }
    ws.onclose = async (event) => {
      console.log(event)
      console.log('Connection closed')
    }
    return ws
  }

  formatOrders = (orders, orderType) =>{
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

  fillOrderToExchange = async (signedOrder, amount) =>{
    const zeroEx = this._zeroEx
    const DECIMALS = 18;
    const shouldThrowOnInsufficientBalanceOrAllowance = true;
    const fillTakerTokenAmount = ZeroEx.toBaseUnitAmount(new BigNumber(amount), DECIMALS)
    const takerAddress = await zeroEx.getAvailableAddressesAsync()
    console.log(takerAddress)
    console.log(fillTakerTokenAmount)
    const txHash = await zeroEx.exchange.fillOrderAsync(
      signedOrder,
      fillTakerTokenAmount,
      shouldThrowOnInsufficientBalanceOrAllowance,
      takerAddress[0],
      {
        shouldValidate: false
      }
    );
    const txReceipt = await this._zeroEx.awaitTransactionMinedAsync(txHash);
    console.log('FillOrder transaction receipt: ', txReceipt);
  }

  signOrder = async (order) => {
    const zeroEx = this._zeroEx
    const DECIMALS = 18;
    var makerTokenAmount, takerTokenAmount
    switch (order.orderType) {
      case "asks":
        makerTokenAmount = new BigNumber(order.orderFillAmount)
        takerTokenAmount = new BigNumber(makerTokenAmount).mul(new BigNumber(order.orderPrice))
        break;
      case "bids":
        makerTokenAmount = new BigNumber(order.orderFillAmount).mul(new BigNumber(order.orderPrice))
        takerTokenAmount = new BigNumber(order.orderFillAmount)
        break;
    }
    const tokensAmounts = {
      makerTokenAmount: ZeroEx.toBaseUnitAmount(makerTokenAmount, DECIMALS), // Base 18 decimals
      takerTokenAmount: ZeroEx.toBaseUnitAmount(takerTokenAmount, DECIMALS), // Base 18 decimals
    };
    var orderToBeSigned = { ...order.details.order, ...tokensAmounts }
    const fees = await this.getFees(orderToBeSigned)
    console.log(fees)
    const orderToBeSignedWithFees = {
      ...orderToBeSigned,
      ...fees
    }
    console.log(orderToBeSignedWithFees)
    const orderHash = ZeroEx.getOrderHashHex(orderToBeSignedWithFees);
    console.log(ZeroEx.isValidOrderHash(orderHash))
    const shouldAddPersonalMessagePrefix = true;
    const signer = await zeroEx.getAvailableAddressesAsync();
    const ecSignature = await zeroEx.signOrderHashAsync(orderHash, signer[0], shouldAddPersonalMessagePrefix);
    console.log(ZeroEx.isValidSignature(
      orderHash,
      ecSignature,
      orderToBeSigned.maker
    )
  )

    // Append signature to order
    const signedOrder = {
      ...orderToBeSignedWithFees,
      ecSignature,
    };
    return signedOrder
  }

  getFees = async (feesRequest) => {
    
    const relayerApiUrl = 'https://api.kovan.radarrelay.com/0x/v0/'
    const relayerClient = new HttpClient(relayerApiUrl);
    const relayerFees = await relayerClient.getFeesAsync(feesRequest)
    return relayerFees
    // {
    //   exchangeContractAddress: string,
    //   expirationUnixTimestampSec: BigNumber,
    //   maker: string,
    //   makerTokenAddress: string,
    //   makerTokenAmount: BigNumber,
    //   salt: BigNumber,
    //   taker: string,
    //   takerTokenAddress: string,
    //   takerTokenAmount: BigNumber,
    // }
  }

  sendOrderToRelay = async (signedOrder) => {
    console.log(signedOrder)
    const relayerApiUrl = 'https://api.kovan.radarrelay.com/0x/v0/order'
    // const relayerClient = new HttpClient(relayerApiUrl);
    // const response = await relayerClient.submitOrderAsync(signedOrder);
    // console.log(response)
    var options = {
      method: 'POST',
      uri: relayerApiUrl,
      body: signedOrder,
      json: true // Automatically stringifies the body to JSON
  };
  
  rp(options)
      .then(function (parsedBody) {
        console.log(parsedBody)
          // POST succeeded...
      })
      .catch(function (err) {
        console.log(err)
          // POST failed...
      });
  }

  newMakerOrder = async (orderType) => {
    const zeroEx = this._zeroEx
    const DECIMALS = 18;
    const EXCHANGE_ADDRESS = zeroEx.exchange.getContractAddress();
    const accounts = await zeroEx.getAvailableAddressesAsync();
    const makerAddress = accounts[0]
    const makerTokenAddress = (orderType === 'asks') ? this._baseTokenAddress : this._quoteTokenAddress
    const takerTokenAddress = (orderType === 'asks') ? this._quoteTokenAddress : this._baseTokenAddress

    const order = {
      // maker: "0x57072759Ba54479669CAdF1A25528a472Af95cEF".toLowerCase(),
      maker: makerAddress,
      dragoAddress: "0x57072759Ba54479669CAdF1A25528a472Af95cEF".toLowerCase(),
      taker: ZeroEx.NULL_ADDRESS,
      feeRecipient: ZeroEx.NULL_ADDRESS,
      makerTokenAddress: makerTokenAddress,
      takerTokenAddress: takerTokenAddress,
      exchangeContractAddress: EXCHANGE_ADDRESS,
      salt: ZeroEx.generatePseudoRandomSalt(),
      makerFee: '0',
      takerFee: '0',
      makerTokenAmount: '0', // Base 18 decimals
      takerTokenAmount: '0', // Base 18 decimals
      expirationUnixTimestampSec: new BigNumber(Date.now() + 2592000), // Valid for up to 1 month
    };
    return order
  }

  addOrderToOrderBook = (order, orders) => {
    console.log(order, orders)
    var orderPrice, orderAmount, orderType
    (this._baseTokenAddress === order.makerTokenAddress ? orderType = 'asks' : orderType = 'bids')
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
    switch (orderType) {
      case "asks":
        orders.asksOrders.push(orderObject)
        break;
      case "bids":
        orders.bidsOrders.push(orderObject)
        break;
    }
    console.log(orders)
    return orders
  }
}

export default Exchange;