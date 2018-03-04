// Copyright 2016-2017 Rigo Investment Sarl.

import React, { Component } from 'react';

import { api } from '../parity';

import PropTypes from 'prop-types';

// import ApplicationExchange from '../ApplicationExchange';
// import ApplicationExchangeEventful from '../ApplicationExchangeEventful';
// import ApplicationDragoHome from '../ApplicationDragoHome';
// import ApplicationDragoFactory from '../ApplicationDragoFactory';
import ApplicationHome from '../ApplicationHome';
// import ApplicationConfig from '../ApplicationConfig';
import ApplicationTopBar from './ApplicationTopBar';
import getMuiTheme from 'material-ui/styles/getMuiTheme';
import { Grid, Row, Col } from 'react-flexbox-grid';
import styles from './application.module.css';
import classNames from 'classnames';
import MuiThemeProvider from 'material-ui/styles/MuiThemeProvider';
import NotConnected from '../Elements/notConnected'




// Router
// import { Link, Route, withRouter } from 'react-router-dom'

// const muiTheme = getMuiTheme(lightBaseTheme);

const muiTheme = getMuiTheme({
  palette: {
    "primary1Color": "#2196f3",

  },
  appBar: {
    height: 45,
    fontSize: "20px !important"
  },
});

const isConnectedTimeout = 4000

// function logMsg(message) {
//   console.log(message);
// }

// This function accepts children components to display below the Tabs top menu.
// Flex box grid system: https://github.com/roylee0704/react-flexbox-grid

export class Whoops404 extends Component {
  // constructor(props) {
  //   super(props)
  // }

  // We define the properties of the context variables passed down to the children
  static childContextTypes = {
    muiTheme: PropTypes.object,
    api: PropTypes.object,
    isConnected: PropTypes.func
  };

  state = {
    isConnected: true,
    isSyncing: false,
    isManager: true,
    syncStatus: null,
    notificationsOpen: false
  }

  td = null

  componentWillMount() {
    setTimeout(this.checkConnectionToNode,2000)
  }

  componentWillUnmount () {
    clearTimeout(this.td)
  }

  // This function is passed down with context and used as a call back function to show a warning page
  // if the connection with the node drops
  isConnected = (status) => {
    // console.log('isConnected')
    this.setState({
      isConnected: status
    })
  }

  checkConnectionToNode = () =>{
    console.log(api.isConnected)
    if (api.isConnected) {
      this.setState({
        isConnected: true
      })
      api.eth.syncing()
      .then(result => {
        if(result !== false) {
          this.setState({
            isSyncing: true,
            syncStatus: result
          })
        }
        // console.log(api.net.peerCount())
        // console.log('synching ', result)
      })
      this.td = setTimeout(this.checkConnectionToNode,isConnectedTimeout)
    } else {
      this.setState({
        isConnected: false
      })  
      this.td = setTimeout(this.checkConnectionToNode,isConnectedTimeout)
    }    
  }

  // We pass down the context variables passed down to the children
  getChildContext () {
    return {
      muiTheme,
      api,
      isConnected: this.isConnected
    };
  }

  // Callback function to handle account type selection in the Top Bar
  // value = 1 = Trader
  // value = 2 = Manager
  handleTopBarSelectAccountType = (event, index, value) => { 
    const accountType = {
      false: false,
      true: true
    }
    this.setState({
      isManager: accountType[value],
    }); 
  };

  static propTypes = {
    location: PropTypes.object.isRequired,
  };

  handleToggleNotifications = () => {
    console.log('open')
    this.setState({notificationsOpen: !this.state.notificationsOpen})
  }

  render() {
    const { location, } = this.props
    console.log('is Manager = ' + this.state.isManager)
    return (
      <MuiThemeProvider muiTheme={muiTheme}>
        <Grid fluid className={styles.maincontainer}>
          <Row>
            <Col xs={12}>
              {/* <ApplicationTabsMenu /> */}
              <ApplicationTopBar
                handleTopBarSelectAccountType={this.handleTopBarSelectAccountType}
                isManager={this.state.isManager}
                handleToggleNotifications={this.handleToggleNotifications}
              />
            </Col>
          </Row>
          <Row className={classNames(styles.content)}>
            <Col xs={12}>
              <div className="">
                <h1>Page not found. Resource not found at '{location.pathname}'</h1>
              </div>
            </Col>
          </Row>
        </Grid>
      </MuiThemeProvider>
    )
  }
}

export class ApplicationHomePage extends Component {

  // We define the properties of the context variables passed down to the children
  static childContextTypes = {
    muiTheme: PropTypes.object,
    api: PropTypes.object
  }

  state = {
    isConnected: true,
    isSyncing: false,
    isManager: true,
    syncStatus: null
  }

  // We pass down the context variables passed down to the children
  getChildContext () {
    return {
      muiTheme,
      api
    };
  }

    // Callback function to handle account type selection in the Top Bar
  // value = 1 = Trader
  // value = 2 = Manager
  handleTopBarSelectAccountType = (event, value) => { 
    const accountType = {
      false: false,
      true: true
    }
    this.setState({
      isManager: accountType[value],
    }); 
  };

  static propTypes = {
    location: PropTypes.object.isRequired,
  };

  handleToggleNotifications = () => {
    console.log('open')
    this.setState({notificationsOpen: !this.state.notificationsOpen})
  }

  componentWillMount() {
    // Starting connection checking. this is not necessary runnin inside Parity UI
    // because the checki is done by Parity and a messagge will be displayed by the client
    var endpoint = localStorage.getItem('endpoint')
    console.log(endpoint)
    if (endpoint !== 'local') {
      this.td =  setTimeout(this.checkConnectionToNode,2000)
    }
  }

  componentWillUnmount () {
    var endpoint = localStorage.getItem('endpoint')
    if (endpoint !== 'local') {
      clearTimeout(this.td)
    }
  }

  // This function is passed down with context and used as a call back function to show a warning page
  // if the connection with the node drops
  isConnected = (status) => {
    this.setState({
      isConnected: status
    })
  }

  checkConnectionToNode = () =>{
    if (api.isConnected) {
      this.setState({
        isConnected: true
      })
      api.eth.syncing()
      .then(result => {
        if(result !== false) {
          this.setState({
            isSyncing: true,
            syncStatus: result
          })
        }
        // console.log(api.net.peerCount())
        // console.log('synching ', result)
      })
      this.td = setTimeout(this.checkConnectionToNode,isConnectedTimeout)
    } else {
      this.setState({
        isConnected: false
      })  
      this.td = setTimeout(this.checkConnectionToNode,isConnectedTimeout)
    }    
  }

  render() {
  // we access the props passed to the component
  // console.log(location);
    // console.log('is Manager = '+this.state.isManager)
    // console.log(this.state.isConnected && !this.state.isSyncing)
    return (
      <Grid fluid className={styles.maincontainer}>
      <Row>
        <Col xs={12}>
          {/* <ApplicationTabsMenu /> */}
          <ApplicationTopBar 
                handleTopBarSelectAccountType={ this.handleTopBarSelectAccountType } 
                isManager={this.state.isManager} 
                handleToggleNotifications={this.handleToggleNotifications} 
                />
        </Col>
      </Row>
      <Row className={classNames(styles.content)}>
        <Col xs={12}>
        {this.state.isConnected && !this.state.isSyncing ? (
        // {false ? (
                <ApplicationHome />
              ) : (
                <NotConnected isSyncing={this.state.isSyncing} syncStatus={this.state.syncStatus}/>
              )}
        </Col>
      </Row>
      <Row>
        <Col xs={12} className={classNames(styles.bottombar)}>
          {/* <ApplicationBottomBar /> */}
        </Col>
      </Row>
      </Grid>
    )
  }
}



