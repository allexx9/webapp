import  * as Colors from 'material-ui/styles/colors';
import { Grid, Row, Col } from 'react-flexbox-grid';
import { Link, Route, withRouter } from 'react-router-dom'
import {Card, CardActions, CardHeader, CardMedia, CardTitle, CardText} from 'material-ui/Card';
import {CopyToClipboard} from 'react-copy-to-clipboard';
import {List, ListItem} from 'material-ui/List';
import {Tabs, Tab} from 'material-ui/Tabs';
import {Toolbar, ToolbarGroup, ToolbarSeparator, ToolbarTitle} from 'material-ui/Toolbar';
import ActionAssessment from 'material-ui/svg-icons/action/assessment';
import ActionList from 'material-ui/svg-icons/action/list';
import Avatar from 'material-ui/Avatar';
import Chip from 'material-ui/Chip';
import CopyContent from 'material-ui/svg-icons/content/content-copy';
import DropDownMenu from 'material-ui/DropDownMenu';
import FlatButton from 'material-ui/FlatButton';
import IconButton from 'material-ui/IconButton';
import IconMenu from 'material-ui/IconMenu';
import Immutable from 'immutable';
import NavigationExpandMoreIcon from 'material-ui/svg-icons/navigation/expand-more';
import Paper from 'material-ui/Paper';
import PropTypes from 'prop-types';
import RaisedButton from 'material-ui/RaisedButton';
import React, { Component } from 'react';
import Search from 'material-ui/svg-icons/action/search';
import Snackbar from 'material-ui/Snackbar';

import { dragoFactoryEventsSignatures } from '../../utils/utils.js'
import { formatCoins, formatEth, formatHash, toHex } from '../../format';
import * as abis from '../../contracts';
import ElementFundActions from './Elements/elementFundActions'
import IdentityIcon from '../../IdentityIcon';
import Loading from '../../Loading';
import InfoTable from './Elements/elementInfoTable'

import {
  Table,
  TableBody,
  TableHeader,
  TableHeaderColumn,
  TableRow,
  TableRowColumn,
} from 'material-ui/Table';
import ElementListTransactions from './Elements/elementListTransactions'
import styles from '../applicationDragoHome.module.css';

class PageFundDetailsDragoTrader extends Component {

  // Checking the type of the context variable that we receive by the parent
  static contextTypes = {
    api: PropTypes.object.isRequired,
    contract: PropTypes.object.isRequired
  };

  static PropTypes = {
      location: PropTypes.object.isRequired,
      blockNumber: PropTypes.object.isRequired,
      ethBalance: PropTypes.object.isRequired,
      accounts: PropTypes.object.isRequired,
      allEvents: PropTypes.object.isRequired,
      accountsInfo: PropTypes.object.isRequired, 
    };

    state = {
      dragoDetails: {
        address: null,
        name: null,
        symbol: null,
        dragoID: null,
        addresssOwner: null,
        addressGroup: null,
      },
      dragoTransactionsLogs: [],
      loading: true,
      snackBar: false,
      snackBarMsg: ''
    }



    subTitle = (account) => {
      return (
        account.address
      )     
    }

    componentDidMount () {
      // Getting dragoid from the url parameters passed by router and then
      // the list of last transactions
      const dragoID = this.props.match.params.dragoid
      this.getDragoDetails(dragoID)
    }

    componentWillReceiveProps () {
      // Updating the accounts information and other lists
      var sourceLogClass = this.constructor.name
      console.log(`${sourceLogClass} -> Updating the transactions list`);
      const dragoID = this.props.match.params.dragoid
      this.getDragoDetails(dragoID)
    }

    renderAddress (dragoDetails) {
      if (!dragoDetails.address ) {
        return <p>empty</p>;
      }
  
      return (
        <Row className={styles.detailsToolbarGroup}>
          <Col xs={12} md={1} className={styles.dragoTitle}>
            <h2 ><IdentityIcon address={ dragoDetails.address } /></h2>
          </Col>
          <Col xs={12} md={11} className={styles.dragoTitle}>
          <p>{dragoDetails.symbol} | {dragoDetails.name} </p>
          <small>{dragoDetails.address}</small>
          </Col>
        </Row>
      );
    }

    snackBar = (msg) =>{
      this.setState({
        snackBar: true,
        snackBarMsg: msg
      })
    }

    renderCopyButton = (text) =>{
      if (!text ) {
        return null;
      }
      
      return (
        <CopyToClipboard text={text}
            onCopy={() => this.snackBar('Copied to clilpboard')}>
            <Link to={'#'} ><CopyContent className={styles.copyAddress}/></Link>
        </CopyToClipboard>
      );
    }

    renderEtherscanButton = (type, text) =>{
      if (!text ) {
        return null;
      }
      
      return (
      <a href={'https://kovan.etherscan.io/'+type+'/' + text} target='_blank'><Search className={styles.copyAddress}/></a>
      );
    }

    handleRequestClose = () => {
      this.setState({
        snackBar: false,
      });
    };

    renderPriceTable (dragoDetails) {  
      const buyText = {
        color: Colors.green300,
      }
  
      const sellText = {
        color: Colors.red300,
      }

      const priceBox = {
        padding: 20,
        textAlign: 'center',
        fontSize: 25,
        fontWeight: 600
      }
    
      return (
        <Paper style={priceBox} zDepth={1}>
          <Row center="xs" style={{padding: 10}}>
            <Col xs={6} style={buyText}>
            BUY
            </Col>
            <Col xs={6}>
            {dragoDetails.buyPrice} ETH
            </Col>
          </Row>
          <Row center="xs">
            <Col xs={6} style={sellText}>
            SELL
            </Col>
            <Col xs={6}>
            {dragoDetails.sellPrice} ETH
            </Col>
          </Row>
        </Paper>
      );
    }

    render() {
      const { location, accounts, accountsInfo, allEvents } = this.props
      const { dragoDetails, dragoTransactionsLogs, loading } = this.state
      const paperContainer = {
        marginTop: 10,
        display: 'inline-block',
      };
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
      const detailsBox = {
        padding: 20,
      }

      const columnsStyle = [styles.detailsTableCell, styles.detailsTableCell2, styles.detailsTableCell3]
      const tableButtons = [this.renderCopyButton(dragoDetails.address), this.renderEtherscanButton('address', dragoDetails.address)]
      const tableTest = [['Symbol', dragoDetails.symbol, ''], 
        ['Name', dragoDetails.name, ''], 
        ['Address', dragoDetails.address, tableButtons],
        ['Owner', dragoDetails.addresssOwner, tableButtons]]
      const paperStyle = {
        textAlign: 'center',
      };
      

      var dragoTransactionList = Immutable.List(this.state.dragoTransactionsLogs)
      // console.log(dragoTransactionList)

      // Waiting until getDragoDetails returns the drago details
      if (loading) {
        return (
          <Loading />
        );
      }
      return (
      <Row>
        <Col xs={12}>
          <Paper className={styles.paperContainer} zDepth={1}>
            <Toolbar className={styles.detailsToolbar}>
              <ToolbarGroup className={styles.detailsToolbarGroup}>
                {this.renderAddress(dragoDetails)}
              </ToolbarGroup>
              <ToolbarGroup>
                <ElementFundActions dragoDetails={dragoDetails} accounts={accounts} snackBar={this.snackBar}/>
              </ToolbarGroup>
            </Toolbar>
            <Tabs tabItemContainerStyle={tabButtons.tabItemContainerStyle} inkBarStyle={tabButtons.inkBarStyle} className={styles.test}>
              <Tab label="Info" className={styles.detailsTab}
                icon={<ActionList color={Colors.blue500} />}>
                <Grid fluid>
                  <Row>
                    <Col xs={6}>
                      <Paper style={detailsBox} zDepth={1}>
                        <InfoTable className={styles.detailsTabContent} rows={tableTest} columnsStyle={columnsStyle}/>
                      </Paper>
                    </Col>
                    <Col xs={6}>
                      {this.renderPriceTable (dragoDetails)} 
                    </Col>
                  </Row>
                  <Row>
                    <Col xs={12} className={styles.detailsTabContent}>
                      <h3>
                        Last transactions
                      </h3>   
                      <p>Your last 20 transactions on this Drago.</p>
                      <Paper style={paperStyle} zDepth={1} >
                        <ElementListTransactions accountsInfo={accountsInfo} list={dragoTransactionList} 
                        renderCopyButton={this.renderCopyButton}
                        renderEtherscanButton={this.renderEtherscanButton}/>
                      </Paper>
                    </Col>
                  </Row>
                </Grid>
              </Tab>
              <Tab label="Stats" className={styles.detailsTab}
                icon={<ActionAssessment color={Colors.blue500} />}>
                <Grid fluid>
                  <Row>
                    <Col xs={12} className={styles.detailsTabContent}>
                      <p>
                        Stats
                      </p>   
                    </Col>
                  </Row>
                </Grid>
              </Tab>
            </Tabs>
          </Paper>
        </Col>
        <Snackbar
          open={this.state.snackBar}
          message={this.state.snackBarMsg}
          action="close"
          onActionTouchTap={this.handleRequestClose}
          onRequestClose={this.handleRequestClose}
        />
      </Row>
      )
    }

    // Getting the drago details from dragoID
    getDragoDetails = (dragoID) => {
      const { api, contract } = this.context
      const {accounts } = this.props
      var sourceLogClass = this.constructor.name
      console.log(this.context)

      api.parity
        .registryAddress()
        .then((registryAddress) => {
          const registry = api.newContract(abis.registry, registryAddress).instance;
          return Promise.all([
              registry.getAddress.call({}, [api.util.sha3('dragoregistry'), 'A'])
          ]);
        })
        .then((address) => {
          console.log(`${sourceLogClass} -> The drago registry was found at ${address}`);
          const dragoRegistry = api.newContract(abis.dragoregistry, address).instance;
          return Promise.all([
              dragoRegistry.drago.call({}, [dragoID])
          ])
          .then((dragoDetails) => {
            console.log(`${sourceLogClass} ->  dragoDetails: ${dragoDetails}`)
            const dragoToken = api.newContract(abis.drago, dragoDetails[0][0]).instance;
            dragoToken.getData.call({})
            .then((dragoPrices) => {
              this.setState({
                dragoDetails: {
                  address: dragoDetails[0][0],
                  name: dragoDetails[0][1],
                  symbol: dragoDetails[0][2],
                  dragoID: dragoDetails[0][3].c[0],
                  addresssOwner: dragoDetails[0][4],
                  addressGroup: dragoDetails[0][5],
                  sellPrice: api.util.fromWei(dragoPrices[2].toNumber(4)).toFormat(4),
                  buyPrice: api.util.fromWei(dragoPrices[3].toNumber(4)).toFormat(4),
                },
                loading: false
              })
            })

            this.getTransactions (dragoDetails[0][0], contract, accounts)
          });
        });
      }  

    // Getting last transactions
    getTransactions = (dragoAddress, contract, accounts) => {
      const { api } = this.context
      var sourceLogClass = this.constructor.name
      const logToEvent = (log) => {
        const key = api.util.sha3(JSON.stringify(log))
        const { blockNumber, logIndex, transactionHash, transactionIndex, params, type } = log   
        var ethvalue = (log.event === 'BuyDrago') ? formatEth(params.amount.value,null,api) : formatEth(params.revenue.value,null,api);
        var drgvalue = (log.event === 'SellDrago') ? formatCoins(params.amount.value,null,api) : formatCoins(params.revenue.value,null,api);
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

      const hexDragoAddress = '0x' + dragoAddress.substr(2).padStart(64,'0')
      const hexAccounts = accounts.map((account) => {
        const hexAccount = '0x' + account.address.substr(2).padStart(64,'0')
        return hexAccount
      })
      const options = {
        fromBlock: 0,
        toBlock: 'pending',
      }
      const eventsFilterBuy = {
        topics: [ 
          [dragoFactoryEventsSignatures(contract).BuyDrago.hexSignature], 
          [hexDragoAddress], 
          hexAccounts,
          null
        ]
      }
      const eventsFilterSell = {
        topics: [ 
          [dragoFactoryEventsSignatures(contract).SellDrago.hexSignature], 
          [hexDragoAddress], 
          null,
          hexAccounts
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
      .then ((dragoTransactionsLog) =>{
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
        })
        Promise.all(promises).then((results) => {
            this.setState({
              dragoTransactionsLogs: results,
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

  export default withRouter(PageFundDetailsDragoTrader)