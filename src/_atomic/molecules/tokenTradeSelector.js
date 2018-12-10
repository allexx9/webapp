// Copyright 2016-2017 Rigo Investment Sagl.

import { Col, Row } from 'react-flexbox-grid'
import { MenuItem, SelectField } from 'material-ui'
import ExchangeTokenSelectItem from '../atoms/exchangeTokenSelectItem'
import PropTypes from 'prop-types'
import React, { PureComponent } from 'react'
import TokenTradeSelectorTitle from '../atoms/tokenTradeSelectorTitle'

// const tradableTokens = ["WETH / ZRX", "WETH / GRG"]

export default class TokenTradeSelector extends PureComponent {
  static propTypes = {
    tradableTokens: PropTypes.object.isRequired,
    selectedTradeTokensPair: PropTypes.object.isRequired,
    onSelectTokenTrade: PropTypes.func.isRequired
  }

  state = {
    selectedQuoteToken: 'USDT'
  }

  selectMessage = 'Please select a token pair.'

  onSelectTokenTrade = (event, key, payload) => {
    if (payload === this.selectMessage) return null
    if (
      payload !==
      this.props.selectedTradeTokensPair.baseToken.symbol +
        '-' +
        this.props.selectedTradeTokensPair.quoteToken.symbol
    ) {
      this.props.onSelectTokenTrade(payload)
    }
  }

  onSelectQuoteToken = token => {
    let selectedQuoteToken
    let tokenSymbol = token.target.id
    switch (tokenSymbol) {
      case 'select-quote-token-ETH':
        selectedQuoteToken = 'ETH'
        break
      case 'select-quote-token-USDT':
        selectedQuoteToken = 'USDT'
        break
      default:
        selectedQuoteToken = 'ETH'
        break
    }
    this.setState({ selectedQuoteToken })
  }

  filterTradableTokens = (tradableTokens, selectedQuoteToken) => {
    return tradableTokens[selectedQuoteToken]
  }

  renderTokens = () => {
    let menu = []
    const { tradableTokens, selectedTradeTokensPair } = this.props
    const { selectedQuoteToken } = this.state
    Object.keys(
      this.filterTradableTokens(tradableTokens, selectedQuoteToken)
    ).forEach(baseToken => {
      console.log(baseToken)
      let baseTokenSymbol = baseToken
      let quoteTokenSymbol = selectedQuoteToken
      menu.push(
        <MenuItem
          key={baseTokenSymbol + '-' + quoteTokenSymbol}
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
    selectedQuoteToken !== selectedTradeTokensPair.quoteToken.symbol
      ? menu.unshift(
          <MenuItem
            key={this.selectMessage}
            value={this.selectMessage}
            primaryText={this.selectMessage}
          />
        )
      : null
    return menu
  }

  render() {
    const { selectedTradeTokensPair } = this.props
    const { selectedQuoteToken } = this.state
    const value =
      selectedQuoteToken === selectedTradeTokensPair.quoteToken.symbol
        ? selectedTradeTokensPair.baseToken.symbol +
          '-' +
          selectedTradeTokensPair.quoteToken.symbol
        : this.selectMessage
    return (
      <Row>
        <Col xs={12}>
          <TokenTradeSelectorTitle
            onClick={this.onSelectQuoteToken}
            selectedToken={selectedQuoteToken}
          />
        </Col>
        <Col xs={12}>
          <div>
            <SelectField
              fullWidth
              value={value}
              onChange={this.onSelectTokenTrade}
            >
              {this.renderTokens()}
            </SelectField>
          </div>
        </Col>
      </Row>
    )
  }
}
