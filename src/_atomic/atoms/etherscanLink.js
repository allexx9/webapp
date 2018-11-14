// Copyright 2016-2017 Rigo Investment Sagl.

import PropTypes from 'prop-types'
import React, { Component } from 'react'

export default class EtherscanLink extends Component {
  static propTypes = {
    networkName: PropTypes.string.isRequired,
    textLink: PropTypes.oneOfType([
      PropTypes.string.isRequired,
      PropTypes.object.isRequired
    ]),
    txHash: PropTypes.string.isRequired
  }

  static defaultProps = {
    networkName: 'mainnet'
  }

  static contextTypes = {
    api: PropTypes.object.isRequired
  }

  etherscanLinkTx = () => {
    return this.props.networkName === 'mainnet'
      ? 'https://etherscan.io/tx/' + this.props.txHash
      : 'https://' +
          this.props.networkName +
          '.etherscan.io/tx/' +
          this.props.txHash
  }

  render() {
    return (
      <a
        href={this.etherscanLinkTx()}
        rel="noopener noreferrer"
        target="_blank"
      >
        {this.props.textLink}
      </a>
    )
  }
}
