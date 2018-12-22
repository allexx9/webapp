import PropTypes from 'prop-types'
import React, { Component } from 'react'
import styles from './poolCode.module.css'
import utils from '../../_utils/utils'

export default class PoolCode extends Component {
  static propTypes = {
    symbol: PropTypes.string.isRequired,
    id: PropTypes.string.isRequired
  }

  render() {
    const { symbol, id } = this.props
    let isinArray = utils.poolISIN(symbol, id, { array: true })
    let code = (
      <div>
        <span className={styles.first}>{isinArray[0]}</span>
        <span className={styles.second}>{isinArray[1]}</span>
        <span className={styles.third}>{isinArray[2]}</span>
        <span className={styles.fourth}>{isinArray[3]}</span>
      </div>
    )

    return <div>{code}</div>
  }
}
