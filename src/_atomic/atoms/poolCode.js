import PropTypes from 'prop-types'
import React, { Component } from 'react'
import utils from '../../_utils/utils'

export default class PoolCode extends Component {
  static propTypes = {
    symbol: PropTypes.string.isRequired,
    id: PropTypes.string.isRequired
  }

  render() {
    const { symbol, id } = this.props
    return <div>{utils.dragoISIN(symbol, id)}</div>
  }
}
