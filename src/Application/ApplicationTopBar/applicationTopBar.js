import React, { Component } from 'react';
import PropTypes from 'prop-types';
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

import NavLinks from '../../elements/topBarMenuLinks';

import getMuiTheme from 'material-ui/styles/getMuiTheme';
import lightBaseTheme from 'material-ui/styles/baseThemes/lightBaseTheme';

import styles from '../application.module.css';

function handleTouchTap() {
  alert('onClick triggered on the title component');
}
function logMsg(message) {
    console.log(message);
  }


// Router and material-ui tabs: https://stackoverflow.com/questions/41638688/material-uis-tabs-integration-with-react-router-4
class ApplicationTopBar extends Component {
    constructor(props) {
      super(props)

    }

    static propTypes = {
      location: PropTypes.object.isRequired,
      handleTopBarSelectAccountType: PropTypes.func
    };

    state = {
        // value: this.props.location.pathname
        // value: "/vault"
    }
    
    render() {
      const { location, handleTopBarSelectAccountType, isManager } = this.props
      return (
        <AppBar
          title="RigoBlock"
          showMenuIconButton={false}
          iconElementRight={<NavLinks location={location} handleTopBarSelectAccountType={ handleTopBarSelectAccountType } isManager={isManager}/>}
        />  
      )
    }
  }

export default withRouter(ApplicationTopBar)