import * as Colors from 'material-ui/styles/colors'
import { Col, Row } from 'react-flexbox-grid'
import PropTypes from 'prop-types'
import React, { Component } from 'react'

import { formatPrice } from '../../_utils/format'

import styles from './tableOrdersHistory.module.css'

class TableOpenOrders extends Component {
  static propTypes = {
    orders: PropTypes.array.isRequired,
    onCancelOrder: PropTypes.func.isRequired
  }

  renderTableRows = orders => {
    const orderTypeStyle = {
      asks: {
        color: Colors.red400,
        fontWeight: 700
      },
      bids: {
        color: Colors.green400,
        fontWeight: 700
      }
    }
    console.log(orders)
    return orders.map((order, key) => {
      // console.log(order)
      return (
        <Row key={'order' + key} className={styles.rowText}>
          <Col xs={12}>
            <Row>
              <Col xs={2} className={styles.tableCell}>
                {order.dateCreated}
              </Col>
              <Col xs={2} className={styles.tableCell}>
                {order.order.pair}
              </Col>
              <Col
                xs={2}
                style={orderTypeStyle[order.orderType]}
                className={styles.tableCell}
              >
                {order.orderType === 'asks' ? 'SELL' : 'BUY'}
              </Col>
              <Col xs={2}>{formatPrice(order.orderPrice)}</Col>
              <Col xs={2} className={styles.tableCell}>
                {Math.abs(order.orderAmount).toString()}
              </Col>
              {/* <Col xs={2}>
                  {new Date(order.order.expirationUnixTimestampSec*1000).toLocaleString()}
                </Col> */}
              <Col xs={2} className={styles.tableCell}>
                {order.order.status}
              </Col>
            </Row>
          </Col>
        </Row>
      )
    })
  }

  renderTableHeader = () => {
    return (
      <Row className={styles.tableTitle}>
        <Col xs={12}>
          <Row>
            <Col xs={2}>DATE</Col>
            <Col xs={2}>PAIR</Col>
            <Col xs={2}>TYPE</Col>
            <Col xs={2}>PRICE</Col>
            <Col xs={2}>QUANTITY</Col>
            {/* <Col xs={2}>
                EXPIRES
              </Col> */}
            <Col xs={2}>STATUS</Col>
          </Row>
        </Col>
      </Row>
    )
  }

  render() {
    const { orders } = this.props
    // console.log(orders)

    return (
      <Row className={styles.containerOrders}>
        <Col xs={12}>
          {this.renderTableHeader()}
          {this.renderTableRows(orders)}
        </Col>
      </Row>
    )
  }
}

export default TableOpenOrders
