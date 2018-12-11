// Copyright 2016-2017 Rigo Investment Sagl.

import IdentityIcon from '../atoms/identityIcon'
import React, { Component } from 'react'

import styles from './selectFundItem.module.css'

import PropTypes from 'prop-types'

export default class SelectFundItem extends Component {
  static propTypes = {
    fund: PropTypes.object.isRequired
  }

  render() {
    const { fund } = this.props
    return (
      <div className={styles.logo}>
        <div className={styles.image}>
          <div>
            <IdentityIcon address={fund.address} size={8} />
          </div>
        </div>
        <div className={styles.details}>
          <div className={styles.symbol}>{fund.symbol}</div>
          <div className={styles.name}>{fund.name}</div>
        </div>
        <div>
          <div className={styles.address}>{fund.address}</div>
        </div>
      </div>
    )
  }
}
