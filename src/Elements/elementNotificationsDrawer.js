import { Actions } from '../_redux/actions'
import { Col, Row } from 'react-flexbox-grid'
import { List } from 'material-ui/List'
import { connect } from 'react-redux'
// import Drawer from 'material-ui/Drawer'
import ElementNotification from './elementNotification'
import PropTypes from 'prop-types'
import React, { Component } from 'react'
import classNames from 'classnames'
import styles from './elementNotificationsDrawer.module.css'
import utils from '../_utils/utils'

let timerId = null

function mapStateToProps(state) {
  return {
    recentTransactions: state.transactions.queue,
    endpoint: state.endpoint
  }
}

class ElementNotificationsDrawer extends Component {
  static propTypes = {
    notificationsOpen: PropTypes.bool.isRequired,
    dispatch: PropTypes.func.isRequired,
    recentTransactions: PropTypes.object.isRequired,
    endpoint: PropTypes.object.isRequired
  }

  static contextTypes = {
    api: PropTypes.object.isRequired
  }

  state = {
    notificationsOpen: false,
    subscriptionIDContractDrago: [],
    contract: null
  }

  // Redux actions
  updateTransactionsQueueAction = newRecentTransactions => {
    return {
      type: 'UPDATE_TRANSACTIONS',
      transactions: newRecentTransactions
    }
  }

  // shouldComponentUpdate(nextProps, nextState) {
  //   let stateUpdate = true
  //   let propsUpdate = true
  //   // shouldComponentUpdate returns false if no need to update children, true if needed.
  //   // propsUpdate = (!utils.shallowEqual(this.props, nextProps))
  //   // stateUpdate = (!utils.shallowEqual(this.state, nextState))
  //   return stateUpdate || propsUpdate
  // }

  componentDidMount() {
    // const that = this
    // let runTick = () => {
    //   timerId = setTimeout(function tick() {
    //     that.updateTransactionsQueue()
    //     timerId = setTimeout(tick, 2000) // (*)
    //   }, 2000)
    // }
    // runTick()
  }

  removeNotification = noticationKey => {
    const { recentTransactions } = this.props
    const transaction = recentTransactions.get(noticationKey)
    const updatedTransaction = { ...transaction, ...{ deleted: true } }
    recentTransactions.set(noticationKey, updatedTransaction)
    this.props.dispatch(this.updateTransactionsQueueAction(recentTransactions))
  }

  updateTransactionsQueue = () => {
    // Processing the queue in order to update the transactions status
    const { api } = this.context
    const { recentTransactions } = this.props
    const newRecentTransactions = utils.updateTransactionsQueue(
      api,
      recentTransactions
    )
    console.log(newRecentTransactions)
    this.props.dispatch(
      this.updateTransactionsQueueAction(newRecentTransactions)
    )
  }

  componentWillUnmount() {
    this.detachInterface()
  }

  handleToggleNotifications = () => {
    // Setting a small timeout to make sure that the state is updated with
    // the subscription ID before trying to unsubscribe. Otherwise, if an user opens and closes the element very quickly
    // the state would not be updated fast enough and the element could crash
    // setTimeout(this.detachInterface, 3000)
    this.detachInterface()
    this.props.dispatch(
      Actions.app.updateAppStatus({
        transactionsDrawerOpen: false
      })
    )
  }

  renderPlaceHolder = () => {
    return (
      <div>
        <div className={classNames(styles.module, styles.post)}>
          <div className={styles.circle} />
          <div className={styles.wrapper}>
            <div className={classNames(styles.line, styles.width110)} />
            <div className={classNames(styles.line, styles.width250)} />
          </div>
        </div>
      </div>
    )
  }

  renderNotifications = () => {
    const eventType = 'transaction'
    let eventStatus = 'executed'
    let primaryText,
      drgvalue,
      symbol = null
    let secondaryText = []
    let timeStamp = ''
    let txHash = ''
    const { recentTransactions } = this.props
    let transactionsList = Array.from(recentTransactions)
      .reverse()
      .filter(value => {
        return typeof value[1].deleted === 'undefined'
      })
      .map(transaction => {
        secondaryText = []
        let value = transaction.pop()
        let key = transaction.pop()
        timeStamp = value.receipt
          ? utils.dateFromTimeStamp(value.timestamp)
          : utils.dateFromTimeStamp(value.timestamp)
        txHash = value.hash.length !== 0 ? (txHash = value.hash) : ''
        switch (value.action) {
          case 'BuyDrago':
            drgvalue = value.amount
            symbol = value.symbol
            primaryText = 'Buy ' + drgvalue + ' ' + symbol
            secondaryText[0] =
              'Status: ' +
              value.status.charAt(0).toUpperCase() +
              value.status.slice(1)
            secondaryText[1] = timeStamp
            eventStatus = value.status
            break
          case 'SellDrago':
            drgvalue = value.amount
            symbol = value.symbol
            primaryText = 'Sell ' + drgvalue + ' ' + symbol
            secondaryText[0] =
              'Status: ' +
              value.status.charAt(0).toUpperCase() +
              value.status.slice(1)
            secondaryText[1] = timeStamp
            eventStatus = value.status
            break
          case 'BuyVault':
            drgvalue = value.amount
            symbol = value.symbol
            primaryText = 'Deposit ' + drgvalue + ' ETH'
            secondaryText[0] =
              'Status: ' +
              value.status.charAt(0).toUpperCase() +
              value.status.slice(1)
            secondaryText[1] = timeStamp
            eventStatus = value.status
            break
          case 'SellVault':
            drgvalue = value.amount
            symbol = value.symbol
            primaryText = 'Withdraw ' + drgvalue + ' ETH'
            secondaryText[0] =
              'Status: ' +
              value.status.charAt(0).toUpperCase() +
              value.status.slice(1)
            secondaryText[1] = timeStamp
            eventStatus = value.status
            break
          case 'DragoCreated':
            symbol = value.symbol
            primaryText = 'Deploy ' + symbol
            secondaryText[0] =
              'Status: ' +
              value.status.charAt(0).toUpperCase() +
              value.status.slice(1)
            secondaryText[1] = timeStamp
            eventStatus = value.status
            break
          case 'CreateVault':
            symbol = value.symbol
            primaryText = 'Deploy ' + symbol
            secondaryText[0] =
              'Status: ' +
              value.status.charAt(0).toUpperCase() +
              value.status.slice(1)
            secondaryText[1] = timeStamp
            eventStatus = value.status
            break
          case 'TransferGRG':
            drgvalue = value.amount
            symbol = value.symbol
            primaryText = 'Transfer ' + drgvalue + ' ' + symbol
            secondaryText[0] =
              'Status: ' +
              value.status.charAt(0).toUpperCase() +
              value.status.slice(1)
            secondaryText[1] = timeStamp
            eventStatus = value.status
            break
          case 'TransferETH':
            drgvalue = value.amount
            symbol = value.symbol
            primaryText = 'Transfer ' + drgvalue + ' ' + symbol
            secondaryText[0] =
              'Status: ' +
              value.status.charAt(0).toUpperCase() +
              value.status.slice(1)
            secondaryText[1] = timeStamp
            eventStatus = value.status
            break
          case 'WrapETH':
            drgvalue = value.amount
            symbol = value.symbol
            primaryText = 'Wrap ' + drgvalue + ' ' + symbol
            secondaryText[0] =
              'Status: ' +
              value.status.charAt(0).toUpperCase() +
              value.status.slice(1)
            secondaryText[1] = timeStamp
            eventStatus = value.status
            break
          case 'UnWrapETH':
            drgvalue = value.amount
            symbol = value.symbol
            primaryText = 'Unwrap ' + drgvalue + ' ' + symbol
            secondaryText[0] =
              'Status: ' +
              value.status.charAt(0).toUpperCase() +
              value.status.slice(1)
            secondaryText[1] = timeStamp
            eventStatus = value.status
            break
          case 'BuyToken':
            drgvalue = value.amount
            symbol = value.symbol
            primaryText = 'Buy ' + drgvalue + ' ' + symbol
            secondaryText[0] =
              'Status: ' +
              value.status.charAt(0).toUpperCase() +
              value.status.slice(1)
            secondaryText[1] = timeStamp
            eventStatus = value.status
            break
          case 'SellToken':
            drgvalue = value.amount
            symbol = value.symbol
            primaryText = 'Sell ' + drgvalue + ' ' + symbol
            secondaryText[0] =
              'Status: ' +
              value.status.charAt(0).toUpperCase() +
              value.status.slice(1)
            secondaryText[1] = timeStamp
            eventStatus = value.status
            break
          case 'SetFeeVault':
            symbol = value.symbol
            primaryText = 'Set fee ' + symbol
            secondaryText[0] =
              'Status: ' +
              value.status.charAt(0).toUpperCase() +
              value.status.slice(1)
            secondaryText[1] = timeStamp
            eventStatus = value.status
            break
          case 'SetPrice':
            symbol = value.symbol
            primaryText = 'Set price ' + symbol
            secondaryText[0] =
              'Status: ' +
              value.status.charAt(0).toUpperCase() +
              value.status.slice(1)
            secondaryText[1] = timeStamp
            eventStatus = value.status
            break
          case 'UnLockToken':
            symbol = value.symbol
            primaryText = 'UnLock token ' + symbol
            secondaryText[0] =
              'Status: ' +
              value.status.charAt(0).toUpperCase() +
              value.status.slice(1)
            secondaryText[1] = timeStamp
            eventStatus = value.status
            break
          case 'LockToken':
            symbol = value.symbol
            primaryText = 'Lock token ' + symbol
            secondaryText[0] =
              'Status: ' +
              value.status.charAt(0).toUpperCase() +
              value.status.slice(1)
            secondaryText[1] = timeStamp
            eventStatus = value.status
            break
          case 'ExCancelOrder':
            symbol = value.symbol
            primaryText = 'Lock token ' + symbol
            secondaryText[0] =
              'Status: ' +
              value.status.charAt(0).toUpperCase() +
              value.status.slice(1)
            secondaryText[1] = timeStamp
            eventStatus = value.status
            break
        }
        return (
          <ElementNotification
            key={key}
            transactionKey={key}
            primaryText={primaryText}
            secondaryText={secondaryText}
            eventType={eventType}
            eventStatus={eventStatus}
            txHash={txHash}
            networkName={this.props.endpoint.networkInfo.name}
            removeNotification={this.removeNotification}
          />
        )
      })
    return transactionsList.length !== 0 ? (
      transactionsList
    ) : (
      <div className={styles.noRecentTransactions}>
        <p className={styles.noTransacationsMsg}>No recent transactions.</p>
      </div>
    )
  }

  render() {
    const { notificationsOpen } = this.props
    return (
      <span>
        <div
          className={classNames([
            styles.notificationsPanel,
            notificationsOpen ? styles.show : styles.noShow
          ])}
        >
          <Row>
            <Col xs={12}>
              <List>{this.renderNotifications()}</List>
            </Col>
          </Row>
        </div>
      </span>
    )
  }

  detachInterface = () => {
    clearInterval(timerId)
  }
}

export default connect(mapStateToProps)(ElementNotificationsDrawer)
