import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { Link, Route, withRouter } from 'react-router-dom'
import FlatButton from 'material-ui/FlatButton';
import ActionLightBulb from 'material-ui/svg-icons/action/lightbulb-outline';
import ActionHome from 'material-ui/svg-icons/action/home';
import ActionPolymer from 'material-ui/svg-icons/action/polymer';
import ActionShowChart from 'material-ui/svg-icons/editor/show-chart';
import FontIcon from 'material-ui/FontIcon';
import MenuItem from 'material-ui/MenuItem';
import MoreVertIcon from 'material-ui/svg-icons/navigation/more-vert';
import AccountIcon from 'material-ui/svg-icons/action/account-circle';
import DropDownMenu from 'material-ui/DropDownMenu';
import {Toolbar, ToolbarGroup, ToolbarSeparator, ToolbarTitle} from 'material-ui/Toolbar';
import IconMenu from 'material-ui/IconMenu';
import IconButton from 'material-ui/IconButton';

import getMuiTheme from 'material-ui/styles/getMuiTheme';
import lightBaseTheme from 'material-ui/styles/baseThemes/lightBaseTheme';

import styles from './elements.module.css';

var menuStyles = {
    dropDown: {
        color: "#ffffff"
    },
    separator: {
        backgroundColor: "#ffffff",
        opacity: 0.5
    },
    profileIcon: {
        color: "#ffffff"
    },
};

var disabledUserType = {
  dropDown: {
  }
}

var enabledUserType = {
  dropDown: {
    color: "#ffffff"
  }
}


class NavLinks extends Component {

    constructor(props) {
        super(props);
      }


    static PropTypes = {
        location: PropTypes.object.isRequired,
        handleTopBarSelectAccountType: PropTypes.object.isRequired,
        isManager: PropTypes.bool.isRequired
      };

    componentWillMount () {
    }

    render() {
      var { location, handleTopBarSelectAccountType, isManager } = this.props
      let userTypeDisabled = false;

      // Disabling user type if isManager not defined
      if (typeof isManager === 'undefined') {
        isManager = false;
        userTypeDisabled = true;
        menuStyles = {...menuStyles, ...disabledUserType};
      } else {
        menuStyles = {...menuStyles, ...enabledUserType};
      }

      return (
          <ToolbarGroup>
              <ToolbarGroup>
                  <FlatButton label="Home" containerElement={<Link to="/web"/>} disableTouchRipple={true} 
                      hoverColor="#2196f3" className={styles.topbarbuttons}
                      icon={<ActionHome color="white"/>}
                      />
                  <FlatButton label="Vault" containerElement={<Link to="/vault" />} disableTouchRipple={true} 
                      hoverColor="#2196f3" className={styles.topbarbuttons}
                      icon={<ActionLightBulb color="white"/>}
                      />
                  <FlatButton label="Drago" containerElement={<Link to="/drago" />} disableTouchRipple={true} 
                      hoverColor="#2196f3" className={styles.topbarbuttons}
                      icon={<ActionShowChart color="white"/>}
                      />
                  <FlatButton label="Exchange" containerElement={<Link to="/exchange" />} disableTouchRipple={true} 
                      hoverColor="#2196f3" className={styles.topbarbuttons}
                      icon={<ActionPolymer color="white"/>}
                      />
              </ToolbarGroup>
              <ToolbarSeparator style={menuStyles.separator}/>
              <ToolbarGroup>
                  <DropDownMenu value={isManager} onChange={handleTopBarSelectAccountType}
                  labelStyle={menuStyles.dropDown} disabled={userTypeDisabled}>
                      <MenuItem value={false} primaryText="Trader"  />
                      <MenuItem value={true} primaryText="Manager" />
                  </DropDownMenu>
                  <IconMenu
                  iconButtonElement={<IconButton><AccountIcon /></IconButton>}
                  onChange={this.handleSelectProfile}
                  iconStyle={menuStyles.profileIcon}
                  >
                      <MenuItem value="1" primaryText="Profile" />
                      <MenuItem value="2" primaryText="Accounts" />
                      <MenuItem value="3" primaryText="Help" />
                  </IconMenu>
              </ToolbarGroup>
          </ToolbarGroup>
      )
    }
  }

  export default withRouter(NavLinks)