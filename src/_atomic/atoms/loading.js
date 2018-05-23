// Copyright 2016-2017 Gabrele Rigo

import styles from './loading.module.css';
import React, { Component } from 'react';
import { CircularProgress } from 'material-ui';
import PropTypes from 'prop-types';
import  * as Colors from 'material-ui/styles/colors'

export default class Loading extends Component {

  static propTypes = {
    size: PropTypes.number
  }
  
  static defaultProps = {
    size: 60
  }
  
  render () {
    return (
      <div className={ styles.loading }>
        <CircularProgress size={ this.props.size } color={Colors.blue500}/>
      </div>
    );
  }
}
