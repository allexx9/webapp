import * as Colors from 'material-ui/styles/colors'
import { Col, Row } from 'react-flexbox-grid'
import PropTypes from 'prop-types'
import React, { Component } from 'react'
// import ReactTooltip from 'react-tooltip'
import EtherscanLink from '../atoms/etherscanLink'
import TradingPairSymbolsOrders from '../atoms/tradingPairSymbolsOders'
import classNames from 'classnames'

import { formatPriceTrades } from '../../_utils/format'

import styles from './tableTradesHistory.module.css'

class TableTradesHistory extends Component {
  static propTypes = {
    list: PropTypes.array.isRequired,
    networkName: PropTypes.string.isRequired
  }

  static defaultProps = {
    list: [],
    networkName: 'mainnet'
  }

  renderTableRows = trades => {
    const orderTypeStyle = {
      sell: {
        color: Colors.red400,
        fontWeight: 700
      },
      buy: {
        color: Colors.green400,
        fontWeight: 700
      }
    }

    return trades.map((trade, key) => {
      return (
        <Row
          key={'trade' + key}
          className={styles.rowText}
          style={
            !(key % 2)
              ? { backgroundColor: '#cccccc24' }
              : { backgroundColor: '#fff' }
          }
        >
          <Col xs={12}>
            <Row>
              <Col
                xs={1}
                style={orderTypeStyle[trade.type]}
                className={styles.tableCell}
              >
                {trade.type === 'sell' ? 'S' : 'B'}
              </Col>
              <Col xs={2} className={styles.tableCell}>
                <TradingPairSymbolsOrders
                  baseTokenSymbol={trade.baseTokenSymbol}
                  quoteTokenSymbol={trade.quoteTokenSymbol}
                />
              </Col>
              <Col
                xs={4}
                className={classNames(styles.tableCell, styles.right)}
              >
                {formatPriceTrades(trade.amount)}
              </Col>
              <Col
                xs={4}
                className={classNames(styles.tableCell, styles.right)}
              >
                <span className={styles.amountCell}>
                  <EtherscanLink
                    networkName={this.props.networkName}
                    textLink={formatPriceTrades(trade.price)}
                    txHash={trade.transactionHash}
                  />
                </span>
              </Col>
              {/* <div data-tip={orderStatusInfo} data-for="orderTooltip">
                  <span className={styles.tableCellUnderline}>
                    {orderStatus[0].trim()}
                  </span>

                  <ReactTooltip effect="solid" place="top" id="orderTooltip" />
                </div> */}
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
            <Col xs={1} />
            <Col xs={2} className={styles.right}>
              PAIR
            </Col>
            <Col xs={4} className={styles.right}>
              AMOUNT
            </Col>
            <Col xs={4} className={styles.right}>
              PRICE
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

export default TableTradesHistory
