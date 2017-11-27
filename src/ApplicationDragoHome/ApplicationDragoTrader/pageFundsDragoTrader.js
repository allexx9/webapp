import { Grid, Row, Col } from 'react-flexbox-grid';
import { Link, Route, withRouter } from 'react-router-dom'
import {Toolbar, ToolbarGroup, ToolbarSeparator, ToolbarTitle} from 'material-ui/Toolbar';
import AccountIcon from 'material-ui/svg-icons/action/account-circle';
import ActionAssessment from 'material-ui/svg-icons/action/assessment'
import ActionHome from 'material-ui/svg-icons/action/home';
import ActionLightBulb from 'material-ui/svg-icons/action/lightbulb-outline';
import ActionPolymer from 'material-ui/svg-icons/action/polymer'
import ActionShowChart from 'material-ui/svg-icons/editor/show-chart'
import Avatar from 'material-ui/Avatar';
import DropDownMenu from 'material-ui/DropDownMenu'
import FlatButton from 'material-ui/FlatButton'
import FontIcon from 'material-ui/FontIcon'
import IconButton from 'material-ui/IconButton'
import IconMenu from 'material-ui/IconMenu'
import Immutable from 'immutable'
import MenuItem from 'material-ui/MenuItem'
import MoreVertIcon from 'material-ui/svg-icons/navigation/more-vert';
import Paper from 'material-ui/Paper'
import PropTypes from 'prop-types';
import React, { Component } from 'react';
import ReactDOM from 'react-dom'


import { generateRandomList } from './Elements/utils';
import { toHex } from '../../format';
import * as abis from '../../contracts';
import ElementListFunds from './Elements/elementListFunds'
import FilterFunds from './Elements/elementFilterFunds'
import Loading from '../../Loading';
import SearchFunds from './Elements/elementSearchFunds'
import TableExample from './Elements/ElementTest'

import styles from './pageFundsDragoTrader.module.css'

// Getting events signatures
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

  constructor() {
    super()
    this.filterList = this.filterList.bind(this);
  }

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

    scrollPosition = 0

    componentDidMount () {
      this.getDragos();
    }

    // componentWillReceiveProps () {
    //   const element = ReactDOM.findDOMNode(this);
    //   if (element != null) {
    //     this.scrollPosition = window.scrollY
    //   }
    // }

    componentWillUpdate() {
    }

    filterList (filteredList) {
      const { dragoCreatedLogs } = this.state;
      console.log(filteredList)
      this.setState({
        dragoFilteredList: filteredList
      })
    }

    // componentDidUpdate () {
    //   const element = ReactDOM.findDOMNode(this);
    //   if (element != null) {
    //     window.scrollTo(0, this.scrollPosition)
    //   }
    // }

    render() {
      var { location, accountsInfo, allEvents } = this.props
      const { dragoCreatedLogs, dragoFilteredList } = this.state;
      const dragoSearchList = Immutable.List(dragoCreatedLogs)
      const dragoList = Immutable.List(dragoFilteredList)
      const detailsBox = {
        padding: 20,
      }

      // Waiting to render ElementListFunds component until DragoCreated events are retrieved
      // if (dragoList.size == 0) {
      //   return (
      //     null
      //   );
      // }

      return (
        <Row>
        <Col xs={12}>
          <Paper className={styles.paperContainer} zDepth={1}>
            <Toolbar className={styles.detailsToolbar}>
                <ToolbarGroup className={styles.detailsToolbarGroup}>
                  <Row className={styles.detailsToolbarGroup}>
                    <Col xs={12} md={1} className={styles.dragoTitle}>
                      <h2><Avatar size={50} icon={<ActionShowChart />} /></h2>
                    </Col>
                    <Col xs={12} md={11} className={styles.dragoTitle}>
                    <p>Dragos</p>
                    <small></small>
                    </Col>
                  </Row>
                </ToolbarGroup> 
                <ToolbarGroup>
                <p>&nbsp;</p>
                </ToolbarGroup>
            </Toolbar>
            <Row className={styles.transactionsStyle}>
              <Col xs>
                <Paper style={detailsBox} zDepth={1}>
                  <FilterFunds fundsList={dragoSearchList} filterList={this.filterList}></FilterFunds> 
                </Paper>
                <p></p>
              </Col>
            </Row>
            <Row className={styles.transactionsStyle}>
              <Col xs>
                <ElementListFunds accountsInfo={accountsInfo} list={dragoList}/>
              </Col>
            </Row>
          </Paper>
        </Col>
      </Row>
      )
    }

    getDragos () {
      const { api, contract } = this.context;
      const logToEvent = (log) => {
        const key = api.util.sha3(JSON.stringify(log))
        const { blockNumber, logIndex, transactionHash, transactionIndex, params, type } = log        
        return {
          type: log.event,
          state: type,
          blockNumber,
          logIndex,
          transactionHash,
          transactionIndex,
          params,
          key
        }
      }
  
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
          dragoCreatedLogs: logs,
          dragoFilteredList: logs
        })
      }
      )
    }
  }

  export default withRouter(PageFundsDragoTrader)