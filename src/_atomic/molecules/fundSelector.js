// Copyright 2016-2017 Rigo Investment Sagl.

import { Col, Row } from 'react-flexbox-grid'
import { MenuItem, SelectField } from 'material-ui'
import PropTypes from 'prop-types'
import React, { PureComponent } from 'react'
import SelectFundItem from './selectFundItem.js'
import styles from './fundSelector.module.css'

export default class FundSelector extends PureComponent {
  static propTypes = {
    funds: PropTypes.array.isRequired,
    onSelectFund: PropTypes.func.isRequired,
    selectedFund: PropTypes.object.isRequired,
    networkInfo: PropTypes.object.isRequired
  }

  state = {
    value: 0
  }

  onSelectFund = (event, key) => {
    const { funds } = this.props
    if (funds.length === 0) return
    if (this.props.selectedFund.details.dragoId !== key) {
      this.setState({
        value: key
      })
      this.props.onSelectFund(funds[key.toString()])
    }
  }

  renderFunds = () => {
    const { funds } = this.props
    if (funds.length === 0) {
      return (
        <MenuItem
          key={'noFundsSelector'}
          primaryText={'Please create a fund to start trading.'}
        />
      )
    }
    return funds.map(fund => {
      return (
        <MenuItem
          key={fund.dragoId}
          value={fund.dragoId}
          primaryText={<SelectFundItem fund={fund} />}
        />
      )
    })
  }

  render() {
    const { address, dragoId } = this.props.selectedFund.details
    const { networkInfo } = this.props
    return (
      <Row>
        <Col xs={12}>
          <div className={styles.sectionTitle}>
            <div className={styles.address}>
              {' '}
              <a
                href={`${networkInfo.etherscan}address/${address}`}
                rel="noopener noreferrer"
                target="_blank"
              >
                {address}
              </a>
            </div>
          </div>
        </Col>
        <Col xs={12}>
          <SelectField
            fullWidth
            value={dragoId}
            onChange={this.onSelectFund}
            // style={{height: 90}}
          >
            {this.renderFunds()}
          </SelectField>
        </Col>
      </Row>
    )
  }
}
