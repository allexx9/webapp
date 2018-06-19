import { Link, withRouter } from 'react-router-dom'
import { Toolbar, ToolbarGroup } from 'material-ui/Toolbar'
import ActionAccountBalance from 'material-ui/svg-icons/action/account-balance'
import ActionHome from 'material-ui/svg-icons/action/home'
import ActionShowChart from 'material-ui/svg-icons/editor/show-chart'
import ActionPolymer from 'material-ui/svg-icons/action/polymer'
import FlatButton from 'material-ui/FlatButton'
import IconButton from 'material-ui/IconButton'
import IconMenu from 'material-ui/IconMenu'
import MenuItem from 'material-ui/MenuItem'
import PropTypes from 'prop-types'
import React, { Component } from 'react'
import { APP, DS } from '../_utils/const.js'
import { connect } from 'react-redux';
import styles from './elements.module.css'
import utils from '../_utils/utils'
import { Hidden, Visible } from 'react-grid-system'
import MoreVertIcon from 'material-ui/svg-icons/navigation/more-vert';

function mapStateToProps(state) {
  return state
}

class NavLinksLeft extends Component {

  constructor(props) {
    super(props);
  }

  static propTypes = {
    location: PropTypes.object.isRequired,
    dispatch: PropTypes.func.isRequired,
    match: PropTypes.object.isRequired,

  };

  shouldComponentUpdate(nextProps, nextState) {
    var stateUpdate = true
    var propsUpdate = true
    propsUpdate = !utils.shallowEqual(this.props, nextProps)
    stateUpdate = !utils.shallowEqual(this.state, nextState)
    if (stateUpdate || propsUpdate) {
      // console.log(`${sourceLogClass} -> shouldComponentUpdate: TRUE -> Proceedding with rendering.`);
    }
    return stateUpdate || propsUpdate
  }

  activeSectionPath = () => {
    const { match } = this.props
    var path = match.path.split('/')
    return path[3]
  }

  renderTopLinksLong = (links) => {
    const activeLink = this.activeSectionPath()
    var backgroundColorActive = '#054186'
    const { location } = this.props
    return links.map((link) => {
      link.to === activeLink ? backgroundColorActive = '#1968C0' : backgroundColorActive = '#054186'
      return (
        <FlatButton key={link.label} label={link.label.toUpperCase()} containerElement={<Link to={DS + APP + DS + this.buildUrlPath(location) + DS + link.to} />} disableTouchRipple={true}
          hoverColor={'#054186'} className={styles.topbarbuttons}
          icon={link.icon}
          labelStyle={{ fontWeight: 700 }}
          backgroundColor={backgroundColorActive}
        />
      )
    })
  }

  renderTopLinksShort = (links) => {
    const { location } = this.props
    const menuItems = links.map((link) => {
      return (
        // <FlatButton key={link.label} label={link.label.toUpperCase()} containerElement={<Link to={DS + APP + DS + this.buildUrlPath(location) + DS + link.to} />} disableTouchRipple={true}
        //   hoverColor={'#054186'} className={styles.topbarbuttons}
        //   icon={link.icon}
        //   labelStyle={{ fontWeight: 700 }}
        //   backgroundColor={backgroundColorActive}
        // />
        <MenuItem
          key={link.label}
          primaryText={link.label.toUpperCase()}
          leftIcon={link.icon}
          containerElement={<Link to={DS + APP + DS + this.buildUrlPath(location) + DS + link.to} />}
        />
      )
    }
    )
    return (
      <IconMenu
        iconButtonElement={<IconButton><MoreVertIcon /></IconButton>}
        onChange={this.handleChangeSingle}
        iconStyle={{ color: "white" }}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'left', }}
        desktop={true}
      >
        {menuItems}
      </IconMenu>
    )
  }

  buildUrlPath = (location) => {
    var path = location.pathname.split('/');
    // path.splice(-1,1);
    // var url = path.join('/');
    return path[2]
  }

  render() {
    const linksLong = [
      { label: 'home', to: 'home', icon: <ActionHome color="white" /> },
      { label: 'vault', to: 'vault', icon: <ActionAccountBalance color="white" /> },
      { label: 'drago', to: 'drago', icon: <ActionShowChart color="white" /> },
      { label: 'exchange', to: 'exchange', icon: <ActionPolymer color="white" /> }
    ]
    const linksShort = [
      { label: 'home', to: 'home', icon: <ActionHome color="#054186" /> },
      { label: 'vault', to: 'vault', icon: <ActionAccountBalance color="#054186" /> },
      { label: 'drago', to: 'drago', icon: <ActionShowChart color="#054186" /> },
      { label: 'exchange', to: 'exchange', icon: <ActionPolymer color="#054186" /> }
    ]

    return (
      <Toolbar style={{backgroundColor: '#054186', paddingLeft: '38px'}}>
        <ToolbarGroup >
          <Hidden xs sm md>
            <ToolbarGroup>
              {this.renderTopLinksLong(linksLong)}
            </ToolbarGroup>
          </Hidden>
          <Visible xs sm md>
            {this.renderTopLinksShort(linksShort)}
          </Visible>
          </ToolbarGroup>
      </Toolbar>
    )
  }
}

export default withRouter(connect(mapStateToProps)(NavLinksLeft))