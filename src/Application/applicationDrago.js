// Copyright 2016-2017 Rigo Investment Sagl.

import React, { Component } from 'react';
import PropTypes from 'prop-types';
import ApplicationDragoHome from '../ApplicationDragoHome';
import ApplicationTopBar from './ApplicationTopBar';

import getMuiTheme from 'material-ui/styles/getMuiTheme';
import { Grid, Row, Col } from 'react-flexbox-grid';

import styles from './application.module.css';
import classNames from 'classnames';
import MuiThemeProvider from 'material-ui/styles/MuiThemeProvider';
import { connect } from 'react-redux';
import { THEME_COLOR } from './../_utils/const'
import ElementNotConnected from '../Elements/elementNotConnected'

const muiTheme = getMuiTheme({
  palette: {
    "primary1Color": '#054186', //#054186

  },
  fontFamily: "'Muli', sans-serif",
  appBar: {
    height: 45,
    fontSize: "20px !important",
    background: THEME_COLOR.drago
  },
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
  };

  UNSAFE_componentWillMount() {
  }

  componentWillUnmount() {
  }

  static propTypes = {
    location: PropTypes.object.isRequired,
    app: PropTypes.object.isRequired
  };

  handleToggleNotifications = () => {
    this.setState({ notificationsOpen: !this.state.notificationsOpen })
  }

  render() {
    const { notificationsOpen } = this.state
    const { location } = this.props
    const { isSyncing, syncStatus, isConnected } = this.props.app
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
              <ApplicationDragoHome
                location={location}
                notificationsOpen={notificationsOpen}
                handleToggleNotifications={this.handleToggleNotifications}
              />
              {isConnected && !isSyncing ? (
                null
              ) : (
                  <ElementNotConnected isSyncing={isSyncing} syncStatus={syncStatus} />
                )}
            </Col>
          </Row>
        </Grid>
      </MuiThemeProvider>
    )
  }
}

export default connect(mapStateToProps)(ApplicationDragoPage)




