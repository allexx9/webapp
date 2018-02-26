// Copyright 2016-2017 Rigo Investment Sarl.

import { api } from './parity';
import { Switch, Redirect, Router, Route } from 'react-router-dom'
import createHashHistory from 'history/createHashHistory';
import BigNumber from 'bignumber.js';
import NotificationSystem from 'react-notification-system'
import PropTypes from 'prop-types';
import React, { Component } from 'react';
import Web3 from 'web3'
import MuiThemeProvider from 'material-ui/styles/MuiThemeProvider';

import { rigotoken } from './DragoApi/src/contract/abi'

import {
  ApplicationHomePage,
  // ApplicationVaultPage,
  // ApplicationConfigPage,
  // ApplicationExchangePage, 
  Whoops404
} from './Application';
import ApplicationConfigPage from './Application/applicationConfig';
import ApplicationDragoPage from './Application/applicationDrago';
import ApplicationVaultPage from './Application/applicationVault';
import {
  DEFAULT_NETWORK_NAME,
  MSG_NETWORK_STATUS_OK,
  MSG_NETWORK_STATUS_ERROR,
  NETWORK_OK,
  NETWORK_WARNING,
  INFURA,
  RIGOBLOCK,
  LOCAL,
  ALLOWED_ENDPOINTS, 
  DEFAULT_ENDPOINT,
  PROD,
  EP_RIGOBLOCK_KV_DEV_WS,
  EP_RIGOBLOCK_KV_PROD_WS,
  GRG_ADDRESS_KV
} from './utils/const'
import {
  ATTACH_INTERFACE,
  UPDATE_INTERFACE,
} from './utils/const'
import utils from './utils/utils'
import { Interfaces } from './utils/interfaces'
import { connect } from 'react-redux';
import ElementNotification from './Elements/elementNotification'
// import Actions from './actions/actions'

var appHashPath = true;
var sourceLogClass = null
const isConnectedTimeout = 4000
var subscriptionData = {}

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
    this.state = {
      isConnected: true,
      isSyncing: false,
      syncStatus: {},
    }
  }

  scrollPosition = 0
  td = null
  

  // Defining the properties of the context variables passed down to children
  static childContextTypes = {
    // muiTheme: PropTypes.object,
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

  // Passing down the context variables passed down to children
  getChildContext() {
    return {
      // muiTheme,
      api,
      isConnected: this.state.isConnected,
      isSyncing: this.state.isSyncing,
      syncStatus: this.state.syncStatus,
      ethereumNetworkName: DEFAULT_NETWORK_NAME
    };
  }

  attachInterfaceAction = () => {
    return {
      type: ATTACH_INTERFACE,
      payload: new Promise(resolve => {
        this.attachInterface().then(result => {
          console.log(result)
          resolve(result);
        })
      })
    }
  };

  updateInterfaceAction = (endpoint) => {
    return {
      type: UPDATE_INTERFACE,
      payload: endpoint
    }
  };

  shouldComponentUpdate(nextProps, nextState) {
    const propsUpdate = (!utils.shallowEqual(this.props, nextProps))
    const stateUpdate = (!utils.shallowEqual(this.state, nextState))
    console.log('propsUpdate ', propsUpdate)
    console.log('stateUpdate ', stateUpdate)
    return stateUpdate || propsUpdate 
  }

  componentDidMount() {
    this._notificationSystem = this.refs.notificationSystem
    this.props.dispatch(this.attachInterfaceAction())
  }

  componentWillMount() {
    // Starting connection checking. this is not necessary runnin inside Parity UI
    // because the checki is done by Parity and a messagge will be displayed by the client
    var endpoint = localStorage.getItem('endpoint')
    if (endpoint !== 'local') {
      this.td = setTimeout(this.checkConnectionToNode,2000)
    }
  }

  componentWillUnmount() {
    var endpoint = localStorage.getItem('endpoint')
    if (endpoint !== 'local') {
      clearTimeout(this.td)
    }
    // Unsubscribing to the event when the the user moves away from this page
    this.detachInterface();
  }

  componentWillUpdate() {
  }

  // This function is passed down with context and used as a call back function to show a warning page
  // if the connection with the node drops
  isConnected = (status) => {
    this.setState({
      isConnected: status
    })
  }

  checkConnectionToNode = () =>{
    console.log('Connected: ',api.isConnected)
    if (api.isConnected) {
      if (!this.state.isConnected) {
        this.props.dispatch(this.attachInterfaceAction())
      }
      this.setState({
        isConnected: true
      })
      api.eth.syncing()
      .then(result => {
        console.log('Syncing: ',result)
        if(result !== false) {
          this.setState({
            isSyncing: true,
            syncStatus: result
          })
        }
        // console.log(api.net.peerCount())
        // console.log('synching ', result)
      })
      this.td = setTimeout(this.checkConnectionToNode,isConnectedTimeout)
    } else {
      this.setState({
        isConnected: false
      })  
      this.td = setTimeout(this.checkConnectionToNode,isConnectedTimeout)
    }    
  }

  render() {
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
      <div>
        <NotificationSystem ref={n => this._notificationSystem = n} style={notificationStyle}/>
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
    var sourceLogClass = this.constructor.name
    var WsSecureUrl = ''
    var selectedEndpoint = localStorage.getItem('endpoint')
    var allowedEndpoints = new Map(ALLOWED_ENDPOINTS)
    if (allowedEndpoints.has(selectedEndpoint)) {
      switch (selectedEndpoint) {
        case INFURA:
          console.log(INFURA)
          return Interfaces.attachInterfaceInfuraV2(api)
            .then((result) => {
              // this.setState({...this.state, ...Interfaces.success})
              // Subscribing to newBlockNumber event
              api.subscribe('eth_blockNumber', this.onNewBlockNumber)
                .then((subscriptionID) => {
                  console.log(`${sourceLogClass}: Subscribed to eth_blockNumber -> Subscription ID: ${subscriptionID}`);
                  subscriptionData = subscriptionID
                })
                .catch((error) => {
                  console.warn('error subscription', error)
                });
                return result
            })
            .catch(()=>{
              // this.setState({...this.state, ...Interfaces.error})
            })
        case RIGOBLOCK:
          console.log(RIGOBLOCK)
          // this.attachInterfaceRigoBlock()
          return Interfaces.attachInterfaceRigoBlockV2(api)
            .then((result) => {
              // Setting connection to node
              if (PROD) {
                WsSecureUrl = EP_RIGOBLOCK_KV_PROD_WS
              } else {
                WsSecureUrl = EP_RIGOBLOCK_KV_DEV_WS
              }
              // Subscribing to newBlockNumber event
              const web3 = new Web3(WsSecureUrl)
              Promise
                .all([web3.eth.subscribe('newBlockHeaders', this.onNewBlockNumber)])
                .then(result => {
                  var subscription = result[0]
                  console.log(`${sourceLogClass}: Subscribed to eth_blockNumber`);
                  subscriptionData = subscription
                })
                return result
            })
            .catch(()=>{
              this.setState(...this.state, ...Interfaces.error)
            })
        case LOCAL:
          console.log(LOCAL)
          // this.attachInterfaceRigoBlock()
          return Interfaces.attachInterfaceRigoBlockV2(api)
            .then(() => {
              // Setting connection to node
              if (PROD) {
                WsSecureUrl = EP_RIGOBLOCK_KV_PROD_WS
              } else {
                WsSecureUrl = EP_RIGOBLOCK_KV_DEV_WS
              }
              // Subscribing to newBlockNumber event
              const web3 = new Web3(WsSecureUrl)
              Promise
                .all([web3.eth.subscribe('newBlockHeaders', this.onNewBlockNumber)])
                .then(result => {
                  var subscription = result[0]
                  console.log(`${sourceLogClass}: Subscribed to eth_blockNumber`);
                  subscriptionData = subscription
                })
            })
            .catch(()=>{
              // this.setState({...this.state, ...Interfaces.error})
            })
      }
    } else {
      localStorage.setItem('endpoint', DEFAULT_ENDPOINT)
      return Interfaces.attachInterfaceInfuraV2(api)
        .then(() => {
          // Subscribing to newBlockNumber event
          api.subscribe('eth_blockNumber', this.onNewBlockNumber)
            .then((subscriptionID) => {
              console.log(`${sourceLogClass}: Subscribed to eth_blockNumber -> Subscription ID: ${subscriptionID}`);
              subscriptionData = subscriptionID
            })
            .catch((error) => {
              console.warn('error subscription', error)
            });
        })
        .catch(()=>{
          // this.setState({...this.state, ...Interfaces.error})
        })
    }
  }

  onNewBlockNumber = (_error, blockNumber ) => {
    if (_error) {
      console.error('onNewBlockNumber', _error)
      return
    }
    // const { api } = this.context;
    const { endpoint } = this.props;
    const prevBlockNumber = endpoint.prevBlockNumber
    var newBlockNumber = new BigNumber(0)
    // Checking if blockNumber is passed by Parity Api or Web3
    if (typeof blockNumber.number !== 'undefined') {
      newBlockNumber = new BigNumber(blockNumber.number)
    } else {
      newBlockNumber = blockNumber
    }
    console.log(`${sourceLogClass} -> Last block: ` + prevBlockNumber)
    console.log(`${sourceLogClass} -> New block: ` + newBlockNumber.toFixed())
    this.setState({
      prevBlockNumber: newBlockNumber.toFixed()
    })
    // Checking that the current newBlockNumber is higher than previous one.
    if (prevBlockNumber > newBlockNumber.toFixed()) {
      console.log(`${sourceLogClass} -> Detected prevBlockNumber > currentBlockNumber. Skipping accounts update.`)
      const endpoint = {
        prevBlockNumber: newBlockNumber.toFixed()
      }
      this.updateInterfaceAction(endpoint)
      return null
    }
    const accounts = [].concat(endpoint.accounts);


    // Checking RigoToken balance
    const rigoTokenContract = api.newContract(rigotoken, GRG_ADDRESS_KV)

    const tokensQueries = accounts.map((account) => {
      console.log(`${sourceLogClass} API call getBalance RigoToken-> applicationDragoHome: Getting balance of account ${account.name}`)
      return rigoTokenContract.instance.balanceOf.call({}, [account.address])
    })

    // Checking ethereum balance
    const ethQueries = accounts.map((account) => {
      console.log(`${sourceLogClass} API call getBalance -> applicationDragoHome: Getting balance of account ${account.name}`)
      return api.eth.getBalance(account.address, newBlockNumber)
    })
    const promisesBalances = [...ethQueries, ...tokensQueries]

    Promise
      .all(promisesBalances)
      .then((results) => {
        // Splitting the the result array between ethBalances and rigoTokenBalances
        const halfLength = Math.ceil(results.length / 2)
        const ethBalances = results.splice(0,halfLength)
        const rigoTokenBalances = results
        // console.log(ethBalances)
        // console.log(rigoTokenBalances)
        const prevAccounts = [].concat(endpoint.accounts)
        prevAccounts.map((account,index) =>{
          const newEthBalance = api.util.fromWei(ethBalances[index]).toFormat(3)
          // console.log('Last balance: ' + account.ethBalance)
          // console.log('New balance: ' + newEthBalance)
          if ((account.ethBalance !== newEthBalance) && prevBlockNumber != 0) {
            console.log(`${account.name} balance changed.`)
            var secondaryText = []
            var balDifference = account.ethBalance - newEthBalance
            if (balDifference > 0) {
              console.log(`You transferred ${balDifference.toFixed(4)} ETH!`)
              secondaryText[0] = `You transferred ${balDifference.toFixed(4)} ETH!`
              secondaryText[1] = utils.dateFromTimeStamp(new Date())
            } else {
              console.log(`You received ${Math.abs(balDifference).toFixed(4)} ETH!`)
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
          return
        })
        return [ethBalances,rigoTokenBalances]
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
            account.ethBalance = api.util.fromWei(ethBalance).toFormat(3);
            const rigoTokenBalance = rigoTokenBalances[index];
            account.rigoTokenBalance = api.util.fromWei(rigoTokenBalance).toFormat(3);
            console.log(account)
            return account;
          })
        )
        }
        this.props.dispatch(this.updateInterfaceAction(endpoint))
        
      })
      .catch((error) => {
        console.warn(`${sourceLogClass} -> ${error}`)
        // Setting the balances to 0 if receiving an error from the endpoint. It happens with Infura.
        const endpoint = {
          prevBlockNumber: newBlockNumber.toFixed(),
          loading: false,
          networkError: NETWORK_WARNING,
          networkStatus: MSG_NETWORK_STATUS_ERROR,
          accountsBalanceError: true,
          ethBalance: new BigNumber(0),
          rigoTokenBalance: new BigNumber(0),
          accounts: [].concat(accounts.map((account, index) => {
            account.ethBalance = api.util.fromWei(new BigNumber(0)).toFormat(3);
            account.rigoTokenBalance = api.util.fromWei(new BigNumber(0)).toFormat(3);
            return account;
          })
        )
        }
        this.props.dispatch(this.updateInterfaceAction(endpoint))
      });
  }

  detachInterface = () => {
    // const { subscriptionData } = this.state;
    // const { api } = this.context;
    Interfaces.detachInterface(api,subscriptionData)
  } 
}

export default connect(mapStateToProps)(App)
