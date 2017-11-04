import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { Link, Route, withRouter, HashRouter } from 'react-router-dom'
import { Grid, Row, Col } from 'react-flexbox-grid';
import {APP, DS} from '../../utils/const.js'
import utils from '../../utils/utils.js'
import PageDashboardDragoTrader from './pageDashboardDragoTrader'
import PageFundsDragoTrader from './pageFundsDragoTrader'

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
    };


    render() {
      const { ethBalance, location, blockNumber, accounts, match, allEvents, accountsInfo } = this.props;
      // const section = utils.pathLast(location);
      // console.log(this.props)
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
          <Route path={match.path+"/funds"}
            render={(props) => <PageFundsDragoTrader {...props}               
            blockNumber={blockNumber}
            accounts={accounts}
            ethBalance={ethBalance} />
          } 
          />
        </Switch>
      );
    //   switch (section) {
    //   case 'dashboard':
    //   return (
    //     <Row>
    //       <Col xs={12}>
    //       <PageProfileDragoTrader 
    //         location={location}
    //         blockNumber={blockNumber}
    //         accounts={accounts}
    //         ethBalance={ethBalance}
    //       />
    //       </Col>
    //     </Row>
    //   );
    //   return (
    //     <Row>
    //       <Col xs={12}>
    //         <h1>Funds</h1>
    //       </Col>
    //     </Row>
    //   );
    //   /*case 'Transfer':
    //     return (
    //       <ActionTransfer
    //         accounts={ accounts }
    //         onClose={ this.onActionClose } />
    //     );*/
    //   default:
    //     return null;
    // }

      // return (
      //   <Row>
      //     <Col xs={12}>
      //       <h1></h1>
      //     </Col>
      //   </Row>
      // )
    }
  }

  export default withRouter(applicationDragoTrader)