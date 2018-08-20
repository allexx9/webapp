// Copyright 2016-2017 Rigo Investment Sagl.

import React, { Component } from 'react';
import ApplicationVaultManager from './ApplicationVaultManager'
import ApplicationVaultTrader from './ApplicationVaultTrader'
import Loading from '../_atomic/atoms/loading';
import { Row, Col } from 'react-flexbox-grid';
import { connect } from 'react-redux';
import LeftSideDrawerVaults from '../Elements/leftSideDrawerVaults';
import PropTypes from 'prop-types';
import utils from '../_utils/utils'
import ElementNotificationsDrawer from '../Elements/elementNotificationsDrawer'
import CheckAuthPage from '../Elements/checkAuthPage'
import ElementBottomStatusBar from '../Elements/elementBottomStatusBar'

import styles from './applicationVaultHome.module.css';


function mapStateToProps(state) {
  return state
}

class ApplicationVaultHome extends Component {

  constructor() {
    super();
    this._notificationSystem = null;
    
  }

  static contextTypes = {
    api: PropTypes.object.isRequired,
  };

  static propTypes = {
    location: PropTypes.object.isRequired,
    endpoint: PropTypes.object.isRequired,
    handleToggleNotifications: PropTypes.func.isRequired,
    user: PropTypes.object.isRequired, 
    notificationsOpen: PropTypes.bool.isRequired
  };

  state = {

  }

  scrollPosition = 0
  activeElement = null

  shouldComponentUpdate(nextProps, nextState){    
    var stateUpdate = true
    var propsUpdate = true
    // shouldComponentUpdate returns false if no need to update children, true if needed.
    propsUpdate = (!utils.shallowEqual(this.props, nextProps))
    stateUpdate = (!utils.shallowEqual(this.state.loading, nextState.loading))
    stateUpdate = (!utils.shallowEqual(this.state, nextState))
    // Saving the scroll position. Neede in componentDidUpdate in order to avoid the the page scroll to be
    // set top
    const element = this.node
    if (element !== null) {
      this.scrollPosition = window.scrollY
    }
    return stateUpdate || propsUpdate 
  }

  UNSAFE_componentWillMount () {
  } 

  componentDidMount() {
  }

  componentWillUnmount() {
  }

  UNSAFE_componentWillUpdate() {
    // Storing the active document, so we can preserve focus in forms.
    this.activeElement = document.activeElement
  }

  componentDidUpdate() {
    // The following code is needed to fix a bug in tables. The scrolling posision is reset at every component re-render.
    // Setting the page scroll position
    console.log(`${this.constructor.name} -> componentDidUpdate`);
    // const element = ReactDOM.findDOMNode(this);
    const element = this.node
    if (element !== null) {
      window.scrollTo(0, this.scrollPosition)
    }
    // Setting focus on the element active before component re-render
    if (this.activeElement.id !== "") {
      const activeElement = document.getElementById(this.activeElement.id);
      if (activeElement !== null) {
        activeElement.focus()
      }
    }
  }

  render () {
    const { blockNumber } = this.state;
    const {
      user,
      location,
      handleToggleNotifications,
      notificationsOpen,
      endpoint
    } = this.props
    if (endpoint.loading) {
      return <Loading></Loading>
    }

    // if (endpoint.ethBalance === null) {
    //   console.log('ethBalance = null')
    //   return null
    // }

    if ((endpoint.accounts.length === 0 || !endpoint.networkCorrect)) {
      return (
        <span>
          <CheckAuthPage warnMsg={endpoint.warnMsg} location={location}/>
          <ElementBottomStatusBar
            blockNumber={endpoint.prevBlockNumber}
            networkName={endpoint.networkInfo.name}
            networkError={endpoint.networkError}
            networkStatus={endpoint.networkStatus} />
        </span>
    )
    }

    if (user.isManager) {
      return (
        <div ref={node => this.node = node}>
          <Row className={styles.maincontainer}>
            <Col xs={2}>
              <LeftSideDrawerVaults location={location} isManager={user.isManager}/>
            </Col>
            <Col xs={10}>
              <ApplicationVaultManager
                blockNumber={blockNumber}
                accounts={endpoint.accounts}
                ethBalance={endpoint.ethBalance}
                accountsInfo={endpoint.accountsInfo}
                isManager={user.isManager}
              />
            </Col>
            <Row>
              <Col xs={12}>
                {notificationsOpen ? (
                  <ElementNotificationsDrawer
                    handleToggleNotifications={handleToggleNotifications}
                    notificationsOpen={notificationsOpen}
                  />
                ) : (
                    null
                  )}
              </Col>
            </Row>
          </Row>
          <ElementBottomStatusBar 
          blockNumber={endpoint.prevBlockNumber}
          networkName={endpoint.networkInfo.name}
          networkError={endpoint.networkError}
          networkStatus={endpoint.networkStatus} />
        </div>
      );
    }

    if (!user.isManager) {
      return (
        <div ref={node => this.node = node}>
          <Row className={styles.maincontainer}>
            <Col xs={2}>
            <LeftSideDrawerVaults location={location} isManager={user.isManager}/>
            </Col>
            <Col xs={10}>
              <ApplicationVaultTrader 
                blockNumber={blockNumber}
                accounts={endpoint.accounts}
                ethBalance={endpoint.ethBalance}
                accountsInfo={endpoint.accountsInfo}
                isManager={user.isManager}
              />
            </Col>
          </Row>
            <Row>
            <Col xs={12}>
              {notificationsOpen ? (
                <ElementNotificationsDrawer 
                handleToggleNotifications={handleToggleNotifications} 
                notificationsOpen={notificationsOpen}
                />
              ) : (
                null
              )}
            </Col>
          </Row>
          <ElementBottomStatusBar 
          blockNumber={endpoint.prevBlockNumber}
          networkName={endpoint.networkInfo.name}
          networkError={endpoint.networkError}
          networkStatus={endpoint.networkStatus} />
        </div>
      );
    }
  }

}

export default connect(mapStateToProps)(ApplicationVaultHome)
