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
const isConnectedTimeout = 4000

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
    console.log(props)
    this._notificationSystem = null;
    let endpoint = new Endpoint(this.props.endpoint.endpointInfo, this.props.endpoint.networkInfo)
    this._api = endpoint.connect()
  }

  scrollPosition = 0
  tdIsConnected = null
  tdIsMetaMaskUnlocked = null

  state = {
    isConnected: this.props.app.isConnected,
    isSyncing: this.props.app.isSyncing,
    syncStatus: this.props.app.syncStatus,
  }

  // Defining the properties of the context variables passed down to children
  static childContextTypes = {
    api: PropTypes.object,
    isConnected: PropTypes.bool,
    isSyncing: PropTypes.bool,
    syncStatus: PropTypes.object,
    ethereumNetworkName: PropTypes.string,
  };

  static propTypes = {
    app: PropTypes.object.isRequired,
    endpoint: PropTypes.object.isRequired,
    dispatch: PropTypes.func.isRequired,
  };

  // Passing down the context variables to children
  getChildContext() {
    return {
      api: this._api,
      isConnected: this.props.app.isConnected,
      isSyncing: this.props.app.isSyncing,
      syncStatus: this.props.app.syncStatus,
      ethereumNetworkName: DEFAULT_NETWORK_NAME
    };
  }

  shouldComponentUpdate(nextProps, nextState) {
    // console.log(this.props.user.isManager)
    const propsUpdate = (!utils.shallowEqual(this.props, nextProps))
    const stateUpdate = (!utils.shallowEqual(this.state, nextState))
    // console.log(`${this.constructor.name} -> propsUpdate: %c${propsUpdate}.%c stateUpdate: %c${stateUpdate}`, `color: ${propsUpdate ? 'green' : 'red'}; font-weight: bold;`,'',`color: ${stateUpdate ? 'green' : 'red'}; font-weight: bold;`)
    return stateUpdate || propsUpdate
  }

  componentDidMount = async () =>{
    this.props.dispatch(Actions.notifications.initNotificationsSystemAction(this._notificationSystem))
    const { endpoint } = this.props
    let WsSecureUrl = ''
    const networkName = this.props.endpoint.networkInfo.name
    if (PROD) {
      WsSecureUrl = this.props.endpoint.endpointInfo.wss[networkName].prod
    } else {
      WsSecureUrl = this.props.endpoint.endpointInfo.wss[networkName].dev
    }
    const web3 = new Web3(WsSecureUrl)
    this.props.dispatch(Actions.endpoint.attachInterface(web3, this._api, endpoint))
    if (typeof window.web3 !== 'undefined') {
      const web3 = window.web3
      this.props.dispatch(Actions.endpoint.checkMetaMaskIsUnlocked(this._api, web3))
    }
  }

  UNSAFE_componentWillMount() {
    // Starting connection checking. this is not necessary runnin inside Parity UI
    // because the checki is done by Parity and a messagge will be displayed by the client
  }

  componentWillUnmount() {
    // try {
    //   this.detachInterface();
    // } catch (err) {
    //   console.log(err)
    // }
    // Unsubscribing to the event when the the user moves away from this page
  }

  UNSAFE_componentWillUpdate() {
  }

  render() {
    let notificationStyle = {
      NotificationItem: { // Override the notification item
        DefaultStyle: { // Applied to every notification, regardless of the notification level
          margin: '0px 0px 0px 0px'
        },
        info: { // Applied only to the success notification item
          border: '1px solid',
          borderColor: "#EEEEEE",
          WebkitBoxShadow: 'rgba(0, 0, 0, 0.1) 0px 5px 5px',
          MozBoxShadow: 'rgba(0, 0, 0, 0.1) 0px 5px 5px',
          boxShadow: 'rgba(0, 0, 0, 0.1) 0px 5px 5px',
          backgroundColor: 'white',
          marginBottom: '5px'
        },
        error: {
          borderTop: '2px solid',
          WebkitBoxShadow: 'rgba(0, 0, 0, 0.1) 0px 5px 5px',
          MozBoxShadow: 'rgba(0, 0, 0, 0.1) 0px 5px 5px',
          boxShadow: 'rgba(0, 0, 0, 0.1) 0px 5px 5px',
          backgroundColor: '#F44336',
          color: '#ffffff',
          marginBottom: '5px'
        },
        warning: {
          borderTop: '0px solid',
          WebkitBoxShadow: 'rgba(0, 0, 0, 0.1) 0px 5px 5px',
          MozBoxShadow: 'rgba(0, 0, 0, 0.1) 0px 5px 5px',
          boxShadow: 'rgba(0, 0, 0, 0.1) 0px 5px 5px',
          backgroundColor: '#E65100',
          color: '#ffffff',
          marginBottom: '5px'
        },
      },
      Title: {
        error: {
          color: '#ffffff',
          fontWeight: 700
        },
        warning: {
          color: '#ffffff',
          fontWeight: 700
        }
      },
      Dismiss: {
        info: {
          backgroundColor: '',
          color: '#000000'
        },
        error: {
          backgroundColor: '',
          color: '#ffffff'
        },
        warning: {
          backgroundColor: '',
          color: '#ffffff'
        },
      },
    }
    return (
      <div>
        {this.props.app.appLoading
          ?
          <div>
            <NotificationSystem ref={n => this._notificationSystem = n} style={notificationStyle} />
            <Router history={history}>
              <AppLoading ></AppLoading>
            </Router>
          </div>
          : <div>
            <NotificationSystem ref={n => this._notificationSystem = n} style={notificationStyle} />
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

  // attachInterface = () => {
  //   // Allowed endpoints are defined in const.js
  //   // let WsSecureUrl = ''
  //   const selectedEndpointName = this.props.endpoint.endpointInfo.name
  //   const networkId = this.props.endpoint.networkInfo.id
  //   // const networkName = this.props.endpoint.networkInfo.name
  //   // let subscriptionData
  //   let blockchain = new Interfaces(this._api, networkId)
  //   switch (selectedEndpointName) {
  //     case INFURA:
  //       console.log(`${this.constructor.name} -> ${INFURA}`)
  //       console.log(this._api, networkId)
  //       return blockchain.attachInterfaceInfuraV2(this._api, networkId)
  //         // .then((attachedInterface) => {
  //         //   // Subscribing to newBlockNumber event
  //         //   // Setting connection to node
  //         //   if (PROD) {
  //         //     WsSecureUrl = this.props.endpoint.endpointInfo.wss[networkName].prod
  //         //   } else {
  //         //     WsSecureUrl = this.props.endpoint.endpointInfo.wss[networkName].dev
  //         //   }
  //         //   // Infura does not support WebSocket for Kovan yet.
  //         //   console.log(attachedInterface)
  //         //   if (networkName === KOVAN) {
  //         //     return this._api.subscribe('eth_blockNumber', this.onNewBlockNumber)
  //         //       .then((subscriptionID) => {
  //         //         console.log(`Subscribed to eth_blockNumber -> Subscription ID: ${subscriptionID}`);
  //         //         subscriptionData = subscriptionID
  //         //         attachedInterface.subscriptionData = subscriptionData
  //         //         this.setState({
  //         //           appLoading: false
  //         //         })
  //         //         return attachedInterface
  //         //       })
  //         //       .catch((error) => {
  //         //         console.log('error subscription', error)
  //         //         this.setState({
  //         //           appLoading: false,
  //         //           isConnected: false,
  //         //         })
  //         //         // this.props.dispatch(this.updateInterface(newEndpoint))
  //         //       });
  //         //   } else {
  //         //     // Subscribing to newBlockNumber event
  //         //     const web3 = new Web3(WsSecureUrl)
  //         //     return Promise
  //         //       .all([web3.eth.subscribe('newBlockHeaders', this.onNewBlockNumber)])
  //         //       .then(result => {
  //         //         let subscription = result[0]
  //         //         console.log(`Subscribed to eth_blockNumber`);
  //         //         subscriptionData = subscription
  //         //         attachedInterface.subscriptionData = subscriptionData
  //         //         this.setState({
  //         //           appLoading: false
  //         //         })
  //         //         return attachedInterface
  //         //       })
  //         //       .catch((error) => {
  //         //         console.log('error subscription', error)
  //         //         this.setState({
  //         //           appLoading: false,
  //         //           isConnected: false,
  //         //         })
  //         //         return attachedInterface
  //         //       });
  //         //   }
  //         // })
  //         .then (() =>{
  //           this.props.dispatch(Actions.app.updateAppStatus(
  //             {
  //               appLoading: false
  //             }
  //           ))
  //         })
  //         .catch(() => {
  //           // this.setState({...this.state, ...blockchain.error})
  //           this.props.dispatch(Actions.app.updateAppStatus(
  //             {
  //               appLoading: false,
  //               // isConnected: false,
  //             }
  //           ))
  //           // this.setState({
  //           //   appLoading: false,
  //           //   isConnected: false,
  //           // })
  //         })
  //     case RIGOBLOCK:
  //       console.log(`${this.constructor.name} -> ${RIGOBLOCK}`)
  //       return blockchain.attachInterfaceRigoBlockV2(this._api, networkId)
  //         // .then((attachedInterface) => {
  //         //   // Setting connection to node
  //         //   if (PROD) {
  //         //     WsSecureUrl = this.props.endpoint.endpointInfo.wss[networkName].prod
  //         //   } else {
  //         //     WsSecureUrl = this.props.endpoint.endpointInfo.wss[networkName].dev
  //         //   }
  //         //   // Subscribing to newBlockNumber event
  //         //   let web3
  //         //   try {
  //         //     console.log(`Connectiong to Websocket ${WsSecureUrl}`);
  //         //     web3 = new Web3(WsSecureUrl)
  //         //   } catch (error) {
  //         //     throw error
  //         //   }

  //         //   return Promise
  //         //     .all([web3.eth.subscribe('newBlockHeaders', this.onNewBlockNumber)])
  //         //     .then(result => {
  //         //       let subscription = result[0]
  //         //       console.log(`Subscribed to eth_blockNumber`);
  //         //       subscriptionData = subscription
  //         //       attachedInterface.subscriptionData = subscriptionData
  //         //       this.setState({
  //         //         appLoading: false
  //         //       })
  //         //       return attachedInterface
  //         //     })
  //         //     .catch((error) => {
  //         //       console.log('error subscription', error)
  //         //       this.setState({
  //         //         appLoading: false,
  //         //         isConnected: false,
  //         //       })
  //         //     });
  //         // })
  //         .then (() =>{
  //           this.props.dispatch(Actions.app.updateAppStatus({appLoading: false}))
  //         })
  //         .catch(() => {

  //           // this.setState(...this.state, ...blockchain.error)
  //           this.props.dispatch(Actions.app.updateAppStatus(
  //             {
  //               appLoading: false,
  //               // isConnected: false,
  //             }
  //           ))
  //           // this.setState({
  //           //   appLoading: false,
  //           //   isConnected: false,
  //           // })
  //         })
  //     case LOCAL:
  //       console.log(`${this.constructor.name} -> ${LOCAL}`)
  //       return blockchain.attachInterfaceRigoBlockV2(this._api, networkId)
  //         // .then((attachedInterface) => {
  //         //   // Setting connection to node
  //         //   if (PROD) {
  //         //     WsSecureUrl = EP_RIGOBLOCK_KV_PROD_WS
  //         //   } else {
  //         //     WsSecureUrl = EP_RIGOBLOCK_KV_DEV_WS
  //         //   }
  //         //   // Subscribing to newBlockNumber event
  //         //   const web3 = new Web3(WsSecureUrl)
  //         //   return Promise
  //         //     .all([web3.eth.subscribe('newBlockHeaders', this.onNewBlockNumber)])
  //         //     .then(result => {
  //         //       let subscription = result[0]
  //         //       console.log(`Subscribed to eth_blockNumber`);
  //         //       subscriptionData = subscription
  //         //       attachedInterface.subscriptionData = subscriptionData
  //         //       return attachedInterface
  //         //     })
  //         // })
  //         .then (() =>{
  //           this.props.dispatch(Actions.endpoint.updateAppStatus(
  //             {
  //               appLoading: false
  //             }
  //           ))
  //         })
  //         .catch(() => {
  //           // this.setState({...this.state, ...blockchain.error})
  //         })
  //     default:
  //       return
  //   }
  // }

  // onNewBlockNumber = (_error, blockNumber) => {
  //   // utils.logger.disable()
  //   console.log('new block')
  //   if (_error) {
  //     console.error('onNewBlockNumber', _error)
  //     return
  //   }
  //   // const { api } = this.context;
  //   const { endpoint } = this.props;
  //   const prevBlockNumber = endpoint.prevBlockNumber
  //   let newBlockNumber = new BigNumber(0)
  //   // Checking if blockNumber is passed by Parity Api or Web3
  //   if (typeof blockNumber.number !== 'undefined') {
  //     newBlockNumber = new BigNumber(blockNumber.number)
  //   } else {
  //     newBlockNumber = blockNumber
  //   }
  //   console.log(`${this.constructor.name} -> Last block: ` + prevBlockNumber)
  //   console.log(`${this.constructor.name} -> New block: ` + newBlockNumber.toFixed())
  //   // Checking that the current newBlockNumber is higher than previous one.
  //   if (prevBlockNumber > newBlockNumber.toFixed()) {
  //     console.log(`${this.constructor.name} -> Detected prevBlockNumber > currentBlockNumber. Skipping accounts update.`)
  //     const endpoint = {
  //       prevBlockNumber: newBlockNumber.toFixed()
  //     }
  //     this.props.dispatch(Actions.endpoint.updateInterface(endpoint))
  //     return null
  //   }
  //   const accounts = [].concat(endpoint.accounts);
  //   if (accounts.length !== 0) {
  //     const poolsApi = new PoolsApi(this._api)
  //     poolsApi.contract.rigotoken.init()

  //     const tokensQueries = accounts.map((account) => {
  //       console.log(`${this.constructor.name} -> API call getBalance RigoToken-> applicationDragoHome: Getting balance of account ${account.address}`)
  //       return poolsApi.contract.rigotoken.balanceOf(account.address)
  //     })

  //     // Checking ethereum balance
  //     const ethQueries = accounts.map((account) => {
  //       console.log(`${this.constructor.name} -> API call getBalance -> applicationDragoHome: Getting balance of account ${account.address}`)
  //       return this._api.eth.getBalance(account.address, newBlockNumber)
  //     })
  //     const promisesBalances = [...ethQueries, ...tokensQueries]

  //     Promise
  //       .all(promisesBalances)
  //       .then((results) => {
  //         // Splitting the the result array between ethBalances and grgBalances
  //         const halfLength = Math.ceil(results.length / 2)
  //         const ethBalances = results.splice(0, halfLength)
  //         const grgBalances = results
  //         const prevAccounts = [].concat(endpoint.accounts)
  //         prevAccounts.map((account, index) => {
  //           // Checking ETH balance
  //           const newEthBalance = utils.formatFromWei(ethBalances[index])
  //           if ((account.ethBalance !== newEthBalance) && prevBlockNumber !== 0) {
  //             console.log(`${account.name} balance changed.`)
  //             let secondaryText = []
  //             let balDifference = account.ethBalance - newEthBalance
  //             if (balDifference > 0) {
  //               console.log(`${this.constructor.name} -> You transferred ${balDifference.toFixed(4)} ETH!`)
  //               secondaryText[0] = `You transferred ${balDifference.toFixed(4)} ETH!`
  //               secondaryText[1] = utils.dateFromTimeStamp(new Date())
  //             } else {
  //               console.log(`${this.constructor.name} -> You received ${Math.abs(balDifference).toFixed(4)} ETH!`)
  //               secondaryText[0] = `You received ${Math.abs(balDifference).toFixed(4)} ETH!`
  //               secondaryText[1] = utils.dateFromTimeStamp(new Date())
  //             }
  //             if (this._notificationSystem && endpoint.accountsBalanceError === false) {
  //               this._notificationSystem.addNotification({
  //                 level: 'info',
  //                 position: 'br',
  //                 autoDismiss: 10,
  //                 children: this.notificationAlert(account.name, secondaryText)
  //               });
  //             }
  //           }
  //           // Checking GRG balance
  //           const newgrgBalance = utils.formatFromWei(grgBalances[index])
  //           if ((account.grgBalance !== newgrgBalance) && prevBlockNumber !== 0) {
  //             console.log(`${account.name} balance changed.`)
  //             let secondaryText = []
  //             let balDifference = new BigNumber(account.grgBalance.toString()).minus(new BigNumber(newgrgBalance.toString()))
  //             if ((balDifference).gt(0)) {
  //               console.log(`${this.constructor.name} -> You transferred ${balDifference.toFixed(4)} GRG!`)
  //               secondaryText[0] = `You transferred ${balDifference.toFixed(4)} GRG!`
  //               secondaryText[1] = utils.dateFromTimeStamp(new Date())
  //             } else {
  //               console.log(`${this.constructor.name} -> You received ${Math.abs(balDifference).toFixed(4)} GRG!`)
  //               secondaryText[0] = `You received ${balDifference.abs().toFixed(4)} GRG!`
  //               secondaryText[1] = utils.dateFromTimeStamp(new Date())
  //             }
  //             if (this._notificationSystem && endpoint.accountsBalanceError === false) {
  //               this._notificationSystem.addNotification({
  //                 level: 'info',
  //                 position: 'br',
  //                 autoDismiss: 10,
  //                 children: this.notificationAlert(account.name, secondaryText)
  //               });
  //             }
  //           }
  //           return null
  //         })
  //         return [ethBalances, grgBalances]
  //       })
  //       .then((balances) => {
  //         const ethBalances = balances[0]
  //         const grgBalances = balances[1]
  //         const endpoint = {
  //           prevBlockNumber: newBlockNumber.toFixed(),
  //           loading: false,
  //           networkError: NETWORK_OK,
  //           networkStatus: MSG_NETWORK_STATUS_OK,
  //           accountsBalanceError: false,
  //           grgBalance: grgBalances.reduce((total, balance) => total.add(balance), new BigNumber(0)),
  //           ethBalance: ethBalances.reduce((total, balance) => total.add(balance), new BigNumber(0)),
  //           accounts: [].concat(accounts.map((account, index) => {
  //             const ethBalance = ethBalances[index];
  //             account.ethBalance = utils.formatFromWei(ethBalance)
  //             account.ethBalanceWei = new BigNumber(ethBalance)
  //             const grgBalance = grgBalances[index];
  //             account.grgBalance = utils.formatFromWei(grgBalance)
  //             account.grgBalanceWei = new BigNumber(grgBalance)
  //             return account;
  //           })
  //           )
  //         }
  //         this.props.dispatch(Actions.endpoint.updateInterface(endpoint))
  //         return endpoint
  //       })
  //       .catch((error) => {
  //         console.log(`${this.constructor.name} -> ${error}`)
  //         // Setting the balances to 0 if receiving an error from the endpoint. It happens with Infura.
  //         const endpoint = {
  //           prevBlockNumber: newBlockNumber.toFixed(),
  //           loading: false,
  //           networkError: NETWORK_WARNING,
  //           networkStatus: MSG_NETWORK_STATUS_ERROR,
  //           accountsBalanceError: true,
  //           ethBalance: new BigNumber(0),
  //           grgBalance: new BigNumber(0),
  //           accounts: [].concat(accounts.map((account) => {
  //             account.ethBalance = utils.formatFromWei(new BigNumber(0))
  //             account.grgBalance = utils.formatFromWei(new BigNumber(0))
  //             return account;
  //           })
  //           )
  //         }
  //         this.props.dispatch(Actions.endpoint.updateInterface(endpoint))
  //         return endpoint
  //       });
  //   } else {
  //     const newEndpoint = { ...endpoint }
  //     newEndpoint.prevBlockNumber = newBlockNumber.toFixed()
  //     this.props.dispatch(Actions.endpoint.updateInterface(newEndpoint))
  //   }
  //   // utils.logger.enable()
  // }

  // detachInterface = () => {
  //   const { subscriptionData } = this.state
  //   Interfaces.detachInterface(this._api, subscriptionData)
  // }
}

export default connect(mapStateToProps)(App)
