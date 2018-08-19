import { Row, Col, Grid } from 'react-flexbox-grid'
import { Link, withRouter } from 'react-router-dom'
import { CopyToClipboard } from 'react-copy-to-clipboard'
import { Tabs, Tab } from 'material-ui/Tabs'
import ActionAssessment from 'material-ui/svg-icons/action/assessment'
import ActionList from 'material-ui/svg-icons/action/list'
import ActionShowChart from 'material-ui/svg-icons/editor/show-chart'
import CopyContent from 'material-ui/svg-icons/content/content-copy'
import Paper from 'material-ui/Paper'
import PropTypes from 'prop-types'
import React, { Component } from 'react'
import scrollToElement from 'scroll-to-element'
import Search from 'material-ui/svg-icons/action/search'
import Snackbar from 'material-ui/Snackbar'
import Sticky from 'react-stickynode'
import ElementListWrapper from '../../Elements/elementListWrapper'
import ElementAccountBox from '../../Elements/elementAccountBox'
import ElementFundCreateAction from '../Elements/elementFundCreateAction'
import ElementListSupply from '../Elements/elementListSupply'
import ElementListTransactions from '../Elements/elementListTransactions'
import UserDashboardHeader from '../../_atomic/atoms/userDashboardHeader'
import BigNumber from 'bignumber.js';
import utils from '../../_utils/utils'
import { connect } from 'react-redux';
import SectionHeader from '../../_atomic/atoms/sectionHeader';

import styles from './pageDashboardDragoManager.module.css'
import { Actions } from '../../_redux/actions' 

function mapStateToProps(state) {
  return state
}

class PageDashboardDragoManager extends Component {

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

  componentDidMount() {
    const { endpoint } = this.props
    this.getTransactions(null, endpoint.accounts)
  }

  UNSAFE_componentWillMount() {

  }

  UNSAFE_componentWillReceiveProps(nextProps) {
    // Updating the lists on each new block if the accounts balances have changed
    // Doing this this to improve performances by avoiding useless re-rendering
    const { endpoint } = this.props
    const sourceLogClass = this.constructor.name
    console.log(`${sourceLogClass} -> UNSAFE_componentWillReceiveProps-> nextProps received.`);
    // Updating the transaction list if there have been a change in total accounts balance and the previous balance is
    // different from 0 (balances are set to 0 on app loading)
    const currentBalance = new BigNumber(this.props.endpoint.ethBalance)
    const nextBalance = new BigNumber(nextProps.endpoint.ethBalance)
    if (!currentBalance.eq(nextBalance) && !currentBalance.eq(0)) {
      this.getTransactions(null, endpoint.accounts)
      console.log(`${sourceLogClass} -> UNSAFE_componentWillReceiveProps -> Accounts have changed.`);
    }
  }

  shouldComponentUpdate(nextProps, nextState) {
    const sourceLogClass = this.constructor.name
    let stateUpdate = true
    let propsUpdate = true
    propsUpdate = !utils.shallowEqual(this.props, nextProps)
    stateUpdate = !utils.shallowEqual(this.state, nextState)
    if (stateUpdate || propsUpdate) {
      // console.log('State updated ', stateUpdate)
      // console.log('Props updated ', propsUpdate)
      // console.log(`${sourceLogClass} -> shouldComponentUpdate -> Proceedding with rendering.`);
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
      <a href={this.props.endpoint.networkInfo.etherscan + type + '/' + text} target='_blank' rel="noopener noreferrer"><Search className={styles.copyAddress} /></a>
    );
  }

  render() {
    const { accounts } = this.props.endpoint
    // const { dragoTransactionsLogs, dragoList } = this.state 
    const dragoTransactionsLogs = this.props.transactionsDrago.manager.logs
    const dragoList = this.props.transactionsDrago.manager.list
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
        zIndex: 1000
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
              <UserDashboardHeader fundType='drago' userType='wizard' />
              <Row className={styles.tabsRow}>
                <Col xs={12}>
                  <Tabs tabItemContainerStyle={tabButtons.tabItemContainerStyle} inkBarStyle={tabButtons.inkBarStyle}>
                    <Tab label="Accounts" className={styles.detailsTab}
                      onActive={() => scrollToElement('#accounts-section', {offset: -165})}
                      icon={<ActionList color={'#054186'} />}>
                    </Tab>
                    <Tab label="Funds" className={styles.detailsTab}
                      onActive={() => scrollToElement('#funds-section', {offset: -165})}
                      icon={<ActionAssessment color={'#054186'} />}>
                    </Tab>
                    <Tab label="Transactions" className={styles.detailsTab}
                      onActive={() => scrollToElement('#transactions-section', {offset: -165})}
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
                    <span id='accounts-section' ref={(section) => { this.Accounts = section; }}></span>
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
                    <span  id='funds-section' ref={(section) => { this.Dragos = section; }}></span>
                    <SectionHeader
                      titleText='FUNDS'
                    />
                  </Col>
                </Row>
                <Row>
                  <Col xs={12}>

                    <div className={styles.deployButtonContainer}>
                      <ElementFundCreateAction accounts={accounts} />
                    </div>

                    <div className={styles.sectionParagraph}>
                      Your funds:
                    </div>
                    <ElementListWrapper list={dragoList} loading={this.state.loading}>
                      <ElementListSupply />
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
                    <span id='transactions-section' ref={(section) => { this.Transactions = section; }}></span>
                    <SectionHeader
                      titleText='TRANSACTIONS'
                    />
                  </Col>
                </Row>
                <Row>
                  <Col xs={12}>
                    <div className={styles.sectionParagraph}>
                      Your funds last 20 transactions:
                  </div>

                    <ElementListWrapper
                      list={dragoTransactionsLogs}
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
      </Row >
    )
  }

  // Getting last transactions
  getTransactions = (dragoAddress, accounts) => {
    const { api } = this.context
    // const options = {balance: false, supply: true}
    const options = { balance: false, supply: true, limit: 10, trader: false }
    utils.getTransactionsDragoOptV2(api, dragoAddress, accounts, options)
      .then(results => {
        const createdLogs = results[1].filter(event => {
          return event.type !== 'BuyDrago' && event.type !== 'SellDrago'
        })
        results[1] = createdLogs
        this.props.dispatch(Actions.drago.updateTransactionsDragoManagerAction(results))
        this.setState({
          loading: false,
        });
      })
      .catch((error) => {
        console.log(error)
      })
  }
}

export default withRouter(connect(mapStateToProps)(PageDashboardDragoManager))
