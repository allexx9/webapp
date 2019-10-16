// Copyright 2016-2017 Rigo Investment Sagl.

import { Actions } from '../_redux/actions'
import { Col, Row } from 'react-flexbox-grid'
import {
  DEFAULT_RELAY,
  ERC20_TOKENS,
  EXCHANGES,
  RELAYS,
  TRADE_TOKENS_PAIRS
} from '../_utils/const'
import { connect } from 'react-redux'
import { getTokenAllowance } from '../_utils/exchange'
import BigNumber from 'bignumber.js'
import ChartBox from '../_atomic/organisms/chartBox'
import ElementBottomStatusBar from '../Elements/elementBottomStatusBar'
import ExchangeBox from '../_atomic/organisms/exchangeBox'
import FundSelector from '../_atomic/molecules/fundSelector'
import Loading from '../_atomic/atoms/loading'
import OrderBook from '../_atomic/organisms/orderBook'
import OrderBox from '../_atomic/organisms/orderBox'
import OrdersHistoryBox from '../_atomic/organisms/ordersHistoryBox'
import Paper from 'material-ui/Paper'
import PoolApi from '../PoolsApi/src'
import PropTypes from 'prop-types'
import React, { PureComponent } from 'react'
import TokenBalances from '../_atomic/atoms/tokenBalances'
import TokenPrice from '../_atomic/atoms/tokenPrice'
import TokenTradeSelector from '../_atomic/molecules/tokenTradeSelector'
import Web3Wrapper from '../_utils/web3Wrapper/src'
import styles from './applicationExchangeHome.module.css'
import u from 'updeep'
import utils from '../_utils/utils'

// import { getData } from "../_utils/data"

function mapStateToProps(state) {
  return {
    endpoint: state.endpoint,
    user: state.user,
    exchange: state.exchange
  }
}

class ApplicationExchangeHome extends PureComponent {
  static contextTypes = {
    api: PropTypes.object.isRequired
  }

  static propTypes = {
    location: PropTypes.object.isRequired,
    endpoint: PropTypes.object.isRequired,
    user: PropTypes.object.isRequired,
    dispatch: PropTypes.func.isRequired,
    exchange: PropTypes.object.isRequired
  }

  state = {
    managerHasNoFunds: false
  }

  updateUi = (ui, boxName) => {
    return {
      enableBox: () => {
        const uiUpdate = {
          panels: {
            [boxName]: {
              disabled: false,
              disabledMsg: ''
            }
          }
        }
        const newUi = u(uiUpdate, ui)
        return newUi
      },
      disableBox: (options = { disabledMsg: '' }) => {
        const uiUpdate = {
          panels: {
            [boxName]: {
              disabled: true,
              disabledMsg: options.disabledMsg
            }
          }
        }
        const newUi = u(uiUpdate, ui)
        return newUi
      }
    }
  }

  componentDidMount = async () => {
    const { ui } = this.props.exchange
    const { endpoint } = this.props
    const defaultRelay = RELAYS[DEFAULT_RELAY[endpoint.networkInfo.name]]
    const defaultExchange =
      EXCHANGES[defaultRelay.name][endpoint.networkInfo.name]
    const defaultTokensPair = {
      baseToken:
        ERC20_TOKENS[endpoint.networkInfo.name][
          defaultRelay.defaultTokensPair.baseTokenSymbol
        ],
      quoteToken:
        ERC20_TOKENS[endpoint.networkInfo.name][
          defaultRelay.defaultTokensPair.quoteTokenSymbol
        ]
    }
    console.log('***** MOUNT *****')
    try {
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
      // Set available relays
      this.props.dispatch(
        Actions.exchange.updateAvailableRelays(
          utils.availableRelays(RELAYS, endpoint.networkInfo.id)
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
            endpoint.networkInfo.id
          )
        )
      )

      // Updating selected tokens pair
      this.props.dispatch(
        Actions.exchange.updateSelectedTradeTokensPair(defaultTokensPair)
      )

      // Updating selected tokens pair balances and fund liquidity (ETH, ZRX)
      this.props.dispatch(
        Actions.exchange.updateLiquidityAndTokenBalances('START')
      )

      // Starting chart, ticker feed, order book
      this.connectToExchange(defaultTokensPair, defaultRelay)

      // Get funds details (balance, transactions)
      let selectedFund = await this.getSelectedFundDetails(null, accounts)
      if (selectedFund) {
        this.props.dispatch(
          Actions.exchange.updateUiPanelProperties(
            this.updateUi(ui, 'relayBox').enableBox()
          )
        )
      } else {
        this.props.dispatch(
          Actions.exchange.updateUiPanelProperties(
            this.updateUi(ui, 'relayBox').disableBox({
              disabledMsg: 'Please create a Drago.'
            })
          )
        )
        this.props.dispatch(
          Actions.exchange.updateUiPanelProperties(
            this.updateUi(ui, 'orderBox').disableBox({
              disabledMsg: 'Please create a Drago.'
            })
          )
        )
      }
    } catch (error) {
      console.warn(error)
    }
  }

  componentWillUnmount = () => {
    console.log('***** UNMOUNT *****')
    const { selectedExchange } = this.props.exchange
    // Stopping exchange contract events
    this.props.dispatch(Actions.exchange.monitorEventsStop(selectedExchange))
    this.props.dispatch(Actions.exchange.fetchCandleDataSingleStop())
    this.props.dispatch(Actions.exchange.relayCloseWs())
    this.props.dispatch(
      Actions.exchange.updateLiquidityAndTokenBalances('STOP')
    )
    this.props.dispatch(Actions.exchange.getAccountOrdersStop())
    this.props.dispatch(Actions.exchange.resetTokenPrice())
  }

  componentDidUpdate() {}

  connectToExchange = async (tokensPair, relay) => {
    this.props.dispatch(Actions.exchange.connectRelay(relay, tokensPair))
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
    const { selectedTokensPair, selectedExchange } = this.props.exchange
    const { networkInfo, accounts } = this.props.endpoint

    const walletAddress = accounts.find(
      account => account.source === 'MetaMask'
    )

    const fundDetails = {
      details: fund,
      managerAccount: walletAddress.address.toLowerCase()
    }

    console.log(fundDetails)

    this.props.dispatch(Actions.exchange.updateSelectedFund(fundDetails))

    // Reser exchange contract events
    this.props.dispatch(Actions.exchange.resetTradesHistory())

    // Stopping exchange contract events
    this.props.dispatch(Actions.exchange.monitorEventsStop(selectedExchange))

    // Starting exchange contract events
    this.props.dispatch(
      Actions.exchange.monitorEventsStart(
        fund,
        selectedTokensPair,
        selectedExchange,
        networkInfo
      )
    )

    // Resetting current order
    this.props.dispatch(Actions.exchange.cancelSelectedOrder())

    try {
      let web3 = await Web3Wrapper.getInstance(networkInfo.id)
      const poolApi = new PoolApi(web3)
      poolApi.contract.drago.init(fund.address)

      // Getting drago details
      // const dragoDetails = await poolApi.contract.drago.getAdminData()
      // const fundDetails = {
      //   details: fund,
      //   managerAccount: dragoDetails[0].toLowerCase()
      // }

      // this.props.dispatch(Actions.exchange.updateSelectedFund(fundDetails))

      // Updating selected tokens pair balances and fund liquidity (ETH, ZRX)
      this.props.dispatch(
        Actions.exchange.updateLiquidityAndTokenBalances('', fund.address)
      )
      // let allowanceBaseToken,
      //   allowanceQuoteToken = 0

      // if (!selectedRelay.isTokenWrapper) {
      //   // Getting allowances
      //   allowanceBaseToken = await getTokenAllowance(
      //     selectedTokensPair.baseToken,
      //     fund.address,
      //     selectedExchange
      //   )
      //   allowanceQuoteToken = await getTokenAllowance(
      //     selectedTokensPair.quoteToken,
      //     fund.address,
      //     selectedExchange
      //   )
      // }

      // let baseTokenLockWrapExpire,
      //   quoteTokenLockWrapExpire = '0'

      // if (selectedRelay.isTokenWrapper) {
      //   // Getting token wrapper lock time
      //   baseTokenLockWrapExpire = await utils.getTokenWrapperLockTime(
      //     api,
      //     selectedTokensPair.baseToken.wrappers[selectedRelay.name].address,
      //     fund.address
      //   )
      //   quoteTokenLockWrapExpire = await utils.getTokenWrapperLockTime(
      //     api,
      //     selectedTokensPair.quoteToken.wrappers[selectedRelay.name].address,
      //     fund.address
      //   )
      // }

      // const payload = {
      //   baseTokenAllowance: new BigNumber(allowanceBaseToken).gt(0),
      //   quoteTokenAllowance: new BigNumber(allowanceQuoteToken).gt(0),
      //   baseTokenLockWrapExpire: baseTokenLockWrapExpire,
      //   quoteTokenLockWrapExpire: quoteTokenLockWrapExpire
      // }

      // this.props.dispatch(
      //   Actions.exchange.updateSelectedTradeTokensPair(payload)
      // )
    } catch (error) {
      console.warn(error)
    }
  }

  onSelectTokenTrade = async pair => {
    const {
      selectedExchange,
      selectedRelay,
      selectedFund
    } = this.props.exchange
    const { endpoint } = this.props
    const selectedTokens = pair.split('-')
    const baseToken = ERC20_TOKENS[endpoint.networkInfo.name][selectedTokens[0]]
    const quoteToken =
      ERC20_TOKENS[endpoint.networkInfo.name][selectedTokens[1]]

    let baseTokenAllowance = false
    let quoteTokenAllowance = false

    const liquidity = {
      loading: false,
      liquidity: {
        ETH: new BigNumber(0),
        baseToken: {
          balance: new BigNumber(0),
          balanceWrapper: new BigNumber(0)
        },
        quoteToken: {
          balance: new BigNumber(0),
          balanceWrapper: new BigNumber(0)
        }
      }
    }

    this.props.dispatch(Actions.exchange.updateSelectedFund(liquidity))

    // Reset balances
    // this.props.dispatch(
    //   Actions.exchange.updateLiquidityAndTokenBalances(api, 'RESET')
    // )
    this.props.dispatch(
      Actions.exchange.updateLiquidityAndTokenBalances('STOP')
    )
    this.props.dispatch(
      Actions.exchange.updateLiquidityAndTokenBalances('START')
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
      if (!selectedRelay.isTokenWrapper) {
        const allowanceBaseToken = await getTokenAllowance(
          baseToken,
          selectedFund.details.address,
          selectedExchange
        )
        const allowanceQuoteToken = await getTokenAllowance(
          quoteToken,
          selectedFund.details.address,
          selectedExchange
        )
        baseTokenAllowance = new BigNumber(allowanceBaseToken).gt(0)
        quoteTokenAllowance = new BigNumber(allowanceQuoteToken).gt(0)
      }

      const tradeTokensPair = {
        baseToken: baseToken,
        quoteToken: quoteToken,
        baseTokenAllowance,
        quoteTokenAllowance,
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
      this.connectToExchange(tradeTokensPair, selectedRelay)
    } catch (error) {
      console.warn(error)
    }
  }

  // Getting last transactions
  getSelectedFundDetails = async (dragoAddress, accounts) => {
    const { api } = this.context
    try {
      let poolApi = new PoolApi(api)
      // await poolApi.contract.dragofactory.init()
      // await poolApi.contract.dragoregistry.init()

      await Promise.all([
        poolApi.contract.dragofactory.init(),
        poolApi.contract.dragoregistry.init()
      ])

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
            .fromAddress(drago)
            .then(dragoDetails => {
              const dragoData = {
                symbol: dragoDetails[2].trim(),
                dragoId: new BigNumber(dragoDetails[3]).toFixed(),
                name: dragoDetails[1].trim(),
                address: drago
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
      if (dragoList.length === 0) {
        // this.setState({
        //   managerHasNoFunds: true
        // })
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
    const { endpoint, exchange } = this.props
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

    let show = true

    if (show) {
      const { bids, asks, spread } = this.props.exchange.orderBook
      const asksOrderNormalized = asks.slice(-20)
      const bidsOrderNormalized = bids.slice(0, 20)
      const { chartData } = this.props.exchange
      const currentPrice = new BigNumber(
        this.props.exchange.selectedTokensPair.ticker.current.price
      )
      const priceVariation = new BigNumber(
        this.props.exchange.selectedTokensPair.ticker.variation
      ).toFixed(4)
      return (
        <div ref={node => (this.node = node)}>
          <Row className={styles.maincontainer}>
            <Col xs={12}>
              <Paper className={styles.paperTopBarContainer} zDepth={1}>
                <Row>
                  <Col xs={12} sm={4}>
                    <FundSelector
                      funds={exchange.availableFunds}
                      onSelectFund={this.onSelectFund}
                      selectedFund={exchange.selectedFund}
                      networkInfo={endpoint.networkInfo}
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
                      tokenPrice={currentPrice}
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
                        <OrdersHistoryBox />
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

    // if (!user.isManager) {
    //   return (
    //     <div ref={node => (this.node = node)}>
    //       <Row className={styles.maincontainer}>
    //         <Col xs={12}>Only wizards can access this section.</Col>
    //       </Row>
    //     </div>
    //   )
    // }
  }
}

export default connect(mapStateToProps)(ApplicationExchangeHome)
