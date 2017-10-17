// Copyright 2016-2017 Gabriele Rigo

import styles from './application.module.css';

import React, { Component } from 'react';

// React.PropTypes is deprecated since React 15.5.0, use the npm module prop-types instead
import PropTypes from 'prop-types';

import { Tabs, Tab } from 'material-ui/Tabs';
import FontIcon from 'material-ui/FontIcon';
import ActionLightBulb from 'material-ui/svg-icons/action/lightbulb-outline';
import ActionHome from 'material-ui/svg-icons/action/home';
import ActionPolymer from 'material-ui/svg-icons/action/polymer';

import ApplicationGabcoin from '../ApplicationGabcoin';
import ApplicationGabcoinEventful from '../ApplicationGabcoinEventful';
import ApplicationExchange from '../ApplicationExchange';
import ApplicationExchangeEventful from '../ApplicationExchangeEventful';
import ApplicationDrago from '../ApplicationDrago';
import ApplicationDragoEventful from '../ApplicationDragoEventful';
// import ApplicationDragoFactory from '../ApplicationDragoFactory';
import ApplicationHome from '../ApplicationHome';

import getMuiTheme from 'material-ui/styles/getMuiTheme';
import lightBaseTheme from 'material-ui/styles/baseThemes/lightBaseTheme';

const muiTheme = getMuiTheme(lightBaseTheme);

export default class Application extends Component {

  state = {
        value: 'a',
  }

  static childContextTypes = {
    muiTheme: PropTypes.object
  };



//<div style={{backgroundColor: 'sameAsTabs'}}>
//style={{width: 1000, float: 'left'}}>
//fixedTabWidth={200} //in Tabs

  render() {
    return (
        <Tabs
          className={ styles.tabs }
          value={this.state.value}
          onChange={this.handleChange}>
          <Tab
            icon={<ActionHome />}
            label='HOME'
            value='a'>
            <ApplicationHome />
          </Tab>
          <Tab
            icon={<ActionLightBulb />}
            label='VAULT'
            value='b'>
            <ApplicationGabcoin />
            <ApplicationGabcoinEventful />
          </Tab>
          <Tab
            icon={<ActionLightBulb />}
            label='DRAGO'
            value='c'>
            <ApplicationDrago />
            <ApplicationDragoEventful />
          </Tab>
          <Tab
            icon={<ActionPolymer />}
            label='EXCHANGE'
            value='d'>
            <ApplicationExchange />
            <ApplicationExchangeEventful />
          </Tab>
        </Tabs>
    );
  }

/*
<ApplicationGabcoinEventful />
*/

  handleChange = (value) => {
    this.setState({
      value: value,
    });
  }

  getChildContext () {
    return {
      muiTheme
    };
  }
}
