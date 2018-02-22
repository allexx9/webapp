import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { Route, withRouter } from 'react-router-dom'
import PageDashboardVaultManager from './pageDashboardVaultManager'
// import PageFundsDragoTrader from './pageFundsDragoTrader'
import PageVaultDetailsVaultManager from './pageVaultDetailsVaultManager'

import {
  Switch,
  Redirect
} from 'react-router-dom'

class applicationVaultManager extends Component {

    static propTypes = {
      location: PropTypes.object.isRequired,
      ethBalance: PropTypes.object.isRequired,
      accounts: PropTypes.array.isRequired,
      match: PropTypes.object.isRequired,
      isManager: PropTypes.bool.isRequired
    };

    

    render() {
      const { ethBalance, accounts, match, isManager } = this.props;
      return (
        <Switch>
          <Route path={match.path + "/dashboard"}
            render={(props) => <PageDashboardVaultManager {...props}
              accounts={accounts}
              ethBalance={ethBalance}
            />
            }
          />
          <Route path={match.path + "/pools/:dragoid/:dragocode"}
            render={(props) => <PageVaultDetailsVaultManager {...props}
              accounts={accounts}
              ethBalance={ethBalance}
              isManager={isManager}
            />
            }
          />
          <Redirect from={match.path} to={match.path + "/dashboard"} />
        </Switch>
      );
    }
  }

  export default withRouter(applicationVaultManager)