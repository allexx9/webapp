// Copyright 2016-2017 Rigo Investment Sarl.

import BigNumber from 'bignumber.js';
import {
  MSG_NO_SUPPORTED_NETWORK,
  MSG_NETWORK_STATUS_ERROR,
  NETWORK_WARNING
} from './const'
import PoolsApi from '../PoolsApi/src'

class Interfaces {

  constructor (api, networkId) {
    this._api = api
    this._parityNetworkId = networkId
    this._success = {}
    this._error = {}
    this._isConnected = {}
    this._sourceLogClass = this.constructor.name
  }

  get success () {
    return this._success;
  }

  get error () {
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
    var accounts = {}
    var arrayPromises = []
    return api.parity
      .accountsInfo()
      .then((accountsInfo) => {
        // var poolsApi = new PoolsApi(api)
        // console.log(poolsApi.contract)
        // poolsApi.contract.rigotoken.init()
        // .then(() =>{
        //   poolsApi.contract.rigotoken.balanceOf('0x00791547B03F5541971B199a2d347446eB8Dc9bE')
        //   .then((rigoTokenBalance) => {
        //     console.log(api.util.fromWei(rigoTokenBalance).toFormat(3))
        //   })
        //   .catch((error) =>{
        //     console.log(error)
        //   })
        // })
        // const rigoTokenContract = api.newContract(rigotoken, GRG_ADDRESS_KV)
        const poolsApi = new PoolsApi(this._api)
        poolsApi.contract.rigotoken.init()
        Object.keys(accountsInfo).forEach(function (k) {
          // Getting accounts ETH balance
          accounts[k] = {}
          arrayPromises.push(api.eth.getBalance(k)
            .then((balance) => {
              accounts[k].ethBalance = api.util.fromWei(balance).toFormat(3)
              accounts[k].name = accountsInfo[k].name
              accounts[k].source = "parity"
              return accounts
            })
          )
          // Getting accounts GRG balance
          arrayPromises.push(poolsApi.contract.rigotoken.balanceOf(k)
            .then((rigoTokenBalance) => {
              accounts[k].rigoTokenBalance = api.util.fromWei(rigoTokenBalance).toFormat(3)
              return accounts
            })
          )
          // arrayPromises.push(rigoTokenContract.instance.balanceOf.call({}, [k])
          //   .then((rigoTokenBalance) => {
          //     accounts[k].rigoTokenBalance = api.util.fromWei(rigoTokenBalance).toFormat(3)
          //     return accounts
          //   })
          // )
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
    console.log(`${this._sourceLogClass} -> getAccountsMetamask`)
    const api = this._api
    const web3 = window.web3
    const parityNetworkId = this._parityNetworkId
    var accountsMetaMask = {}
    if (typeof web3 === 'undefined') {
      return;
    }

    // Checking if MetaMask is connected to the same network as the endpoint
    return web3.eth.net.getId()
      .then((metaMaskNetworkId) => {
        console.log(metaMaskNetworkId)
        console.log(parityNetworkId)
        var currentState = this._success
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
            console.log('not locked')
            return web3.eth.getBalance(accounts[0])
              .then((ethBalance) => {
                // const rigoTokenContract = api.newContract(rigotoken, GRG_ADDRESS_KV)
                // return rigoTokenContract.instance.balanceOf.call({}, [accounts[0]])
                var poolsApi = new PoolsApi(web3)
                poolsApi.contract.rigotoken.init()
                return poolsApi.contract.rigotoken.balanceOf(accounts[0])
                  .then((rigoTokenBalance) => {
                    accountsMetaMask = {
                      [accounts[0]]: {
                        ethBalance: api.util.fromWei(ethBalance).toFormat(3),
                        rigoTokenBalance: api.util.fromWei(rigoTokenBalance).toFormat(3),
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
      // Getting ETH and GRG balances
      // .then(() => {
      //   return web3.eth.getAccounts()
      //     .then(accounts => {
      //       // Returning empty object if MetaMask is locked.
      //       if (accounts.length === 0) {
      //         return {}
      //       }
      //       console.log('not locked')
      //       return web3.eth.getBalance(accounts[0])
      //         .then((ethBalance) => {
      //           // const rigoTokenContract = api.newContract(rigotoken, GRG_ADDRESS_KV)
      //           // return rigoTokenContract.instance.balanceOf.call({}, [accounts[0]])
      //           var poolsApi = new PoolsApi(web3)
      //           poolsApi.contract.rigotoken.init()
      //           return poolsApi.contract.rigotoken.balanceOf(accounts[0])
      //             .then((rigoTokenBalance) => {
      //               accountsMetaMask = {
      //                 [accounts[0]]: {
      //                   ethBalance: api.util.fromWei(ethBalance).toFormat(3),
      //                   rigoTokenBalance: api.util.fromWei(rigoTokenBalance).toFormat(3),
      //                   name: "MetaMask",
      //                   source: "MetaMask"
      //                 }
      //               }
      //               return accountsMetaMask;
      //             })
      //         })
      //         .catch((error) => {
      //           console.warn(error)
      //           return {}
      //         })
      //     })
      //     .catch((error) => {
      //       console.warn(error)
      //       return {}
      //     })
      // })
  }

  attachInterfaceInfuraV2 = () => {
    console.log(`${this._sourceLogClass} -> Interface Infura`)
    const api = this._api
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

  attachInterfaceRigoBlockV2 = () => {
    console.log(`${this._sourceLogClass} -> Interface RigoBlock`)
    const api = this._api
    // Checking if the parity node is running in --public-mode
    return api.parity.nodeKind()
      .then(result => {
        if (result.availability === 'public') {
          console.log(result.availability)
          // if Parity in --public-node then getting only MetaMask accounts
          // return [this.getAccountsMetamask(api)]
          return [this.getAccountsParity(api), this.getAccountsMetamask(api)]
        }
        else {
          // if Parity NOT in --public-node then getting both Parity and MetaMask accounts
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
            console.log(Object.keys(allAccounts).length)
            const stateUpdate = {
              loading: false,
              ethBalance: new BigNumber(0),
              accounts: Object.keys(allAccounts).length !== 0
                ? Object
                  .keys(allAccounts)
                  .map((address) => {
                    const info = allAccounts[address] || {};
                    console.log(info)
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
            console.log(stateUpdate)
            const result = {...this._success, ...stateUpdate}
            this._success = result
            console.log(result.accounts)
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
    var sourceLogClass = this.constructor.name
    if (typeof subscriptionData === 'object') {
      subscriptionData.unsubscribe(function (error, success) {
        if (success) {
          console.log(`${sourceLogClass}: Successfully unsubscribed from eth_blockNumber.`);
        }
        if (error) {
          console.warn(`${sourceLogClass}: Unsubscribe error ${error}.`)
        }
      });
    } else {
      api.unsubscribe(subscriptionData)
      .then((result) => {
        console.log(result)
        console.log(`${sourceLogClass}: Successfully unsubscribed from eth_blockNumber -> Subscription ID: ${subscriptionData}.`);
      })
      .catch((error) => {
        console.warn(`${sourceLogClass}: Unsubscribe error ${error}.`)
      });
    }
  } 
}

export {Interfaces};

