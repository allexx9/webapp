// Copyright 2016-2017 Rigo Investment Sarl.

import React, { Component } from 'react';
import  * as Colors from 'material-ui/styles/colors';
import PropTypes from 'prop-types';
import ApplicationVaultHome from '../ApplicationVaultHome';
import ApplicationTopBar from './ApplicationTopBar';

import getMuiTheme from 'material-ui/styles/getMuiTheme';
import { Grid, Row, Col } from 'react-flexbox-grid';

import styles from './application.module.css';
import classNames from 'classnames';
import MuiThemeProvider from 'material-ui/styles/MuiThemeProvider';
import NotConnected from '../Elements/notConnected'
import { connect } from 'react-redux';


const muiTheme = getMuiTheme({
  palette: {
    "primary1Color": Colors.indigo500,

  },
  appBar: {
    height: 45,
    fontSize: "20px !important"
  },
});

const muiThemeVault = getMuiTheme({
  palette: {
    "primary1Color": Colors.blueGrey500,
  },
  appBar: {
    height: 45,
    fontSize: "20px !important"
  }
});

function mapStateToProps(state) {
  return state
}

class ApplicationDragoPage extends Component {

  constructor(props) {
    super(props);
    this.state = {
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
    syncStatus: PropTypes.object.isRequired
  };

  static propTypes = {
    location: PropTypes.object
  }

  componentWillMount() {
  }

  componentWillUnmount() {
  }

  handleToggleNotifications = () => {
    this.setState({ notificationsOpen: !this.state.notificationsOpen })
  }

  render() {
    const { notificationsOpen } = this.state
    const { location } = this.props
    // console.log('is Manager = '+this.state.isManager)
    return (
      <MuiThemeProvider muiTheme={muiTheme}>
        <Grid fluid className={styles.maincontainer}>
          <Row>
            <Col xs={12}>
              <ApplicationTopBar
                handleTopBarSelectAccountType={this.handleTopBarSelectAccountType}
                isManager={this.state.isManager}
                handleToggleNotifications={this.handleToggleNotifications}
              />
            </Col>
          </Row>
          <MuiThemeProvider muiTheme={muiThemeVault}>
          <Row className={classNames(styles.content)}>
            <Col xs={12}>
              {this.context.isConnected && !this.context.isSyncing ? (
                // {false ? (
                <ApplicationVaultHome
                  isManager={this.state.isManager}
                  location={location}
                  notificationsOpen={notificationsOpen}
                  handleToggleNotifications={this.handleToggleNotifications}
                />
              ) : (
                  <NotConnected/>
                )}
            </Col>
          </Row>
          </MuiThemeProvider>
        </Grid>
      </MuiThemeProvider>
    )
  }
}

export default connect(mapStateToProps)(ApplicationDragoPage)





