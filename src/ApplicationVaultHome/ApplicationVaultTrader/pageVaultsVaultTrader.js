import { Col, Row } from 'react-flexbox-grid'
import { Toolbar, ToolbarGroup } from 'material-ui/Toolbar'
import { connect } from 'react-redux'
import { withRouter } from 'react-router-dom'
import ActionShowChart from 'material-ui/svg-icons/editor/show-chart'
import Avatar from 'material-ui/Avatar'
import BigNumber from 'bignumber.js'
import ElementListVaults from '../Elements/elementListVaults'
import ElementListWrapper from '../../Elements/elementListWrapper'
import FilterVaults from '../Elements/elementFilterVaults'
import Paper from 'material-ui/Paper'
import PoolApi from '../../PoolsApi/src'
import PropTypes from 'prop-types'
import React, { Component } from 'react'
import utils from '../../_utils/utils'

import styles from './pageVaultsVaultTrader.module.css'

function mapStateToProps(state) {
  return state
}

class PageFundsVaultTrader extends Component {
  constructor() {
    super()
    this.filterList = this.filterList.bind(this)
  }

  static contextTypes = {
    api: PropTypes.object.isRequired
  }

  static propTypes = {
    location: PropTypes.object.isRequired,
    endpoint: PropTypes.object.isRequired,
    accounts: PropTypes.array.isRequired
  }

  state = {
    vaultCreatedLogs: [],
    vaultFilteredList: []
  }

  scrollPosition = 0

  componentDidMount() {
    this.getVaults()
  }

  UNSAFE_componentWillReceiveProps(nextProps) {
    // Updating the lists on each new block if the accounts balances have changed
    // Doing this this to improve performances by avoiding useless re-rendering

    const currentBalance = new BigNumber(this.props.endpoint.ethBalance)
    const nextBalance = new BigNumber(nextProps.endpoint.ethBalance)
    if (!currentBalance.eq(nextBalance)) {
      this.getVaults()
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
      vaultFilteredList: filteredList
    })
  }

  render() {
    let { location } = this.props
    const { vaultCreatedLogs, vaultFilteredList } = this.state
    // const vaultSearchList = Immutable.List(vaultCreatedLogs)
    // const vaultList = Immutable.List(vaultFilteredList)
    console.log(vaultCreatedLogs)
    console.log(vaultFilteredList)
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
                    <p>Vaults</p>
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
                    list={vaultCreatedLogs}
                    filterList={this.filterList}
                    poolType="vault"
                  >
                    <FilterVaults />
                  </ElementListWrapper>
                </Paper>
                <p />
              </Col>
            </Row>
            <Row className={styles.transactionsStyle}>
              <Col xs>
                <ElementListWrapper
                  list={vaultFilteredList}
                  location={location}
                  poolType="vault"
                >
                  <ElementListVaults />
                </ElementListWrapper>
              </Col>
            </Row>
          </Paper>
        </Col>
      </Row>
    )
  }

  getVaults() {
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
    poolApi.contract.vaulteventful.init().then(() => {
      poolApi.contract.vaulteventful
        .getAllLogs({
          topics: [poolApi.contract.vaulteventful.hexSignature.VaultCreated]
        })
        .then(vaultCreatedLogs => {
          const logs = vaultCreatedLogs.map(logToEvent)
          this.setState({
            vaultCreatedLogs: logs,
            vaultFilteredList: logs
          })
        })
    })
  }
}
export default withRouter(connect(mapStateToProps)(PageFundsVaultTrader))
