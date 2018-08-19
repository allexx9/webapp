import BigNumber from 'bignumber.js';
import Paper from 'material-ui/Paper';
import Snackbar from 'material-ui/Snackbar';
import * as Colors from 'material-ui/styles/colors';
import ActionList from 'material-ui/svg-icons/action/list';
import Search from 'material-ui/svg-icons/action/search';
import CopyContent from 'material-ui/svg-icons/content/content-copy';
import ActionShowChart from 'material-ui/svg-icons/editor/show-chart';
import { Tab, Tabs } from 'material-ui/Tabs';
import PropTypes from 'prop-types';
import React, { Component } from 'react';
import { CopyToClipboard } from 'react-copy-to-clipboard';
import { Col, Grid, Row } from 'react-flexbox-grid';
import { connect } from 'react-redux';
import { Link, withRouter } from 'react-router-dom';
import scrollToElement from 'scroll-to-element';
import Sticky from 'react-stickynode';
import Web3 from 'web3';
import ElementFundNotFound from '../../Elements/elementFundNotFound';
import InfoTable from '../../Elements/elementInfoTable';
import ElementListWrapper from '../../Elements/elementListWrapper';
import PoolApi from '../../PoolsApi/src';
import FundHeader from '../../_atomic/molecules/fundHeader';
import Loading from '../../_atomic/atoms/loading';
import SectionHeader from '../../_atomic/atoms/sectionHeader';
import SectionTitle from '../../_atomic/atoms/sectionTitle';
import { ENDPOINTS, PROD } from '../../_utils/const';
import { formatCoins, formatEth } from '../../_utils/format';
import { Actions } from '../../_redux/actions';
import utils from '../../_utils/utils';
import ElementFeesBox from '../Elements/elementFeesBox';
import ElementListTransactions from '../Elements/elementListTransactions';
import ElementVaultActions from '../Elements/elementVaultActions';
import styles from './pageVaultDetailsVaultTrader.module.css';

function mapStateToProps(state) {
  return state
}

class PageFundDetailsVaultTrader extends Component {

  // Checking the type of the context variable that we receive by the parent
  static contextTypes = {
    api: PropTypes.object.isRequired,
  };

  static propTypes = {
    location: PropTypes.object.isRequired,
    endpoint: PropTypes.object.isRequired,
    accounts: PropTypes.array.isRequired,
    match: PropTypes.object.isRequired,
    dispatch: PropTypes.func.isRequired,
    user: PropTypes.object.isRequired,
    transactionsVault: PropTypes.object.isRequired,
  };

  state = {
    vaultTransactionsLogs: [],
    loading: true,
    snackBar: false,
    snackBarMsg: '',
    openBuySellDialog: {
      open: false,
      action: 'deposit'
    },
  }

  componentDidMount() {
    this.initVault()
  }

  initVault = async () => {
    const poolApi = new PoolApi(this.context.api)
    const dragoId = this.props.match.params.dragoid
    const vaultDetails = await utils.getDragoDetailsFromId(dragoId, this.context.api)
    await utils.getVaultDetails(vaultDetails, this.props, this.context.api)
    this.setState({
      loading: false
    })
    await this.getTransactions(vaultDetails, this.context.api, this.props.endpoint.accounts)
    await poolApi.contract.vaulteventful.init()
    this.subscribeToEvents(poolApi.contract.vaulteventful)
  }

  componentWillUnmount() {
    const { contractSubscription } = this.state
    const sourceLogClass = this.constructor.name
    // this.props.dispatch({type: TOKEN_PRICE_TICKERS_FETCH_STOP})
    try {
      contractSubscription.unsubscribe(function (error, success) {
        if (success) {
          console.log(`${sourceLogClass}: Successfully unsubscribed from contract.`);
        }
        if (error) {
          console.log(`${sourceLogClass}: Unsubscribe error ${error}.`)
        }
      });
    }
    catch (error) {
      console.log(`${sourceLogClass}: Unsubscribe error ${error}.`)
    }
  }

  UNSAFE_componentWillReceiveProps(nextProps) {
    // Updating the lists on each new block if the accounts balances have changed
    // Doing this this to improve performances by avoiding useless re-rendering
    const sourceLogClass = this.constructor.name
    const currentBalance = new BigNumber(this.props.endpoint.ethBalance)
    const nextBalance = new BigNumber(nextProps.endpoint.ethBalance)
    if (!currentBalance.eq(nextBalance)) {
      this.initVault()
      console.log(`${sourceLogClass} -> UNSAFE_componentWillReceiveProps -> Accounts have changed.`);
    } else {
      null
    }
  }

  shouldComponentUpdate(nextProps, nextState) {
    const sourceLogClass = this.constructor.name
    let stateUpdate = true
    let propsUpdate = true
    // const currentBalance = new BigNumber(this.props.endpoint.ethBalance)
    // const nextBalance = new BigNumber(nextProps.endpoint.ethBalance)
    stateUpdate = !utils.shallowEqual(this.state, nextState)
    propsUpdate = !utils.shallowEqual(this.props, nextProps)
    if (stateUpdate || propsUpdate) {
      console.log(`${sourceLogClass} -> shouldComponentUpdate -> Proceedding with rendering.`);
    }
    return stateUpdate || propsUpdate
  }

  snackBar = (msg) => {
    this.setState({
      snackBar: true,
      snackBarMsg: msg
    })
  }

  renderCopyButton = (text) => {
    if (!text) {
      return null;
    }

    return (
      <CopyToClipboard text={text} key={"address" + text}
        onCopy={() => this.snackBar('Copied to clilpboard')}>
        <Link to={'#'} key={"addresslink" + text}><CopyContent className={styles.copyAddress} /></Link>
      </CopyToClipboard>
    );
  }

  renderEtherscanButton = (type, text) => {
    if (!text) {
      return null;
    }

    return (
      <a key={"addressether" + text} href={this.props.endpoint.networkInfo.etherscan + type + '/' + text} target='_blank'><Search className={styles.copyAddress} /></a>
    );
  }

  handlesnackBarRequestClose = () => {
    this.setState({
      snackBar: false,
      snackBarMsg: ''
    })
  }

  handleBuySellButtons = (action) => {
    this.setState({
      openBuySellDialog: {
        open: !this.state.openBuySellDialog.open,
        action: action
      }
    })
  }

  onTransactionSent = () => {
    this.setState({
      openBuySellDialog: {
        open: false,
      }
    })
  }

  render() {
    const { accounts, user } = this.props
    const { loading } = this.state
    const vaultDetails = this.props.transactionsVault.selectedVault.details
    const vaultTransactionsList = this.props.transactionsVault.selectedVault.transactions
    const tabButtons = {
      inkBarStyle: {
        margin: 'auto',
        width: 100,
        backgroundColor: 'white'
      },
      tabItemContainerStyle: {
        margin: 'auto',
        width: 200,
      }
    }
    const columnsStyle = [styles.detailsTableCell, styles.detailsTableCell2, styles.detailsTableCell3]
    const tableButtonsVaultAddress = [this.renderCopyButton(vaultDetails.address), this.renderEtherscanButton('address', vaultDetails.address)]
    const tableButtonsVaultOwner = [this.renderCopyButton(vaultDetails.addressOwner), this.renderEtherscanButton('address', vaultDetails.addressOwner)]
    const tableInfo = [['Symbol', vaultDetails.symbol, ''],
    ['Name', vaultDetails.name, ''],
    ['Address', vaultDetails.address, tableButtonsVaultAddress],
    ['Owner', vaultDetails.addressOwner, tableButtonsVaultOwner]]

    // Waiting until getVaultDetails returns the drago details
    if (loading || Object.keys(vaultDetails).length === 0) {
      return (
        <div style={{ paddingTop: '10px' }}>
          <Loading />
        </div>
      );
    }

    if (vaultDetails.address === '0x0000000000000000000000000000000000000000') {
      return (
        <ElementFundNotFound />
      );
    }
    return (
      <Row>
        <Col xs={12}>
          <div className={styles.pageContainer} >
            <Paper zDepth={1}>
              <Sticky enabled={true} innerZ={1}>
                <FundHeader
                  fundType='vault'
                  fundDetails={vaultDetails}
                />
                <Row className={styles.tabsRow}>
                  <Col xs={12}>
                    <Tabs tabItemContainerStyle={tabButtons.tabItemContainerStyle} inkBarStyle={tabButtons.inkBarStyle}>
                      <Tab label="SUMMARY" className={styles.detailsTab}
                        onActive={() => scrollToElement('#summary-section', {offset: -165})}
                        icon={<ActionList color={'#607D8B'} />}>
                      </Tab>
                      {/* <Tab label="INSIGHT" className={styles.detailsTab}
                        onActive={() => scrollToComponent(this.InSight, { offset: -180, align: 'top', duration: 500 })}
                        icon={<ActionAssessment color={'#607D8B'} />}>
                      </Tab> */}
                      <Tab label="LOGS" className={styles.detailsTab}
                        onActive={() => scrollToElement('#transactions-section', {offset: -165})}
                        icon={<ActionShowChart color={'#607D8B'} />}>
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
                      <span id='summary-section' ref={(section) => { this.Summary = section; }}></span>
                      <SectionHeader
                        titleText='SUMMARY'
                        textStyle={{ backgroundColor: Colors.blueGrey500 }}
                        fundType="vault"
                      />
                    </Col>
                  </Row>
                  <Row>
                    <Col xs={12} md={6}>
                      <SectionTitle titleText='DETAILS' />
                      <div className={styles.detailsContent}>
                        <div className={styles.sectionParagraph}>
                          Total supply:
                          </div>
                        <div className={styles.holdings}>
                          <span>{vaultDetails.totalSupply}</span> <small className={styles.myPositionTokenSymbol}>{vaultDetails.symbol.toUpperCase()}</small><br />
                        </div>
                        <InfoTable rows={tableInfo} columnsStyle={columnsStyle} />
                      </div>
                    </Col>
                    <Col xs={12} md={6}>
                      <div className={styles.myPositionBox}>
                        <Row>
                          <Col xs={12}>
                            <SectionTitle titleText='POSITION' help={true} />
                            <div className={styles.detailsBoxContainer}>
                              <div className={styles.sectionParagraph}>
                                Your total holding:
                              </div>
                              <div className={styles.holdings}>
                                <span>{vaultDetails.balanceDRG}</span> <small className={styles.myPositionTokenSymbol}>{vaultDetails.symbol.toUpperCase()}</small><br />
                              </div>
                            </div>
                          </Col>
                          <Col xs={12}>
                            <SectionTitle titleText='FEES' help={true} />
                            <div className={styles.detailsBoxContainer}>
                              <Row>
                                <Col xs={12}>
                                  <div className={styles.sectionParagraph} style={{ paddingTop: '5px' }}>
                                    Manager set fees:
                                </div>
                                </Col>
                              </Row>
                              <ElementFeesBox
                                vaultDetails={vaultDetails}
                                accounts={accounts}
                                handleBuySellButtons={this.handleBuySellButtons}
                                isManager={user.isManager}
                              />
                              <ElementVaultActions
                                vaultDetails={vaultDetails}
                                accounts={accounts}
                                snackBar={this.snackBar}
                                actionSelected={this.state.openBuySellDialog}
                                onTransactionSent={this.onTransactionSent}
                              />
                            </div>
                          </Col>
                        </Row>
                      </div>
                    </Col>
                  </Row>
                </Grid>
              </div>
            </Paper>
            <Paper className={styles.paperContainer} zDepth={1}>
              <Grid fluid>
                <Row>
                  <Col xs={12} >
                    <span id='transactions-section' ref={(section) => { this.Logs = section; }}></span>
                    <SectionHeader
                      titleText='LOGS'
                      textStyle={{ backgroundColor: Colors.blueGrey500 }}
                      fundType="vault"
                    />
                  </Col>
                </Row>
                <Row>
                  <Col xs={12} className={styles.detailsTabContent}>
                    <SectionTitle titleText='TRANSACTIONS' />
                    <div className={styles.detailsTabContent}>
                      <p>Your last 20 transactions on this Vault.</p>
                    </div>
                    <ElementListWrapper list={vaultTransactionsList}
                      renderCopyButton={this.renderCopyButton}
                      renderEtherscanButton={this.renderEtherscanButton}
                      loading={loading}>

                      <ElementListTransactions />
                    </ElementListWrapper>
                  </Col>
                </Row>
              </Grid>
            </Paper>
          </div>
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

  subscribeToEvents = (contract) => {
    const networkName = this.props.endpoint.networkInfo.name
    var WsSecureUrl = ''
    const eventfullContracAddress = contract.contract.address[0]
    if (PROD) {
      WsSecureUrl = ENDPOINTS.rigoblock.wss[networkName].prod
    } else {
      WsSecureUrl = ENDPOINTS.rigoblock.wss[networkName].dev
    }
    const web3 = new Web3(WsSecureUrl)
    const eventfullContract = new web3.eth.Contract(contract.abi, eventfullContracAddress)
    const subscription = eventfullContract.events.allEvents({
      fromBlock: 'latest',
      topics: [
        null,
        null,
        null,
        null
      ]
    }, (error, events) => {
      if (!error) {
        var sourceLogClass = this.constructor.name
        console.log(`${sourceLogClass} -> New contract event.`);
        console.log(events)
        this.initVault()
      }
    })
    this.setState({
      contractSubscription: subscription
    })
  }

  // Getting last transactions
  getTransactions = async (vaultDetails, api, accounts) => {
    const vaultAddress = vaultDetails[0][0]
    var sourceLogClass = this.constructor.name
    const poolApi = new PoolApi(this.context.api)
    await poolApi.contract.vaulteventful.init()
    const contract = poolApi.contract.vaulteventful
    const logToEvent = (log) => {
      const key = api.util.sha3(JSON.stringify(log))
      const { blockNumber, logIndex, transactionHash, transactionIndex, params, type } = log
      var ethvalue = (log.event === 'SellVault') ? formatEth(params.amount.value, null, api) : formatEth(params.revenue.value, null, api);
      var drgvalue = (log.event === 'SellVault') ? formatCoins(params.amount.value, null, api) : formatCoins(params.revenue.value, null, api);
      // let ethvalue = null
      // let drgvalue = null     
      // if ((log.event === 'BuyDrago')) {
      //   ethvalue = formatEth(params.amount.value,null,api)
      //   drgvalue = formatCoins(params.revenue.value,null,api)     
      // }
      // if ((log.event === 'SellDrago')) {
      //   ethvalue = formatEth(params.revenue.value,null,api)
      //   drgvalue = formatCoins(params.amount.value,null,api)     
      // }
      return {
        type: log.event,
        state: type,
        blockNumber,
        logIndex,
        transactionHash,
        transactionIndex,
        params,
        key,
        ethvalue,
        drgvalue,
        symbol: String.fromCharCode(...params.symbol.value)
      }
    }

    // Getting all buyDrago and selDrago events since block 0.
    // dragoFactoryEventsSignatures accesses the contract ABI, gets all the events and for each creates a hex signature
    // to be passed to getAllLogs. Events are indexed and filtered by topics
    // more at: http://solidity.readthedocs.io/en/develop/contracts.html?highlight=event#events

    // The second param of the topics array is the drago address
    // The third param of the topics array is the from address
    // The third param of the topics array is the to address
    //
    //  https://github.com/RigoBlock/Books/blob/master/Solidity_01_Events.MD

    const hexVaultAddress = '0x' + vaultAddress.substr(2).padStart(64, '0')
    const hexAccounts = accounts.map((account) => {
      const hexAccount = '0x' + account.address.substr(2).padStart(64, '0')
      return hexAccount
    })
    // const options = {
    //   fromBlock: 0,
    //   toBlock: 'pending',
    // }
    const eventsFilterBuy = {
      topics: [
        [contract.hexSignature.BuyVault],
        [hexVaultAddress],
        hexAccounts,
        null
      ]
    }
    const eventsFilterSell = {
      topics: [
        [contract.hexSignature.SellVault],
        [hexVaultAddress],
        hexAccounts,
        null
      ]
    }
    const buyVaultEvents = contract
      .getAllLogs(eventsFilterBuy)
      .then((vaultTransactionsLog) => {
        console.log(vaultTransactionsLog)
        const buyLogs = vaultTransactionsLog.map(logToEvent)
        return buyLogs
      }
      )
    const sellVaultEvents = contract
      .getAllLogs(eventsFilterSell)
      .then((vaultTransactionsLog) => {
        const sellLogs = vaultTransactionsLog.map(logToEvent)
        return sellLogs
      }
      )
    Promise.all([buyVaultEvents, sellVaultEvents])
      .then((logs) => {
        const allLogs = [...logs[0], ...logs[1]]
        return allLogs
      })
      .then((vaultTransactionsLog) => {
        console.log(vaultTransactionsLog)
        // Creating an array of promises that will be executed to add timestamp to each entry
        // Doing so because for each entry we need to make an async call to the client
        // For additional refernce: https://stackoverflow.com/questions/39452083/using-promise-function-inside-javascript-array-map
        var promises = vaultTransactionsLog.map((log) => {
          return api.eth
            .getBlockByNumber(log.blockNumber.c[0])
            .then((block) => {
              log.timestamp = block.timestamp
              return log
            })
            .catch((error) => {
              // Sometimes Infura returns null for api.eth.getBlockByNumber, therefore we are assigning a fake timestamp to avoid
              // other issues in the app.
              console.log(error)
              log.timestamp = new Date()
              return log
            })
        })
        Promise.all(promises)
        .then((results) => {
          this.props.dispatch(Actions.vault.updateSelectedVaultAction({ transactions: results }))
          console.log(`${sourceLogClass} -> Transactions list loaded`);
          this.setState({
            loading: false,
          })
        })
      })
  }

}

export default withRouter(connect(mapStateToProps)(PageFundDetailsVaultTrader))
