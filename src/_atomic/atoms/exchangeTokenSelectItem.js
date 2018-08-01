// Copyright 2016-2017 Rigo Investment Sagl.

import React, { Component } from 'react';
import styles from './exchangeSelectItem.module.css';
import PropTypes from 'prop-types';
import TokenIcon from '../atoms/tokenIcon'


export default class ExchangeTokenSelectItem extends Component {
  static propTypes = {
    quoteTokenName: PropTypes.string.isRequired,
    baseTokenName: PropTypes.string.isRequired,
  };

  render () {
    const { exchange } = this.props;

    return (
      <div className={ styles.account }>
        <div className={ styles.image }>
        <div>
        <TokenIcon size={40} symbol={this.props.quoteTokenName} />
        </div>

        </div>
        <div className={ styles.details }>
          <div className={ styles.name }>
            { this.props.quoteTokenName +"/"+ this.props.baseTokenName  }
          </div>
        </div>
      </div>
    );
  }
}