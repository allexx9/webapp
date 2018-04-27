// Copyright 2016-2017 Rigo Investment Sarl.

import { Dialog, FlatButton, TextField } from 'material-ui';
import BigNumber from 'bignumber.js';
import DropDownMenu from 'material-ui/DropDownMenu';
import MenuItem from 'material-ui/MenuItem';
import PropTypes from 'prop-types';
import React, { Component } from 'react';
import { ERRORS, validateAccount, validatePositiveNumber } from '../../_utils/validation';
import AccountSelector from '../../Elements/elementAccountSelector';
import ElementDialogHeadTitle from '../../Elements/elementDialogHeadTitle'
import ElementDialogAddressTitle from '../../Elements/elementDialogAddressTitle'
import styles from './elementFundActionDeposit.module.css';

import PoolApi from '../../PoolsApi/src'

const NAME_ID = ' ';
const WETH = '0xd0a1e359811322d97991e03f863a0c30c2cf029c'; //Address of WETH contract

const APPROVED_EXCHANGES = ['exchange2', 'exchangenot']; //we have to created a component to inject array into

//TODO: add address exchange

export default class ElementFundActionDeposit extends Component {

  static contextTypes = {
    api: PropTypes.object.isRequired,
  };

  static propTypes = {
    accounts: PropTypes.array.isRequired,
    dragoDetails: PropTypes.object.isRequired,
    openActionForm: PropTypes.func.isRequired,
    snackBar: PropTypes.func
  }

  state = {
    account: {},
    accountError: ERRORS.invalidAccount,
    amount: 0,
    amountError: ERRORS.invalidAmount,
    approvedExchange: APPROVED_EXCHANGES,
    exchangeName: {},
    exchangeNameError: null, //ERRORS.invalidAccount,
    exchangeAddress: ' ',
    value: 'default',
    sending: false,
    complete: false
  }

  buttonsStyle = {
    marginTop: 12,
    marginBottom: 12,
    color: 'white',
  }

  render () {
    const { complete } = this.state;

    if (complete) {
      return null;
    }

    const titleStyle = {
      padding: 0,
      lineHeight: '20px',
      fontSize: 16
    }

    return (
      <Dialog
        title={this.renderHeader()}
        titleStyle={titleStyle}
        modal 
        open={true}
        actions={ this.renderActions() }>
        { this.renderFields() }
      </Dialog>
    );
  }

  renderHeader = () => {
    const { dragoDetails } = this.props
    return (
      <div>
          <ElementDialogHeadTitle primaryText='Deposit to the exchange' />
          <ElementDialogAddressTitle tokenDetails={dragoDetails} />
      </div>

    )
  }

  onClose =(event) =>{
    // Calling callback function passed by parent in order to show/hide this dialog
    this.props.openActionForm(event,'deposit')
  }

  renderActions () {
    const { complete } = this.state;

    if (complete) {
      return (
        <FlatButton
          label='Done'
          primary
          onClick={ this.props.onClose } />
      );
    }

    const { accountError, amountError, exchangeNameError, sending } = this.state;
    const hasError = !!(amountError || accountError || exchangeNameError);

    return ([
      <FlatButton
        key='Cancel'
        label='Cancel'
        name='Cancel'
        primary
        onClick={ this.onClose} />,
      <FlatButton
        key='Deposit'
        label='Deposit'
        name='Deposit'
        primary
        disabled={ hasError || sending }
        onClick={ this.onSend } />
    ]);
  }

  renderFields () {
    const amountLabel = 'The amount you want to deposit';

    return (
      <div>
        <AccountSelector
          accounts={ this.props.accounts }
          account={ this.state.account }
          errorText={ this.state.accountError }
          floatingLabelText='From account'
          hintText='The account the transaction will be made from'
          onSelect={ this.onChangeAddress } />
        <DropDownMenu
          value={'0XExchange'}
          // onChange={this.onChangeExchange}
          >
          <MenuItem value={'default'} primaryText='Select the exchange from the list' />
          {/* <MenuItem value={'exchange2'} primaryText='CFD Exchange' /> */}
          <MenuItem value={'0XExchange'} primaryText='0XExchange' />
        </DropDownMenu>
        <TextField
          autoComplete='off'
          floatingLabelFixed
          floatingLabelText='Amount you want to deposit'
          fullWidth
          hintText={ amountLabel }
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
    }, this.validateTotal);
  }

  onChangeExchange = (event, index, value) => {
    this.setState({
      value,
      exchangeName: value,
      exchangeNameError: null
    }, this.onFindExchange);
  }

  onChangeAmount = (event, amount) => {
    this.setState({
      amount,
      amountError: validatePositiveNumber(amount)
    }, this.validateTotal);
  }

  // onFindExchange = () => {
  //   const { dragoDetails } = this.props
  //   const { api } = this.context;
  //   var poolApi = new PoolApi(api)
  //   poolApi.contract.exchange.init()
  //   .then(() =>{
  //     return poolApi.contract.exchange.balanceOf(ADDRESS_0, dragoDetails.address.toString())
  //   })
  //   .then ((balanceExchange) =>{
  //     console.log(balanceExchange)
  //     this.setState({
  //       loading: false,
  //       balanceExchange,
  //       exchangeAddress: poolApi.contract.exchange._contract._address
  //     });
  //   })
  // }

  validateTotal = () => {
    const { account, accountError, amount, amountError } = this.state;

    if (accountError || amountError) {
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
    const { dragoDetails } = this.props
    // const { instance } = this.context;
    var poolApi = null;
    this.setState({
      sending: true
    });
    if(this.state.account.source === 'MetaMask') {
      const web3 = window.web3
      poolApi = new PoolApi(web3)
      poolApi.contract.drago.init(dragoDetails.address)
      poolApi.contract.drago.depositToExchange(this.state.account.address, WETH, 
                                                api.util.toWei(this.state.amount).toString())
      .then ((result) =>{
        console.log(result)
        this.setState({
          sending: false
        });
      })
      .catch((error) => {
        console.error('error', error)
        this.setState({
          sending: false
        })
      })
      this.onClose()
      this.props.snackBar('Deposit awaiting for authorization')
    } else {
      poolApi = new PoolApi(api)
      poolApi.contract.drago.init(dragoDetails.address)
      poolApi.contract.drago.depositToExchange(this.state.account.address, WETH, 
        api.util.toWei(this.state.amount).toString())
      .then((result) => {
        console.log(result)
        this.onClose()
        this.props.snackBar('Deposit awaiting for authorization')
      })
      .catch((error) => {
        console.error('error', error);
        this.setState({
          sending: false
        })
      })
    }
  }
}
