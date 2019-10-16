// Copyright 2016-2017 Rigo Investment Sagl.

import BlokiesIcon from './blokiesIcon'
import PropTypes from 'prop-types'
import React, { Component } from 'react'

export default class IdentityIcon extends Component {
  static propTypes = {
    address: PropTypes.string.isRequired,
    size: PropTypes.number,
    customStyle: PropTypes.object
  }

  shouldComponentUpdate(nextProps) {
    return !this.props.address === nextProps.address
  }

  static defaultProps = {
    size: 25,
    customStyle: {}
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
