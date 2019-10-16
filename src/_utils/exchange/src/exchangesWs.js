// Copyright 2017 Rigo Investment Sagl.
// This file is part of RigoBlock.

import { NETWORKS_ID, SupportedExchanges } from './const'
// import ReconnectingWebSocket from 'reconnecting-websocket'
import ReconnectingWebSocket from 'reconnecting-websocket/dist/reconnecting-websocket-amd.js'

const wsOptions = ['', { minReconnectionDelay: 1 }]

export const getAggregatedOrders = {
  // ERCdEX: (networkId = 1, baseTokenAddress, quoteTokenAddress) => {
  //   const websocket = new ReconnectingWebSocket(
  //     SupportedExchanges.ERCdEX.ws[NETWORKS_ID[networkId]]
  //   )
  //   websocket.addEventListener('open', () => {
  //     console.log('WebSocket open.')
  //     try {
  //       websocket.send(`sub:ticker`)
  //       websocket.send(
  //         `sub:pair-order-change/${baseTokenAddress}/${quoteTokenAddress}`
  //       )
  //       websocket.send(
  //         `sub:pair-order-change/${quoteTokenAddress}/${baseTokenAddress}`
  //       )
  //     } catch (err) {
  //       throw new Error(
  //         `Error connectiong to ${
  //           SupportedExchanges.ERCdEX.ws[NETWORKS_ID[networkId]]
  //         }`
  //       )
  //     }
  //   })
  //   return websocket
  // },
  Ethfinex: (networkId = 1, baseTokenSymbol, quoteTokenSymbol) => {
    const websocket = new ReconnectingWebSocket(
      SupportedExchanges.Ethfinex.ws[NETWORKS_ID[networkId]],
      ...wsOptions
    )
    return websocket
  }
}

export const getTicker = {
  ERCdEX: (networkId = 1, baseTokenAddress, quoteTokenAddress) => {
    const websocket = new ReconnectingWebSocket(
      SupportedExchanges.ERCdEX.ws[NETWORKS_ID[networkId]],
      ...wsOptions
    )
    websocket.addEventListener('open', () => {

      try {
        websocket.send(`sub:ticker`)
        websocket.send(
          `sub:pair-order-change/${baseTokenAddress}/${quoteTokenAddress}`
        )
        websocket.send(
          `sub:pair-order-change/${quoteTokenAddress}/${baseTokenAddress}`
        )
      } catch (err) {
        throw new Error(
          `Error connectiong to ${
            SupportedExchanges.ERCdEX.ws[NETWORKS_ID[networkId]]
          }`
        )
      }
    })
    return websocket
  },
  Ethfinex: (networkId = 1 /* baseTokenSymbol , */ /* quoteTokenSymbol */) => {
    const websocket = new ReconnectingWebSocket(
      SupportedExchanges.Ethfinex.ws[NETWORKS_ID[networkId]],
      ...wsOptions
    )
    return websocket
  }
}

export const getTickers = {
  ERCdEX: networkId => {
    throw Error(
      `NetworkId ${networkId} getTickers Ws for ERCdEX not implemented.`
    )
  },
  Ethfinex: networkId => {
    const websocket = new ReconnectingWebSocket(
      SupportedExchanges.Ethfinex.ws[NETWORKS_ID[networkId]],
      ...wsOptions
    )
    // websocket.addEventListener('open', () => {
    //   let msg = JSON.stringify({
    //     event: `subscribe`,
    //     channel: `candles`,
    //     key: `trade:1m:t${baseToken}${quoteToken}`
    //   })
    //   websocket.send(msg);
    // })
    return websocket
  }
}

export const getHistoricalPricesData = {
  ERCdEX: networkId => {
    throw Error(
      `NetworkId ${networkId} getTickers Ws for ERCdEX not implemented.`
    )
  },
  Ethfinex: networkId => {
    const websocket = new ReconnectingWebSocket(
      SupportedExchanges.Ethfinex.ws[NETWORKS_ID[networkId]],
      ...wsOptions
    )
    // websocket.addEventListener('open', () => {
    //   let msg = JSON.stringify({
    //     event: `subscribe`,
    //     channel: `candles`,
    //     key: `trade:1m:t${baseToken}${quoteToken}`
    //   })
    //   websocket.send(msg);
    // })
    return websocket
  }
}
