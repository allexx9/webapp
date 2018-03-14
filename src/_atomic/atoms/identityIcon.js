// Copyright 2016-2017 Rigo Investment Sarl.

import styles from './identityIcon.module.css';

import React, { Component} from 'react';

import PropTypes from 'prop-types';

export default class IdentityIcon extends Component {
  static propTypes = {
    address: PropTypes.string.isRequired
  }

  static contextTypes = {
    api: PropTypes.object.isRequired
  }

  render () {
    const { address } = this.props;
    const { api } = this.context;

    return (
      <img
        className={ styles.icon }
        src={ api.util.createIdentityImg(address, 4) } />
    );
  }
}
