// Copyright 2016-2017 Rigo Investment Sagl.

import BigNumber from 'bignumber.js';
import {
  MSG_NO_SUPPORTED_NETWORK,
  MSG_NETWORK_STATUS_ERROR,
  NETWORK_WARNING
} from './const'
import PoolsApi from '../PoolsApi/src'
import utils from '../_utils/utils'

class Interfaces {

  constructor(api, networkId) {
    this._api = api
    this._parityNetworkId = networkId
    this._success = {}
    this._error = {}
    this._isConnected = {}
    this._sourceLogClass = this.constructor.name
  }

  get success() {
    return this._success;
  }

  get error() {
    return this._error;
  }

  isConnected = () => {
    // Checking if app is connected to node
    const api = this._api
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

  getAccountsParity() {
    console.log(`${this._sourceLogClass} -> getAccountsParity`)
    const api = this._api
    let accounts = {}
    let arrayPromises = []
    return api.parity
      .accountsInfo()
      .then((accountsInfo) => {
        const poolsApi = new PoolsApi(this._api)
        poolsApi.contract.rigotoken.init()
        Object.keys(accountsInfo).forEach(function (k) {
          // Getting accounts ETH balance
          accounts[k] = {}
          arrayPromises.push(api.eth.getBalance(k)
            .then((balance) => {
              accounts[k].ethBalance = utils.formatFromWei(balance)
              accounts[k].name = accountsInfo[k].name
              accounts[k].source = "parity"
              return accounts
            })
          )
          // Getting accounts GRG balance
          arrayPromises.push(poolsApi.contract.rigotoken.balanceOf(k)
            .then((rigoTokenBalance) => {
              accounts[k].rigoTokenBalance = utils.formatFromWei(rigoTokenBalance)
              return accounts
            })
          )
          // Getting transactions count
          arrayPromises.push(api.eth.getTransactionCount(k)
            .then((result) => {
              accounts[k].nonce = new BigNumber(result).toFixed()
              return accounts
            })
          )
        })
        return Promise
          .all(arrayPromises)
          .then(() => {
            console.log('Parity getAccounts', accounts)
            // const accountsData = {...results}
            // console.log(accountsData)
            return accounts
          })
      })
      .catch((error) => {
        console.warn('getAccounts', error);
        return {}
      })
  }

  getAccountsMetamask() {
    // console.log(`${this._sourceLogClass} -> getAccountsMetamask`)
    const web3 = window.web3
    const parityNetworkId = this._parityNetworkId
    let accountsMetaMask = {}
    if (typeof web3 === 'undefined') {
      return;
    }

    // Checking if MetaMask is connected to the same network as the endpoint
    return web3.eth.net.getId()
      .then((metaMaskNetworkId) => {
        let currentState = this._success
        if (metaMaskNetworkId !== parityNetworkId) {
          const stateUpdate = {
            networkCorrect: false,
            warnMsg: MSG_NO_SUPPORTED_NETWORK
          }
          this._success = { ...currentState, ...stateUpdate }
          return accountsMetaMask
        } else {
          const stateUpdate = {
            networkCorrect: true,
            warnMsg: ''
          }
          this._success = { ...currentState, ...stateUpdate }
          return web3.eth.getAccounts()
            .then(accounts => {
              // Returning empty object if MetaMask is locked.
              if (accounts.length === 0) {
                return {}
              }
              return web3.eth.getBalance(accounts[0])
                .then((ethBalance) => {
                  // const rigoTokenContract = api.newContract(rigotoken, GRG_ADDRESS_KV)
                  // return rigoTokenContract.instance.balanceOf.call({}, [accounts[0]])
                  let poolsApi = new PoolsApi(web3)
                  poolsApi.contract.rigotoken.init()
                  return poolsApi.contract.rigotoken.balanceOf(accounts[0])
                    .then((rigoTokenBalance) => {
                      accountsMetaMask = {
                        [accounts[0]]: {
                          ethBalance: utils.formatFromWei(ethBalance),
                          rigoTokenBalance: utils.formatFromWei(rigoTokenBalance),
                          name: "MetaMask",
                          source: "MetaMask"
                        }
                      }
                      return accountsMetaMask;
                    })
                })
                .catch((error) => {
                  console.warn(error)
                  return {}
                })
            })
            .catch((error) => {
              console.warn(error)
              return {}
            })
        }
      })
  }

  async attachInterfaceInfuraV2() {
    // console.log(`${this._sourceLogClass} -> Interface Infura`)
    const api = this._api
    try {
      const accountsMetaMask = await this.getAccountsMetamask(api)
      const allAccounts = { ...accountsMetaMask }
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
      const result = { ...this._success, ...stateUpdate }
      this._success = result
      return result
    } catch (error) {
      let currentState = this._error
      const stateUpdate = {
        networkError: NETWORK_WARNING,
        networkStatus: MSG_NETWORK_STATUS_ERROR,
      }
      this._error = { ...currentState, ...stateUpdate }
      console.warn('attachInterface', error)
    }
  }

  attachInterfaceRigoBlockV2 = () => {
    console.log(`${this._sourceLogClass} -> Interface RigoBlock`)
    const api = this._api
    // Checking if the parity node is running in --public-mode
    return api.parity.nodeKind()
      .then(result => {
        if (result.availability === 'public') {
          // if Parity in --public-node then getting only MetaMask accounts
          // return [this.getAccountsMetamask(api)]
          return [this.getAccountsParity(api), this.getAccountsMetamask(api)]
        }
        else {
          // if Parity NOT in --public-node then getting both Parity and MetaMask accounts
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
              accounts: Object.keys(allAccounts).length !== 0
                ? Object
                  .keys(allAccounts)
                  .map((address) => {
                    const info = allAccounts[address] || {};
                    return {
                      address,
                      name: info.name,
                      source: info.source,
                      ethBalance: info.ethBalance,
                      rigoTokenBalance: info.rigoTokenBalance,
                      nonce: info.nonce
                    };
                  })
                : []
            }
            const result = { ...this._success, ...stateUpdate }
            this._success = result
            return result
          })
          .catch((error) => {
            let currentState = this._error
            const stateUpdate = {
              networkError: NETWORK_WARNING,
              networkStatus: MSG_NETWORK_STATUS_ERROR,
            }
            this._error = { ...currentState, ...stateUpdate }
            console.log('attachInterfaceRigoBlock', error)
            return this._error

          });
      })
      .catch((error) => {
        let currentState = this._error
        const stateUpdate = {
          networkError: NETWORK_WARNING,
          networkStatus: MSG_NETWORK_STATUS_ERROR,
        }
        this._error = { ...currentState, ...stateUpdate }
        console.log('attachInterfaceRigoBlock', error)
        return this._error
      });
  }

  detachInterface = (api, subscriptionData) => {
    let sourceLogClass = this.constructor.name
    if (typeof subscriptionData === 'object') {
      console.log(subscriptionData)
      try {
        subscriptionData.unsubscribe(function (error, success) {
          if (success) {
            console.log(`${sourceLogClass}: Successfully unsubscribed from eth_blockNumber.`);
          }
          if (error) {
            console.warn(`${sourceLogClass}: Unsubscribe error ${error}.`)
          }
        });
      } catch (error) {
        console.log(error)
      }

    } else {
      try {
        api.unsubscribe(subscriptionData)
          .then(() => {
            console.log(`${sourceLogClass}: Successfully unsubscribed from eth_blockNumber -> Subscription ID: ${subscriptionData}.`);
          })
          .catch((error) => {
            console.warn(`${sourceLogClass}: Unsubscribe error ${error}.`)
          });
      } catch (error) {
        console.log(error)
      }
    }
  }
}

export { Interfaces };

