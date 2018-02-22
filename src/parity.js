// Copyright 2016-2017 Rigo Investment Sarl.

import Api from '@parity/api'
import Web3 from 'web3'
import {
  EP_INFURA_KV, EP_RIGOBLOCK_KV_DEV, EP_RIGOBLOCK_KV_PROD,
  PROD, WS, EP_RIGOBLOCK_KV_PROD_WS, EP_RIGOBLOCK_KV_DEV_WS,
} from './utils/const.js'

var HttpsUrl = '';
var WsSecureUrl = '';
const timeout = 5000; // to set the delay between each ping to the Http server. Default = 1000 (1 sec)
var endpoint = localStorage.getItem('endpoint')
console.log(endpoint)

// Checking if app is ruggin inside Parity UI. If positive, connect to localhost.
if (typeof window.parity !== 'undefined') {
  HttpsUrl = 'http://127.0.0.1:8545';
  WsSecureUrl = 'ws://127.0.0.1:8546';
  localStorage.setItem('endpoint', 'local')
  console.log('Found Parity!')
} else {
  if (endpoint !== null) {
    // Checking if the user has selected a specific endpoint. If not, defult = rigoblock
    switch (endpoint) {
      case "infura":
        HttpsUrl = EP_INFURA_KV
        // if (WS) {
        //   (PROD) ? WsSecureUrl = EP_INFURA_KV_WS : WsSecureUrl = EP_INFURA_KV_WS
        // } else {
        //   (PROD) ? HttpsUrl = EP_INFURA_KV : HttpsUrl = EP_INFURA_KV
        // }
        console.log('Endpoint infura')
        break;
      case "rigoblock":
        console.log('Endpoint rigoblock')
        if (WS) {
          (PROD) ? WsSecureUrl = EP_RIGOBLOCK_KV_PROD_WS : WsSecureUrl = EP_RIGOBLOCK_KV_DEV_WS
        } else {
          (PROD) ? HttpsUrl = EP_RIGOBLOCK_KV_PROD : HttpsUrl = EP_RIGOBLOCK_KV_DEV
        }
        break;
    }
  } else {
    console.log('Setting default endpoint to rigoblock')
    endpoint = 'rigoblock'
    localStorage.setItem('endpoint', 'rigoblock')
    if (WS) {
      (PROD) ? WsSecureUrl = EP_RIGOBLOCK_KV_PROD_WS : WsSecureUrl = EP_RIGOBLOCK_KV_DEV_WS
    } else {
      (PROD) ? HttpsUrl = EP_RIGOBLOCK_KV_PROD : HttpsUrl = EP_RIGOBLOCK_KV_DEV
    }
  }
}

// Checking if Web3 has been injected by the browser (Mist/MetaMask)
if (typeof window.web3 !== 'undefined') {
  console.log('Found MetaMask!')
  window.web3 = new Web3(window.web3.currentProvider)
} else {
  console.log('No web3? You should consider trying MetaMask!')

}

const checkTransport = () => {
  console.log(endpoint)
  switch (endpoint) {
    case "infura":
      try {
        const transport = new Api.Provider.Http(HttpsUrl, timeout)
        console.log("Connecting to ", HttpsUrl)
        return new Api(transport);
      } catch (err) {
        console.warn('Connection error: ', err);
      }
      break;
    case "rigoblock":
      if (!WS) {
        try {
          const transport = new Api.Provider.Http(HttpsUrl, timeout)
          console.log("Connecting to ", HttpsUrl)
          return new Api(transport);
        } catch (err) {
          console.warn('Connection error: ', err);
        }
      } else {
        try {
          console.log("Connecting to ", WsSecureUrl);
          const transport = new Api.Provider.WsSecure(WsSecureUrl);
          return new Api(transport);
        } catch (err) {
          console.warn('Connection error: ', err);
        }
      }
      break;
    case "local":
      return window.parity.api
      // if (!WS) {
      //   try {
      //     const transport = new Api.Provider.Http(HttpsUrl, timeout)
      //     console.log("Connecting to ", HttpsUrl)
      //     return new Api(transport);
      //   } catch (err) {
      //     console.warn('Connection error: ', err);
      //   }
      // } else {
      //   try {
      //     console.log("Connecting to ", WsSecureUrl);
      //     const transport = new Api.Provider.WsSecure(WsSecureUrl);
      //     return new Api(transport);
      //   } catch (err) {
      //     console.warn('Connection error: ', err);
      //   }
      // }
  }
}

var api = checkTransport()
console.log(api)
// api.isConnected ? console.log('Connected to Node:', api.isConnected) : console.log('Could not connect to node.')

export {
  api
};


