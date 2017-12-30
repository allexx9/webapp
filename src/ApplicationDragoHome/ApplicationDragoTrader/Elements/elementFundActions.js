import { Grid, Row, Col } from 'react-flexbox-grid';
import {Toolbar, ToolbarGroup, ToolbarSeparator, ToolbarTitle} from 'material-ui/Toolbar';
import BigNumber from 'bignumber.js';
import Dialog from 'material-ui/Dialog';
import FlatButton from 'material-ui/FlatButton';
import PropTypes from 'prop-types';
import RaisedButton from 'material-ui/RaisedButton';
import React from 'react';
import TextField from 'material-ui/TextField';
import  * as Colors from 'material-ui/styles/colors';
import ActionSwapHoriz from 'material-ui/svg-icons/action/swap-horiz';

import {
  Table,
  TableBody,
  TableHeader,
  TableHeaderColumn,
  TableRow,
  TableRowColumn,
} from 'material-ui/Table';

import { ERRORS, validateAccount, validatePositiveNumber } from './validation';
import { formatCoins, formatEth, formatHash, toHex } from '../../../format';
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
    actionSummary: 'BUYING',
    account: {},
    accountError: ERRORS.invalidAccount,
    accountCorrect: false,
    amount: 0,
    newDrgBalance: 0,
    drgBalance: 0,
    drgOrder: 0,
    amountError: ERRORS.invalidAmount,
    amountFieldDisabled: true,
    unitsSummary: 0,
    amountSummary: 0,
    actionStyleBuySell: { 
      color: Colors.green300
    },
    canSubmit: false,
    sending: false,
    complete: false,
    switchButton: {
      label: 'Units',
      denomination: 'ETH',
      hint: 'Amount'
    }
  }

  actionBuyStyle = {
    color: Colors.green300,
  }

  actionSellStyle = {
    color: Colors.red300,
  }

  // componentWillMount () {
  //   this.setPrice()
  // }

  // setPrice = () => {
  //   const { api } = this.context
  //   const {dragoDetails} = this.props
  //   var sellPrice = new BigNumber(500000000000000000)
  //   var buyPrice = new BigNumber(700000000000000000)
  //   const values = [sellPrice, buyPrice]
  //   const options = {
  //     from: '0x00a79Fa87cFb12A05205CaEa3870C1A9C322ae5C',
  //   }
  //   const dragoToken = api.newContract(abis.drago, dragoDetails.address).instance;
  //   dragoToken.setPrices
  //   .estimateGas(options, values)
  //   .then((gasEstimate) => {
  //     options.gas =  gasEstimate.mul(1.2).toFixed(0)
  //     console.log(`setPrice drago: gas estimated as ${gasEstimate.toFixed(0)} setting to ${options.gas}`)
      
  //     dragoToken.setPrices.postTransaction(options, values)
  //     .then((result) =>{
  //       console.log(result)
  //     })
  //     .catch((error) => {
  //       console.log(`setPrice drago ERROR ${error}`)
  //     })      
      
  //   })
  //   .catch((error) => {
  //     console.log(`estimateGas drago ERROR ${error}`)
  //   })
  // }


  handleOpen = () => {
    this.setState({open: true});
  }

  handleClose = () => {
    this.setState({
      open: false,
      action: 'buy',
      actionSummary: 'BUYING',
      account: {},
      accountError: ERRORS.invalidAccount,
      accountCorrect: false,
      amount: 0,
      newDrgBalance: 0,
      drgBalance: 0,
      drgOrder: 0,
      amountError: ERRORS.invalidAmount,
      amountFieldDisabled: true,
      unitsSummary: 0,
      amountSummary: 0,
      actionStyleBuySell: { 
        color: Colors.green300
      },
      canSubmit: false,
      sending: false,
      complete: false,
      switchButton: {
        label: 'Units',
        denomination: 'ETH',
        hint: 'Amount'
      }
    });
  }

  handleSellAction = () => {
    const {dragoDetails} = this.props
    return this.setState({
      action: 'sell',
      amount: 0,
      actionSummary: 'SELLING',
      actionStyleBuySell: this.actionSellStyle,
      switchButton: {
        label: 'Amount',
        denomination: dragoDetails.symbol,
        hint: 'Amount'
      }
    })
  }

  handleBuyAction = () => {
    const {dragoDetails} = this.props
    return this.setState({
      action: 'buy',
      amount: 0,
      actionSummary: 'BUYING',
      actionStyleBuySell: this.actionBuyStyle,
      switchButton: {
        label: 'Units',
        denomination: 'ETH',
        hint: 'Amount'
      }
    })
  }

  onChangeAccounts = (account) => {
    const { api } = this.context
    const {dragoDetails} = this.props
    const accountError = validateAccount(account,api)
    this.setState({
      account,
      accountError: accountError
    }, this.validateOrder);

    // Getting the account balance if account passed validation
    if (!accountError) {
      const instance = api.newContract(abis.drago, dragoDetails.address).instance;
      instance.balanceOf.call({}, [account.address])
      .then((amount) =>{
        const drgBalance = formatCoins(amount,4,api)
        this.setState({
          drgBalance,
          amountFieldDisabled: false
        });
      })
    }
  }

  calculateBalance = (error = false) => {
    const { action, drgBalance, amount } = this.state
    const { dragoDetails } = this.props
    const buyPrice = new BigNumber(dragoDetails.buyPrice)
    const sellPrice = new BigNumber(dragoDetails.sellPrice)
    const buyRatio = this.state.switchButton.label == 'Units' ? new BigNumber(1).div(buyPrice) : new BigNumber(1).times(buyPrice)
    const sellRatio = this.state.switchButton.label == 'Units' ? new BigNumber(1).div(sellPrice) : new BigNumber(1).times(sellPrice)
    const drgCurrent = new BigNumber(drgBalance)
    const ratio = action == 'buy' ? buyRatio : sellRatio
    const getAmounts = (action, amount) => {
      var orderAmount = null;
      if (amount.length == 0) {
        orderAmount = new BigNumber(0)
      } else {
        orderAmount = isNaN(amount) ? new BigNumber(0) : new BigNumber(amount)
      }
      // switch(action) {
      //   case "buy":
      //     // Checking if the amount is expressed in ETH 
      //     if (this.state.switchButton.label == 'Units') {
      //       console.log('ETH')
      //       let amountDRG = orderAmount.times(buyRatio)
      //       let amountETH = new BigNumber(amount)
      //       return {amountETH: amountETH, amountDRG: amountDRG} 
      //     }
      //     // Checking if the amount is expressed in DRG
      //     if (this.state.switchButton.label == 'Amount') {
      //       console.log('DRG')
      //       let amountDRG = orderAmount
      //       let amountETH = new BigNumber(amount).times(buyRatio)
      //       return {amountETH: amountETH, amountDRG: amountDRG} 
      //     }
      //     break
      //   case "sell":
      //     break
      // } 
      // Checking if the amount is expressed in ETH 
      if (this.state.switchButton.label == 'Units') { // Buy in ETH amount
        console.log('ETH')
        console.log(ratio.toNumber())
        let amountDRG = orderAmount.times(ratio)
        let amountETH = new BigNumber(amount)
        return {amountETH: amountETH, amountDRG: amountDRG} 
      }
      // Checking if the amount is expressed in DRG
      if (this.state.switchButton.label == 'Amount') { // Buy in DRG units
        console.log('DRG')
        console.log(ratio.toNumber())
        let amountDRG = orderAmount
        let amountETH = new BigNumber(amount).times(ratio)
        return {amountETH: amountETH, amountDRG: amountDRG} 
      }
    }

    // First: checking if there was a previous error. If positive, reset the balances and return.
    if (error) {
      this.setState({
        newDrgBalance: new BigNumber(0).toFormat(4),
        drgOrder: new BigNumber(0).toFormat(4),
        amountSummary: 0
      });
      return
    }

    // Second: updating the state with the new balances
    var newDrgBalance = action == 'buy' 
      ? getAmounts(action, amount).amountDRG.plus(drgCurrent) 
      : drgCurrent.minus(getAmounts(action, amount).amountDRG)
    console.log('balance')
    this.setState({
      newDrgBalance: newDrgBalance.toFormat(4),
      drgOrder: getAmounts(action, amount).amountDRG.toFormat(4),
      amountSummary: getAmounts(action, amount).amountETH.toFormat(4),
      unitsSummary: getAmounts(action, amount).amountDRG.toFormat(4),
      amountError: '',
    });
  }

  onChangeAmount = (event, amount) => {
      const accountError = validatePositiveNumber(amount.trim())
      this.setState({
        amount: amount.trim(),
        amountError: accountError,
      }, this.validateOrder)
      
  }

  validateOrder = () => {
    const { account, accountError, amount, amountError, drgBalance, action } = this.state
    const { dragoDetails } = this.props
    const buyPrice = new BigNumber(dragoDetails.buyPrice)
    const sellPrice = new BigNumber(dragoDetails.sellPrice)
    const buyRatio = new BigNumber(1).div(buyPrice)
    const sellRatio = new BigNumber(1).div(sellPrice)
    const ratio = action == 'buy' ? buyRatio : sellRatio
    const calculateAmount = (amount) =>{
      switch(this.state.switchButton.label) {
        case "Units":
          return action == 'buy' ? new BigNumber(amount) : new BigNumber(amount).times(ratio)
          break
        case "Amount":
          return action == 'buy' ? new BigNumber(amount).div(ratio) : new BigNumber(amount)
          break
      } 
    }
    // First: checking if any error in the account or amount. If error then return.
    if ( accountError || amountError ) {
      this.setState({
        drgOrder: new BigNumber(0).toFormat(4),
        unitsSummary: 0
      }, this.calculateBalance(true));
      return
    }
    // Second: checking if the account balance has enough ETH
    switch(this.state.action) {
      case "buy":
        if (calculateAmount(amount).gt(account.ethBalance.replace(/,/g, ''))) {
          this.setState({
            amountError: ERRORS.invalidTotal,
            drgOrder: new BigNumber(0).toFormat(4),
            unitsSummary: 0
          }, this.calculateBalance(true));
        } else {
          this.calculateBalance()
        }
        break
      case "sell":
      console.log(calculateAmount(amount).toNumber())
        if (calculateAmount(amount).gt(drgBalance)) {
          this.setState({
            amountError: ERRORS.invalidTotal,
            drgOrder: new BigNumber(0).toFormat(4),
            unitsSummary: 0
          }, this.calculateBalance(true));
        } else {
          this.calculateBalance()
        }
        break
    } 

  }

  onSend = () => {
    const { api } = this.context;
    const {dragoDetails} = this.props
    const values = []
    const options = {
      from: this.state.account.address,
      value: api.util.toWei(this.state.amountSummary).toString()
    }
    const instance = api.newContract(abis.drago, dragoDetails.address).instance
    
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
        this.props.snackBar('Order waiting for authorization for ' + this.state.amountSummary + ' ETH')
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

  unitsSwitch = () => {
    const {dragoDetails} = this.props
    this.setState({
      switchButton: { 
        label: this.state.switchButton.label == 'Units' ? 'Amount' : 'Units',
        hint: this.state.switchButton.hint == 'Units' ? 'Amount' : 'Units',
        denomination: this.state.switchButton.denomination == 'ETH' ? dragoDetails.symbol : 'ETH',      
      },
      amountError: ' ',
    })
  }

  buyFields = () => {
    return (
      <Col xs={6}>
        <Row middle="xs" >
          <Col xs={12}>
          <AccountSelector
          accounts={ this.props.accounts }
          account={ this.state.account }
          errorText={ this.state.accountError }
          floatingLabelText='From account'
          hintText='The account the transaction will be made from'
        onSelect={ this.onChangeAccounts } />
          </Col>
          <Col xs={6}>
            <TextField
                autoComplete='off'
                floatingLabelFixed
                floatingLabelText={'Amount in ' + this.state.switchButton.denomination}
                fullWidth
                hintText={this.state.switchButton.hint}
                errorText={ this.state.amountError }
                name='amount'
                id='amount'
                disabled={this.state.amountFieldDisabled}
                value={ this.state.amount }
                onChange={ this.onChangeAmount } />
          </Col>
          <Col xs={6}>
            <RaisedButton
              label={this.state.switchButton.label}
              secondary={true}
              style={styles.button}
              icon={<ActionSwapHoriz />}
              onClick={this.unitsSwitch}
            />
          </Col>
        </Row>
      </Col>
    )
  }

  sellFields = () => {
    return (
      <Col xs={6}>
        <Row middle="xs" >
          <Col xs={12}>
          <AccountSelector
          accounts={ this.props.accounts }
          account={ this.state.account }
          errorText={ this.state.accountError }
          floatingLabelText='From account'
          hintText='The account the transaction will be made from'
          onSelect={ this.onChangeAccounts } />
          </Col>
          <Col xs={6}>
            <TextField
                autoComplete='off'
                floatingLabelFixed
                floatingLabelText={'Amount in ' + this.state.switchButton.denomination}
                fullWidth
                hintText={this.state.switchButton.hint}
                errorText={ this.state.amountError }
                name='amount'
                id='amount'
                disabled={this.state.amountFieldDisabled}
                value={ this.state.amount }
                onChange={ this.onChangeAmount } />
          </Col>
          <Col xs={6}>
            <RaisedButton
              label={this.state.switchButton.label}
              secondary={true}
              style={styles.button}
              icon={<ActionSwapHoriz />}
              onClick={this.unitsSwitch}
            />
          </Col>
        </Row>
      </Col>
    )
  }

  holding = () => {
    const { amount, action, newDrgBalance, drgBalance, drgOrder } = this.state
    const { dragoDetails } = this.props
    return (
        <Table selectable={false} className={styles.detailsTable}>
          <TableBody displayRowCheckbox={false}>
            <TableRow hoverable={false} >
              <TableRowColumn className={styles.detailsTableCell}>Current</TableRowColumn>
              {/* <TableRowColumn className={styles.detailsTableCell}></TableRowColumn> */}
              <TableRowColumn className={styles.detailsTableCell2}>{drgBalance} {dragoDetails.symbol}</TableRowColumn>
            </TableRow>
            <TableRow hoverable={false} >
              <TableRowColumn className={styles.detailsTableCell}>Order</TableRowColumn>
              {/* <TableRowColumn className={styles.detailsTableCell}></TableRowColumn> */}
              <TableRowColumn className={styles.detailsTableCell2}>{drgOrder} {dragoDetails.symbol}</TableRowColumn>
            </TableRow>
            <TableRow hoverable={false} >
              <TableRowColumn className={styles.detailsTableCell}>Expected*</TableRowColumn>
              {/* <TableRowColumn className={styles.detailsTableCell}></TableRowColumn> */}
              <TableRowColumn className={styles.detailsTableCell2}>{newDrgBalance} {dragoDetails.symbol}</TableRowColumn>
            </TableRow>
          </TableBody>
        </Table>
    )
  }



  render() {
    const { dragoDetails, accounts } = this.props
    const { actionStyle } = this.state
    const { accountError, amountError, sending } = this.state;
    const hasError = !!(this.state.accountError || this.state.amountError );
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
    // console.log(dragoDetails)
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
            modal={false}
            open={this.state.open}
            contentStyle={customContentStyle}
            onRequestClose={this.handleClose}
          >
          <Row>
            <Col xs={12}>
              <Row center="xs">
                <Col xs={6}>
                  <h2><span style={this.state.actionStyleBuySell}>{this.state.action.toUpperCase()}</span>&nbsp; 
                  {dragoDetails.symbol} {this.state.action =='buy' ? dragoDetails.buyPrice : dragoDetails.sellPrice}</h2>
                </Col>
              </Row>
            </Col>
          </Row>
          <Row>
              <Col xs={6}>
                <p>Holding</p>
              </Col>
              <Col xs={6}>
                <p>Order</p>
              </Col>
          </Row>
          <Row>
            <Col xs={6}>
              {this.holding()}
            </Col>
            {this.state.action =='buy' ? this.buyFields() : this.sellFields()}

          </Row>
          <Row>
            <Col xs={12} className={styles.grossAmountWarning}>
              * Gross of fees
            </Col>
          </Row>
          <Row>
            <Col xs={12}>
              <Row center="xs">
                <Col xs={6}>
                  <h2><span style={this.state.actionStyleBuySell}>{this.state.actionSummary}</span> <span className={styles.summary}>{this.state.unitsSummary}</span> {dragoDetails.symbol}<br /> 
                  FOR <span className={styles.summary}>{this.state.amountSummary}</span> ETH </h2>
                </Col>
              </Row>
            </Col>
          </Row>
        </Dialog>
      </div>
    );
  }
}