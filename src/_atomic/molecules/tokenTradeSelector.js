// Copyright 2016-2017 Rigo Investment Sagl.

import styles from './tokenTradeSelector.module.css';
import React, { Component } from 'react';
import { MenuItem, SelectField } from 'material-ui';
import PropTypes from 'prop-types';
import { Row, Col } from 'react-flexbox-grid';
import ExchangeTokenSelectItem from '../atoms/exchangeTokenSelectItem'

// const tradableTokens = ["WETH / ZRX", "WETH / GRG"]


export default class TokenTradeSelector extends Component {
  static propTypes = {
    tradableTokens: PropTypes.object.isRequired,
    selectedTradeTokensPair: PropTypes.object.isRequired,
    onSelectTokenTrade: PropTypes.func.isRequired
  }

  onSelectTokenTrade = (event, key, payload) => {
    // console.log(payload)
    this.props.onSelectTokenTrade(payload)
  }

  renderTokens = () => {
    var menu = []
    for (var quoteToken in this.props.tradableTokens) {
      Object.keys(this.props.tradableTokens[quoteToken]).forEach((baseToken) => {
        let baseTokenSymbol = this.props.tradableTokens[quoteToken][baseToken].symbol;
        let quoteTokenSymbol = quoteToken;
        console.log(baseTokenSymbol)
        menu.push(
          <MenuItem key={baseTokenSymbol}
            value={baseTokenSymbol}
            // primaryText={quoteToken.name + "/" + baseToken}
            primaryText={<ExchangeTokenSelectItem
              baseTokenSymbol={baseTokenSymbol}
              quoteTokenSymbol={quoteTokenSymbol}
            />
            }
          />
        )
      });
    }
    return menu
  }

  render() {
    console.log(this.props.selectedTradeTokensPair.baseToken.symbol)
    return (
      <Row>
        <Col xs={12}>
          <div className={styles.sectionTitle}>
            Trading pairs
        </div>
        </Col>
        <Col xs={12}>
          <SelectField
            fullWidth
            value={this.props.selectedTradeTokensPair.baseToken.symbol}
            onChange={this.onSelectTokenTrade}
          // style={{height: 90}}
          >
            {this.renderTokens()}
          </SelectField>
        </Col>
      </Row>
    );
  }
}