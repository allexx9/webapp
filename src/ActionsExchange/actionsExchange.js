// Copyright 2016-2017 Gabriele Rigo

import styles from './actions.css';

import React, { Component, PropTypes } from 'react';

import { RaisedButton } from 'material-ui';
import ActionAddShoppingCart from 'material-ui/svg-icons/action/add-shopping-cart';
import AvReplay from 'material-ui/svg-icons/av/replay';
import ContentSend from 'material-ui/svg-icons/content/send';
import ActionAndroid from 'material-ui/svg-icons/action/android';
import AccountBalance from 'material-ui/svg-icons/action/account-balance';

export default class ActionsExchange extends Component {
  static propTypes = {
    onAction: PropTypes.func.isRequired,
    gabBalance: PropTypes.object.isRequired
  }

  render () {
    const { gabBalance } = this.props;

    return (
      <div className={ styles.actions }>
        <RaisedButton
          className={ styles.button }
          icon={ <AccountBalance /> }
          label='deposit'
          primary
          onTouchTap={ this.onDeposit } />
        <RaisedButton
          className={ styles.button }
          icon={ <ContentSend /> }
          label='withdraw'
          primary
          onTouchTap={ this.onWithdraw } />
        <RaisedButton
          className={ styles.button }
          icon= { <ContentSend /> }
          label='placeOrder'
          primary
          onTouchTap={ this.onPlaceOrder } />
        <RaisedButton
          disabled={ !gabBalance || gabBalance.eq(0) }
          className={ styles.button }
          icon={ <ContentSend /> }
          label='cancelOrder'
          primary
          onTouchTap={ this.onCancelOrder } />
        <RaisedButton
          className={ styles.button }
          //icon={ <AvReplay /> }
          //icon= { <ActionAddShoppingCart /> }
          icon= { <AccountBalance /> }
          label='finalize'
          primary
          onTouchTap={ this.onFinalize } />
      </div>
    );
  }

  onWithdraw = () => {
    this.props.onAction('Withdraw');
  }

  onCancelOrder = () => {
    this.props.onAction('CancelOrder');
  }
/*
  onCancelOrder = () => {
    const { gabBalance } = this.props;

    if (gabBalance && gabBalance.gt(0)) {
      this.props.onAction('CancelOrder');
    }
  }
*/

  onPlaceOrder = () => {
    this.props.onAction('PlaceOrder');
  }

  onFinalize = () => {
    this.props.onAction('Finalize');
  }

  onDeposit = () => {
    this.props.onAction('Deposit');
  }
}
