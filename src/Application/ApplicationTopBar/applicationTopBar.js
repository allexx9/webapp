import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { withRouter } from 'react-router-dom'
import AppBar from 'material-ui/AppBar';
import NavLinks from '../../Elements/topBarMenuLinks';
import styles from './applicationTopBar.module.css';

class ApplicationTopBar extends Component {
  constructor(props) {
    super(props)

  }

  static propTypes = {
    location: PropTypes.object.isRequired,
    handleTopBarSelectAccountType: PropTypes.func,
    handleToggleNotifications: PropTypes.func.isRequired,
  };

  state = {

  }

  renderTitle = () => {
    return (
      <div>
        {/* <span>RigoBlock</span>&nbsp;<span style={{fontSize: "12px"}}>beta <img style={{height: "20px", width: "20px"}} src='/img/new_logo_white.png'/></span> */}
        <span><img style={{ height: "32px", paddingTop: "8px" }} src='/img/new_logo_white.png' /></span>&nbsp;<span style={{ fontSize: "12px" }}>beta </span>
        {/* <img style={{height: "100px", width: "100px"}} src='/img/new_logo_white.png'/> */}
      </div>

    )
  }

  renderBurgerMenu = () => {
    <div>
      <input type="checkbox" id="menu-toggle" className={styles.menuToggle} />
      <label id="trigger" htmlFor="menu-toggle" className={styles.trigger}></label>
      <label id="burger" htmlFor="menu-toggle" className={styles.burger}></label>
      <ul id="menu" className={styles.menu}>
        <li><a href="#">Home</a></li>
        <li><a href="#">About</a></li>
        <li><a href="#">Portfolio</a></li>
        <li><a href="#">Contact</a></li>
      </ul>
    </div>
  }

  render() {
    const { location, handleTopBarSelectAccountType, handleToggleNotifications } = this.props
    console.log(styles)
    return (
      <div>
        <AppBar
          title={this.renderTitle()}
          showMenuIconButton={false}
          iconElementRight={<NavLinks handleToggleNotifications={handleToggleNotifications}
            location={location} handleTopBarSelectAccountType={handleTopBarSelectAccountType} />}
        />

      </div>
    )
  }
}

export default withRouter(ApplicationTopBar)