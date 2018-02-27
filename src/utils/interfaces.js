// Copyright 2016-2017 Rigo Investment Sarl.

import { rigotoken } from '../DragoApi/src/contract/abi'
import BigNumber from 'bignumber.js';
import {
  DEFAULT_NETWORK_ID,
  MSG_NO_SUPPORTED_NETWORK,
  MSG_NETWORK_STATUS_ERROR,
  NETWORK_WARNING,
  GRG_ADDRESS_KV
} from './const'

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
      // console.log(api.isConnected)
      this._error = {
        networkError: NETWORK_WARNING,
        networkStatus: MSG_NETWORK_STATUS_ERROR,
      }
      return false
    }
    return true
  }

  getAccountsParity (api) {
    console.log('getAccountsParity')
    // const selectedEndpoint = localStorage.getItem('endpoint')
    var accounts = {}
    var arrayPromises = []
    return api.parity
    .accountsInfo()
    .then((accountsInfo) => {
      const rigoTokenContract = api.newContract(rigotoken, GRG_ADDRESS_KV)
      Object.keys(accountsInfo).forEach(function (k) {
        arrayPromises.push(api.eth.getBalance(k)
          .then((balance) => {
            accounts[k] = {
              ethBalance: api.util.fromWei(balance).toFormat(3),
              name: accountsInfo[k].name,
              source: "parity"
            }
            return accounts
          })
          .then((accounts) =>{
            arrayPromises.push(rigoTokenContract.instance.balanceOf.call({}, [k])
            .then((rigoTokenBalance) => {
              accounts[k].rigoTokenBalance = api.util.fromWei(rigoTokenBalance).toFormat(3)
              return accounts
            })
          )
          })
        )

      })
    })
    .then(() =>{
      return Promise
      .all(arrayPromises)
      .then(() => {
        console.log('Parity getAccounts', accounts)
        return accounts
      })
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

  getAccountsMetamask (api) {
    console.log('getAccountsMetamask')
    const web3 = window.web3
    var accountsMetaMask = {}
    var ethBalance = new BigNumber(0)
    if (typeof web3 === 'undefined') {
      return;
    }
    // Checking if MetaMask is connected to the right network (eg. Kovan)
    return web3.eth.net.getId()
    .then((networkId) => {
      var currentState = this._success
      if (networkId != DEFAULT_NETWORK_ID) {
        const stateUpdate = {
          networkCorrect: false,
          warnMsg: MSG_NO_SUPPORTED_NETWORK
        }
        this._success = {...currentState, ...stateUpdate}
      } else {
        const stateUpdate = {
          networkCorrect: true
        }
        this._success = {...currentState, ...stateUpdate}
      }
    })
    // Getting ETH and GRG balances
    .then (() =>{
      return web3.eth.getAccounts()
      .then(accounts => {
        return web3.eth.getBalance(accounts[0])
        .then(balance => {
          ethBalance = balance
        })
        .then(()=>{
          const rigoTokenContract = api.newContract(rigotoken, GRG_ADDRESS_KV)
          return rigoTokenContract.instance.balanceOf.call({}, [accounts[0]])
          .then((rigoTokenBalance) =>{
            accountsMetaMask = {
              [accounts[0]]: {
                ethBalance: api.util.fromWei(ethBalance).toFormat(3),
                rigoTokenBalance: api.util.fromWei(rigoTokenBalance).toFormat(3),
                name: "MetaMask",
                source: "MetaMask"
              }
            }
            return accountsMetaMask;
          }
        )
        })
      })
      .catch((error) =>{
        console.warn(error)
        return {}
      })
    })
  }

  attachInterfaceInfuraV2 = (api) => {
    console.log('Interface Infura')
    return Promise
    .all([
      this.getAccountsMetamask(api)
    ])
    .then(([accountsMetaMask]) => {
      const allAccounts = {...accountsMetaMask}
      console.log('Metamask account loaded: ', accountsMetaMask)
      const stateUpdate = {
        // accountsInfo: accountsMetaMask,
        loading: false,
        accounts: Object
          .keys(allAccounts)
          .map((address) => {
            const info = allAccounts[address] || {};
            return {
              address,
              name: info.name,
              source: info.source,
              ethBalance: info.ethBalance,
              rigoTokenBalance: info.rigoTokenBalance
            };
          })
        }
        const result = {...this._success, ...stateUpdate}
        this._success = result
        return result
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
    console.log('Interface RigoBlock')
    // Checking if the parity node is running in --public-mode
    return api.parity.nodeKind()
      .then(result => {
        if (result.availability === 'public') {
          console.log(result.availability)
          // if Parity in --public-node then getting only MetaMask accounts
          return [this.getAccountsMetamask(api)]
        }
        else {
          // if Parity NOT in --public-node then getting bot Parity and MetaMask accounts
          console.log(result.availability)
          return [this.getAccountsParity(api), this.getAccountsMetamask(api)]
        }
      })
      .then((getAccounts) => {
        return Promise
          .all(getAccounts)
          .then(([accountsInfo, accountsMetaMask]) => {
            const allAccounts = { ...accountsInfo, ...accountsMetaMask }
            console.log('Parity accounts loaded: ', accountsInfo)
            console.log('MetaMask account loaded: ', accountsMetaMask)
            const stateUpdate = {
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
                    ethBalance: info.ethBalance,
                    rigoTokenBalance: info.rigoTokenBalance
                  };
                })
            }
            const result = {...this._success, ...stateUpdate}
            this._success = result
            return result
          })
          .catch((error) => {
            var currentState = this._error
            const stateUpdate = {
              networkError: NETWORK_WARNING,
              networkStatus: MSG_NETWORK_STATUS_ERROR,
            }
            this._error = {...currentState, ...stateUpdate}
            console.log('attachInterfaceRigoBlock', error)
            return this._error
            
          });
      })
      .catch((error) => {
        var currentState = this._error
        const stateUpdate = {
          networkError: NETWORK_WARNING,
          networkStatus: MSG_NETWORK_STATUS_ERROR,
        }
        this._error = {...currentState, ...stateUpdate}
        console.log('attachInterfaceRigoBlock', error)
        return this._error
      });
  }

  detachInterface = (api, subscriptionData) => {
    const endpoint = localStorage.getItem('endpoint')
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

