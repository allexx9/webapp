// Copyright 2016-2017 Rigo Investment Sarl.

import styles from './identityIcon.module.css';

import React, { Component} from 'react';

import PropTypes from 'prop-types';

export default class IdentityIcon extends Component {

  static propTypes = {
    address: PropTypes.string.isRequired,
    size: PropTypes.string
  }

  static defaultProps = {
    size: "40px"
  }

  static contextTypes = {
    api: PropTypes.object.isRequired
  }

  render () {
    const { address, size } = this.props;
    const { api } = this.context;

    return (
      <img
        className={ styles.icon }
        style={{width: size, height: size}}
        src={ api.util.createIdentityImg(address, 4) } />
    );
  }
}
