import PropTypes from 'prop-types'
import React, { PureComponent } from 'react'

class EstimatedPriceText extends PureComponent {
  static propTypes = {
    price: PropTypes.string.isRequired
  }

  render() {
    const { price } = this.props
    return price === '-' ? (
      <div>-</div>
    ) : (
      <div>
        {price} <small>ETH</small>
      </div>
    )
  }
}

export default EstimatedPriceText
