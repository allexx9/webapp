// Copyright 2016-2017 Gabriele Rigo

import * as abis from '../../contracts';

// import { api } from '../../parity';
import AccountSelector from '../../AccountSelector';
import { ERRORS, validateAccount, validatePositiveNumber } from '../validation';

import styles from '../actions.module.css';

import BigNumber from 'bignumber.js';
import React, { Component } from 'react';

// React.PropTypes is deprecated since React 15.5.0, use the npm module prop-types instead
import PropTypes from 'prop-types';

import { Dialog, FlatButton, TextField } from 'material-ui';

const DIVISOR = 10 ** 6;  //dragos are divisible by 1 million
const NAME_ID = ' ';

export default class ActionSellDrago extends Component {
  static contextTypes = {
    api: PropTypes.object
    //instance: PropTypes.object.isRequired
    //contract: PropTypes.object, //contract and instance are selected manually
    //instance: PropTypes.object,
  }

  static propTypes = {
    accounts: PropTypes.array,
    //price: PropTypes.object,
    onClose: PropTypes.func
  }

  state = {
    account: {},
    accountError: ERRORS.invalidAccount,
    complete: false,
    sending: false,
    amount: 0,
    amountError: ERRORS.invalidAmount,
    dragoName: ' ',
    dragoNameError: null,
    dragoSymbol: ' ',
    dragoSymbolError: null,
    contract: ' ',
    contractError: null, //check for contract or instance ERRORS
    instance: ' ',
    instanceError: null,
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

    const { accountError, amountError, dragoNameError, dragoSymbolError, dragoError } = this.state;
    const hasError = !!(this.state.amountError || this.state.accountError || this.state.dragoNameError || this.state.dragoSymbolError || this.state.dragoError);

    return ([
      <FlatButton
        className={ styles.dlgbtn }
        label='Cancel'
        primary
        onTouchTap={ this.props.onClose } />,
      <FlatButton
        className={ styles.dlgbtn }
        label='SellDrago'
        primary
        disabled={ hasError || this.state.sending }
        onTouchTap={ this.onSend } />
    ]);
  }

  renderFields () {
    const dragoNameLabel ='search your target drago';
    const dragoSymbolLabel ='let us avoid typos!';
    const amountLabel ='how many dragos to sell';
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
          onSelect={ this.onChangeAccount } />
        <TextField
          autoComplete='off'
          floatingLabelFixed
          floatingLabelText={ dragoNameLabel }
          fullWidth
          hintText='the name of the drago you are looking for'
          errorText={ this.state.dragoNameError }
          name={ NAME_ID }
          id={ NAME_ID }
          //value={ this.state.amount } alt: floatingLabelText
          onChange={ this.onChangeDragoName } />
        <TextField
          autoComplete='off'
          floatingLabelFixed
          floatingLabelText={ dragoSymbolLabel }
          fullWidth
          hintText='the symbol of the drago you are looking for'
          errorText={ this.state.dragoSymbolError }
          name={ NAME_ID }
          id={ NAME_ID }
          //value={ this.state.amount } alt: floatingLabelText
          onChange={ this.onChangeDragoSymbol } />
        <TextField
          autoComplete='off'
          floatingLabelFixed
          floatingLabelText='number of coins'
          fullWidth
          hintText='the number of coins to exchange for ETH'
          errorText={ this.state.amountError }
          name={ NAME_ID }
          id={ NAME_ID }
          value={ this.state.amount }
          onChange={ this.onChangeAmount } />
      </div>
    );
  }

  onChangeAccount = (account) => {
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

  onChangeDragoName = (event, dragoName) => {
    this.setState({
      dragoName,
      dragoNameError: null //validateAccount(dragoAddress) //create validateContract(dragoAddress)
    }, this.onFindDragoAddress);
  }

  onChangeDragoSymbol = (event, dragoSymbol) => {
    this.setState({
      dragoSymbol,
      dragoSymbolError: null //validateAccount(dragoAddress) //create validateContract(dragoAddress)
    }, this.onFindDragoAddress);
  }

  onFindDragoAddress = () => {
    const { api } = this.context;
    api.parity
      .registryAddress()
      .then((registryAddress) => {
        console.log(`the registry was found at ${registryAddress}`);

        const registry = api.newContract(abis.registry, registryAddress).instance;

        return Promise.all([
            registry.getAddress.call({}, [api.util.sha3('dragoregistry'), 'A'])
        ]);
      })
      .then((address) => {
        console.log(`the drago registry was found at ${address}`);

        const dragoRegistry = api.newContract(abis.dragoregistry, address).instance;

        return Promise.all([
            //dragoRegistry.fromName.call({}, ['martinuz'.toString()]) //this function would return
                    //an object with comma separated values and react cannot split [1], the second value
                    // then(([id, dragoAddress, dragoSymbol, dragoID, dragoOwner, dragoGroup]) => {})
                    //https://www.npmjs.com/package/comma-separated-values might help for getting groups
                    //for now implemented in solidity and added extra security as performs symbol check!
            //dragoRegistry.fromNameSymbol.call({}, ['firstdrago'.toString(), 'fst'.toString()])
            dragoRegistry.fromNameSymbol.call({}, [this.state.dragoName.toString(), this.state.dragoSymbol.toString()])
        ])
        .then((dragoAddress) => {

          console.log(`length of object array ${dragoAddress.length}`)

          const drago = api.newContract(abis.drago, dragoAddress);

          this.setState({
            dragoAddress,
            drago,
            instance : drago.instance
          })

          console.log(`your target drago was found at ${dragoAddress}`);
        });
      });
  }

  validateTotal = () => {
    const { account, accountError, amount, amountError, dragoName, dragoNameError, dragoSymbolError } = this.state;

    if (accountError || amountError || dragoNameError || dragoSymbolError) {
      return;
    }

    if (new BigNumber(amount).gt(account.ethBalance.replace(/,/g, ''))) {
      this.setState({
        amountError: ERRORS.invalidTotal
      });
    }
  }

  onSend = () => {
    const { api } = this.context;
    //const { instance } = this.context;
    const instance = this.state.instance;

    //const dragoAddress = api.util.toChecksumAddress(this.state.dragoAddress);
    //const price = api.util.toWei(this.state.price);
    const amount = new BigNumber(this.state.amount).mul(DIVISOR);
    const values = [amount.toFixed(0)]; //[dragoAddress.toString(), amount.toFixed(0)]; in new version direct trade wth instance
    const options = {
      from: this.state.account.address
    };

    this.setState({
      sending: true
    });

    instance.sellDrago
      .estimateGas(options, values)
      .then((gasEstimate) => {
        options.gas = gasEstimate.mul(1.2).toFixed(0);  //problem with estimate cause of blank before dragoAddress
        console.log(`sell: gas estimated as ${gasEstimate.toFixed(0)} setting to ${options.gas}`);

        return instance.sellDrago.postTransaction(options, values);
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
