// Copyright 2016-2017 Rigo Investment Sagl.

import { Col, Row } from 'react-flexbox-grid'
import { Link, withRouter } from 'react-router-dom'
import { connect } from 'react-redux'
import Add from 'material-ui/svg-icons/content/add'
import Chat from 'material-ui/svg-icons/communication/chat'
import ElementBottomStatusBar from '../Elements/elementBottomStatusBar'
import ElementListWrapper from '../Elements/elementListWrapper'
import FilterPoolsField from '../_atomic/atoms/filterPoolsField'
import FlatButton from 'material-ui/FlatButton'
import Paper from 'material-ui/Paper'
import ProgressBar from '../_atomic/atoms/progressBar'
import PropTypes from 'prop-types'
import React, { PureComponent } from 'react'
import SearchIcon from '../_atomic/atoms/searchIcon'
import TablePoolsList from '../_atomic/molecules/tablePoolsList'
import styles from './applicationHome.module.css'
import utils from '../_utils/utils'

function mapStateToProps(state) {
  return {
    poolsList: state.poolsList,
    endpoint: state.endpoint
  }
}

class ApplicationHomeEfx extends PureComponent {
  static contextTypes = {
    api: PropTypes.object.isRequired
  }

  static propTypes = {
    endpoint: PropTypes.object.isRequired,
    location: PropTypes.object.isRequired,
    poolsList: PropTypes.object.isRequired,
    dispatch: PropTypes.func.isRequired,
    onClickCreatePool: PropTypes.func,
    onClickExplore: PropTypes.func
  }

  static defaultProps = {
    onClickCreatePool: () => {},
    onClickExplore: () => {}
  }

  state = {
    filter: '',
    showCommunityButtons: true
  }

  componentDidMount() {
    window.addEventListener('scroll', this.handleScroll)
  }

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
      this.filterPools
    )
  }

  filterPools = () => {
    const { poolsList } = this.props
    const { filter } = this.state
    return utils.filterPools(poolsList, filter, 'drago')
  }

  render() {
    const { endpoint, poolsList } = this.props
    const listLoadingProgress = poolsList.lastFetchRange.chunk.progress * 100
    const buttonTelegram = {
      border: '2px solid',
      borderColor: '#054186',
      fontWeight: '600',
      height: '45px',
      backgroundColor: 'white',
      borderRadius: '4px'
      // width: "140px"
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
    const detailsBox = {
      padding: 20,
      width: '100%',
      marginRight: `20px`,
      marginLeft: `20px`
    }
    let { location } = this.props

    return (
      <div className={styles.body}>
        <Row>
          <Col xs={12}>
            <div className={'joyride-efx-collaboration'}>
              <Row>
                <Col xs={12}>
                  <div className={styles.mainLogoContainer}>
                    <div className={styles.mainlogoLandingRB}>
                      <div>
                        <img
                          style={{ height: '80px' }}
                          src="/img/Logo-RigoblockRGB-OUT-02.png"
                          alt="rigoblock-logo"
                        />
                        <div className={styles.logoTextRB}>RigoBlock</div>
                      </div>
                    </div>
                    <div className={styles.mainlogoLandingPlus}>
                      <div>
                        <Add
                          color={'#054186'}
                          style={{ width: '26px', height: '26px' }}
                        />
                      </div>
                    </div>
                    <div className={styles.mainlogoLandingEfx}>
                      <div>
                        <img
                          style={{ height: '80px' }}
                          src="/img/ethfinex.png"
                          alt="ethfinex-logo"
                        />
                        <div className={styles.logoTextEfx}>ETHFINEX</div>{' '}
                      </div>
                    </div>
                  </div>
                </Col>
              </Row>

              <div className={styles.sloganTextContainer}>
                <Row>
                  <Col xs={12}>
                    <h2 style={{ color: '#054186' }}>
                      The leading crypto platform for asset management.
                    </h2>
                    <p style={{ color: '#054186' }}>
                      In collaboration with <b>Ethfinex Trustless</b>.
                    </p>
                  </Col>
                </Row>
              </div>
            </div>
            <div className={styles.buttonLogoContainer}>
              <Row>
                <Col xs={6}>
                  <div style={{ textAlign: 'right', marginRight: '22px' }}>
                    <Link to="/drago">
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
                    </Link>
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
                        id="joyride-efx-create-pool"
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
                    <Col xs={12} className={'joyride-efx-search'}>
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
                      <ProgressBar progress={listLoadingProgress} />
                    </Col>
                    <Col xs={12}>
                      <ElementListWrapper
                        list={this.filterPools()}
                        location={location}
                        pagination={{
                          display: 5,
                          number: 1
                        }}
                        autoLoading={false}
                        tableHeight={330}
                      >
                        <TablePoolsList />
                      </ElementListWrapper>
                    </Col>
                  </Paper>
                </Row>
              </Col>
            </Row>
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
                      height="24px"
                      className={styles.telegramIcon}
                      alt=""
                    />
                  }
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
                />
              </a>
            </div>
          </div>
        )}
        {/* <WalletSetup /> */}
      </div>
    )
  }
}

export default withRouter(connect(mapStateToProps)(ApplicationHomeEfx))
