// Copyright 2016-2017 Rigo Investment Sagl.

import { Actions } from '../_redux/actions'
import { Col, Row } from 'react-flexbox-grid'
import { connect } from 'react-redux'
import ApplicationHome from '../ApplicationHome'
import BigNumber from 'bignumber.js'
import Cookies from 'universal-cookie'
import ElementNotConnected from '../Elements/elementNotConnected'
import Joyride from 'react-joyride'
import JoyrideContent from '../_atomic/atoms/joyrideContent'
import JoyrideMainIntro from '../_atomic/molecules/joyrideMainIntro'
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

class ApplicationHomePage extends Component {
  static childContextTypes = {
    muiTheme: PropTypes.object
  }

  state = {
    hasGRGBalance: false,
    run: false,
    newJoyrideKey: 0
  }

  static contextTypes = {
    api: PropTypes.object.isRequired
  }

  static propTypes = {
    location: PropTypes.object.isRequired,
    app: PropTypes.object.isRequired,
    dispatch: PropTypes.func.isRequired
  }

  static getDerivedStateFromProps(props) {
    const { endpoint } = props
    const hasGRGBalance = new BigNumber(endpoint.grgBalance).gte(1)
    return {
      hasGRGBalance
    }
  }

  onClickExplore = () => {
    this.setState({ run: true })
  }

  callBackStep = data => {
    if (data.status === 'finished') {
      this.setState({ run: false, newJoyrideKey: this.state.newJoyrideKey + 1 })
    }
  }

  onClickCreatePool = () => {
    this.props.dispatch(Actions.users.isManagerAction(true))
  }

  onCheckIntro = (event, isInputChecked) => {
    const cookies = new Cookies()
    cookies.set('rb-efx-tour', isInputChecked, { path: '/' })
  }

  introTourSteps = () => {
    const { hasGRGBalance } = this.state
    return [
      {
        target: '.joyride-home-logo',
        content: (
          <JoyrideMainIntro
            content={
              'RigoBlock: the decentralized platform for asset management.'
            }
            onCheck={this.onCheckIntro}
            hasGRGBalance={hasGRGBalance}
            showHideOption={false}
          />
        ),
        placement: 'bottom',
        disableBeacon: true,
        disableCloseOnEsc: true,
        disableOverlayClose: true,
        spotlightPadding: 0
      },
      {
        target: '.joyride-home-search',
        content: (
          <JoyrideContent
            content={'Search for pools of tokens and buy a unit.'}
          />
        ),
        placement: 'bottom',
        disableBeacon: true
      },
      {
        target: '#joyride-home-create-pool',
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
      },
      {
        target: '.joyride-app-sections',
        content: (
          <JoyrideContent
            content={'Manage your DRAGOS and trade in our MARKET.'}
          />
        ),
        placement: 'bottom',
        disableBeacon: true
      }
    ]
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
    console.log(this.props)
    const { isSyncing, syncStatus, isConnected } = this.props.app
    const { run, newJoyrideKey } = this.state
    return (
      <MuiThemeProvider muiTheme={muiTheme}>
        <div>
          <Joyride
            steps={this.introTourSteps()}
            key={'joyride' + newJoyrideKey.toString()}
            showProgress={true}
            run={run}
            continuous={true}
            floaterProps={{
              disableAnimation: true
            }}
            callback={this.callBackStep}
            styles={{
              options: {
                primaryColor: '#064286',
                width: 900,
                zIndex: '1900'
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
              <ApplicationHome
                onClickExplore={this.onClickExplore}
                onClickCreatePool={this.onClickCreatePool}
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

export default connect(mapStateToProps)(ApplicationHomePage)
