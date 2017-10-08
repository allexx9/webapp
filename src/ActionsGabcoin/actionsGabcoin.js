// Copyright 2016-2017 Gabriele Rigo

import styles from './actionsGabcoin.css';

import ApplicationGabcoinFactory from '../ApplicationGabcoinFactory';
import ApplicationGabcoinAdmin from '../ApplicationGabcoinAdmin';

import React, { Component, PropTypes } from 'react';

import Drawer from 'material-ui/Drawer';
import AppBar from 'material-ui/AppBar';

import { RaisedButton } from 'material-ui';
import ActionAddShoppingCart from 'material-ui/svg-icons/action/add-shopping-cart';
import AvReplay from 'material-ui/svg-icons/av/replay';
import ContentSend from 'material-ui/svg-icons/content/send';
import ActionAndroid from 'material-ui/svg-icons/action/android';
import AccountBalance from 'material-ui/svg-icons/action/account-balance';

import getMuiTheme from 'material-ui/styles/getMuiTheme';
import lightBaseTheme from 'material-ui/styles/baseThemes/lightBaseTheme';

const muiTheme = getMuiTheme(lightBaseTheme);

export default class ActionsGabcoin extends Component {

  state = {
        open: false,
  }

  static childContextTypes = {
    muiTheme: PropTypes.object
  };

  static propTypes = {
    onChangeGabcoinName: PropTypes.func.isRequired,
    onChangeGabcoinSymbol: PropTypes.func.isRequired,
    onAction: PropTypes.func.isRequired,
    gabBalance: PropTypes.object.isRequired
  }

  render () {
    const { gabBalance } = this.props;

    return (
      <div className={ styles.actions }>
        <div className={ styles.vault }>
          <ApplicationGabcoinFactory />
        </div>
        <RaisedButton
          className={ styles.button }
          icon={ <ContentSend /> }
          label='buy vault'
          primary
          onTouchTap={ this.onBuyGabcoin } />
        <RaisedButton
          className={ styles.button }
          icon= { <ContentSend /> }
          label='sell vault'
          primary
          onTouchTap={ this.onSellGabcoin } />
        <RaisedButton
          className={ styles.button }
          //icon={ <AvReplay /> }
          //icon= { <ActionAddShoppingCart /> }
          icon= { <AccountBalance /> }
          label='manage vaults'
          primary
          onTouchTap={ this.handleToggle } />
        <Drawer
          width={200}
          openSecondary={true}
          open={this.state.open} >
          <AppBar title="Vaults"
            onTouchTap={ this.handleToggle } />
            <ApplicationGabcoinAdmin />
        </Drawer>
      </div>
    );
  }

/*
<Drawer
  width={200}
  openSecondary={true}
  open={this.state.open} >
  <AppBar title="Gabcoins"
    onTouchTap={ this.handleToggle } />
    <ApplicationGabcoinAdmin />
</Drawer>

<ApplicationGabcoinAdmin />
<RaisedButton
  disabled={ !gabBalance || gabBalance.eq(0) }
  className={ styles.button }
  icon={ <ContentSend /> }
  label='send gabcoin'
  primary
  onTouchTap={ this.onTransfer } />
*/

  handleToggle = () => {
    this.setState({
      open: !this.state.open,
    });
  }

  getChildContext () {
    return {
      muiTheme
    };
  }

  onBuyGabcoin = () => {
    this.props.onAction('BuyGabcoin');
  }
/*
  onTransfer = () => {
    const { gabBalance } = this.props;

    if (gabBalance && gabBalance.gt(0)) {
      this.props.onAction('Transfer');
    }
  }
*/
  onSellGabcoin = () => {
    this.props.onAction('SellGabcoin');
  }
/*
  onDeploy = () => {
    this.props.onAction('Deploy');
  }*/
}
