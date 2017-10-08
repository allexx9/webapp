// Copyright 2016-2017 Gabriele Rigo

import { api } from '../parity';
import styles from './identityIcon.css';

import React, { Component, PropTypes } from 'react';

export default class IdentityIcon extends Component {
  static propTypes = {
    address: PropTypes.string.isRequired
  }

  render () {
    const { address } = this.props;

    return (
      <img
        className={ styles.icon }
        src={ api.util.createIdentityImg(address, 4) } />
    );
  }
}
