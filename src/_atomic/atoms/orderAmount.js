// Copyright 2016-2017 Rigo Investment Sagl.

import styles from './orderAmount.module.css';
import { Row, Col } from 'react-flexbox-grid';
import { TextField } from 'material-ui';
import React, { Component} from 'react';
import PropTypes from 'prop-types';
import BigNumber from 'bignumber.js';

export default class OrderAmount extends Component {

  static propTypes = {
    orderFillAmount: PropTypes.string.isRequired,
    orderMaxAmount: PropTypes.number.isRequired,
    symbol: PropTypes.string.isRequired,
    onChangeAmount: PropTypes.func,
    disabled: PropTypes.bool,
    checkMaxAmount: PropTypes.bool.isRequired
  }

  static defaultProps = {
    disabled: false
  }

  static contextTypes = {
    api: PropTypes.object.isRequired
  }

  state = {
    amountError: ''
  }

  onChangeAmount = (event) =>{
    // Checking valid positive number
    console.log(event.target.value)
    try {
      if(!new BigNumber(event.target.value).gt(0)) {
        this.setState({
          amountError: 'Please enter a valid positive number',
        });
        this.error = true
        this.props.onChangeAmount(event.target.value, true)
        return
      } else {
      this.setState({
        amountError: '',
      });
    }
    }
    catch (error) {
      this.setState({
        amountError: 'Please enter a valid positive number',
      });
      this.error = true
      this.props.onChangeAmount(event.target.value, true)
      return
    }
    if (new BigNumber(event.target.value).gt(this.props.orderMaxAmount) && this.props.checkMaxAmount) {
      this.setState({
        amountError: 'Value exceeds available order amount',
      });
      this.props.onChangeAmount(event.target.value, true)
      return
    }

    this.props.onChangeAmount(event.target.value, false)
  }

  render () {
    const { symbol, orderFillAmount } = this.props
    // const amount = Math.min(orderFillAmount, orderMaxAmount)
    // console.log(orderFillAmount)
    return (
      <Row bottom="xs">
        <Col xs={12} >
          <TextField
            key='orderAmount'
            autoComplete='off'
            floatingLabelFixed
            floatingLabelText='Amount'
            fullWidth
            errorText={this.state.amountError}
            name='orderAmount'
            id='orderAmount'
            value={orderFillAmount}
            onChange={this.onChangeAmount}
            disabled={this.props.disabled}
            />
        </Col>
      </Row>
    );
  }
}