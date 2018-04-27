import PropTypes from 'prop-types';
import React, { Component } from 'react';
import { Row, Col } from 'react-flexbox-grid';
import BigNumber from 'bignumber.js'
import Divider from 'material-ui/Divider';

import styles from './orderSummary.module.css'

class OrderSummary extends Component {

  static propTypes = {
    order: PropTypes.object.isRequired,
  };

  static contextTypes = {
    api: PropTypes.object.isRequired,
  };

 
  render() {
    const { order } = this.props
    var price, amount, fee
    price = order.details.orderPrice
    amount = order.details.orderAmount
    fee = new BigNumber(order.details.order.takerFee).toFixed(5)
    return (
      <Row className={styles.containerOrders}>
        <Col xs={12}>
          <div className={styles.title}>SUMMARY</div>
        </Col>
        <Col xs={12} className={styles.summaryRow}>
          <Divider />
        </Col>
        <Col xs={12} className={styles.summaryRow}>
          <Row>
            <Col xs={6}>
              <div>Quantity</div>
            </Col>
            <Col xs={6}>
              <div>{amount}</div>
            </Col>
          </Row>
        </Col>
        <Col xs={12} className={styles.summaryRow}>
          <Row>
            <Col xs={6}>
              <div>Price</div>
            </Col>
            <Col xs={6}>
              <div>{price}</div>
            </Col>
          </Row>
        </Col>
        <Col xs={12} className={styles.summaryRow}>
          <Row>
            <Col xs={6}>
              <div>Fee</div>
            </Col>
            <Col xs={6}>
              <div>{fee}</div>
            </Col>
          </Row>
        </Col>
        <Col xs={12} className={styles.summaryRow}>
          <Divider />
        </Col>
        <Col xs={12} className={styles.summaryRow}>
          <Row>
            <Col xs={6}>
              <div>TOTAL</div>
            </Col>
            <Col xs={6}>
              <div>{fee}</div>
            </Col>
          </Row>
        </Col>

      </Row>
    )
  }
}

export default OrderSummary