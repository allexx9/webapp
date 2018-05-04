import PropTypes from 'prop-types';
import React, { Component } from 'react';
import { Row, Col } from 'react-flexbox-grid';
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
import { connect } from 'react-redux';
import {
  UPDATE_SELECTED_ORDER,
  CANCEL_SELECTED_ORDER
} from '../../_utils/const'


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
  };

  static defaultProps = {
  };

  static contextTypes = {
    exchangeUtils: PropTypes.object.isRequired,
  };

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

  onChangeAmount = (amount, error) =>{
    const payload = {
      orderAmountError: error,
      orderFillAmount: amount,
    }
    this.props.dispatch(this.updateSelectedOrder(payload))
  }

  onChangePrice = (amount, error) =>{
    const payload = {
      orderPriceError: error,
      orderPrice: amount,
    }
    this.props.dispatch(this.updateSelectedOrder(payload))
  }

  onSubmitOrder = async () =>{
    const { exchangeUtils } = this.context
    const { selectedOrder } = this.props.exchange
    if (selectedOrder.takerOrder) {
      exchangeUtils.fillOrderToExchange(selectedOrder.details.order, selectedOrder.orderFillAmount)
    }
    // else {
    //   var signedOrder = await exchangeUtils.signOrder(selectedOrder)
    //   console.log(signedOrder)
    //   exchangeUtils.sendOrderToRelay(signedOrder)
    // }
  }

  onCancelOrder = () =>{
    this.props.dispatch(this.cancelSelectedOrder())
  }

  onBuySell = async (orderType) =>{
    const { exchangeUtils } = this.context
    const order = await exchangeUtils.newMakerOrder(orderType)
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
      selectedTokensPair: exchangeUtils.tradeTokensPair,
    }
    
    this.props.dispatch(this.updateSelectedOrder(payload))
  }

  
  render() {
    const { selectedOrder, selectedTokensPair } = this.props.exchange

    var buySelected = (selectedOrder.orderType === 'asks')
    var sellSelected = (selectedOrder.orderType === 'bids')
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
                  </Col>


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
      </Row>
    )
  }
}

export default connect(mapStateToProps)(OrderBox)