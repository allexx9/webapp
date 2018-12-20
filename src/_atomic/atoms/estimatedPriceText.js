import PropTypes from 'prop-types'
import React, { PureComponent } from 'react'
import isFinite from 'lodash/isFinite'

class EstimatedPriceText extends PureComponent {
  static propTypes = {
    price: PropTypes.string.isRequired
  }

  render() {
    const { price } = this.props
    let priceText = isFinite(Number(price)) ? price : '-'
    return (
      <div>
        {priceText} <small>ETH</small>
      </div>
    )
  }
}

export default EstimatedPriceText
