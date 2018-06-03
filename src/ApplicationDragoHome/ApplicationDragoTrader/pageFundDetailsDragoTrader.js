import * as Colors from 'material-ui/styles/colors'
import { Grid, Row, Col } from 'react-flexbox-grid'
import { Link, withRouter } from 'react-router-dom'
import { CopyToClipboard } from 'react-copy-to-clipboard'
import { Tabs, Tab } from 'material-ui/Tabs'
import { Toolbar, ToolbarGroup } from 'material-ui/Toolbar'
import ActionAssessment from 'material-ui/svg-icons/action/assessment'
import ActionList from 'material-ui/svg-icons/action/list'
import ActionShowChart from 'material-ui/svg-icons/editor/show-chart'
import CopyContent from 'material-ui/svg-icons/content/content-copy'
import Paper from 'material-ui/Paper'
import PropTypes from 'prop-types'
import React, { Component } from 'react'
import Search from 'material-ui/svg-icons/action/search'
import Snackbar from 'material-ui/Snackbar'
import ElementListWrapper from '../../Elements/elementListWrapper'
import BigNumber from 'bignumber.js';
import { formatCoins, formatEth, } from '../../_utils/format'
import ElementFundActions from '../Elements/elementFundActions'
import IdentityIcon from '../../_atomic/atoms/identityIcon'
import InfoTable from '../../Elements/elementInfoTable'
import Loading from '../../_atomic/atoms/loading'
import PoolApi from '../../PoolsApi/src'
import ElementListTransactions from '../Elements/elementListTransactions'
import Sticky from 'react-stickynode'
import scrollToComponent from 'react-scroll-to-component'
import SectionTitle from '../../_atomic/atoms/sectionTitle'
import SectionHeader from '../../_atomic/atoms/sectionHeader'
import styles from './pageFundDetailsDragoTrader.module.css';
import ElementPriceBox from '../Elements/elementPricesBox'
import utils from '../../_utils/utils'
import ElementFundNotFound from '../../Elements/elementFundNotFound'
import { connect } from 'react-redux';
import ElementListAssets from '../Elements/elementListAssets';
import { ENDPOINTS, ERC20_TOKENS, PROD } from '../../_utils/const';
import Web3 from 'web3';
import {
  UPDATE_SELECTED_DRAGO_MANAGER,
  FETCH_ASSETS_PRICE_DATA
} from '../../_utils/const'

function mapStateToProps(state) {
  return state
}

class PageFundDetailsDragoTrader extends Component {

  // Checking the type of the context variable that we receive by the parent
  static contextTypes = {
    api: PropTypes.object.isRequired,
  };

  static propTypes = {
    location: PropTypes.object.isRequired,
    endpoint: PropTypes.object.isRequired,
    accounts: PropTypes.array.isRequired,
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
      addresssOwner: null,
      addressGroup: null,
    },
    dragoTransactionsLogs: [],
    loading: true,
    snackBar: false,
    snackBarMsg: '',
    openBuySellDialog: {
      open: false,
      action: 'buy'
    },
    balanceETH: new BigNumber(0).toFormat(4),
    balanceDRG: new BigNumber(0).toFormat(4),
  }

  updateSelectedDragoAction = (results) => {
    return {
      type: UPDATE_SELECTED_DRAGO_MANAGER,
      payload: results
    }
  }

  getAssetsPriceData = (assets) => {
    console.log(assets)
    const { networkInfo } = this.props.endpoint
    const quoteToken = ERC20_TOKENS[networkInfo.name].WETH.address
    return {
      type: FETCH_ASSETS_PRICE_DATA,
      payload: {
        assets,
        networkId: networkInfo.id,
        quoteToken
      }
    }
  }

  subTitle = (account) => {
    return (
      account.address
    )
  }

  componentWillMount() {
    // Getting dragoid from the url parameters passed by router and then
    // the list of last transactions
    const dragoId = this.props.match.params.dragoid
    this.getDragoDetails(dragoId)
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

  componentWillReceiveProps(nextProps) {
    // Updating the lists on each new block if the accounts balances have changed
    // Doing this this to improve performances by avoiding useless re-rendering
    const dragoId = this.props.match.params.dragoid
    const sourceLogClass = this.constructor.name
    const currentBalance = new BigNumber(this.props.endpoint.ethBalance)
    const nextBalance = new BigNumber(nextProps.endpoint.ethBalance)
    if (!currentBalance.eq(nextBalance)) {
      this.getDragoDetails(dragoId)
      console.log(`${sourceLogClass} -> componentWillReceiveProps -> Accounts have changed.`);
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

  componentDidUpdate() {
  }

  renderAddress(dragoDetails) {
    if (!dragoDetails.address) {
      return <p>empty</p>;
    }

    return (
      <Row className={styles.detailsToolbarGroup}>
        {/* <Col xs={12} md={1} className={styles.dragoTitle}>
            <h2 ><IdentityIcon address={ dragoDetails.address } /></h2>
          </Col> */}
        <div className={styles.identityIconContainer}>
          <IdentityIcon
            address={dragoDetails.address}
            size={'60px'}
            customStyle={{ borderStyle: 'solid', borderColor: Colors.grey400 }}
          />
        </div>
        <Col xs={12} className={styles.dragoTitle}>
          <p>{dragoDetails.symbol} | {dragoDetails.name} </p>
          <small>{dragoDetails.address}</small>
        </Col>
      </Row>
    );
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
    console.log(action)
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
    const tableButtonsDragoAddress = [this.renderCopyButton(dragoDetails.address), this.renderEtherscanButton('address', dragoDetails.address)]
    const tableButtonsDragoOwner = [this.renderCopyButton(dragoDetails.addresssOwner), this.renderEtherscanButton('address', dragoDetails.addresssOwner)]
    const tableInfo = [
      ['Created', dragoDetails.created, ''],
      ['Symbol', dragoDetails.symbol, ''],
      ['Name', dragoDetails.name, ''],
      ['Address', dragoDetails.address, tableButtonsDragoAddress],
      ['Manager', dragoDetails.addresssOwner, tableButtonsDragoOwner]
    ]


    // console.log(dragoTransactionsList)
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
    return (
      <Row>
        <Col xs={12}>
          <Paper className={styles.paperContainer} zDepth={1}>
            <Sticky enabled={true} innerZ={1}>
              <Toolbar className={styles.detailsToolbar}>
                <ToolbarGroup className={styles.detailsToolbarGroup}>
                  {this.renderAddress(dragoDetails)}
                </ToolbarGroup>
              </Toolbar>

              <Row className={styles.tabsRow}>
                <Col xs={12}>
                  <Tabs tabItemContainerStyle={tabButtons.tabItemContainerStyle} inkBarStyle={tabButtons.inkBarStyle}>
                    <Tab label="SUMMARY" className={styles.detailsTab}
                      onActive={() => scrollToComponent(this.Summary, { offset: -180, align: 'top', duration: 500 })}
                      icon={<ActionList color={Colors.blue500} />}>
                    </Tab>
                    <Tab label="IN SIGHT" className={styles.detailsTab}
                      onActive={() => scrollToComponent(this.InSight, { offset: -180, align: 'top', duration: 500 })}
                      icon={<ActionAssessment color={Colors.blue500} />}>
                    </Tab>
                    <Tab label="LOGS" className={styles.detailsTab}
                      onActive={() => scrollToComponent(this.Logs, { offset: -180, align: 'top', duration: 500 })}
                      icon={<ActionShowChart color={Colors.blue500} />}>
                    </Tab>
                  </Tabs>
                </Col>
              </Row>
            </Sticky>
            <div className={styles.detailsSectionContainer}>
              <Grid fluid>
                <Row>
                  <Col xs={12} >
                    <span ref={(section) => { this.Summary = section; }}></span>
                    <SectionHeader
                      titleText='SUMMARY'
                      style={{ fontSize: '28px' }} />
                  </Col>
                </Row>
                <Row>
                  <Col xs={12} md={6}>
                    <SectionTitle titleText='DETAILS' />
                    <div className={styles.detailsContent}>
                      <InfoTable rows={tableInfo} columnsStyle={columnsStyle} />
                    </div>
                  </Col>
                  <Col xs={12} md={6}>
                    <div className={styles.myPositionBox}>
                      <Row>
                        <Col xs={12}>
                          <SectionTitle titleText='POSITION' help={true} />
                          <div className={styles.marketSectionContainer}>
                            <div className={styles.marketPriceText}>
                              Your total holding:
                              </div>
                            <div className={styles.holdings}>
                              <span>{this.state.balanceDRG}</span> <small className={styles.myPositionTokenSymbol}>{dragoDetails.symbol.toUpperCase()}</small><br />
                            </div>
                          </div>
                        </Col>
                        <Col xs={12}>
                          <SectionTitle titleText='MARKET' help={true} />
                          <div className={styles.marketSectionContainer}>
                            <Row>
                              <Col xs={6}>
                                <div className={styles.marketPriceText}>
                                  Estimated price:
                              </div>

                              </Col>
                              <Col xs={6} style={{ textAlign: 'center' }}>
                                0.0000 <small>ETH</small>
                              </Col>
                            </Row>
                            <Row>
                              <Col xs={12}>
                                <div className={styles.marketPriceText} style={{ paddingTop: '5px' }}>
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
                            <ElementFundActions
                              dragoDetails={dragoDetails}
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
                  <span ref={(section) => { this.InSight = section; }}></span>
                  <SectionHeader
                    titleText='IN SIGHT'
                    style={{ fontSize: '28px' }} />
                </Col>
              </Row>
              <Row>
                <Col xs={12} className={styles.detailsTabContent}>
                  <SectionTitle titleText='ASSETS' />
                  <div className={styles.detailsTabContent}>
                    <p>Fund portfolio of assets.</p>
                  </div>
                  <ElementListWrapper
                    list={dragoAssetsList}
                    renderCopyButton={this.renderCopyButton}
                    renderEtherscanButton={this.renderEtherscanButton}
                    dragoDetails={dragoDetails}
                    loading={loading}
                    assetPrices={this.props.exchange.prices}
                    assetsChart={assetsCharts}
                  >
                    <ElementListAssets />
                  </ElementListWrapper>
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
        const dragoId = this.props.match.params.dragoid
        var sourceLogClass = this.constructor.name
        console.log(`${sourceLogClass} -> New contract event.`);
        console.log(events)
        this.getDragoDetails(dragoId)
      }
    })
    this.setState({
      contractSubscription: subscription
    })
  }

  // Getting the drago details from dragoId
  getDragoDetails = async (dragoId) => {
    const { api } = this.context
    const { accounts } = this.props
    var balanceDRG = new BigNumber(0)
    //
    // Initializing Drago API
    // Passing Parity API
    //      
    const poolApi = new PoolApi(api)

    //
    // Initializing registry contract
    //
    await poolApi.contract.dragoregistry.init()

    //
    // Looking for drago from dragoId
    //
    const dragoDetails = await poolApi.contract.dragoregistry.fromId(dragoId)
    const dragoAddress = dragoDetails[0][0]
    //
    // Getting last transactions
    //
    await poolApi.contract.dragoeventful.init()
    this.subscribeToEvents(poolApi.contract.dragoeventful)
    this.getTransactions(dragoAddress, poolApi.contract.dragoeventful, accounts)

    //
    // Initializing drago contract
    //
    await poolApi.contract.drago.init(dragoAddress)

    //
    // Getting Drago assets
    //
    const getTokensBalances = async () => {
      var dragoAssets = ERC20_TOKENS[api._rb.network.name]
      for (var token in dragoAssets) {
        dragoAssets[token].balance = await poolApi.contract.drago.getTokenBalance(ERC20_TOKENS[api._rb.network.name][token].address)
      }

      return dragoAssets
    }

    getTokensBalances().then(dragoAssets => {
      this.props.dispatch(this.getAssetsPriceData(dragoAssets))
      this.props.dispatch(this.updateSelectedDragoAction({ assets: Object.values(dragoAssets) }))
    })

    //
    // Calling getData method
    //
    const data = await poolApi.contract.drago.getData()

    const getDragoCreationDate = async (dragoAddress, contract) => {
      const hexDragoAddress = '0x' + dragoDetails[0][0].substr(2).padStart(64, '0')
      const eventsFilterCreate = {
        topics: [
          [contract.hexSignature.DragoCreated],
          [hexDragoAddress],
          null,
          null
        ]
      }
      const dragoCreatedLog = await contract.getAllLogs(eventsFilterCreate)
      const blockInfo = await api.eth.getBlockByNumber((dragoCreatedLog[0].blockNumber.toFixed(0)))
      return utils.dateFromTimeStampHuman(blockInfo.timestamp)
    }

    const dragoCreatedDate = await getDragoCreationDate(dragoAddress, poolApi.contract.dragoeventful)


    this.props.dispatch(this.updateSelectedDragoAction({
      details: {
        address: dragoDetails[0][0],
        name: dragoDetails[0][1].charAt(0).toUpperCase() + dragoDetails[0][1].slice(1),
        symbol: dragoDetails[0][2],
        dragoId: dragoDetails[0][3].c[0],
        addresssOwner: dragoDetails[0][4],
        addressGroup: dragoDetails[0][5],
        sellPrice: api.util.fromWei(data[2].toNumber(4)).toFormat(4),
        buyPrice: api.util.fromWei(data[3].toNumber(4)).toFormat(4),
        created: dragoCreatedDate
        // dragoETHBalance: formatEth(dragoETHBalance, 4, api),
        // dragoWETHBalance: formatEth(dragoWETHBalance, 4, api)
      }
    })
    )

    //
    // Getting balance for each user account
    //
    accounts.map(account => {
      poolApi.contract.drago.balanceOf(account.address)
        .then(balance => {
          balanceDRG = balanceDRG.add(balance)
        })
        .then(() => {
          var balanceETH = balanceDRG.times(formatCoins(balanceDRG, 4, api))
          this.setState({
            balanceETH: formatEth(balanceETH, 4, api),
            balanceDRG: formatCoins(balanceDRG, 4, api)
          })
        })
    })

    this.setState({
      loading: false
    })

  }

  // Getting last transactions
  getTransactions = (dragoAddress, contract, accounts) => {
    const { api } = this.context
    var sourceLogClass = this.constructor.name
    const logToEvent = (log) => {
      const key = api.util.sha3(JSON.stringify(log))
      const { blockNumber, logIndex, transactionHash, transactionIndex, params, type } = log
      var ethvalue = (log.event === 'BuyDrago') ? formatEth(params.amount.value, null, api) : formatEth(params.revenue.value, null, api);
      var drgvalue = (log.event === 'SellDrago') ? formatCoins(params.amount.value, null, api) : formatCoins(params.revenue.value, null, api);
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
        [contract.hexSignature.BuyDrago],
        [hexDragoAddress],
        hexAccounts,
        null
      ]
    }
    const eventsFilterSell = {
      topics: [
        [contract.hexSignature.SellDrago],
        [hexDragoAddress],
        hexAccounts,
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
          this.props.dispatch(this.updateSelectedDragoAction({ transactions: results }))
          console.log(`${sourceLogClass} -> Transactions list loaded`);
          this.setState({
            loading: false,
          })
        })
      })
  }

}
export default withRouter(connect(mapStateToProps)(PageFundDetailsDragoTrader))