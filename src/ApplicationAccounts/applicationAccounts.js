// Copyright 2016-2017 Rigo Investment Sarl.

import { rigotoken } from '../contracts'
import Web3 from 'web3'
import BigNumber from 'bignumber.js';
import React, { Component } from 'react';
import ReactDOM from 'react-dom'
import Accounts from '../Accounts';
import ApplicationDragoManager from './ApplicationDragoManager'
import ApplicationDragoTrader from './ApplicationDragoTrader'
import Loading from '../Loading';
import Status from '../Status';

import styles from './applicationDragoHome.module.css';

import {
  DEFAULT_NETWORK_ID,
  DEFAULT_NETWORK_NAME,
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
  EP_RIGOBLOCK_KV_PROD_WS,
  EP_INFURA_KV_WS
} from '../utils/const'
import { Grid, Row, Col } from 'react-flexbox-grid';
import LeftSideDrawerFunds from '../Elements/leftSideDrawerFunds';
import PropTypes from 'prop-types';
import utils from '../utils/utils'
import NotificationSystem from 'react-notification-system'
import { List, ListItem } from 'material-ui/List';
import Subheader from 'material-ui/Subheader';
import Paper from 'material-ui/Paper';
import Avatar from 'material-ui/Avatar';
import ElementNotification from '../Elements/elementNotification'
import ElementNotificationsDrawer from '../Elements/elementNotificationsDrawer'
import CheckAuthPage from '../Elements/checkAuthPage'
import ElementBottomStatusBar from '../Elements/elementBottomStatusBar'


const DIVISOR = 10 ** 6;  //tokens are divisible by one million
var sourceLogClass = null

export default class ApplicationAccountsHome extends Component {

  constructor() {
    super();
    this._notificationSystem = null;
    sourceLogClass = this.constructor.name
  }

  // Checking the type of the context variable that we receive by the parent
  static contextTypes = {
    api: PropTypes.object.isRequired,
    isConnected: PropTypes.func.isRequired
  };

  static childContextTypes = {
    addTransactionToQueue: PropTypes.func
  };
  
  getChildContext () {   
    return {
      addTransactionToQueue: this.addTransactionToQueue
    };
  }

  static propTypes = {
    location: PropTypes.object.isRequired,
    handleToggleNotifications: PropTypes.func.isRequired,
    isManager: PropTypes.bool.isRequired, 
    notificationsOpen: PropTypes.bool.isRequired
  };

  state = {
    accounts: [],
    accountsInfo: {},
    accountsBalanceError: false,
    // blockNumber: new BigNumber(-1),
    rigoTokenBalance: null,
    ethBalance: null,
    loading: true,
    subscriptionData: null,
    contract: null,
    instance: null,
    allEvents: [],
    minedEvents: [],
    pendingEvents: [],
    infura: false,
    prevBlockNumber: 0,
    networkStatus: MSG_NETWORK_STATUS_OK,
    networkError: NETWORK_OK,
    networkCorrect: false,
    warnMsg: null,
    recentTransactions: new Map(),
  }

  scrollPosition = 0
  activeElement = null

  shouldComponentUpdate(nextProps, nextState){    
    var stateUpdate = true
    var propsUpdate = true
    // shouldComponentUpdate returns false if no need to update children, true if needed.
    propsUpdate = (!utils.shallowEqual(this.props, nextProps))
    
    // console.log(this.state)
    // console.log(nextState)
    stateUpdate = (!utils.shallowEqual(this.state.loading, nextState.loading))
    stateUpdate = (!utils.shallowEqual(this.state, nextState))
    // Saving the scroll position. Neede in componentDidUpdate in order to avoid the the page scroll to be
    // set top
    const element = ReactDOM.findDOMNode(this);
    if (element != null) {
      this.scrollPosition = window.scrollY
    }
    return stateUpdate || propsUpdate 
  }

  componentWillMount () {
  } 

  componentDidMount() {
    // Allowed endpoints are defined in const.js
    var selectedEndpoint = localStorage.getItem('endpoint')
    var allowedEndpoints = new Map(ALLOWED_ENDPOINTS)
    if (allowedEndpoints.has(selectedEndpoint)) {
      switch (selectedEndpoint) {
        case INFURA:
        console.log(INFURA)
          this.attachInterfaceInfura()
        break;
        case RIGOBLOCK:
          console.log(RIGOBLOCK)
          this.attachInterfaceRigoBlock()
        break; 
        case LOCAL:
          console.log(LOCAL)
          this.attachInterfaceRigoBlock()
        break; 
      }
    } else {
      localStorage.setItem('endpoint', DEFAULT_ENDPOINT)
      this.attachInterfaceInfura()
    }
    this._notificationSystem = this.refs.notificationSystem
  }

  componentWillUnmount() {
    // Unsubscribing to the event when the the user moves away from this page
    this.detachInterface();
  }

  componentWillUpdate() {
    // Storing the active document, so we can preserve focus in forms.
    this.activeElement = document.activeElement
  }

  componentDidUpdate(prevProps, prevState) {
    // The following code is needed to fix a bug in tables. The scrolling posision is reset at every component re-render.
    // Setting the page scroll position
    var sourceLogClass = this.constructor.name
    console.log(`${sourceLogClass} -> componentDidUpdate`);
    const element = ReactDOM.findDOMNode(this);
    if (element != null) {
      window.scrollTo(0, this.scrollPosition)
    }
    // Setting focus on the element active before component re-render
    if (this.activeElement.id !== "") {
      const activeElement = document.getElementById(this.activeElement.id);
      if (activeElement != null) {
        activeElement.focus()
      }
    }

    
  }

  updateTransactionsQueue = () => {
    // Processing the queue in order to update the transactions status
    const { api } = this.context
    const { recentTransactions } = this.state
    const newRecentTransactions = utils.updateTransactionsQueue(api,recentTransactions)
    newRecentTransactions !== null
    ? this.setState({
      recentTransactions: newRecentTransactions
    })
    : null
  }

  addTransactionToQueue = (transactionId, transactionDetails) => {
    // Adding the transaction to the sessione queue
    const { recentTransactions } = this.state
    var newRecentTransactions = new Map(recentTransactions)
    newRecentTransactions.set(transactionId, transactionDetails)
    // Saving to state and updating the transactions in the queue
    this.setState({
      recentTransactions: newRecentTransactions
    }, this.updateTransactionsQueue)
  }

  render () {
    const { ethBalance, loading, blockNumber, accounts, allEvents, accountsInfo, networkError, networkStatus, networkCorrect, warnMsg } = this.state;
    const { isManager, location, handleToggleNotifications, notificationsOpen }  = this.props

    if (loading) {
      return <Loading></Loading>
    }

    if (ethBalance === null) {
      console.log('ethBalance = null')
      return null
    }

    // console.log(accounts)

    if ((accounts.length === 0 || !networkCorrect)) {
      return (
        <span>
          <CheckAuthPage warnMsg={warnMsg} location={location}/>
          <ElementBottomStatusBar
            blockNumber={this.state.prevBlockNumber}
            networkName={DEFAULT_NETWORK_NAME}
            networkError={networkError}
            networkStatus={networkStatus} />
        </span>
    )
    }

    if (isManager) {
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
        <span>
          <Row className={styles.maincontainer}>
            <Col xs={2}>
              <LeftSideDrawerFunds location={location} isManager={isManager}/>
            </Col>
            <Col xs={10}>
              <NotificationSystem ref={n => this._notificationSystem = n} style={notificationStyle} />
              <ApplicationDragoManager
                blockNumber={blockNumber}
                accounts={accounts}
                ethBalance={ethBalance}
                allEvents={allEvents}
                accountsInfo={accountsInfo}
                isManager={isManager}
              />
            </Col>
            <Row>
              <Col xs={12}>
                {notificationsOpen ? (
                  <ElementNotificationsDrawer
                    handleToggleNotifications={handleToggleNotifications}
                    notificationsOpen={notificationsOpen}
                    accounts={accounts}
                    recentTransactions={this.state.recentTransactions}
                    updateTransactionsQueue={this.updateTransactionsQueue}
                  />
                ) : (
                    null
                  )}
              </Col>
            </Row>
          </Row>
          <ElementBottomStatusBar 
          blockNumber={this.state.prevBlockNumber}
          networkName={DEFAULT_NETWORK_NAME}
          networkError={networkError}
          networkStatus={networkStatus} />
        </span>
      );
    }

    if (!isManager) {

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
        <span>
          <Row className={styles.maincontainer}>
            <Col xs={2}>
            <LeftSideDrawerFunds location={location} isManager={isManager}/>
            </Col>
            <Col xs={10}>
              <NotificationSystem ref={n => this._notificationSystem = n} style={notificationStyle}/>
              <ApplicationDragoTrader 
                blockNumber={blockNumber}
                accounts={accounts}
                ethBalance={ethBalance}
                allEvents={allEvents}
                accountsInfo={accountsInfo}
                isManager={isManager}
              />
            </Col>
          </Row>
            <Row>
            <Col xs={12}>
              {notificationsOpen ? (
                <ElementNotificationsDrawer 
                handleToggleNotifications={handleToggleNotifications} 
                notificationsOpen={notificationsOpen}
                accounts={accounts}
                recentTransactions={this.state.recentTransactions}
                updateTransactionsQueue={this.updateTransactionsQueue}
                />
              ) : (
                null
              )}
            </Col>
          </Row>
          <ElementBottomStatusBar 
          blockNumber={this.state.prevBlockNumber}
          networkName={DEFAULT_NETWORK_NAME}
          networkError={networkError}
          networkStatus={networkStatus} />
        </span>
      );
    }
  }

  notificationAlert = (primaryText, secondaryText, eventType = 'transfer') => {
    return (
      <ElementNotification 
        primaryText={primaryText}
        secondaryText={secondaryText}
        eventType={eventType}
        eventStatus='executed'
        txHash=''
        />
    )
  }

  onNewBlockNumber = (_error, blockNumber) => {
    if (_error) {
      console.error('onNewBlockNumber', _error)
      return
    }
    const { api } = this.context;
    const prevBlockNumber = "".concat(this.state.prevBlockNumber)
    var newBlockNumber = 0
    // Checking if blockNumber is passed by Parity Api or Web3
    if (typeof blockNumber.number !== 'undefined') {
      newBlockNumber = new BigNumber(blockNumber.number)
    } else {
      newBlockNumber = blockNumber
    }

    console.log(`${sourceLogClass} -> Last blocK: ` + prevBlockNumber)
    console.log(`${sourceLogClass} -> New block: ` + newBlockNumber.toFixed())
    this.setState({
      prevBlockNumber: newBlockNumber.toFixed()
    })
    // Checking that the current newBlockNumber is higher than previous one.
    if (prevBlockNumber > newBlockNumber.toFixed()) {
      console.log(`${sourceLogClass} -> Detected prevBlockNumber > currentBlockNumber. Skipping accounts update.`)
      this.setState({
        prevBlockNumber: newBlockNumber.toFixed()
      })
      return null
    }
    const accounts = [].concat(this.state.accounts);


    // Checking RigoToken balance
    const rigoTokenContract = api.newContract(rigotoken, "0x7f026C6E42C808bA02A551BDdD753F9927dA06b1")

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
        console.log(results)
        // Splitting the the result array between ethBalances and rigoTokenBalances
        const halfLength = Math.ceil(results.length / 2)
        const ethBalances = results.splice(0,halfLength)
        const rigoTokenBalances = results
        // console.log(ethBalances)
        // console.log(rigoTokenBalances)
        const prevAccounts = [].concat(this.state.accounts)
        prevAccounts.map((account,index) =>{
          const newEthBalance = api.util.fromWei(ethBalances[index]).toFormat(3)
          // console.log('Last balance: ' + account.ethBalance)
          // console.log('New balance: ' + newEthBalance)
          if ((account.ethBalance !== newEthBalance) && prevBlockNumber != 0) {
            console.log(`${account.name} balance changed.`)
            var eventType = 'balanceChange'
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
            if (this._notificationSystem && this.state.accountsBalanceError === false) {
              this._notificationSystem.addNotification({
                  level: 'info',
                  position: 'br',
                  autoDismiss: 10,
                  children: this.notificationAlert(account.name, secondaryText)
              });
            }
          }

        })
        return [ethBalances,rigoTokenBalances]
      })
      .then((balances) => {
        const ethBalances = balances[0]
        const rigoTokenBalances = balances[1]
        this.setState({
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
            return account;
          })
        )
        })
      })
      .catch((error) => {
        console.warn(`${sourceLogClass} -> ${error}`)
        // Setting the balances to 0 if receiving an error from the endpoint. It happens with Infura.
        this.setState({
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
        })
      });
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
          source: "parity",
          ethBalance: api.util.fromWei(new BigNumber(0)).toFormat(3),
          rigoTokenBalance: api.util.fromWei(new BigNumber(0)).toFormat(3)
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
    const { api } = this.context;
    if (typeof web3 === 'undefined') {
      return;
    }
    return web3.eth.net.getId()
    .then((networkId) => {
      if (networkId != DEFAULT_NETWORK_ID) {
        this.setState({
          networkCorrect: false,
          warnMsg: MSG_NO_KOVAN
        })
      } else {
        this.setState({
          networkCorrect: true
        }) 
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
            source: "MetaMask",
            ethBalance: api.util.fromWei(new BigNumber(0)).toFormat(3),
            rigoTokenBalance: api.util.fromWei(new BigNumber(0)).toFormat(3)
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

  attachInterfaceInfura = () => {
    const { api } = this.context;
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
      this.setState({
        accountsInfo: accountsMetaMask,
        // loading: false,
        accounts: Object
          .keys(allAccounts)
          .map((address) => {
            const info = allAccounts[address] || {};
            return {
              address,
              name: info.name,
              source: info.source,
              ethBalance: api.util.fromWei(new BigNumber(0)).toFormat(3),
              rigoTokenBalance: api.util.fromWei(new BigNumber(0)).toFormat(3)
            };
          })
        });
        // Subscribing to newBlockNumber event
        api.subscribe('eth_blockNumber', this.onNewBlockNumber)
          .then((subscriptionID) => {
            console.log(`${sourceLogClass}: Subscribed to eth_blockNumber -> Subscription ID: ${subscriptionID}`);
            this.setState({ subscriptionData: subscriptionID });
          })
          .catch((error) => {
            console.warn('error subscription', error)
          });
      })
      .then(()=>{
        this.setState({
          loading: false,
          });    
      })
      .catch((error) => {
        console.warn('attachInterface', error)
      });
  }

  attachInterfaceRigoBlock = () => {
    const { api } = this.context;
    var sourceLogClass = this.constructor.name
    var WsSecureUrl = ''
    console.log('Interface RigoBlock')
    // Checking if the parity node is running in --public-mode
    api.parity.nodeKind()
      .then(result => {
        console.log(result.availability)
        if (result.availability === 'public') {
          // if --public-mode then getting only MetaMask accounts
          return [this.getAccountsMetamask()]
        }
        else {
          // if NOT --public-mode then getting bot Parity and MetaMask accounts
          return [this.getAccountsParity(), this.getAccountsMetamask()]
        }
      })
      .then((getAccounts) => {
        Promise
          .all(getAccounts)
          .then(([accountsInfo, accountsMetaMask]) => {
            const allAccounts = { ...accountsInfo, ...accountsMetaMask }
            console.log('Parity accounts loaded')
            console.log(allAccounts)
            this.setState({
              accountsInfo,
              // loading: false,
              ethBalance: new BigNumber(0),
              accounts: Object
                .keys(allAccounts)
                .map((address) => {
                  const info = allAccounts[address] || {};
                  return {
                    address,
                    name: info.name,
                    source: info.source,
                    ethBalance: api.util.fromWei(new BigNumber(0)).toFormat(3),
                    rigoTokenBalance: api.util.fromWei(new BigNumber(0)).toFormat(3)
                  };
                })
            })
            // Subscribing to newBlockNumber event
            if (typeof window.parity !== 'undefined') {
              api.subscribe('eth_blockNumber', this.onNewBlockNumber)
              .then((subscriptionID) => {
                console.log(`${sourceLogClass}: Subscribed to eth_blockNumber -> Subscription ID: ${subscriptionID}`);
                this.setState({ subscriptionData: subscriptionID });
              })
              .catch((error) => {
                console.warn('error subscription', error)
              });
            } else {
              if (PROD) {
                WsSecureUrl = EP_RIGOBLOCK_KV_PROD_WS
              } else {
                WsSecureUrl = EP_RIGOBLOCK_KV_DEV_WS
              }
              const web3 = new Web3(WsSecureUrl)
              Promise
              .all([web3.eth.subscribe('newBlockHeaders', this.onNewBlockNumber)])
              .then(result =>{
                var subscription = result[0]
                console.log(subscription)
                console.log(`${sourceLogClass}: Subscribed to eth_blockNumber -> Subscription ID: ${subscription.id}`);
                this.setState({ subscriptionData: subscription })
              })
            }
          })
          .then(() => {
            this.setState({
              loading: false,
            });
          })
          .catch((error) => {
            console.warn('attachInterfaceRigoBlock', error)
          });
      })
      .catch((error) => {
        console.warn('attachInterfaceRigoBlock', error)
      });
  }

  detachInterface = () => {
    const { subscriptionData } = this.state;
    const { api } = this.context;
    const endpoint = localStorage.getItem('endpoint')
    var WsSecureUrl = ''
    var sourceLogClass = this.constructor.name
    // api.subscribe returns a number
    // web3.eth.subscribe returns an object
    // Checking which case and unsubscribing accordingly
    switch (typeof subscriptionData ) {
      case "number":
        api.unsubscribe(subscriptionData)
          .then((result) => {
            console.log(result)
            console.log(`${sourceLogClass}: Successfully unsubscribed from eth_blockNumber -> Subscription ID: ${subscriptionData}`);
          })
          .catch((error) => {
            console.warn(`${sourceLogClass}: Unsubscribe error ${error}`)
          });
        break;
        case "object":
        if (subscriptionData === null) {
          subscriptionData.unsubscribe(function (error, success) {
            if (success) {
              console.log(`${sourceLogClass}: Successfully unsubscribed from eth_blockNumber`);
            }
            if (error) {
              console.warn(`${sourceLogClass}: Unsubscribe error ${error}`)
            }
          });
        }
        break;
    }
  } 
}
