import React, { Component } from 'react';
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

const stylesDropDown = {
    color: "white"
  };

const menuStyles = {
    dropDown: {
        color: "white"
    },
    separator: {
        backgroundColor: "white",
        opacity: 0.5
    },
};

class NavLinks extends Component {

    constructor(props) {
        super(props);
      }

    state = {
        // value: this.props.location.pathname
        accountType: 1
    }

    

    handleSelectAccountType = (event, index, value) => { 
        this.setState({
            accountType: value,
        }); 
    };

    handleSelectProfile = (event, value) => {
        this.setState({
          valueSingle: value,
        });
      };

    

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
            <ToolbarGroup>
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
            <ToolbarSeparator style={menuStyles.separator}/>
            <ToolbarGroup>
                <DropDownMenu value={this.state.accountType} onChange={this.handleSelectAccountType}
                labelStyle={menuStyles.dropDown}>
                    <MenuItem value={1} primaryText="Trader"  />
                    <MenuItem value={2} primaryText="Manager" />
                </DropDownMenu>
                <IconMenu
                iconButtonElement={<IconButton><AccountIcon /></IconButton>}
                onChange={this.handleSelectProfile}
                value={this.state.valueSingle}
                iconStyle={menuStyles.dropDown}
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