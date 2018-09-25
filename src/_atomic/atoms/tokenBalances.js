// Copyright 2016-2017 Rigo Investment Sagl.

import { Col, Row } from 'react-flexbox-grid'
import PropTypes from 'prop-types'
import React, { Component } from 'react'
import styles from './tokenBalances.module.css'
// import BigNumber from 'bignumber.js';
import { formatEth } from '../../_utils/format'
import ContentLoader from 'react-content-loader'
import Loading from './loading'

export default class TokenBalances extends Component {
  static propTypes = {
    liquidity: PropTypes.object.isRequired,
    selectedTradeTokensPair: PropTypes.object.isRequired,
    loading: PropTypes.bool
  }

  static defaultProps = {
    loading: false
  }

  static contextTypes = {
    api: PropTypes.object.isRequired
  }

  render() {
    const { liquidity, selectedTradeTokensPair } = this.props
    const { api } = this.context
    console.log(liquidity)
    return typeof liquidity.baseToken === 'undefined' ? (
      <div className={styles.balancesContainer}>
        <Row>
          <Col xs={8}>BALANCES:</Col>
          <Col xs={4}>
            <ContentLoader
              height={15}
              width={300}
              speed={2}
              primaryColor="#f3f3f3"
              secondaryColor="#ecebeb"
            >
              <rect x="0" y="0" rx="5" ry="5" width="300" height="120" />
            </ContentLoader>
          </Col>
        </Row>
      </div>
    ) : (
      <div className={styles.balancesContainer}>
        <Row>
          <Col xs={12}>
            <div>
              BALANCES: {formatEth(liquidity.baseToken.balance, 4, api)}{' '}
              <small>{selectedTradeTokensPair.baseToken.symbol}</small>{' '}
              {formatEth(liquidity.quoteToken.balance, 4, api)}{' '}
              <small>{selectedTradeTokensPair.quoteToken.symbol}</small>{' '}
              {formatEth(liquidity.ZRX, 4, api)} <small>ZRX</small>
            </div>
          </Col>
        </Row>
      </div>
    )
  }
}
