// Copyright 2016-2017 Rigo Investment Sagl.

import BlokiesIcon from './blokiesIcon'
import PropTypes from 'prop-types'
import React, { PureComponent } from 'react'

export default class IdentityIcon extends PureComponent {
  static propTypes = {
    address: PropTypes.string.isRequired,
    size: PropTypes.number,
    customStyle: PropTypes.object
  }

  static defaultProps = {
    size: 25,
    customStyle: {}
  }

  static contextTypes = {
    api: PropTypes.object.isRequired
  }

  render() {
    const { address, size } = this.props
    return (
      <BlokiesIcon
        seed={address}
        size={size}
        scale={3}
        style={{ borderRadius: '50%' }}
      />
    )
  }
}
