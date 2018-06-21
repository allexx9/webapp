import BigNumber from 'bignumber.js';
import Paper from 'material-ui/Paper';
import Snackbar from 'material-ui/Snackbar';
import { Tab, Tabs } from 'material-ui/Tabs';
import ActionAssessment from 'material-ui/svg-icons/action/assessment';
import ActionList from 'material-ui/svg-icons/action/list';
import Search from 'material-ui/svg-icons/action/search';
import CopyContent from 'material-ui/svg-icons/content/content-copy';
import ActionShowChart from 'material-ui/svg-icons/editor/show-chart';
import PropTypes from 'prop-types';
import React, { Component } from 'react';
import { CopyToClipboard } from 'react-copy-to-clipboard';
import { Col, Grid, Row } from 'react-flexbox-grid';
import { connect } from 'react-redux';
import { Link, withRouter } from 'react-router-dom';
import scrollToComponent from 'react-scroll-to-component-ssr';
import Sticky from 'react-stickynode';
import Web3 from 'web3';
import ElementFundNotFound from '../../Elements/elementFundNotFound';
import InfoTable from '../../Elements/elementInfoTable';
import ElementListWrapper from '../../Elements/elementListWrapper';
import PoolApi from '../../PoolsApi/src';
import AssetsPieChart from '../../_atomic/atoms/assetsPieChart';
import Loading from '../../_atomic/atoms/loading';
import SectionHeader from '../../_atomic/atoms/sectionHeader';
import SectionTitle from '../../_atomic/atoms/sectionTitle';
import { Actions } from '../../_redux/actions/actions';
import { ENDPOINTS, PROD } from '../../_utils/const';
import { formatCoins, formatEth } from '../../_utils/format';
import utils from '../../_utils/utils';
import ElementListAssets from '../Elements/elementListAssets';
import ElementListTransactions from '../Elements/elementListTransactions';
import ElementPriceBox from '../Elements/elementPricesBox';
import ElementFundActionsList from '../Elements/elementFundActionsList'
import ElementNoAdminAccess from '../../Elements/elementNoAdminAccess'
import styles from './pageFundDetailsDragoManager.module.css';
import FundHeader from '../../_atomic/molecules/fundHeader'


function mapStateToProps(state) {
  return state
}

class PageFundDetailsDragoManager extends Component {

  // Checking the type of the context variable that we receive by the parent
  static contextTypes = {
    api: PropTypes.object.isRequired,
  };

  static propTypes = {
    location: PropTypes.object.isRequired,
    endpoint: PropTypes.object.isRequired,
    user: PropTypes.object.isRequired,
    match: PropTypes.object.isRequired,
    dispatch: PropTypes.func.isRequired,
    exchange: PropTypes.object.isRequired,
    transactionsDrago: PropTypes.object.isRequired,
  };

  state = {
    dragoDetails: {
      address: null,
      name: null,
      symbol: null,
      dragoId: null,
      addressOwner: null,
      addressGroup: null,
      dragoETHBalance: null
    },
    loading: true,
    snackBar: false,
    snackBarMsg: '',
  }

  subTitle = (account) => {
    return (
      account.address
    )
  }

  componentDidMount() {
    this.initDrago()
  }

  initDrago = async () => {
    const poolApi = new PoolApi(this.context.api)
    const dragoId = this.props.match.params.dragoid
    const dragoDetails = await utils.getDragoDetailsFromId(dragoId, this.context.api)
    await utils.getDragoDetails(dragoDetails, this.props, this.context.api)
    this.setState({
      loading: false
    })
    await this.getTransactions(dragoDetails, this.context.api)
    await poolApi.contract.dragoeventful.init()
    this.subscribeToEvents(poolApi.contract.dragoeventful)
  } 

  componentWillUnmount() {
    const { contractSubscription } = this.state
    const sourceLogClass = this.constructor.name
    // this.props.dispatch({type: TOKEN_PRICE_TICKER_CLOSE_WEBSOCKET})
    try {
      contractSubscription.unsubscribe(function (error, success) {
        if (success) {
          console.log(`${sourceLogClass}: Successfully unsubscribed from contract.`);
        }
        if (error) {
          console.warn(`${sourceLogClass}: Unsubscribe error ${error}.`)
        }
      });
    }
    catch (error) {
      console.warn(`${sourceLogClass}: Unsubscribe error ${error}.`)
    }
  }

  UNSAFE_componentWillReceiveProps(nextProps) {
    // Updating the lists on each new block if the accounts balances have changed
    // Doing this this to improve performances by avoiding useless re-rendering
    const sourceLogClass = this.constructor.name
    // console.log(nextProps)
    const currentBalance = new BigNumber(this.props.endpoint.ethBalance)
    const nextBalance = new BigNumber(nextProps.endpoint.ethBalance)
    if (!currentBalance.eq(nextBalance)) {
      this.initDrago()
      console.log(`${sourceLogClass} -> UNSAFE_componentWillReceiveProps -> Accounts have changed.`);
    } else {
      null
    }
  }

  shouldComponentUpdate(nextProps, nextState) {
    const sourceLogClass = this.constructor.name
    var stateUpdate = true
    var propsUpdate = true
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

  renderEtherscanButton = (type, address1, address2 = null) => {
    if (!address1) {
      return null;
    }
    switch (type) {
      case 'tx':
        return (
          <a key={"addressether" + address1} href={this.props.endpoint.networkInfo.etherscan + type + '/' + address1} target='_blank'><Search className={styles.copyAddress} /></a>
        );
      case 'token':
        return (
          <a key={"addressether" + address1} href={this.props.endpoint.networkInfo.etherscan + 'token' + '/' + address1 + '?a=' + address2} target='_blank'><Search className={styles.copyAddress} /></a>
        );
    }

  }

  handlesnackBarRequestClose = () => {
    this.setState({
      snackBar: false,
      snackBarMsg: ''
    })
  }

  render() {
    const { endpoint: { accounts: accounts }, user } = this.props
    const { loading } = this.state
    const dragoAssetsList = this.props.transactionsDrago.selectedDrago.assets
    const assetsCharts = this.props.transactionsDrago.selectedDrago.assetsCharts
    const dragoDetails = this.props.transactionsDrago.selectedDrago.details
    const dragoTransactionsList = this.props.transactionsDrago.selectedDrago.transactions
    const tabButtons = {
      inkBarStyle: {
        margin: 'auto',
        width: 100,
        backgroundColor: 'white'
      },
      tabItemContainerStyle: {
        margin: 'auto',
        width: 300,
      }
    }
    const columnsStyle = [styles.detailsTableCell, styles.detailsTableCell2, styles.detailsTableCell3]
    const columnsStyleLiquidityTable = [styles.detailsTableCellLiquidity, styles.detailsTableCellLiquidity2, styles.detailsTableCellLiquidity3]
    const tableButtonsDragoAddress = [this.renderCopyButton(dragoDetails.address), this.renderEtherscanButton('address', dragoDetails.address)]
    const tableButtonsDragoOwner = [this.renderCopyButton(dragoDetails.addressOwner), this.renderEtherscanButton('address', dragoDetails.addressOwner)]
    const tableInfo = [
      ['Created', dragoDetails.created, ''],
      ['Symbol', dragoDetails.symbol, ''],
      ['Name', dragoDetails.name, ''],
      ['Address', dragoDetails.address, tableButtonsDragoAddress],
      ['Manager', dragoDetails.addressOwner, tableButtonsDragoOwner]
    ]
    var portfolioValue = 'N/A'
    var totalValue = 'N/A'
    var assetsValues = {}
    var tableLiquidity = [
      ['Liquidity', 'N/A', ''],
      ['Porfolio value', 'N/A', ''],
      ['Total', 'N/A', ''],
    ]
    var estimatedPrice = 'N/A'

    // Waiting until getDragoDetails returns the drago details
    if (loading || Object.keys(dragoDetails).length === 0) {
      return (
        <div style={{ paddingTop: '10px' }}>
          <Loading />
        </div>
      );
    }
    if (dragoDetails.address === '0x0000000000000000000000000000000000000000') {
      return (
        <ElementFundNotFound />
      );
    }
    if (dragoAssetsList.length !== 0 && Object.keys(this.props.exchange.prices).length !== 0) {
      if (typeof dragoDetails.dragoETHBalance !== 'undefined') {
        portfolioValue = utils.calculatePortfolioValue(dragoAssetsList, this.props.exchange.prices)
        totalValue = new BigNumber(dragoDetails.dragoETHBalance).plus(portfolioValue).toFixed(5)
        assetsValues = utils.calculatePieChartPortfolioValue(dragoAssetsList, this.props.exchange.prices, dragoDetails.dragoETHBalance)
        tableLiquidity = [
          ['Liquidity', dragoDetails.dragoETHBalance, [(<small key='dragoLiqEth'>ETH</small>)]],
          ['Porfolio value', portfolioValue, [(<small key='dragoPortEth'>ETH</small>)]],
          ['Total', totalValue, [(<small key='dragoPortTotEth'>ETH</small>)]],
        ]
        estimatedPrice = new BigNumber(portfolioValue).div(new BigNumber(dragoDetails.totalSupply)).toFixed(5)
      }
    }

    // Checking if the user is the account manager
    let metaMaskAccountIndex = accounts.findIndex(account => {
      return (account.address === dragoDetails.addressOwner)
    });
    if (metaMaskAccountIndex === -1) {
      return (
        <ElementNoAdminAccess />
      )
    }

    return (
      <Row>
        <Col xs={12}>
          <div className={styles.pageContainer} >
            <Paper zDepth={1}>
              <Sticky enabled={true} innerZ={1}>
              <FundHeader 
                fundDetails={dragoDetails} 
                fundType='drago'
                actions={<ElementFundActionsList accounts={accounts} dragoDetails={dragoDetails} snackBar={this.snackBar} />}
              />
                <Row className={styles.tabsRow}>
                  <Col xs={12}>
                    <Tabs tabItemContainerStyle={tabButtons.tabItemContainerStyle} inkBarStyle={tabButtons.inkBarStyle}>
                      <Tab label="SUMMARY" className={styles.detailsTab}
                        onActive={() => scrollToComponent(this.Summary, { offset: -180, align: 'top', duration: 500 })}
                        icon={<ActionList color={'#054186'} />}>
                      </Tab>
                      <Tab label="INSIGHT" className={styles.detailsTab}
                        onActive={() => scrollToComponent(this.InSight, { offset: -180, align: 'top', duration: 500 })}
                        icon={<ActionAssessment color={'#054186'} />}>
                      </Tab>
                      <Tab label="LOGS" className={styles.detailsTab}
                        onActive={() => scrollToComponent(this.Logs, { offset: -180, align: 'top', duration: 500 })}
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
                      <span ref={(section) => { this.Summary = section; }}></span>
                      <SectionHeader
                        titleText='SUMMARY'
                        style={{ fontSize: '28px' }} 
                        // actionButton={<ElementFundActionsList accounts={accounts} dragoDetails={dragoDetails} snackBar={this.snackBar} />}
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
                          <span>{dragoDetails.totalSupply}</span> <small className={styles.myPositionTokenSymbol}>{dragoDetails.symbol.toUpperCase()}</small><br />
                        </div>
                        <InfoTable rows={tableInfo} columnsStyle={columnsStyle} />
                      </div>
                    </Col>
                    <Col xs={12} md={6}>
                      <div className={styles.myPositionBox}>
                        <Row>
                          <Col xs={12}>
                            <SectionTitle titleText='MARKET' help={true} />
                            <div className={styles.detailsBoxContainer}>
                              <Row>
                                <Col xs={6}>
                                  <div className={styles.sectionParagraph}>
                                    Estimated price:
                                  </div>
                                </Col>
                                <Col xs={6} style={{ textAlign: 'center' }}>
                                  {estimatedPrice} <small>ETH</small>
                                </Col>
                              </Row>
                              <Row>
                                <Col xs={12}>
                                  <div className={styles.sectionParagraph} style={{ paddingTop: '5px' }}>
                                    Manager set price:
                                </div>
                                </Col>
                              </Row>
                              <ElementPriceBox
                                dragoDetails={dragoDetails}
                                accounts={accounts}
                                handleBuySellButtons={this.handleBuySellButtons}
                                isManager={user.isManager}
                              />
                              {/* <ElementFundActions
                                dragoDetails={dragoDetails}
                                accounts={accounts}
                                snackBar={this.snackBar}
                                actionSelected={this.state.openBuySellDialog}
                                onTransactionSent={this.onTransactionSent}
                              /> */}
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
                    <span ref={(section) => { this.InSight = section; }}></span>
                    <SectionHeader
                      titleText='INSIGHT'
                      style={{ fontSize: '28px' }} />
                  </Col>
                </Row>
                <Row>
                  <Col xs={12}>
                    <div className={styles.detailsBoxContainer}>
                      <div className={styles.detailsSectionContainer}>
                        <SectionTitle titleText='ASSETS' />
                        <Row>
                          <Col xs={12}>
                            <Row>
                              <Col xs={6}>
                                <InfoTable rows={tableLiquidity} columnsStyle={columnsStyleLiquidityTable} />
                              </Col>
                              <Col xs={6}>
                                <AssetsPieChart data={assetsValues} />
                              </Col>
                            </Row>
                          </Col>
                        </Row>
                      </div>
                      <SectionTitle titleText='PORTFOLIO' />
                      <div className={styles.sectionParagraph}>
                        Assets in porfolio:
                    </div>
                      <ElementListWrapper
                        list={dragoAssetsList}
                        renderCopyButton={this.renderCopyButton}
                        renderEtherscanButton={this.renderEtherscanButton}
                        dragoDetails={dragoDetails}
                        loading={loading}
                        assetsPrices={this.props.exchange.prices}
                        assetsChart={assetsCharts}
                      >
                        <ElementListAssets />
                      </ElementListWrapper>
                    </div>
                  </Col>
                </Row>
              </Grid>
            </Paper>
            <Paper className={styles.paperContainer} zDepth={1}>
              <Grid fluid>
                <Row>
                  <Col xs={12} >
                    <span ref={(section) => { this.Logs = section; }}></span>
                    <SectionHeader
                      titleText='LOGS'
                      style={{ fontSize: '28px' }} />
                  </Col>
                </Row>
                <Row>
                  <Col xs={12} className={styles.detailsTabContent}>
                    <SectionTitle titleText='TRANSACTIONS' />
                    <div className={styles.detailsTabContent}>
                      <p>Your last 20 transactions on this fund.</p>
                    </div>
                    <ElementListWrapper list={dragoTransactionsList}
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
        this.initDrago()
      }
    })
    this.setState({
      contractSubscription: subscription
    })
  }

  // Getting last transactions
  getTransactions = async (dragoDetails, api) => {
    const dragoAddress = dragoDetails[0][0]
    const sourceLogClass = this.constructor.name
    const poolApi = new PoolApi(this.context.api)
    await poolApi.contract.dragoeventful.init()
    const contract = poolApi.contract.dragoeventful
    const logToEvent = (log) => {
      const key = api.util.sha3(JSON.stringify(log))
      const { blockNumber, logIndex, transactionHash, transactionIndex, params, type } = log
      const ethvalue = (log.event === 'BuyDrago') ? formatEth(params.amount.value, null, api) : formatEth(params.revenue.value, null, api);
      const drgvalue = (log.event === 'SellDrago') ? formatCoins(params.amount.value, null, api) : formatCoins(params.revenue.value, null, api);
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
        drgvalue
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

    const hexDragoAddress = '0x' + dragoAddress.substr(2).padStart(64, '0')
    // const options = {
    //   fromBlock: 0,
    //   toBlock: 'pending',
    // }
    const eventsFilterBuy = {
      topics: [
        [contract.hexSignature.BuyDrago],
        [hexDragoAddress],
        null,
        null
      ]
    }
    const eventsFilterSell = {
      topics: [
        [contract.hexSignature.SellDrago],
        [hexDragoAddress],
        null,
        null
      ]
    }
    const buyDragoEvents = contract
      .getAllLogs(eventsFilterBuy)
      .then((dragoTransactionsLog) => {
        const buyLogs = dragoTransactionsLog.map(logToEvent)
        return buyLogs
      }
      )
    const sellDragoEvents = contract
      .getAllLogs(eventsFilterSell)
      .then((dragoTransactionsLog) => {
        const sellLogs = dragoTransactionsLog.map(logToEvent)
        return sellLogs
      }
      )
    Promise.all([buyDragoEvents, sellDragoEvents])
      .then((logs) => {
        const allLogs = [...logs[0], ...logs[1]]
        return allLogs
      })
      .then((dragoTransactionsLog) => {
        // Creating an array of promises that will be executed to add timestamp to each entry
        // Doing so because for each entry we need to make an async call to the client
        // For additional refernce: https://stackoverflow.com/questions/39452083/using-promise-function-inside-javascript-array-map
        var promises = dragoTransactionsLog.map((log) => {
          return api.eth
            .getBlockByNumber(log.blockNumber.c[0])
            .then((block) => {
              log.timestamp = block.timestamp
              return log
            })
            .catch((error) => {
              // Sometimes Infura returns null for api.eth.getBlockByNumber, therefore we are assigning a fake timestamp to avoid
              // other issues in the app.
              console.warn(error)
              log.timestamp = new Date()
              return log
            })
        })
        Promise.all(promises).then((results) => {
          this.props.dispatch(Actions.drago.updateSelectedDragoAction({ transactions: results }))
          console.log(`${sourceLogClass} -> Transactions list loaded`);
          this.setState({
            loading: false,
          })
        })
      })
  }

}

export default withRouter(connect(mapStateToProps)(PageFundDetailsDragoManager))