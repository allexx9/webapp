import  * as Colors from 'material-ui/styles/colors'
import { Row, Col } from 'react-flexbox-grid';
import { transparent} from 'material-ui/styles/colors';
import NotificationWifi from 'material-ui/svg-icons/notification/wifi';
import PropTypes from 'prop-types';
import React, { Component } from 'react';

import styles from './elementBottomStatusBar.module.css';
import classnames from 'classnames'

export default class ElementBottomStatusBar extends Component {

  static propTypes = {
    // accountName: PropTypes.string.isRequired,
    // blockNumber: PropTypes.string,
    networkName: PropTypes.string.isRequired,
    networkError: PropTypes.string.isRequired,
    networkStatus: PropTypes.string.isRequired,
  };

  
  renderNetworkStatus = () => {
    const { networkStatus, networkError } = this.props
    var networkIconColor = Colors.green600
    var toolTipType = 'info'
    console.log(this.props.networkError)
    switch (this.props.networkError) {
      case ('networkOk'):
        networkIconColor = Colors.green600
        break;
      case ('networkWarning'):
        networkIconColor = Colors.red600
        break;
      default:
        networkIconColor = Colors.green600
    }
    switch (this.props.networkError) {
      case ('networkOk'):
        toolTipType = 'info'
        break;
      case ('networkWarning'):
        toolTipType = 'error'
        break;
      default:
        toolTipType = 'info'
    }

    const tooltip = {
      backgroundColor: '#fff',
    }
    return (
      <a
        // data-tip
        // data-for='networkStatus'
        // // data-offset="{'left': 50}"
        // data-type={toolTipType} 
        className={classnames(styles.tooltip)}
      >
        <NotificationWifi
          className={classnames(styles.networkIcon)} color={networkIconColor}

        />
        <div className={styles.tooltiptext}  >{networkStatus}</div>
      </a>
    )
  }

  render() {
    const { blockNumber, networkName, networkStatus, networkError } = this.props
    console.log(networkStatus)
    console.log(networkError)
    var toolTipType = 'info'
    const numberWithCommas = (x) => {
      return x.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
    }
    switch (this.props.networkError) {
      case ('networkOk'):
        toolTipType = 'info'
        break;
      case ('networkWarning'):
        toolTipType = 'error'
        break;
      default:
        toolTipType = 'info'
    } 
    return (
      <Row className={styles.networkStatus} between="xs">
        <Col xs={9}>
          ©2017 RigoInvestment. All rights reserved.
        </Col>
        <Col
          xs={3}
          className={styles.networkStatusCounter}

        >
          <div className={styles.networkDataContainer}

          >
            {numberWithCommas(blockNumber)}&nbsp;&nbsp;<span className={styles.networkName}>{networkName}</span>&nbsp;&nbsp;{this.renderNetworkStatus()}
          </div>
        </Col>
        <span>{networkStatus}</span>
      </Row>
    );
  }
}
