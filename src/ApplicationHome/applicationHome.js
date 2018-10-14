// Copyright 2016-2017 Rigo Investment Sagl.

import { Card, CardActions, CardText, CardTitle } from 'material-ui/Card'
import { Col, Row } from 'react-flexbox-grid'
import { Link, withRouter } from 'react-router-dom'
import { connect } from 'react-redux'
import { width } from 'window-size'
import Chat from 'material-ui/svg-icons/communication/chat'
import ElementBottomStatusBar from '../Elements/elementBottomStatusBar'
import ElementListFunds from '../Elements/elementListFunds'
import ElementListWrapper from '../Elements/elementListWrapper'
import FilterFunds from '../Elements/elementFilterFunds'
import FlatButton from 'material-ui/FlatButton'
import Paper from 'material-ui/Paper'
import PoolApi from '../PoolsApi/src'
import PropTypes from 'prop-types'
import RaisedButton from 'material-ui/RaisedButton'
import React, { Component } from 'react'
import WalletSetup from '../_atomic/organisms/walletSetup'
import styles from './applicationHome.module.css'

function mapStateToProps(state) {
  return state
}

class ApplicationHome extends Component {
  // We check the type of the context variable that we receive by the parent
  static contextTypes = {
    api: PropTypes.object.isRequired
  }

  static propTypes = {
    endpoint: PropTypes.object.isRequired,
    location: PropTypes.object.isRequired
  }

  state = {
    dragoCreatedLogs: [],
    dragoFilteredList: []
  }

  componentDidMount() {
    this.getDragos()
  }

  getDragos() {
    const { api } = this.context
    const poolApi = new PoolApi(api)
    const logToEvent = log => {
      // const key = api.util.sha3(JSON.stringify(log))
      const { params } = log
      return {
        symbol: params.symbol.value,
        dragoId: params.dragoId.value.toFixed(),
        name: params.name.value
      }
    }

    // Getting all DragoCreated events since block 0.
    // dragoFactoryEventsSignatures accesses the contract ABI, gets all the events and for each creates a hex signature
    // to be passed to getAllLogs. Events are indexed and filtered by topics
    // more at: http://solidity.readthedocs.io/en/develop/contracts.html?highlight=event#events
    poolApi.contract.dragoeventful.init().then(() => {
      poolApi.contract.dragoeventful
        .getAllLogs({
          topics: [poolApi.contract.dragoeventful.hexSignature.DragoCreated]
        })
        .then(dragoCreatedLogs => {
          const logs = dragoCreatedLogs.map(logToEvent)
          logs.sort(function(a, b) {
            if (a.symbol < b.symbol) return -1
            if (a.symbol > b.symbol) return 1
            return 0
          })
          this.setState({
            dragoCreatedLogs: logs,
            dragoFilteredList: logs
          })
        })
    })
  }

  render() {
    const { endpoint } = this.props
    const buttonTelegram = {
      border: '2px solid',
      borderColor: '#054186',
      fontWeight: '600',
      height: '45px'
      // width: "140px"
    }
    const detailsBox = {
      padding: 20,
      width: '100%',
      marginRight: `20px`,
      marginLeft: `20px`
    }
    let { location } = this.props
    const { dragoCreatedLogs, dragoFilteredList } = this.state
    console.log(this.props)
    return (
      <div className={styles.body}>
        <div className={styles.socialsContainer}>
          <a
            href="https://t.me/rigoblockprotocol"
            target="_blank"
            rel="noopener noreferrer"
          >
            <img src="/img/social/telegram.svg" height="32px" />
          </a>
          <a
            href="https://discordapp.com/channels/rigoblock"
            target="_blank"
            rel="noopener noreferrer"
          >
            <img src="/img/social/discord.svg" height="32px" />
          </a>
          <a
            href="https://www.facebook.com/RigoBlocks"
            target="_blank"
            rel="noopener noreferrer"
          >
            <img src="/img/social/facebook.svg" height="32px" />
          </a>
          <a
            href="https://twitter.com/rigoblock"
            target="_blank"
            rel="noopener noreferrer"
          >
            <img src="/img/social/twitter.svg" height="32px" />
          </a>
        </div>
        <Row>
          <Col xs={12}>
            <div className={styles.shadow}>
              <Row>
                <Col xs={12}>
                  <div className={styles.mainlogo}>
                    <img
                      style={{ height: '80px' }}
                      src="/img/Logo-RigoblockRGB-OUT-01.png"
                    />
                  </div>
                  {/* <h2 className={styles.headline}>
                    Decentralized Pools of Digital Tokens
                  </h2> */}
                  {/* <div className={styles.telegramButtonContainer}>
                    <a
                      href="https://t.me/rigoblockprotocol"
                      target="_blank"
                      rel="noopener noreferrer"
                      className={styles.communityButton}
                    >
                      <FlatButton
                        labelPosition="before"
                        label="Join us on telegram!"
                        labelStyle={{
                          color: '#054186',
                          fontWeight: '600',
                          fontSize: '20px'
                        }}
                        style={buttonTelegram}
                        icon={
                          <img
                            src="/img/iconmonstr-telegram-1.svg"
                            // style={{ fill: '#ffca57' }}
                            height="24px"
                            className={styles.telegramIcon}
                          />
                        }
                        // hoverColor={Colors.blue300}
                      />
                    </a>

                    <a
                      href="https://community.rigoblock.com"
                      target="_blank"
                      rel="noopener noreferrer"
                      className={styles.communityButton}
                    >
                      <FlatButton
                        labelPosition="before"
                        label="Join our Community"
                        labelStyle={{
                          color: '#054186',
                          fontWeight: '600',
                          fontSize: '20px'
                        }}
                        style={buttonTelegram}
                        icon={<Chat color="#ffca57" />}
                        // hoverColor={Colors.blue300}
                      />
                    </a>
                  </div> */}
                  <h2 style={{ color: '#054186' }}>
                    The leader crypto platfrom for asset management.
                  </h2>
                  <p className={styles.subHeadline}>
                    <b className={styles.txtDotted}>Simple</b>,{' '}
                    <b className={styles.txtDottedYellow}>transparent</b>,{' '}
                    <b className={styles.txtDotted}>meritocratic</b> and{' '}
                    <b className={styles.txtDottedYellow}>democratic</b>.
                  </p>
                </Col>
              </Row>
              <Row>
                <Col xs={12}>
                  <Row>
                    <Paper style={detailsBox} zDepth={1}>
                      <Col xs={12}>
                        <div className={styles.filterBox}>
                          Search for pools
                          <FilterFunds
                            list={dragoCreatedLogs}
                            filterList={this.filterList}
                          />
                        </div>
                      </Col>
                      <Col xs={12}>
                        <ElementListWrapper
                          list={dragoFilteredList}
                          location={location}
                          pagination={{
                            display: 5,
                            number: 1
                          }}
                          tableHeight={330}
                        >
                          <ElementListFunds />
                        </ElementListWrapper>
                      </Col>
                    </Paper>
                  </Row>
                </Col>
              </Row>
              {/* <Row className={styles.cards}>
                <Col xs={6}>
                  <Paper style={detailsBox} zDepth={1} />
                </Col>
                <Col xs={6}>
                  <Card className={styles.column}>
                    <CardTitle
                      title="VAULT"
                      className={styles.cardtitle}
                      titleColor="white"
                    />
                    <CardText>
                      <p className={styles.subHeadline}>
                        Pools of ether and proof-of-stake mining
                      </p>
                    </CardText>
                    <CardActions>
                      <Link to="/vault">
                        <RaisedButton
                          label="New Vault"
                          className={styles.exchangebutton}
                          labelColor="white"
                        />
                      </Link>
                    </CardActions>
                  </Card>
                </Col>
                <Col xs={6}>
                  <Card className={styles.column}>
                    <CardTitle
                      title="DRAGO"
                      className={styles.cardtitle}
                      titleColor="white"
                    />
                    <CardText>
                      <p className={styles.subHeadline}>
                        Pools of ether and trading on decentralized exchanges
                      </p>
                    </CardText>
                    <CardActions>
                      <Link to="/drago">
                        <RaisedButton
                          label="New Drago"
                          className={styles.exchangebutton}
                          labelColor="white"
                        />
                      </Link>
                    </CardActions>
                  </Card>
                </Col>
              </Row> */}
              <Row>
                <Col xs={12}>
                  <p />
                </Col>
              </Row>
              {/* <Row>
                <Col xs={12} className={styles.socialsContainer}>
                  <a
                    href="https://t.me/rigoblockprotocol"
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    <img src="/img/social/telegram.svg" height="32px" />
                  </a>
                  <a
                    href="https://discordapp.com/channels/rigoblock"
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    <img src="/img/social/discord.svg" height="32px" />
                  </a>
                  <a
                    href="https://www.facebook.com/RigoBlocks"
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    <img src="/img/social/facebook.svg" height="32px" />
                  </a>
                  <a
                    href="https://twitter.com/rigoblock"
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    <img src="/img/social/twitter.svg" height="32px" />
                  </a>
                </Col>
              </Row> */}
            </div>
          </Col>
          <Col xs={12}>
            <ElementBottomStatusBar
              blockNumber={endpoint.prevBlockNumber}
              networkName={endpoint.networkInfo.name}
              networkError={endpoint.networkError}
              networkStatus={endpoint.networkStatus}
            />
          </Col>
        </Row>
        {/* <div className={styles.telegramButtonContainer}>
          <div>
            <a
              href="https://t.me/rigoblockprotocol"
              target="_blank"
              rel="noopener noreferrer"
              className={styles.communityButton}
            >
              <FlatButton
                labelPosition="before"
                label="Join us on telegram!"
                labelStyle={{
                  color: '#054186',
                  fontWeight: '600',
                  fontSize: '20px'
                }}
                style={buttonTelegram}
                icon={
                  <img
                    src="/img/iconmonstr-telegram-1.svg"
                    // style={{ fill: '#ffca57' }}
                    height="24px"
                    className={styles.telegramIcon}
                  />
                }
                // hoverColor={Colors.blue300}
              />
            </a>

            <a
              href="https://community.rigoblock.com"
              target="_blank"
              rel="noopener noreferrer"
              className={styles.communityButton}
            >
              <FlatButton
                labelPosition="before"
                label="Join our Community"
                labelStyle={{
                  color: '#054186',
                  fontWeight: '600',
                  fontSize: '20px'
                }}
                style={buttonTelegram}
                icon={<Chat color="#ffca57" />}
                // hoverColor={Colors.blue300}
              />
            </a>
          </div>
        </div> */}
        <WalletSetup />
      </div>
    )
  }
}

export default withRouter(connect(mapStateToProps)(ApplicationHome))
