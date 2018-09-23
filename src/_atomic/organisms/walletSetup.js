// Copyright 2016-2017 Rigo Investment Sagl.
import { connect } from 'react-redux'
import { withRouter } from 'react-router-dom'
import PropTypes from 'prop-types'
import React, { Component } from 'react'
import WalletSetupStepper from './walletSetupStepper'

function mapStateToProps(state) {
  return state
}

class WalletSetup extends Component {
  state = {
    openWalletSetup:
      this.props.endpoint.metaMaskLocked ||
      !this.props.endpoint.metaMaskNetworkCorrect
        ? true
        : false
  }

  static propTypes = {
    endpoint: PropTypes.object.isRequired,
    location: PropTypes.object.isRequired
  }

  static getDerivedStateFromProps(props) {
    return props.endpoint.metaMaskLocked ||
      !props.endpoint.metaMaskNetworkCorrect
      ? {
          openWalletSetup: true
        }
      : null
  }

  handleCloseWalletSetup = () => {
    this.setState({
      openWalletSetup: false
    })
  }

  render() {
    return (
      <div>
        {this.props.location.pathname !== '/app/web/home' && (
          <WalletSetupStepper
            open={this.state.openWalletSetup}
            handleClose={this.handleCloseWalletSetup}
          />
        )}
      </div>
    )
  }
}

export default withRouter(connect(mapStateToProps)(WalletSetup))
