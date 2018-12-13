import { Col, Row } from 'react-flexbox-grid'
import { CopyToClipboard } from 'react-copy-to-clipboard'
import { Link } from 'react-router-dom'
import Chat from 'material-ui/svg-icons/communication/chat'
import CopyContent from 'material-ui/svg-icons/content/content-copy'
import PropTypes from 'prop-types'
import React, { Component } from 'react'
import Search from 'material-ui/svg-icons/action/search'
import Settings from 'material-ui/svg-icons/action/settings'
import TokenAvatar from '../atoms/tokenAvatar'
import styles from './accountTopBarSummary.module.css'

class AccountTopBarSummary extends Component {
  static propTypes = {
    account: PropTypes.object.isRequired,
    etherscanUrl: PropTypes.string.isRequired,
    fundType: PropTypes.string.isRequired
  }

  static defaultProps = {
    fundType: 'drago'
  }

  state = {
    transferOpen: false
  }

  renderCopyButton = accountAddress => {
    if (!accountAddress) {
      return null
    }

    return (
      <CopyToClipboard text={accountAddress} onCopy={() => {}}>
        <Link to={'#'}>
          <CopyContent className={styles.copyAddress} />
        </Link>
      </CopyToClipboard>
    )
  }

  renderEtherscanButton = (type, text) => {
    if (!text) {
      return null
    }
    return (
      <a
        href={this.props.etherscanUrl + type + '/' + text}
        target="_blank"
        rel="noopener noreferrer"
      >
        <Search className={styles.copyAddress} />
      </a>
    )
  }

  renderTitle = () => {
    const { account } = this.props
    return (
      <Row>
        <Col xs={8} className={styles.title}>
          {account.name}
        </Col>
        <Col xs={4} className={styles.actionButtons}>
          {this.renderCopyButton(account.address)}{' '}
          {this.renderEtherscanButton('address', account.address)}
        </Col>
      </Row>
    )
  }

  renderSubTitle = () => {
    const { account } = this.props
    return (
      <Row>
        <Col xs={12} className={styles.subTitle}>
          {account.address}
        </Col>
      </Row>
    )
  }

  renderBalance = (amount, symbol) => {
    const formattedAmount = Number(amount).toLocaleString(undefined, {
      minimumFractionDigits: 3,
      maximumFractionDigits: 3
    })

    return (
      <div className={styles.balance}>
        <TokenAvatar tokenSymbol={symbol} />
        <span>
          {formattedAmount} <small>{symbol}</small>
        </span>
      </div>
    )
  }

  render() {
    const { account } = this.props
    return (
      <Row>
        <Col xs={12}>
          <div className={styles.paperContainer}>
            <Row>
              <Col xs={12}>
                <Row className={styles.accountTitleContainer}>
                  <Col xs={2}>
                    <div className={styles.actionsContainer}>
                      <Link to={'/#/app/web/config'}>
                        <Settings
                          color={'#757575'}
                          className={styles.actionIcons}
                        />
                      </Link>
                      <a
                        href="https://community.rigoblock.com/"
                        rel="noopener noreferrer"
                        target="_blank"
                      >
                        <Chat
                          color={'#757575'}
                          className={styles.actionIcons}
                        />
                      </a>
                    </div>
                  </Col>
                  <Col xs={10} md={10}>
                    <Row>
                      <Col xs={12}>{this.renderTitle()}</Col>
                      <Col xs={12}>{this.renderSubTitle()}</Col>
                    </Row>
                    <Row className={styles.accountBodyContainer}>
                      <Col xs={12}>
                        <div className={styles.accountChipTokenETH}>
                          {this.renderBalance(account.ethBalance, 'ETH')}
                        </div>
                        <div className={styles.accountChipTokenGGG}>
                          {this.renderBalance(account.grgBalance, 'GRG')}
                        </div>
                      </Col>
                    </Row>
                  </Col>
                </Row>
              </Col>
            </Row>
          </div>
        </Col>
      </Row>
    )
  }
}

export default AccountTopBarSummary
