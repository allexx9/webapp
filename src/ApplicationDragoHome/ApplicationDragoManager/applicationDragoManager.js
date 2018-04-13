import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { Route, withRouter } from 'react-router-dom'
import PageDashboardDragoManager from './pageDashboardDragoManager'
import PageFundDetailsDragoManager from './pageFundDetailsDragoManager'

import {
  Switch,
  Redirect
} from 'react-router-dom'

class applicationDragoManager extends Component {

    static propTypes = {
      location: PropTypes.object.isRequired,
      accounts: PropTypes.array.isRequired,
      match: PropTypes.object.isRequired,
      isManager: PropTypes.bool.isRequired
    };

    render() {
      const { accounts, match, isManager } = this.props;
      return (
        <Switch>
          <Route path={match.path+"/dashboard"} 
              render={(props) => <PageDashboardDragoManager {...props}               
                accounts={accounts}
                />
              } 
          />
          <Route path={match.path+"/pools/:dragoid/:dragocode"}
            render={(props) => <PageFundDetailsDragoManager {...props}               
            accounts={accounts}
            isManager={isManager}
            />
          } 
          />
          <Redirect from={match.path} to={match.path+"/dashboard"}  />
        </Switch>
      );
    }
  }

  export default withRouter(applicationDragoManager)