import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { Route, withRouter, Switch, Redirect } from 'react-router-dom'
import PageDashboardVaultTrader from './pageDashboardVaultTrader'
import PageVaultsVaultTrader from './pageVaultsVaultTrader'
import PageVaultDetailsVaultTrader from './pageVaultDetailsVaultTrader'

class ApplicationVaultTrader extends Component {

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
          <Route path={match.path + "/dashboard"}
            render={(props) => <PageDashboardVaultTrader {...props}
              accounts={accounts} />
            }
          />
          <Route exact path={match.path+"/pools"}
            render={(props) => <PageVaultsVaultTrader {...props}               
            accounts={accounts}
            />
          } 
          />
          <Route path={match.path+"/pools/:dragoid/:dragocode"}
            render={(props) => <PageVaultDetailsVaultTrader {...props}               
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

  export default withRouter(ApplicationVaultTrader)