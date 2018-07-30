// Copyright 2016-2017 Rigo Investment Sagl.

import styles from './tokenTradeSelector.module.css';
import React, { Component } from 'react';
import { MenuItem, SelectField } from 'material-ui';
import PropTypes from 'prop-types';
import { Row, Col } from 'react-flexbox-grid';

export default class ExchangeSelector extends Component {
  static propTypes = {
    selectedTradeTokensPair: PropTypes.object.isRequired,
    onSelectTokenTrade: PropTypes.func.isRequired
  }

  onSelectExchange = (event, key, payload) => {
    this.props.onSelectTokenTrade(payload)
  }

  renderExchange = () =>{
    var menu =[]
    for (var baseToken in tradableTokens) {
      Object.keys(tradableTokens[baseToken]).forEach(function (key) {
        let quoteToken = tradableTokens[baseToken][key];
        menu.push(
          <MenuItem key={quoteToken} 
            value={quoteToken} 
            primaryText={quoteToken+"/"+baseToken} 
          />  
        )
      });
    }
    return menu
  }

  render () {
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
            {this.renderExchange()}
          </SelectField>
        </Col>
      </Row>
    );
  }
}