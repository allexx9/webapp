import  * as Colors from 'material-ui/styles/colors'
import { Row, Col, Grid } from 'react-flexbox-grid';
import {Card, CardHeader, CardTitle, CardText} from 'material-ui/Card';
import AlertWarning from 'material-ui/svg-icons/alert/warning'
import Avatar from 'material-ui/Avatar';
import List from 'material-ui/List/List';
import ListItem from 'material-ui/List/ListItem'
import Paper from 'material-ui/Paper';
import PropTypes from 'prop-types';
import React, { Component } from 'react'

import styles from './checkAuthPage.module.css'

var td = null

class CheckAuthPage extends Component {

    constructor(props) {
        super(props);

      }

    state = {
      counter: 15
    }

    static propTypes = {
      isConnected: PropTypes.bool,
    };
    
    renderWarnMsg = () =>{
      const { warnMsg } = this.props
      if (warnMsg === null) return
      return (
        <Row>
          <Col xs={12}>
            <div className={styles.warnMsgBox}>
              <p>{warnMsg}</p>
            </div>

          </Col>
        </Row>
      )
    }

    render() {
      // console.log(this.props)
      return (
        <Row>
          <Col xs={12}>
            <Paper className={styles.paperContainer} zDepth={1}>
              {this.renderWarnMsg()}
              <Row>
                <Col xs={12}>
                  
                    <h1 className={styles.title} >Authenticate</h1>
                    <p>You need to connect to an external wallet. Please <b>unlock</b> your MetaMask account and <b>refresh</b> your browser.</p>
                    <p>If you do not have MetaMask installed, please read the instruction below.</p>
                    <p>RigoBlock supports Metamask and Parity wallets.</p>
                  
                </Col>
              </Row>
              <Row>
                <Col xs={12} className={styles.walletBox}>
                  <ListItem className={styles.walletTitle}
                    disabled={true}
                    size={50}
                    leftAvatar={
                      <Avatar src="img/metamask.png" />
                    }
                  >
                    MetaMask
                  </ListItem>
                  <p>MetaMask is a Chrome and Firefox extension that enables you to navigate Ethereum compatible websites and access blockchain decentralized application.</p>
                  <a href='https://metamask.io/' target='_blank'>Learn how to install MetaMask on their website</a>
                </Col>
                <Col xs={12} className={styles.walletBox}>
                <ListItem className={styles.walletTitle}
                    disabled={true}
                    size={50}
                    leftAvatar={
                      <Avatar src="img/14176906.png" />
                    }
                  >
                    Parity
                  </ListItem>
                  <p>RigoBlock is also available as a Ðapp inside the Parity client</p>
                  <p>Parity comes with an extensive, easy-to-use, in-built Ethereum Wallet and Ðapp environment that can be accessed via your Web browser of choice.</p>
                  <a href='https://www.parity.io/' target='_blank'>Learn how to install Parity on their website</a>
                </Col>
              </Row>
            </Paper>
          </Col>
        </Row>
      )
    }
  }

  export default CheckAuthPage