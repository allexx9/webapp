import { Redirect, Route, Switch, withRouter } from 'react-router-dom'
import PageDashboardVaultTrader from './pageDashboardVaultTrader'
import PageVaultDetailsVaultTrader from './pageVaultDetailsVaultTrader'
import PageVaultsVaultTrader from './pageVaultsVaultTrader'
import PropTypes from 'prop-types'
import React, { Component } from 'react'

class ApplicationVaultTrader extends Component {
  static propTypes = {
    location: PropTypes.object.isRequired,
    accounts: PropTypes.array.isRequired,
    match: PropTypes.object.isRequired
  }

  render() {
    const { accounts, match } = this.props
    return (
      <Switch>
        <Route
          path={match.path + '/dashboard'}
          render={props => (
            <PageDashboardVaultTrader {...props} accounts={accounts} />
          )}
        />
        <Route
          exact
          path={match.path + '/pools'}
          render={props => (
            <PageVaultsVaultTrader {...props} accounts={accounts} />
          )}
        />
        <Route
          path={match.path + '/pools/:dragoid/:dragocode'}
          render={props => (
            <PageVaultDetailsVaultTrader {...props} accounts={accounts} />
          )}
        />
        <Redirect from={match.path} to={match.path + '/dashboard'} />
      </Switch>
    )
  }
}

export default withRouter(ApplicationVaultTrader)
