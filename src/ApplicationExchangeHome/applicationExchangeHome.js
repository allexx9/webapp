// Copyright 2016-2017 Rigo Investment Sarl.

import React, { Component } from 'react';
// import ApplicationDragoManager from './ApplicationDragoManager'
// import ApplicationDragoTrader from './ApplicationDragoTrader'
import Loading from '../_atomic/atoms/loading';
import styles from './applicationExchangeHome.module.css';
import {
  DEFAULT_NETWORK_NAME,
  EP_RIGOBLOCK_MN_PROD_WS,
  ZEROEX_CONTRACT_ADDRESS_MN,
  ZRX_MN,
  WETH_MN
} from '../_utils/const'
import { Row, Col, Grid } from 'react-flexbox-grid';
// import LeftSideDrawerFunds from '../Elements/leftSideDrawerFunds';
import PropTypes from 'prop-types';
import utils from '../_utils/utils'
import ElementNotificationsDrawer from '../Elements/elementNotificationsDrawer'
import CheckAuthPage from '../Elements/checkAuthPage'
import ElementBottomStatusBar from '../Elements/elementBottomStatusBar'
import FundSelector from '../_atomic/molecules/fundSelector'
import TokenTradeSelector from '../_atomic/molecules/tokenTradeSelector'
// import DragoComingSoon from '../Elements/elementDragoComingSoon'
import TokenLiquidity from '../_atomic/atoms/tokenLiquidity'
import {
  UPDATE_SELECTED_FUND,
  UPDATE_TRANSACTIONS_DRAGO_MANAGER
} from '../_utils/const'
import Immutable from 'immutable'
import { fakeOrders } from '../_utils/fakeOrders'
import Paper from 'material-ui/Paper'
import { connect } from 'react-redux';
import OrderBook from '../_atomic/organisms/orderBook';
import OrderBox from '../_atomic/organisms/orderBox'
import Web3 from 'web3';
import * as abis from '../PoolsApi/src/contracts/abi'
import Exchange from '../_utils/exchange'

function mapStateToProps(state) {
  return state
}

class ApplicationExchangeHome extends Component {

  constructor() {
    super();
    this._notificationSystem = null;
    this.sourceLogClass = this.constructor.name
  }

  static contextTypes = {
    api: PropTypes.object.isRequired,
  };

  static propTypes = {
    location: PropTypes.object.isRequired,
    endpoint: PropTypes.object.isRequired,
    transactionsDrago: PropTypes.object.isRequired,
    handleToggleNotifications: PropTypes.func.isRequired,
    user: PropTypes.object.isRequired,
    notificationsOpen: PropTypes.bool.isRequired,
    dispatch: PropTypes.func.isRequired
  };

  state = {
    bidsOrders: [], 
    asksOrders: [],
  }

  scrollPosition = 0
  activeElement = null

  updateTransactionsDragoAction = (results) => {
    return {
      type: UPDATE_TRANSACTIONS_DRAGO_MANAGER,
      payload: results
    }
  };

  updateSelectedFundDetails = (liquidity, fund) => {
    const payload = {
      details: fund, 
      liquidity: {
        ETH: liquidity[0],
        WETH: liquidity[1],
        ZRX: liquidity[2]
      }
    }
    return {
      type: UPDATE_SELECTED_FUND,
      payload: payload
    }
  };

  shouldComponentUpdate(nextProps, nextState) {
    var stateUpdate = true
    var propsUpdate = true
    // shouldComponentUpdate returns false if no need to update children, true if needed.
    propsUpdate = (!utils.shallowEqual(this.props, nextProps))
    stateUpdate = (!utils.shallowEqual(this.state.loading, nextState.loading))
    stateUpdate = (!utils.shallowEqual(this.state, nextState))
    // Saving the scroll position. Neede in componentDidUpdate in order to avoid the the page scroll to be
    // set top
    const element = this.node
    if (element != null) {
      this.scrollPosition = window.scrollY
    }
    return stateUpdate || propsUpdate
  }

  componentWillMount() {
  }

  componentDidMount() {
    const {accounts } = this.props.endpoint
    this.getTransactions (null, accounts)
    this.connectToRadarRelay()
    this.connectToExchange()
  }

  componentWillUnmount() {
  }

  componentWillUpdate() {
    // Storing the active document, so we can preserve focus in forms.
    this.activeElement = document.activeElement
  }

  componentDidUpdate() {
    // The following code is needed to fix a bug in tables. The scrolling posision is reset at every component re-render.
    // Setting the page scroll position
    console.log(`${this.sourceLogClass} -> componentDidUpdate`);
    // const element = ReactDOM.findDOMNode(this);
    const element = this.node
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

  onSelectFund = (fund) => {
    const { api } = this.context
    utils.getDragoLiquidity(fund.address, api)
    .then(liquidity => {
      this.props.dispatch(this.updateSelectedFundDetails(liquidity, fund))
    })
  }

  onSelectTokenTrade = (token) => {
    console.log(token)
    const bidsOrders = this.state.exchangeUtils.formatOrders(Array.from(JSON.parse(fakeOrders[token]).payload.bids), 'bids')
    const asksOrders = this.state.exchangeUtils.formatOrders(Array.from(JSON.parse(fakeOrders[token]).payload.asks), 'asks')
    this.setState({
      bidsOrders: bidsOrders, 
      asksOrders: asksOrders
    })
  }

  render() {
    const {
      user,
      location,
      handleToggleNotifications,
      notificationsOpen,
      endpoint,
      exchange
    } = this.props
    if (endpoint.loading) {
      return <Loading></Loading>
    }
    if ((endpoint.accounts.length === 0 || !endpoint.networkCorrect)) {
      return (
        <span>
          <CheckAuthPage warnMsg={endpoint.warnMsg} location={location} />
          <ElementBottomStatusBar
            blockNumber={endpoint.prevBlockNumber}
            networkName={endpoint.networkInfo.name}
            networkError={endpoint.networkError}
            networkStatus={endpoint.networkStatus} />
        </span>
      )
    }

    if (user.isManager) {
      // console.log(this.state.bidsList)
      const { bidsOrders, asksOrders } = this.state
      const bidsOrderNormalized = bidsOrders.slice(0,20)
      const asksOrderNormalized = asksOrders.slice(0,20)
      // const bidsOrderNormalizedFilled = [ ...Array(20 - bidsOrderNormalized.length).fill(null), ...bidsOrderNormalized ]
      // const asksOrderNormalizedFilled = [ ...Array(20 - asksOrderNormalized.length).fill(null), ...asksOrderNormalized]
      const selectedOrder = {...exchange.selectedOrder}
      return (
        <div ref={node => this.node = node}>
          <Row className={styles.maincontainer}>
              <Col xs={12}>
              <Paper className={styles.paperTopBarContainer} zDepth={1}>
                <Row>
                  <Col xs={4}>
                    <FundSelector
                      funds={this.props.transactionsDrago.manager.list}
                      onSelectFund={this.onSelectFund} />
                  </Col>
                  <Col xs={2}>
                    <TokenLiquidity liquidity={exchange.selectedFund.liquidity} />
                  </Col>
                  <Col xs={4}>
                    <TokenTradeSelector
                      onSelectTokenTrade={this.onSelectTokenTrade}
                    />
                  </Col>
                </Row>
                </ Paper>
              </Col>
              <Col xs={12}>
                <Row>
                <Col xs={6}>
                    <OrderBox order={selectedOrder}
                    />
                  </Col>
                  <Col xs={6}>
                    <OrderBook 
                    bidsOrders={bidsOrderNormalized} 
                    asksOrders={asksOrderNormalized} 
                    />
                    {/* <ElementListBids list={this.state.bidsList} /> */}
                  </Col>
                </Row>
              </Col>
              <Col xs={12}>
                test 3
              </Col>
          </Row>
          <Row>
            <Col xs={12}>
              {notificationsOpen ? (
                <ElementNotificationsDrawer
                  handleToggleNotifications={handleToggleNotifications}
                  notificationsOpen={notificationsOpen}
                />
              ) : (
                  null
                )}
            </Col>
          </Row>

          <ElementBottomStatusBar
            blockNumber={endpoint.prevBlockNumber}
            networkName={endpoint.networkInfo.name}
            networkError={endpoint.networkError}
            networkStatus={endpoint.networkStatus} />
        </div>
      );
    }

    if (!user.isManager) {
      return (
        <div ref={node => this.node = node}>
          <Row className={styles.maincontainer}>
            <Col xs={12}>
              Only managers can access this section.
            </Col>
          </Row>
          <Row>
            <Col xs={12}>
              {notificationsOpen ? (
                <ElementNotificationsDrawer
                  handleToggleNotifications={handleToggleNotifications}
                  notificationsOpen={notificationsOpen}
                />
              ) : (
                  null
                )}
            </Col>
          </Row>
          <ElementBottomStatusBar
            blockNumber={endpoint.prevBlockNumber}
            networkName={endpoint.networkInfo.name}
            networkError={endpoint.networkError}
            networkStatus={endpoint.networkStatus} />
        </div>
      );
    }
  }

  connectToRadarRelay = () => {
  //   const subscribeMsg =`{
  //     "type": "subscribe",
  //     "channel": "orderbook",
  //     "requestId": 1,
  //     "payload": {
  //         "baseTokenAddress": "0xe41d2489571d322189246dafa5ebde1f4699f498",
  //         "quoteTokenAddress": "0xc02aaa39b223fe8d0a0e5c4f27ead9083c756cc2",
  //         "snapshot": true,
  //         "limit": 100
  //     }
  // }`
  //   const that = this
  //   var ws = new WebSocket('wss://ws.radarrelay.com/0x/v0/ws');
  //   ws.onopen = function () {
  //     console.log('Connected to wss://ws.radarrelay.com/0x/v0/ws');
  //     ws.send(subscribeMsg); 
  //   };
  //   ws.onmessage = function (event) {
  //     console.log(event.data)
  //     const data = JSON.parse(event.data)
  //     if (data.type === 'snapshot') {
  //       // const bidsList = Immutable.List(data.payload.bids) 
  //       // const asksList = Immutable.List(data.payload.asks)
  //       // console.log(bidsList)
  //       // console.log(asksList)
  //       console.log(data.payload)
  //       // that.setState({
  //       //   bidsList: bidsList
  //       // })
  //     }
  //   };
  // console.log(JSON.parse(fakeOrders))
  }

  onNewEventZeroExEchange = (error, event) => {
    console.log(event)
  }


  connectToExchange = () =>{
    const networkInfo = {
      id: 1,
      name: "mainnet",
      etherscan: "https://www.etherscan.io/",
      zeroExExchangeContractAddress: "0x12459c951127e0c374ff9105dda097662a027093"
    }
    const endpoints = this.props.endpoint.endpointInfo
    var exchangeUtils = new Exchange(endpoints, networkInfo)
    var contract = exchangeUtils.init()
    const subscription = contract.events.allEvents({
      fromBlock: 0,
      toBlock: 'latest'
    }, this.onNewEventZeroExEchange)
    console.log(subscription)
    const orders = exchangeUtils.formatOrders(Array.from(JSON.parse(fakeOrders.OMG).payload.asks), 'asks')
    console.log(orders)
    console.log(exchangeUtils)
    exchangeUtils.baseTokenAddress = ZRX_MN
    exchangeUtils.quoteTokenAddress = WETH_MN
    var relayOrders = exchangeUtils.getOrdersFromRelay()
    console.log(relayOrders)

    const bidsOrders = exchangeUtils.formatOrders(Array.from(JSON.parse(fakeOrders.OMG).payload.bids), 'bids')
    const asksOrders = exchangeUtils.formatOrders(Array.from(JSON.parse(fakeOrders.OMG).payload.asks), 'asks')

    this.setState({
      exchangeUtils: exchangeUtils,
      bidsOrders: bidsOrders, 
      asksOrders: asksOrders
    })
  }

  // Getting last transactions
  getTransactions = (dragoAddress, accounts) => {
    const { api } = this.context
    // const options = {balance: false, supply: true}
    const options = { balance: false, supply: true, limit: 10, trader: false }
    utils.getTransactionsDragoOptV2(api, dragoAddress, accounts, options)
      .then(results => {
        const createdLogs = results[1].filter(event => {
          return event.type !== 'BuyDrago' && event.type !== 'SellDrago'
        })
        results[1] = createdLogs
        this.props.dispatch(this.updateTransactionsDragoAction(results))
        this.setState({
          loading: false,
        });
      })
      .catch((error) => {
        console.warn(error)
      })
  }

}

export default connect(mapStateToProps)(ApplicationExchangeHome)
