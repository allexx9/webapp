import * as Colors from 'material-ui/styles/colors'
import { Col, Row } from 'react-flexbox-grid'
import { formatPrice } from '../../_utils/format'
import PropTypes from 'prop-types'
import React, { Component } from 'react'
import ReactTooltip from 'react-tooltip'
import TradingPairSymbolsOrders from '../atoms/tradingPairSymbolsOders'
import classNames from 'classnames'
import styles from './tableOrdersHistory.module.css'

class TableOrdersHistory extends Component {
  static propTypes = {
    list: PropTypes.array,
    onCancelOrder: PropTypes.func
  }

  static defaultProps = {
    list: [],
    onCancelOrder: () => {}
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
      },
      CANCELED: {
        color: Colors.grey400,
        fontWeight: 700
      },
      EXECUTED: {
        color: Colors.green400,
        fontWeight: 700
      }
    }

    return orders.map((order, key) => {
      let orderStatus = order.order.status.split(' ')
      let orderStatusInfo = orderStatus.join(' ')
      let baseTokenSymbol = order.order.pair.slice(0, -3)
      return (
        <Row
          key={'order' + key}
          className={styles.rowText}
          style={
            !(key % 2)
              ? { backgroundColor: '#cccccc24' }
              : { backgroundColor: '#fff' }
          }
        >
          <Col xs={12}>
            <Row>
              <Col xs={3} className={styles.tableCell}>
                {order.dateCreated}
              </Col>
              <Col xs={2} className={styles.tableCell}>
                <TradingPairSymbolsOrders
                  baseTokenSymbol={baseTokenSymbol}
                  quoteTokenSymbol={order.order.fiat_currency}
                />
              </Col>
              <Col
                xs={1}
                style={orderTypeStyle[order.orderType]}
                className={styles.tableCell}
              >
                {order.orderType === 'asks' ? 'SELL' : 'BUY'}
              </Col>
              <Col
                xs={2}
                className={classNames(styles.tableCell, styles.right)}
              >
                {formatPrice(order.orderPrice)}
              </Col>
              <Col
                xs={2}
                className={classNames(styles.tableCell, styles.right)}
              >
                {formatPrice(Math.abs(order.order.originalamount).toString())}
              </Col>
              {/* <Col xs={2}>
                    {new Date(order.order.expirationTimeSeconds*1000).toLocaleString()}
                  </Col> */}
              <Col
                xs={2}
                className={classNames(styles.tableCell, styles.right)}
                style={orderTypeStyle[orderStatus[0].trim()]}
              >
                <div data-tip={orderStatusInfo} data-for="orderTooltip">
                  <span className={styles.tableCellUnderline}>
                    {orderStatus[0].trim()}
                  </span>

                  <ReactTooltip effect="solid" place="top" id="orderTooltip" />
                </div>
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
            <Col xs={2}>DATE</Col>
            <Col xs={2} className={styles.right}>
              PAIR
            </Col>
            <Col xs={2} className={styles.right}>
              TYPE
            </Col>
            <Col xs={2} className={styles.right}>
              PRICE
            </Col>
            <Col xs={2} className={styles.right}>
              QUANTITY
            </Col>
            {/* <Col xs={2}>
                EXPIRES
              </Col> */}
            <Col xs={2} className={styles.right}>
              STATUS
            </Col>
          </Row>
        </Col>
      </Row>
    )
  }

  render() {
    const { list } = this.props
    // console.log(orders)

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

export default TableOrdersHistory
