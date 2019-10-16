// Copyright 2016-2017 Rigo Investment Sagl.

import { Actions } from '../_redux/actions'
import { Col, Row } from 'react-flexbox-grid'
import { connect } from 'react-redux'
import ApplicationHomeEfx from '../ApplicationHome/applicationHomeEfx'
import BigNumber from 'bignumber.js'
import Cookies from 'universal-cookie'
import ElementNotConnected from '../Elements/elementNotConnected'
import Joyride from 'react-joyride'
import JoyrideContent from '../_atomic/atoms/joyrideContent'
import JoyrideEfxIntro from '../_atomic/molecules/joyrideEfxIntro'
import MuiThemeProvider from 'material-ui/styles/MuiThemeProvider'
import PropTypes from 'prop-types'
import React, { Component } from 'react'
import TopBarMenu from '../Elements/topBarMenu'
import TopMenuLinkDrawer from '../_atomic/molecules/topMenuLinkDrawer'
import classNames from 'classnames'
import getMuiTheme from 'material-ui/styles/getMuiTheme'
import styles from './application.module.css'

const muiTheme = getMuiTheme({
  palette: {
    primary1Color: '#054186'
  },
  fontFamily: "'Muli', sans-serif",
  appBar: {
    height: 45,
    fontSize: '20px !important',
    backgroundColor: '#054186'
  }
})

function mapStateToProps(state) {
  return {
    app: state.app,
    endpoint: {
      grgBalance: state.endpoint.grgBalance
    }
  }
}

class ApplicationHomeEfxPage extends Component {
  static childContextTypes = {
    muiTheme: PropTypes.object
  }

  static getDerivedStateFromProps(props) {
    const { endpoint } = props
    const hasGRGBalance = new BigNumber(endpoint.grgBalance).gte(1)
    return {
      hasGRGBalance
    }
  }

  onCheckIntro = (event, isInputChecked) => {
    const cookies = new Cookies()
    cookies.set('rb-efx-tour', isInputChecked, { path: '/' })
  }

  introTourSteps = () => {
    const { hasGRGBalance } = this.state
    return [
      {
        target: '.joyride-efx-collaboration',
        content: (
          <JoyrideEfxIntro
            content={
              'RigoBlock + Ethfinex: the decentralized platform for asset management.'
            }
            onCheck={this.onCheckIntro}
            hasGRGBalance={hasGRGBalance}
          />
        ),
        placement: 'bottom',
        disableBeacon: true,
        disableCloseOnEsc: true,
        disableOverlayClose: true,
        spotlightPadding: 0
      },
      {
        target: '.joyride-efx-search',
        content: (
          <JoyrideContent
            content={'Search for pools of tokens and buy a unit.'}
          />
        ),
        placement: 'bottom',
        disableBeacon: true
      },
      {
        target: '#joyride-efx-create-pool',
        content: (
          <JoyrideContent
            content={'Create your own pool and trade on Ethfinex Trustless.'}
          />
        ),
        placement: 'bottom',
        disableBeacon: true
      },
      {
        target: '.joyride-user-roles',
        content: (
          <JoyrideContent
            content={
              'Switch between user roles. Select WIZARD to create and manage your own pools, or HOLDER to search for and buy units in pools.'
            }
          />
        ),
        placement: 'bottom',
        disableBeacon: true
      }
    ]
  }

  state = {
    hasGRGBalance: false,
    run: false
  }

  static contextTypes = {
    api: PropTypes.object.isRequired
  }

  static propTypes = {
    location: PropTypes.object.isRequired,
    app: PropTypes.object.isRequired,
    dispatch: PropTypes.func.isRequired
  }

  componentDidMount = async () => {
    const cookies = new Cookies()
    const runTour = Boolean(cookies.get('rb-efx-tour') === 'true')
    this.setState({ run: !runTour })
  }

  onClickCreatePool = () => {
    this.props.dispatch(Actions.users.isManagerAction(true))
  }

  onClickExplore = () => {
    this.props.dispatch(Actions.users.isManagerAction(false))
  }

  getChildContext() {
    return {
      muiTheme
    }
  }

  handleToggleNotifications = () => {
    this.setState({ notificationsOpen: !this.state.notificationsOpen })
  }

  render() {
    const { isSyncing, syncStatus, isConnected } = this.props.app
    const { run } = this.state
    return (
      <MuiThemeProvider muiTheme={muiTheme}>
        <div>
          <Joyride
            steps={this.introTourSteps()}
            showProgress={true}
            run={run}
            continuous={true}
            floaterProps={{
              disableAnimation: true
            }}
            styles={{
              buttonClose: {
                display: 'none'
              },
              options: {
                primaryColor: '#064286',
                width: 900,
                zIndex: '1900',
                padding: '8'
              }
            }}
          />
          <Row>
            <Col xs={12} className={styles.fix}>
              <TopBarMenu
                handleTopBarSelectAccountType={
                  this.handleTopBarSelectAccountType
                }
                transactionsDrawerOpen={this.props.app.transactionsDrawerOpen}
              />
            </Col>
          </Row>
          <Row className={classNames(styles.contentHomePages)}>
            <Col xs={12}>
              <ApplicationHomeEfx
                onClickCreatePool={this.onClickCreatePool}
                onClickExplore={this.onClickExplore}
              />
              {isConnected && !isSyncing ? null : (
                <ElementNotConnected
                  isSyncing={isSyncing}
                  syncStatus={syncStatus}
                />
              )}
            </Col>
          </Row>
          {this.props.label === 'VAULT' && <TopMenuLinkDrawer />}
        </div>
      </MuiThemeProvider>
    )
  }
}

export default connect(mapStateToProps)(ApplicationHomeEfxPage)
