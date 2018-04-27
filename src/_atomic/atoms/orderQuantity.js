// Copyright 2016-2017 Rigo Investment Sarl.

import styles from './tokenLiquidity.module.css';
import { Row, Col } from 'react-flexbox-grid';
import { TextField } from 'material-ui';
import React, { Component} from 'react';
import PropTypes from 'prop-types';
// import BigNumber from 'bignumber.js';
import { formatEth } from '../../_utils/format'

export default class OrderQuantity extends Component {

  static propTypes = {
    quantity: PropTypes.string,
    // onChangeQuantity: PropTypes.func.isRequired,
  }

  static defaultProps = {
    quantity: 0,
    // onChangeQuantity: PropTypes.func.isRequired,
  }

  static contextTypes = {
    api: PropTypes.object.isRequired
  }

  state = {
    quantityError: ''
  }

  render () {
    const { quantity } = this.props
    const { api } = this.context
    console.log(quantity)
    return (
      <Row>
        <Col xs={10}>
          <TextField
            key='tokenQuantity'
            autoComplete='off'
            floatingLabelFixed
            floatingLabelText='Order quantity'
            fullWidth
            errorText={this.state.quantityError}
            name='tokenQuantity'
            id='tokenQuantity'
            value={formatEth(quantity, 4, api)}
            onChange={this.onChangeQuantity} />
        </Col>
        <Col xs={2}>
          XYZ
        </Col>
      </Row>
    );
  }
}