// Copyright 2017 Rigo Investment Sagl.
// This file is part of RigoBlock.

import rp from 'request-promise';
import { ERCdEX, Ethfinex } from './const';
import { SupportedExchanges } from './const';
import * as http from './exchanges';
import * as ws from './exchangesWs';
import * as FORMAT from './format';

class Exchange {
  constructor(exchange = Ethfinex, network = '1', transport = 'http') {
    if (typeof SupportedExchanges[exchange] === 'undefined') {
      throw new Error('Exchange not supported: ' + exchange)
    }
    if (!SupportedExchanges[exchange].supportedNetworks.includes(network)) {
      throw new Error('Network not supported on this exchange: ' + network)
    }
    this._exchange = exchange
    this._network = network
    this._transport = transport
    this._exchangeProperties = SupportedExchanges[exchange]
    this._call = {
      http,
      ws
    }
  }

  returnResults = (query, formatFunction = (input) => { return input }) => {
    switch (this._transport) {
      case 'ws':
        return query
      case 'http':
        return rp(query())
          .then(results => {
            // console.log(results)
            // console.log(formatFunction)
            // console.log(formatFunction(results))
            return formatFunction(results)
          })
          .catch(err => {
            return err
          })
      default:
        throw new Error('Transport unknown')
    }
  }

  getAggregatedOrders = (baseToken, quoteToken) => {
    console.log(`Fetching aggregated orders from ${this._exchange}`)
    if (!baseToken) {
      throw new Error('baseToken needs to be set')
    }
    if (!quoteToken) {
      throw new Error('quoteToken needs to be set')
    }
    return this.returnResults(
      () => {
        switch (this._exchange) {
          case ERCdEX:
            return this._call[this._transport].getAggregatedOrders[this._exchange](this._network, baseToken, quoteToken)
          case Ethfinex:
            return this._call[this._transport].getAggregatedOrders[this._exchange](this._network, baseToken, quoteToken)
          default:
            throw new Error('Relay unknown')
        }
      },
      FORMAT.aggregatedOrders[this._exchange]
    )
  }

  getTicker = (baseToken, quoteToken) => {
    if (!baseToken) {
      throw new Error('baseToken needs to be set')
    }
    if (!quoteToken) {
      throw new Error('quoteToken needs to be set')
    }
    return this.returnResults(() => {
      switch (this._exchange) {
        case ERCdEX:
          return this._call[this._transport].getTicker[this._exchange](this._network, baseToken, quoteToken)
        case Ethfinex:
          return this._call[this._transport].getTicker[this._exchange](this._network, baseToken, quoteToken)
        default:
          throw new Error('Relay unknown')
      }
    }
    )
  }

  getTickers = () => {
    console.log(`Fetching tokens prices from ${this._exchange}`)
    return this.returnResults(
      () => {
        return this._call[this._transport].getTickers[this._exchange](this._network, this._exchangeProperties.tickersTokenPairs)
      },
      FORMAT.tickers[this._exchange]
    )
  }
}

export default Exchange