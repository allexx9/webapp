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
import {Card, CardActions, CardHeader, CardMedia, CardTitle, CardText} from 'material-ui/Card';
import Paper from 'material-ui/Paper';
import IdentityIcon from '../../IdentityIcon';
import Chip from 'material-ui/Chip';


import ElementLatestTransactions from './elementLatestTransactions'
import ElementTradeBox from './elementTradeBox'
import ElementListTransactions from './elementListTransactions';

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

    subTitle = (account) => {
      return (
        account.address
      )     
    }

    render() {

      const { location, accounts, accountsInfo, allEvents } = this.props
      console.log(accounts);
      const listAccounts = accounts.map((account) => {
        const { api } = this.context;
        return (
          <Row key={account.address} between="xs">
            <Col xs={12}>
              <Card>
                <Row between="xs">
                  <Col xs >
                    <CardHeader
                      title={account.name}
                      subtitle={this.subTitle(account)}
                      subtitleStyle={{fontSize: 12}}
                      avatar={<IdentityIcon address={ account.address } />}
                    />
                    <CardText>
                      ETH { account.ethBalance }
                    </CardText>
                  </Col>
                    <Col xs >
                      <Chip className={styles.accountChip}>
                      <Avatar size={32}>W</Avatar>
                        {account.source}
                      </Chip>
                    </Col>
                </Row>
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
              <h2>Accounts</h2>
                {listAccounts}
                <h2>My Dragos</h2>
                <Paper zDepth={1}>
                <Row>
                  <Col className={styles.transactionsStyle} xs={12}>
                    {/* <ElementTradeBox
                      accounts={ accounts }
                      /> */}

                      <ElementListTransactions />

                  </Col>
                </Row>
              </Paper>
            </Col>
            <Col xs={6}>
              <h2>My Transactions</h2>

              <Paper zDepth={1}>
                  <Row>
                    <Col className={styles.transactionsStyle} xs={12}>
                      {/* <ElementLatestTransactions accountsInfo={accountsInfo} allEvents={allEvents} />  */}
                      
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