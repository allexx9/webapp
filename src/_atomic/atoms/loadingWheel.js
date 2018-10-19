// Copyright 2016-2017 Gabrele Rigo

import PropTypes from 'prop-types'
import React, { Component } from 'react'
import RefreshIndicator from 'material-ui/RefreshIndicator'

export default class LoadingWheel extends Component {
  static propTypes = {
    size: PropTypes.number
  }

  static defaultProps = {
    size: 28
  }

  shouldComponentUpdate() {
    return false
  }

  render() {
    const refresh = {
      display: 'inline-block',
      position: 'relative'
    }
    return (
      <RefreshIndicator
        size={this.props.size}
        left={0}
        top={5}
        right={20}
        status="loading"
        style={refresh}
      />
    )
  }
}
