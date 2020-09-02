// Copyright 2016-2017 Rigo Investment Sagl.
import { Col, Row } from 'react-flexbox-grid'
import { Link, withRouter } from 'react-router-dom'
import { connect } from 'react-redux'
import Chat from 'material-ui/svg-icons/communication/chat'
import ElementBottomStatusBar from '../Elements/elementBottomStatusBar'
// import ElementListFunds from '../Elements/elementListFunds'
import ElementListWrapper from '../Elements/elementListWrapper'
import FilterPoolsField from '../_atomic/atoms/filterPoolsField'
import FlatButton from 'material-ui/FlatButton'
import Paper from 'material-ui/Paper'
import ProgressBar from '../_atomic/atoms/progressBar'
import PropTypes from 'prop-types'
import React, { PureComponent } from 'react'
import SearchIcon from '../_atomic/atoms/searchIcon'
import TablePoolsList from '../_atomic/molecules/tablePoolsList'
import WalletSetup from '../_atomic/organisms/walletSetup'
import styles from './applicationHome.module.css'
import utils from '../_utils/utils'

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
    showCommunityButtons: true
  }

  componentDidMount() { }

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
    const {
      endpoint,
      location,
      onClickExplore,
      onClickCreatePool,
      poolsList
    } = this.props
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
    return (
      <div className={styles.body}>
        <div className={styles.socialsContainer}>
          <a
            href="https://discordapp.com/channels/rigoblock"
            target="_blank"
            rel="noopener noreferrer"
          >
            <img src="/img/social/discord.svg" height="32px" alt="" />
          </a>
          <a
            href="https://www.facebook.com/RigoBlockProtocol"
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
        <div className={styles.contentContainer}>
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
                        This project is in beta. Use at your own risk.
                      </h2>
                      <Link to="/vault">
                        <p className={styles.subHeadline}>
                          <b className={styles.txtDottedYellow}>
                            Vault: the Pool for Custody
                          </b>{' '}
                        </p>
                      </Link>
                      <Link to="/drago">
                        <p className={styles.subHeadline}>
                          <b className={styles.txtDottedYellow}>
                            Drago: the Pool for Track Record
                          </b>{' '}
                        </p>
                      </Link>
                    </Col>
                  </Row>
                </div>

                <div className={styles.buttonLogoContainer}>
                  <Row>
                    <Col xs={6}>
                      <div style={{ textAlign: 'right', marginRight: '22px' }}>
                        <FlatButton
                          labelPosition="before"
                          label="TOUR"
                          labelStyle={{
                            color: '#054186',
                            fontWeight: '600',
                            fontSize: '20px'
                          }}
                          onClick={onClickExplore}
                          style={buttonExplore}
                        />
                      </div>
                    </Col>
                    <Col xs={6}>
                      <div style={{ textAlign: 'left', marginLeft: '22px' }}>
                        <Link to="/drago">
                          <FlatButton
                            labelPosition="before"
                            label="EXPLORE DRAGO"
                            labelStyle={{
                              color: '#ffffff',
                              fontWeight: '600',
                              fontSize: '20px'
                            }}
                            onClick={onClickCreatePool}
                            id="joyride-home-create-pool"
                            style={buttonCreateDrago}
                          />
                        </Link>
                      </div>
                    </Col>
                  </Row>
                </div>
                {/*
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
                          <ProgressBar progress={listLoadingProgress} />
                        </Col>
                        <Col xs={12}>
                          <div className={styles.poolsList}>
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
                          </div>

                        </Col>
                      </Paper>
                    </Row>
                  </Col>
                </Row>
                */}
              </div>
            </Col>
          </Row>
        </div>

        <ElementBottomStatusBar
          blockNumber={endpoint.prevBlockNumber}
          networkName={endpoint.networkInfo.name}
          networkError={endpoint.networkError}
          networkStatus={endpoint.networkStatus}
        />
        <div className={styles.backToPayRueButtonContainer}>
          <div>
            <a
              target="_self"
              rel="noopener noreferrer"
              href="https://payrue.com/"
              className={styles.backToPayRueButton}>
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
               <path d="M9.19719 14.9283L8.40442 15.7417C8.06874 16.0861 7.52595 16.0861 7.19384 15.7417L0.251758 8.62285C-0.0839192 8.27845 -0.0839192 7.72155 0.251758 7.38081L7.19384 0.258301C7.52952 -0.0861003 8.07231 -0.0861003 8.40442 0.258301L9.19719 1.07167C9.53644 1.41974 9.52929 1.98763 9.1829 2.32837L4.87981 6.53446H15.143C15.6179 6.53446 16 6.92649 16 7.41379V8.58622C16 9.07351 15.6179 9.46554 15.143 9.46554H4.87981L9.1829 13.6716C9.53286 14.0124 9.54001 14.5803 9.19719 14.9283Z" />
              </svg>
              Back to PayRue
            </a>
          </div>
        </div>
        {this.state.showCommunityButtons && (
          <div className={styles.telegramButtonContainer}>
            <div>
              {/*
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
              */}

              <a
                href="https://discordapp.com/invite/FXd8EU8"
                target="_blank"
                rel="noopener noreferrer"
                className={styles.communityButton}
              >
                <FlatButton
                  labelPosition="before"
                  label="Join the Community"
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
