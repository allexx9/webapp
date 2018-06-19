import BigNumber from 'bignumber.js';
import { Row, Col, Grid } from 'react-flexbox-grid'
import { Link, withRouter } from 'react-router-dom'
import { CopyToClipboard } from 'react-copy-to-clipboard'
import { Tabs, Tab } from 'material-ui/Tabs'
import ActionAssessment from 'material-ui/svg-icons/action/assessment'
import ActionList from 'material-ui/svg-icons/action/list'
import ActionShowChart from 'material-ui/svg-icons/editor/show-chart'
import CopyContent from 'material-ui/svg-icons/content/content-copy'
import Paper from 'material-ui/Paper'
import PropTypes from 'prop-types';
import React, { Component } from 'react'
import scrollToComponent from 'react-scroll-to-component'
import Search from 'material-ui/svg-icons/action/search'
import Snackbar from 'material-ui/Snackbar'
import Sticky from 'react-stickynode'
import ElementListWrapper from '../../Elements/elementListWrapper'
import ElementAccountBox from '../../Elements/elementAccountBox'
import ElementListBalances from '../Elements/elementListBalances'
import ElementListTransactions from '../Elements/elementListTransactions'
import UserDashboardHeader from '../../_atomic/atoms/userDashboardHeader'
import utils from '../../_utils/utils'
import {
  UPDATE_TRANSACTIONS_DRAGO_HOLDER,
} from '../../_utils/const'
import { connect } from 'react-redux';
import SectionHeader from '../../_atomic/atoms/sectionHeader';
// import SectionTitle from '../../_atomic/atoms/sectionTitle';

import styles from './pageDashboardDragoTrader.module.css'

function mapStateToProps(state) {
  return state
}

class PageDashboardDragoTrader extends Component {

  // Checking the type of the context variable that we receive by the parent
  static contextTypes = {
    api: PropTypes.object.isRequired,
  };

  static propTypes = {
    location: PropTypes.object.isRequired,
    endpoint: PropTypes.object.isRequired,
    dispatch: PropTypes.func.isRequired,
    transactionsDrago: PropTypes.object.isRequired,
  };

  state = {
    loading: true,
    snackBar: false,
    snackBarMsg: ''
  }

  updateTransactionsDrago = (results) => {
    return {
      type: UPDATE_TRANSACTIONS_DRAGO_HOLDER,
      payload: results
    }
  };

  componentDidMount() {
    const { accounts } = this.props.endpoint
    console.log('componentDidMount')
    this.getTransactions(null, accounts)
  }

  componentWillReceiveProps(nextProps) {
    // Updating the lists on each new block if the accounts balances have changed
    // Doing this this to improve performances by avoiding useless re-rendering
    const { accounts } = this.props.endpoint
    const sourceLogClass = this.constructor.name
    console.log(`${sourceLogClass} -> componentWillReceiveProps-> nextProps received.`);
    // Updating the transaction list if there have been a change in total accounts balance and the previous balance is
    // different from 0 (balances are set to 0 on app loading)
    const currentBalance = new BigNumber(this.props.endpoint.ethBalance)
    const nextBalance = new BigNumber(nextProps.endpoint.ethBalance)
    if (!currentBalance.eq(nextBalance) && !currentBalance.eq(0)) {
      this.getTransactions(null, accounts)
      console.log(`${sourceLogClass} -> componentWillReceiveProps -> Accounts have changed.`);
    }
  }

  shouldComponentUpdate(nextProps, nextState) {
    const sourceLogClass = this.constructor.name
    var stateUpdate = true
    var propsUpdate = true
    propsUpdate = !utils.shallowEqual(this.props, nextProps)
    stateUpdate = !utils.shallowEqual(this.state, nextState)
    if (stateUpdate || propsUpdate) {
      console.log('State updated ', stateUpdate)
      console.log('Props updated ', propsUpdate)
      console.log(`${sourceLogClass} -> shouldComponentUpdate -> Proceedding with rendering.`);
    }
    return stateUpdate || propsUpdate
  }

  componentDidUpdate() {
  }

  snackBar = (msg) => {
    this.setState({
      snackBar: true,
      snackBarMsg: msg
    })
  }

  handlesnackBarRequestClose = () => {
    this.setState({
      snackBar: false,
      snackBarMsg: ''
    })
  }

  renderCopyButton = (text) => {
    if (!text) {
      return null;
    }

    return (
      <CopyToClipboard text={text}
        onCopy={() => this.snackBar('Copied to clipboard')}>
        <Link to={'#'} ><CopyContent className={styles.copyAddress} /></Link>
      </CopyToClipboard>
    );
  }

  renderEtherscanButton = (type, text) => {
    if (!text) {
      return null;
    }

    return (
      <a href={this.props.endpoint.networkInfo.etherscan + type + '/' + text} target='_blank'><Search className={styles.copyAddress} /></a>
    );
  }

  render() {
    const { accounts } = this.props.endpoint
    const dragoTransactionsLogs = this.props.transactionsDrago.holder.logs
    const dragoBalances = this.props.transactionsDrago.holder.balances
    const tabButtons = {
      inkBarStyle: {
        margin: 'auto',
        width: 100,
        backgroundColor: 'white'
      },
      tabItemContainerStyle: {
        margin: 'auto',
        width: 300,
        backgroundColor: '#FFFFFF',
      }
    }

    const listAccounts = accounts.map((account) => {
      return (
        <Col xs={6} key={account.name}>
          <ElementAccountBox
            account={account}
            key={account.name}
            snackBar={this.snackBar}
            etherscanUrl={this.props.endpoint.networkInfo.etherscan} />
        </Col>
      )
    }
    )
    return (
      <Row>
        <Col xs={12}>
          <Paper className={styles.paperContainer} zDepth={1}>

            
            <Sticky enabled={true} innerZ={1}>
              <UserDashboardHeader fundType='drago' userType='holder' />
              <Row className={styles.tabsRow}>
                <Col xs={12}>
                  <Tabs tabItemContainerStyle={tabButtons.tabItemContainerStyle} inkBarStyle={tabButtons.inkBarStyle}>
                    <Tab label="Accounts" className={styles.detailsTab}
                      onActive={() => scrollToComponent(this.Accounts, { offset: -80, align: 'top', duration: 500 })}
                      icon={<ActionList color={'#054186'} />}>
                    </Tab>
                    <Tab label="Holding" className={styles.detailsTab}
                      onActive={() => scrollToComponent(this.Dragos, { offset: -80, align: 'top', duration: 500 })}
                      icon={<ActionAssessment color={'#054186'} />}>
                    </Tab>
                    <Tab label="Transactions" className={styles.detailsTab}
                      onActive={() => scrollToComponent(this.Transactions, { offset: -80, align: 'top', duration: 500 })}
                      icon={<ActionShowChart color={'#054186'} />}>
                    </Tab>
                  </Tabs>
                </Col>
              </Row>
            </Sticky>
          </Paper>
          <Paper className={styles.paperContainer} zDepth={1}>
            <div className={styles.detailsBoxContainer}>
              <Grid fluid>
                <Row>
                  <Col xs={12} >
                    <span ref={(section) => { this.Accounts = section; }}></span>
                    <SectionHeader
                      titleText='ACCOUNTS'
                    />
                  </Col>
                </Row>
                <Row>
                  <Col xs={12}>
                    <Row>
                      {listAccounts}
                    </Row>

                  </Col>
                </Row>
              </Grid>
            </div>
          </Paper>
          <Paper className={styles.paperContainer} zDepth={1}>
            <div className={styles.detailsBoxContainer}>
              <Grid fluid>
                <Row>
                  <Col xs={12} >
                    <span ref={(section) => { this.Dragos = section; }}></span>
                    <SectionHeader
                      titleText='HOLDING'
                    />
                  </Col>
                </Row>
                <Row>
                  <Col xs={12}>
                    <div className={styles.sectionParagraph}>
                      Your portfolio:
                    </div>
                    <ElementListWrapper list={dragoBalances} loading={this.state.loading}>
                      <ElementListBalances />
                    </ElementListWrapper>
                  </Col>
                </Row>
              </Grid>
            </div>
          </Paper>
          <Paper className={styles.paperContainer} zDepth={1}>
            <div className={styles.detailsBoxContainer}>
              <Grid fluid>
                <Row>
                  <Col xs={12} >
                    <span ref={(section) => { this.Transactions = section; }}></span>
                    <SectionHeader
                      titleText='TRANSACTIONS'
                    />
                  </Col>
                </Row>
                <Row>
                  <Col xs={12}>
                    <div className={styles.sectionParagraph}>
                      Your last 20 transactions:
                  </div>

                    <ElementListWrapper list={dragoTransactionsLogs}
                      renderCopyButton={this.renderCopyButton}
                      renderEtherscanButton={this.renderEtherscanButton}
                      loading={this.state.loading}
                    >
                      <ElementListTransactions />
                    </ElementListWrapper>
                  </Col>
                </Row>
              </Grid>
            </div>
          </Paper>
        </Col>
        <Snackbar
          open={this.state.snackBar}
          message={this.state.snackBarMsg}
          action="close"
          onActionTouchTap={this.handlesnackBarRequestClose}
          onRequestClose={this.handlesnackBarRequestClose}
          bodyStyle={{
            height: "auto",
            flexGrow: 0,
            paddingTop: "10px",
            lineHeight: "20px",
            borderRadius: "2px 2px 0px 0px",
            backgroundColor: "#fafafa",
            boxShadow: "#bdbdbd 0px 0px 5px 0px"
          }}
          contentStyle={{
            color: "#000000 !important",
            fontWeight: "600"
          }}
        />
      </Row>
    )
  }

  // Getting last transactions
  getTransactions = (dragoAddress, accounts) => {
    console.log('getTransactions')
    const { api } = this.context
    const options = { balance: true, supply: false, limit: 10, trader: true }
    var sourceLogClass = this.constructor.name
    utils.getTransactionsDragoOptV2(api, dragoAddress, accounts, options)
      .then(results => {
        console.log(`${sourceLogClass} -> Transactions list loaded`)
        // const buySellLogs = results[1].filter(event =>{
        //   return event.type !== 'DragoCreated'
        // })
        console.log(results)
        this.props.dispatch(this.updateTransactionsDrago(results))
        this.setState({
          loading: false,
        });
      })
      .catch(error => {
        console.warn(`${sourceLogClass} -> Transactions list load error: ${error}`)
      })
  }
}

export default withRouter(connect(mapStateToProps)(PageDashboardDragoTrader))
