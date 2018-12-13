import { connect } from 'react-redux'
import AccountTopBarSummary from './accountTopBarSummary'
import ElementNotificationsList from './elementNotificationsList'
import PropTypes from 'prop-types'
import React, { Component } from 'react'
import classNames from 'classnames'
import styles from './elementTopBarAccountStatus.module.css'

function mapStateToProps(state) {
  return {
    recentTransactions: state.transactions.queue,
    endpoint: state.endpoint
  }
}

class ElementTopBarAccountStatus extends Component {
  static propTypes = {
    notificationsOpen: PropTypes.bool.isRequired,
    dispatch: PropTypes.func.isRequired,
    endpoint: PropTypes.object.isRequired
  }

  state = {
    notificationsOpen: false
  }

  render() {
    const { notificationsOpen } = this.props
    const { accounts, networkInfo } = this.props.endpoint
    const account = accounts[0]
    return (
      <span>
        <div
          className={classNames([
            styles.notificationsPanel,
            notificationsOpen ? styles.show : styles.noShow
          ])}
        >
          {accounts.length !== 0 && (
            <AccountTopBarSummary
              account={account}
              key={'topBarAccount' + account.name}
              etherscanUrl={networkInfo.etherscan}
            />
          )}
          <ElementNotificationsList />
        </div>
      </span>
    )
  }
}

export default connect(mapStateToProps)(ElementTopBarAccountStatus)
