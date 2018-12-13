import { Col, Row } from 'react-flexbox-grid'
import { List } from 'material-ui/List'
import { connect } from 'react-redux'
// import Drawer from 'material-ui/Drawer'
import ElementNotification from './elementNotification'
import PropTypes from 'prop-types'
import React, { Component } from 'react'
import classNames from 'classnames'
import styles from './elementNotificationsList.module.css'
import utils from '../../_utils/utils'

function mapStateToProps(state) {
  return {
    recentTransactions: state.transactions.queue,
    endpoint: state.endpoint
  }
}

class ElementNotificationsList extends Component {
  static propTypes = {
    dispatch: PropTypes.func.isRequired,
    recentTransactions: PropTypes.object.isRequired,
    endpoint: PropTypes.object.isRequired
  }

  static contextTypes = {
    api: PropTypes.object.isRequired
  }

  state = {
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
    this.props.dispatch(
      this.updateTransactionsQueueAction(newRecentTransactions)
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
          default:
            drgvalue = 0
            symbol = 0
            primaryText = 'NA'
            secondaryText[1] = timeStamp
            eventStatus = 'NA'
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
    return (
      <Row>
        <Col xs={12}>
          <List>{this.renderNotifications()}</List>
        </Col>
      </Row>
    )
  }
}

export default connect(mapStateToProps)(ElementNotificationsList)
