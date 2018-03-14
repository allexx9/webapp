// Copyright 2016-2017 Rigo Investment Sarl.

import { Dialog, FlatButton, TextField } from 'material-ui';
import BigNumber from 'bignumber.js';
import PropTypes from 'prop-types';
import React, { Component } from 'react';
import { ERRORS, validatePositiveNumber } from '../_utils/validation';
import TokenSelector from '../_atomic/molecules/tokenSelector';
import ElementDialogHeadTitle from './elementDialogHeadTitle'
import ElementDialogAddressTitle from './elementDialogAddressTitle'
import PoolsApi from '../PoolsApi/src'
import { connect } from 'react-redux';

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
    snackBar: PropTypes.func
  }

  state = {
    open: this.props.open,
    amount: 0,
    amountError: ERRORS.invalidAmount,
    toAddress: '',
    toAddressError: ERRORS.toAddressError,
    value: 'default',
    sending: false,
    complete: false,
    token: "ETH"
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
    console.log(this.props)
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

  onClose =() =>{
    this.setState({
      open: false
    });
  }

  renderActions () {
    const { complete } = this.state;

    if (complete) {
      return (
        <FlatButton
          label='Done'
          primary
          onTouchTap={ this.props.onClose } />
      );
    }

    const { amountError, sending } = this.state;
    const hasError = !!(amountError);

    return ([
      <FlatButton
        key="CancelButton"
        label='Cancel'
        name='deposit'
        primary
        onTouchTap={ this.onClose} />,
      <FlatButton
        key="TransferButton"
        label='Transfer'
        primary
        disabled={ hasError || sending }
        onTouchTap={ this.Transfer } />
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
    console.log(token)
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

  validateTotal = () => {
    const { amount, token } = this.state;
    const { account } = this.props;
    var amountError = ''
    console.log(account)

    let bn = null;
    
    try {
      bn = new BigNumber(amount);
    } catch (e) {
      this.setState({
        amountError: ERRORS.invalidAmount
      });
      return
    }
    console.log(bn)
    console.log(bn.lte(0))
    if (bn.lte(0)) {
      this.setState({
        amountError: ERRORS.invalidAmount
      });
    return
    }
    switch (token) {
      case "ETH":
        if (bn.gt(account.ethBalance.replace(/,/g, ''))) {
          amountError = ERRORS.invalidTotal
        }
        break;
      case "GRG":
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

  // onTransfer = () => {
  //   const { api } = this.context;
  //   const accountAddress = this.props.account.address
  //   const amount = api.util.toWei(this.state.amount).toString()
  //   const authMsg = 'You trasferred ' + this.state.unitsSummary + ' units of GRG for ' + this.state.amountSummary + ' ETH'
  //   const transactionId = api.util.sha3(new Date() + accountAddress)
  //   // Setting variables depending on account source
  //   var provider = this.props.account.source === 'MetaMask' ? window.web3 : api
  //   var dragoApi = null;
  //   // Initializing transaction variables
  //   var transactionDetails = {
  //     status: this.props.account.source === 'MetaMask' ? 'pending' : 'authorization',
  //     hash: '',
  //     parityId: null,
  //     timestamp: new Date(),
  //     account: this.props.account,
  //     error: false,
  //     action: 'TransferGRG',
  //     symbol: 'GRG',
  //     amount: this.state.amount
  //   }
  //   // this.props.dispatch(this.addTransactionToQueueAction(transactionId, transactionDetails))
  //   const {account} = this.state

  //   // Sending the transaction
  //   dragoApi = new DragoApi(provider)
  //   dragoApi.contract.drago.init(dragoDetails.address)
  //   dragoApi.contract.drago.buyDrago(accountAddress, amount)
  //     .then((receipt) => {
  //       console.log(receipt)
  //       // Adding transaciont to the queue
  //       // Parity returns an internal transaction ID straighaway. The transaction then needs to be authorized inside the wallet.
  //       // MetaMask returns a receipt of the transaction once it has been mined by the network. It can take a long time.
  //       if (account.source === 'MetaMask') {
  //         transactionDetails.status = 'executed'
  //         transactionDetails.receipt = receipt
  //         transactionDetails.hash = receipt.transactionHash
  //         transactionDetails.timestamp = new Date ()
  //         this.props.dispatch(this.addTransactionToQueueAction(transactionId, transactionDetails))
  //       } else {
  //         transactionDetails.parityId = receipt
  //         this.props.dispatch(this.addTransactionToQueueAction(transactionId, transactionDetails))
  //       }
  //     })
  //     .catch((error) => {
  //       this.props.snackBar('Your wallet returned an error.')
  //       transactionDetails.status = 'error'
  //       transactionDetails.error = error
  //       console.log(error)
  //       this.props.dispatch(this.addTransactionToQueueAction(transactionId, transactionDetails))
  //       this.setState({
  //         sending: false
  //       })
  //     })
  //   this.setState({
  //     authMsg: authMsg,
  //     authAccount: { ...this.props.account },
  //     // sending: false,
  //     complete: true,
  //   }, this.handleSubmit)
  // }

}

export default connect(mapStateToProps)(ElementAccountActionTransfer)
