import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { withRouter } from 'react-router-dom'
import AppBar from 'material-ui/AppBar';
import NavLinks from '../../Elements/topBarMenuLinks';

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

    render() {
      const { location, handleTopBarSelectAccountType, handleToggleNotifications } = this.props
      return (
        <AppBar
          title="RigoBlock"
          showMenuIconButton={false}
          iconElementRight={<NavLinks handleToggleNotifications={handleToggleNotifications}
          location={location} handleTopBarSelectAccountType={ handleTopBarSelectAccountType }/>}
        />  
      )
    }
  }

export default withRouter(ApplicationTopBar)