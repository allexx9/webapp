// Copyright 2016-2017 Rigo Investment Sarl.

import { Dialog, FlatButton, TextField } from 'material-ui';
import BigNumber from 'bignumber.js';
import PropTypes from 'prop-types';
import React, { Component } from 'react';
import { ERRORS, validatePositiveNumber, validateAddress } from '../_utils/validation';
import TokenSelector from '../_atomic/molecules/tokenSelector';
import ElementDialogHeadTitle from './elementDialogHeadTitle'
import ElementDialogAddressTitle from './elementDialogAddressTitle'
import PoolsApi from '../PoolsApi/src'
import { connect } from 'react-redux';
import {ETH, GRG} from '../_utils/const'
import ElementFundActionAuthorization from '../Elements/elementActionAuthorization'

const NAME_ID = ' ';

function mapStateToProps(state) {
  return state
}

class ElementAccountActionTransfer extends Component {

  static contextTypes = {
    api: PropTypes.object.isRequired,
  };

  static propTypes = {
    account: PropTypes.object.isRequired,
    open: PropTypes.bool.isRequired,
    snackBar: PropTypes.func,
    dispatch: PropTypes.func,
    onTransferOpen: PropTypes.func.isRequired
  }

  state = {
    amount: 1,
    amountError: ERRORS.invalidAmount,
    // amountError: '',
    // toAddress: '0x00791547B03F5541971B199a2d347446eB8Dc9bE',
    toAddress: '',
    toAddressError: ERRORS.toAddressError,
    // toAddressError: '',
    value: 'default',
    sending: false,
    complete: false,
    token: ETH
  }

  buttonsStyle = {
    marginTop: 12,
    marginBottom: 12,
    color: 'white',
  }

  addTransactionToQueueAction = (transactionId, transactionDetails) => {
    return {
      type: 'ADD_TRANSACTION',
      transaction: { transactionId, transactionDetails }
    }
  };

  handleCloseAuth = () => {
    this.setState(
      {
        openAuth: false,
      }
      , this.props.onTransferOpen
    )
  }

  render () {
    const { openAuth, authMsg, authAccount } = this.state

    if (!this.props.open) {
      return null;
    }

    if (openAuth) {
      return (
        <div>
          {/* <RaisedButton label="Trade" primary={true} onClick={this.handleOpen}
            labelStyle={{ fontWeight: 700 }} /> */}
          <ElementFundActionAuthorization
            authMsg={authMsg}
            account={authAccount}
            onClose={this.handleCloseAuth}
          />
        </div>
      )
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
        open={this.props.open}
        actions={ this.renderActions() }>
        { this.renderFields() }
      </Dialog>
    );
  }

  renderHeader = () => {
    return (
      <div>
          <ElementDialogHeadTitle primaryText='Transfer tokens' />
          <ElementDialogAddressTitle tokenDetails={this.props.account} />
      </div>

    )
  }

  renderActions () {
    const { amountError, sending } = this.state;
    const hasError = !!(amountError);

    return ([
      <FlatButton
        key="CancelButton"
        label='Cancel'
        name='deposit'
        primary
        onTouchTap={ this.props.onTransferOpen } />,
      <FlatButton
        key="TransferButton"
        label='Transfer'
        primary
        disabled={ hasError || sending }
        onTouchTap={ this.onTransfer } />
    ]);
  }

  renderFields () {
    const amountLabel = 'The amount you want to transfer';
    const toAddressLabel = 'The recipient adddress you want to transfer to';

    return (
      <div>
        <TokenSelector account={this.props.account} onSelectToken={this.onSelectToken}/>
        <TextField
          autoComplete='off'
          floatingLabelFixed
          floatingLabelText='Recipient address'
          fullWidth
          hintText={ toAddressLabel }
          errorText={ this.state.toAddressError }
          value={ this.state.toAddress}
          onChange={ this.onChangeAddress } />
        <TextField
          autoComplete='off'
          floatingLabelFixed
          floatingLabelText='Amount you want to transfer'
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

  onSelectToken = (token) => {
    this.setState({
      token
    }, this.validateTotal);
  }

  onChangeAmount = (event, amount) => {
    this.setState({
      amount,
      amountError: validatePositiveNumber(amount)
    }, this.validateTotal);
  }

  onChangeAddress = (event, toAddress) => {
    const { api } = this.context
    this.setState({
      toAddress,
      toAddressError: validateAddress(toAddress, api)
    }, this.validateTotal);
  }

  validateTotal = () => {
    const { amount, token } = this.state;
    const { account } = this.props;
    var amountError = ''
    let bn = null;
    
    try {
      bn = new BigNumber(amount);
    } catch (e) {
      this.setState({
        amountError: ERRORS.invalidAmount
      });
      return
    }
    if (bn.lte(0)) {
      this.setState({
        amountError: ERRORS.invalidAmount
      });
    return
    }
    switch (token) {
      case ETH:
        if (bn.gt(account.ethBalance.replace(/,/g, ''))) {
          amountError = ERRORS.invalidTotal
        }
        break;
      case GRG:
        if (bn.gt(account.rigoTokenBalance.replace(/,/g, ''))) {
          amountError = ERRORS.invalidTotal
        }
        break;
      default:
        amountError = ERRORS.invalidTotal
    }
    console.log(amountError)
    this.setState({
      amountError
    });
  }

  onTransfer = () => {
    switch(this.state.token) {
      case ETH:
        this.onTransferETH()
        break
      case GRG:
        this.onTransferGRG()
        break
    } 
  }

  handleSubmit = () => {
    this.setState(
      { openAuth: true }
    );
  }

  onTransferETH = () => {
    const { api } = this.context;
    const { token, toAddress } = this.state;
    const { account } = this.props
    const amount = api.util.toWei(this.state.amount).toString()
    const authMsg = 'You trasferred ' + this.state.unitsSummary + ' units of ' + token
    const transactionId = api.util.sha3(new Date() + toAddress)
    // Setting variables depending on account source
    var provider = this.props.account.source === 'MetaMask' ? window.web3 : api
    var poolApi = null;
    // Initializing transaction variables
    var transactionDetails = {
      status: this.props.account.source === 'MetaMask' ? 'pending' : 'authorization',
      hash: '',
      parityId: null,
      timestamp: new Date(),
      account: account,
      error: false,
      action: 'Transfer' + token,
      symbol: token,
      amount: this.state.amount
    }
    this.props.dispatch(this.addTransactionToQueueAction(transactionId, transactionDetails))
    // Sending the transaction
    poolApi = new PoolsApi(provider)
    poolApi.contract.ether.transfer(account.address, toAddress, amount)
      .then((receipt) => {
        // Adding transaciont to the queue
        // Parity returns an internal transaction ID straighaway. The transaction then needs to be authorized inside the wallet.
        // MetaMask returns a receipt of the transaction once it has been mined by the network. It can take a long time.
        if (account.source === 'MetaMask') {
          transactionDetails.status = 'executed'
          transactionDetails.receipt = receipt
          transactionDetails.hash = receipt.transactionHash
          transactionDetails.timestamp = new Date ()
          this.props.dispatch(this.addTransactionToQueueAction(transactionId, transactionDetails))
        } else {
          transactionDetails.parityId = receipt
          this.props.dispatch(this.addTransactionToQueueAction(transactionId, transactionDetails))
        }
      })
      .catch((error) => {
        this.props.snackBar('Your wallet returned an error.')
        transactionDetails.status = 'error'
        transactionDetails.error = error
        console.log(error)
        this.props.dispatch(this.addTransactionToQueueAction(transactionId, transactionDetails))
      })
    this.setState({
      authMsg: authMsg,
      authAccount: { ...account},
    }, this.handleSubmit)
  }

  onTransferGRG = () => {
    const { api } = this.context;
    const { token, toAddress } = this.state;
    const { account } = this.props
    const amount = api.util.toWei(this.state.amount).toString()
    const authMsg = 'You trasferred ' + this.state.unitsSummary + ' units of ' + token
    const transactionId = api.util.sha3(new Date() + toAddress)
    // Setting variables depending on account source
    var provider = this.props.account.source === 'MetaMask' ? window.web3 : api
    var poolApi = null;
    // Initializing transaction variables
    var transactionDetails = {
      status: this.props.account.source === 'MetaMask' ? 'pending' : 'authorization',
      hash: '',
      parityId: null,
      timestamp: new Date(),
      account: account,
      error: false,
      action: 'Transfer' + token,
      symbol: token,
      amount: this.state.amount
    }
    this.props.dispatch(this.addTransactionToQueueAction(transactionId, transactionDetails))
    // Sending the transaction
    poolApi = new PoolsApi(provider)
    poolApi.contract.rigotoken.init()
    poolApi.contract.rigotoken.transfer(account.address, toAddress, amount)
      .then((receipt) => {
        // Adding transaciont to the queue
        // Parity returns an internal transaction ID straighaway. The transaction then needs to be authorized inside the wallet.
        // MetaMask returns a receipt of the transaction once it has been mined by the network. It can take a long time.
        if (account.source === 'MetaMask') {
          transactionDetails.status = 'executed'
          transactionDetails.receipt = receipt
          transactionDetails.hash = receipt.transactionHash
          transactionDetails.timestamp = new Date ()
          this.props.dispatch(this.addTransactionToQueueAction(transactionId, transactionDetails))
        } else {
          transactionDetails.parityId = receipt
          this.props.dispatch(this.addTransactionToQueueAction(transactionId, transactionDetails))
        }
      })
      .catch((error) => {
        this.props.snackBar('Your wallet returned an error.')
        transactionDetails.status = 'error'
        transactionDetails.error = error
        console.log(error)
        this.props.dispatch(this.addTransactionToQueueAction(transactionId, transactionDetails))
      })
    this.setState({
      authMsg: authMsg,
      authAccount: { ...account},
    }, this.handleSubmit)
  }

}

export default connect(mapStateToProps)(ElementAccountActionTransfer)
