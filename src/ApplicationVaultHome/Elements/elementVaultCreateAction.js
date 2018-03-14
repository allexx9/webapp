import  * as Colors from 'material-ui/styles/colors';
import { Row, Col } from 'react-flexbox-grid';
import Add from 'material-ui/svg-icons/content/add';
import Dialog from 'material-ui/Dialog';
import FlatButton from 'material-ui/FlatButton';
import PropTypes from 'prop-types';
import React from 'react';
import TextField from 'material-ui/TextField';
import { ERRORS, validateAccount, validateNewName, validateNewSymbol } from '../../_utils/validation';
import AccountSelector from '../../Elements/elementAccountSelector'
import DragoApi from '../../PoolsApi/src'
import ElementDialogHeadTitle from '../../Elements/elementDialogHeadTitle'
import ElementFundActionAuthorization from '../../Elements/elementActionAuthorization'
import { connect } from 'react-redux';

const customContentStyle = {
  minHeight: '500px',
};

function mapStateToProps(state) {
  return state
//   return {
//     count: state.count
//   };
}

class ElementVaultCreateAction extends React.Component {

  static contextTypes = {
    api: PropTypes.object.isRequired,
    addTransactionToQueue: PropTypes.func
  };

  static propTypes = {
    // vaultDetails: PropTypes.object.isRequired, 
    accounts: PropTypes.array.isRequired,
    dispatch: PropTypes.func.isRequired
  };
  
  state = {
    open: false,
    account: {},
    accountError: ERRORS.invalidAccount,
    amountError: ERRORS.invalidAmount,
    vaultName: '',
    vaultNameError: ERRORS.invalidName,
    vaultSymbol: '',
    vaultSymbolError: ERRORS.invalidSymbol,
    canSubmit: false,
    sending: false,
    complete: false,
    vaultDetails: ''
  }

  addTransactionToQueueAction = (transactionId, transactionDetails) => {
    return {
      type: 'ADD_TRANSACTION',
      transaction: { transactionId, transactionDetails }
    }
  };

  handleOpen = () => {
    console.log('open')
    this.setState({
      open: true,
      openAuth: false,
      authMsg: '',
      account: {},
      accountError: ERRORS.invalidAccount,
      vaultName: '',
      vaultNameError: ERRORS.invalidName,
      vaultSymbol: '',
      vaultSymbolError: ERRORS.invalidSymbol,
      canSubmit: false,
      sending: false,
      complete: false,
    });
  }

  handleClose = () => {
    this.setState({
      open: false,
      openAuth: false,
      authMsg: '',
      account: {},
      accountError: ERRORS.invalidAccount,
      vaultName: '',
      vaultNameError: ERRORS.invalidName,
      vaultSymbol: '',
      vaultSymbolError: ERRORS.invalidSymbol,
      canSubmit: false,
      sending: false,
      complete: false,
    });
  }

  handleSubmit = () => {
    this.setState(
      { openAuth: true }
    );
  }

  onChangeAddress = (account) => {
    const { api } = this.context;
      this.setState({
        account,
        accountError: validateAccount(account,api)
      });
    }

    onChangeName = (event, vaultName) => {
      this.setState({
        vaultName : vaultName.toLowerCase(),
        vaultNameError: validateNewName(vaultName)
      });
    }
  
    onChangeSymbol = (event, vaultSymbol) => {
      this.setState({
        vaultSymbol: vaultSymbol.toUpperCase(),
        vaultSymbolError: validateNewSymbol(vaultSymbol)
      });
    }

    onSend = () => {
      const { api } = this.context
      const vaultName = this.state.vaultName.toString();
      const vaultSymbol = this.state.vaultSymbol.toString();
      const vaultDetails = {
        name: vaultName,
        symbol: vaultSymbol
      }
      const values = [vaultName, vaultSymbol, this.state.account.address]
      // Setting variables depending on account source
      var provider = this.state.account.source === 'MetaMask' ? window.web3 : api
      var dragoApi = null;
      // Initializing transaction variables
      const authMsg = 'You deployed the vault ' + vaultSymbol + ' | ' + vaultName 
      const transactionId = api.util.sha3(new Date() + vaultSymbol)
      var transactionDetails = {
        status: this.state.account.source === 'MetaMask' ? 'pending' : 'authorization',
        hash: '',
        parityId: null,
        timestamp: new Date(),
        account: this.state.account,
        error: false,
        action: 'CreateVault',
        symbol: vaultSymbol,
        amount: ''
      }
      this.props.dispatch(this.addTransactionToQueueAction(transactionId, transactionDetails))
      const {account} = this.state
      this.setState({
        sending: true
      })
      dragoApi = new DragoApi(provider)
      dragoApi.contract.vaultfactory.init()
      .then(()=>{
        dragoApi.contract.vaultfactory.createVault(vaultName, vaultSymbol, this.state.account.address)
        .then ((receipt) =>{
          console.log(receipt)
          // this.props.snackBar('Deploy awaiting for authorization')
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
          this.setState({
            sending: false,
            complete: true
          });
        })
        .catch((error) => {
          console.log(error)
          this.props.snackBar('Your wallet returned an error.')
          transactionDetails.status = 'error'
          transactionDetails.hash = ''
          transactionDetails.error = error
          console.log(transactionDetails)
          this.props.dispatch(this.addTransactionToQueueAction(transactionId, transactionDetails))
          this.setState({
            sending: false
          })
        })
      })
      this.setState({
        authMsg: authMsg,
        authAccount: { ...this.state.account },
        sending: false,
        vaultDetails: vaultDetails
        // complete: true,
      }, this.handleSubmit)
    }

    renderHeader = () => {
      return (
        <div>
            <ElementDialogHeadTitle primaryText='Deploy new Vault' />
        </div>
  
      )
    }

    renderActions () {
      const { complete } = this.state;
  
      if (complete) {
        return (
          <FlatButton
            label='Done'
            primary
            onTouchTap={ this.handleClose } />
        );
      }
  
      const { accountError, vaultNameError, vaultSymbolError, sending } = this.state;
      const hasError = !!( accountError || vaultNameError || vaultSymbolError);
  
      return ([
        <FlatButton
          key='CancelButton'
          label='Cancel'
          primary
          onTouchTap={ this.handleClose } />,
        <FlatButton
          key='SubmitButton'
          label='Deploy'
          primary
          disabled={ hasError || sending }
          onTouchTap={ this.onSend } />
      ]);
    }

    render() {
      const { openAuth, authMsg, authAccount, vaultDetails } = this.state;
      const labelStyle = {
        color: '#FFFFFF',
        fontWeight: 700
      }
      const titleStyle = {
        padding: 0,
        lineHeight: '20px',
        fontSize: 16
      }
      const nameLabel = 'The name of your brand new vault';
      const symbolLabel = 'The symbol of your brand new vault';

      if (openAuth) {
        return (
          <div>
          <FlatButton label="Deploy" primary={true} onClick={this.handleOpen} 
            labelStyle={labelStyle}
            backgroundColor={Colors.blueGrey500}
            hoverColor={Colors.blueGrey300}
            
            />
            <ElementFundActionAuthorization
              vaultDetails={vaultDetails}
              authMsg={authMsg}
              account={authAccount}
            />
          </div>
        )
      }

      return (
        <div>
          <FlatButton label="Deploy" primary={true} onClick={this.handleOpen} 
            labelStyle={labelStyle}
            backgroundColor={Colors.blueGrey500}
            hoverColor={Colors.blueGrey300}
            icon={<Add color='#FFFFFF'/>}
            />
            <Dialog
              title={this.renderHeader()}
              actions={ this.renderActions() }
              modal={false}
              open={this.state.open}
              titleStyle={titleStyle}
              contentStyle={customContentStyle}
              onRequestClose={this.handleClose}
            >
            <Row>
              <Col xs={12}>
                <AccountSelector
                accounts={ this.props.accounts }
                account={ this.state.account }
                errorText={ this.state.accountError }
                floatingLabelText='From account'
                hintText='The account the transaction will be made from'
                onSelect={ this.onChangeAddress } />
              </Col>
            </Row>
            <Row>
                <Col xs={12}>
                <TextField
                  autoComplete='off'
                  floatingLabelFixed
                  floatingLabelText={ nameLabel }
                  fullWidth
                  hintText='Vault name'
                  name='name'
                  id='name'
                  errorText={ this.state.vaultNameError }
                  value={ this.state.vaultName } 
                  onChange={ this.onChangeName } />
                </Col>
            </Row>
            <Row>
                <Col xs={12}>
                <TextField
                  autoComplete='off'
                  floatingLabelFixed
                  floatingLabelText={ symbolLabel }
                  fullWidth
                  hintText='Vault symbol (3 letters)'
                  errorText={ this.state.vaultSymbolError }
                  name='symbol'
                  id='symbol'
                  value={ this.state.vaultSymbol }
                  onChange={ this.onChangeSymbol } />
                </Col>
            </Row>
          </Dialog>
        </div>
      );
    }
}

export default connect(mapStateToProps)(ElementVaultCreateAction)