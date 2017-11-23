import { Grid, Row, Col } from 'react-flexbox-grid';
import { Link, Route, withRouter } from 'react-router-dom'
import {Card, CardActions, CardHeader, CardMedia, CardTitle, CardText} from 'material-ui/Card';
import {CopyToClipboard} from 'react-copy-to-clipboard';
import {List, ListItem} from 'material-ui/List';
import {Toolbar, ToolbarGroup, ToolbarSeparator, ToolbarTitle} from 'material-ui/Toolbar';
import AccountIcon from 'material-ui/svg-icons/action/account-circle';
import Avatar from 'material-ui/Avatar';
import BigNumber from 'bignumber.js';
import Chip from 'material-ui/Chip';
import CopyContent from 'material-ui/svg-icons/content/content-copy';
import DropDownMenu from 'material-ui/DropDownMenu';
import FlatButton from 'material-ui/FlatButton';
import FontIcon from 'material-ui/FontIcon';
import IconButton from 'material-ui/IconButton';
import IconMenu from 'material-ui/IconMenu';
import Immutable from 'immutable';
import MenuItem from 'material-ui/MenuItem';
import MoreVertIcon from 'material-ui/svg-icons/navigation/more-vert';
import Paper from 'material-ui/Paper';
import PropTypes from 'prop-types';
import React, { Component, PureComponent } from 'react';
import Search from 'material-ui/svg-icons/action/search';

import { dragoFactoryEventsSignatures } from '../../utils/utils.js'
import { formatCoins, formatEth, formatHash, toHex } from '../../format';
import * as abis from '../../contracts';
import ElementListBalances from './Elements/elementListBalances'
import ElementListTransactions from './Elements/elementListTransactions'
import ElementTradeBox from './elementTradeBox'
import IdentityIcon from '../../IdentityIcon';
import Loading from '../../Loading';
import utils from '../../utils/utils'

import styles from '../applicationDragoHome.module.css';

class PageDashboardDragoTrader extends Component {

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
      dragoTransactionsLogs: [],
      dragoBalances:[],
      loading: true,
    }

    componentWillMount() {
      const { api, contract } = this.context
      const {accounts } = this.props
      this.getTransactions (null, contract, accounts)
    }

    // shouldComponentUpdate(nextProps, nextState){
    //   const  sourceLogClass = this.constructor.name
    //   console.log(`${sourceLogClass} -> Received new props`);
    //   const stateUpdate = !utils.shallowEqual(this.state, nextState)
    //   const propsUpdate = (!utils.shallowEqual(this.props.accounts, nextProps.accounts))
    //   console.log(`${sourceLogClass} -> Received new props. Need update: ${sourceLogClass}`);
    //   console.log(stateUpdate || propsUpdate)
    //   return stateUpdate || propsUpdate
    // }

    componentWillReceiveProps() {
      // Updating the lists on each new block
      const { api, contract } = this.context
      const {accounts } = this.props
      const sourceLogClass = this.constructor.name
      console.log(`${sourceLogClass} -> componentWillReceiveProps`);
      this.getTransactions (null, contract, accounts)
    }

    componentDidUpdate(nextProps) {
      // Updating the lists on each new block
      const sourceLogClass = this.constructor.name
      console.log(`${sourceLogClass} -> Updating component with new props`);
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

    subTitle = (account) => {
      return (
        account.address
      )     
    }

    render() {
      const { location, accounts, accountsInfo, allEvents } = this.props
      const { dragoTransactionsLogs, loading, dragoBalances } = this.state 
      console.log(Immutable.List(dragoTransactionsLogs))
      console.log(Immutable.List(dragoBalances))
      const listAccounts = accounts.map((account) => {
        const { api } = this.context;
        return (
          <Row key={account.address} between="xs">
            <Col xs={12}>
              <Card>
                <Row between="xs">
                  <Col xs >
                    <CardHeader
                      title={account.name}
                      subtitle={this.subTitle(account)}
                      subtitleStyle={{fontSize: 12}}
                      avatar={<IdentityIcon address={ account.address } />}
                    />
                    <CardText>
                      ETH { account.ethBalance }
                    </CardText>
                  </Col>
                    <Col xs >
                      <Chip className={styles.accountChip}>
                      <Avatar size={32}>W</Avatar>
                        {account.source}
                      </Chip>
                    </Col>
                </Row>
              </Card>
            </Col>
          </Row>
          )
        }
      );

      return (
      <Row>
        <Col xs={12}>
          <Row>
            <Col xs={6}>
                <Row>
                  <Col className={styles.transactionsStyle} xs={12}>
                    <h2>Accounts</h2>
                    {listAccounts}
                  </Col>
                </Row>
                <Row style={{outline: 'none'}}>
                  <Col xs={12} style={{outline: 'none'}}>
                    <h2>My Transactions</h2>
                    <Paper zDepth={1}>
                      <Row style={{outline: 'none'}}>
                        <Col className={styles.transactionsStyle} xs={12}>
                            {(Immutable.List(dragoTransactionsLogs).size == 0) 
                              ? <Loading /> 
                              : <ElementListTransactions list={Immutable.List(dragoTransactionsLogs)}
                              renderCopyButton={this.renderCopyButton}
                              renderEtherscanButton={this.renderEtherscanButton}/>}
                        </Col>
                      </Row>
                    </Paper>
                  </Col>
                </Row>
            </Col>
            <Col xs={6}>
            <Row>
              <Col className={styles.transactionsStyle} xs={12}>
                <h2>My Dragos</h2>
                <Paper zDepth={1}>
                  <Row>
                    <Col className={styles.transactionsStyle} xs={12}>
                      {(Immutable.List(dragoBalances).size == 0) 
                                ? <Loading /> 
                                : <ElementListBalances list={Immutable.List(dragoBalances)}/>}
                    </Col>
                  </Row>
                </Paper>
              </Col>
            </Row>
            </Col>
          </Row>
        </Col>
      </Row>
      )
    }

    // Getting the drago details from dragoID
    getDragoDetails = (dragoID) => {
      const { api, contract } = this.context
      const {accounts } = this.props
      var sourceLogClass = this.constructor.name

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
            this.setState({
              dragoDetails: {
                address: dragoDetails[0][0],
                name: dragoDetails[0][1],
                symbol: dragoDetails[0][2],
                dragoID: dragoDetails[0][3].c[0],
                addresssOwner: dragoDetails[0][4],
                addressGroup: dragoDetails[0][5]
              },
              loading: false
            })
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
        const ethvalue = (log.event === 'BuyDrago') ? formatEth(params.amount.value,null,api) : formatEth(params.revenue.value,null,api);
        const drgvalue = (log.event === 'SellDrago') ? formatCoins(params.amount.value,null,api) : formatCoins(params.revenue.value,null,api);
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

      // const hexDragoAddress = '0x' + dragoAddress.substr(2).padStart(64,'0')
      const hexAccounts = accounts.map((account) => {
        const hexAccount = '0x' + account.address.substr(2).padStart(64,'0')
        return hexAccount
      })

      // Filter for buy events
      const eventsFilterBuy = {
        topics: [ 
          [dragoFactoryEventsSignatures(contract).BuyDrago.hexSignature], 
          null, 
          hexAccounts,
          null
        ]
      }
      // Filter for sell events
      const eventsFilterSell = {
        topics: [ 
          [dragoFactoryEventsSignatures(contract).SellDrago.hexSignature], 
          null, 
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
          console.log(dragoTransactionsLog)
          return sellLogs
        }
        )
      const dragoRegistry = api.parity
        .registryAddress()
        .then((registryAddress) => {
          const registry = api.newContract(abis.registry, registryAddress).instance;
          return Promise.all([
              registry.getAddress.call({}, [api.util.sha3('dragoregistry'), 'A'])
          ]);
        })
        .then((address) => {
          console.log(`${sourceLogClass} -> The drago registry was found at ${address}`);
          return api.newContract(abis.dragoregistry, address).instance
        });
      Promise.all([buyDragoEvents, sellDragoEvents, dragoRegistry])
      .then ((results) =>{
        // Creating an array of promises that will be executed to add timestamp and symbol to each entry
        // Doing so because for each entry we need to make an async call to the client
        // For additional refernce: https://stackoverflow.com/questions/39452083/using-promise-function-inside-javascript-array-map
        var dragoTransactionsLog = [...results[0], ...results[1]]
        const dragoRegistryInstance = results[2]
        var dragoBalances = [] 
        const promisesTimestamp = dragoTransactionsLog.map((log) => {
          return api.eth
          .getBlockByNumber(log.blockNumber.c[0])
          .then((block) => {
            log.timestamp = block.timestamp
            return log
          })
        })
        const promisesSymbol = dragoTransactionsLog.map((log) => {
          return Promise.all([
            dragoRegistryInstance.fromAddress.call({}, [log.params.drago.value])
          ])
          .then((dragoDetails) => {
            // console.log(`${sourceLogClass} ->  dragoDetails Symbol: ${dragoDetails[0][2]}`)
            const symbol = dragoDetails[0][2]
            const dragoID = dragoDetails[0][3].c[0]
            var amount = () => {
              if (log.type === 'BuyDrago') {
                return new BigNumber(log.params.revenue.value)
              } else {
                return new BigNumber(-log.params.amount.value)
              } 
            }
            if (typeof dragoBalances[dragoID] !== 'undefined') {
              var balance = dragoBalances[dragoID].balance.add(amount())
            } else {
              var balance = amount()
            }
            dragoBalances[dragoID] = {
              balance: balance,
              symbol: dragoDetails[0][2],
              dragoID: dragoID
            }
            log.symbol = symbol
            return log
          });
        })

        // Running all promises
        Promise.all(promisesTimestamp)
        .then((results) => {
            this.setState({
              dragoTransactionsLogs: results,
            })
        })
        .then (()=>{
          Promise.all(promisesSymbol)
          .then((results) => {
            var balances = [];
            console.log(`${sourceLogClass} -> Transactions list loaded`);
            // Reorganizing the balances array
            for(var v in dragoBalances) {
              var balance = {
                symbol: dragoBalances[v].symbol,
                dragoID: dragoBalances[v].dragoID,
                balance: formatCoins(dragoBalances[v].balance,4,api)
              }
              balances.push(balance)
            }
            this.setState({
              dragoBalances: balances,
              dragoTransactionsLogs: results,
            }, this.setState({
              loading: false,
            }))

          })
        })
      })
    }
  }

  export default withRouter(PageDashboardDragoTrader)