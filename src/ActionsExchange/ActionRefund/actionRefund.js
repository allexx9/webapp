// Copyright 2016-2017 Gabriele Rigo

// import { api } from '../../parity';
import AccountSelector from '../../AccountSelector';
import { ERRORS, validateAccount, validatePositiveNumber } from '../validation';

import styles from '../actions.module.css';

import BigNumber from 'bignumber.js';
import React, { Component } from 'react';

// React.PropTypes is deprecated since React 15.5.0, use the npm module prop-types instead
import PropTypes from 'prop-types';

import { Dialog, FlatButton, TextField } from 'material-ui';

const DIVISOR = 10 ** 4;  //dragos are divisible * 10^4, can be used to visualize 1ETH=1DRAGO
const NAME_ID = ' ';

export default class ActionRefund extends Component {
  static contextTypes = {
    instance: PropTypes.object.isRequired
    api: PropTypes.object
  }

  static propTypes = {
    accounts: PropTypes.array,
    price: PropTypes.object,
    onClose: PropTypes.func
  }

  state = {
    account: {},
    accountError: ERRORS.invalidAccount,
    complete: false,
    sending: false,
    amount: 0,
    amountError: ERRORS.invalidAmount,
    dragoAddress: ' ',
    dragoAddressError: null, //this has to be checked later
    //price: api.util.fromWei(this.props.price).toString(),
    //priceError: null
    sending: false,
    complete: false
  }

  render () {
    const { complete } = this.state;

    if (complete) {
      return null;
    }

    return (
      <Dialog
        title='sell your dragos for ETH'
        modal open
        className={ styles.dialog }
        actions={ this.renderActions() }>
        { this.renderFields() }
      </Dialog>
    );
  }

  renderActions () {
    if (this.state.complete) {
      return (
        <FlatButton
          className={ styles.dlgbtn }
          label='Done'
          primary
          onTouchTap={ this.props.onClose } />
      );
    }

//    const hasError = !!(this.state.dragoAddressError || this.state.amountError || this.state.accountError);

    const { accountError, amountError, dragoAddressError, sending } = this.state;
    const hasError = !!(amountError || accountError || dragoAddressError);

    return ([
      <FlatButton
        className={ styles.dlgbtn }
        label='Cancel'
        primary
        onTouchTap={ this.props.onClose } />,
      <FlatButton
        className={ styles.dlgbtn }
        label='Refund'
        primary
        disabled={ hasError || this.state.sending }
        onTouchTap={ this.onSend } />
    ]);
  }

  renderFields () {
    const dragoAddress = 'address of target drago';
    //const priceLabel = `price in ETH (current ${api.util.fromWei(this.props.price).toFormat(3)})`;

    return (
      <div>
        <AccountSelector
          //gabBalance
          accounts={ this.props.accounts }
          account={ this.state.account }
          errorText={ this.state.accountError }
          floatingLabelText='from account'
          hintText='the account the transaction will be made from'
          onSelect={ this.onChangeAddress } />
        <TextField
          autoComplete='off'
          floatingLabelFixed
          floatingLabelText= 'which drago are you selling?' //{ priceLabel }
          fullWidth
          hintText='the address of the drago you want to withdraw'
          errorText={ this.state.dragoAddressError }
          name={ NAME_ID }
          id={ NAME_ID }
          //value={ this.state.dragoAddress } alt: floatingLabelText
          onChange={ this.onChangeDragoAddress } />
        <TextField
          autoComplete='off'
          floatingLabelFixed
          floatingLabelText='number of coins'
          fullWidth
          hintText='the number of coins to exchange for an ETH refund'
          errorText={ this.state.amountError }
          name={ NAME_ID }
          id={ NAME_ID }
          value={ this.state.amount }
          onChange={ this.onChangeAmount } />
      </div>
    );
  }

  onChangeAddress = (account) => {
	const { api } = this.context;
    this.setState({
      account,
      accountError: validateAccount(account,api)
    });
  }

  onChangeAmount = (event, amount) => {
    this.setState({
      amount,
      amountError: validatePositiveNumber(amount)
    });
  }

  onChangeDragoAddress = (event, dragoAddress) => {
    this.setState({
      dragoAddress,
      dragoAddressError: validatePositiveNumber(dragoAddress)
    });
  }

  onSend = () => {
    const { instance } = this.context;
    const dragoAddress = api.util.toChecksumAddress(this.state.dragoAddress);
    //const price = api.util.toWei(this.state.price);
    const amount = new BigNumber(this.state.amount)/*.mul(DIVISOR)*/;
    const values = [dragoAddress.toString(), amount.toFixed(0)];
    const options = {
      from: this.state.account.address
    };

    this.setState({
      sending: true
    });

    instance.sellDragoo
      .estimateGas(options, values)
      .then((gasEstimate) => {
        options.gas = gasEstimate.mul(1.2).toFixed(0);  //problem with estimate cause of blank before dragoAddress
        console.log(`refund: gas estimated as ${gasEstimate.toFixed(0)} setting to ${options.gas}`);

        return instance.sellDragoo.postTransaction(options, values);
      })
      .then(() => {
        this.props.onClose();
        this.setState({
          sending: false,
          complete: true
        });
      })
      .catch((error) => {
        console.error('error', error);
        this.setState({
          sending: false
        });
      });
  }
}
