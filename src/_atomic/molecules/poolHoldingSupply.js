// Copyright 2016-2017 Gabrele Rigo

import LoadingWheel from '../atoms/loadingWheel'
import PropTypes from 'prop-types'
import React, { Component } from 'react'
import TokenSymbolText from '../atoms/tokenSymbolText'
import styles from './poolHoldingSupply.module.css'

export default class PoolHoldingSupply extends Component {
  static propTypes = {
    amount: PropTypes.string,
    symbol: PropTypes.string.isRequired
  }

  static defaultProps = {
    amount: '',
    symbol: ''
  }

  render() {
    const checkLoading = input => {
      if (input === '' || input === null) {
        return <LoadingWheel />
      }
      return input
    }
    return (
      <span className={styles.holdings}>
        <div className={styles.loadingWheel}>
          {checkLoading(this.props.amount)}
        </div>{' '}
        <div className={styles.symbol}>
          <TokenSymbolText symbol={this.props.symbol} />
        </div>
      </span>
    )
  }
}
