// Copyright 2016-2017 Rigo Investment Sagl.

import { Col, Row } from 'react-flexbox-grid'
import { TextField } from 'material-ui'
import BigNumber from 'bignumber.js'
import PropTypes from 'prop-types'
import React, { Component } from 'react'
import ReactTooltip from 'react-tooltip'
// import styles from './tokenLockAmountField.module.css'

export default class TokenLockTimeField extends Component {
  static propTypes = {
    isBaseToken: PropTypes.bool.isRequired,
    onChangeTime: PropTypes.func.isRequired,
    time: PropTypes.string.isRequired,
    disabled: PropTypes.bool
  }

  static defaultProps = {
    time: 1,
    baseToken: true,
    disabled: true
  }

  static contextTypes = {
    api: PropTypes.object.isRequired
  }

  state = {
    amountError: ''
  }

  onChangeTime = event => {
    let amountError = 'Please enter a valid positive number'
    try {
      if (!new BigNumber(event.target.value).gt(0)) {
        this.setState({
          amountError: 'Please enter a valid positive number'
        })
        this.error = true
        this.props.onChangeTime(
          event.target.value,
          this.props.isBaseToken,
          amountError
        )
        return
      } else {
        this.setState({
          amountError: ''
        })
      }
    } catch (error) {
      this.setState({
        amountError: 'Please enter a valid positive number'
      })
      this.error = true
      this.props.onChangeTime(
        event.target.value,
        this.props.isBaseToken,
        amountError
      )
      return
    }
    // console.log('ok')
    this.props.onChangeTime(event.target.value, this.props.isBaseToken, '')
  }

  render() {
    const { time } = this.props
    return (
      <Row bottom="xs">
        <Col xs={12}>
          <div data-tip={`Min lock time:  ${time}hr`} data-for="minTimeBalance">
            <TextField
              key={
                this.props.isBaseToken
                  ? 'baseTokenTimeFieldKey'
                  : 'quoteTokenTimeFieldKey'
              }
              autoComplete="off"
              disabled={this.props.disabled}
              fullWidth
              // errorText={this.state.amountError}
              name="tokenLockAmount"
              id={
                this.props.isBaseToken
                  ? 'baseTokenTimeFieldId'
                  : 'quoteTokenTimeFieldId'
              }
              value={time}
              style={{ height: 'unset' }}
              // underlineShow={false}
              underlineStyle={{ bottom: '0px' }}
              onChange={this.onChangeTime}
            />
          </div>
        </Col>
        <ReactTooltip effect="solid" place="top" id="minTimeBalance" />
      </Row>
    )
  }
}
