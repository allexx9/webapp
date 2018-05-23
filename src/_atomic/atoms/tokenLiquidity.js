// Copyright 2016-2017 Rigo Investment Sarl.

import styles from './tokenLiquidity.module.css';
import { Row, Col } from 'react-flexbox-grid';
import React, { Component} from 'react';
import PropTypes from 'prop-types';
// import BigNumber from 'bignumber.js';
import { formatEth } from '../../_utils/format'

export default class TokenLiquidity extends Component {

  static propTypes = {
    liquidity: PropTypes.object.isRequired,
  }

  static defaultProps = {
    size: "40px"
  }

  static contextTypes = {
    api: PropTypes.object.isRequired
  }

  render () {
    const { liquidity } = this.props
    const { api } = this.context
    return (
      <Row>
        <Col xs={12}>
        <div className={styles.sectionTitle}>
          Liquidity
        </div>
        </Col>
        <Col xs={12} style={{fontSize: "14px"}}>
        {formatEth(liquidity.ETH, 4, api)} <small>ETH</small><br />
        </Col>
        <Col xs={12} style={{fontSize: "14px"}}>
        {formatEth(liquidity.WETH, 4, api)} <small>WETH</small><br />
        </Col>
        <Col xs={12} style={{fontSize: "14px"}}>
        {formatEth(liquidity.ZRX, 4, api)} <small>ZRX</small><br />
        </Col>
      </Row>
    );
  }
}