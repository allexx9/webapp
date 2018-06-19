import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { withRouter } from 'react-router-dom'
import AppBar from 'material-ui/AppBar';
import NavLinksRight from '../../Elements/topBarMenuLinksRight';
import NavLinksLeft from '../../Elements/topBarMenuLinksLeft';
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
        <span><img style={{ height: "32px", paddingTop: "8px" }} src='/img/new_logo_white.png' /></span>&nbsp;<span style={{ fontSize: "12px" }}>beta </span>
      </div>

    )
  }

  renderBurgerMenu = () => {
    return (
    <div>
      <input type="checkbox" id="menu-toggle" className={styles.menuToggle} />
      <label id="trigger" htmlFor="menu-toggle" className={styles.trigger}> <img style={{ height: "38px", marginLeft: "-5px", marginTop: "-5px"}} src='/img/rb-logo-final.png' /></label>
      <div className={styles.menu}>
        <div className={styles.burgerContainer}>
          <ul id="menu" className={styles.linkItem} >
            <li>
              <a href="https://www.rigoblock.com" target="_blank" rel="noopener noreferrer" >Home</a>
            </li>
            <li><a href="#">Help</a></li>

          </ul>
        </div>
      </div>
    </div>
    )
  }

  render() {
    const { location, handleTopBarSelectAccountType, handleToggleNotifications } = this.props
    return (
      <div>
        <div>
          {this.renderBurgerMenu()}
        </div>
        
        <AppBar
          title={<NavLinksLeft location={location} />}
          showMenuIconButton={false}
          iconElementLeft={<NavLinksLeft location={location} />}
          iconElementRight={<NavLinksRight handleToggleNotifications={handleToggleNotifications}
          location={location} handleTopBarSelectAccountType={handleTopBarSelectAccountType} />}
        />

      </div>
    )
  }
}

export default withRouter(ApplicationTopBar)