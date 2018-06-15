import * as Colors from 'material-ui/styles/colors'
import BigNumber from 'bignumber.js';
import Paper from 'material-ui/Paper';
import Snackbar from 'material-ui/Snackbar';
import ActionAssessment from 'material-ui/svg-icons/action/assessment';
import ActionList from 'material-ui/svg-icons/action/list';
import Search from 'material-ui/svg-icons/action/search';
import CopyContent from 'material-ui/svg-icons/content/content-copy';
import ActionShowChart from 'material-ui/svg-icons/editor/show-chart';
import { Tab, Tabs } from 'material-ui/Tabs';
import { Toolbar, ToolbarGroup } from 'material-ui/Toolbar';
import PropTypes from 'prop-types';
import React, { Component } from 'react';
import { CopyToClipboard } from 'react-copy-to-clipboard';
import { Col, Grid, Row } from 'react-flexbox-grid';
import { connect } from 'react-redux';
import { Link, withRouter } from 'react-router-dom';
import scrollToComponent from 'react-scroll-to-component';
import Sticky from 'react-stickynode';
import ElementFundNotFound from '../../Elements/elementFundNotFound';
import InfoTable from '../../Elements/elementInfoTable';
import ElementListWrapper from '../../Elements/elementListWrapper';
import PoolApi from '../../PoolsApi/src'
import Loading from '../../_atomic/atoms/loading';
import SectionHeader from '../../_atomic/atoms/sectionHeader';
import SectionTitle from '../../_atomic/atoms/sectionTitle';
import { formatCoins, formatEth } from '../../_utils/format';
import utils from '../../_utils/utils';
import ElementFeesBox from '../Elements/elementFeesBox';
import ElementListTransactions from '../Elements/elementListTransactions';
import ElementVaultActions from '../Elements/elementVaultActions';
import styles from './pageVaultDetailsVaultTrader.module.css';
import FundHeader from '../../_atomic/atoms/fundHeader'

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
    user: PropTypes.object.isRequired
  };

  state = {
    vaultDetails: {
      address: null,
      name: null,
      symbol: null,
      vaultId: null,
      addresssOwner: null,
      addressGroup: null,
    },
    vaultTransactionsLogs: [],
    loading: true,
    snackBar: false,
    snackBarMsg: '',
    openBuySellDialog: {
      open: false,
      action: 'deposit'
    },
    balanceDRG: new BigNumber(0).toFormat(4),
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
    await poolApi.contract.dragoeventful.init()
    this.subscribeToEvents(poolApi.contract.dragoeventful)
  }

  componentWillMount() {
    // Getting dragoid from the url parameters passed by router and then
    // the list of last transactions
    const vaultId = this.props.match.params.dragoid
    this.getVaultDetails(vaultId)
  }

  componentWillReceiveProps(nextProps) {
    // Updating the lists on each new block if the accounts balances have changed
    // Doing this this to improve performances by avoiding useless re-rendering
    console.log(this.props)
    const vaultId = this.props.match.params.dragoid
    const sourceLogClass = this.constructor.name
    const currentBalance = new BigNumber(this.props.endpoint.ethBalance)
    const nextBalance = new BigNumber(nextProps.endpoint.ethBalance)
    if (!currentBalance.eq(nextBalance)) {
      this.getVaultDetails(vaultId)
      console.log(`${sourceLogClass} -> componentWillReceiveProps -> Accounts have changed.`);
    } else {
      null
    }
  }

  shouldComponentUpdate(nextProps, nextState) {
    const sourceLogClass = this.constructor.name
    var stateUpdate = true
    var propsUpdate = true
    const currentBalance = new BigNumber(this.props.endpoint.ethBalance)
    const nextBalance = new BigNumber(nextProps.endpoint.ethBalance)
    stateUpdate = !utils.shallowEqual(this.state, nextState)
    propsUpdate = !currentBalance.eq(nextBalance)
    if (stateUpdate || propsUpdate) {
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
    const { vaultDetails, loading } = this.state
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
    const tableButtonsVaultOwner = [this.renderCopyButton(vaultDetails.addresssOwner), this.renderEtherscanButton('address', vaultDetails.addresssOwner)]
    const tableInfo = [['Symbol', vaultDetails.symbol, ''],
    ['Name', vaultDetails.name, ''],
    ['Address', vaultDetails.address, tableButtonsVaultAddress],
    ['Owner', vaultDetails.addresssOwner, tableButtonsVaultOwner]]
    const paperStyle = {
      marginTop: "10px"
    };
    var dragoTransactionList = this.state.vaultTransactionsLogs
    // console.log(dragoTransactionList)

    // Waiting until getVaultDetails returns the drago details
    if (loading) {
      return (
        <Loading />
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
                        onActive={() => scrollToComponent(this.Summary, { offset: -180, align: 'top', duration: 500 })}
                        icon={<ActionList color={'#607D8B'} />}>
                      </Tab>
                      <Tab label="INSIGHT" className={styles.detailsTab}
                        onActive={() => scrollToComponent(this.InSight, { offset: -180, align: 'top', duration: 500 })}
                        icon={<ActionAssessment color={'#607D8B'} />}>
                      </Tab>
                      <Tab label="LOGS" className={styles.detailsTab}
                        onActive={() => scrollToComponent(this.Logs, { offset: -180, align: 'top', duration: 500 })}
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
                      <span ref={(section) => { this.Summary = section; }}></span>
                      <SectionHeader
                        titleText='SUMMARY'
                        textStyle={{ backgroundColor: Colors.blueGrey500 }}
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
                                <span>{this.state.balanceDRG}</span> <small className={styles.myPositionTokenSymbol}>{vaultDetails.symbol.toUpperCase()}</small><br />
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
                    <span ref={(section) => { this.Logs = section; }}></span>
                    <SectionHeader
                      titleText='LOGS'
                      textStyle={{ backgroundColor: Colors.blueGrey500 }}
                    />
                  </Col>
                </Row>
                <Row>
                  <Col xs={12} className={styles.detailsTabContent}>
                    <SectionTitle titleText='TRANSACTIONS' />
                    <div className={styles.detailsTabContent}>
                      <p>Your last 20 transactions on this Vault.</p>
                    </div>
                    <ElementListWrapper list={dragoTransactionList}
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

  // Getting the vault details from vaultId
  getVaultDetails = (vaultId) => {
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
    poolApi.contract.dragoregistry
      .init()
      .then(() => {
        //
        // Looking for drago from vaultId
        //
        poolApi.contract.dragoregistry
          .fromId(vaultId)
          .then((vaultDetails) => {
            const vaultAddress = vaultDetails[0][0]
            //
            // Initializing vault contract
            //
            console.log(vaultDetails)
            poolApi.contract.vault.init(vaultAddress)
            //
            // Calling getAdminData method
            //
            poolApi.contract.vault.getAdminData()
              .then((data) => {
                //
                // Gettin balance for each account
                //
                accounts.map(account => {
                  poolApi.contract.vault.balanceOf(account.address)
                    .then(balance => {
                      balanceDRG = balanceDRG.add(balance)
                      console.log(balance)
                      // console.log(api.util.fromWei(balance).toFormat(4))
                    })
                    .then(() => {
                      // console.log(api.util.fromWei(balanceDRG.toNumber(4)).toFormat(4))
                      // console.log(balanceDRG)
                      var balanceETH = balanceDRG.times(formatCoins(balanceDRG, 6, api))
                      // console.log(balanceETH)
                      this.setState({
                        balanceETH: formatEth(balanceETH, 6, api),
                        balanceDRG: formatCoins(balanceDRG, 6, api)
                      })
                    })
                })
                const price = (new BigNumber(data[4]).div(100).toFixed(2))
                this.setState({
                  vaultDetails: {
                    address: vaultDetails[0][0],
                    name: vaultDetails[0][1].charAt(0).toUpperCase() + vaultDetails[0][1].slice(1),
                    symbol: vaultDetails[0][2].toUpperCase(),
                    vaultId: vaultDetails[0][3].c[0],
                    addresssOwner: vaultDetails[0][4],
                    addressGroup: vaultDetails[0][5],
                    sellPrice: 1,
                    buyPrice: 1,
                    price: price,
                  },
                  loading: false
                })
              })
            poolApi.contract.vaulteventful.init()
              .then(() => {
                this.getTransactions(vaultDetails[0][0], poolApi.contract.vaulteventful, accounts)
              }
              )
          })
      })
  }

  // Getting last transactions
  getTransactions = (vaultAddress, contract, accounts) => {
    const { api } = this.context
    var sourceLogClass = this.constructor.name
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

    const hexVaultAddress = vaultAddress
    const hexAccounts = accounts.map((account) => {
      const hexAccount = account.address
      return hexAccount
    })
    // const options = {
    //   fromBlock: 0,
    //   toBlock: 'pending',
    // }
    console.log(contract)
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
              console.warn(error)
              log.timestamp = new Date()
              return log
            })
        })
        Promise.all(promises).then((results) => {
          this.setState({
            vaultTransactionsLogs: results,
            loading: false,
          })
        })
          .then(() => {
            console.log(`${sourceLogClass} -> Transactions list loaded`);
            this.setState({
              loading: false,
            })
          })
      })
  }

}

export default withRouter(connect(mapStateToProps)(PageFundDetailsVaultTrader))
