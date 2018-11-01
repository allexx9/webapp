import { Col, Row } from 'react-flexbox-grid'
import PropTypes from 'prop-types'
import React, { Component } from 'react'
// import * as Colors from 'material-ui/styles/colors'
import BoxTitle from '../atoms/boxTitle'
import ButtonOrderBuy from '../atoms/buttonOrderBuy'
import ButtonOrderConfirm from '../atoms/buttonOrderConfirm'
import ButtonOrderReset from '../atoms/buttonOrderReset'
import ButtonOrderSell from '../atoms/buttonOrderSell'
import OrderAmountInputField from '../atoms/orderAmountInputField'
import OrderPrice from '../atoms/orderPrice'
import OrderRawDialog from '../molecules/orderRawDialog'
import OrderSummary from '../molecules/orderSummary'
import Paper from 'material-ui/Paper'
import styles from './orderBox.module.css'
// import OrderTypeSelector from '../atoms/orderTypeSelector'
import { Actions } from '../../_redux/actions'
import {
  CANCEL_SELECTED_ORDER,
  UPDATE_SELECTED_ORDER
} from '../../_redux/actions/const'
import { connect } from 'react-redux'
import {
  fillOrderToExchangeViaProxy,
  newMakerOrder,
  signOrder,
  submitOrderToRelayEFX
} from '../../_utils/exchange'
import { sha3_512 } from 'js-sha3'
// import ToggleSwitch from '../atoms/toggleSwitch'
import serializeError from 'serialize-error'
import utils from '../../_utils/utils'

function mapStateToProps(state) {
  return state
}

const paperStyle = {
  padding: '10px'
}

class OrderBox extends Component {
  static propTypes = {
    exchange: PropTypes.object.isRequired,
    dispatch: PropTypes.func.isRequired,
    notifications: PropTypes.object.isRequired
  }

  state = {
    orderRawDialogOpen: false,
    efxOrder: {}
  }

  static contextTypes = {
    api: PropTypes.object.isRequired
  }

  // updateSelectedFundLiquidity = (fundAddress, api) => {
  //   return {
  //     type: UPDATE_FUND_LIQUIDITY,
  //     payload: {
  //       fundAddress,
  //       api
  //     }
  //   }
  // }

  onCloseOrderRawDialog = open => {
    this.setState({
      orderRawDialogOpen: open
    })
  }

  updateSelectedOrder = payload => {
    return {
      type: UPDATE_SELECTED_ORDER,
      payload: payload
    }
  }

  cancelSelectedOrder = () => {
    return {
      type: CANCEL_SELECTED_ORDER
    }
  }

  onChangeAmount = (amount, error) => {
    const payload = {
      orderAmountError: error,
      orderFillAmount: amount
    }
    console.log(amount)
    this.props.dispatch(this.updateSelectedOrder(payload))
  }

  onChangePrice = (amount, error) => {
    const payload = {
      orderPriceError: error,
      orderPrice: amount
    }
    console.log(amount)
    this.props.dispatch(this.updateSelectedOrder(payload))
  }

  // onSendOrder = async () => {
  //   const { selectedOrder } = this.props.exchange
  //   submitOrderToRelay(selectedOrder.details.order.signedOrder)
  //     .then(parsedBody => {
  //       // transactionDetails.status = 'executed'
  //       // transactionDetails.timestamp = new Date()
  //       // this.props.dispatch(
  //       //   Actions.transactions.addTransactionToQueueAction(
  //       //     transactionId,
  //       //     transactionDetails
  //       //   )
  //       // )
  //       console.log(parsedBody)
  //     })
  //     .catch(error => {
  //       // const errorArray = serializeError(error).message.split(/\r?\n/)
  //       // transactionDetails.status = 'error'
  //       // transactionDetails.error = errorArray[0]
  //       // this.props.dispatch(
  //       //   Actions.transactions.addTransactionToQueueAction(
  //       //     transactionId,
  //       //     transactionDetails
  //       //   )
  //       // )
  //       console.log(error)
  //       utils.notificationError(
  //         this.props.notifications.engine,
  //         serializeError(error).message
  //       )
  //     })
  // }

  onConfirmOrder = async () => {
    const {
      selectedOrder,
      selectedExchange,
      walletAddress
    } = this.props.exchange
    if (!selectedOrder.takerOrder) {
    }
    let signedOrder = await signOrder(
      selectedOrder,
      selectedExchange,
      walletAddress
    )
    console.log('Selected order', selectedOrder)
    console.log('Signed order', signedOrder)
    console.log(signedOrder)
    let { expirationUnixTimestampSec } = signedOrder
    console.log(expirationUnixTimestampSec)
    // expirationUnixTimestampSec = expirationUnixTimestampSec.toNumber()
    console.log(expirationUnixTimestampSec)
    expirationUnixTimestampSec = parseInt(expirationUnixTimestampSec)
    // signedOrder.expirationUnixTimestampSec = expirationUnixTimestampSec
    console.log(signedOrder)
    const payload = {
      details: { order: signedOrder }
    }
    this.props.dispatch(this.updateSelectedOrder(payload))
    this.setState({
      orderRawDialogOpen: true
    })
  }

  onSubmitOrder = async () => {
    const {
      selectedOrder,
      selectedExchange,
      selectedFund,
      selectedRelay
    } = this.props.exchange
    const { endpoint } = this.props
    const { api } = this.context

    const transactionId = sha3_512(new Date() + selectedFund.managerAccount)
    let transactionDetails = {
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
    this.props.dispatch(
      Actions.transactions.addTransactionToQueueAction(
        transactionId,
        transactionDetails
      )
    )

    if (selectedOrder.takerOrder) {
      // fillOrderToExchange(selectedOrder.details.order, selectedOrder.orderFillAmount, selectedExchange)
      try {
        const receipt = await fillOrderToExchangeViaProxy(
          selectedFund,
          selectedOrder.details.order,
          selectedOrder.orderFillAmount,
          selectedExchange
        )
        console.log(receipt)
        transactionDetails.status = 'executed'
        transactionDetails.receipt = receipt
        transactionDetails.hash = receipt.transactionHash
        transactionDetails.timestamp = new Date()
        this.props.dispatch(
          Actions.transactions.addTransactionToQueueAction(
            transactionId,
            transactionDetails
          )
        )

        // Updating drago liquidity
        // this.props.dispatch(
        //   this.updateSelectedFundLiquidity(
        //     selectedFund.details.address,
        //     this.context.api
        //   )
        // )
        Actions.updateLiquidityAndTokenBalances(
          api,
          '',
          selectedFund.details.address
        )
      } catch (error) {
        console.log(serializeError(error))
        const errorArray = serializeError(error).message.split(/\r?\n/)
        transactionDetails.status = 'error'
        transactionDetails.error = errorArray[0]
        this.props.dispatch(
          Actions.transactions.addTransactionToQueueAction(
            transactionId,
            transactionDetails
          )
        )
        utils.notificationError(
          this.props.notifications.engine,
          serializeError(error).message
        )
      }
    } else {
      console.log(selectedOrder)
      let signedOrder = selectedOrder.details.order
      try {
        if (selectedRelay.name === 'Ethfinex') {
          console.log('Ethfinex order')
          let efxSymbol = `t${selectedOrder.selectedTokensPair.baseToken.symbol.toUpperCase()}${selectedOrder.selectedTokensPair.quoteToken.symbolTicker.Ethfinex.toUpperCase()}`
          let efxAmount =
            selectedOrder.orderType === 'asks'
              ? (-Math.abs(selectedOrder.orderFillAmount)).toString()
              : selectedOrder.orderFillAmount
          const efxOrder = {
            type: 'EXCHANGE LIMIT',
            symbol: efxSymbol,
            amount: efxAmount,
            price: selectedOrder.orderPrice,
            meta: signedOrder,
            protocol: '0x'
          }
          efxOrder.meta.sigType = 'contract'
          this.setState({
            efxOrder
          })
          console.log(efxSymbol, efxAmount, selectedOrder.orderPrice)
          console.log(efxOrder)
          let parsedBody = await submitOrderToRelayEFX(
            efxOrder,
            endpoint.networkInfo.id
          )
          transactionDetails.status = 'executed'
          transactionDetails.timestamp = new Date()
          this.props.dispatch(
            Actions.transactions.addTransactionToQueueAction(
              transactionId,
              transactionDetails
            )
          )
          console.log(parsedBody)
        }
      } catch (error) {
        const errorArray = serializeError(error).message.split(/\r?\n/)
        transactionDetails.status = 'error'
        transactionDetails.error = errorArray[0]
        this.props.dispatch(
          Actions.transactions.addTransactionToQueueAction(
            transactionId,
            transactionDetails
          )
        )
        console.log(error)
        utils.notificationError(
          this.props.notifications.engine,
          serializeError(error).message
        )
      }
    }
  }

  onCancelOrder = () => {
    this.setState({
      orderRawDialogOpen: false
    })
    this.props.dispatch(this.cancelSelectedOrder())
  }

  onSelectOrderType = () => {}

  onBuySell = async orderType => {
    const {
      selectedTokensPair,
      selectedExchange,
      selectedFund,
      selectedRelay
    } = this.props.exchange
    const order = await newMakerOrder(
      orderType,
      selectedTokensPair,
      selectedExchange,
      selectedFund,
      selectedRelay.isTokenWrapper
    )
    const makerOrder = {
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
      selectedTokensPair: selectedTokensPair
    }
    console.log(makerOrder)
    this.props.dispatch(this.updateSelectedOrder(makerOrder))
    // this.setState({
    //   orderRawDialogOpen: true
    // })
  }

  render() {
    const { selectedOrder } = this.props.exchange
    let buySelected = selectedOrder.orderType === 'bids'
    let sellSelected = selectedOrder.orderType === 'asks'
    if (selectedOrder.takerOrder) {
      buySelected = selectedOrder.orderType === 'asks'
      sellSelected = selectedOrder.orderType === 'bids'
    }

    return (
      <Row>
        <Col xs={12}>
          <Row className={styles.sectionTitle}>
            <Col xs={12}>
              <BoxTitle titleText={'ORDER BOX'} />
              <Paper style={paperStyle} zDepth={1}>
                <Row className={styles.orderBookContainer}>
                  <Col xs={12}>
                    <Row className={styles.sectionHeaderOrderTable}>
                      <Col sm={12} md={6} className={styles.buyButton}>
                        <ButtonOrderBuy
                          selected={buySelected}
                          onBuySell={this.onBuySell}
                        />
                      </Col>
                      <Col sm={12} md={6} className={styles.sellButton}>
                        <ButtonOrderSell
                          selected={sellSelected}
                          onBuySell={this.onBuySell}
                        />
                      </Col>
                    </Row>
                  </Col>

                  {/* <Col xs={12} className={styles.tokenNameSymbol}>
                    <div className={styles.tokenSymbol}>
                      {selectedTokensPair.baseToken.symbol}
                    </div>
                    <div className={styles.tokenName}>
                      {selectedTokensPair.baseToken.name}
                    </div>
                    <div>
                      <ToggleSwitch
                        label={
                          'ACTIVATE ' + selectedTokensPair.baseToken.symbol
                        }
                        onToggle={this.onToggleAllowanceBaseTokenTrade}
                        toggled={selectedTokensPair.baseTokenAllowance}
                        toolTip={
                          'Activate ' +
                          selectedTokensPair.baseToken.symbol +
                          ' trading'
                        }
                      />
                      <ToggleSwitch
                        label={
                          'ACTIVATE ' + selectedTokensPair.quoteToken.symbol
                        }
                        onToggle={this.onToggleAllowQuoteTokenTrade}
                        toggled={selectedTokensPair.quoteTokenAllowance}
                        toolTip={
                          'Activate ' +
                          selectedTokensPair.quoteToken.symbol +
                          ' trading'
                        }
                      />
                    </div>
                  </Col> */}

                  {/* <Col xs={12}>
                    <OrderTypeSelector
                      orderTypes={['Market', 'Limit']}
                      onSelectOrderType={this.onSelectOrderType}
                    />

                  </Col> */}

                  <Col xs={12}>
                    <OrderAmountInputField
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
                      disabled={
                        selectedOrder.takerOrder ||
                        Object.keys(selectedOrder.details).length === 0
                      }
                    />
                  </Col>
                  <Col xs={12}>
                    <Row center="xs">
                      <Col sm={12} md={6}>
                        <ButtonOrderReset
                          onClick={this.onCancelOrder}
                          disabled={
                            Object.keys(selectedOrder.details).length === 0
                          }
                        />
                      </Col>
                      <Col sm={12} md={6}>
                        <ButtonOrderConfirm
                          onClick={this.onConfirmOrder}
                          disabled={
                            selectedOrder.orderAmountError ||
                            selectedOrder.orderPriceError
                          }
                        />
                      </Col>
                    </Row>
                  </Col>
                  <Col xs={12}>
                    {Object.keys(selectedOrder.details).length !== 0 ? (
                      <OrderSummary order={selectedOrder} />
                    ) : null}
                  </Col>
                </Row>
              </Paper>
            </Col>
          </Row>
        </Col>
        <OrderRawDialog
          order={selectedOrder}
          efxOrder={this.state.efxOrder}
          onSubmitOrder={this.onSubmitOrder}
          onClose={this.onCloseOrderRawDialog}
          open={this.state.orderRawDialogOpen}
          // open={true}
        />
      </Row>
    )
  }
}

export default connect(mapStateToProps)(OrderBox)
