import React, { Component } from 'react';
import { Link, Route, withRouter } from 'react-router-dom'
import {Tabs, Tab} from 'material-ui/Tabs';
import FontIcon from 'material-ui/FontIcon';
import ActionLightBulb from 'material-ui/svg-icons/action/lightbulb-outline';
import ActionHome from 'material-ui/svg-icons/action/home';
import ActionPolymer from 'material-ui/svg-icons/action/polymer';

import MuiThemeProvider from 'material-ui/styles/MuiThemeProvider'
import getMuiTheme from 'material-ui/styles/getMuiTheme';
import lightBaseTheme from 'material-ui/styles/baseThemes/lightBaseTheme';

import styles from '../application.module.css';

function logMsg(message) {
    console.log(message);
  }


// Router and material-ui tabs: https://stackoverflow.com/questions/41638688/material-uis-tabs-integration-with-react-router-4
class ApplicationTabsMenu extends Component {
    constructor(props) {
      super(props)

    }

    state = {
        // value: this.props.location.pathname
        // value: "/vault"
    }

    handleCallToRouter = (value) => {
        this.props.history.push(value);
        // console.log(this.props.location.pathname);
        // var lastElementPath = this.props.location.pathname.split( '/' ).pop();
        // console.log(lastElementPath);
      }

    componentWillMount () {
      const { location } = this.props
      // const { match } = this.props
      var lastElementPath = "/" + location.pathname.split( '/' ).pop();
      this.setState({value: lastElementPath})
      // console.log(match);
      // console.log(location);
      // console.log(lastElementPath);
    }

    render() {
    // match  and location are passed by the Router
    // match contains the url parameters

      return (
        <Tabs
            className={ styles.tabs }
            value={this.state.value}
            onChange={this.handleCallToRouter}
            >
            <Tab
            icon={<ActionHome />}
            label="Home"
            value="/web"
            >
            {/* {logMsg('Tab Home')} */}
            </Tab>
            <Tab
            icon={<ActionLightBulb />}
            label="Vault"
            value="/vault"
            >
            {/* {logMsg('Tab 1')} */}
            </Tab>
            <Tab
            icon={<ActionLightBulb />}
            label="Drago"
            value="/drago"
            >
            {/* {logMsg('Tab 2')} */}
            </Tab>
            <Tab
            icon={<ActionPolymer />}
            label="Exchange"
            value="/exchange"
            >
            {/* {logMsg('Tab 3')} */}
            </Tab>
        </Tabs>

      )
    }
  }

export default withRouter(ApplicationTabsMenu)