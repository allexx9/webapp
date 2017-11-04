// Copyright 2016-2017 Gabriele Rigo
import { api } from '../parity';

import React, { Component } from 'react';

// React.PropTypes is deprecated since React 15.5.0, use the npm module prop-types instead
import PropTypes from 'prop-types';

import ApplicationGabcoin from '../ApplicationGabcoin';
import ApplicationGabcoinEventful from '../ApplicationGabcoinEventful';
import ApplicationExchange from '../ApplicationExchange';
import ApplicationExchangeEventful from '../ApplicationExchangeEventful';
import ApplicationDragoHome from '../ApplicationDragoHome';
// import ApplicationDragoFactory from '../ApplicationDragoFactory';
import ApplicationHome from '../ApplicationHome';

import ApplicationBottomBar from './ApplicationBottomBar';
import ApplicationTopBar from './ApplicationTopBar';

import getMuiTheme from 'material-ui/styles/getMuiTheme';
import lightBaseTheme from 'material-ui/styles/baseThemes/lightBaseTheme';
import { Grid, Row, Col } from 'react-flexbox-grid';

import styles from './application.module.css';
import classNames from 'classnames';

import * as Colors from 'material-ui/styles/colors';
import MuiThemeProvider from 'material-ui/styles/MuiThemeProvider';

// Router
// import { Link, Route, withRouter } from 'react-router-dom'

// const muiTheme = getMuiTheme(lightBaseTheme);

const muiTheme = getMuiTheme({
  palette: {
    "primary1Color": "#2196f3",

  }
});

// function logMsg(message) {
//   console.log(message);
// }

// This function accepts children components to display below the Tabs top menu.
// Flex box grid system: https://github.com/roylee0704/react-flexbox-grid
const TemplateLayout = ({children}) =>
(

      <Grid fluid className={styles.maincontainer}>
        <Row>
          <Col xs={12}>
            {/* <ApplicationTabsMenu /> */}
            <ApplicationTopBar />
          </Col>
        </Row>
        <Row className={classNames(styles.content)}>
          <Col xs={12}>
            {children}
          </Col>
        </Row>
        <Row>
          <Col xs={12} className={classNames(styles.bottombar)}>
            <ApplicationBottomBar />
          </Col>
        </Row>
      </Grid>

)

export class Whoops404 extends Component {
  // constructor(props) {
  //   super(props)
  // }

  render() {
  // we access the props passed to the component
  const { location } = this.props
  console.log(location);
    return (
          <TemplateLayout>
          <div className="">
              <h1>Page not found. Resource not found at '{location.pathname}'</h1>
          </div>
          </TemplateLayout>
    )
  }
}

export class ApplicationHomePage extends Component {

  // We define the properties of the context variables passed down to the children
  static childContextTypes = {
    muiTheme: PropTypes.object,
    api: PropTypes.object
  };

  // We pass down the context variables passed down to the children
  getChildContext () {
    return {
      muiTheme,
      api
    };
  }

  render() {
  // we access the props passed to the component
  // console.log(location);
    return (
      <TemplateLayout>
          <ApplicationHome />
      </TemplateLayout>
    )
  }
}

export class ApplicationGabcoinPage extends Component {

    // We define the properties of the context variables passed down to the children
    static childContextTypes = {
      muiTheme: PropTypes.object,
      api: PropTypes.object
    };
  
    // We pass down the context variables passed down to the children
    getChildContext () {
      return {
        muiTheme,
        api
      };
    }

  render() {
  // we access the props passed to the component
  const { location } = this.props
  console.log(location);
    return (
          <TemplateLayout>
          <ApplicationGabcoin />
          <ApplicationGabcoinEventful />
              {/* <p>Locaton is {location.pathname}</p> */}
          </TemplateLayout>
    )
  }
}

export class ApplicationDragoPage extends Component {

  // We define the properties of the context variables passed down to the children
  static childContextTypes = {
    muiTheme: PropTypes.object,
    api: PropTypes.object
  };

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
  handleTopBarSelectAccountType = (event, index, value) => { 
    const accountType = {
      false: false,
      true: true
    }
    this.setState({
      isManager: accountType[value],
    }); 
  };

  static PropTypes = {
    location: PropTypes.object.isRequired,
  };

  state = {
    isManager: false,
  }

  render() {
  // console.log(location);
  const { location } = this.props
    return (
      <MuiThemeProvider muiTheme={muiTheme}>
        <Grid fluid className={styles.maincontainer}>
          <Row>
            <Col xs={12}>
              {/* <ApplicationTabsMenu /> */}
              <ApplicationTopBar handleTopBarSelectAccountType={ this.handleTopBarSelectAccountType } isManager={this.state.isManager} />
            </Col>
          </Row>
          <Row className={classNames(styles.content)}>
            <Col xs={12}>
            <ApplicationDragoHome isManager={this.state.isManager} location={location}/>
            </Col>
          </Row>
          <Row>
            <Col xs={12} className={classNames(styles.bottombar)}>
              <ApplicationBottomBar />
            </Col>
          </Row>
        </Grid>
      </MuiThemeProvider>
    )
  }
}

export class ApplicationExchangePage extends Component {

  // We define the properties of the context variables passed down to the children
  static childContextTypes = {
    muiTheme: PropTypes.object,
    api: PropTypes.object
  };

  // We pass down the context variables passed down to the children
  getChildContext () {
    return {
      muiTheme,
      api
    };
  }

  render() {
  // we access the props passed to the component
  const { location } = this.props
  console.log(location);
    return (
          <TemplateLayout>
          <ApplicationExchange />
          <ApplicationExchangeEventful />
          {/* <p>Locaton is {location.pathname}</p> */}
          </TemplateLayout>
    )
  }
}


