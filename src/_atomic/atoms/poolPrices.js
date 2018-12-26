import { Col, Row } from 'react-flexbox-grid'
import PropTypes from 'prop-types'
import React, { Component } from 'react'
import classNames from 'classnames'
import styles from './poolPrices.module.css'

export default class PoolPrices extends Component {
  static propTypes = {
    buyPrice: PropTypes.string,
    sellPrice: PropTypes.string
  }

  static defaultProps = {
    buyPrice: '-',
    sellPrice: '-'
  }

  render() {
    const { buyPrice, sellPrice } = this.props
    return (
      <div className={styles.container}>
        <Row>
          <Col xs={6}>
            <Row>
              <div className={classNames(styles.actionContainer, styles.buy)}>
                <Col xs={12}>
                  <div className={classNames(styles.buySellText)}>Buy</div>
                </Col>
                <Col xs={12}>
                  {buyPrice} <small>ETH</small>
                </Col>
              </div>
            </Row>
          </Col>
          <Col xs={6}>
            <div className={classNames(styles.actionContainer, styles.sell)}>
              <Col xs={12}>
                <div className={classNames(styles.buySellText)}>Sell</div>
              </Col>
              <Col xs={12}>
                {sellPrice} <small>ETH</small>
              </Col>
            </div>
          </Col>
        </Row>
      </div>
    )
  }
}
