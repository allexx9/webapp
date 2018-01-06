// Copyright 2016-2017 Gabriele Rigo

import { Grid, Row, Col } from 'react-flexbox-grid';
import PropTypes from 'prop-types';
import React, { Component } from 'react';
import  * as Colors from 'material-ui/styles/colors';
import styles from './elementDialogAddressTitle.module.css';
import IdentityIcon from '../IdentityIcon';


export default class ElementDialogAddressTitle extends Component {

  static propTypes = {
    tokenDetails: PropTypes.object.isRequired,
  }

  render = () => {
    const {tokenDetails} = this.props
    return (
      <Row className={styles.modalTitle}>
        <Col xs={12} md={1} className={styles.dragoTitle}>
          <h2><IdentityIcon address={ tokenDetails.address } /></h2>
        </Col>
        <Col xs={12} md={11} className={styles.dragoTitle}>
        <p>{tokenDetails.symbol} | {tokenDetails.name} </p>
        <small>{tokenDetails.address}</small>
        </Col>
      </Row>
    )
  }
}
