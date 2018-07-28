import React, { Component } from 'react'
import { Row, Col, Grid } from 'react-flexbox-grid';
import BigNumber from 'bignumber.js';
import Dialog from 'material-ui/Dialog';
import { Link } from 'react-router-dom'

import styles from './elementNotConnected.module.css'
import PropTypes from 'prop-types';
import { APP, DS } from '../_utils/const.js'
import SectionHeader from '../_atomic/atoms/sectionHeader';
import SyncStatusCurrentBlock from '../_atomic/atoms/syncStatusCurrentBlock'
import SyncStatusWarpChunksProcessed from '../_atomic/atoms/syncStatusWarpChunksProcessed'


var td = null

const style = {
  dialogRoot: {
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    paddingTop: 0
  },
  dialogContent: {
    position: "relative",
    width: "80vw",
    transform: "",
  },
  dialogBody: {
    paddingBottom: 0
  }
};

class ElementNotConnected extends Component {

  state = {
    counter: 15
  }

  static contextTypes = {
    isSyncing: PropTypes.bool.isRequired,
    syncStatus: PropTypes.object.isRequired,
  };

  componentDidMount() {
    this.counter()
  }

  componentWillUnmount() {
    clearTimeout(td)
  }


  buildUrlPath = () => {
    var path = window.location.hash.split('/');
    // path.splice(-1,1);
    // var url = path.join('/');
    return path[2]
  }

  counter = () => {
    var x = this
    var { counter } = this.state;
    td = setTimeout(function () {
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
    const progressWarp = new BigNumber(this.context.syncStatus.warpChunksProcessed).div(new BigNumber(this.context.syncStatus.warpChunksAmount)).mul(100).toFixed(2)
    return (
      <Dialog
        open={true}
        modal={true}
        title={this.renderTitle()}
        contentStyle={style.dialogContent}
        bodyStyle={style.dialogBody}
        style={style.dialogRoot}
        repositionOnUpdate={false}
      >
        <div className={styles.detailsBoxContainer}>
          <Grid fluid>
            <Row>
              <Col xs={12} >
                <SectionHeader
                  titleText='NODE SYNCING'
                />
              </Col>
            </Row>
            <Row>
              <Col xs={12}>
                <p>Your node is syncing with Ethereum blockchain.</p>
                <p>Please wait until fully synced before accessing RigoBlock.</p>
                <p>Syncing progress:</p>
                <p><SyncStatusCurrentBlock syncStatus={this.context.syncStatus} /></p>
                <p><SyncStatusWarpChunksProcessed syncStatus={this.context.syncStatus}/></p>
                <p>Please contact our support or {<Link to={DS + APP + DS + this.buildUrlPath() + DS + "config"}>select</Link>} a different endpoint.</p>
              </Col>
            </Row>
          </Grid>
        </div>
      </Dialog>
    )
  }

  renderNotConnected = () => {
    return (
      <Dialog
        open={true}
        modal={true}
        title={this.renderTitle()}
        contentStyle={style.dialogContent}
        bodyStyle={style.dialogBody}
        style={style.dialogRoot}
        repositionOnUpdate={false}
      >
        <div className={styles.detailsBoxContainer}>
          <Grid fluid>
            <Row>
              <Col xs={12} >
                <SectionHeader
                  titleText='CONNECTION ERROR'
                />
              </Col>
            </Row>
            <Row>
              <Col xs={12}>
                <p>Unable to connect to the network.</p>
                <p>Trying to establish a new connection in {this.state.counter} seconds... </p>
                <p>Please contact our support or {<Link to={DS + APP + DS + this.buildUrlPath() + DS + "config"}>select</Link>} a different network.</p>
              </Col>
            </Row>
          </Grid>
        </div>
      </Dialog>
    )
  }

  renderTitle = () => {
    return (
      <Row className={styles.modalHeader}>
        <Col xs={12}>
          <Row className={styles.modalHeaderActions} middle="xs" center="xs">
            <Col xs>
              <img src="img/Logo-RigoblockRGB-OUT-01.png" alt="logo" />
            </Col>
          </Row>
        </Col>
      </Row>
    )
  }

  render() {
    const { isSyncing, syncStatus } = this.context
    console.log('Sync Status: ', syncStatus)
    console.log('Syncing: ', isSyncing)
    return isSyncing ? this.renderSyncing() : this.renderNotConnected()
  }
}

export default ElementNotConnected