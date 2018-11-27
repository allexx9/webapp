import PropTypes from 'prop-types'
import React from 'react'
import styles from './tradingPairSymbolsOrders.module.css'

class TradingPairSymbolsOrders extends React.Component {
  static propTypes = {
    baseTokenSymbol: PropTypes.string.isRequired,
    quoteTokenSymbol: PropTypes.string.isRequired
  }

  static defaultProps = {
    baseToken: '',
    quoteToken: ''
  }

  render() {
    return (
      <div>
        <span className={styles.baseToken}>{this.props.baseTokenSymbol}</span>
        <span>
          <small>/{this.props.quoteTokenSymbol}</small>
        </span>
      </div>
    )
  }
}

export default TradingPairSymbolsOrders
