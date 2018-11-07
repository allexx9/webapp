import * as Colors from 'material-ui/styles/colors'
import { Col, Row } from 'react-flexbox-grid'
import BigNumber from 'bignumber.js'
import PropTypes from 'prop-types'
import React, { Component } from 'react'

import { formatPrice } from '../../_utils/format'

import styles from './tableOpenOrders.module.css'

class TableOpenOrders extends Component {
  static propTypes = {
    list: PropTypes.array,
    onCancelOrder: PropTypes.func
  }

  static defaultProps = {
    list: [],
    onCancelOrder: () => {}
  }

  onCancelOrder = (event, id) => {
    const { list } = this.props
    event.preventDefault()
    this.props.onCancelOrder(list[id])
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
    // console.log(orders)
    return orders.map((order, key) => {
      // console.log(order)
      return (
        <Row key={'order' + key} className={styles.rowText}>
          <Col xs={12}>
            <Row>
              <Col xs={2} style={orderTypeStyle[order.orderType]}>
                {order.orderType === 'asks' ? 'SELL' : 'BUY'}
              </Col>
              <Col xs={2}>{formatPrice(order.orderPrice)}</Col>
              <Col xs={2}>{Math.abs(order.orderAmount).toString()}</Col>
              {/* <Col xs={2}>
                  {new Date(order.order.expirationUnixTimestampSec*1000).toLocaleString()}
                </Col> */}
              <Col xs={6} className={styles.tableHeaderCellAction}>
                <a
                  id={key}
                  href="#"
                  onClick={event => this.onCancelOrder(event, key)}
                  className={styles.cancelLink}
                >
                  Cancel
                </a>
              </Col>
            </Row>
          </Col>
        </Row>
      )
    })
  }

  renderTableHeader = () => {
    return (
      <Row className={styles.tableHeader}>
        <Col xs={12}>
          <Row>
            <Col xs={2}>TYPE</Col>
            <Col xs={2}>PRICE</Col>
            <Col xs={2}>QUANTITY</Col>
            {/* <Col xs={2}>
                EXPIRES
              </Col> */}
            <Col xs={6} className={styles.tableHeaderCellAction}>
              ACTION
            </Col>
          </Row>
        </Col>
      </Row>
    )
  }

  render() {
    const { list } = this.props
    return (
      <Row className={styles.containerOrders}>
        <Col xs={12}>
          {this.renderTableHeader()}
          {this.renderTableRows(list)}
        </Col>
      </Row>
    )
  }
}

export default TableOpenOrders
