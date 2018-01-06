// Copyright 2016-2017 Rigo Investment Sarl., RigoBlock, Rigo Investment Sagl

import styles from './actions.module.css';

import React, { Component } from 'react';

// React.PropTypes is deprecated since React 15.5.0, use the npm module prop-types instead
import PropTypes from 'prop-types';

import { RaisedButton } from 'material-ui';
import ActionAddShoppingCart from 'material-ui/svg-icons/action/add-shopping-cart';
import AvReplay from 'material-ui/svg-icons/av/replay';
import ContentSend from 'material-ui/svg-icons/content/send';
//import ActionAndroid from 'material-ui/svg-icons/action/android';
import Add from 'material-ui/svg-icons/content/add';

export default class ActionsGabcoinFactory extends Component {
  static propTypes = {
    onAction: PropTypes.func.isRequired,
    gabBalance: PropTypes.object.isRequired
  }

  render () {
    const { gabBalance } = this.props;

    return (
        <RaisedButton
          className={ styles.button }
          icon={ <Add /> }
          label='new vault'
          primary
          onTouchTap={ this.onDeployGabcoin } />
    );
  }

/*
<div className={ styles.actions }>
</div>

 onBuyIn = () => {
    this.props.onAction('BuyIn');
  }

  onTransfer = () => {
    const { gabBalance } = this.props;

    if (gabBalance && gabBalance.gt(0)) {
      this.props.onAction('Transfer');
    }
  }

  onRefund = () => {
    this.props.onAction('Refund');
  }
*/
  onDeployGabcoin = () => {
    this.props.onAction('DeployGabcoin');
  }
}
