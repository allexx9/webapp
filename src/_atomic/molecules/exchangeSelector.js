// Copyright 2016-2017 Rigo Investment Sagl.

import React, { Component } from 'react';
import { MenuItem, SelectField } from 'material-ui';
import PropTypes from 'prop-types';
import { Row, Col } from 'react-flexbox-grid';
import { 
  RELAYS
 } from '../../_utils/const'
import ExchangeItem from '../atoms/exchangeSelectItem'

export default class ExchangeSelector extends Component {

  static propTypes = {
    selectedRelay: PropTypes.string.isRequired,
    onSelectExchange: PropTypes.func.isRequired
  }

  onSelectExchange = (event, key, payload) => {
    console.log(payload)
    this.props.onSelectExchange(payload)
  }

  renderExchange = () => {
    var menu = []
    Object.keys(RELAYS).forEach(function (key) {
      menu.push(
        <MenuItem key={RELAYS[key].name}
          value={key}
          primaryText={<ExchangeItem exchange={RELAYS[key]}/>} 
        />
      )
    });
    return menu
  }

  render() {
    return (
      <Row>
        <Col xs={12}>
          <SelectField
            fullWidth
            value={this.props.selectedRelay}
            onChange={this.onSelectExchange}
          // style={{height: 90}}
          >
            {this.renderExchange()}
          </SelectField>
        </Col>
      </Row>
    );
  }
}