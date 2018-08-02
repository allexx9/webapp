// Copyright 2016-2017 Rigo Investment Sagl.

import React, { Component } from 'react';
import styles from './exchangeSelectItem.module.css';
import PropTypes from 'prop-types';
import TokenIcon from '../atoms/tokenIcon'


export default class ExchangeTokenSelectItem extends Component {
  static propTypes = {
    baseTokenSymbol: PropTypes.string.isRequired,
    quoteTokenSymbol: PropTypes.string.isRequired,

  };

  render () {
    const { exchange } = this.props;

    return (
      <div className={ styles.account }>
        <div className={ styles.image }>
        <div>
        <TokenIcon size={40} symbol={this.props.baseTokenSymbol} />
        </div>

        </div>
        <div className={ styles.details }>
          <div className={ styles.name }>
            { this.props.baseTokenSymbol +"/"+ this.props.quoteTokenSymbol  }
          </div>
        </div>
      </div>
    );
  }
}