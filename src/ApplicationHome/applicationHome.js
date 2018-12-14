// Copyright 2016-2017 Rigo Investment Sagl.

import { Actions } from '../_redux/actions'
import { Col, Row } from 'react-flexbox-grid'
import { Link, withRouter } from 'react-router-dom'
import { connect } from 'react-redux'
import Chat from 'material-ui/svg-icons/communication/chat'
import ElementBottomStatusBar from '../Elements/elementBottomStatusBar'
import ElementListFunds from '../Elements/elementListFunds'
import ElementListWrapper from '../Elements/elementListWrapper'
import FilterPoolsField from '../_atomic/atoms/filterPoolsField'
import FlatButton from 'material-ui/FlatButton'
import LinearProgress from 'material-ui/LinearProgress'
import Paper from 'material-ui/Paper'
import PropTypes from 'prop-types'
import React, { PureComponent } from 'react'
import SearchIcon from '../_atomic/atoms/searchIcon'
import WalletSetup from '../_atomic/organisms/walletSetup'
import _ from 'lodash'
import styles from './applicationHome.module.css'

function mapStateToProps(state) {
  return state
}

class ApplicationHome extends PureComponent {
  static contextTypes = {
    api: PropTypes.object.isRequired
  }

  static propTypes = {
    endpoint: PropTypes.object.isRequired,
    location: PropTypes.object.isRequired,
    poolsList: PropTypes.object.isRequired,
    dispatch: PropTypes.func.isRequired,
    onClickCreatePool: PropTypes.func.isRequired,
    onClickExplore: PropTypes.func.isRequired
  }

  state = {
    filter: '',
    prevLastFetchRange: {
      chunk: {
        key: 0,
        range: 0
      },
      startBlock: 0,
      lastBlock: 0
    },
    lastFetchRange: {
      chunk: {
        key: 0,
        range: 0
      },
      startBlock: 0,
      lastBlock: 0
    },
    listLoadingProgress: 0,
    showCommunityButtons: true
  }

  static getDerivedStateFromProps(props, state) {
    const { lastFetchRange } = props.poolsList
    if (!_.isEqual(lastFetchRange, state.prevLastFetchRange)) {
      const { chunk, lastBlock, startBlock } = lastFetchRange
      if (lastBlock === 0) return null
      if (lastBlock === startBlock)
        return {
          prevLastFetchRange: lastFetchRange,
          listLoadingProgress: 100
        }
      let newProgress =
        lastBlock !== state.prevLastFetchRange.lastBlock
          ? ((chunk.toBlock - chunk.fromBlock) / (lastBlock - startBlock)) * 100
          : state.listLoadingProgress +
            ((chunk.toBlock - chunk.fromBlock) / (lastBlock - startBlock)) * 100
      return {
        prevLastFetchRange: lastFetchRange,
        listLoadingProgress: newProgress
      }
    }
    return null
  }

  componentDidMount() {}

  componentWillUnmount = () => {
    window.removeEventListener('scroll', this.handleScroll)
  }

  handleScroll = () => {
    if (window.scrollY > 50) {
      this.setState({
        showCommunityButtons: false
      })
    } else {
      this.setState({
        showCommunityButtons: true
      })
    }
  }

  filter = filter => {
    this.setState(
      {
        filter
      },
      this.filterFunds
    )
  }

  filterFunds = () => {
    const { poolsList } = this.props
    const { filter } = this.state
    const list = Object.values(poolsList.list)
    list.sort(function(a, b) {
      if (a.symbol < b.symbol) return -1
      if (a.symbol > b.symbol) return 1
      return 0
    })
    const filterValue = filter.trim().toLowerCase()
    const filterLength = filterValue.length
    return filterLength === 0
      ? list.filter(item => item.poolType === 'drago')
      : list.filter(
          item =>
            (item.name.toLowerCase().slice(0, filterLength) === filterValue ||
              item.symbol.toLowerCase().slice(0, filterLength) ===
                filterValue) &&
            item.poolType === 'drago'
        )
  }

  render() {
    this.filterFunds()
    const { endpoint } = this.props
    const buttonTelegram = {
      border: '2px solid',
      borderColor: '#054186',
      fontWeight: '600',
      height: '45px',
      backgroundColor: 'white',
      borderRadius: '4px'
      // width: "140px"
    }
    const detailsBox = {
      padding: 20,
      width: '100%',
      marginRight: `20px`,
      marginLeft: `20px`
    }
    const buttonCreateDrago = {
      border: '2px solid',
      borderColor: '#054186',
      fontWeight: '600',
      height: '45px',
      borderRadius: '4px',
      width: '210px',
      backgroundColor: '#054186'
    }
    const buttonExplore = {
      border: '2px solid',
      borderColor: '#054186',
      fontWeight: '600',
      height: '45px',
      backgroundColor: 'white',
      borderRadius: '4px',
      width: '210px'
    }
    let { location } = this.props
    return (
      <div className={styles.body}>
        <div className={styles.socialsContainer}>
          <a
            href="https://t.me/rigoblockprotocol"
            target="_blank"
            rel="noopener noreferrer"
          >
            <img src="/img/social/telegram.svg" height="32px" alt="" />
          </a>
          <a
            href="https://discordapp.com/channels/rigoblock"
            target="_blank"
            rel="noopener noreferrer"
          >
            <img src="/img/social/discord.svg" height="32px" alt="" />
          </a>
          <a
            href="https://www.facebook.com/RigoBlocks"
            target="_blank"
            rel="noopener noreferrer"
          >
            <img src="/img/social/facebook.svg" height="32px" alt="" />
          </a>
          <a
            href="https://twitter.com/rigoblock"
            target="_blank"
            rel="noopener noreferrer"
          >
            <img src="/img/social/twitter.svg" height="32px" alt="" />
          </a>
        </div>
        <Row>
          <Col xs={12}>
            <div>
              <div className={'joyride-home-logo'}>
                <Row>
                  <Col xs={12}>
                    <div className={styles.mainlogo}>
                      <img
                        style={{ height: '80px' }}
                        src="/img/Logo-RigoblockRGB-OUT-01.png"
                        alt=""
                      />
                    </div>
                    <h2 style={{ color: '#054186' }}>
                      The leading crypto platform for asset management.
                    </h2>
                    <p className={styles.subHeadline}>
                      <b className={styles.txtDotted}>Simple</b>,{' '}
                      <b className={styles.txtDottedYellow}>transparent</b>,{' '}
                      <b className={styles.txtDotted}>meritocratic</b> and{' '}
                      <b className={styles.txtDottedYellow}>democratic</b>.
                    </p>
                  </Col>
                </Row>
              </div>

              <div className={styles.buttonLogoContainer}>
                <Row>
                  <Col xs={6}>
                    <div style={{ textAlign: 'right', marginRight: '22px' }}>
                      <FlatButton
                        labelPosition="before"
                        label="Explore"
                        labelStyle={{
                          color: '#054186',
                          fontWeight: '600',
                          fontSize: '20px'
                        }}
                        onClick={this.props.onClickExplore}
                        style={buttonExplore}
                      />
                    </div>
                  </Col>
                  <Col xs={6}>
                    <div style={{ textAlign: 'left', marginLeft: '22px' }}>
                      <Link to="/drago">
                        <FlatButton
                          labelPosition="before"
                          label="Create a pool"
                          labelStyle={{
                            color: '#ffffff',
                            fontWeight: '600',
                            fontSize: '20px'
                          }}
                          onClick={this.props.onClickCreatePool}
                          id="joyride-home-create-pool"
                          style={buttonCreateDrago}
                        />
                      </Link>
                    </div>
                  </Col>
                </Row>
              </div>
              <Row>
                <Col xs={12}>
                  <Row>
                    <Paper style={detailsBox} zDepth={1}>
                      <Col xs={12} className={'joyride-home-search'}>
                        <div className={styles.filterBox}>
                          Search for pools
                          <FilterPoolsField
                            filter={this.filter}
                            hintText={<SearchIcon text={'Search...'} />}
                            floatingLabelText=""
                          />
                        </div>
                      </Col>
                      <Col xs={12}>
                        <div className={styles.progressBarContainer}>
                          <LinearProgress
                            mode="determinate"
                            value={this.state.listLoadingProgress}
                          />
                        </div>
                      </Col>
                      <Col xs={12}>
                        <ElementListWrapper
                          list={this.filterFunds()}
                          location={location}
                          pagination={{
                            display: 5,
                            number: 1
                          }}
                          autoLoading={false}
                          tableHeight={330}
                        >
                          <ElementListFunds />
                        </ElementListWrapper>
                      </Col>
                    </Paper>
                  </Row>
                </Col>
              </Row>
              {/* <div className={styles.actionsContainer}>
                <Row className={styles.cards}>
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
                </Row>
                <Row>
                  <Col xs={12}>
                    <p />
                  </Col>
                </Row>
              </div> */}
            </div>
          </Col>
        </Row>
        <ElementBottomStatusBar
          blockNumber={endpoint.prevBlockNumber}
          networkName={endpoint.networkInfo.name}
          networkError={endpoint.networkError}
          networkStatus={endpoint.networkStatus}
        />
        {this.state.showCommunityButtons && (
          <div className={styles.telegramButtonContainer}>
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
                      alt=""
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
          </div>
        )}
        <WalletSetup />
      </div>
    )
  }
}

export default withRouter(connect(mapStateToProps)(ApplicationHome))
