// Copyright 2016-2017 Rigo Investment Sagl.

import React, { Component } from 'react';
import PropTypes from 'prop-types';
import ApplicationHome from '../ApplicationHome';
import ApplicationTopBar from './ApplicationTopBar';

import getMuiTheme from 'material-ui/styles/getMuiTheme';
import { Grid, Row, Col } from 'react-flexbox-grid';

import styles from './application.module.css';
import classNames from 'classnames';
import MuiThemeProvider from 'material-ui/styles/MuiThemeProvider';
import ElementNotConnected from '../Elements/elementNotConnected'
import { connect } from 'react-redux';


const muiTheme = getMuiTheme({
  palette: {
    "primary1Color": '#054186',

  },
  appBar: {
    height: 45,
    fontSize: "20px !important",
    backgroundColor: "#054186"
  },
});

function mapStateToProps(state) {
  return state
}

class ApplicationHomePage extends Component {

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
    syncStatus: PropTypes.object.isRequired,
    ethereumNetworkName: PropTypes.string.isRequired,
  };

  UNSAFE_componentWillMount() {
  }

  componentWillUnmount() {
  }

  static propTypes = {
    location: PropTypes.object.isRequired,
  };

  handleToggleNotifications = () => {
    this.setState({ notificationsOpen: !this.state.notificationsOpen })
  }

  render() {
    return (
      <MuiThemeProvider muiTheme={muiTheme}>
        <Grid fluid className={styles.maincontainer}>
          <Row>
            <Col xs={12}>
              <ApplicationTopBar
                handleTopBarSelectAccountType={this.handleTopBarSelectAccountType}
                handleToggleNotifications={this.handleToggleNotifications}
              />
            </Col>
          </Row>
          <Row className={classNames(styles.content)}>
            <Col xs={12}>
              {this.context.isConnected && !this.context.isSyncing ? (
                  <ApplicationHome />
              ) : (
                  <ElementNotConnected isSyncing={this.context.isSyncing} syncStatus={this.context.syncStatus} />
                )}
            </Col>
          </Row>
        </Grid>
      </MuiThemeProvider>
    )
  }
}

export default connect(mapStateToProps)(ApplicationHomePage)




