import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { Link, Route, withRouter } from 'react-router-dom'
import FontIcon from 'material-ui/FontIcon';
import MenuItem from 'material-ui/MenuItem';
import MoreVertIcon from 'material-ui/svg-icons/navigation/more-vert';
import AccountIcon from 'material-ui/svg-icons/action/account-circle';
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
import Divider from 'material-ui/Divider';
// import {
//   Table,
//   Row,
//   TableHeader,
//   TableHeaderColumn,
//   TableRow,
//   TableRowColumn,
// } from 'material-ui/Table';

import ElementEventTransactions from './elementEventTransactions';


import styles from '../applicationDragoHome.module.css';


class ElementLatestTransactions extends Component {

  // Checking the type of the context variable that we receive from the parent
  static contextTypes = {
    api: PropTypes.object.isRequired,
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

      var { location, accounts } = this.props
      return (

          <Row> 
            <Col xs={12}>{ this.renderEvents(['BuyDrago', 'SellDrago']) }</Col>
          </Row>


      )
    }

    renderEvents (eventType) {
      const { allEvents, accountsInfo } = this.props;

      if (!allEvents.length) {
        return null;
      }

      return allEvents
        .filter((event) => eventType.includes(event.type) )
        .map((event) => {
          const { drago, from, to, amount, revenue } = event.params;
          switch (event.type) {
            case 'BuyDrago':
            return <ElementEventTransactions key={ event.key }         
              event={ event }
              fromAddress={ from }
              dragoAddress={ drago }
              ethvalue={ amount }
              value={ revenue } 
              accountsInfo={accountsInfo}
              />
            case 'SellDrago':
            return <ElementEventTransactions key={ event.key }         
              event={ event }
              fromAddress={ from }
              dragoAddress={ drago }
              ethvalue={ amount }
              value={ revenue } 
              accountsInfo={accountsInfo}
              />
          }
        });
      }
  }

  export default withRouter(ElementLatestTransactions)