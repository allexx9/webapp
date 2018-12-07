// Copyright 2016-2017 Rigo Investment Sagl.

import ApplicationHomeEfx from '../ApplicationHome/applicationHomeEfx'
import PropTypes from 'prop-types'
import React, { Component } from 'react'
import TopBarMenu from '../Elements/topBarMenu'

import { Col, Row } from 'react-flexbox-grid'
import getMuiTheme from 'material-ui/styles/getMuiTheme'

import { connect } from 'react-redux'
import ElementNotConnected from '../Elements/elementNotConnected'
import Joyride from 'react-joyride'
import JoyrideContent from '../_atomic/atoms/joyrideContent'
import MuiThemeProvider from 'material-ui/styles/MuiThemeProvider'
import TopMenuLinkDrawer from '../_atomic/molecules/topMenuLinkDrawer'
import classNames from 'classnames'
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
  return state
}

class ApplicationHomeEfxPage extends Component {
  static childContextTypes = {
    muiTheme: PropTypes.object
  }

  state = {
    run: false,
    steps: [
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
        content: 'This if my awesome feature!',
        placement: 'bottom',
        disableBeacon: true
      }
    ]
  }

  static contextTypes = {
    api: PropTypes.object.isRequired
  }

  static propTypes = {
    location: PropTypes.object.isRequired,
    app: PropTypes.object.isRequired
  }

  componentDidMount = async () => {}

  runTour = () => {
    console.log('click')
    this.setState({ run: true })
  }

  callback = data => {
    const { action, index, type } = data
    console.log(action, index, type)
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
    const { steps, run } = this.state
    return (
      <MuiThemeProvider muiTheme={muiTheme}>
        <div>
          <Joyride
            steps={steps}
            run={run}
            callback={this.callback}
            floaterProps={{
              styles: {
                wrapper: {
                  zIndex: 1500
                }
              }
            }}
            styles={{
              options: {
                // arrowColor: '#e3ffeb',
                // backgroundColor: '#e3ffeb',
                // overlayColor: 'rgba(79, 26, 0, 0.4)',
                primaryColor: '#ffae00',
                // textColor: '#004a14',
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
              <ApplicationHomeEfx onClickTour={this.runTour} />
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
