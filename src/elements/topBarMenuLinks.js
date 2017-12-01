import { Link, Route, withRouter } from 'react-router-dom'
import {Toolbar, ToolbarGroup, ToolbarSeparator, ToolbarTitle} from 'material-ui/Toolbar'
import AccountIcon from 'material-ui/svg-icons/action/account-circle'
import ActionHome from 'material-ui/svg-icons/action/home'
import ActionAccountBalance from 'material-ui/svg-icons/action/account-balance'
import ActionLightBulb from 'material-ui/svg-icons/action/lightbulb-outline'
import ActionPolymer from 'material-ui/svg-icons/action/polymer'
import ActionShowChart from 'material-ui/svg-icons/editor/show-chart'
import DropDownMenu from 'material-ui/DropDownMenu'
import FlatButton from 'material-ui/FlatButton'
import FontIcon from 'material-ui/FontIcon'
import getMuiTheme from 'material-ui/styles/getMuiTheme'
import IconButton from 'material-ui/IconButton'
import IconMenu from 'material-ui/IconMenu'
import lightBaseTheme from 'material-ui/styles/baseThemes/lightBaseTheme'
import MenuItem from 'material-ui/MenuItem'
import MoreVertIcon from 'material-ui/svg-icons/navigation/more-vert'
import PropTypes from 'prop-types'
import React, { Component } from 'react'
import  * as Colors from 'material-ui/styles/colors'

import {APP, DS} from '../utils/const.js'

import styles from './elements.module.css'

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

    componentDidMount () {
        this.activeSectionPath()
    }

    activeSectionPath = () => {
        const {location, match} = this.props
        var path = match.path.split( '/' )

        // path.splice(-1,1);
        // var url = path.join('/');
        console.log(path[3])
        console.log(match)
        return path[3]
        }

    renderTopLinks = (links) => {
      const activeLink = this.activeSectionPath()
      var backgroundColorActive = Colors.blue500
      return links.map((link) => {
        link.to === activeLink ? backgroundColorActive = Colors.blue300 : backgroundColorActive = Colors.blue500
        return (
          <FlatButton label={link.label.toUpperCase()} containerElement={<Link to={'/'+link.to} />} disableTouchRipple={true} 
          hoverColor="#2196f3" className={styles.topbarbuttons}
          icon={link.icon}
          labelStyle={{fontWeight: 700}}
          backgroundColor={backgroundColorActive}
          />
        )
      })
    }

    render() {
      var { location, handleTopBarSelectAccountType, isManager } = this.props
      let userTypeDisabled = false;
      const links = [
        {label: 'home', to: 'home', icon: <ActionHome color="white"/>},
        {label: 'vault', to: 'vault', icon: <ActionAccountBalance color="white"/>},
        {label: 'drago', to: 'drago', icon: <ActionShowChart color="white"/>},
        {label: 'exchange', to: 'exchange', icon: <ActionPolymer color="white"/>}
         ]

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
                {this.renderTopLinks(links)}
              </ToolbarGroup>
              <ToolbarSeparator style={menuStyles.separator}/>
              <ToolbarGroup>
                  <DropDownMenu value={isManager} onChange={handleTopBarSelectAccountType}
                  labelStyle={menuStyles.dropDown} disabled={userTypeDisabled}>
                      <MenuItem value={false} primaryText="Holder"  />
                      <MenuItem value={true} primaryText="Wizard" />
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