// Copyright 2016-2017 Rigo Investment Sagl.
import "babel-polyfill";
import Endpoint from './_utils/endpoint';
import { Switch, Redirect, Router, Route } from 'react-router-dom'
import createHashHistory from 'history/createHashHistory';
import BigNumber from 'bignumber.js';
import NotificationSystem from 'react-notification-system'
import PropTypes from 'prop-types';
import React, { Component } from 'react';
import Web3 from 'web3'
import MuiThemeProvider from 'material-ui/styles/MuiThemeProvider';
import 'react-virtualized/styles.css'

import ApplicationConfigPage from './Application/applicationConfig';
import ApplicationDragoPage from './Application/applicationDrago';
import ApplicationVaultPage from './Application/applicationVault';
import ApplicationHomePage from './Application/applicationHome';
import ApplicationExchangePage from './Application/applicationExchange';
import Whoops404 from './Application/whoops404';
import {
  DEFAULT_NETWORK_NAME,
  MSG_NETWORK_STATUS_OK,
  MSG_NETWORK_STATUS_ERROR,
  NETWORK_OK,
  NETWORK_WARNING,
  INFURA,
  RIGOBLOCK,
  LOCAL,
  PROD,
  EP_RIGOBLOCK_KV_DEV_WS,
  EP_RIGOBLOCK_KV_PROD_WS,
  KOVAN
} from './_utils/const'
import {
  ATTACH_INTERFACE,
} from './_redux/actions/const'
import utils from './_utils/utils'
import { Interfaces } from './_utils/interfaces'
import { connect } from 'react-redux';
import ElementNotification from './Elements/elementNotification'
import PoolsApi from './PoolsApi/src'
import AppLoading from './Elements/elementAppLoading'
// import ElementNotConnected from './Elements/elementNotConnected'
import ReactGA from 'react-ga';
import { Actions } from './_redux/actions'

let appHashPath = true;
let sourceLogClass = null
const isConnectedTimeout = 4000
const isMetaMaskUnlockedTimeout = 1000

ReactGA.initialize('UA-117171641-1');
ReactGA.pageview(window.location.pathname + window.location.search);

// Detectiong if the app is running inside Parity client
// var pathArray = window.location.hash.split('/');
// console.log(pathArray[2]);
if (typeof window.parity !== 'undefined') {
  // Need to check if this works inside the Parity UI
  // appHashPath = pathArray[2];
  appHashPath = 'web';
} else {
  appHashPath = 'web';
}

const history = createHashHistory();

// Setting the routes. 
// Component Whoops404 is loaded if a page does not exist.

function mapStateToProps(state) {
  return state
}

export class App extends Component {

  constructor(props) {
    super(props);
    this._notificationSystem = null;
    sourceLogClass = this.constructor.name
    // Connecting to blockchain client
    let endpoint = new Endpoint(this.props.endpoint.endpointInfo, this.props.endpoint.networkInfo)
    this._api = endpoint.connect()
    console.log(this._api)
    this.state = {
      isConnected: false,
      isSyncing: false,
      syncStatus: {},
      appLoading: true
    }
  }

  scrollPosition = 0
  tdIsConnected = null
  tdIsMetaMaskUnlocked = null

  // Defining the properties of the context variables passed down to children
  static childContextTypes = {
    api: PropTypes.object,
    isConnected: PropTypes.bool,
    isSyncing: PropTypes.bool,
    syncStatus: PropTypes.object,
    ethereumNetworkName: PropTypes.string,
  };

  static propTypes = {
    endpoint: PropTypes.object.isRequired,
    dispatch: PropTypes.func.isRequired,
  };

  // Passing down the context variables to children
  getChildContext() {
    return {
      api: this._api,
      isConnected: this.state.isConnected,
      isSyncing: this.state.isSyncing,
      syncStatus: this.state.syncStatus,
      ethereumNetworkName: DEFAULT_NETWORK_NAME
    };
  }

  attachInterfaceAction = () => {
    return {
      type: ATTACH_INTERFACE,
      payload: new Promise((resolve) => {
        this.attachInterface()
          .then(result => {
            this.setState({
              appLoading: false,
              isConnected: true,
            })
            resolve(result);
          })
      })
        .catch(error => {
          console.log(error)
          let newEndpoint = { ...this.props.endpoint }
          newEndpoint.networkStatus = MSG_NETWORK_STATUS_ERROR
          newEndpoint.networkError = NETWORK_WARNING
          this.props.dispatch(Actions.endpoint.updateInterfaceAction(newEndpoint))
          this.setState({
            appLoading: false,
            isConnected: false,
          })
          return
        })
    }
  }

  shouldComponentUpdate(nextProps, nextState) {
    // console.log(this.props.user.isManager)
    const propsUpdate = (!utils.shallowEqual(this.props, nextProps))
    const stateUpdate = (!utils.shallowEqual(this.state, nextState))
    // console.log(`${sourceLogClass} -> propsUpdate: %c${propsUpdate}.%c stateUpdate: %c${stateUpdate}`, `color: ${propsUpdate ? 'green' : 'red'}; font-weight: bold;`,'',`color: ${stateUpdate ? 'green' : 'red'}; font-weight: bold;`)
    return stateUpdate || propsUpdate
  }

  componentDidMount() {
    this.props.dispatch(Actions.notifications.initNotificationsSystemAction(this._notificationSystem))
    this.props.dispatch(this.attachInterfaceAction())
    setTimeout(() => {
      this.setState({
        appLoading: false,
      })
    }, 7000);
  }

  UNSAFE_componentWillMount() {
    // Starting connection checking. this is not necessary runnin inside Parity UI
    // because the checki is done by Parity and a messagge will be displayed by the client
    if (this.props.endpoint.endpointInfo.name !== 'local') {
      this.tdIsConnected = setTimeout(this.checkConnectionToNode, 1000)
      this.tdIsMetaMaskUnlocked = setTimeout(this.checkMetaMaskUnlocked, isMetaMaskUnlockedTimeout)
    }
  }

  componentWillUnmount() {
    if (this.props.endpoint.endpointInfo.name !== 'local') {
      clearTimeout(this.tdIsConnected)
      clearTimeout(this.tdIsMetaMaskUnlocked)
    }
    try {
      this.detachInterface();
    } catch (err) {
      console.log(err)
    }
    // Unsubscribing to the event when the the user moves away from this page
  }

  UNSAFE_componentWillUpdate() {
  }


  // This function is passed down with context and used as a call back function to show a warning page
  // if the connection with the node drops
  isConnected = (status) => {
    this.setState({
      isConnected: status
    })
  }

  checkConnectionToNode = () => {
    if (this._api.isConnected) {
      if (!this.state.isConnected) {
        this.props.dispatch(this.attachInterfaceAction())
      }
      this.setState({
        isConnected: true
      })
      this._api.eth.syncing()
        .then(result => {
          if (result !== false) {
            this.setState({
              isSyncing: true,
              syncStatus: result
            })
          }
        })
      this.tdIsConnected = setTimeout(this.checkConnectionToNode, isConnectedTimeout)
    } else {
      this.setState({
        isConnected: false
      })
      this.tdIsMetaMaskUnlocked = setTimeout(this.checkConnectionToNode, isConnectedTimeout)
    }
  }

  checkMetaMaskUnlocked = () => {
    if (typeof window.web3 !== 'undefined') {
      const web3 = window.web3
      const { endpoint } = this.props
      let newEndpoint = { ...endpoint }
      let newAccounts = [].concat(endpoint.accounts)
      web3.eth.getAccounts()
        .then((accountsMetaMask) => {
          // If MetaMask is unlocked then remove from accounts list.
          if (accountsMetaMask.length === 0) {
            // Checking if MetaMask was already locked in order to avoid unnecessary update of the state
            let metaMaskAccountIndex = endpoint.accounts.findIndex(account => {
              return (account.source === 'MetaMask')
            });
            if (metaMaskAccountIndex !== -1) {
              newAccounts.splice(metaMaskAccountIndex, 1)
              newEndpoint.accounts = newAccounts
              this.props.dispatch(Actions.endpoint.updateInterfaceAction(newEndpoint))
            }
          } else {
            // Checking if the MetaMask account is already in accounts list.
            let metaMaskAccountIndex = endpoint.accounts.findIndex(account => {
              return (account.address === accountsMetaMask[0])
            });
            // If it is NOT then add it to the accounts list.
            if (metaMaskAccountIndex < 0) {
              const networkId = this.props.endpoint.networkInfo.id
              const blockchain = new Interfaces(this._api, networkId)
              return blockchain.attachInterfaceInfuraV2()
                .then((result) => {
                  if (result.accounts.length !== 0) {
                    newAccounts.push(result.accounts[0])
                  }
                  newEndpoint.accounts = newAccounts
                  this.props.dispatch(Actions.endpoint.updateInterfaceAction(newEndpoint))
                  return result
                })
            }
          }
          return endpoint.accounts
        }
        )
        .then(() => {
          this.tdIsConnected = setTimeout(this.checkMetaMaskUnlocked, isMetaMaskUnlockedTimeout)
        })
        .catch(() => {
          let metaMaskAccountIndex = endpoint.accounts.findIndex(account => {
            return (account.source === 'MetaMask')
          });
          if (metaMaskAccountIndex !== -1) {
            newAccounts.splice(metaMaskAccountIndex, 1)
            newEndpoint.accounts = newAccounts
            this.props.dispatch(Actions.endpoint.updateInterfaceAction(newEndpoint))
          }
          this.tdIsConnected = setTimeout(this.checkMetaMaskUnlocked, isMetaMaskUnlockedTimeout)
        })
    }
  }

  render() {
    let notificationStyle = {
      NotificationItem: { // Override the notification item
        DefaultStyle: { // Applied to every notification, regardless of the notification level
          margin: '0px 0px 0px 0px'
        },

        info: { // Applied only to the success notification item
          backgroundColor: 'white'
        }
      }
    }
    return (
      <div>
        {this.state.appLoading
          ?
          <div>
            <NotificationSystem ref={n => this._notificationSystem = n} style={notificationStyle} />
            <Router history={history}>
              <AppLoading ></AppLoading>
            </Router>
          </div>
          : <div><NotificationSystem ref={n => this._notificationSystem = n} style={notificationStyle} />
            <Router history={history}>
              <Switch>
                <Route exact path={"/app/" + appHashPath + "/home"} component={ApplicationHomePage} />
                <Route path={"/app/" + appHashPath + "/vault"} component={ApplicationVaultPage} />
                <Route path={"/app/" + appHashPath + "/drago"} component={ApplicationDragoPage} />
                <Route path={"/app/" + appHashPath + "/exchange"} component={ApplicationExchangePage} />
                <Route path={"/app/" + appHashPath + "/config"} component={ApplicationConfigPage} />
                <Redirect from="/exchange/" to={"/app/" + appHashPath + "/exchange"} />
                <Redirect from="/vault/" to={"/app/" + appHashPath + "/vault"} />
                <Redirect from="/drago" to={"/app/" + appHashPath + "/drago"} />
                <Redirect from="/" to={"/app/" + appHashPath + "/home"} />
                <Route component={Whoops404} />
              </Switch>
            </Router>
          </div>
        }
      </div>
    )
  }

  notificationAlert = (primaryText, secondaryText, eventType = 'transfer') => {
    return (
      <MuiThemeProvider>
        <ElementNotification
          primaryText={primaryText}
          secondaryText={secondaryText}
          eventType={eventType}
          eventStatus='executed'
          txHash=''
        />
      </MuiThemeProvider>
    )
  }

  attachInterface = () => {
    // Allowed endpoints are defined in const.js
    let sourceLogClass = this.constructor.name
    let WsSecureUrl = ''
    const selectedEndpoint = this.props.endpoint.endpointInfo.name
    const networkId = this.props.endpoint.networkInfo.id
    const networkName = this.props.endpoint.networkInfo.name
    let subscriptionData
    let blockchain = new Interfaces(this._api, networkId)
    switch (selectedEndpoint) {
      case INFURA:
        console.log(`${sourceLogClass} -> ${INFURA}`)
        console.log(this._api, networkId)
        return blockchain.attachInterfaceInfuraV2(this._api, networkId)
          .then((attachedInterface) => {
            // this.setState({...this.state, ...blockchain.success})
            // Subscribing to newBlockNumber event
            // Setting connection to node
            if (PROD) {
              WsSecureUrl = this.props.endpoint.endpointInfo.wss[networkName].prod
            } else {
              WsSecureUrl = this.props.endpoint.endpointInfo.wss[networkName].dev
            }
            // Infura does not support WebSocket for Kovan yet.
            console.log(attachedInterface)
            if (networkName === KOVAN) {
              return this._api.subscribe('eth_blockNumber', this.onNewBlockNumber)
                .then((subscriptionID) => {
                  console.log(`${sourceLogClass}: Subscribed to eth_blockNumber -> Subscription ID: ${subscriptionID}`);
                  subscriptionData = subscriptionID
                  attachedInterface.subscriptionData = subscriptionData
                  attachedInterface.prevBlockNumber = "0"
                  this.setState({
                    appLoading: false
                  })
                  return attachedInterface
                })
                .catch((error) => {
                  console.log('error subscription', error)
                  this.setState({
                    appLoading: false,
                    isConnected: false,
                  })
                  // this.props.dispatch(this.updateInterfaceAction(newEndpoint))
                });
            } else {
              // Subscribing to newBlockNumber event
              const web3 = new Web3(WsSecureUrl)
              return Promise
                .all([web3.eth.subscribe('newBlockHeaders', this.onNewBlockNumber)])
                .then(result => {
                  let subscription = result[0]
                  console.log(`${sourceLogClass}: Subscribed to eth_blockNumber`);
                  subscriptionData = subscription
                  attachedInterface.subscriptionData = subscriptionData
                  attachedInterface.prevBlockNumber = "0"
                  this.setState({
                    appLoading: false
                  })
                  return attachedInterface
                })
                .catch((error) => {
                  console.log('error subscription', error)
                  this.setState({
                    appLoading: false,
                    isConnected: false,
                  })
                  return attachedInterface
                });
            }

          })
          .catch(() => {
            // this.setState({...this.state, ...blockchain.error})
            this.setState({
              appLoading: false,
              isConnected: false,
            })
          })
      case RIGOBLOCK:
        console.log(`${sourceLogClass} -> ${RIGOBLOCK}`)
        return blockchain.attachInterfaceRigoBlockV2(this._api, networkId)
          .then((attachedInterface) => {
            // Setting connection to node
            if (PROD) {
              WsSecureUrl = this.props.endpoint.endpointInfo.wss[networkName].prod
            } else {
              WsSecureUrl = this.props.endpoint.endpointInfo.wss[networkName].dev
            }
            // Subscribing to newBlockNumber event
            let web3
            try {
              console.log(`${sourceLogClass}: Connectiong to Websocket ${WsSecureUrl}`);
              web3 = new Web3(WsSecureUrl)
            } catch (error) {
              throw error
            }

            return Promise
              .all([web3.eth.subscribe('newBlockHeaders', this.onNewBlockNumber)])
              .then(result => {
                let subscription = result[0]
                console.log(`${sourceLogClass}: Subscribed to eth_blockNumber`);
                subscriptionData = subscription
                attachedInterface.subscriptionData = subscriptionData
                attachedInterface.prevBlockNumber = "0"
                this.setState({
                  appLoading: false
                })
                return attachedInterface
              })
              .catch((error) => {
                console.log('error subscription', error)
                this.setState({
                  appLoading: false,
                  isConnected: false,
                })
              });
          })
          .catch(() => {
            this.setState(...this.state, ...blockchain.error)
            this.setState({
              appLoading: false,
              isConnected: false,
            })
          })
      case LOCAL:
        console.log(`${sourceLogClass} -> ${LOCAL}`)
        return blockchain.attachInterfaceRigoBlockV2(this._api, networkId)
          .then((attachedInterface) => {
            // Setting connection to node
            if (PROD) {
              WsSecureUrl = EP_RIGOBLOCK_KV_PROD_WS
            } else {
              WsSecureUrl = EP_RIGOBLOCK_KV_DEV_WS
            }
            // Subscribing to newBlockNumber event
            const web3 = new Web3(WsSecureUrl)
            return Promise
              .all([web3.eth.subscribe('newBlockHeaders', this.onNewBlockNumber)])
              .then(result => {
                let subscription = result[0]
                console.log(`${sourceLogClass}: Subscribed to eth_blockNumber`);
                subscriptionData = subscription
                attachedInterface.subscriptionData = subscriptionData
                attachedInterface.prevBlockNumber = "0"
                return attachedInterface
              })
          })
          .catch(() => {
            // this.setState({...this.state, ...blockchain.error})
          })
      default:
        return
    }

  }

  onNewBlockNumber = (_error, blockNumber) => {
    // utils.logger.disable()
    console.log('new block')
    if (_error) {
      console.error('onNewBlockNumber', _error)
      return
    }
    // const { api } = this.context;
    const { endpoint } = this.props;
    const prevBlockNumber = endpoint.prevBlockNumber
    let newBlockNumber = new BigNumber(0)
    // Checking if blockNumber is passed by Parity Api or Web3
    if (typeof blockNumber.number !== 'undefined') {
      newBlockNumber = new BigNumber(blockNumber.number)
    } else {
      newBlockNumber = blockNumber
    }
    console.log(`${sourceLogClass} -> Last block: ` + prevBlockNumber)
    console.log(`${sourceLogClass} -> New block: ` + newBlockNumber.toFixed())
    // Checking that the current newBlockNumber is higher than previous one.
    if (prevBlockNumber > newBlockNumber.toFixed()) {
      console.log(`${sourceLogClass} -> Detected prevBlockNumber > currentBlockNumber. Skipping accounts update.`)
      const endpoint = {
        prevBlockNumber: newBlockNumber.toFixed()
      }
      Actions.endpoint.updateInterfaceAction(endpoint)
      return null
    }
    const accounts = [].concat(endpoint.accounts);
    if (accounts.length !== 0) {
      const poolsApi = new PoolsApi(this._api)
      poolsApi.contract.rigotoken.init()

      const tokensQueries = accounts.map((account) => {
        console.log(`${sourceLogClass} -> API call getBalance RigoToken-> applicationDragoHome: Getting balance of account ${account.name}`)
        // return rigoTokenContract.instance.balanceOf.call({}, [account.address])
        return poolsApi.contract.rigotoken.balanceOf(account.address)
      })

      // Checking ethereum balance
      const ethQueries = accounts.map((account) => {
        console.log(`${sourceLogClass} -> API call getBalance -> applicationDragoHome: Getting balance of account ${account.name}`)
        return this._api.eth.getBalance(account.address, newBlockNumber)
      })
      const promisesBalances = [...ethQueries, ...tokensQueries]

      Promise
        .all(promisesBalances)
        .then((results) => {
          // Splitting the the result array between ethBalances and rigoTokenBalances
          const halfLength = Math.ceil(results.length / 2)
          const ethBalances = results.splice(0, halfLength)
          const rigoTokenBalances = results
          const prevAccounts = [].concat(endpoint.accounts)
          prevAccounts.map((account, index) => {
            // Checking ETH balance
            const newEthBalance = utils.formatFromWei(ethBalances[index])
            if ((account.ethBalance !== newEthBalance) && prevBlockNumber !== 0) {
              console.log(`${account.name} balance changed.`)
              let secondaryText = []
              let balDifference = account.ethBalance - newEthBalance
              if (balDifference > 0) {
                console.log(`${sourceLogClass} -> You transferred ${balDifference.toFixed(4)} ETH!`)
                secondaryText[0] = `You transferred ${balDifference.toFixed(4)} ETH!`
                secondaryText[1] = utils.dateFromTimeStamp(new Date())
              } else {
                console.log(`${sourceLogClass} -> You received ${Math.abs(balDifference).toFixed(4)} ETH!`)
                secondaryText[0] = `You received ${Math.abs(balDifference).toFixed(4)} ETH!`
                secondaryText[1] = utils.dateFromTimeStamp(new Date())
              }
              if (this._notificationSystem && endpoint.accountsBalanceError === false) {
                this._notificationSystem.addNotification({
                  level: 'info',
                  position: 'br',
                  autoDismiss: 10,
                  children: this.notificationAlert(account.name, secondaryText)
                });
              }
            }
            // Checking GRG balance
            const newRigoTokenBalance = utils.formatFromWei(rigoTokenBalances[index])
            if ((account.rigoTokenBalance !== newRigoTokenBalance) && prevBlockNumber !== 0) {
              console.log(`${account.name} balance changed.`)
              let secondaryText = []
              let balDifference = new BigNumber(account.rigoTokenBalance.toString()).minus(new BigNumber(newRigoTokenBalance.toString()))
              if ((balDifference).gt(0)) {
                console.log(`${sourceLogClass} -> You transferred ${balDifference.toFixed(4)} GRG!`)
                secondaryText[0] = `You transferred ${balDifference.toFixed(4)} GRG!`
                secondaryText[1] = utils.dateFromTimeStamp(new Date())
              } else {
                console.log(`${sourceLogClass} -> You received ${Math.abs(balDifference).toFixed(4)} GRG!`)
                secondaryText[0] = `You received ${balDifference.abs().toFixed(4)} GRG!`
                secondaryText[1] = utils.dateFromTimeStamp(new Date())
              }
              if (this._notificationSystem && endpoint.accountsBalanceError === false) {
                this._notificationSystem.addNotification({
                  level: 'info',
                  position: 'br',
                  autoDismiss: 10,
                  children: this.notificationAlert(account.name, secondaryText)
                });
              }
            }
            return null
          })
          return [ethBalances, rigoTokenBalances]
        })
        .then((balances) => {
          const ethBalances = balances[0]
          const rigoTokenBalances = balances[1]
          const endpoint = {
            prevBlockNumber: newBlockNumber.toFixed(),
            loading: false,
            networkError: NETWORK_OK,
            networkStatus: MSG_NETWORK_STATUS_OK,
            accountsBalanceError: false,
            rigoTokenBalance: rigoTokenBalances.reduce((total, balance) => total.add(balance), new BigNumber(0)),
            ethBalance: ethBalances.reduce((total, balance) => total.add(balance), new BigNumber(0)),
            accounts: [].concat(accounts.map((account, index) => {
              const ethBalance = ethBalances[index];
              account.ethBalance = utils.formatFromWei(ethBalance)
              const rigoTokenBalance = rigoTokenBalances[index];
              account.rigoTokenBalance = utils.formatFromWei(rigoTokenBalance)
              return account;
            })
            )
          }
          this.props.dispatch(Actions.endpoint.updateInterfaceAction(endpoint))
          return endpoint
        })
        .catch((error) => {
          console.log(`${sourceLogClass} -> ${error}`)
          // Setting the balances to 0 if receiving an error from the endpoint. It happens with Infura.
          const endpoint = {
            prevBlockNumber: newBlockNumber.toFixed(),
            loading: false,
            networkError: NETWORK_WARNING,
            networkStatus: MSG_NETWORK_STATUS_ERROR,
            accountsBalanceError: true,
            ethBalance: new BigNumber(0),
            rigoTokenBalance: new BigNumber(0),
            accounts: [].concat(accounts.map((account) => {
              account.ethBalance = utils.formatFromWei(new BigNumber(0))
              account.rigoTokenBalance = utils.formatFromWei(new BigNumber(0))
              return account;
            })
            )
          }
          this.props.dispatch(Actions.endpoint.updateInterfaceAction(endpoint))
          return endpoint
        });
    }
    else {
      const newEndpoint = { ...endpoint }
      newEndpoint.prevBlockNumber = newBlockNumber.toFixed()
      this.props.dispatch(Actions.endpoint.updateInterfaceAction(newEndpoint))
    }
    // utils.logger.enable()
  }

  detachInterface = () => {
    const { subscriptionData } = this.state
    Interfaces.detachInterface(this._api, subscriptionData)
  }
}

export default connect(mapStateToProps)(App)
