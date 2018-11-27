// Copyright 2016-2017 Rigo Investment Sagl.

import { Col, Row } from 'react-flexbox-grid'
import { MenuItem, SelectField } from 'material-ui'
import ExchangeTokenSelectItem from '../atoms/exchangeTokenSelectItem'
import PropTypes from 'prop-types'
import React, { PureComponent } from 'react'
import styles from './tokenTradeSelector.module.css'

// const tradableTokens = ["WETH / ZRX", "WETH / GRG"]

export default class TokenTradeSelector extends PureComponent {
  static propTypes = {
    tradableTokens: PropTypes.object.isRequired,
    selectedTradeTokensPair: PropTypes.object.isRequired,
    onSelectTokenTrade: PropTypes.func.isRequired
  }

  onSelectTokenTrade = (event, key, payload) => {
    console.log(payload)
    if (
      payload !==
      this.props.selectedTradeTokensPair.baseToken.symbol +
        '-' +
        this.props.selectedTradeTokensPair.quoteToken.symbol
    ) {
      this.props.onSelectTokenTrade(payload)
    }
  }

  renderTokens = () => {
    let menu = []
    for (let quoteToken in this.props.tradableTokens) {
      Object.keys(this.props.tradableTokens[quoteToken]).forEach(baseToken => {
        let baseTokenSymbol = this.props.tradableTokens[quoteToken][baseToken]
          .symbol
        let quoteTokenSymbol = quoteToken
        menu.push(
          <MenuItem
            key={baseTokenSymbol}
            value={baseTokenSymbol + '-' + quoteTokenSymbol}
            primaryText={
              <ExchangeTokenSelectItem
                baseTokenSymbol={baseTokenSymbol}
                quoteTokenSymbol={quoteTokenSymbol}
              />
            }
          />
        )
      })
    }
    return menu
  }

  render() {
    // console.log(this.props.selectedTradeTokensPair)

    return (
      <Row>
        <Col xs={12}>
          <div className={styles.sectionTitle}>Trading pairs</div>
        </Col>
        <Col xs={12}>
          <SelectField
            fullWidth
            value={
              this.props.selectedTradeTokensPair.baseToken.symbol +
              '-' +
              this.props.selectedTradeTokensPair.quoteToken.symbol
            }
            onChange={this.onSelectTokenTrade}
          >
            {this.renderTokens()}
          </SelectField>
        </Col>
      </Row>
    )
  }
}
