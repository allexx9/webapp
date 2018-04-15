// Copyright 2016-2017 Rigo Investment Sarl.

import SelectFundItem from '../molecules/selectFundItem.js';
import React, { Component } from 'react';
import { MenuItem, SelectField } from 'material-ui';
import PropTypes from 'prop-types';

export default class FundSelector extends Component {
  static propTypes = {
    funds: PropTypes.object.isRequired,
    onSelectFund: PropTypes.func,
  }

  state = {
    value: 0,
  };

  onSelect = (event, key) => {
    console.log(key)
    var tokens = {
      0: 'ETH',
      1: 'GRG'
    };
    this.setState({
      value: key
    });
    this.props.onSelectFund(tokens[key])
  }

  renderFunds = () =>{
    const { funds } = this.props
    funds.map((fund,key) =>{
      return (
      <MenuItem key={key} value={key} primaryText={<SelectFundItem fund={fund} />} />
    )
    })
  }

  render () {
    return (
      <div>
        <SelectField
          floatingLabelText="Type of token transfer"
          fullWidth
          value={this.state.value}
          onChange={this.onSelect}
          style={{height: 90}}
        >
        {this.renderFunds()}
        </SelectField>

      </div>
    );
  }


}