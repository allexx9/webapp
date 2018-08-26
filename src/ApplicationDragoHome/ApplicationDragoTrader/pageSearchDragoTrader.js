import { Col, Row } from 'react-flexbox-grid'
import { Toolbar, ToolbarGroup } from 'material-ui/Toolbar'
import { connect } from 'react-redux'
import { withRouter } from 'react-router-dom'
import ActionShowChart from 'material-ui/svg-icons/editor/show-chart'
import Avatar from 'material-ui/Avatar'
import BigNumber from 'bignumber.js'
import ElementListFunds from '../Elements/elementListFunds'
import ElementListWrapper from '../../Elements/elementListWrapper'
import FilterFunds from '../Elements/elementFilterFunds'
import Paper from 'material-ui/Paper'
import PoolApi from '../../PoolsApi/src'
import PropTypes from 'prop-types'
import React, { Component } from 'react'
import utils from '../../_utils/utils'

import styles from './pageSearchDragoTrader.module.css'

function mapStateToProps(state) {
  return state
}

class PageFundsDragoTrader extends Component {
  constructor() {
    super()
    this.filterList = this.filterList.bind(this)
  }

  static contextTypes = {
    api: PropTypes.object.isRequired
  }

  static propTypes = {
    location: PropTypes.object.isRequired,
    endpoint: PropTypes.object.isRequired
  }

  state = {
    dragoCreatedLogs: [],
    dragoFilteredList: []
  }

  scrollPosition = 0

  componentDidMount() {
    this.getDragos()
  }

  UNSAFE_componentWillReceiveProps(nextProps) {
    // Updating the lists on each new block if the accounts balances have changed
    // Doing this this to improve performances by avoiding useless re-rendering

    const currentBalance = new BigNumber(this.props.endpoint.ethBalance)
    const nextBalance = new BigNumber(nextProps.endpoint.ethBalance)
    if (!currentBalance.eq(nextBalance)) {
      this.getDragos()
      console.log(
        `${
          this.constructor.name
        } -> UNSAFE_componentWillReceiveProps -> Accounts have changed.`
      )
    } else {
      null
    }
  }

  shouldComponentUpdate(nextProps, nextState) {
    let stateUpdate = true
    let propsUpdate = true
    const currentBalance = new BigNumber(this.props.endpoint.ethBalance)
    const nextBalance = new BigNumber(nextProps.endpoint.ethBalance)
    stateUpdate = !utils.shallowEqual(this.state, nextState)
    propsUpdate = !currentBalance.eq(nextBalance)
    if (stateUpdate || propsUpdate) {
      console.log(
        `${
          this.constructor.name
        } -> shouldComponentUpdate -> Proceedding with rendering.`
      )
    }
    return stateUpdate || propsUpdate
  }

  componentDidUpdate() {}

  filterList(filteredList) {
    this.setState({
      dragoFilteredList: filteredList
    })
  }

  render() {
    let { location } = this.props
    const { dragoCreatedLogs, dragoFilteredList } = this.state
    // const dragoSearchList = Immutable.List(dragoCreatedLogs)
    // const dragoList = dragoFilteredList
    console.log(dragoCreatedLogs)
    console.log(dragoFilteredList)
    // console.log(dragoSearchList)
    const detailsBox = {
      padding: 20
    }

    return (
      <Row>
        <Col xs={12}>
          <Paper className={styles.paperContainer} zDepth={1}>
            <Toolbar className={styles.detailsToolbar}>
              <ToolbarGroup className={styles.detailsToolbarGroup}>
                <Row className={styles.detailsToolbarGroup}>
                  <Col xs={12} md={1} className={styles.dragoTitle}>
                    <h2>
                      <Avatar size={50} icon={<ActionShowChart />} />
                    </h2>
                  </Col>
                  <Col xs={12} md={11} className={styles.dragoTitle}>
                    <p>Funds</p>
                    <small />
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
                  <ElementListWrapper
                    list={dragoCreatedLogs}
                    filterList={this.filterList}
                  >
                    <FilterFunds />
                  </ElementListWrapper>
                </Paper>
                <p />
              </Col>
            </Row>
            <Row className={styles.transactionsStyle}>
              <Col xs>
                <ElementListWrapper
                  list={dragoFilteredList}
                  location={location}
                >
                  <ElementListFunds />
                </ElementListWrapper>
              </Col>
            </Row>
          </Paper>
        </Col>
      </Row>
    )
  }

  getDragos() {
    const { api } = this.context
    const poolApi = new PoolApi(api)
    const logToEvent = log => {
      const key = api.util.sha3(JSON.stringify(log))
      const {
        blockNumber,
        logIndex,
        transactionHash,
        transactionIndex,
        params,
        type
      } = log
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
    poolApi.contract.dragoeventful.init().then(() => {
      poolApi.contract.dragoeventful
        .getAllLogs({
          topics: [poolApi.contract.dragoeventful.hexSignature.DragoCreated]
        })
        .then(dragoCreatedLogs => {
          console.log(dragoCreatedLogs)
          const logs = dragoCreatedLogs.map(logToEvent)
          this.setState({
            dragoCreatedLogs: logs,
            dragoFilteredList: logs
          })
        })
    })
  }
}

export default withRouter(connect(mapStateToProps)(PageFundsDragoTrader))
