import Immutable from 'immutable';
import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { Link, Route, withRouter } from 'react-router-dom'
import FlatButton from 'material-ui/FlatButton';
import ActionLightBulb from 'material-ui/svg-icons/action/lightbulb-outline';
import ActionHome from 'material-ui/svg-icons/action/home';
import ActionPolymer from 'material-ui/svg-icons/action/polymer';
import ActionShowChart from 'material-ui/svg-icons/editor/show-chart';
import FontIcon from 'material-ui/FontIcon';
import MenuItem from 'material-ui/MenuItem';
import MoreVertIcon from 'material-ui/svg-icons/navigation/more-vert';
import AccountIcon from 'material-ui/svg-icons/action/account-circle';
import DropDownMenu from 'material-ui/DropDownMenu';
import {Toolbar, ToolbarGroup, ToolbarSeparator, ToolbarTitle} from 'material-ui/Toolbar';
import IconMenu from 'material-ui/IconMenu';
import IconButton from 'material-ui/IconButton';
import ElementListFunds from './Elements/elementListFunds'
import { Grid, Row, Col } from 'react-flexbox-grid';
import Loading from '../../Loading';

import * as abis from '../../contracts';
import { toHex } from '../../format';

import { generateRandomList } from './Elements/utils';

import styles from '../applicationDragoHome.module.css';


const dragoFactoryEventsSignatures = (contract) => {
  const events = contract._events.reduce((events, event) => {
    events[event._name] = {
      hexSignature: toHex(event._signature)
    }
    return events
  }, {})
  return events
}


class PageFundsDragoTrader extends Component {

  static contextTypes = {
    api: PropTypes.object.isRequired,
    contract: PropTypes.object.isRequired
  };
  
  static PropTypes = {
    location: PropTypes.object.isRequired,
    blockNumber: PropTypes.object.isRequired,
    ethBalance: PropTypes.object.isRequired,
    accounts: PropTypes.object.isRequired,
    allEvents: PropTypes.object.isRequired,
    accountsInfo: PropTypes.object.isRequired, 
  };

    state = {
      dragoCreatedLogs: [],
    }

    componentDidMount () {
      this.getDragos();
    }

    render() {
      var { location, accountsInfo, allEvents } = this.props
      const { dragoCreatedLogs } = this.state;
      const dragoCreatedEvents = Immutable.List(dragoCreatedLogs)

      // Waiting to render ElementListFunds component until DragoCreated events are retrieved
      if (dragoCreatedEvents.size == 0) {
        return (
          <Loading />
        );
      }

      return (
        <div>        
          <h1>Funds</h1>
          <Grid fluid>
            <ElementListFunds accountsInfo={accountsInfo} allEvents={allEvents} list={dragoCreatedEvents}/>
          </Grid>
        </div>

      )
    }

    getDragos () {
      const { api, contract } = this.context;
      const logToEvent = (log) => {
        const key = api.util.sha3(JSON.stringify(log));
        const { blockNumber, logIndex, transactionHash, transactionIndex, params, type } = log;
        return {
          type: log.event,
          state: type,
          blockNumber,
          logIndex,
          transactionHash,
          transactionIndex,
          params,
          key
        };
      };
  
      // const options = {
      //   fromBlock: 0,
      //   toBlock: 'pending',
      //   limit: 50
      // };
      
      // Getting all DragoCreated events since block 0.
      // dragoFactoryEventsSignatures accesses the contract ABI, gets all the events and for each creates a hex signature
      // to be passed to getAllLogs. Events are indexed and filtered by topics
      // more at: http://solidity.readthedocs.io/en/develop/contracts.html?highlight=event#events
      contract
      .getAllLogs({
        topics: [ dragoFactoryEventsSignatures(contract).DragoCreated.hexSignature ]
      })
      .then((dragoCreatedLogs) => {
        const logs = dragoCreatedLogs.map(logToEvent)
        this.setState({
          dragoCreatedLogs: logs
        })
      }
      )
    }
  }

  export default withRouter(PageFundsDragoTrader)