// Copyright 2016-2017 Rigo Investment Sarl.

import { rigotoken } from '../contracts'
import Web3 from 'web3';
import BigNumber from 'bignumber.js';
import {
  DEFAULT_NETWORK_ID,
  MSG_NO_KOVAN,
  MSG_NETWORK_STATUS_OK,
  MSG_NETWORK_STATUS_ERROR,
  NETWORK_OK,
  NETWORK_WARNING,
  INFURA,
  RIGOBLOCK,
  LOCAL,
  CUSTOM,
  ALLOWED_ENDPOINTS,
  DEFAULT_ENDPOINT,
  PROD,
  EP_RIGOBLOCK_KV_DEV_WS,
  EP_RIGOBLOCK_KV_PROD_WS
} from './const'
import * as abis from '../contracts';
import utils from './utils'

var sourceLogClass = null

class interfaces {

  constructor () {
    this._success = {}
    this._error = {}
    this._isConnected = {}
  }

  get success () {
    return this._success;
  }

  get error () {
    return this._error;
  }

  isConnected = (api) => {
    // Checking if app is connected to node
    if (!api.isConnected) {
      console.log(api.isConnected)
      this._error = {
        networkError: NETWORK_WARNING,
        networkStatus: MSG_NETWORK_STATUS_ERROR,
      }
      return false
    }
    return true
  }

  getAccountsParity () {
    const { api } = this.context;
    const selectedEndpoint = localStorage.getItem('endpoint')
    console.log(api)
    return api.parity
    .accountsInfo()
    .then((accountsInfo) => {
      console.log('Parity getAccounts', accountsInfo)
      Object.keys(accountsInfo).forEach(function(k) {
        accountsInfo[k] = {
          name: accountsInfo[k].name,
          source: "parity"
        }
      })
      return accountsInfo
    })
    .catch((error) => {
      console.warn('getAccounts', error);
      // return api.parity
      //   .accounts()
      //   .then((accountsInfo) => {
      //     return Object
      //       .keys(accountsInfo)
      //       .filter((address) => accountsInfo[address].uuid)
      //       .reduce((ret, address) => {
      //         ret[address] = {
      //           name: accountsInfo[address].name
      //         };
      //         return ret;
      //       }, {});
      //   }
      // );
      return {}
    })
  }

  getAccountsMetamask () {
    const web3 = window.web3
    if (typeof web3 === 'undefined') {
      return;
    }
    return web3.eth.net.getId()
    .then((networkId) => {
      if (networkId != DEFAULT_NETWORK_ID) {
        var currentState = this._success
        const stateUpdate = {
          networkCorrect: false,
          warnMsg: MSG_NO_KOVAN
        }
        this._success = {...currentState, ...stateUpdate}
        // this.setState({
        //   networkCorrect: false,
        //   warnMsg: MSG_NO_KOVAN
        // })
      } else {
        var currentState = this._success
        const stateUpdate = {
          networkCorrect: true
        }
        this._success = {...currentState, ...stateUpdate}
        // this.setState({
        //   networkCorrect: true
        // }) 
      }
    })
    .then (() =>{
      return web3.eth.getAccounts()
      .then(accounts => {
        const balance = web3.eth.getBalance(accounts[0])
        .then(balance => {
          return balance;
        })
        const accountsMetaMask = {
          [accounts[0]]: {
            name: "MetaMask",
            source: "MetaMask"
          }
        }
        return accountsMetaMask;
      })
      .catch((error) =>{
        console.warn(error)
        return {}
      })
    })
  }

  attachInterfaceInfuraV2 = (api) => {
    var sourceLogClass = this.constructor.name
    var WsSecureUrl = ''
    console.log('Interface Infura')
    return Promise
    .all([
      this.getAccountsMetamask()
    ])
    .then(([accountsMetaMask]) => {
      const allAccounts = {...accountsMetaMask}
      console.log('Metamask accounts loaded')
      var currentState = this._success
      const stateUpdate = {
        accountsInfo: accountsMetaMask,
        loading: false,
        accounts: Object
          .keys(allAccounts)
          .map((address) => {
            const info = allAccounts[address] || {};
            return {
              address,
              name: info.name,
              source: info.source,
              ethBalance: "0"
            };
          })
        }
      this._success = {...currentState, ...stateUpdate}
        // Subscribing to newBlockNumber event
        // api.subscribe('eth_blockNumber', this.onNewBlockNumber)
        //   .then((subscriptionID) => {
        //     console.log(`${sourceLogClass}: Subscribed to eth_blockNumber -> Subscription ID: ${subscriptionID}`);
        //     this.setState({ subscriptionData: subscriptionID });
        //   })
        //   .catch((error) => {
        //     console.warn('error subscription', error)
        //   });
      })
      .catch((error) => {
        var currentState = this._error
        const stateUpdate = {
          networkError: NETWORK_WARNING,
          networkStatus: MSG_NETWORK_STATUS_ERROR,
        }
        this._error = {...currentState, ...stateUpdate}
        console.warn('attachInterface', error)
      });
  }

  attachInterfaceRigoBlockV2 = (api) => {
    var sourceLogClass = this.constructor.name
    var WsSecureUrl = ''
    console.log('Interface RigoBlock')
    console.log(api)
    // if (!api.isConnected) {
    //   this._error = {
    //     networkError: NETWORK_WARNING,
    //     networkStatus: MSG_NETWORK_STATUS_ERROR,
    //   }
    //   // this.setState({
    //   //   networkError: NETWORK_WARNING,
    //   //   networkStatus: MSG_NETWORK_STATUS_ERROR,
    //   // })
    //   return
    // }
    // Checking if the parity node is running in --public-mode
    return api.parity.nodeKind()
      .then(result => {
        if (result.availability === 'public') {
          // if Parity in --public-mode then getting only MetaMask accounts
          return [this.getAccountsMetamask()]
        }
        else {
          // if Parity NOT in --public-mode then getting bot Parity and MetaMask accounts
          return [this.getAccountsParity(), this.getAccountsMetamask()]
        }
      })
      .then((getAccounts) => {
        return Promise
          .all(getAccounts)
          .then(([accountsInfo, accountsMetaMask]) => {
            const allAccounts = { ...accountsInfo, ...accountsMetaMask }
            console.log('Parity accounts loaded')
            console.log(allAccounts)
            var currentState = this._success
            const stateUpdate = {
              accountsInfo,
              loading: false,
              ethBalance: new BigNumber(0),
              accounts: Object
                .keys(allAccounts)
                .map((address) => {
                  const info = allAccounts[address] || {};
                  return {
                    address,
                    name: info.name,
                    source: info.source,
                    ethBalance: "0"
                  };
                })
            }
            this._success = {...currentState, ...stateUpdate}
            return this._success
            // Setting connection to node
            // if (PROD) {
            //   WsSecureUrl = EP_RIGOBLOCK_KV_PROD_WS
            // } else {
            //   WsSecureUrl = EP_RIGOBLOCK_KV_DEV_WS
            // }
            // Subscribing to newBlockNumber event
            // const web3 = new Web3(WsSecureUrl)
            // Promise
            // .all([web3.eth.subscribe('newBlockHeaders', this.onNewBlockNumber)])
            // .then(result =>{
            //   var subscription = result[0]
            //   console.log(`${sourceLogClass}: Subscribed to eth_blockNumber`);
            //   this.setState({ subscriptionData: subscription })
            // })
          })
          .catch((error) => {
            var currentState = this._error
            const stateUpdate = {
              networkError: NETWORK_WARNING,
              networkStatus: MSG_NETWORK_STATUS_ERROR,
            }
            this._error = {...currentState, ...stateUpdate}
            console.warn('attachInterfaceRigoBlock', error)
          });
      })
      .catch((error) => {
        var currentState = this._error
        const stateUpdate = {
          networkError: NETWORK_WARNING,
          networkStatus: MSG_NETWORK_STATUS_ERROR,
        }
        this._error = {...currentState, ...stateUpdate}
        console.warn('attachInterfaceRigoBlock', error)
      });
  }

  detachInterface = (api, subscriptionData) => {
    const endpoint = localStorage.getItem('endpoint')
    var WsSecureUrl = ''
    var sourceLogClass = this.constructor.name
    switch (endpoint) {
      case "infura":
        api.unsubscribe(subscriptionData)
          .then((result) => {
            console.log(result)
            console.log(`${sourceLogClass}: Successfully unsubscribed from eth_blockNumber -> Subscription ID: ${subscriptionData}.`);
          })
          .catch((error) => {
            console.warn(`${sourceLogClass}: Unsubscribe error ${error}.`)
          });
        break;
      default:
       if(subscriptionData) {
        subscriptionData.unsubscribe(function (error, success) {
          if (success) {
            console.log(`${sourceLogClass}: Successfully unsubscribed from eth_blockNumber.`);
          }
          if (error) {
            console.warn(`${sourceLogClass}: Unsubscribe error ${error}.`)
          }
        });
       }

    }
  } 
}

var Interfaces = new interfaces();
export {Interfaces};

