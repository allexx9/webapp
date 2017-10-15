// Copyright 2016-2017 Gabriele Rigo

import { api } from '../../parity';
import AccountSelector from '../../AccountSelector';
import { ERRORS, validateAccount, validatePositiveNumber } from '../validation';

import styles from '../actions.module.css';

import BigNumber from 'bignumber.js';
import React, { Component } from 'react';

// React.PropTypes is deprecated since React 15.5.0, use the npm module prop-types instead
import PropTypes from 'prop-types';

import { Dialog, FlatButton, TextField } from 'material-ui';

const NAME_ID = ' ';

export default class ActionDeployGabcoin extends Component {
  static contextTypes = {
    instance: PropTypes.object.isRequired,
    //gabcoinFactory: PropTypes.object
  }

  static propTypes = {
    accounts: PropTypes.array,
    onClose: PropTypes.func,
    //gabcoinFactory: PropTypes.object
  }

  state = {
    account: {},
    accountError: ERRORS.invalidAccount,
  //  amount: 0,
  //  amountError: ERRORS.invalidAmount,
    //gabcoinFactory: GABCOIN_FACTORY,
    //gabcoinFactoryError: null,
    gabcoinName: ' ',
    gabcoinNameError: null,
    gabcoinSymbol: ' ',
    gabcoinSymbolError: null,
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
        title='deploy vaults for a specific account'
        modal open
        className={ styles.dialog }
        actions={ this.renderActions() }>
        { this.renderFields() }
      </Dialog>
    );
  }

  renderActions () {
    const { complete } = this.state;

    if (complete) {
      return (
        <FlatButton
          className={ styles.dlgbtn }
          label='Done'
          primary
          onTouchTap={ this.props.onClose } />
      );
    }

    const { accountError, /*gabcoinFactoryError, */gabcoinNameError, gabcoinSymbolError, sending } = this.state;
    const hasError = !!( accountError || /*gabcoinFactoryError || */gabcoinNameError || gabcoinSymbolError);

    return ([
      <FlatButton
        className={ styles.dlgbtn }
        label='Cancel'
        primary
        onTouchTap={ this.props.onClose } />,
      <FlatButton
        className={ styles.dlgbtn }
        label='Deploy'
        primary
        disabled={ hasError || sending }
        onTouchTap={ this.onSend } />
    ]);
  }

  renderFields () {
    const nameLabel = 'the name of your brand new vault';
    const symbolLabel = 'the symbol of your brand new vault';

    return (
      <div>
        <AccountSelector
          accounts={ this.props.accounts }
          account={ this.state.account }
          errorText={ this.state.accountError }
          floatingLabelText='from account'
          hintText='the account the transaction will be made from'
          onSelect={ this.onChangeAddress } />
        <TextField
          autoComplete='off'
          floatingLabelFixed
          floatingLabelText={ nameLabel }
          fullWidth
          hintText='vault name'
          errorText={ this.state.gabcoinNameError }
          name={ NAME_ID }
          id={ NAME_ID }
          //value={ this.state.gabcoinName }  alt: floatingLabelText
          onChange={ this.onChangeName } />
        <TextField
          autoComplete='off'
          floatingLabelFixed
          floatingLabelText={ symbolLabel }
          fullWidth
          hintText='vault symbol (3 letters)'
          errorText={ this.state.gabcoinSymbolError }
          name={ NAME_ID }
          id={ NAME_ID }
          //value={ this.state.gabcoinSymbol }  alt: floatingLabelText
          onChange={ this.onChangeSymbol } />
      </div>
    );
  }

  onChangeAddress = (account) => {
    this.setState({
      account,
      accountError: validateAccount(account)
    }, this.validateTotal);
  }

  onChangeName = (event, gabcoinName) => {
    this.setState({
      gabcoinName : gabcoinName.toLowerCase(),
      gabcoinNameError: null  //validateNewName(gabcoinName)
    }, this.validateTotal);
  }

  onChangeSymbol = (event, gabcoinSymbol) => {
    this.setState({
      gabcoinSymbol : gabcoinSymbol.toUpperCase(),
      gabcoinSymbolError: null  //validateNewSymbol(gabcoinSymbol)
    });
  }

  validateTotal = () => {
    const { account, accountError, gabcoinName, gabcoinNameError, gabcoinSymbol, gabcoinSymbolError } = this.state;

    if (accountError || gabcoinNameError || gabcoinSymbolError) {
      return;
    }

/*    if (new BigNumber(amount).gt(account.ethBalance.replace(/,/g, ''))) {
      this.setState({
        amountError: ERRORS.invalidTotal
      });
    }
    */
  }
//TODO fix from address and to factory in values, probably set state before

  onSend = () => {
    const { instance } = this.context;
    const gabcoinName = this.state.gabcoinName.toString();
    const gabcoinSymbol = this.state.gabcoinSymbol.toString();
    //const gabcoinFactory = api.util.toChecksumAddress(this.state.gabcoinFactory); //tested
    //const values = [this.state.account.address, MAX_PRICE];
    const values = [gabcoinName, gabcoinSymbol, this.state.account.address];
    const options = {
      from: this.state.account.address
    //,  value: api.util.toWei(this.state.amount).toString()
    };

    this.setState({
      sending: true
    });

    instance.createGabcoin
      .estimateGas(options, values)
      .then((gasEstimate) => {
        options.gas = gasEstimate.mul(1.2).toFixed(0);
        console.log(`deploy: gas estimated as ${gasEstimate.toFixed(0)} setting to ${options.gas}`);

        return instance.createGabcoin.postTransaction(options, values);
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
