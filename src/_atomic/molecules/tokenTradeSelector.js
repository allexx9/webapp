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
    for (var baseToken in this.props.tradableTokens) {
      Object.keys(this.props.tradableTokens[baseToken]).forEach((key) => {
        let quoteToken = this.props.tradableTokens[baseToken][key];
        menu.push(
          <MenuItem key={quoteToken.name}
            value={quoteToken.symbol}
            // primaryText={quoteToken.name + "/" + baseToken}
            primaryText={<ExchangeTokenSelectItem
              quoteTokenName={quoteToken.name}
              baseTokenName={baseToken}
            />
            }
          />
        )
      });
    }
    return menu
  }

  render() {
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
            value={this.props.selectedTradeTokensPair.baseToken.name}
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