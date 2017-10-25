// Copyright 2016-2017 Gabriele Rigo

import IdentityIcon from '../../IdentityIcon';
import { formatCoins, formatEth, formatHash } from '../../format';

import styles from '../events.module.css';

import moment from 'moment';
import React, { Component } from 'react';

// React.PropTypes is deprecated since React 15.5.0, use the npm module prop-types instead
import PropTypes from 'prop-types';

const EMPTY_COLUMN = (
  <td></td>
);

export default class Event extends Component {
  static contextTypes = {
    accountsInfo: PropTypes.object.isRequired,
    api: PropTypes.object.isRequired
  }

  static propTypes = {
    event: PropTypes.object,
    value: PropTypes.object,
    price: PropTypes.object,
    gabcoinname: PropTypes.string, //gabcoinname: PropTypes.object,
    gabcoinsymbol: PropTypes.string, //gabcoinsymbol: PropTypes.object,
    gabcoinAddress: PropTypes.string, //gabcoinAddress: PropTypes.object,
    fromAddress: PropTypes.string,
    toAddress: PropTypes.string
  }

  state = {
    block: null
  }

  componentDidMount () {
    this.loadBlock();
  }

  render () {
    const { event, fromAddress, toAddress, price, value, ethvalue, gabcoinname, gabcoinsymbol, gabcoinAddress } = this.props;
    const { block } = this.state;
    const { state, type } = event;
    const cls = `${styles.event} ${styles[state]} ${styles[type.toLowerCase()]}`;

    return (
      <tr className={ cls }>
        { this.renderType(type) }
        { this.renderValue(value) }
        { this.renderEthValue(ethvalue) }
        { this.renderName(gabcoinname) }
        { this.renderSymbol(gabcoinsymbol) }
        { this.renderAddress(gabcoinAddress) }
        { this.renderAddress(fromAddress) }
        { this.renderAddress(toAddress) }
        { this.renderTimestamp(block) }
        { this.renderPrice(price) }
      </tr>
    );
  }

  renderTimestamp (block) {
    return (
      <td className={ styles.blocknumber }>
        { !block ? ' ' : moment(block.timestamp).fromNow() }
      </td>
    );
  }

  renderAddress (address) {
    if (!address) {
      return EMPTY_COLUMN;
    }

    return (
      <td className={ styles.account }>
        <IdentityIcon address={ address } />
        { this.renderAddressName(address) }
      </td>
    );
  }

  renderAddressName (address) {
    const { accountsInfo } = this.context;
    const account = accountsInfo[address];

    if (account && account.name) {
      return (
        <div className={ styles.name }>
          { account.name }
        </div>
      );
    }

    return (
      <div className={ styles.address }>
        { /*formatHash(*/address/*)*/ }
      </div>
    );
  }

  renderPrice (price) {
    if (!price) {
      return EMPTY_COLUMN;
    }

    return (
      <td className={ styles.ethvalue }>
        { formatEth(price) }<small> ETH</small>
      </td>
    );
  }

  renderValue (value) {
    if (!value) {
      return EMPTY_COLUMN;
    }

    return (
      <td className={ styles.gabvalue }>
        { formatCoins(value) }<small> gabcoins</small>
      </td>
    );

  }

  renderEthValue (ethvalue) {
	const { api } = this.context;
    if (!ethvalue) {
      return EMPTY_COLUMN;
    }

    return (
      <td className={ styles.ethvalue }>
        { formatEth(ethvalue,api) }<small> ETH</small>
      </td>
    );
  }

  renderName (gabcoinname) {
    if (!gabcoinname) {
      return EMPTY_COLUMN;
    }

    return (
      <td>
        { gabcoinname }
      </td>
    );
  }

  renderSymbol (gabcoinsymbol) {
    if (!gabcoinsymbol) {
      return EMPTY_COLUMN;
    }

    return (
      <td>
        { gabcoinsymbol }
      </td>
    );
  }

/*
className={ styles.name }
className={ styles.symbol }

renderName (gabcoinname) {
  if (!gabcoinName) {
    return EMPTY_COLUMN;
  }

  return (
    <td className={ styles.name }>
      { gabcoinName }<small> NAME</small>
    </td>
  );
}
*/
  //{ type }
  renderType (type) {
    return (
      <td className={ styles.type }>
        { 'new vault' }
      </td>
    );
  }

  loadBlock () {
    const { api } = this.context;
    const { event } = this.props;

    if (!event || !event.blockNumber || event.blockNumber.eq(0)) {
      return;
    }

    api.eth
      .getBlockByNumber(event.blockNumber)
      .then((block) => {
        this.setState({ block });
      });
  }
}
