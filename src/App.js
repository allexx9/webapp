// Copyright 2016-2017 Rigo Investment Sagl.
// import 'babel-polyfill'
import 'react-virtualized/styles.css'
import * as Sentry from '@sentry/browser'
import { Actions } from './_redux/actions'
import { Redirect, Route, Router, Switch } from 'react-router-dom'
import { connect } from 'react-redux'
import { notificationWrapper } from './_utils/notificationWrapper'
import AppLoading from './Elements/elementAppLoading'
// import ApplicationConfigPage from './Application/applicationConfig'
// import ApplicationDragoPage from './Application/applicationDrago'
// import ApplicationExchangePage from './Application/applicationExchange'
// import ApplicationHomeEfxPage from './Application/applicationHomeEfxPage'
// import ApplicationHomePage from './Application/applicationHomePage'
// import ApplicationVaultPage from './Application/applicationVault'
import Endpoint from './_utils/endpoint'
import NotificationSystem from 'react-notification-system'
import PropTypes from 'prop-types'
import React, { Component, Suspense, lazy } from 'react'
import ReactGA from 'react-ga'
import Whoops404 from './Application/whoops404'
import createHashHistory from 'history/createHashHistory'
import styles from './App.module.css'
import utils from './_utils/utils'


const ApplicationHomePage = lazy(() =>
  import('./Application/applicationHomePage')
)
const ApplicationConfigPage = lazy(() =>
  import('./Application/applicationConfig')
)
const ApplicationDragoPage = lazy(() =>
  import('./Application/applicationDrago')
)
const ApplicationExchangePage = lazy(() =>
  import('./Application/applicationExchange')
)
const ApplicationHomeEfxPage = lazy(() =>
  import('./Application/applicationHomeEfxPage')
)
const ApplicationVaultPage = lazy(() =>
  import('./Application/applicationVault')
)

let appHashPath = 'web'

ReactGA.initialize('UA-117171641-1')
ReactGA.pageview(window.location.pathname + window.location.search)

const history = createHashHistory()

function mapStateToProps(state) {
  return {
    app: {
      appLoading: state.app.appLoading
    },
    endpoint: state.endpoint
  }
}

export class App extends Component {
  constructor(props) {
    super(props)
    this._notificationSystem = null
    let endpoint = new Endpoint(
      this.props.endpoint.endpointInfo,
      this.props.endpoint.networkInfo
    )
    try {
      this._api = endpoint.connect()
    } catch (error) {
      console.warn(error)
    }
  }

  scrollPosition = 0
  tdIsConnected = null
  tdIsMetaMaskUnlocked = null

  state = {
    isConnected: this.props.app.isConnected,
    isSyncing: this.props.app.isSyncing,
    syncStatus: this.props.app.syncStatus
  }

  static childContextTypes = {
    api: PropTypes.object
  }

  static propTypes = {
    app: PropTypes.object.isRequired,
    endpoint: PropTypes.object.isRequired,
    dispatch: PropTypes.func.isRequired
  }

  initNotificationSystem = instance => {
    if (!this._notificationSystem) {
      this._notificationSystem = React.createRef()
      notificationWrapper.getInstance(instance)
    }
  }

  callback = data => {
    const { action, index, type } = data
    console.log(action, index, type)
  }

  getChildContext() {
    return {
      api: this._api
    }
  }

  shouldComponentUpdate(nextProps, nextState) {
    const propsUpdate = !utils.shallowEqual(this.props, nextProps)
    const stateUpdate = !utils.shallowEqual(this.state, nextState)
    return stateUpdate || propsUpdate
  }

  componentDidCatch(error, errorInfo) {
    Sentry.withScope(scope => {
      Object.keys(errorInfo).forEach(key => {
        scope.setExtra(key, errorInfo[key])
      })
      Sentry.captureException(error)
    })
  }

  componentDidMount = async () => {
    const { endpoint } = this.props
    this.props.dispatch(Actions.endpoint.checkIsConnectedToNode())
    this.props.dispatch(Actions.endpoint.attachInterface(endpoint))
    if (typeof window.web3 !== 'undefined') {
      this.props.dispatch(Actions.endpoint.checkMetaMaskIsUnlocked())
    }
    this.props.dispatch(Actions.endpoint.monitorAccountsStart())
    let options = {
      topics: [null, null, null, null],
      fromBlock: 0,
      toBlock: 'latest'
    }
    this.props.dispatch(Actions.pools.getPoolsList(options))
    this.setState({ run: true })
  }

  render() {
    let notificationStyle = {
      NotificationItem: {
        // Override the notification item
        DefaultStyle: {
          // Applied to every notification, regardless of the notification level
          margin: '0px 0px 0px 0px'
        },
        info: {
          // Applied only to the success notification item
          border: '1px solid',
          borderColor: '#EEEEEE',
          WebkitBoxShadow: 'rgba(0, 0, 0, 0.1) 0px 5px 5px',
          MozBoxShadow: 'rgba(0, 0, 0, 0.1) 0px 5px 5px',
          boxShadow: 'rgba(0, 0, 0, 0.1) 0px 5px 5px',
          backgroundColor: 'white',
          marginBottom: '5px'
        },
        error: {
          borderTop: '2px solid',
          WebkitBoxShadow: 'rgba(0, 0, 0, 0.1) 0px 5px 5px',
          MozBoxShadow: 'rgba(0, 0, 0, 0.1) 0px 5px 5px',
          boxShadow: 'rgba(0, 0, 0, 0.1) 0px 5px 5px',
          backgroundColor: '#F44336',
          color: '#ffffff',
          marginBottom: '5px'
        },
        warning: {
          borderTop: '0px solid',
          WebkitBoxShadow: 'rgba(0, 0, 0, 0.1) 0px 5px 5px',
          MozBoxShadow: 'rgba(0, 0, 0, 0.1) 0px 5px 5px',
          boxShadow: 'rgba(0, 0, 0, 0.1) 0px 5px 5px',
          backgroundColor: '#E65100',
          color: '#ffffff',
          marginBottom: '5px'
        }
      },
      Title: {
        error: {
          color: '#ffffff',
          fontWeight: 700
        },
        warning: {
          color: '#ffffff',
          fontWeight: 700
        }
      },
      Dismiss: {
        info: {
          backgroundColor: '',
          color: '#000000'
        },
        error: {
          backgroundColor: '',
          color: '#ffffff'
        },
        warning: {
          backgroundColor: '',
          color: '#ffffff'
        }
      }
    }

    return (
      <div className={styles.appContainer}>
        <NotificationSystem
          ref={this.initNotificationSystem}
          style={notificationStyle}
        />
        {this.props.app.appLoading ? (
          <Router history={history}>
            <AppLoading />
          </Router>
        ) : (
          <Router history={history}>
            <Suspense fallback={<AppLoading />}>
              <Switch>
                <Route
                  exact
                  path={'/ethfinex'}
                  render={props => <ApplicationHomeEfxPage {...props} />}
                  // component={ApplicationHomeEfxPage}
                />
                <Route
                  exact
                  path={'/app/' + appHashPath + '/home'}
                  render={props => <ApplicationHomePage {...props} />}
                  // component={ApplicationHomePage}
                />
                <Route
                  path={'/app/' + appHashPath + '/vault'}
                  render={props => <ApplicationVaultPage {...props} />}
                  // component={ApplicationVaultPage}
                />
                <Route
                  path={'/app/' + appHashPath + '/drago'}
                  render={props => <ApplicationDragoPage {...props} />}
                  // component={ApplicationDragoPage}
                />
                <Route
                  path={'/app/' + appHashPath + '/exchange'}
                  render={props => <ApplicationExchangePage {...props} />}
                  // component={ApplicationExchangePage}
                />
                <Route
                  path={'/app/' + appHashPath + '/config'}
                  render={props => <ApplicationConfigPage {...props} />}
                  // component={ApplicationConfigPage}
                />
                <Redirect
                  from="/exchange/"
                  to={'/app/' + appHashPath + '/exchange'}
                />
                <Redirect
                  from="/vault/"
                  to={'/app/' + appHashPath + '/vault'}
                />
                <Redirect from="/drago" to={'/app/' + appHashPath + '/drago'} />
                <Redirect from="/" to={'/app/' + appHashPath + '/home'} />
                <Route
                  render={props => <Whoops404 {...props} />}
                  // component={Whoops404}
                />
              </Switch>
            </Suspense>
          </Router>
        )}
      </div>
    )
  }
}

export default connect(mapStateToProps)(App)
