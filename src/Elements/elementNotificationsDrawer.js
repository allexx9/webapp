import {List} from 'material-ui/List';
import Drawer from 'material-ui/Drawer'
import PropTypes from 'prop-types';
import React, { Component } from 'react';
import ElementNotification from './elementNotification'
import { Row, Col } from 'react-flexbox-grid'
import AppBar from 'material-ui/AppBar';
import classNames from 'classnames'
import utils from '../_utils/utils'
import { connect } from 'react-redux';
import styles from './elementNotificationsDrawer.module.css';

var timerId = null;

function mapStateToProps(state) {
  console.log(state)
  return {
    recentTransactions: state.transactions.queue
  };
}

class ElementNotificationsDrawer extends Component {

  static propTypes = {
    handleToggleNotifications: PropTypes.func.isRequired,
    notificationsOpen: PropTypes.bool.isRequired,
    dispatch: PropTypes.func.isRequired, 
    recentTransactions: PropTypes.object.isRequired,
  };

  static contextTypes = {
    api: PropTypes.object.isRequired,
    isConnected: PropTypes.bool.isRequired, 
  };

  state = {
    notificationsOpen: false,
    subscriptionIDContractDrago: [],
    contract: null
  }

  // Redux actions
  updateTransactionsQueueAction = (newRecentTransactions) => {
    return {
      type: 'UPDATE_TRANSACTIONS',
      transactions: newRecentTransactions
    }
  };

  shouldComponentUpdate(nextProps, nextState){    
    var stateUpdate = true
    var propsUpdate = true
    // shouldComponentUpdate returns false if no need to update children, true if needed.
    // propsUpdate = (!utils.shallowEqual(this.props, nextProps))
    // stateUpdate = (!utils.shallowEqual(this.state, nextState))
    return stateUpdate || propsUpdate 
  }

  componentWillReceiveProps() {
    // console.log(nextProps.recentTransactions)
    // if (nextProps.notificationsOpen) {
    //   // this.detachInterface()
    // }
  }
  
  componentDidMount() {
    const that = this
    var runTick = () => {
      timerId = setTimeout(function tick() {
        console.log('tick')
        that.updateTransactionsQueue()
        timerId = setTimeout(tick, 2000); // (*)
      }, 2000);
    }
    runTick()
  }

  updateTransactionsQueue = () => {
    // Processing the queue in order to update the transactions status
    const { api } = this.context
    const { recentTransactions } = this.props
    console.log('recentTransactions', recentTransactions)
    const newRecentTransactions = utils.updateTransactionsQueue(api, recentTransactions)
    console.log('newRecentTransactions', newRecentTransactions)
    this.props.dispatch(this.updateTransactionsQueueAction(newRecentTransactions))
  }

  componentWillUnmount () {
    this.detachInterface()
  }

  handleToggleNotifications = () =>{
    // Setting a small timeout to make sure that the state is updated with 
    // the subscription ID before trying to unsubscribe. Otherwise, if an user opens and closes the element very quickly
    // the state would not be updated fast enough and the element could crash
    // setTimeout(this.detachInterface, 3000)
    this.detachInterface()
    this.props.handleToggleNotifications()
  }

  renderPlaceHolder = () =>{
    return (
      <div>
        <div className={classNames(styles.module, styles.post)}>
          <div className={styles.circle}></div>
          <div className={styles.wrapper}>
            <div className={classNames(styles.line, styles.width110)}></div>
            <div className={classNames(styles.line, styles.width250)}></div>
          </div>
        </div>
      </div>
    )
  }

  renderNotifications = () => {
    const eventType = 'transaction'
    var eventStatus = 'executed'
    var primaryText, drgvalue, symbol  = null
    var secondaryText = []
    var timeStamp = ''
    var txHash = ''
    const { recentTransactions } = this.props
    return Array.from(recentTransactions).reverse().map( (transaction) => {
      secondaryText = []
      var value = transaction.pop()
      var key = transaction.pop()
      timeStamp = value.receipt ? utils.dateFromTimeStamp(value.timestamp) : utils.dateFromTimeStamp(value.timestamp)
      txHash = value.hash.length !== 0 ? txHash = value.hash : ''
      // console.log('txHash: ' + txHash)
      // console.log(value)
      switch (value.action) {
        case "BuyDrago":
          drgvalue = value.amount
          symbol = value.symbol
          primaryText = "Buy " + drgvalue + ' ' + symbol
          secondaryText[0] = 'Status: ' + value.status.charAt(0).toUpperCase() + value.status.slice(1)
          secondaryText[1] = timeStamp
          eventStatus = value.status
          break;
        case "SellDrago":
          drgvalue = value.amount
          symbol = value.symbol
          primaryText = "Sell " + drgvalue + ' ' + symbol
          secondaryText[0] = 'Status: ' + value.status.charAt(0).toUpperCase() + value.status.slice(1)
          secondaryText[1] = timeStamp
          eventStatus = value.status
          break;
        case "BuyVault":
          drgvalue = value.amount
          symbol = value.symbol
          primaryText = "Deposit " + drgvalue + ' ETH'
          secondaryText[0] = 'Status: ' + value.status.charAt(0).toUpperCase() + value.status.slice(1)
          secondaryText[1] = timeStamp
          eventStatus = value.status
        break;
        case "SellVault":
          drgvalue = value.amount
          symbol = value.symbol
          primaryText = "Withdraw " + drgvalue + ' ETH'
          secondaryText[0] = 'Status: ' + value.status.charAt(0).toUpperCase() + value.status.slice(1)
          secondaryText[1] = timeStamp
          eventStatus = value.status
          break;
        case "DragoCreated":
          symbol = value.symbol
          primaryText = "Deploy " + symbol
          secondaryText[0] = 'Status: ' + value.status.charAt(0).toUpperCase() + value.status.slice(1)
          secondaryText[1] = timeStamp
          eventStatus = value.status
          break;
        case "CreateVault":
          symbol = value.symbol
          primaryText = "Deploy " + symbol
          secondaryText[0] = 'Status: ' + value.status.charAt(0).toUpperCase() + value.status.slice(1)
          secondaryText[1] = timeStamp
          eventStatus = value.status
          break;
      }
      return (
        <ElementNotification key={key}
          primaryText={primaryText}
          secondaryText={secondaryText}
          eventType={eventType}
          eventStatus={eventStatus}
          txHash={txHash}
        >
        </ElementNotification>
      )
    })
  }

  render () {
    const { notificationsOpen } = this.props
    console.log('render')
    return (
      <span>
        <Drawer width={300} openSecondary={true}
          open={notificationsOpen} zDepth={1} docked={false}
          classNameName={styles.notifications}
          onRequestChange={this.handleToggleNotifications}
        >
          <AppBar
            title={<span>Network</span>}
            showMenuIconButton={false}
          />
          <Row>
            <Col xs={12}>
              <List>
                {this.renderNotifications()}
              </List>
            </Col>
          </Row>
        </Drawer>
      </span>
    )
  }

  detachInterface = () => {
    console.log('Clear timer ID')
    clearInterval(timerId)
  }  
}

export default connect(mapStateToProps)(ElementNotificationsDrawer)