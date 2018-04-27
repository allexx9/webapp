// Copyright 2016-2017 Rigo Investment Sarl.

import styles from './tokenTradeSelector.module.css';
import React, { Component } from 'react';
import { MenuItem, SelectField } from 'material-ui';
import PropTypes from 'prop-types';
import { Row, Col } from 'react-flexbox-grid';

// const tradableTokens = ["WETH / ZRX", "WETH / GRG"]

const tradableTokens = {
  WETH: {
    OMG: "OMG",
    ZRX: "ZRX"
  }
}
  


export default class TokenTradeSelector extends Component {
  static propTypes = {
    onSelectTokenTrade: PropTypes.func,
  }

  state = {
    value: "ZRX",
  };



  onSelectTokenTrade = (event, key, payload) => {
    this.setState({
      value: payload
    })
    this.props.onSelectTokenTrade(payload)
  }

  renderTokens = () =>{
    var menu =[]
    for (var baseToken in tradableTokens) {
      console.log(baseToken, tradableTokens[baseToken]);
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
            value={this.state.value}
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