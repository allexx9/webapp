// Copyright 2016-2017 Rigo Investment Sarl.

import { Grid, Row, Col } from 'react-flexbox-grid';
import { Link, Route, withRouter, HashRouter, Switch, Redirect, Router } from 'react-router-dom'
import createHashHistory from 'history/createHashHistory';
import BigNumber from 'bignumber.js';
import NotificationSystem from 'react-notification-system'
import Paper from 'material-ui/Paper';
import PropTypes from 'prop-types';
import React, { Component } from 'react';
import ReactDOM from 'react-dom'
import Web3 from 'web3'

import { rigotoken } from './contracts'

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
} from './utils/const'
import ElementNotification from './Elements/elementNotification'
import ElementNotificationsDrawer from './Elements/elementNotificationsDrawer'
import utils from './utils/utils'

import { Provider } from 'react-redux';
import { createStore, applyMiddleware } from 'redux';
import promiseMiddleware from 'redux-promise-middleware';
import thunkMiddleware from 'redux-thunk';

import {
  ApplicationHomePage, 
  ApplicationVaultPage, 
  ApplicationDragoPage, 
  ApplicationGabcoinPage,
  ApplicationConfigPage,
  // ApplicationExchangePage, 
  Whoops404} from './Application';

var appHashPath = true;

// Detectiong if the app is running inside Parity client
var pathArray = window.location.hash.split('/');
// console.log(pathArray[2]);
if (typeof window.parity !== 'undefined') {
  // Need to check if this works inside the Parity UI
  // appHashPath = pathArray[2];
  appHashPath = 'web';
} else {
  appHashPath = 'web';
}

const initialState = {
  count: 0
};

const reducer = (state = {}, action) => {
  switch (action.type) {
    case 'GET_LOGS_PENDING':
      return {
        isPending: true
      };

    case 'GET_LOGS_FULFILLED':
      return {
        body: action.payload.body
      };

    default:
      return state;
  };
}

const store = createStore(reducer, {}, applyMiddleware(
  thunkMiddleware,
  promiseMiddleware()
));

const history = createHashHistory();

// Setting the routes. 
// Component Whoops404 is loaded if a page does not exist.

const DIVISOR = 10 ** 6;  //tokens are divisible by one million
var sourceLogClass = null

export class App extends Component {

  constructor() {
    super();
    this._notificationSystem = null;
    sourceLogClass = this.constructor.name
  }

  // Checking the type of the context variable that we receive by the parent

  state = {
    accounts: [],
    accountsInfo: {},
    accountsBalanceError: false,
    // blockNumber: new BigNumber(-1),
    ethBalance: new BigNumber(0),
    loading: true,
    subscriptionIDDrago: null,
    infura: false,
    prevBlockNumber: 0,
    networkStatus: MSG_NETWORK_STATUS_OK,
    networkError: NETWORK_OK,
    networkCorrect: false,
    warnMsg: null
  }

  scrollPosition = 0

  shouldComponentUpdate(nextProps, nextState){
    // const propsUpdate = (!utils.shallowEqual(this.props, nextProps))
    // const stateUpdate = (!utils.shallowEqual(this.state, nextState))
    // return stateUpdate || propsUpdate 
  }

  componentWillMount () {
  } 

  componentDidMount() {
    // // Allowed endpoints are defined in const.js
    // var selectedEndpoint = localStorage.getItem('endpoint')
    // var allowedEndpoints = new Map(ALLOWED_ENDPOINTS)
    // if (allowedEndpoints.has(selectedEndpoint)) {
    //   switch (selectedEndpoint) {
    //     case INFURA:
    //     console.log(INFURA)
    //       this.attachInterfaceInfura()
    //     break;
    //     case RIGOBLOCK:
    //       console.log(RIGOBLOCK)
    //       this.attachInterfaceRigoBlock()
    //     break; 
    //     case LOCAL:
    //       console.log(LOCAL)
    //       this.attachInterfaceRigoBlock()
    //     break; 
    //   }
    // } else {
    //   localStorage.setItem('endpoint', DEFAULT_ENDPOINT)
    //   this.attachInterfaceInfura()
    // }
    // this._notificationSystem = this.refs.notificationSystem
  }

  componentWillUnmount() {
    // Unsubscribing to the event when the the user moves away from this page
    // this.detachInterface();
  }

  componentWillUpdate() {
  }

  render () {
    var notificationStyle = {
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
      <Provider store={store}>
        <Router history={history}>
          <Switch>
            <Route exact path={"/app/" + appHashPath + "/home"} component={ApplicationHomePage} />
            <Route path={"/app/" + appHashPath + "/vaultv2"} component={ApplicationVaultPage} />
            {/* <Route exact path={ "/app/" + appHashPath + "/drago/dashboard" } component={ApplicationDragoPage} /> */}
            {/* <Route exact path={ "/app/" + appHashPath + "/drago/funds" } component={ApplicationDragoPage} /> */}
            <Route path={"/app/" + appHashPath + "/drago"} component={ApplicationDragoPage} />
            <Route path={"/app/" + appHashPath + "/config"} component={ApplicationConfigPage} />
            {/* <Route path={ "/app/" + appHashPath + "/exchange" } component={ApplicationExchangePage} /> */}
            {/* <Redirect from="/exchange" to={ "/app/" + appHashPath + "/exchange" } />  */}
            <Redirect from="/vault/" to={"/app/" + appHashPath + "/vault"} />
            <Redirect from="/vaultv2/" to={"/app/" + appHashPath + "/vaultv2"} />
            <Redirect from="/drago" to={"/app/" + appHashPath + "/drago"} />
            <Redirect from="/" to={"/app/" + appHashPath + "/home"} />
            <Route component={Whoops404} />
          </Switch>
        </Router>
      </Provider>
    )
  }

  // notificationAlert = (primaryText, secondaryText, eventType = 'transfer') => {
  //   return (
  //     <ElementNotification 
  //       primaryText={primaryText}
  //       secondaryText={secondaryText}
  //       eventType={eventType}
  //       />
  //   )
  // }

  // onNewBlockNumber = (_error, blockNumber) => {
  //   if (_error) {
  //     console.error('onNewBlockNumber', _error)
  //     this.setState({
  //       networkError: NETWORK_WARNING,
  //       networkStatus: MSG_NETWORK_STATUS_ERROR,
  //     })
  //     return
  //   }
  //   const { api } = this.context;
  //   const prevBlockNumber = "".concat(this.state.prevBlockNumber)
  //   var newBlockNumber = 0
  //   // Checking if blockNumber is passed by Parity Api or Web3
  //   if (typeof blockNumber.number !== 'undefined') {
  //     newBlockNumber = new BigNumber(blockNumber.number)
  //   } else {
  //     newBlockNumber = blockNumber
  //   }

  //   console.log(`${sourceLogClass} -> Last blocK: ` + prevBlockNumber)
  //   console.log(`${sourceLogClass} -> New block: ` + newBlockNumber.toFixed())
  //   this.setState({
  //     prevBlockNumber: newBlockNumber.toFixed()
  //   })
  //   // Checking that the current newBlockNumber is higher than previous one.
  //   if (prevBlockNumber > newBlockNumber.toFixed()) {
  //     console.log(`${sourceLogClass} -> Detected prevBlockNumber > currentBlockNumber. Skipping accounts update.`)
  //     this.setState({
  //       prevBlockNumber: newBlockNumber.toFixed(),
  //       networkError: NETWORK_WARNING,
  //       networkStatus: MSG_NETWORK_STATUS_ERROR,
  //     })
  //     return null
  //   }
  //   this.setState({
  //     networkStatus: MSG_NETWORK_STATUS_OK,
  //     networkError: NETWORK_OK,
  //   })
  // }

  // getAccountsParity () {
  //   const { api } = this.context;
  //   const selectedEndpoint = localStorage.getItem('endpoint')
  //   console.log(api)
  //   return api.parity
  //   .accountsInfo()
  //   .then((accountsInfo) => {
  //     console.log('Parity getAccounts', accountsInfo)
  //     Object.keys(accountsInfo).forEach(function(k) {
  //       accountsInfo[k] = {
  //         name: accountsInfo[k].name,
  //         source: "parity"
  //       }
  //     })
  //     return accountsInfo
  //   })
  //   .catch((error) => {
  //     console.warn('getAccounts', error);
  //     // return api.parity
  //     //   .accounts()
  //     //   .then((accountsInfo) => {
  //     //     return Object
  //     //       .keys(accountsInfo)
  //     //       .filter((address) => accountsInfo[address].uuid)
  //     //       .reduce((ret, address) => {
  //     //         ret[address] = {
  //     //           name: accountsInfo[address].name
  //     //         };
  //     //         return ret;
  //     //       }, {});
  //     //   }
  //     // );
  //     return {}
  //   })
  // }

  // getAccountsMetamask () {
  //   const web3 = window.web3
  //   if (typeof web3 === 'undefined') {
  //     return;
  //   }
  //   return web3.eth.net.getId()
  //   .then((networkId) => {
  //     if (networkId != DEFAULT_NETWORK_ID) {
  //       this.setState({
  //         networkCorrect: false,
  //         warnMsg: MSG_NO_KOVAN
  //       })
  //     } else {
  //       this.setState({
  //         networkCorrect: true
  //       }) 
  //     }
  //   })
  //   .then (() =>{
  //     return web3.eth.getAccounts()
  //     .then(accounts => {
  //       const balance = web3.eth.getBalance(accounts[0])
  //       .then(balance => {
  //         return balance;
  //       })
  //       const accountsMetaMask = {
  //         [accounts[0]]: {
  //           name: "MetaMask",
  //           source: "MetaMask"
  //         }
  //       }
  //       return accountsMetaMask;
  //     })
  //     .catch((error) =>{
  //       console.warn(error)
  //       return {}
  //     })
  //   })
  // }

  // attachInterfaceInfura = () => {
  //   const { api } = this.context;
  //   var sourceLogClass = this.constructor.name
  //   var WsSecureUrl = ''
  //   console.log('Interface Infura')
  //   return Promise
  //   .all([
  //     this.getAccountsMetamask()
  //   ])
  //   .then(([accountsMetaMask]) => {
  //     const allAccounts = {...accountsMetaMask}
  //     console.log('Metamask accounts loaded')
  //     this.setState({
  //       accountsInfo: accountsMetaMask,
  //       // loading: false,
  //       accounts: Object
  //         .keys(allAccounts)
  //         .map((address) => {
  //           const info = allAccounts[address] || {};
  //           return {
  //             address,
  //             name: info.name,
  //             source: info.source,
  //             ethBalance: "0"
  //           };
  //         })
  //       });
  //       // Subscribing to newBlockNumber event
  //       api.subscribe('eth_blockNumber', this.onNewBlockNumber)
  //         .then((subscriptionID) => {
  //           console.log(`${sourceLogClass}: Subscribed to eth_blockNumber -> Subscription ID: ${subscriptionID}`);
  //           this.setState({ subscriptionData: subscriptionID });
  //         })
  //         .catch((error) => {
  //           console.warn('error subscription', error)
  //         });
  //     })
  //     .then(()=>{
  //       this.setState({
  //         loading: false,
  //         });    
  //     })
  //     .catch((error) => {
  //       this.setState({
  //         networkError: NETWORK_WARNING,
  //         networkStatus: MSG_NETWORK_STATUS_ERROR,
  //       })
  //       console.warn('attachInterface', error)
  //     });
  // }

  // attachInterfaceRigoBlock = () => {
  //   const { api } = this.context;
  //   var sourceLogClass = this.constructor.name
  //   var WsSecureUrl = ''
  //   console.log('Interface RigoBlock')
  //   if (!api.isConnected) {
  //     this.setState({
  //       networkError: NETWORK_WARNING,
  //       networkStatus: MSG_NETWORK_STATUS_ERROR,
  //     })
  //     return
  //   }
  //   // Checking if the parity node is running in --public-mode
  //   api.parity.nodeKind()
  //     .then(result => {
  //       console.log(result.availability)
  //       if (result.availability === 'public') {
  //         // if --public-mode then getting only MetaMask accounts
  //         return [this.getAccountsMetamask()]
  //       }
  //       else {
  //         // if NOT --public-mode then getting bot Parity and MetaMask accounts
  //         return [this.getAccountsParity(), this.getAccountsMetamask()]
  //       }
  //     })
  //     .then((getAccounts) => {
  //       Promise
  //         .all(getAccounts)
  //         .then(([accountsInfo, accountsMetaMask]) => {
  //           const allAccounts = { ...accountsInfo, ...accountsMetaMask }
  //           console.log('Parity accounts loaded')
  //           console.log(allAccounts)
  //           this.setState({
  //             accountsInfo,
  //             // loading: false,
  //             ethBalance: new BigNumber(0),
  //             accounts: Object
  //               .keys(allAccounts)
  //               .map((address) => {
  //                 const info = allAccounts[address] || {};
  //                 return {
  //                   address,
  //                   name: info.name,
  //                   source: info.source,
  //                   ethBalance: "0"
  //                 };
  //               })
  //           })
  //           // Subscribing to newBlockNumber event
  //           if (PROD) {
  //             WsSecureUrl = EP_RIGOBLOCK_KV_PROD_WS
  //           } else {
  //             WsSecureUrl = EP_RIGOBLOCK_KV_DEV_WS
  //           }
  //           const web3 = new Web3(WsSecureUrl)
  //           Promise
  //           .all([web3.eth.subscribe('newBlockHeaders', this.onNewBlockNumber)])
  //           .then(result =>{
  //             var subscription = result[0]
  //             console.log(`${sourceLogClass}: Subscribed to eth_blockNumber`);
  //             this.setState({ subscriptionData: subscription })
  //           })
  //         })
  //         .then(() => {
  //           this.setState({
  //             loading: false,
  //           });
  //         })
  //         .catch((error) => {
  //           this.setState({
  //             networkError: NETWORK_WARNING,
  //             networkStatus: MSG_NETWORK_STATUS_ERROR,
  //           })
  //           console.warn('attachInterfaceRigoBlock', error)
  //         });
  //     })
  //     .catch((error) => {
  //       this.setState({
  //         networkError: NETWORK_WARNING,
  //         networkStatus: MSG_NETWORK_STATUS_ERROR,
  //       })
  //       console.warn('attachInterfaceRigoBlock', error)
  //     });
  // }

  // detachInterface = () => {
  //   const { subscriptionData } = this.state;
  //   const { api } = this.context;
  //   const endpoint = localStorage.getItem('endpoint')
  //   var WsSecureUrl = ''
  //   var sourceLogClass = this.constructor.name
  //   switch (endpoint) {
  //     case "infura":
  //       api.unsubscribe(subscriptionData)
  //         .then((result) => {
  //           console.log(result)
  //           console.log(`${sourceLogClass}: Successfully unsubscribed from eth_blockNumber -> Subscription ID: ${subscriptionData}`);
  //         })
  //         .catch((error) => {
  //           console.warn(`${sourceLogClass}: Unsubscribe error ${error}`)
  //         });
  //       break;
  //     default:
  //      if(subscriptionData) {
  //       subscriptionData.unsubscribe(function (error, success) {
  //         if (success) {
  //           console.log(`${sourceLogClass}: Successfully unsubscribed from eth_blockNumber`);
  //         }
  //         if (error) {
  //           console.warn(`${sourceLogClass}: Unsubscribe error ${error}`)
  //         }
  //       });
  //      }

  //   }
  // } 
}

export default App
