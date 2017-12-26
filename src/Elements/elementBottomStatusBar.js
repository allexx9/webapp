import  * as Colors from 'material-ui/styles/colors'
import { transparent} from 'material-ui/styles/colors';
import { Row, Col } from 'react-flexbox-grid';
import PropTypes from 'prop-types';
import React, { Component } from 'react';

import styles from './elementBottomStatusBar.module.css';

export default class ElementBottomStatusBar extends Component {

  static propTypes = {
    // accountName: PropTypes.string.isRequired,
    // blockNumber: PropTypes.string,
    networkName: PropTypes.string.isRequired,
  };

  

  render () {
    const { blockNumber, networkName } = this.props
    const numberWithCommas = (x) => {
      return x.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
    }
    return (
      <Row className={styles.networkStatus} between="xs">
        <Col xs={10}>
        ©2017 RigoInvestment. All rights reserved.
        </Col>
        <Col xs={2} className={styles.networkStatusCounter}>
        {numberWithCommas(blockNumber)} <span className={styles.networkName}>{networkName}</span>
        </Col>
      </Row>
    );
  }
}
