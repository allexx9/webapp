// Copyright 2016-2017 Gabriele Rigo

import styles from './actions.module.css';

import React, { Component } from 'react';

// React.PropTypes is deprecated since React 15.5.0, use the npm module prop-types instead
import PropTypes from 'prop-types';

import { RaisedButton } from 'material-ui';
import ActionAddShoppingCart from 'material-ui/svg-icons/action/add-shopping-cart';
import AvReplay from 'material-ui/svg-icons/av/replay';
import ContentSend from 'material-ui/svg-icons/content/send';
import ActionAndroid from 'material-ui/svg-icons/action/android';
import AccountBalance from 'material-ui/svg-icons/action/account-balance';

export default class ActionsGabcoinAdmin extends Component {
  static contextTypes = {
    //instance: PropTypes.object
  }

  static propTypes = {
    onAction: PropTypes.func.isRequired,
    gabBalance: PropTypes.object.isRequired
  }

  render () {
    //const { instance } = this.context;

    const { gabBalance } = this.props;

    return (
      <div className={ styles.actions }>
        <RaisedButton
          //className={ styles.button }
          icon={ <ContentSend /> }
          label='Casper Deposit'
          disabled={true}
          primary={true}
          fullWidth={true}
          //disabled={ !instance || instance.eq(0) }
          //primary
          onTouchTap={ this.onDeposit } />
        <RaisedButton
          //className={ styles.button }
          icon={ <ContentSend /> }
          label='Casper Withdraw'
          disabled={true}
          primary
          fullWidth={true}
          onTouchTap={ this.onWithdraw } />
        <RaisedButton
          //className={ styles.button }
          icon= { <ContentSend /> }
          label='Set Fee'
          disabled={true}
          primary
          fullWidth={true}
          onTouchTap={ this.onSetFee } />
        <RaisedButton
          //disabled={ !gabBalance || gabBalance.eq(0) }
          //className={ styles.button }
          icon={ <ContentSend /> }
          label='Fee Account'
          disabled={true}
          primary={true}
          fullWidth={true}
          onTouchTap={ this.onSetFeeCollector } />
        <RaisedButton
          //disabled={ !gabBalance || gabBalance.eq(0) }
          //className={ styles.button }
          icon={ <ContentSend /> }
          label='Update Price'
          disabled={true}
          primary={true}
          fullWidth={true}
          onTouchTap={ this.onUpdatePrice } />
      </div>
    );
  }

  onCasperDeposit = () => {
    this.props.onAction('CasperDeposit');
  }

  onCasperWithdraw = () => {
    this.props.onAction('CasperWithdraw');
  }

  onSetFee = () => {
    this.props.onAction('SetFee');
  }

  onSetFeeCollector = () => {
    this.props.onAction('SetFeeCollector');
  }

  onUpdatePrice = () => {
    this.props.onAction('UpdatePrice');
  }

/*
  onCancelOrder = () => {
    const { gabBalance } = this.props;

    if (gabBalance && gabBalance.gt(0)) {
      this.props.onAction('CancelOrder');
    }
  }*/
}
