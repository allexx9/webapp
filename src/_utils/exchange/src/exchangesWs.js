// Copyright 2017 Rigo Investment Sagl.
// This file is part of RigoBlock.

import { 
  SupportedExchanges,
  NETWORKS_ID
} from './const'
import ReconnectingWebSocket from 'reconnecting-websocket'

export const getTicker = {
  ERCdEX: (networkId = 1, baseTokenAddress, quoteTokenAddress) => {
    const websocket = new ReconnectingWebSocket(SupportedExchanges.ERCdEX.ws)
    websocket.addEventListener('open', (msg) => {
      console.log('WebSocket open.')
      websocket.send(`sub:pair-order-change/${baseTokenAddress}/${quoteTokenAddress}`);
      websocket.send(`sub:pair-order-change/${quoteTokenAddress}/${baseTokenAddress}`);
    });
    return websocket
  },
  Ethfinex: (networkId = 1) => {
    const symbols = SupportedExchanges.Ethfinex.tickersTokenPairs.toString()
    const options = {
      method: 'GET',
      url: `${SupportedExchanges.Ethfinex.http[NETWORKS_ID[networkId]]}/tickers?symbols=${symbols}`,
      qs: {},
      json: true
    }
    return options
  }
}