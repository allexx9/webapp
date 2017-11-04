import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { Link, Route, withRouter } from 'react-router-dom'
import FlatButton from 'material-ui/FlatButton';
import FontIcon from 'material-ui/FontIcon';
import MenuItem from 'material-ui/MenuItem';
import MoreVertIcon from 'material-ui/svg-icons/navigation/more-vert';
import AccountIcon from 'material-ui/svg-icons/action/account-circle';
import DropDownMenu from 'material-ui/DropDownMenu';
import {Toolbar, ToolbarGroup, ToolbarSeparator, ToolbarTitle} from 'material-ui/Toolbar';
import IconMenu from 'material-ui/IconMenu';
import IconButton from 'material-ui/IconButton';
import { Grid, Row, Col } from 'react-flexbox-grid';
import Avatar from 'material-ui/Avatar';
import {List, ListItem} from 'material-ui/List';
import { formatCoins, formatEth, formatHash } from '../../format';
import moment from 'moment';
import {Card, CardActions, CardHeader, CardMedia, CardTitle, CardText} from 'material-ui/Card';
import Paper from 'material-ui/Paper';
import IdentityIcon from '../../IdentityIcon';

import EventBuyDrago from '../../EventsDrago/EventBuyDrago';
import EventNewTranch from '../../EventsDrago/EventNewTranch';
import EventRefund from '../../EventsDrago/EventRefund';
import EventTransfer from '../../EventsDrago/EventTransfer';
import EventDragoCreated from '../../EventsDrago/EventDragoCreated';
import EventSellDrago from '../../EventsDrago/EventSellDrago';

import ElementLatestTransactions from './elementLatestTransactions'

import styles from '../applicationDragoHome.module.css';


class PageDashboardDragoTrader extends Component {

  // Checking the type of the context variable that we receive by the parent
  static contextTypes = {
    api: PropTypes.object.isRequired,
    muiTheme: PropTypes.object.isRequired
  };

  static PropTypes = {
      location: PropTypes.object.isRequired,
      blockNumber: PropTypes.object.isRequired,
      ethBalance: PropTypes.object.isRequired,
      accounts: PropTypes.object.isRequired,
      allEvents: PropTypes.object.isRequired,
      accountsInfo: PropTypes.object.isRequired, 
    };

    render() {
      const subTitle = (account) => {
        return (
          account.address+" "+account.source
        )     
      }

      const { location, accounts, accountsInfo, allEvents } = this.props
      const listAccounts = accounts.map((account) => {
        const { api } = this.context;
        return (
          <Row key={account.address}>
            <Col xs={12}>
              <Card>
                <CardHeader
                  title={account.name}
                  subtitle={subTitle(account)}
                  avatar={<IdentityIcon address={ account.address } />}
                />
                <CardText>
                  ETH { account.ethBalance }
                </CardText>
              </Card>
            </Col>
          </Row>
        )
      }
      );
      return (
      <Row>
        <Col xs={12}>
          <Row>
            <Col xs={6}>
              <h1>Accounts</h1>
                {listAccounts}
            </Col>
            <Col xs={6}>
              <h1>Trade</h1>
              <Paper zDepth={1}>
                <Row>
                  <Col className={styles.transactionsStyle} xs={12}>
                        
                  </Col>
                </Row>
              </Paper>
            </Col>
          </Row>
          <Row>
            <Col xs={12}>
              <h1>Latest Transactions</h1>
                <Paper zDepth={1}>
                  <Row>
                    <Col className={styles.transactionsStyle} xs={12}>
                      <ElementLatestTransactions accountsInfo={accountsInfo} allEvents={allEvents} /> 
                    </Col>
                  </Row>
                </Paper>
                <p></p>
            </Col>
          </Row>
        </Col>
      </Row>
      )
    }
  }

  export default withRouter(PageDashboardDragoTrader)