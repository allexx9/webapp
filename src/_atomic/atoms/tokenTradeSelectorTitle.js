import PropTypes from 'prop-types'
import React from 'react'
import styles from './tokenTradeSelectorTitle.module.css'

class TokenTradeSelectorTitle extends React.Component {
  static propTypes = {
    selectedToken: PropTypes.string.isRequired,
    onClick: PropTypes.func.isRequired
  }

  static defaultProps = {
    selectedToken: 'USDT'
  }

  selectedStyle = token => {
    const { selectedToken } = this.props
    if (token === selectedToken) {
      return styles.tokenSelected
    }
    return styles.tokenNotSelected
  }

  render() {
    return (
      <div>
        <div className={styles.title}>Trading pairs</div>
        <div className={styles.quoteTokens}>
          <span
            className={this.selectedStyle('ETH')}
            onClick={this.props.onClick}
            id="select-quote-token-ETH"
          >
            ETH
          </span>{' '}
          <span
            className={this.selectedStyle('USDT')}
            onClick={this.props.onClick}
            id="select-quote-token-USDT"
          >
            USDT
          </span>
        </div>
      </div>
    )
  }
}

export default TokenTradeSelectorTitle
