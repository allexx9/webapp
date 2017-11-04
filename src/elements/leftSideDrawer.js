import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { Link, Route, withRouter } from 'react-router-dom';
import {APP, DS} from '../utils/const.js'

import styles from './elements.module.css';

import Drawer from 'material-ui/Drawer';
import MenuItem from 'material-ui/MenuItem';
import Menu from 'material-ui/Menu';

import Divider from 'material-ui/Divider';
import ArrowDropRight from 'material-ui/svg-icons/navigation-arrow-drop-right';
import ActionHome from 'material-ui/svg-icons/action/home';
import ActionAssessment from 'material-ui/svg-icons/action/assessment';
import ActionShowChart from 'material-ui/svg-icons/editor/show-chart'
import { Visible, Hidden } from 'react-grid-system'

var drawerStyle = {
  container: {
      width: "100% !important"
  },
  menu: {
    width: "200px !important"
}
};

class LeftSideDrawer extends Component {

  constructor(props) {
    super(props);
  }




  static PropTypes = {
      location: PropTypes.object.isRequired,
    };



  componentWillMount () {
  }


 buildUrlPath = (location) => {
  var path = location.pathname.split( '/' );
  // path.splice(-1,1);
  // var url = path.join('/');
  return path[2]
  }


  render() {
    var { location} = this.props
    return (

      <Drawer open={true}
      containerClassName={styles.containerleftDrawer} className={styles.leftDrawer}>
      <Hidden xs sm>
        <Menu>
          <MenuItem primaryText="Dashboard" leftIcon={<ActionAssessment />} 
            containerElement={<Link to={DS+APP+DS+this.buildUrlPath(location)+DS+"drago"+DS+"dashboard"} />}/>
          <MenuItem primaryText="Funds" leftIcon={<ActionShowChart />} 
            containerElement={<Link to={DS+APP+DS+this.buildUrlPath(location)+DS+"drago"+DS+"funds"} />}/>
        </Menu>
      </Hidden>
      </Drawer>


    )
  }
}

export default withRouter(LeftSideDrawer)