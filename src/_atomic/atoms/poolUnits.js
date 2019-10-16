import PropTypes from 'prop-types'
import React, { Component } from 'react'
import BigNumber from 'bignumber.js'

export default class PoolUnits extends Component {
  static propTypes = {
    units: PropTypes.string.isRequired,
    symbol: PropTypes.string
  }

  render() {
    const { units, symbol } = this.props
    return (
      <div>
        {new BigNumber(units).toFixed(4)}{' '}
        {symbol && <small>{symbol}</small>}
      </div>
    )
  }
}