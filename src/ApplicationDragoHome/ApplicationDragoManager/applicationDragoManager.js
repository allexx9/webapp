import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { Link, Route, withRouter, HashRouter } from 'react-router-dom'
import { Grid, Row, Col } from 'react-flexbox-grid';
import {APP, DS} from '../../utils/const.js'
import utils from '../../utils/utils.js'
import PageDashboardDragoManager from './pageDashboardDragoManager'
// import PageFundsDragoTrader from './pageFundsDragoTrader'
// import PageFundDetailsDragoTrader from './pageFundDetailsDragoTrader'

import {
  Switch,
  Redirect
} from 'react-router-dom'


import styles from '../applicationDragoHome.module.css';

class applicationDragoManager extends Component {

    static propTypes = {
      location: PropTypes.object.isRequired,
      ethBalance: PropTypes.object.isRequired,
      accounts: PropTypes.array.isRequired,
      accountsInfo: PropTypes.object.isRequired,
      match: PropTypes.object.isRequired,
    };


    render() {
      const { ethBalance, location, blockNumber, accounts, match, allEvents, accountsInfo } = this.props;
      return (
        <Switch>
          <Route path={match.path+"/dashboard"} 
              render={(props) => <PageDashboardDragoManager {...props}               
                blockNumber={blockNumber}
                accounts={accounts}
                ethBalance={ethBalance}
                allEvents={allEvents}
                accountsInfo={accountsInfo} />
              } 
          />
          {/* <Route exact path={match.path+"/pools"}
            render={(props) => <PageFundsDragoTrader {...props}               
            // blockNumber={blockNumber}
            // accounts={accounts}
            // ethBalance={ethBalance} 
            // allEvents={allEvents}
            // accountsInfo={accountsInfo}
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
          /> */}
          <Redirect from={match.path} to={match.path+"/dashboard"}  />
        </Switch>
      );
    }
  }

  export default withRouter(applicationDragoManager)