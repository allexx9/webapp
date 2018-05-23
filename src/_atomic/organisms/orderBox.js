import PropTypes from 'prop-types';
import React, { Component } from 'react';
import { Row, Col } from 'react-flexbox-grid';
import * as Colors from 'material-ui/styles/colors'
import styles from './orderBox.module.css'
import AppBar from 'material-ui/AppBar'
import Paper from 'material-ui/Paper'
import ButtonBuy from '../atoms/buttonBuy'
import ButtonSell from '../atoms/buttonSell'
import OrderAmount from '../atoms/orderAmount'
import OrderPrice from '../atoms/orderPrice'
import ButtonOrderSubmit from '../atoms/buttonOrderSubmit'
import ButtonOrderCancel from '../atoms/buttonOrderCancel'
import OrderSummary from '../molecules/orderSummary'
import OrderRawDialog from '../molecules/orderRawDialog'
import OrderTypeSelector from '../atoms/orderTypeSelector'
import ToggleSwitch from '../atoms/toggleSwitch'
import { connect } from 'react-redux';
import {
  UPDATE_SELECTED_ORDER,
  CANCEL_SELECTED_ORDER,
  UPDATE_TRADE_TOKENS_PAIR,
  UNLIMITED_ALLOWANCE_IN_BASE_UNITS,
  ADD_TRANSACTION
} from '../../_utils/const'
import {
  signOrder,
  sendOrderToRelay,
  newMakerOrder,
  fillOrderToExchange,
  fillOrderToExchangeViaProxy,
  setAllowaceOnExchangeThroughDrago
} from '../../_utils/exchange'
import PoolApi from '../../PoolsApi/src'
import utils from '../../_utils/utils.js'
import serializeError from 'serialize-error';
import { sha3_512 } from 'js-sha3';


function mapStateToProps(state) {
  return state
}

const paperStyle = {
  padding: "10px"
}

class OrderBox extends Component {

  static propTypes = {
    exchange: PropTypes.object.isRequired,
    dispatch: PropTypes.func.isRequired,
    notifications: PropTypes.object.isRequired,
  };

  state = {
    orderRawDialogOpen: false
  }

  static defaultProps = {
  };

  static contextTypes = {
    exchangeUtils: PropTypes.object.isRequired,
    api: PropTypes.object.isRequired,
  };

  updateSelectedTradeTokensPair = (token, allowance) => {
    switch (token) {
      case 'base':
        return {
          type: UPDATE_TRADE_TOKENS_PAIR,
          payload: {
            baseTokenAllowance: allowance
          }
        }
      case 'quote':
        return {
          type: UPDATE_TRADE_TOKENS_PAIR,
          payload: {
            quoteTokenAllowance: allowance
          }
        }
    }
  }

  addTransactionToQueueAction = (transactionId, transactionDetails) => {
    return {
      type: ADD_TRANSACTION,
      transaction: { transactionId, transactionDetails }
    }
  };

  onCloseOrderRawDialog = (open) => {
    this.setState({
      orderRawDialogOpen: open
    })
  }

  updateSelectedOrder = (payload) => {
    return {
      type: UPDATE_SELECTED_ORDER,
      payload: payload
    }
  };

  cancelSelectedOrder = () => {
    return {
      type: CANCEL_SELECTED_ORDER,
    }
  };

  onChangeAmount = (amount, error) => {
    const payload = {
      orderAmountError: error,
      orderFillAmount: amount,
    }
    this.props.dispatch(this.updateSelectedOrder(payload))
  }

  onChangePrice = (amount, error) => {
    const payload = {
      orderPriceError: error,
      orderPrice: amount,
    }
    this.props.dispatch(this.updateSelectedOrder(payload))
  }

  onSubmitOrder = async () => {
    const { selectedOrder, selectedExchange, selectedFund } = this.props.exchange

    const transactionId = sha3_512(new Date() + selectedFund.managerAccount)
    var transactionDetails = {
      status: 'pending',
      hash: '',
      parityId: null,
      timestamp: new Date(),
      account: selectedFund.details.address,
      error: false,
      action: selectedOrder.orderType === 'asks' ? 'BuyToken' : 'SellToken',
      symbol: selectedOrder.selectedTokensPair.baseToken.symbol.toUpperCase(),
      amount: selectedOrder.orderFillAmount
    }
    this.props.dispatch(this.addTransactionToQueueAction(transactionId, transactionDetails))

    if (selectedOrder.takerOrder) {
      // fillOrderToExchange(selectedOrder.details.order, selectedOrder.orderFillAmount, selectedExchange)
      try {
        const receipt = await fillOrderToExchangeViaProxy(selectedFund, selectedOrder.details.order, selectedOrder.orderFillAmount, selectedExchange)
        console.log(receipt)
        transactionDetails.status = 'executed'
        transactionDetails.receipt = receipt
        transactionDetails.hash = receipt.transactionHash
        transactionDetails.timestamp = new Date ()
        this.props.dispatch(this.addTransactionToQueueAction(transactionId, transactionDetails))

      }
      catch (error) {
        console.log(serializeError(error))
        const errorArray = serializeError(error).message.split(/\r?\n/)
        transactionDetails.status = 'error'
        transactionDetails.error = errorArray[0]
        this.props.dispatch(this.addTransactionToQueueAction(transactionId, transactionDetails))
        utils.notificationError(this.props.notifications.engine, serializeError(error).message)
      }
    }
    else {
      console.log(selectedOrder)
      const transactionId = sha3_512(new Date() + selectedFund.managerAccount)
      var transactionDetails = {
        status: 'pending',
        hash: '',
        parityId: null,
        timestamp: new Date(),
        account: selectedFund.details.address,
        error: false,
        action: selectedOrder.orderType === 'asks' ? 'BuyToken' : 'SellToken',
        symbol: selectedOrder.selectedTokensPair.baseToken.symbol.toUpperCase(),
        amount: selectedOrder.orderFillAmount
      }
      var signedOrder = await signOrder(selectedOrder, selectedExchange)
      console.log(signedOrder)
      const payload = {
        details: { order: signedOrder },
      }
      this.props.dispatch(this.updateSelectedOrder(payload))
      this.setState({
        orderRawDialogOpen: true
      })
      sendOrderToRelay(signedOrder)
        .then((parsedBody) => {
          transactionDetails.status = 'executed'
          transactionDetails.timestamp = new Date ()
          this.props.dispatch(this.addTransactionToQueueAction(transactionId, transactionDetails))
          console.log(parsedBody)
        })
        .catch ((error) => {
          const errorArray = serializeError(error).message.split(/\r?\n/)
          transactionDetails.status = 'error'
          transactionDetails.error = errorArray[0]
          this.props.dispatch(this.addTransactionToQueueAction(transactionId, transactionDetails))
          console.log(error)
          utils.notificationError(this.props.notifications.engine, serializeError(error).message)
        });
    }
  }

  onCancelOrder = () => {
    this.props.dispatch(this.cancelSelectedOrder())
    
    // this.props.dispatch(this.addNotification('test'))
  }

  onSelectOrderType = () => {

  }

  onToggleAllowQuoteTokenTrade = async (event, isInputChecked) => {
    const { selectedFund, selectedTokensPair, selectedExchange } = this.props.exchange
    var amount
    isInputChecked ? amount = UNLIMITED_ALLOWANCE_IN_BASE_UNITS : amount = '0'
    try {
      const result = await setAllowaceOnExchangeThroughDrago(selectedFund, selectedTokensPair.quoteToken, selectedExchange, amount)
      console.log(result)
      this.props.dispatch(this.updateSelectedTradeTokensPair('quote', isInputChecked))
    } catch (error) {
      console.log(error)
      utils.notificationError(this.props.notifications.engine, serializeError(error).message)
    }
  }

  onToggleAllowanceBaseTokenTrade = async ( event, isInputChecked ) => {
    // const { selectedFund, selectedTokensPair } = this.props.exchange
    // try {
    //   // var provider = account.source === 'MetaMask' ? window.web3 : api
    //   var poolApi = null;
    //   poolApi = new PoolApi(window.web3)
    //   poolApi.contract.drago.init(selectedFund.details.address)
    //   const result = await poolApi.contract.drago.setInfiniteAllowace(
    //     selectedFund.managerAccount,
    //     this.props.exchange.selectedExchange.tokenTransferProxyAddress,
    //     selectedTokensPair.baseToken.address,
    //   )
    //   console.log(result)
    //   this.props.dispatch(this.updateSelectedTradeTokensPair('base', true))
    // } catch (error) {
    //   console.log(error)
    // }

    const { selectedFund, selectedTokensPair, selectedExchange } = this.props.exchange
    var amount
    isInputChecked ? amount = UNLIMITED_ALLOWANCE_IN_BASE_UNITS : amount = '0'
    try {
      const result = await setAllowaceOnExchangeThroughDrago(selectedFund, selectedTokensPair.baseToken, selectedExchange, amount)
      console.log(result)
      this.props.dispatch(this.updateSelectedTradeTokensPair('base', isInputChecked))
    } catch (error) {
      console.log(error)
    }
  }

  onBuySell = async (orderType) => {
    const { selectedTokensPair, selectedExchange, selectedFund } = this.props.exchange
    const order = await newMakerOrder(orderType, selectedTokensPair.baseToken.address, selectedTokensPair.quoteToken.address, selectedExchange, selectedFund)
    const payload = {
      details: {
        order: order,
        orderAmount: 0,
        orderPrice: 0,
        orderType: orderType
      },
      orderAmountError: true,
      orderPriceError: true,
      orderFillAmount: '0',
      orderMaxAmount: '0',
      orderPrice: '0',
      orderType: orderType,
      takerOrder: false,
      selectedTokensPair: selectedTokensPair,
    }
    this.props.dispatch(this.updateSelectedOrder(payload))
  }


  render() {
    const { selectedOrder, selectedTokensPair } = this.props.exchange
    var buySelected = (selectedOrder.orderType === 'bids')
    var sellSelected = (selectedOrder.orderType === 'asks')
    if (selectedOrder.takerOrder) {
      buySelected = (selectedOrder.orderType === 'asks')
      sellSelected = (selectedOrder.orderType === 'bids')
    }

    return (
      <Row>
        <Col xs={12}>
          <Row className={styles.sectionTitle}>
            <Col xs={12}>
              <AppBar
                title='ORDER BOX'
                showMenuIconButton={false}
                className={styles.appBar}
                titleStyle={{ fontSize: 14 }}
              />
              <Paper style={paperStyle} zDepth={1} >
                <Row className={styles.orderBookContainer}>
                  <Col xs={12}>
                    <Row className={styles.sectionHeaderOrderTable}>
                      <Col xs={6} className={styles.buyButton}>
                        <ButtonBuy
                          selected={buySelected}
                          onBuySell={this.onBuySell}
                        />
                      </Col>
                      <Col xs={6} className={styles.sellButton}>
                        <ButtonSell
                          selected={sellSelected}
                          onBuySell={this.onBuySell}
                        />
                      </Col>
                    </Row>
                  </Col>


                  <Col xs={12} className={styles.tokenNameSymbol}>
                    <div className={styles.tokenSymbol}>{selectedTokensPair.baseToken.symbol}</div>
                    <div className={styles.tokenName}>{selectedTokensPair.baseToken.name}</div>
                    <div>
                      <ToggleSwitch
                        label={"ACTIVATE " + selectedTokensPair.baseToken.symbol}
                        onToggle={this.onToggleAllowanceBaseTokenTrade}
                        toggled={selectedTokensPair.baseTokenAllowance}
                        toolTip={"Activate " + selectedTokensPair.baseToken.symbol + " trading"}
                      />
                      <ToggleSwitch
                        label={"ACTIVATE " + selectedTokensPair.quoteToken.symbol}
                        onToggle={this.onToggleAllowQuoteTokenTrade}
                        toggled={selectedTokensPair.quoteTokenAllowance}
                        toolTip={"Activate " + selectedTokensPair.quoteToken.symbol + " trading"}
                      />
                    </div>
                  </Col>

                  {/* <Col xs={12}>
                    <OrderTypeSelector
                      orderTypes={['Market', 'Limit']}
                      onSelectOrderType={this.onSelectOrderType}
                    />

                  </Col> */}

                  <Col xs={12}>
                    <OrderAmount
                      orderMaxAmount={Number(selectedOrder.orderMaxAmount)}
                      orderFillAmount={selectedOrder.orderFillAmount}
                      symbol={selectedOrder.selectedTokensPair.baseToken.symbol}
                      onChangeAmount={this.onChangeAmount}
                      disabled={Object.keys(selectedOrder.details).length === 0}
                      checkMaxAmount={selectedOrder.takerOrder}
                    />

                  </Col>
                  <Col xs={12}>
                    <OrderPrice
                      orderPrice={selectedOrder.orderPrice}
                      onChangePrice={this.onChangePrice}
                      disabled={selectedOrder.takerOrder || Object.keys(selectedOrder.details).length === 0}
                    />
                  </Col>
                  <Col xs={12}>
                    <Row center="xs">
                      <Col xs={6}>
                        <ButtonOrderCancel
                          onCancelOrder={this.onCancelOrder}
                          disabled={Object.keys(selectedOrder.details).length === 0}
                        />
                      </Col>
                      <Col xs={6}>
                        <ButtonOrderSubmit
                          onSubmitOrder={this.onSubmitOrder}
                          disabled={selectedOrder.orderAmountError || selectedOrder.orderPriceError}
                        />
                      </Col>
                    </Row>
                  </Col>
                  <Col xs={12}>
                    {
                      (Object.keys(selectedOrder.details).length !== 0)
                        ? <OrderSummary order={selectedOrder} />
                        : null
                    }
                  </Col>
                </Row>
              </Paper>
            </Col>
          </Row>
        </Col>
        <OrderRawDialog order={selectedOrder.details.order} onClose={this.onCloseOrderRawDialog} open={this.state.orderRawDialogOpen} />
      </Row>
    )
  }
}

export default connect(mapStateToProps)(OrderBox)