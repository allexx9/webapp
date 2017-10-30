// Copyright 2016-2017 Gabriele Rigo
import { api } from '../parity';


// import styles from './application.module.css';

import React, { Component } from 'react';

// React.PropTypes is deprecated since React 15.5.0, use the npm module prop-types instead
import PropTypes from 'prop-types';

// import { Tabs, Tab } from 'material-ui/Tabs';
// import FontIcon from 'material-ui/FontIcon';
// import ActionLightBulb from 'material-ui/svg-icons/action/lightbulb-outline';
// import ActionHome from 'material-ui/svg-icons/action/home';
// import ActionPolymer from 'material-ui/svg-icons/action/polymer';

import ApplicationGabcoin from '../ApplicationGabcoin';
import ApplicationGabcoinEventful from '../ApplicationGabcoinEventful';
import ApplicationExchange from '../ApplicationExchange';
import ApplicationExchangeEventful from '../ApplicationExchangeEventful';
import ApplicationDrago from '../ApplicationDrago';
import ApplicationDragoEventful from '../ApplicationDragoEventful';
// import ApplicationDragoFactory from '../ApplicationDragoFactory';
import ApplicationHome from '../ApplicationHome';

import ApplicationTabsMenu from './ApplicationTabsMenu';
import ApplicationBottomBar from './ApplicationBottomBar';
import ApplicationTopBar from './ApplicationTopBar';

import MuiThemeProvider from 'material-ui/styles/MuiThemeProvider'
import getMuiTheme from 'material-ui/styles/getMuiTheme';
import lightBaseTheme from 'material-ui/styles/baseThemes/lightBaseTheme';
import Paper from 'material-ui/Paper';
import { Grid, Row, Col } from 'react-flexbox-grid';

import styles from './application.module.css';
import classNames from 'classnames';

// Router
// import { Link, Route, withRouter } from 'react-router-dom'

const muiTheme = getMuiTheme(lightBaseTheme);

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
  constructor(props) {
    super(props)
  }

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
  constructor(props) {
    super(props)

  }

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
  // console.log(location);
    return (
        <TemplateLayout>
          <ApplicationHome></ApplicationHome>
        </TemplateLayout>
    )
  }
}

export class ApplicationGabcoinPage extends Component {
  constructor(props) {
    super(props)

  }

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
  constructor(props) {
    super(props)

  }

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
          <ApplicationDrago />
          <ApplicationDragoEventful />
          {/* <p>Locaton is {location.pathname}</p> */}
          </TemplateLayout>
    )
  }
}

export class ApplicationExchangePage extends Component {
  constructor(props) {
    super(props)

  }

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


