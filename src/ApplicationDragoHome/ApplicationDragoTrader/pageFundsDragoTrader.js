import { Row, Col } from 'react-flexbox-grid';
import { withRouter } from 'react-router-dom'
import {Toolbar, ToolbarGroup } from 'material-ui/Toolbar';
import ActionShowChart from 'material-ui/svg-icons/editor/show-chart'
import Avatar from 'material-ui/Avatar';
import Paper from 'material-ui/Paper'
import PropTypes from 'prop-types';
import React, { Component } from 'react';
import DragoApi from '../../DragoApi/src'
import ElementListFunds from '../Elements/elementListFunds'
import FilterFunds from '../Elements/elementFilterFunds'
import utils from '../../utils/utils'
import ElementListWrapper from '../../Elements/elementListWrapper'

import styles from './pageFundsDragoTrader.module.css'


class PageFundsDragoTrader extends Component {

  constructor() {
    super()
    this.filterList = this.filterList.bind(this);
  }

  static contextTypes = {
    api: PropTypes.object.isRequired,
  };
  
  static propTypes = {
    location: PropTypes.object.isRequired,
    ethBalance: PropTypes.object.isRequired,
    accounts: PropTypes.array.isRequired
  };

    state = {
      dragoCreatedLogs: [],
      dragoFilteredList: []
    }

    scrollPosition = 0

    componentDidMount () {
      this.getDragos();
    }

    componentWillReceiveProps(nextProps) {
      // Updating the lists on each new block if the accounts balances have changed
      // Doing this this to improve performances by avoiding useless re-rendering
      const sourceLogClass = this.constructor.name
      if (!this.props.ethBalance.eq(nextProps.ethBalance)) {
        this.getDragos()
        console.log(`${sourceLogClass} -> componentWillReceiveProps -> Accounts have changed.`);
      } else {
        null
      }
    }

    shouldComponentUpdate(nextProps, nextState){
      const  sourceLogClass = this.constructor.name
      var stateUpdate = true
      var propsUpdate = true
      stateUpdate = !utils.shallowEqual(this.state, nextState)
      propsUpdate = !this.props.ethBalance.eq(nextProps.ethBalance)
      if (stateUpdate || propsUpdate) {
        console.log(`${sourceLogClass} -> shouldComponentUpdate -> Proceedding with rendering.`);
      }
      return stateUpdate || propsUpdate
    }

    componentDidUpdate() {
    }

    filterList (filteredList) {
      this.setState({
        dragoFilteredList: filteredList
      })
    }

    render() {
      var { location} = this.props
      const { dragoCreatedLogs, dragoFilteredList } = this.state;
      // const dragoSearchList = Immutable.List(dragoCreatedLogs)
      // const dragoList = dragoFilteredList
      console.log(dragoCreatedLogs)
      console.log(dragoFilteredList)
      // console.log(dragoSearchList)
      const detailsBox = {
        padding: 20,
      }

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
                    <p>Funds</p>
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
                <ElementListWrapper list={dragoCreatedLogs} filterList={this.filterList}>
                  <FilterFunds/>
                </ElementListWrapper>
                </Paper>
                <p></p>
              </Col>
            </Row>
            <Row className={styles.transactionsStyle}>
              <Col xs>
                <ElementListWrapper list={dragoFilteredList} location={location}>
                  <ElementListFunds/>
                </ElementListWrapper>
              </Col>
            </Row>
          </Paper>
        </Col>
      </Row>
      )
    }

    getDragos () {
      const { api } = this.context;
      const dragoApi = new DragoApi(api)
      const logToEvent = (log) => {
        const key = api.util.sha3(JSON.stringify(log))
        const { blockNumber, logIndex, transactionHash, transactionIndex, params, type } = log        
        console.log(log)
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
      dragoApi.contract.dragoeventful.init()
      .then(() =>{
        dragoApi.contract.dragoeventful.getAllLogs({
          topics: [ dragoApi.contract.dragoeventful.hexSignature.DragoCreated ]
        })
        .then((dragoCreatedLogs) => {
          console.log(dragoCreatedLogs)
          const logs = dragoCreatedLogs.map(logToEvent)
          this.setState({
            dragoCreatedLogs: logs,
            dragoFilteredList: logs
          })
        }
        )
      })
    }
  }

  export default withRouter(PageFundsDragoTrader)

 