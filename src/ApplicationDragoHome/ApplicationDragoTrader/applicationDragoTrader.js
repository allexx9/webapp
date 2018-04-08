import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { Route, withRouter, Switch, Redirect } from 'react-router-dom'
import PageDashboardDragoTrader from './pageDashboardDragoTrader'
import PageFundsDragoTrader from './pageFundsDragoTrader'
import PageFundDetailsDragoTrader from './pageFundDetailsDragoTrader'


class applicationDragoTrader extends Component {

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
          <Route exact path={match.path+"/dashboard"} 
              render={(props) => <PageDashboardDragoTrader {...props}               
                accounts={accounts}
                 />
              } 
          />
          <Route exact path={match.path+"/pools"}
            render={(props) => <PageFundsDragoTrader {...props}               
            accounts={accounts}
            />
          } 
          />
          <Route exact path={match.path+"/pools/:dragoid/:dragocode"}
            render={(props) => <PageFundDetailsDragoTrader {...props}               
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

  export default withRouter(applicationDragoTrader)