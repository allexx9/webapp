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
import styles from './elementFundActionWrapETH.module.css';

import PoolApi from '../../PoolsApi/src'

const NAME_ID = ' ';
const WETH = '0xd0a1e359811322d97991e03f863a0c30c2cf029c'; //Address of WETH contract

const APPROVED_EXCHANGES = ['exchange2', 'exchangenot']; //we have to created a component to inject array into

//TODO: add address exchange

export default class ElementFundActionWrapETH extends Component {

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
    account: this.props.accounts[0],
    accountError: ERRORS.invalidAccount,
    amount: 0,
    amountError: ERRORS.invalidAmount,
    approvedExchange: APPROVED_EXCHANGES,
    exchangeName: {},
    exchangeNameError: null, //ERRORS.invalidAccount,
    exchangeAddress: ' ',
    fundProxyContractAddress: "",
    action: 'wrap',
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
          <ElementDialogHeadTitle primaryText='ETH Wrapper' />
          <ElementDialogAddressTitle tokenDetails={dragoDetails} />
      </div>

    )
  }

  onClose =(event) =>{
    // Calling callback function passed by parent in order to show/hide this dialog
    this.props.openActionForm(event,'wrapETH')
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

    const { amountError, sending } = this.state;
    const hasError = !!( amountError );
    console.log(hasError)

    return ([
      <FlatButton
        key='Cancel'
        label='Cancel'
        name='Cancel'
        primary
        onClick={ this.onClose} />,
      <FlatButton
        key='Deposit'
        label={this.state.action}
        name='Deposit'
        primary
        disabled={ hasError || sending }
        onClick={ this.onSend } />
    ]);
  }

  renderFields () {
    const amountLabel = 'The amount you want to wrap';
    return (
      <div>
        {/* <AccountSelector
          accounts={ this.props.accounts }
          account={ this.state.account }
          errorText={ this.state.accountError }
          floatingLabelText='From account'
          hintText='The account the transaction will be made from'
          onSelect={ this.onChangeAddress } /> */}
        <DropDownMenu
          value={this.state.action}
          onChange={this.onChangeWrap}
          >
          <MenuItem value={'wrap'} primaryText='Wrap ETH' />
          <MenuItem value={'unwrap'} primaryText='Unwrap ETH' />
        </DropDownMenu>
        <TextField
          autoComplete='off'
          floatingLabelFixed
          floatingLabelText='Amount you want to wrap'
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

  onChangeWrap = (event, index, action) => {
    this.setState({
      action
    })
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
    switch(this.state.action) {
      case "wrap":
        this.onSendWrap()
        break
      case "unwrap":
        this.onSendUnwrap()
        break
    } 
  }

  onSendUnwrap = () => {
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
      console.log(poolApi)
      poolApi.contract.fundproxy.init()
      poolApi.contract.fundproxy.unwrapETH(this.state.account.address, api.util.toWei(this.state.amount))
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
      this.props.snackBar('Wrapping awaiting for authorization')
    } else {
      poolApi = new PoolApi(api)
      poolApi.contract.fundproxy.init()
      poolApi.contract.fundproxy.unwrapETH(this.state.account.address, api.util.toWei(this.state.amount))
      .then((result) => {
        console.log(result)
        this.onClose()
        this.props.snackBar('Wrapping awaiting for authorization')
      })
      .catch((error) => {
        console.error('error', error);
        this.setState({
          sending: false
        })
      })
    }
  }

  onSendWrap = () => {
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
      console.log(poolApi)
      poolApi.contract.fundproxy.init()
      poolApi.contract.fundproxy.wrapETH(this.state.account.address, api.util.toWei(this.state.amount))
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
      this.props.snackBar('Wrapping awaiting for authorization')
    } else {
      poolApi = new PoolApi(api)
      poolApi.contract.fundproxy.init()
      poolApi.contract.fundproxy.wrapETH(this.state.account.address, api.util.toWei(this.state.amount))
      .then((result) => {
        console.log(result)
        this.onClose()
        this.props.snackBar('Wrapping awaiting for authorization')
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
