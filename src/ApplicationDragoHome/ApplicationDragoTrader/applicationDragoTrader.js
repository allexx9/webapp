import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { Route, withRouter, Switch, Redirect } from 'react-router-dom'
import PageDashboardDragoTrader from './pageDashboardDragoTrader'
import PageFundsDragoTrader from './pageFundsDragoTrader'
import PageFundDetailsDragoTrader from './pageFundDetailsDragoTrader'


class applicationDragoTrader extends Component {

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
          <Route path={match.path+"/dashboard"} 
              render={(props) => <PageDashboardDragoTrader {...props}               
                accounts={accounts}
                ethBalance={ethBalance} />
              } 
          />
          <Route exact path={match.path+"/funds"}
            render={(props) => <PageFundsDragoTrader {...props}               
            accounts={accounts}
            ethBalance={ethBalance} 
            />
          } 
          />
          <Route path={match.path+"/pools/:dragoid/:dragocode"}
            render={(props) => <PageFundDetailsDragoTrader {...props}               
            accounts={accounts}
            ethBalance={ethBalance} 
            isManager={isManager}
            />
          } 
          />
          <Redirect from={match.path} to={match.path+"/dashboard"}  />
        </Switch>
      );
    }
  }

  export default withRouter(applicationDragoTrader)