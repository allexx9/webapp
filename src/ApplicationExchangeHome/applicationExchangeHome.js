// Copyright 2016-2017 Rigo Investment Sagl.

import { Col, Row } from 'react-flexbox-grid'
import { connect } from 'react-redux'
import BigNumber from 'bignumber.js'
import ElementBottomStatusBar from '../Elements/elementBottomStatusBar'
import Paper from 'material-ui/Paper'
import PropTypes from 'prop-types'
import React, { Component } from 'react'
// import FlatButton from 'material-ui/FlatButton'
import Loading from '../_atomic/atoms/loading'
import PoolApi from '../PoolsApi/src'
// import DragoComingSoon from '../Elements/elementDragoComingSoon'
import * as TYPE_ from '../_redux/actions/const'
import { Actions } from '../_redux/actions'
import {
  DEFAULT_RELAY,
  ERC20_TOKENS,
  EXCHANGES,
  RELAYS,
  TRADE_TOKENS_PAIRS
} from '../_utils/const'
import { getTokenAllowance } from '../_utils/exchange'
import ChartBox from '../_atomic/organisms/chartBox'
import ExchangeBox from '../_atomic/organisms/exchangeBox'
import FundSelector from '../_atomic/molecules/fundSelector'
import OrderBook from '../_atomic/organisms/orderBook'
import OrderBox from '../_atomic/organisms/orderBox'
import OrdersHistoryBox from '../_atomic/organisms/ordersHistoryBox'
import TokenBalances from '../_atomic/atoms/tokenBalances'
import TokenPrice from '../_atomic/atoms/tokenPrice'
import TokenTradeSelector from '../_atomic/molecules/tokenTradeSelector'
import styles from './applicationExchangeHome.module.css'
import utils from '../_utils/utils'

// import { getData } from "../_utils/data"

function mapStateToProps(state) {
  return state
}

class ApplicationExchangeHome extends Component {
  constructor() {
    super()
    this._notificationSystem = null
  }

  static contextTypes = {
    api: PropTypes.object.isRequired
  }

  static propTypes = {
    location: PropTypes.object.isRequired,
    endpoint: PropTypes.object.isRequired,
    transactionsDrago: PropTypes.object.isRequired,
    user: PropTypes.object.isRequired,
    dispatch: PropTypes.func.isRequired,
    exchange: PropTypes.object.isRequired
  }

  state = {
    chartData: [],
    managerHasNoFunds: false
  }

  scrollPosition = 0
  activeElement = null

  shouldComponentUpdate(nextProps, nextState) {
    let stateUpdate = true
    let propsUpdate = true
    // shouldComponentUpdate returns false if no need to update children, true if needed.
    propsUpdate = !utils.shallowEqual(this.props, nextProps)
    stateUpdate = !utils.shallowEqual(this.state.loading, nextState.loading)
    stateUpdate = !utils.shallowEqual(this.state, nextState)
    // Saving the scroll position. Neede in componentDidUpdate in order to avoid the the page scroll to be
    // set top
    const element = this.node
    if (element !== null) {
      this.scrollPosition = window.scrollY
    }
    return stateUpdate || propsUpdate
  }

  // getConf = () => {
  //   let request = new XMLHttpRequest()

  //   request.open('GET', 'http://api.ethfinex.com/trustless/v1/r/get/conf')

  //   request.setRequestHeader('Content-Type', 'application/json')

  //   request.onreadystatechange = function() {
  //     if (this.readyState === 4) {
  //       console.log('Status:', this.status)
  //       console.log('Headers:', this.getAllResponseHeaders())
  //       console.log('Body:', this.responseText)
  //     }
  //   }

  //   let body = {}

  //   request.send(JSON.stringify(body))
  // }

  componentDidMount = async () => {
    // console.log(this.getConf())

    const { api } = this.context
    const { selectedExchange } = this.props.exchange
    const { endpoint } = this.props

    const defaultRelay = RELAYS[DEFAULT_RELAY[api._rb.network.name]]
    // console.log(EXCHANGES)
    // console.log(api._rb.network.name)
    // console.log(defaultRelay)
    const defaultExchange = EXCHANGES[defaultRelay.name][api._rb.network.name]
    const defaultTokensPair = {
      baseToken:
        ERC20_TOKENS[api._rb.network.name][
          defaultRelay.defaultTokensPair.baseTokenSymbol
        ],
      quoteToken:
        ERC20_TOKENS[api._rb.network.name][
          defaultRelay.defaultTokensPair.quoteTokenSymbol
        ]
    }
    console.log('***** MOUNT *****')
    try {
      // const address = await getAvailableAccounts(selectedExchange)
      // this.props.dispatch({
      //   type: 'SET_MAKER_ADDRESS',
      //   payload: address[0]
      // })
      // const accounts = [
      //   {
      //     address: address[0]
      //   }
      // ]
      const walletAddress = endpoint.accounts.find(
        account => account.source === 'MetaMask'
      )
      this.props.dispatch({
        type: 'SET_MAKER_ADDRESS',
        payload: walletAddress.address
      })
      const accounts = [
        {
          address: walletAddress.address
        }
      ]
      console.log(walletAddress.address)

      // Set available relays
      this.props.dispatch(
        Actions.exchange.updateAvailableRelays(
          utils.availableRelays(RELAYS, api._rb.network.id)
        )
      )

      // Updating selected exchange
      this.props.dispatch(
        Actions.exchange.updateSelectedExchange(defaultExchange)
      )

      // Updating selected relay
      this.props.dispatch(Actions.exchange.updateSelectedRelay(defaultRelay))

      // Set available trade tokens pairs
      this.props.dispatch(
        Actions.exchange.updateAvailableTradeTokensPairs(
          utils.availableTradeTokensPair(
            TRADE_TOKENS_PAIRS,
            defaultRelay.name,
            api._rb.network.id
          )
        )
      )

      // Updating selected tokens pair
      this.props.dispatch(
        Actions.exchange.updateSelectedTradeTokensPair(defaultTokensPair)
      )

      // Updating selected tokens pair balances and fund liquidity (ETH, ZRX)
      this.props.dispatch(
        Actions.exchange.updateLiquidityAndTokenBalances(api, 'START')
      )

      // Get funds details (balance, transactions)
      let selectedFund = await this.getSelectedFundDetails(null, accounts)

      this.connectToExchange(
        selectedFund,
        defaultTokensPair,
        defaultRelay,
        selectedExchange
      )
    } catch (error) {
      console.warn(error)
    }
  }

  componentWillUnmount = () => {
    console.log('***** UNMOUNT *****')
    const { api } = this.context
    this.props.dispatch(Actions.exchange.fetchCandleDataSingleStop())
    this.props.dispatch(Actions.exchange.relayCloseWs())
    this.props.dispatch(
      Actions.exchange.updateLiquidityAndTokenBalances(api, 'STOP')
    )
    this.props.dispatch(Actions.exchange.getAccountOrdersStop())
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
    if (this.activeElement.id !== '') {
      const activeElement = document.getElementById(this.activeElement.id)
      if (activeElement !== null) {
        activeElement.focus()
      }
    }
  }

  connectToExchange = async (
    selectedFund,
    tokensPair,
    relay,
    selectedExchange
  ) => {
    const { api } = this.context
    this.props.dispatch({
      type: TYPE_.CHART_MARKET_DATA_INIT,
      payload: []
    })

    this.props.dispatch({
      type: TYPE_.ORDERBOOK_INIT,
      payload: {
        asks: [],
        bids: [],
        spread: '0'
      }
    })

    // Getting exchange contract events
    this.props.dispatch(
      Actions.exchange.monitorEventsStart(
        selectedFund,
        tokensPair,
        selectedExchange
      )
    )

    // Getting price ticker
    this.props.dispatch(
      Actions.exchange.relayOpenWsTicker(
        relay,
        api._rb.network.id,
        tokensPair.baseToken,
        tokensPair.quoteToken
      )
    )
    // Getting order book
    this.props.dispatch(
      Actions.exchange.relayOpenWsBook(
        relay,
        api._rb.network.id,
        tokensPair.baseToken,
        tokensPair.quoteToken
      )
    )
    // Getting chart data
    let tsYesterday = new Date(
      (Math.floor(Date.now() / 1000) - 86400 * 7) * 1000
    ).toISOString()
    this.props.dispatch(
      Actions.exchange.fetchCandleDataSingleStart(
        relay,
        api._rb.network.id,
        tokensPair.baseToken,
        tokensPair.quoteToken,
        tsYesterday
      )
    )
  }

  onToggleAggregateOrders = isInputChecked => {
    // console.log(isInputChecked)
    this.props.dispatch(Actions.exchange.setAggregateOrders(isInputChecked))

    let filter = {
      relay: this.props.exchange.selectedRelay,
      networkId: this.props.exchange.relay.networkId,
      baseToken: this.props.exchange.selectedTokensPair.baseToken,
      quoteToken: this.props.exchange.selectedTokensPair.quoteToken,
      aggregated: isInputChecked
    }
    this.props.dispatch(Actions.exchange.relayGetOrders(filter))
  }

  onSelectFund = async fund => {
    const { api } = this.context
    const {
      selectedTokensPair,
      selectedExchange,
      selectedRelay
    } = this.props.exchange

    // Resetting current order
    this.props.dispatch(Actions.exchange.cancelSelectedOrder())

    try {
      const poolApi = new PoolApi(api)
      poolApi.contract.drago.init(fund.address)

      // Getting drago details
      const dragoDetails = await poolApi.contract.drago.getAdminData()
      this.props.dispatch(
        Actions.exchange.updateSelectedFund(fund, dragoDetails[0].toLowerCase())
      )

      // Updating selected tokens pair balances and fund liquidity (ETH, ZRX)
      this.props.dispatch(
        Actions.exchange.updateLiquidityAndTokenBalances(api, '', fund.address)
      )
      let allowanceBaseToken,
        allowanceQuoteToken = 0

      if (!selectedRelay.isTokenWrapper) {
        // Getting allowances
        allowanceBaseToken = await getTokenAllowance(
          selectedTokensPair.baseToken,
          fund.address,
          selectedExchange
        )
        allowanceQuoteToken = await getTokenAllowance(
          selectedTokensPair.quoteToken,
          fund.address,
          selectedExchange
        )
      }

      let baseTokenLockWrapExpire,
        quoteTokenLockWrapExpire = '0'

      if (selectedRelay.isTokenWrapper) {
        // Getting token wrapper lock time
        baseTokenLockWrapExpire = await utils.updateTokenWrapperLockTime(
          api,
          selectedTokensPair.baseToken.wrappers[selectedRelay.name].address,
          fund.address
        )
        quoteTokenLockWrapExpire = await utils.updateTokenWrapperLockTime(
          api,
          selectedTokensPair.quoteToken.wrappers[selectedRelay.name].address,
          fund.address
        )
      }

      const payload = {
        baseTokenAllowance: new BigNumber(allowanceBaseToken).gt(0),
        quoteTokenAllowance: new BigNumber(allowanceQuoteToken).gt(0),
        baseTokenLockWrapExpire: baseTokenLockWrapExpire,
        quoteTokenLockWrapExpire: quoteTokenLockWrapExpire
      }

      this.props.dispatch(
        Actions.exchange.updateSelectedTradeTokensPair(payload)
      )
    } catch (error) {
      console.warn(error)
    }
  }

  onSelectTokenTrade = async pair => {
    const { api } = this.context
    const {
      selectedTokensPair,
      selectedExchange,
      selectedRelay,
      selectedFund
    } = this.props.exchange
    const selectedTokens = pair.split('-')
    const baseToken = ERC20_TOKENS[api._rb.network.name][selectedTokens[0]]
    const quoteToken = ERC20_TOKENS[api._rb.network.name][selectedTokens[1]]

    // Reset balances
    this.props.dispatch(
      Actions.exchange.updateLiquidityAndTokenBalances(
        api,
        'RESET',
        selectedFund.details.address
      )
    )
    // Updating selected tokens pair
    this.props.dispatch(
      Actions.exchange.updateSelectedTradeTokensPair({
        baseToken: baseToken,
        quoteToken: quoteToken,
        baseTokenAllowance: false,
        quoteTokenAllowance: false,
        ticker: {
          current: {
            price: '0'
          },
          previous: {
            price: '0'
          },
          variation: 0
        }
      })
    )
    try {
      const allowanceBaseToken = await getTokenAllowance(
        selectedTokensPair.baseToken,
        selectedFund.details.address,
        selectedExchange
      )
      const allowanceQuoteToken = await getTokenAllowance(
        selectedTokensPair.quoteToken,
        selectedFund.details.address,
        selectedExchange
      )
      const tradeTokensPair = {
        baseToken: baseToken,
        quoteToken: quoteToken,
        baseTokenAllowance: new BigNumber(allowanceBaseToken).gt(0),
        quoteTokenAllowance: new BigNumber(allowanceQuoteToken).gt(0),
        ticker: {
          current: {
            price: '0'
          },
          previous: {
            price: '0'
          },
          variation: 0
        }
      }

      // Resetting current order
      this.props.dispatch(Actions.exchange.cancelSelectedOrder())

      // Updating selected tokens pair
      this.props.dispatch(
        Actions.exchange.updateSelectedTradeTokensPair(tradeTokensPair)
      )

      // Terminating exchange contract events fetching

      this.props.dispatch(Actions.exchange.monitorEventsStop())

      // Terminating connection to the exchange
      this.props.dispatch(Actions.exchange.relayCloseWs())

      // Terminating chart candles fetching
      this.props.dispatch(Actions.exchange.fetchCandleDataSingleStop())

      // Reconnecting to the exchange
      // this.connectToExchange(selectedExchange, tradeTokensPair)
      this.connectToExchange(
        selectedFund.details,
        tradeTokensPair,
        selectedRelay,
        selectedExchange
      )
    } catch (error) {
      console.warn(error)
    }
  }

  // Getting last transactions
  getSelectedFundDetails = async (dragoAddress, accounts) => {
    console.log(dragoAddress, accounts)
    const { api } = this.context
    try {
      let poolApi = new PoolApi(api)
      await poolApi.contract.dragofactory.init()
      await poolApi.contract.dragoregistry.init()

      const getDragoList = async () => {
        let arrayPromises = accounts.map(async account => {
          return poolApi.contract.dragofactory
            .getDragosByAddress(account.address)
            .then(results => {
              return results
            })
            .catch(error => {
              console.warn(error)
              return error
            })
        })
        return Promise.all(arrayPromises)
      }

      const getDragoDetails = async dragoList => {
        let arrayPromises = dragoList.map(drago => {
          return poolApi.contract.dragoregistry
            .fromAddress(drago.value)
            .then(dragoDetails => {
              const dragoData = {
                symbol: dragoDetails[2].trim(),
                dragoId: dragoDetails[3].toFixed(),
                name: dragoDetails[1].trim(),
                address: drago.value
              }
              return dragoData
            })
            .catch(error => {
              console.warn(error)
              return error
            })
        })
        return Promise.all(arrayPromises)
      }

      let dragoList = await getDragoDetails(...(await getDragoList()))
      if (dragoList.lenght) {
        this.setState({
          managerHasNoFunds: true
        })
      } else {
        dragoList.sort(function(a, b) {
          let keyA = a.symbol,
            keyB = b.symbol
          if (keyA < keyB) return -1
          if (keyA > keyB) return 1
          return 0
        })
        this.props.dispatch(Actions.exchange.updateAvailableFunds(dragoList))
        this.onSelectFund(dragoList[0])
        return dragoList[0]
      }
    } catch (error) {
      console.warn(error)
    }
  }

  render() {
    const {
      user,
      handleToggleNotifications,
      notificationsOpen,
      endpoint,
      exchange
    } = this.props
    if (endpoint.loading) {
      return <Loading />
    }
    // console.log(this.props)

    if (endpoint.accounts.length === 0 || !endpoint.isMetaMaskNetworkCorrect) {
      return (
        <span>
          <ElementBottomStatusBar
            blockNumber={endpoint.prevBlockNumber}
            networkName={endpoint.networkInfo.name}
            networkError={endpoint.networkError}
            networkStatus={endpoint.networkStatus}
          />
        </span>
      )
    }

    if (this.state.managerHasNoFunds) {
      return (
        <div ref={node => (this.node = node)}>
          <Row className={styles.maincontainer}>
            <Col xs={12}>
              <Paper className={styles.paperTopBarContainer} zDepth={1}>
                <div style={{ paddingTop: '16px', paddingBottom: '16px' }}>
                  You need to own a fund in order to trade on this exchange.
                </div>
              </Paper>
            </Col>
          </Row>
        </div>
      )
    }

    if (user.isManager) {
      const { bids, asks, spread } = this.props.exchange.orderBook
      // console.log(asks)
      // console.log(bids)
      const asksOrderNormalized = asks.slice(-20)
      const bidsOrderNormalized = bids.slice(0, 20)
      // console.log(this.props.exchange.selectedExchange)
      // const bidsOrderNormalizedFilled = [ ...Array(20 - bidsOrderNormalized.length).fill(null), ...bidsOrderNormalized ]
      // const asksOrderNormalizedFilled = [ ...Array(20 - asksOrderNormalized.length).fill(null), ...asksOrderNormalized]
      const { chartData, fundOrders } = this.props.exchange
      const currentPrice = new BigNumber(
        this.props.exchange.selectedTokensPair.ticker.current.price
      )
      const priceVariation = new BigNumber(
        this.props.exchange.selectedTokensPair.ticker.variation
      ).toFixed(4)
      // console.log(this.props.exchange)
      // console.log(RELAYS)
      return (
        <div ref={node => (this.node = node)}>
          <Row className={styles.maincontainer}>
            <Col xs={12}>
              <Paper className={styles.paperTopBarContainer} zDepth={1}>
                <Row>
                  <Col xs={12} sm={4}>
                    <FundSelector
                      funds={this.props.exchange.availableFunds}
                      onSelectFund={this.onSelectFund}
                      selectedFund={this.props.exchange.selectedFund}
                    />
                  </Col>
                  {/* <Col xs={2}>
                    <TokenLiquidity
                      liquidity={exchange.selectedFund.liquidity}
                      loading={exchange.loading.liquidity}
                    />
                  </Col> */}
                  <Col xs={12} sm={4}>
                    <TokenTradeSelector
                      tradableTokens={exchange.availableTradeTokensPairs}
                      selectedTradeTokensPair={exchange.selectedTokensPair}
                      onSelectTokenTrade={this.onSelectTokenTrade}
                    />
                  </Col>
                  <Col xs={12} sm={4} className={styles.tokenPriceContainer}>
                    <TokenPrice
                      selectedTradeTokensPair={exchange.selectedTokensPair}
                      tokenPrice={currentPrice.toFixed(4)}
                      priceVariation={priceVariation}
                    />
                  </Col>
                </Row>
                <Row>
                  <Col xs={12}>
                    <TokenBalances
                      liquidity={exchange.selectedFund.liquidity}
                      selectedTradeTokensPair={exchange.selectedTokensPair}
                      // loading={exchange.loading.liquidity}
                    />
                  </Col>
                </Row>
              </Paper>
            </Col>
            {/* <Col xs={12}>
              <ChartBox data={this.state.chartData} />
            </Col> */}
            <Col xs={12}>
              <Row>
                <Col xs={12} md={12} lg={3}>
                  <Row>
                    <Col xs={12}>
                      <div className={styles.boxContainer}>
                        <ExchangeBox />
                      </div>
                    </Col>
                    <Col xs={12}>
                      <div className={styles.boxContainer}>
                        <OrderBox />
                      </div>
                    </Col>
                  </Row>
                </Col>
                <Col xs={12} md={12} lg={7}>
                  <Row>
                    <Col xs={12}>
                      <div className={styles.boxContainer}>
                        <ChartBox
                          data={chartData}
                          // loading={exchange.loading.marketBox}
                          loading={false}
                        />
                      </div>
                    </Col>
                    <Col xs={12}>
                      <div className={styles.boxContainer}>
                        <OrdersHistoryBox fundOrders={fundOrders} />
                      </div>
                    </Col>
                  </Row>
                </Col>
                <Col xs={12} md={12} lg={2}>
                  <div className={styles.boxContainer}>
                    <OrderBook
                      bidsOrders={bidsOrderNormalized}
                      asksOrders={asksOrderNormalized}
                      spread={spread}
                      aggregated={this.props.exchange.orderBookAggregated}
                      onToggleAggregateOrders={this.onToggleAggregateOrders}
                      onlyAggregated={
                        this.props.exchange.selectedRelay.onlyAggregateOrderbook
                      }
                    />
                  </div>
                </Col>
              </Row>
            </Col>
          </Row>
        </div>
      )
    }

    if (!user.isManager) {
      return (
        <div ref={node => (this.node = node)}>
          <Row className={styles.maincontainer}>
            <Col xs={12}>Only wizards can access this section.</Col>
          </Row>
        </div>
      )
    }
  }
}

export default connect(mapStateToProps)(ApplicationExchangeHome)
