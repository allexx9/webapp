import  * as Colors from 'material-ui/styles/colors';
import { Grid, Row, Col } from 'react-flexbox-grid';
import {Toolbar, ToolbarGroup, ToolbarSeparator, ToolbarTitle} from 'material-ui/Toolbar';
import ActionSwapHoriz from 'material-ui/svg-icons/action/swap-horiz';
import BigNumber from 'bignumber.js';
import Dialog from 'material-ui/Dialog';
import FlatButton from 'material-ui/FlatButton';
import PropTypes from 'prop-types';
import RaisedButton from 'material-ui/RaisedButton';
import React from 'react';
import TextField from 'material-ui/TextField';

import {
  Table,
  TableBody,
  TableHeader,
  TableHeaderColumn,
  TableRow,
  TableRowColumn,
} from 'material-ui/Table';

import { ERRORS, validateAccount, validatePositiveNumber, validateNewName, validateNewSymbol } from './validation';
import { formatCoins, formatEth, formatHash, toHex } from '../../format';
import * as abis from '../../contracts';
import AccountSelector from './elementAccountSelector'
import IdentityIcon from '../../IdentityIcon'
import utils, {dragoApi} from '../../utils/utils'
import DragoApi from '../../DragoApi/src'

import styles from './elementFundCreateAction.module.css';

const customContentStyle = {
  minHeight: '500px',
};

export default class ElementFundCreateAction extends React.Component {

  static contextTypes = {
    api: PropTypes.object.isRequired
  };

  static propTypes = {
    // dragoDetails: PropTypes.object.isRequired, 
    accounts: PropTypes.array.isRequired
  };
  
  state = {
    open: false,
    account: {},
    accountError: ERRORS.invalidAccount,
    amountError: ERRORS.invalidAmount,
    dragoName: '',
    dragoNameError: ERRORS.invalidName,
    dragoSymbol: '',
    dragoSymbolError: ERRORS.invalidSymbol,
    canSubmit: false,
    sending: false,
    complete: false,
  }


  handleOpen = () => {
    this.setState({open: true});
  }

  handleClose = () => {
    this.setState({
      open: false,
      account: {},
      accountError: ERRORS.invalidAccount,
      dragoName: ' ',
      dragoNameError: ERRORS.invalidName,
      dragoSymbol: ' ',
      dragoSymbolError: ERRORS.invalidSymbol,
      canSubmit: false,
      sending: false,
      complete: false,
    });
  }


  onChangeAddress = (account) => {
    const { api } = this.context;
      this.setState({
        account,
        accountError: validateAccount(account,api)
      });
    }

    onChangeName = (event, dragoName) => {
      this.setState({
        dragoName : dragoName.toLowerCase(),
        dragoNameError: validateNewName(dragoName)
      });
    }
  
    onChangeSymbol = (event, dragoSymbol) => {
      this.setState({
        dragoSymbol: dragoSymbol.toUpperCase(),
        dragoSymbolError: validateNewSymbol(dragoSymbol)
      });
    }

    onSend = () => {
      const { api } = this.context
      const dragoName = this.state.dragoName.toString();
      const dragoSymbol = this.state.dragoSymbol.toString();
      const values = [dragoName, dragoSymbol, this.state.account.address]
      var dragoApi = null;

      this.setState({
        sending: true
      })

      if(this.state.account.source === 'MetaMask') {
        const web3 = window.web3
        dragoApi = new DragoApi(web3)
        dragoApi.contract.dragofactory.init()
        dragoApi.contract.dragofactory.createDrago(dragoName, dragoSymbol, this.state.account.address)
        .then ((result) =>{
          console.log(result)
          this.props.snackBar('Deploy awaiting for authorization')
          // this.setState({
          //   sending: false,
          //   complete: true
          // });
        })
        .catch((error) => {
          console.error('error', error)
          this.setState({
            sending: false
          })
        })
      } else {
        dragoApi = new DragoApi(api)
        dragoApi.contract.dragofactory.init()
        .then(()=>{
          dragoApi.contract.dragofactory.createDrago(dragoName, dragoSymbol, this.state.account.address)
        })
        .then (() =>{
          this.props.snackBar('Deploy awaiting for authorization')
          // this.setState({
          //   sending: false,
          //   complete: true
          // });
        })
        .catch((error) => {
          console.error('error', error)
          this.setState({
            sending: false
          })
        })
      }
      console.log(dragoApi)
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
  
      const { accountError, dragoNameError, dragoSymbolError, sending } = this.state;
      const hasError = !!( accountError || dragoNameError || dragoSymbolError);
  
      return ([
        <FlatButton
          label='Cancel'
          primary
          onTouchTap={ this.handleClose } />,
        <FlatButton
          label='Deploy'
          primary
          disabled={ hasError || sending }
          onTouchTap={ this.onSend } />
      ]);
    }

    render() {
      const { accounts } = this.props
      const { accountError, amountError, sending } = this.state;
      const hasError = !!(this.state.accountError || this.state.amountError );
      const labelStyle = {
        color: '#FFFFFF',
        fontWeight: 700
      }
      const nameLabel = 'The name of your brand new drago';
      const symbolLabel = 'The symbol of your brand new drago';


      return (
        <div>
          <FlatButton label="Deploy" primary={true} onClick={this.handleOpen} 
            labelStyle={labelStyle}
            backgroundColor={Colors.blue500}
            hoverColor={Colors.blue300}
            />
            <Dialog
              title='Deploy new Drago'
              actions={ this.renderActions() }
              modal={false}
              open={this.state.open}
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
                  hintText='Drago name'
                  name='name'
                  id='name'
                  errorText={ this.state.dragoNameError }
                  value={ this.state.dragoName } 
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
                  hintText='Drago symbol (3 letters)'
                  errorText={ this.state.dragoSymbolError }
                  name='symbol'
                  id='symbol'
                  value={ this.state.dragoSymbol }
                  onChange={ this.onChangeSymbol } />
                </Col>
            </Row>
          </Dialog>
        </div>
      );
    }
}