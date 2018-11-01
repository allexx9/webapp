// Copyright 2016-2017 Rigo Investment Sagl.

import { formatPrice } from '../../_utils/format'
import PropTypes from 'prop-types'
import React, { Component } from 'react'
import ReactTooltip from 'react-tooltip'
import moment from 'moment'

export default class TokenLockBalance extends Component {
  static propTypes = {
    balance: PropTypes.string.isRequired,
    lockTime: PropTypes.string.isRequired
  }

  static defaultProps = {
    balance: 0,
    lockTime: '0'
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

    return now > Number(this.props.lockTime) ? (
      <div
        data-tip={
          'Exp: ' +
          moment.unix(this.props.lockTime).format('MMMM Do YYYY, h:mm:ss a')
        }
      >
        <div
          style={{
            textAlign: 'right'
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
        <ReactTooltip effect="solid" place="top" />
      </div>
    ) : (
      <div
        data-tip={
          'Exp: ' +
          moment.unix(this.props.lockTime).format('MMMM Do YYYY, h:mm:ss a')
        }
      >
        <div
          style={{
            textAlign: 'right'
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
        <ReactTooltip effect="solid" place="top" />
      </div>
    )
  }
}
