import  * as Colors from 'material-ui/styles/colors'
import { Grid, Row, Col } from 'react-flexbox-grid'
import { Link, Route, withRouter } from 'react-router-dom'
import { spacing } from 'material-ui/styles'
import {Card, CardActions, CardHeader, CardMedia, CardTitle, CardText} from 'material-ui/Card'
import {CopyToClipboard} from 'react-copy-to-clipboard'
import {List, ListItem} from 'material-ui/List'
import {scroller} from 'react-scroll'; //Imports scroller mixin, can use as scroller.scrollTo()
import {Tabs, Tab} from 'material-ui/Tabs'
import {Toolbar, ToolbarGroup, ToolbarSeparator, ToolbarTitle} from 'material-ui/Toolbar'
import AccountIcon from 'material-ui/svg-icons/action/account-circle'
import ActionAssessment from 'material-ui/svg-icons/action/assessment'
import ActionHome from 'material-ui/svg-icons/action/home'
import ActionList from 'material-ui/svg-icons/action/list'
import ActionShowChart from 'material-ui/svg-icons/editor/show-chart'
import AppBar from 'material-ui/AppBar'
import Avatar from 'material-ui/Avatar'
import BigNumber from 'bignumber.js'
import Chip from 'material-ui/Chip'
import CopyContent from 'material-ui/svg-icons/content/content-copy'
import DropDownMenu from 'material-ui/DropDownMenu'
import FileFolder from 'material-ui/svg-icons/file/folder'
import FlatButton from 'material-ui/FlatButton'
import FontIcon from 'material-ui/FontIcon'
import IconButton from 'material-ui/IconButton'
import IconMenu from 'material-ui/IconMenu'
import Immutable from 'immutable'
import MenuItem from 'material-ui/MenuItem'
import MoreVertIcon from 'material-ui/svg-icons/navigation/more-vert'
import Paper from 'material-ui/Paper'
import PropTypes from 'prop-types';
import React, { Component, PureComponent } from 'react'
import ReactDOM from 'react-dom'
import scrollToComponent from 'react-scroll-to-component'
import Search from 'material-ui/svg-icons/action/search'
import Snackbar from 'material-ui/Snackbar'
import Sticky from 'react-stickynode'

import { dragoFactoryEventsSignatures } from '../../utils/utils.js'
import { formatCoins, formatEth, formatHash, toHex } from '../../format'
import * as abis from '../../contracts';
import DragoApi from '../../DragoApi/src'
import ElementListBalances from '../Elements/elementListBalances'
import ElementListTransactions from '../Elements/elementListTransactions'
import IdentityIcon from '../../IdentityIcon';
import Loading from '../../Loading'
import utils from '../../utils/utils'

import styles from './pageDashboardDragoTrader.module.css'

// let ScrollLink       = Scroll.Link;
// let Element    = Scroll.Element;
// let Events     = Scroll.Events;
// let scroll     = Scroll.animateScroll;
// let scrollSpy  = Scroll.scrollSpy;

class PageDashboardDragoTrader extends Component {

  // Checking the type of the context variable that we receive by the parent
  static contextTypes = {
    api: PropTypes.object.isRequired,
    contract: PropTypes.object.isRequired
  };

  static propTypes = {
      location: PropTypes.object.isRequired,
      ethBalance: PropTypes.object.isRequired,
      accounts: PropTypes.array.isRequired,
      accountsInfo: PropTypes.object.isRequired, 
      ethBalance: PropTypes.object.isRequired,
    };

    state = {
      dragoTransactionsLogs: [],
      dragoBalances:[],
      loading: true,
      topBarClassName: null,
      topBarInitialPosition: null,
      topBarLinksPosition: null,
      snackBar: false,
      snackBarMsg: ''
    }


    componentDidMount() {
    }

    componentWillUnmount() {
      // window.removeEventListener('scroll', this.handleTopBarPosition);
    }

    componentWillMount() {
      const { api, contract } = this.context
      const {accounts } = this.props
      this.getTransactions (null, accounts)
    }

    snackBar = (msg) =>{
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

    scrollToTop() {
      scroller.scrollToTop();
    }

    scrollToBottom() {
      scroller.scrollToBottom();
    }

    scrollTo() {
      scroller.scrollTo(100);
    }

    scrollMore() {
      scroller.scrollMore(100);
    }

    handleSetActive = (to) => {
      console.log(to);
    }

    shouldComponentUpdate(nextProps, nextState){
      const  sourceLogClass = this.constructor.name
      var stateUpdate = true
      var propsUpdate = true
      console.log(`${sourceLogClass} -> Received new props`);
      console.log(nextProps.ethBalance.toFormat())
      console.log(this.props.ethBalance.toFormat())
      // stateUpdate = !utils.shallowEqual(this.state, nextState)
      propsUpdate = !this.props.ethBalance.eq(nextProps.ethBalance)
      // propsUpdate = (!utils.shallowEqual(this.props.accounts, nextProps.accounts))
      console.log(`${sourceLogClass} -> Received new props. Need update: ${sourceLogClass}`);
      console.log(stateUpdate || propsUpdate)
      return stateUpdate || propsUpdate
    }

    componentWillReceiveProps(nextProps) {
      // Updating the lists on each new block
      const { api, contract } = this.context
      const {accounts } = this.props
      const sourceLogClass = this.constructor.name
      console.log(`${sourceLogClass} -> componentWillReceiveProps`);
      (!utils.shallowEqual(this.props.accounts, nextProps.accounts)) ? this.getTransactions (null, accounts) : null
      console.log(this.props.accounts)
      console.log(nextProps.accounts)
      // this.getTransactions (null, accounts)
    }

    componentDidUpdate(nextProps) {
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
        const { api } = this.context;
        return (
            <Col xs={6} key={account.name}>
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
          )
        }
      );
      return (
        
      <Row>
        <Col xs={12}>
          <Paper className={styles.paperContainer} zDepth={1}>
            <Toolbar className={styles.detailsToolbar}>
                <ToolbarGroup className={styles.detailsToolbarGroup}>
                  <Row className={styles.detailsToolbarGroup}>
                    <Col xs={12} md={1} className={styles.dragoTitle}>
                      <h2><Avatar size={50} icon={<ActionHome />} /></h2>
                    </Col>
                    <Col xs={12} md={11} className={styles.dragoTitle}>
                    <p>Dashboard</p>
                    <small></small>
                    </Col>
                  </Row>
                </ToolbarGroup> 
                <ToolbarGroup>
                <p>&nbsp;</p>
                </ToolbarGroup>
            </Toolbar>
            <Sticky enabled={true} innerZ={1}>
              <Row className={styles.tabsRow}>
                <Col xs={12}>
                  <Tabs tabItemContainerStyle={tabButtons.tabItemContainerStyle} inkBarStyle={tabButtons.inkBarStyle}>
                    <Tab label="Accounts" className={styles.detailsTab}
                    onActive={() => scrollToComponent(this.Accounts, { offset: -80, align: 'top', duration: 500})}
                      icon={<ActionList color={Colors.blue500} />}>
                    </Tab>
                    <Tab label="Holding" className={styles.detailsTab} 
                      onActive={() => scrollToComponent(this.Dragos, { offset: -80, align: 'top', duration: 500})}
                      icon={<ActionAssessment color={Colors.blue500} />}>
                    </Tab>
                    <Tab label="Transactions" className={styles.detailsTab}
                    onActive={() => scrollToComponent(this.Transactions, { offset: -80, align: 'top', duration: 500})}
                      icon={<ActionShowChart color={Colors.blue500} />}>
                    </Tab>
                  </Tabs>
                </Col>
              </Row>
            </Sticky>
            <Row className={styles.transactionsStyle}>
              <Col xs>
                <span ref={(section) => { this.Accounts = section; }}></span>
                <AppBar
                    title='My Accounts'
                    showMenuIconButton={false}
                    className={styles.appBar}
                  />
                  <Row between="xs">
                    {listAccounts}
                  </Row>
              </Col>
            </Row>
            <Row className={styles.transactionsStyle}>
              <Col  xs >
                  <span ref={(section) => { this.Dragos = section; }}></span>
                  <AppBar className={styles.appBar}
                      title='My Dragos'
                      showMenuIconButton={false}
                    />
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
            <Row className={styles.transactionsStyle}>
              <Col xs>
                  <span ref={(section) => { this.Transactions = section; }}></span>
                  <AppBar
                  title='My Transactions'
                  showMenuIconButton={false}
                  />
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
          </Paper>
        </Col>
        <Snackbar
          open={this.state.snackBar}
          message={this.state.snackBarMsg}
          action="close"
          onActionTouchTap={this.handlesnackBarRequestClose}
          onRequestClose={this.handlesnackBarRequestClose}
        />
      </Row>  
      )
    }

    // Getting the drago details from dragoID
    getDragoDetails = (dragoID) => {
      const { api, contract } = this.context
      const {accounts } = this.props
      var sourceLogClass = this.constructor.name 
      const dragoApi = new DragoApi(api)
      console.log(contract)
      dragoApi.contract.dragoregistry.instance()
        .then(() =>{
          dragoApi.contract.dragoregistry.drago(dragoID)
          .then((dragoDetails) => {
            const dragoAddress = dragoDetails[0][0]
            dragoApi.contract.drago.instance(dragoAddress)
            dragoApi.contract.drago.getData()
            .then((data) =>{
              this.setState({
                dragoDetails: {
                  address: dragoDetails[0][0],
                  name: dragoDetails[0][1],
                  symbol: dragoDetails[0][2],
                  dragoID: dragoDetails[0][3].c[0],
                  addresssOwner: dragoDetails[0][4],
                  addressGroup: dragoDetails[0][5],
                  sellPrice: api.util.fromWei(data[2].toNumber(4)).toFormat(4),
                  buyPrice: api.util.fromWei(data[3].toNumber(4)).toFormat(4),
                },
                loading: false
              })
            })
            this.getTransactions(dragoDetails[0][0], accounts)
          })
        })
    } 

    // Getting last transactions
    getTransactions = (dragoAddress, accounts) =>{
      const { api } = this.context
      console.log('getTransactions')
      utils.getTransactionsDrago(api, dragoAddress, accounts)
      .then(results =>{
        console.log(results[1])
        const buySellLogs = results[1].filter(event =>{
          return event.type !== 'DragoCreated'
        })
        this.setState({
          dragoBalances: results[0],
          dragoTransactionsLogs: buySellLogs,
        }, this.setState({
          loading: false,
        }))
      })
    }
  }

  export default withRouter(PageDashboardDragoTrader)