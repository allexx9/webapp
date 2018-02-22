// Copyright 2016-2017 Rigo Investment Sarl.

import React, { Component } from 'react';

import PropTypes from 'prop-types';
import ApplicationConfigHome from '../ApplicationConfig';
import ApplicationTopBar from './ApplicationTopBar';

import getMuiTheme from 'material-ui/styles/getMuiTheme';
import { Grid, Row, Col } from 'react-flexbox-grid';

import styles from './application.module.css';
import classNames from 'classnames';
import MuiThemeProvider from 'material-ui/styles/MuiThemeProvider';
import { connect } from 'react-redux';


const muiTheme = getMuiTheme({
  palette: {
    "primary1Color": "#2196f3",

  },
  appBar: {
    height: 45,
    fontSize: "20px !important"
  },
});

function mapStateToProps(state) {
  return state
}

class ApplicationConfigePage extends Component {

  constructor(props) {
    super(props);
    const isManagerSelected = localStorage.getItem('isManager')
    var isManager = false
    // Checking account type (trader/manager) and restoring after browser refresh
    if (typeof isManagerSelected !== 'undefined') {
      switch (isManagerSelected) {
        case 'false':
          isManager = false
          break;
        case 'true':
          isManager = true
          break;
        default:
          isManager = false
      }
    } else {
      isManager = false
    }
    this.state = {
      isManager: isManager,
      notificationsOpen: false
    }
  }

  // Context
  static childContextTypes = {
    muiTheme: PropTypes.object,
  };

  getChildContext() {
    return {
      muiTheme,
    };
  }

  static contextTypes = {
    api: PropTypes.object.isRequired,
    isConnected: PropTypes.bool.isRequired,
    isSyncing: PropTypes.bool.isRequired,
    syncStatus: PropTypes.object.isRequired,
    ethereumNetworkName: PropTypes.string.isRequired,
  };

  componentWillMount() {
  }

  componentWillUnmount() {
  }

  // Callback function to handle account type selection in the Top Bar
  // value = 1 = Trader
  // value = 2 = Manager
  handleTopBarSelectAccountType = (event, value) => {
    const accountType = {
      false: false,
      true: true
    }
    localStorage.setItem('isManager', accountType[value])
    this.setState({
      isManager: accountType[value],
    });
  };

  static propTypes = {
    location: PropTypes.object.isRequired,
    match: PropTypes.object.isRequired,
  };

  handleToggleNotifications = () => {
    this.setState({ notificationsOpen: !this.state.notificationsOpen })
  }

  render() {
    const { notificationsOpen } = this.state
    const { location, match } = this.props
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
              <ApplicationConfigHome
                match={match}
                isManager={this.state.isManager}
                location={location}
                notificationsOpen={notificationsOpen}
                handleToggleNotifications={this.handleToggleNotifications}
              />
            </Col>
          </Row>
        </Grid>
      </MuiThemeProvider>
    )
  }
}

export default connect(mapStateToProps)(ApplicationConfigePage)
