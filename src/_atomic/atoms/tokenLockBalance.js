// Copyright 2016-2017 Rigo Investment Sagl.

import { formatPrice } from '../../_utils/format'
import BigNumber from 'bignumber.js'
import PropTypes from 'prop-types'
import React, { Component } from 'react'
import ReactTooltip from 'react-tooltip'
import moment from 'moment'

export default class TokenLockBalance extends Component {
  static propTypes = {
    balance: PropTypes.string.isRequired,
    lockTime: PropTypes.string.isRequired,
    onClick: PropTypes.func,
    isBaseToken: PropTypes.bool
  }

  static defaultProps = {
    balance: 0,
    lockTime: '0',
    onClick: () => {},
    isBaseToken: true
  }

  onSetMaxAmount = () => {
    this.props.onClick(
      formatPrice(this.props.balance),
      this.props.isBaseToken,
      '',
      { relock: true }
    )
  }

  render() {
    const now = Math.floor(Date.now() / 1000)
    // console.log(`Now: ${moment().format('MMMM Do YYYY, h:mm:ss a')}`)
    // console.log(
    //   `Exp: ${moment
    //     .unix(this.props.lockTime)
    //     .format('MMMM Do YYYY, h:mm:ss a')}`
    // )
    // console.log(now, Number(this.props.lockTime))
    // now > Number(this.props.lockTime)
    //   ? console.log('red')
    //   : console.log('green')
    const expirationDate = moment.unix(this.props.lockTime)

    const dataTipTxt = new BigNumber(this.props.lockTime).eq(0)
      ? 'Expired'
      : 'Exp: ' +
        expirationDate.format('YYYY-DD-M, hh:mm:ss a') +
        ', ' +
        expirationDate.fromNow() +
        '.'
    return now > Number(this.props.lockTime) ? (
      <div data-tip={dataTipTxt} data-for="lockBalance">
        <div
          onClick={this.onSetMaxAmount}
          style={{
            textAlign: 'right',
            cursor: 'pointer'
          }}
        >
          <span
            style={{
              color: 'red',
              borderBottom: '1px dotted red',
              textDecoration: 'none'
            }}
          >
            {formatPrice(this.props.balance)}
          </span>
        </div>
        <ReactTooltip effect="solid" place="top" id="lockBalance" />
      </div>
    ) : (
      <div data-tip={dataTipTxt} data-for="lockBalance">
        <div
          onClick={this.onSetMaxAmount}
          style={{
            textAlign: 'right',
            cursor: 'pointer'
          }}
        >
          <span
            style={{
              color: 'green',
              borderBottom: '1px dotted green',
              textDecoration: 'none'
            }}
          >
            {formatPrice(this.props.balance)}
          </span>
        </div>
        <ReactTooltip effect="solid" place="top" id="lockBalance" />
      </div>
    )
  }
}
