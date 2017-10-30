import React, { Component } from 'react';
import { Link, Route, withRouter } from 'react-router-dom'
import AppBar from 'material-ui/AppBar';
import NavigationClose from 'material-ui/svg-icons/navigation/close';
import FlatButton from 'material-ui/FlatButton';
import ActionLightBulb from 'material-ui/svg-icons/action/lightbulb-outline';
import ActionHome from 'material-ui/svg-icons/action/home';
import ActionPolymer from 'material-ui/svg-icons/action/polymer';
import ActionShowChart from 'material-ui/svg-icons/editor/show-chart';

import IconMenu from 'material-ui/IconMenu';
import IconButton from 'material-ui/IconButton';
import FontIcon from 'material-ui/FontIcon';
import NavigationExpandMoreIcon from 'material-ui/svg-icons/navigation/expand-more';
import MenuItem from 'material-ui/MenuItem';
import DropDownMenu from 'material-ui/DropDownMenu';
import RaisedButton from 'material-ui/RaisedButton';
import {Toolbar, ToolbarGroup, ToolbarSeparator, ToolbarTitle} from 'material-ui/Toolbar';

import getMuiTheme from 'material-ui/styles/getMuiTheme';
import lightBaseTheme from 'material-ui/styles/baseThemes/lightBaseTheme';

import styles from '../application.module.css';

function handleTouchTap() {
  alert('onClick triggered on the title component');
}
function logMsg(message) {
    console.log(message);
  }



class NavLinks extends Component {
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
        <ToolbarGroup>
          {/* <ToolbarSeparator /> */}
          <FlatButton label="Home" containerElement={<Link to="/web"/>} disableTouchRipple={true} 
            hoverColor="rgb(0, 188, 212)" className={styles.topbarbuttons}
            icon={<ActionHome color="white"/>}
            />
          <FlatButton label="Vault" containerElement={<Link to="/vault" />} disableTouchRipple={true} 
            hoverColor="rgb(0, 188, 212)" className={styles.topbarbuttons}
            icon={<ActionLightBulb color="white"/>}
            />
          <FlatButton label="Drago" containerElement={<Link to="/drago" />} disableTouchRipple={true} 
            hoverColor="rgb(0, 188, 212)" className={styles.topbarbuttons}
            icon={<ActionShowChart color="white"/>}
            />
          <FlatButton label="Exchange" containerElement={<Link to="/exchange" />} disableTouchRipple={true} 
            hoverColor="rgb(0, 188, 212)" className={styles.topbarbuttons}
            icon={<ActionPolymer color="white"/>}
            />
        </ToolbarGroup>
      )
    }
  }


// Router and material-ui tabs: https://stackoverflow.com/questions/41638688/material-uis-tabs-integration-with-react-router-4
class ApplicationTopBar extends Component {
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

    handleChange = (event, index, value) => this.setState({value});

    componentWillMount () {
    // match and location are passed by the Router
    // match contains the url parameters
      const { location } = this.props
      // const { match } = this.props
      var lastElementPath = "/" + location.pathname.split( '/' ).pop();
      this.setState({value: lastElementPath})
      // console.log(match);
      // console.log(location);
      // console.log(lastElementPath);
    }

    
    render() {
      const { location } = this.props
      return (
        <AppBar
          title="RigoBlock"
          showMenuIconButton={false}
          iconElementRight={<NavLinks location={location}/>}
        />  
      )
    }
  }

export default withRouter(ApplicationTopBar)