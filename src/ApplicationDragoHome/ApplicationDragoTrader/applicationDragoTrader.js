import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { Link, Route, withRouter, HashRouter } from 'react-router-dom'
import { Grid, Row, Col } from 'react-flexbox-grid';
import {APP, DS} from '../../utils/const.js'
import utils from '../../utils/utils.js'
import PageDashboardDragoTrader from './pageDashboardDragoTrader'
import PageFundsDragoTrader from './pageFundsDragoTrader'
import PageFundDetailsDragoTrader from './pageFundDetailsDragoTrader'

import {
  Switch,
  Redirect
} from 'react-router-dom'


import styles from '../applicationDragoHome.module.css';

class applicationDragoTrader extends Component {

    static PropTypes = {
      location: PropTypes.object.isRequired,
      blockNumber: PropTypes.object.isRequired,
      ethBalance: PropTypes.object.isRequired,
      accounts: PropTypes.object.isRequired,
      accountsInfo: PropTypes.object.isRequired,
      location: PropTypes.object.isRequired,
      match: PropTypes.object.isRequired,
    };


    render() {
      const { ethBalance, location, blockNumber, accounts, match, allEvents, accountsInfo } = this.props;
      return (
        <Switch>
          <Route path={match.path+"/dashboard"} 
              render={(props) => <PageDashboardDragoTrader {...props}               
                blockNumber={blockNumber}
                accounts={accounts}
                ethBalance={ethBalance}
                allEvents={allEvents}
                accountsInfo={accountsInfo} />
              } 
          />
          <Route exact path={match.path+"/pools"}
            render={(props) => <PageFundsDragoTrader {...props}               
            blockNumber={blockNumber}
            accounts={accounts}
            ethBalance={ethBalance} 
            allEvents={allEvents}
            accountsInfo={accountsInfo}
            />
          } 
          />
          <Route path={match.path+"/pools/:dragoid/:dragocode"}
            render={(props) => <PageFundDetailsDragoTrader {...props}               
            blockNumber={blockNumber}
            accounts={accounts}
            ethBalance={ethBalance} 
            allEvents={allEvents}
            accountsInfo={accountsInfo}
            />
          } 
          />
          <Redirect from={match.path} to={match.path+"/dashboard"}  />
        </Switch>
      );
    }
  }

  export default withRouter(applicationDragoTrader)