// Copyright 2016-2017 Rigo Investment Sagl.

import BigNumber from 'bignumber.js';
import Paper from 'material-ui/Paper';
import PropTypes from 'prop-types';
import React, { Component } from 'react';
import { Col, Row } from 'react-flexbox-grid';
import { connect } from 'react-redux';
import CheckAuthPage from '../Elements/checkAuthPage';
import ElementBottomStatusBar from '../Elements/elementBottomStatusBar';
import ElementNotificationsDrawer from '../Elements/elementNotificationsDrawer';
// import FlatButton from 'material-ui/FlatButton'
import PoolApi from '../PoolsApi/src';
// import ApplicationDragoManager from './ApplicationDragoManager'
// import ApplicationDragoTrader from './ApplicationDragoTrader'
import Loading from '../_atomic/atoms/loading';
// import DragoComingSoon from '../Elements/elementDragoComingSoon'
import TokenLiquidity from '../_atomic/atoms/tokenLiquidity';
import TokenPrice from '../_atomic/atoms/tokenPrice';
import FundSelector from '../_atomic/molecules/fundSelector';
import TokenTradeSelector from '../_atomic/molecules/tokenTradeSelector';
import ChartBox from '../_atomic/organisms/chartBox';
import OrderBook from '../_atomic/organisms/orderBook';
import OrderBox from '../_atomic/organisms/orderBox';
import OrdersHistoryBox from '../_atomic/organisms/ordersHistoryBox';
import { Actions } from '../_redux/actions';
import {
  ERC20_TOKENS,
  TRADE_TOKENS_PAIRS,
} from '../_utils/const';
import {
  CANCEL_SELECTED_ORDER,
  FETCH_FUND_ORDERS,
  FETCH_HISTORY_TRANSACTION_LOGS,
  FETCH_MARKET_PRICE_DATA,
  ORDERBOOK_AGGREGATE_ORDERS,
  RELAY_CLOSE_WEBSOCKET,
  RELAY_GET_ORDERS,
  RELAY_OPEN_WEBSOCKET,
  UPDATE_FUND_LIQUIDITY,
  UPDATE_SELECTED_FUND,
  UPDATE_TRADE_TOKENS_PAIR
} from '../_redux/actions/const';
import Exchange, { getAvailableAddresses, getMarketTakerOrder, getTokenAllowance } from '../_utils/exchange';
import utils from '../_utils/utils';
import styles from './applicationExchangeHome.module.css';
import ExchangeBox from '../_atomic/organisms/exchangeBox';


// import { getData } from "../_utils/data"

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

  static childContextTypes = {
    exchangeUtils: PropTypes.object
  };

  getChildContext() {
    return {
      exchangeUtils: this.state.exchangeUtils,
    };
  }

  static propTypes = {
    location: PropTypes.object.isRequired,
    endpoint: PropTypes.object.isRequired,
    transactionsDrago: PropTypes.object.isRequired,
    handleToggleNotifications: PropTypes.func.isRequired,
    user: PropTypes.object.isRequired,
    notificationsOpen: PropTypes.bool.isRequired,
    dispatch: PropTypes.func.isRequired,
    exchange: PropTypes.object.isRequired,
  };

  state = {
    exchangeUtils: {},
    chartData: [],
    managerHasNoFunds: false
  }

  scrollPosition = 0
  activeElement = null

  updateSelectedFundDetails = (fund, managerAccount) => {
    const payload = {
      details: fund,
      // liquidity: {
      //   ETH: liquidity[0],
      //   WETH: liquidity[1],
      //   ZRX: liquidity[2]
      // },
      managerAccount
    }
    return {
      type: UPDATE_SELECTED_FUND,
      payload: payload
    }
  };

  updateSelectedFundLiquidity = (fundAddress, api) => {
    return {
      type: UPDATE_FUND_LIQUIDITY,
      payload: {
        fundAddress,
        api
      }
    }
  };

  updateSelectedTradeTokensPair = (tradeTokensPair) => {
    return {
      type: UPDATE_TRADE_TOKENS_PAIR,
      payload: tradeTokensPair
    }
  };

  setAggregateOrders = (isInputChecked) => {
    return {
      type: ORDERBOOK_AGGREGATE_ORDERS,
      payload: isInputChecked
    }
  };

  relayGetOrders = (filter) => {
    return {
      type: RELAY_GET_ORDERS,
      payload: filter
    }
  };

  getChartData = (networkId, baseTokenAddress, quoteTokenAddress, startDate) => {
    const payload = {
      networkId,
      baseTokenAddress,
      quoteTokenAddress,
      startDate
    }
    return {
      type: FETCH_MARKET_PRICE_DATA,
      payload: payload
    }
  }

  getTradeHistoryLogs = (networkId, baseTokenAddress, quoteTokenAddress) => {
    const payload = {
      networkId,
      baseTokenAddress,
      quoteTokenAddress,
    }
    return {
      type: FETCH_HISTORY_TRANSACTION_LOGS,
      payload: payload
    }
  }

  getFundOrders = (networkId, maker, baseTokenAddress, quoteTokenAddress) => {
    const payload = {
      networkId,
      maker,
      baseTokenAddress,
      quoteTokenAddress,
    }
    console.log(payload)
    return {
      type: FETCH_FUND_ORDERS,
      payload: payload
    }
  }


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
    if (element !== null) {
      this.scrollPosition = window.scrollY
    }
    return stateUpdate || propsUpdate
  }

  UNSAFE_componentWillMount() {
  }

  componentDidMount() {
    if (this.props.endpoint.networkInfo.name === 'kovan') {
      const { accounts } = this.props.endpoint
      const { selectedTokensPair, selectedExchange } = this.props.exchange
      this.getSelectedFundDetails(null, accounts)
      // this.connectToRadarRelay()
      this.connectToExchange(selectedTokensPair)
      getAvailableAddresses(selectedExchange)
        .then(adreesses => {
          this.props.dispatch({ type: 'SET_MAKER_ADDRESS', payload: adreesses[0] })
        })

      // Set available trade tokens pairs
      this.props.dispatch(Actions.exchange.updateAvailableTradeTokensPairs(
        utils.availableTradeTokensPair(TRADE_TOKENS_PAIRS, this.props.exchange.selectedRelay.name))
      )


      // Getting history logs
      this.props.dispatch(this.getTradeHistoryLogs(
        this.props.exchange.relay.networkId,
        this.props.exchange.selectedTokensPair.baseToken.address,
        this.props.exchange.selectedTokensPair.quoteToken.address,
      )
      )

      // Getting history logs
      this.props.dispatch(this.getTradeHistoryLogs(
        this.props.exchange.relay.networkId,
        this.props.exchange.selectedTokensPair.baseToken.address,
        this.props.exchange.selectedTokensPair.quoteToken.address,
      )
      )

      // Getting chart data
      var tsYesterday = new Date((Math.floor(Date.now() / 1000) - 86400 * 7) * 1000).toISOString()
      this.props.dispatch(this.getChartData(
        this.props.exchange.relay.networkId,
        this.props.exchange.selectedTokensPair.baseToken.address,
        this.props.exchange.selectedTokensPair.quoteToken.address,
        tsYesterday
      )
      )
    }
  }

  componentWillUnmount() {
    this.props.dispatch({ type: RELAY_CLOSE_WEBSOCKET })
  }

  UNSAFE_componentWillUpdate() {
    // Storing the active document, so we can preserve focus in forms.
    this.activeElement = document.activeElement
  }

  componentDidUpdate() {
    const element = this.node
    if (element !== null) {
      window.scrollTo(0, this.scrollPosition)
    }
    // Setting focus on the element active before component re-render
    if (this.activeElement.id !== "") {
      const activeElement = document.getElementById(this.activeElement.id);
      if (activeElement !== null) {
        activeElement.focus()
      }
    }
  }

  onToggleAggregateOrders = (isInputChecked) => {
    this.props.dispatch(this.setAggregateOrders(isInputChecked))
    const filter = {
      networkId: this.props.exchange.relay.networkId,
      baseTokenAddress: this.props.exchange.selectedTokensPair.baseToken.address,
      quoteTokenAddress: this.props.exchange.selectedTokensPair.quoteToken.address,
      aggregated: isInputChecked
    }
    this.props.dispatch(this.relayGetOrders(filter))
  }

  onSelectFund = async (fund) => {
    const { api } = this.context
    const { selectedTokensPair, selectedExchange } = this.props.exchange

    // Resetting current order
    this.props.dispatch({
      type: CANCEL_SELECTED_ORDER,
    })

    try {
      const poolApi = new PoolApi(api)
      poolApi.contract.drago.init(fund.address)

      // Getting drago details
      const dragoDetails = await poolApi.contract.drago.getAdminData()
      this.props.dispatch(this.updateSelectedFundDetails(fund, dragoDetails[0].toLowerCase()))

      // Getting drago liquidity
      this.props.dispatch(this.updateSelectedFundLiquidity(fund.address, api))

      // Getting allowances
      const allowanceBaseToken = await getTokenAllowance(selectedTokensPair.baseToken.address, fund.address, selectedExchange)
      const allowanceQuoteToken = await getTokenAllowance(selectedTokensPair.quoteToken.address, fund.address, selectedExchange)
      const tokensAllowance = {
        baseTokenAllowance: new BigNumber(allowanceBaseToken).gt(0),
        quoteTokenAllowance: new BigNumber(allowanceQuoteToken).gt(0)
      }
      this.props.dispatch(this.updateSelectedTradeTokensPair(tokensAllowance))
      // Getting fund orders
      this.props.dispatch(this.getFundOrders(
        this.props.exchange.relay.networkId,
        fund.address.toLowerCase(),
        this.props.exchange.selectedTokensPair.baseToken.address,
        this.props.exchange.selectedTokensPair.quoteToken.address,
      )
      )

    } catch (error) {
      console.log(error)
    }
  }

  onSelectTokenTrade = async (token) => {
    const { api } = this.context
    const { selectedTokensPair, selectedExchange, selectedFund, fundOrders } = this.props.exchange
    try {
      const baseToken = ERC20_TOKENS[api._rb.network.name][token]
      const allowanceBaseToken = await getTokenAllowance(selectedTokensPair.baseToken.address, selectedFund.details.address, selectedExchange)
      const allowanceQuoteToken = await getTokenAllowance(selectedTokensPair.quoteToken.address, selectedFund.details.address, selectedExchange)
      const tradeTokensPair = {
        baseToken: baseToken,
        quoteToken: ERC20_TOKENS[api._rb.network.name].WETH,
        baseTokenAllowance: new BigNumber(allowanceBaseToken).gt(0),
        quoteTokenAllowance: new BigNumber(allowanceQuoteToken).gt(0)
      }
      this.props.dispatch({
        type: CANCEL_SELECTED_ORDER,
      })
      this.props.dispatch(
        this.updateSelectedTradeTokensPair(tradeTokensPair)
      )
      this.connectToExchange(tradeTokensPair)
      var tsYesterday = new Date((Math.floor(Date.now() / 1000) - 86400 * 7) * 1000).toISOString()
      this.props.dispatch(this.getChartData(
        this.props.exchange.relay.networkId,
        baseToken.address,
        ERC20_TOKENS[api._rb.network.name].WETH.address,
        tsYesterday
      )
      )
    } catch (error) {
      console.log(error)
    }
  }

  onButtonTest = () => {
    console.log('open')
    // this.props.dispatch({ type: 'PING', payload: 'resttter' })
    // this.props.dispatch({ type: RELAY_OPEN_WEBSOCKET, payload: { 
    //   url: 'wss://api.ercdex.com',
    //   baseTokenAddress: this.props.exchange.selectedTokensPair.baseToken.address,
    //   quoteTokenAddress: this.props.exchange.selectedTokensPair.quoteToken.address
    // }})
    var filter = {
      networkId: this.props.exchange.relay.networkId,
      baseTokenAddress: this.props.exchange.selectedTokensPair.baseToken.address,
      quoteTokenAddress: this.props.exchange.selectedTokensPair.quoteToken.address,
      aggregated: this.props.exchange.orderBook.aggregated
    }
    this.props.dispatch(this.relayGetOrders(filter))
    // this.props.dispatch({ type: 'RELAY_SUBSCRIBE_WEBSOCKET', payload: { sub: 'sub:ticker2' }})
  }

  onButtonTest2 = () => {
    console.log('subscribe')
    getMarketTakerOrder(
      this.props.exchange.selectedTokensPair.baseToken.address,
      this.props.exchange.selectedTokensPair.quoteToken.address,
      this.props.exchange.selectedTokensPair.baseToken.address,
      '95000000000000000000',
      this.props.exchange.relay.networkId,
      "0x57072759Ba54479669CAdF1A25528a472Af95cEF".toLowerCase()
    )
      .then(results => {
        console.log(results)
      })
    // this.props.dispatch({ type: 'RELAY_OPEN_WEBSOCKET', payload: { url: 'wss://api.ercdex.com'}})
    // this.props.dispatch({ type: 'RELAY_SUBSCRIBE_WEBSOCKET', payload: { sub: 'sub:ticker' }})
    // this.props.dispatch({ type: 'RELAY_SUBSCRIBE_WEBSOCKET', payload: { sub: 'sub:ticker2' }})
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
    // console.log(endpoint.networkInfo.name)

    if (endpoint.networkInfo.name !== 'kovan') {
      return (
        <div ref={node => this.node = node}>
          <Row className={styles.maincontainer}>
            <Col xs={12}>
              <Paper className={styles.paperTopBarContainer} zDepth={1}>
                <div style={{ paddingTop: '16px', paddingBottom: '16px' }}>
                  The exchange is only available on Ethereum Kovan network.
              </div>
              </Paper>
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
      )
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

    if (this.state.managerHasNoFunds) {
      return (
        <div ref={node => this.node = node}>
          <Row className={styles.maincontainer}>
            <Col xs={12}>
              <Paper className={styles.paperTopBarContainer} zDepth={1}>
                <div style={{ paddingTop: '16px', paddingBottom: '16px' }}>
                  You need to own a fund in order to trade on this exchange.
                </div>
              </Paper>
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

    if (user.isManager) {
      const { bids, asks, spread, aggregated } = this.props.exchange.orderBook
      const asksOrderNormalized = asks.slice(asks.length - 20, asks.length)
      const bidsOrderNormalized = bids.slice(0, 20)
      // console.log(this.props.exchange.selectedExchange)
      // const bidsOrderNormalizedFilled = [ ...Array(20 - bidsOrderNormalized.length).fill(null), ...bidsOrderNormalized ]
      // const asksOrderNormalizedFilled = [ ...Array(20 - asksOrderNormalized.length).fill(null), ...asksOrderNormalized]
      // console.log(this.props.transactionsDrago.manager.list)
      const { prices, chartData, fundOrders } = this.props.exchange
      var currentPrice = "1"
      var previousPrice = "0"
      var priceVariation = "0.00"
      if (typeof prices[this.props.exchange.selectedTokensPair.baseToken.symbol].priceEth !== 'undefined') {
        currentPrice = new BigNumber(prices[this.props.exchange.selectedTokensPair.baseToken.symbol].priceEth)
      }
      if (typeof prices.previous[this.props.exchange.selectedTokensPair.baseToken.symbol] !== 'undefined') {
        previousPrice = new BigNumber(prices.previous[this.props.exchange.selectedTokensPair.baseToken.symbol].priceEth)
      }
      if (priceVariation !== '0.00') {
        priceVariation = currentPrice.sub(previousPrice).div(previousPrice).mul(100).toFixed(2)
      }

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
                    <TokenLiquidity
                      liquidity={exchange.selectedFund.liquidity}
                      loading={exchange.loading.liquidity} />
                  </Col>
                  <Col xs={2}>
                    <TokenTradeSelector
                      tradableTokens={exchange.availableTradeTokensPairs}
                      selectedTradeTokensPair={exchange.selectedTokensPair}
                      onSelectTokenTrade={this.onSelectTokenTrade}
                    />
                  </Col>
                  <Col xs={4} className={styles.tokenPriceContainer}>
                    <TokenPrice
                      selectedTradeTokensPair={exchange.selectedTokensPair}
                      tokenPrice={currentPrice.toFixed(6)}
                      priceVariation={priceVariation}
                    />
                  </Col>
                </Row>
              </ Paper>
            </Col>
            {/* <Col xs={12}>
              <ChartBox data={this.state.chartData} />
            </Col> */}
            <Col xs={12}>
              <Row>
                <Col xs={3}>
                  <Row>
                    <Col xs={12}>
                      <ExchangeBox />
                    </Col>
                    <Col xs={12}>
                      <OrderBox />
                    </Col>
                  </Row>
                </Col>
                <Col xs={7}>
                  <Row>
                    <Col xs={12}>
                      <ChartBox
                        data={chartData}
                        loading={exchange.loading.marketBox}
                      />
                    </Col>
                    <Col xs={12}>
                      <OrdersHistoryBox
                        fundOrders={fundOrders}
                      />
                    </Col>
                  </Row>
                </Col>
                <Col xs={2}>
                  <OrderBook
                    bidsOrders={bidsOrderNormalized}
                    asksOrders={asksOrderNormalized}
                    spread={spread}
                    aggregated={aggregated}
                    onToggleAggregateOrders={this.onToggleAggregateOrders}
                    onlyAggregated={this.props.exchange.selectedRelay.onlyAggregateOrderbook}
                  />
                </Col>


              </Row>
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

  onNewEventZeroExExchange = (error, event) => {

  }

  connectToExchange = async (tradeTokensPair) => {
    console.log(tradeTokensPair)
    const { api } = this.context
    const networkInfo = api._rb.network
    const endpoints = this.props.endpoint.endpointInfo
    var exchangeUtils = new Exchange(endpoints, networkInfo, tradeTokensPair)
    var contract = exchangeUtils.init()
    const subscription = contract.events.allEvents({
      fromBlock: 0,
      toBlock: 'latest'
    }, this.onNewEventZeroExExchange)
    var filter = {
      relay: this.props.exchange.selectedRelay,
      networkId: this.props.exchange.relay.networkId,
      baseToken: this.props.exchange.selectedTokensPair.baseToken,
      quoteToken: this.props.exchange.selectedTokensPair.quoteToken,
      aggregated: this.props.exchange.orderBook.aggregated
    }
    this.props.dispatch(this.relayGetOrders(filter))
    this.props.dispatch({
      type: RELAY_OPEN_WEBSOCKET, payload: {
        url: 'wss://api.ercdex.com',
        baseTokenAddress: this.props.exchange.selectedTokensPair.baseToken.address,
        quoteTokenAddress: this.props.exchange.selectedTokensPair.quoteToken.address
      }
    })
  }

  // Getting last transactions
  async getSelectedFundDetails(dragoAddress, accounts) {
    const { api } = this.context
    // const options = {balance: false, supply: true}
    const options = { balance: false, supply: true, limit: 10, trader: false }
    try {
      const results = await utils.getTransactionsDragoOptV2(api, dragoAddress, accounts, options)
      const createdLogs = results[1].filter(event => {
        return event.type !== 'BuyDrago' && event.type !== 'SellDrago'
      })
      console.log(results)
      results[1] = createdLogs
      results[2].sort(function (a, b) {
        var keyA = a.symbol,
          keyB = b.symbol;
        // Compare the 2 dates
        if (keyA < keyB) return -1;
        if (keyA > keyB) return 1;
        return 0;
      });
      this.props.dispatch(Actions.drago.updateTransactionsDragoManagerAction(results))

      if (results[2].length !== 0) {
        // Getting fund orders
        this.props.dispatch(this.getFundOrders(
          this.props.exchange.relay.networkId,
          results[2][0].address.toLowerCase(),
          this.props.exchange.selectedTokensPair.baseToken.address,
          this.props.exchange.selectedTokensPair.quoteToken.address,
        )
        )
        this.onSelectFund(results[2][0])
      } else {
        this.setState({
          managerHasNoFunds: true,
        });
      }

    } catch (error) {
      console.warn(error)
    }
  }

}

export default connect(mapStateToProps)(ApplicationExchangeHome)
