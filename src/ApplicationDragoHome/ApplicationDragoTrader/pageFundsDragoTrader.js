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

import styles from '../applicationDragoHome.module.css';


class PageFundsDragoTrader extends Component {


    static PropTypes = {
        location: PropTypes.object.isRequired,
        blockNumber: PropTypes.object.isRequired,
        ethBalance: PropTypes.object.isRequired,
        accounts: PropTypes.object.isRequired,
        accountsInfo: PropTypes.object.isRequired,
      };


    render() {
      var { location } = this.props
      console.log(this.props);

      return (
        <h1>Funds</h1>
      )
    }
  }

  export default withRouter(PageFundsDragoTrader)