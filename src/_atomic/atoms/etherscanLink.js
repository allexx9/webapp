// Copyright 2016-2017 Rigo Investment Sagl.

import PropTypes from 'prop-types'
import React, { Component } from 'react'

export default class EtherscanLink extends Component {
  static propTypes = {
    networkName: PropTypes.string.isRequired,
    textLink: PropTypes.oneOfType([
      PropTypes.string.isRequired,
      PropTypes.object.isRequired
    ]).isRequired,
    txHash: PropTypes.string,
    address: PropTypes.string
  }

  static defaultProps = {
    networkName: 'mainnet',
    txHash: '',
    address: ''
    // textLink: ''
  }

  static contextTypes = {
    api: PropTypes.object.isRequired
  }

  etherscanLinkTx = () => {
    const { txHash, networkName, address } = this.props
    const type = txHash ? 'tx' : 'address'
    return networkName === 'mainnet'
      ? 'https://etherscan.io/' + type + '/' + txHash || address
      : 'https://' + networkName + '.etherscan.io/' + type + '/' + txHash ||
          address
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
