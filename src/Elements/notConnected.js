import React, { Component } from 'react'
import { Row, Col, Grid } from 'react-flexbox-grid';
import BigNumber from 'bignumber.js';
import Dialog from 'material-ui/Dialog';
import { Link } from 'react-router-dom'

import styles from './notConnected.module.css'
import PropTypes from 'prop-types';
import {APP, DS} from '../_utils/const.js'

var td = null

class NotConnected extends Component {

    state = {
      counter: 15
    }

    static contextTypes = {
      isSyncing: PropTypes.bool.isRequired,
      syncStatus: PropTypes.object.isRequired,
    };

    componentDidMount () {
      this.counter()
    }
   
    componentWillUnmount () {
      clearTimeout(td)
    }

    
    buildUrlPath = () => {
      var path = window.location.hash.split( '/' );
      // path.splice(-1,1);
      // var url = path.join('/');
      return path[2]
      }

    counter = () => {
      var x = this
      var { counter } = this.state;
      td = setTimeout(function() {
        if (counter > 0) {
          x.setState({ counter: counter - 1 })
          // console.log('timeout')
          x.counter()
        } else {
          x.setState({ counter: 15 })
          // console.log('reset')
          x.counter()
        }
      }, 1000);      
    }

    renderSyncing = () => {
      const progressBlocks = new BigNumber(this.props.syncStatus.currentBlock).div(new BigNumber(this.props.syncStatus.highestBlock)).mul(100).toFixed(2)
      const progressWarp = new BigNumber(this.props.syncStatus.warpChunksProcessed).div(new BigNumber(this.props.syncStatus.warpChunksAmount)).mul(100).toFixed(2)
      return (
        <Dialog
        open={true}
        modal={true}
        title={this.renderTitle()}
        >
          <Row>
            <Col xs={12}>
              <Row>
              <Col xs={12}>
              <br />
              <h3 className={styles.warningText}>Node syncing.</h3>
              <p>Your node is syncing with Ethereum blockchain.</p>
              <p>Please wait until fully synced before accessing RigoBlock.</p>
              <p>Syncing progress:</p>
              <p>Block sync {new BigNumber(this.props.syncStatus.currentBlock).toFormat()} of {new BigNumber(this.props.syncStatus.highestBlock).toFormat()} ({progressBlocks}%)</p>
              <p>Warp sync {new BigNumber(this.props.syncStatus.warpChunksProcessed).toFormat()} of {new BigNumber(this.props.syncStatus.warpChunksAmount).toFormat()} ({progressWarp}%)</p>
            </Col>
              </Row>
            </Col>
          </Row>
        </Dialog>
      )
    }

    renderNotConnected = () => {
      return (
        <Dialog
          open={true}
          modal={true}
          title={this.renderTitle()}
        >
          <Row>
            <Col xs={12}>
              <Row>
                <Col xs={12}>
                  <h3 className={styles.warningText}>CONNECTION ERROR</h3>
                  <p>Unable to connect to the network.</p>
                  <p>Trying to establish a new connection in {this.state.counter} seconds... </p>
                  <p>Please contact our support or {<Link to={DS + APP + DS + this.buildUrlPath() + DS + "config"}>select</Link>} a different network.</p>
                </Col>
              </Row>
            </Col>
          </Row>
        </Dialog>
      )
    }

    renderTitle = () =>{
      return (
      <Row className={styles.modalHeader}>
        <Col xs={12}>
          <Row className={styles.modalHeaderActions} middle="xs" center="xs">
            <Col xs>
            <img src="img/rb_black.png" alt="logo" />
            
            </Col>
          </Row>
        </Col>
      </Row>
      )
    }
    
    render() {
      const { isSyncing, syncStatus} = this.context
      console.log('Sync Status: ', syncStatus)
      console.log('Syncing: ', isSyncing)
      return isSyncing ? this.renderSyncing() : this.renderNotConnected()
    }
  }

  export default NotConnected