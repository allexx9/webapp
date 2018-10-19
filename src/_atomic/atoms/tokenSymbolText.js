// Copyright 2016-2017 Gabrele Rigo

import PropTypes from 'prop-types'
import React, { Component } from 'react'
import styles from './tokenSymbolText.module.css'

export default class TokenSymbolText extends Component {
  static propTypes = {
    symbol: PropTypes.string.isRequired
  }

  static defaultProps = {
    symbol: ''
  }

  render() {
    return (
      <span>
        <small className={styles.myPositionTokenSymbol}>
          {this.props.symbol}
        </small>
      </span>
    )
  }
}
