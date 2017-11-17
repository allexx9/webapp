import { Grid, Row, Col } from 'react-flexbox-grid';
import {Toolbar, ToolbarGroup, ToolbarSeparator, ToolbarTitle} from 'material-ui/Toolbar';
import BigNumber from 'bignumber.js';
import Dialog from 'material-ui/Dialog';
import FlatButton from 'material-ui/FlatButton';
import PropTypes from 'prop-types';
import RaisedButton from 'material-ui/RaisedButton';
import React from 'react';
import TextField from 'material-ui/TextField';

import { ERRORS, validateAccount, validatePositiveNumber } from './validation';
import * as abis from '../../../contracts';
import AccountSelector from './elementAccountSelector'
import ElementFundActionsHeader from './elementFundActionsHeader'
import IdentityIcon from '../../../IdentityIcon';

import styles from './elementFundActions.module.css';

const customContentStyle = {
  minHeight: '500px',
};

export default class ElementFundActions extends React.Component {

  static contextTypes = {
    api: PropTypes.object.isRequired
  };

  static PropTypes = {
    dragoDetails: PropTypes.object.isRequired, 
    accounts: PropTypes.object.isRequired
  };
  
  state = {
    open: false,
    action: 'buy',
    account: {},
    accountError: ERRORS.invalidAccount,
    accountCorrect: false,
    amount: 0,
    amountError: ERRORS.invalidAmount,
    amountCorrect: false,
    actionStyle: { 
      color: '#43A047'
    },
    canSubmit: false,
    sending: false,
    complete: false
  }

  actionBuyStyle = {
    color: '#43A047',
  }

  actionSellStyle = {
    color: '#E53935',
  }

  // componentWillMount () {
  //   this.initDragoInstance()
  // }

  handleOpen = () => {
    this.setState({open: true});
  }

  handleClose = () => {
    this.setState({open: false});
  }

  handleSellAction = () => {
    return this.setState({
      action: 'sell',
      actionStyle: this.actionSellStyle
    })
  }

  handleBuyAction = () => {
    return this.setState({
      action: 'buy',
      actionStyle: this.actionBuyStyle
    })
  }

  onChangeAccounts = (account) => {
    const { api } = this.context;
    this.setState({
      account,
      accountError: validateAccount(account,api)
    }, this.validateOrder);
  }

  onChangeAmount = (event, amount) => {
    this.setState({
      amount,
      amountError: validatePositiveNumber(amount)
    }, this.validateOrder);
  }

  // If no errors in inputs then check if enough balance on the account
  validateOrder = () => {
    const { account, accountError, amount, amountError } = this.state;

    if ( accountError || amountError ) {
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
    const {dragoDetails} = this.props
    const values = []; // [this.state.dragoAddress];
    const options = {
      from: this.state.account.address,
      value: api.util.toWei(this.state.amount).toString()
    };
    const instance = api.newContract(abis.drago, dragoDetails.address).instance;
    
              // this.setState({
              //   instance : drago.instance
              // })

    this.setState({
      sending: true
    })
    instance.buyDrago
      .estimateGas(options, values)
      .then((gasEstimate) => {
        options.gas =  gasEstimate.mul(1.2).toFixed(0); //problem with estimate cause of blank before dragoAddress
        console.log(`Buy drago: gas estimated as ${gasEstimate.toFixed(0)} setting to ${options.gas}`);

        return instance.buyDrago.postTransaction(options, values);
      })
      .then(() => {
        // this.props.onClose();
        this.props.snackBar('Order sent for authorization.')
        this.setState({
          sending: false,
          complete: true
        }, this.setState({open: false}))
      })
      .catch((error) => {
        console.error('error', error);
        this.setState({
          sending: false
        })
      })
  }

  // initDragoInstance = () => {
  //   const { api } = this.context;
  //   const {dragoDetails} = this.props
  //   api.parity
  //     .registryAddress()
  //     .then((registryAddress) => {
  //       console.log(`the registry was found at ${registryAddress}`);
  //       const registry = api.newContract(abis.registry, registryAddress).instance;
  //       return Promise.all([
  //           registry.getAddress.call({}, [api.util.sha3('dragoregistry'), 'A'])
  //       ]);
  //     })
  //     .then((address) => {
  //       console.log(`The drago registry was found at ${address}`);

  //       const dragoRegistry = api.newContract(abis.dragoregistry, address).instance;

  //       return Promise.all([
  //           dragoRegistry.fromNameSymbol.call({}, [this.state.dragoName.toString(), this.state.dragoSymbol.toString()])
  //       ])
  //       .then((dragoAddress) => {

  //         console.log(`length of object array ${dragoAddress.length}`)

  //         const drago = api.newContract(abis.drago, dragoAddress);

  //         this.setState({
  //           instance : drago.instance
  //         })

  //         console.log(`your target drago was found at ${dragoAddress}`);
  //       });
  //     });
  // }

  render() {
    const { dragoDetails, accounts } = this.props
    const { actionStyle } = this.state
    const { accountError, amountError, sending } = this.state;
    const hasError = !!(this.state.accountError || this.state.amountError || this.state.dragoNameError || this.state.dragoSymbolError || this.state.instanceError);
    const actions = [
      <FlatButton
        label="Cancel"
        primary={true}
        onClick={this.handleClose}
        onTouchTap={this.handleClose}
      />,
      <FlatButton
        label="Submit"
        primary={true}
        disabled={ hasError || sending }
        onClick={this.onSend}
      />,
    ];
    return (
      <div>
        <RaisedButton label="Actions" primary={true} onClick={this.handleOpen} 
          labelStyle={{fontWeight: 700}}/>
          <Dialog
            title={<ElementFundActionsHeader dragoDetails={dragoDetails} 
              action={this.state.action} 
              handleSellAction={this.handleSellAction}
              handleBuyAction={this.handleBuyAction}
            />}
            actions={actions}
            modal={true}
            open={this.state.open}
            contentStyle={customContentStyle}
          >
          <Row>
              <Col xs={12}>
              <Row center="xs">
                <Col xs={6}>
                  <h2 style={this.state.actionStyle}>{this.state.action.toUpperCase()}</h2>
                </Col>
              </Row>
            </Col>
          </Row>
          
          <AccountSelector
            accounts={ this.props.accounts }
            account={ this.state.account }
            errorText={ this.state.accountError }
            floatingLabelText='From account'
            hintText='The account the transaction will be made from'
            onSelect={ this.onChangeAccounts } />
          <TextField
            autoComplete='off'
            floatingLabelFixed
            floatingLabelText='Amount in ETH'
            fullWidth
            hintText='Amount'
            errorText={ this.state.amountError }
            name='amount'
            id='amount'
            value={ this.state.amount }
            onChange={ this.onChangeAmount } />
        </Dialog>
      </div>
    );
  }
}