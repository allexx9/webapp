// Copyright 2016-2017 Rigo Investment Sagl.

import { Actions } from '../../_redux/actions'
import { Col, Row } from 'react-flexbox-grid'
import { Dialog, FlatButton, TextField } from 'material-ui'
import { ERC20_TOKENS } from '../../_utils/const'
import {
  ERRORS,
  validateAccount,
  validateAddress,
  validatePositiveNumber
} from '../../_utils/validation'
import { connect } from 'react-redux'
import { toBaseUnitAmount } from '../../_utils/format'
import ActionsDialogHeader from '../../_atomic/molecules/actionsDialogHeader'
import BigNumber from 'bignumber.js'
import DropDownMenu from 'material-ui/DropDownMenu'
import ElementFundActionAuthorization from '../../Elements/elementActionAuthorization'
import ImgETH from '../../_atomic/atoms/imgETH'
import MenuItem from 'material-ui/MenuItem'
import PoolApi from '../../PoolsApi/src'
import PropTypes from 'prop-types'
import RaisedButton from 'material-ui/RaisedButton'
import React, { Component } from 'react'

function mapStateToProps(state) {
  return {
    endpoint: state.endpoint
  }
}

class ElementFundActionSelfCustody extends Component {
  static contextTypes = {
    api: PropTypes.object.isRequired
  }

  static propTypes = {
    accounts: PropTypes.array.isRequired,
    dragoDetails: PropTypes.object.isRequired,
    endpoint: PropTypes.object.isRequired,
    openActionForm: PropTypes.func.isRequired,
    dispatch: PropTypes.func.isRequired
  }

  state = {
    openAuth: false,
    account: this.props.accounts[0],
    accountError: ERRORS.invalidAccount,
    amount: 0,
    amountError: ERRORS.invalidAmount,
    exchangeName: {},
    exchangeNameError: null, //ERRORS.invalidAccount,
    targetTokenAddress: '0x0000000000000000000000000000000000000000',
    targetTokenAddressError: null,
    selfCustodyAddress: '',
    selfCustodyAddressError: ERRORS.invalidAddress,
    action: 'transfer ETH',
    sending: false,
    complete: false
  }

  buttonsStyle = {
    marginTop: 12,
    marginBottom: 12,
    color: 'white'
  }

  handleSubmit = () => {
    this.setState({ openAuth: true })
  }

  render() {
    const { complete } = this.state
    const { openAuth, authMsg, authAccount } = this.state
    const { dragoDetails } = this.props
    if (complete) {
      return null
    }

    const titleStyle = {
      padding: 0,
      lineHeight: '20px',
      fontSize: 16
    }

    if (openAuth) {
      return (
        <div>
          {/* <RaisedButton label="Trade" primary={true} onClick={this.handleOpen}
            labelStyle={{ fontWeight: 700 }} /> */}
          <ElementFundActionAuthorization
            tokenDetails={dragoDetails}
            authMsg={authMsg}
            account={authAccount}
            onClose={this.handleCloseAuth}
          />
        </div>
      )
    }

    return (
      <Dialog
        title={this.renderHeader()}
        titleStyle={titleStyle}
        modal
        open={true}
        actions={this.renderActions()}
      >
        {this.renderFields()}
      </Dialog>
    )
  }

  renderHeader = () => {
    const { dragoDetails } = this.props
    return (
      <div>
        <ActionsDialogHeader
          primaryText="Self Custody Helper"
          fundType="drago"
          tokenDetails={dragoDetails}
        />
      </div>
    )
  }

  handleCloseAuth = () => {
    this.setState(
      {
        openAuth: false
      },
      this.onClose
    )
  }

  onClose = event => {
    // Calling callback function passed by parent in order to show/hide this dialog
    this.props.openActionForm(event, 'selfCustody')
  }

  renderActions() {
    const { amountError, targetTokenAddressError, selfCustodyAddressError, sending } = this.state
    const hasError = !!amountError || !!targetTokenAddressError || !!selfCustodyAddressError

    return [
      <FlatButton
        key="Cancel"
        label="Cancel"
        name="Cancel"
        primary
        onClick={this.onClose}
      />,
      <FlatButton
        key="Deposit"
        label={this.state.action}
        name="Deposit"
        primary
        disabled={hasError || sending}
        onClick={this.onSend}
      />
    ]
  }

  renderFields() {
    let amountLabel
    let selfCustodyAddressLabel
    let targetTokenLabel
    this.state.action === 'transfer ETH'
      ? (amountLabel = 'The amount of ETH you want to transfer')
      : (amountLabel = 'The amount of the token you want to transfer')
    this.state.action === 'transfer ETH'
      ? (selfCustodyAddressLabel = 'The address where the ETH is to be sent')
      : (selfCustodyAddressLabel = 'The address where the token is to be sent')
    this.state.action === 'transfer ETH'
      ? (targetTokenLabel = 'Address 0x0000000000000000000000000000000000000000')
      : (targetTokenLabel = 'The address of the token to be transferred')

    return (
      <div>
        <Row middle="xs">
          <Col xs={1}>
            <ImgETH />
          </Col>
          <Col xs={11}>
            <DropDownMenu
              value={this.state.action}
              onChange={this.onChangeTransfer}
            >
              <MenuItem value={'transfer ETH'} primaryText="Transfer ETH" />
              <MenuItem value={'transfer Token'} primaryText="Transfer Token" />
            </DropDownMenu>
          </Col>
        </Row>
        <Row middle="xs">
          <Col xs={10}>
            <TextField
              autoComplete="off"
              floatingLabelText={targetTokenLabel}
              floatingLabelFixed
              fullWidth
              hintText={targetTokenLabel}
              value={this.state.targetTokenAddress}
              onChange={this.onChangeTokenAddress}
            />
          </Col>
        </Row>
        <Row middle="xs">
          <Col xs={10}>
            <TextField
              autoComplete="off"
              floatingLabelText={selfCustodyAddressLabel}
              floatingLabelFixed
              fullWidth
              hintText={selfCustodyAddressLabel}
              value={this.state.selfCustodyAddress}
              onChange={this.onChangeSelfCustodyAddress}
            />
          </Col>
        </Row>
        <Row middle="xs">
          <Col xs={10}>
            <TextField
              autoComplete="off"
              floatingLabelText={amountLabel}
              floatingLabelFixed
              fullWidth
              hintText={amountLabel}
              errorText={this.state.amountError}
              value={this.state.amount}
              onChange={this.onChangeAmount}
            />
          </Col>
          {/*}
          <Col xs={2}>
            <RaisedButton
              label="Maximum"
              secondary={true}
              // style={styles.button}
              // icon={<ActionSwapHoriz />}
              onClick={this.onMaximumAmount}
            />
          </Col>
          */}
        </Row>
      </div>
    )
  }

  onChangeTransfer = (event, index, action) => {
    this.setState({
      action
    })
  }

  onChangeTokenAddress = (event, targetTokenAddress) => {
    const { api } = this.context
    this.setState(
      {
        targetTokenAddress,
        targetTokenAddressError: validateAddress(targetTokenAddress, api)
      }
    )
  }

  onChangeSelfCustodyAddress = (event, selfCustodyAddress) => {
    const { api } = this.context
    this.setState(
      {
        selfCustodyAddress,
        selfCustodyAddressError: validateAddress(selfCustodyAddress, api)
      }
    )
  }

  onChangeAmount = (event, amount) => {
    this.setState(
      {
        amount,
        amountError: validatePositiveNumber(amount)
      },
      this.validateTotal
    )
  }

  onMaximumAmount = () => {
    const amount =
      this.state.action === 'transfer ETH'
        ? this.props.dragoDetails.dragoETHBalance
        : this.props.dragoDetails.dragoWETHBalance
    this.setState(
      {
        amount,
        amountError: validatePositiveNumber(amount)
      },
      this.validateTotal
    )
  }

  validateTotal = () => {
    const { account, accountError, amount, amountError, selfCustodyAddress, selfCustodyAddressError, targetTokenAddressError } = this.state

    if (accountError || amountError || selfCustodyAddressError || targetTokenAddressError) {
      return
    }

    if (selfCustodyAddress === '0x0000000000000000000000000000000000000000' || selfCustodyAddress === '') {
      return
    }

    if (new BigNumber(amount).gt(account.ethBalance.replace(/,/g, ''))) {
      this.setState({
        amountError: ERRORS.invalidTotal
      })
    }
  }

  onSend = () => {
    switch (this.state.action) {
      case 'transfer ETH':
        this.onSendETH()
        break
      case 'transfer Token':
        this.onSendToken()
        break
      default:
        return
    }
  }

  onSendETH = () => {
    const { api } = this.context
    const { dragoDetails, endpoint } = this.props
    const { account, amount, selfCustodyAddress, targetTokenAddress } = this.state
    // const { instance } = this.context;
    let poolApi = null
    this.setState({
      sending: true
    })
    let provider = account.source === 'MetaMask' ? window.web3 : api

    const authMsg = 'You transferred ' + amount + ' ETH'

    // Initializing transaction variables
    const transactionId = api.utils.sha3(new Date() + account.address)
    let transactionDetails = {
      status: account.source === 'MetaMask' ? 'pending' : 'authorization',
      hash: '',
      parityId: null,
      timestamp: new Date(),
      account: account,
      error: false,
      action: 'TransferETH',
      symbol: 'ETH',
      amount: amount
    }
    this.props.dispatch(
      Actions.transactions.addTransactionToQueueAction(
        transactionId,
        transactionDetails
      )
    )
    let toBeTransferred =
      '0x' + toBaseUnitAmount(new BigNumber(amount), 18).toString(16)
    poolApi = new PoolApi(provider)
    poolApi.contract.drago.init(dragoDetails.address)
    poolApi.contract.drago
      .operateOnExchangeSelfCustody(account.address, dragoDetails.address, selfCustodyAddress, targetTokenAddress, toBeTransferred)
      .then(receipt => {

        // Adding transaciont to the queue
        // Parity returns an internal transaction ID straighaway. The transaction then needs to be authorized inside the wallet.
        // MetaMask returns a receipt of the transaction once it has been mined by the network. It can take a long time.
        if (account.source === 'MetaMask') {
          transactionDetails.status = 'executed'
          transactionDetails.receipt = receipt
          transactionDetails.hash = receipt.transactionHash
          transactionDetails.timestamp = new Date()
          this.props.dispatch(
            Actions.transactions.addTransactionToQueueAction(
              transactionId,
              transactionDetails
            )
          )
        } else {
          transactionDetails.parityId = receipt
          this.props.dispatch(
            Actions.transactions.addTransactionToQueueAction(
              transactionId,
              transactionDetails
            )
          )
        }
      })
      .catch(error => {
        console.warn(error)
        const errorArray = error.message.split(/\r?\n/)
        this.props.dispatch(
          Actions.notifications.queueWarningNotification(errorArray[0])
        )
        transactionDetails.status = 'error'
        transactionDetails.error = errorArray[0]
        this.props.dispatch(
          Actions.transactions.addTransactionToQueueAction(
            transactionId,
            transactionDetails
          )
        )
        this.setState({
          sending: false
        })
      })
    this.setState(
      {
        authMsg: authMsg,
        authAccount: { ...account }
        // sending: false,
        // complete: true,
      },
      this.handleSubmit
    )
  }

  onSendToken = () => {
    const { api } = this.context
    const { dragoDetails, endpoint } = this.props
    const { account, amount, targetTokenAddress, selfCustodyAddress } = this.state
    console.log(amount, targetTokenAddress, selfCustodyAddress)
    // const { instance } = this.context;
    let poolApi = null
    this.setState({
      sending: true
    })
    let provider = account.source === 'MetaMask' ? window.web3 : api

    const authMsg = 'You transferred ' + amount + ' tokens'

    // Initializing transaction variables
    const transactionId = api.utils.sha3(new Date() + account.address)
    let transactionDetails = {
      status: account.source === 'MetaMask' ? 'pending' : 'authorization',
      hash: '',
      parityId: null,
      timestamp: new Date(),
      account: account,
      error: false,
      action: 'TransferToken',
      symbol: 'token',
      amount: amount
    }
    this.props.dispatch(
      Actions.transactions.addTransactionToQueueAction(
        transactionId,
        transactionDetails
      )
    )
    let toBeTransferred =
      '0x' + toBaseUnitAmount(new BigNumber(amount), 18).toString(16)
    poolApi = new PoolApi(provider)
    poolApi.contract.drago.init(dragoDetails.address)
    poolApi.contract.drago
      .operateOnExchangeSelfCustody(account.address, dragoDetails.address, selfCustodyAddress, targetTokenAddress, toBeTransferred)
      .then(receipt => {

        // Adding transaction to the queue
        // Parity returns an internal transaction ID straighaway. The transaction then needs to be authorized inside the wallet.
        // MetaMask returns a receipt of the transaction once it has been mined by the network. It can take a long time.
        if (account.source === 'MetaMask') {
          transactionDetails.status = 'executed'
          transactionDetails.receipt = receipt
          transactionDetails.hash = receipt.transactionHash
          transactionDetails.timestamp = new Date()
          this.props.dispatch(
            Actions.transactions.addTransactionToQueueAction(
              transactionId,
              transactionDetails
            )
          )
        } else {
          transactionDetails.parityId = receipt
          this.props.dispatch(
            Actions.transactions.addTransactionToQueueAction(
              transactionId,
              transactionDetails
            )
          )
        }
      })
      .catch(error => {

        const errorArray = error.message.split(/\r?\n/)
        this.props.dispatch(
          Actions.notifications.queueWarningNotification(errorArray[0])
        )
        transactionDetails.status = 'error'
        transactionDetails.error = errorArray[0]
        this.props.dispatch(
          Actions.transactions.addTransactionToQueueAction(
            transactionId,
            transactionDetails
          )
        )
        this.setState({
          sending: false
        })
      })
    this.setState(
      {
        authMsg: authMsg,
        authAccount: { ...account }
        // sending: false,
        // complete: true,
      },
      this.handleSubmit
    )
  }
}

export default connect(mapStateToProps)(ElementFundActionSelfCustody)
