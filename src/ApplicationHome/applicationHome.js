// Copyright 2016-2017 Rigo Investment Sagl.

import styles from './applicationHome.module.css';
import React, { Component } from 'react';
import PropTypes from 'prop-types';
import RaisedButton from 'material-ui/RaisedButton';
import { Card, CardActions, CardTitle, CardText } from 'material-ui/Card';
import { Row, Col } from 'react-flexbox-grid';
import FlatButton from 'material-ui/FlatButton'
import ElementBottomStatusBar from '../Elements/elementBottomStatusBar'
import { connect } from 'react-redux';
import Loading from '../_atomic/atoms/loading';
import Dialog from 'material-ui/Dialog';
import WalletSetupStepper from '../_atomic/organisms/walletSetupStepper'
import SectionHeader from '../_atomic/atoms/sectionHeader';

import {
  Link
} from 'react-router-dom'

import injectTapEventPlugin from 'react-tap-event-plugin';
injectTapEventPlugin();

function mapStateToProps(state) {
  return state
}


class ApplicationHome extends Component {

  state = {
    open: false,
    connected: true
  }

  // We define the properties of the context variables passed down to the children
  static childContextTypes = {
    // api: PropTypes.object,
    // muiTheme: PropTypes.object
  };

  // We check the type of the context variable that we receive by the parent
  static contextTypes = {
    api: PropTypes.object.isRequired,
    muiTheme: PropTypes.object.isRequired
  };

  static propTypes = {
    endpoint: PropTypes.object.isRequired,
  };

  // We pass down the context variables passed down to the children
  getChildContext() {
    return {
      // api,
      // muiTheme
    };
  }

  componentDidMount() {
  }

  render() {
    const { connected } = this.state;
    const { endpoint } = this.props
    const buttonTelegram = {
      border: "2px solid",
      borderColor: '#054186',
      fontWeight: "600",
      height: "45px"
      // width: "140px"
    }

    if (!connected) {
      return (
        <Loading />
      );
    }
    console.log(this.props)
    return (
      <div className={styles.body}>
        <Row>
          <Col xs={12} >
            <div className={styles.shadow}>
              <Row>
                <Col xs={12}>
                  <div className={styles.mainlogo}><img style={{ height: "80px" }} src='/img/Logo-RigoblockRGB-OUT-01.png' /></div>
                  <h2 className={styles.headline}>Decentralized Pools of Digital Tokens</h2>
                  <div className={styles.telegramButtonContainer}>
                    <a href="https://t.me/rigoblockprotocol" target="_blank" rel="noopener noreferrer">

                      <FlatButton
                        labelPosition="before"
                        label="Join us on telegram!"
                        labelStyle={{ color: '#054186', fontWeight: "600", fontSize: "20px" }}
                        style={buttonTelegram}
                        icon={<img src="/img/social/telegram.svg" height="30px" />}
                      // hoverColor={Colors.blue300}
                      />
                    </a>
                  </div>

                  <p className={styles.subHeadline}>We aim to create a new generation of traders and a new level of asset management system.
                  Simple, transparent, meritocratic and democratic.</p>

                </Col>
              </Row>
              <Row className={styles.cards}>
                <Col xs={6}>
                  <Card className={styles.column}>
                    <CardTitle title="VAULT" className={styles.cardtitle} titleColor="white" />
                    <CardText>
                      <p className={styles.subHeadline}>Pools of ether and proof-of-stake mining</p>
                    </CardText>
                    <CardActions>
                      <Link to="/vault">
                        <RaisedButton label="New Vault" className={styles.exchangebutton} labelColor="white" />
                      </Link>
                    </CardActions>
                  </Card>
                </Col>
                <Col xs={6}>
                  <Card className={styles.column}>
                    <CardTitle title="DRAGO" className={styles.cardtitle} titleColor="white" />
                    <CardText>
                      <p className={styles.subHeadline}>Pools of ether and trading on decentralized exchanges</p>
                    </CardText>
                    <CardActions >
                      {/* <ApplicationDragoFactory /> */}
                      <Link to="/drago">
                        <RaisedButton label="New Drago" className={styles.exchangebutton} labelColor="white" />
                      </Link>
                    </CardActions>
                  </Card>
                </Col>
              </Row>
              <Row>
                <Col xs={12}>
                  <p></p>
                </Col>
              </Row>
              <Row>
                {/* <Col xs={12}>
                  <Paper zDepth={1}>
                    <p>&nbsp;</p>
                    <p>
                      Download our whitepaper at <a href='https://rigoblock.com'>www.rigoblock.com </a>
                    </p>
                    <p>Give us a shout! <a href="mailto:admin@rigoblock.com?Subject=RigoBlock%20contact" target="_top">admin@rigoblock.com</a>
                    </p>
                    <p>&nbsp;</p>
                  </Paper>
                </Col> */}
                <Col xs={12} className={styles.socialsContainer}>
                  <a href="https://t.me/rigoblockprotocol" target="_blank" rel="noopener noreferrer"><img src="/img/social/telegram.svg" height="32px" /></a>
                  <a href="https://discordapp.com/channels/rigoblock" target="_blank" rel="noopener noreferrer"><img src="/img/social/discord.svg" height="32px" /></a>
                  <a href="https://www.facebook.com/RigoBlocks" target="_blank" rel="noopener noreferrer"><img src="/img/social/facebook.svg" height="32px" /></a>
                  <a href="https://twitter.com/rigoblock" target="_blank" rel="noopener noreferrer"><img src="/img/social/twitter.svg" height="32px" /></a>
                </Col>
              </Row>
            </div>
          </Col>

          <Col xs={12}>
            <Dialog
              titleStyle={{
                fontSize: '36px',
                fontWeight: 700,
                textAlign: 'center'

              }}
              title={<SectionHeader
                textStyle = {{
                  fontSize: '32px',
                  fontWeight: 700,
                  textAlign: 'center',
                  borderRadius: '0px'
  
                }}
                containerStyle={{marginLeft: '0px', marginRight: '0px'}}
                titleText='WALLET SETUP'
              />}
              modal={false}
              open={true}
              onRequestClose={this.handleClose}
              repositionOnUpdate={false}
            >
              <WalletSetupStepper>

              </WalletSetupStepper>
            </Dialog>
            <ElementBottomStatusBar
              blockNumber={endpoint.prevBlockNumber}
              networkName={endpoint.networkInfo.name}
              networkError={endpoint.networkError}
              networkStatus={endpoint.networkStatus} />
          </Col>
        </Row>
      </div>
    );
  }

  handleToggle = () => {
    this.setState({
      open: !this.state.open,
    });
  }
}

export default connect(mapStateToProps)(ApplicationHome)

