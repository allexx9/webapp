// Copyright 2016-2017 Rigo Investment Sarl.

import React, { Component } from 'react';
import  * as Colors from 'material-ui/styles/colors';
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
    "primary1Color": Colors.blue500,

  },
  appBar: {
    height: 45,
    fontSize: "20px !important"
  },
});

function mapStateToProps(state) {
  return state
}

class ApplicationConfigPage extends Component {

  // Context
  static childContextTypes = {
    muiTheme: PropTypes.object,
  };

  state = {
    notificationsOpen: false
  }

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

export default connect(mapStateToProps)(ApplicationConfigPage)
