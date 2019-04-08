import * as Colors from 'material-ui/styles/colors'
import { Col, Grid, Row } from 'react-flexbox-grid'
import { CopyToClipboard } from 'react-copy-to-clipboard'
import { Link, withRouter } from 'react-router-dom'
import { Tab, Tabs } from 'material-ui/Tabs'
import { connect } from 'react-redux'
import ActionAssessment from 'material-ui/svg-icons/action/assessment'
import ActionList from 'material-ui/svg-icons/action/list'
import ActionShowChart from 'material-ui/svg-icons/editor/show-chart'
import BigNumber from 'bignumber.js'
import CopyContent from 'material-ui/svg-icons/content/content-copy'
import ElementAccountBox from '../../Elements/elementAccountBox'
import ElementListBalances from '../Elements/elementListBalances'
import ElementListWrapper from '../../Elements/elementListWrapper'
import Paper from 'material-ui/Paper'
import PropTypes from 'prop-types'
import React, { Component } from 'react'
import Search from 'material-ui/svg-icons/action/search'
import SectionHeader from '../../_atomic/atoms/sectionHeader'
import Snackbar from 'material-ui/Snackbar'
import Sticky from 'react-stickynode'
import TablePoolTransactions from '../../_atomic/molecules/tablePoolTransactions'
import UserDashboardHeader from '../../_atomic/atoms/userDashboardHeader'
import scrollToElement from 'scroll-to-element'
import utils from '../../_utils/utils'

import styles from './pageDashboardVaultTrader.module.css'

function mapStateToProps(state) {
  return state
}

class PageDashboardVaultTrader extends Component {
  // Checking the type of the context variable that we receive by the parent
  static contextTypes = {
    api: PropTypes.object.isRequired
  }

  static propTypes = {
    location: PropTypes.object.isRequired,
    endpoint: PropTypes.object.isRequired,
    dispatch: PropTypes.func.isRequired,
    transactionsVault: PropTypes.object.isRequired
  }

  state = {
    loading: true,
    snackBar: false,
    snackBarMsg: ''
  }

  componentDidMount = () => {}

  UNSAFE_componentWillReceiveProps(nextProps) {
    const currentBalance = new BigNumber(this.props.endpoint.ethBalance)
    const nextBalance = new BigNumber(nextProps.endpoint.ethBalance)
    if (!currentBalance.eq(nextBalance) && !currentBalance.eq(0)) {
    }
  }

  shouldComponentUpdate(nextProps, nextState) {
    let stateUpdate = true
    let propsUpdate = true
    propsUpdate = !utils.shallowEqual(this.props, nextProps)
    stateUpdate = !utils.shallowEqual(this.state, nextState)
    if (stateUpdate || propsUpdate) {
    }
    return stateUpdate || propsUpdate
  }

  snackBar = msg => {
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

  renderCopyButton = text => {
    if (!text) {
      return null
    }

    return (
      <CopyToClipboard
        text={text}
        onCopy={() => this.snackBar('Copied to clipboard')}
      >
        <Link to={'#'}>
          <CopyContent className={styles.copyAddress} />
        </Link>
      </CopyToClipboard>
    )
  }

  renderEtherscanButton = (type, text) => {
    if (!text) {
      return null
    }

    return (
      <a
        href={this.props.endpoint.networkInfo.etherscan + type + '/' + text}
        target="_blank"
        rel="noopener noreferrer"
      >
        <Search className={styles.copyAddress} />
      </a>
    )
  }

  render() {
    const { accounts } = this.props.endpoint
    const vaultTransactionsLogs = this.props.transactionsVault.holder.logs
    const vaultBalances = this.props.transactionsVault.holder.balances
    const tabButtons = {
      inkBarStyle: {
        margin: 'auto',
        width: 100,
        backgroundColor: 'white'
      },
      tabItemContainerStyle: {
        margin: 'auto',
        width: 300,
        backgroundColor: '#FFFFFF'
      }
    }

    const listAccounts = accounts.map(account => {
      return (
        <Col xs={6} key={account.name}>
          <ElementAccountBox
            account={account}
            key={account.name}
            snackBar={this.snackBar}
            etherscanUrl={this.props.endpoint.networkInfo.etherscan}
            fundType="vault"
          />
        </Col>
      )
    })

    return (
      <Row>
        <Col xs={12}>
          <Paper className={styles.paperContainer} zDepth={1}>
            <Sticky enabled={true} innerZ={1}>
              <UserDashboardHeader fundType="vault" userType="holder" />
              <Row className={styles.tabsRow}>
                <Col xs={12}>
                  <Tabs
                    tabItemContainerStyle={tabButtons.tabItemContainerStyle}
                    inkBarStyle={tabButtons.inkBarStyle}
                  >
                    <Tab
                      label="Accounts"
                      className={styles.detailsTab}
                      onActive={() =>
                        scrollToElement('#accounts-section', { offset: -165 })
                      }
                      icon={<ActionList color={'#607D8B'} />}
                    />
                    <Tab
                      label="Holdings"
                      className={styles.detailsTab}
                      onActive={() =>
                        scrollToElement('#holding-section', { offset: -165 })
                      }
                      icon={<ActionAssessment color={'#607D8B'} />}
                    />
                    <Tab
                      label="Transactions"
                      className={styles.detailsTab}
                      onActive={() =>
                        scrollToElement('#transactions-section', {
                          offset: -165
                        })
                      }
                      icon={<ActionShowChart color={'#607D8B'} />}
                    />
                  </Tabs>
                </Col>
              </Row>
            </Sticky>
          </Paper>
          <Paper className={styles.paperContainer} zDepth={1}>
            <div className={styles.detailsBoxContainer}>
              <Grid fluid>
                <Row>
                  <Col xs={12}>
                    <span
                      id="accounts-section"
                      ref={section => {
                        this.Accounts = section
                      }}
                    />
                    <SectionHeader
                      titleText="ACCOUNTS"
                      textStyle={{ backgroundColor: Colors.blueGrey500 }}
                      fundType="vault"
                    />
                  </Col>
                </Row>
                <Row>
                  <Col xs={12}>
                    <Row>{listAccounts}</Row>
                  </Col>
                </Row>
              </Grid>
            </div>
          </Paper>
          <Paper className={styles.paperContainer} zDepth={1}>
            <div className={styles.detailsBoxContainer}>
              <Grid fluid>
                <Row>
                  <Col xs={12}>
                    <span
                      id="holding-section"
                      ref={section => {
                        this.Dragos = section
                      }}
                    />
                    <SectionHeader
                      titleText="VAULT HOLDINGS"
                      textStyle={{ backgroundColor: Colors.blueGrey500 }}
                      fundType="vault"
                    />
                  </Col>
                </Row>
                <Row>
                  <Col xs={12}>
                    <div className={styles.sectionParagraph}>Your vaults:</div>
                    <ElementListWrapper
                      list={vaultBalances}
                      filterTool={true}
                      filterKeys={['name', 'symbol']}
                      autoLoading={false}
                    >
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
                  <Col xs={12}>
                    <span
                      id="transactions-section"
                      ref={section => {
                        this.Transactions = section
                      }}
                    />
                    <SectionHeader
                      titleText="TRANSACTIONS"
                      textStyle={{ backgroundColor: Colors.blueGrey500 }}
                      fundType="vault"
                    />
                  </Col>
                </Row>
                <Row>
                  <Col xs={12}>
                    <div className={styles.sectionParagraph}>
                      Your last 20 transactions:
                    </div>

                    <ElementListWrapper
                      list={vaultTransactionsLogs}
                      renderCopyButton={this.renderCopyButton}
                      renderEtherscanButton={this.renderEtherscanButton}
                      autoLoading={false}
                      renderOptimization={false}
                      pagination={{
                        display: 10,
                        number: 1
                      }}
                    >
                      <TablePoolTransactions />
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
          onActionClick={this.handlesnackBarRequestClose}
          onRequestClose={this.handlesnackBarRequestClose}
          bodyStyle={{
            height: 'auto',
            flexGrow: 0,
            paddingTop: '10px',
            lineHeight: '20px',
            borderRadius: '2px 2px 0px 0px',
            backgroundColor: '#fafafa',
            boxShadow: '#bdbdbd 0px 0px 5px 0px'
          }}
          contentStyle={{
            color: '#000000 !important',
            fontWeight: '600'
          }}
        />
      </Row>
    )
  }
}

export default withRouter(connect(mapStateToProps)(PageDashboardVaultTrader))
