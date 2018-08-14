import PropTypes from 'prop-types';
import React, { Component } from 'react';
import { Row, Col } from 'react-flexbox-grid';
import styles from './ordersHistoryBox.module.css'
import Paper from 'material-ui/Paper'
import BoxTitle from '../atoms/boxTitle'
import TableOpenOrders from '../molecules/tableOpenOrders'
import {
  cancelOrderOnExchangeViaProxy,
  softCancelOrderFromRelayERCdEX
} from '../../_utils/exchange'
import { sha3_512 } from 'js-sha3';
import { connect } from 'react-redux';
import {
  ADD_TRANSACTION,
} from '../../_utils/const'
import serializeError from 'serialize-error';
import utils from '../../_utils/utils'


const paperStyle = {
  padding: "10px"
}

function mapStateToProps(state) {
  return state
}

class OrdersHistoryBox extends Component {

  static propTypes = {
    fundOrders: PropTypes.object.isRequired,
    exchange: PropTypes.object.isRequired,
    dispatch: PropTypes.func.isRequired,
    notifications: PropTypes.object.isRequired,
  };


  onCancelOrder  = async (order) => {
    const { selectedFund, selectedTokensPair } = this.props.exchange

    const transactionId = sha3_512(new Date() + selectedFund.managerAccount)
    let transactionDetails = {
      status: 'pending',
      hash: '',
      parityId: null,
      timestamp: new Date(),
      account: selectedFund.details.address,
      error: false,
      action: order.orderType === 'asks' ? 'CancelExBuyOrder' : 'CancelExSellOrder',
      symbol: selectedTokensPair.baseToken.symbol.toUpperCase(),
      amount: order.orderAmount
    }
    // this.props.dispatch(Actions.transactions.addTransactionToQueueAction(transactionId, transactionDetails))

      try {

        const receipt = await cancelOrderOnExchangeViaProxy(selectedFund, order.order, order.order.takerTokenAmount)
        console.log(receipt)
        transactionDetails.status = 'executed'
        transactionDetails.receipt = receipt
        transactionDetails.hash = receipt.transactionHash
        transactionDetails.timestamp = new Date ()
        // this.props.dispatch(Actions.transactions.addTransactionToQueueAction(transactionId, transactionDetails))
        
        // const result = await softCancelOrderFromRelayERCdEX(order)
        // console.log(result)

        // Updating drago liquidity
        // this.props.dispatch(this.updateSelectedFundLiquidity(selectedFund.details.address, this.context.api))
      }
      catch (error) {
        console.log(serializeError(error))
        const errorArray = serializeError(error).message.split(/\r?\n/)
        transactionDetails.status = 'error'
        transactionDetails.error = errorArray[0]
        // this.props.dispatch(Actions.transactions.addTransactionToQueueAction(transactionId, transactionDetails))
        // utils.notificationError(this.props.notifications.engine, serializeError(error).message)
      }
    

  }

  render() {
    // console.log(this.props.fundOrders)
    return (
      <Row>
        <Col xs={12}>
          <Row className={styles.sectionTitle}>
            <Col xs={12}>
              <BoxTitle titleText={'MY ORDERS'} />
              <Paper style={paperStyle} zDepth={1} >
                <Row>
                  <Col xs={12}>
                  <p className={styles.titleSection}>Open Orders</p>
                  <TableOpenOrders 
                    orders={this.props.fundOrders.open}
                    onCancelOrder={this.onCancelOrder}
                  />
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

export default connect(mapStateToProps)(OrdersHistoryBox)