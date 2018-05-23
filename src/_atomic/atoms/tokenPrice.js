// Copyright 2016-2017 Rigo Investment Sarl.

import styles from './tokenPrice.module.css';
import { Row, Col } from 'react-flexbox-grid';
import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { BigNumber } from 'bignumber.js';
import classNames from 'classnames';


export default class TokenPrice extends Component {

  static propTypes = {
    tokenPrice: PropTypes.string,
    priceVariation: PropTypes.string
  }

  static defaultProps = {
    tokenPrice: '0.018000',
    priceVariation: "0"
  }

  checkPrice = () => {
    const { priceVariation } = this.props
    if (new BigNumber(priceVariation).gt(0)) {
      return styles.priceIncreased
    }
    if (new BigNumber(priceVariation).lt(0)) {
      return styles.priceDecreased
    }
    if (new BigNumber(priceVariation).eq(0)) {
      return styles.priceNoVariation
    }
  }

  render() {
    const { tokenPrice, priceVariation } = this.props
    return (
      <Row end="xs">
        <Col xs={12}>
        <div className={classNames(styles.tokenPrice, this.checkPrice())}>
          {tokenPrice}
        </div>
        </Col>
        <Col xs={12}>
          <div className={classNames(styles.priceVariation, this.checkPrice())}>
            {priceVariation + "%"}
          </div>
        </Col>
      </Row>
    );
  }
}