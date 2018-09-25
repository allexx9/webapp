import { Col, Row } from 'react-flexbox-grid'
import ButtonLock from '../atoms/buttonLock'
import PropTypes from 'prop-types'
import React, { Component } from 'react'
import SectionTitleExchange from '../atoms/sectionTitleExchange'
import TokenAmountInputField from '../atoms/tokenLockAmountField'
import styles from './lockedTokensInfo.module.css'

class LockedTokensInfo extends Component {
  static propTypes = {}

  static defaultProps = {}

  onChangeAmount = () => {}

  render() {
    return (
      <Row>
        <Col xs={12}>
          <SectionTitleExchange titleText="TOKEN LOCK" />
        </Col>

        <Col xs={12}>
          <Row className={styles.lockHeader}>
            <Col xs={3} />
            <Col xs={3}>Locked</Col>
            <Col xs={6}>Amount</Col>
            {/* <Col xs={3}>Action</Col> */}
          </Row>
          <Row>
            <Col xs={3}>
              <span className={styles.symbolText}>
                <small>ETH</small>
              </span>
            </Col>
            <Col xs={3}>0.00</Col>
            <Col xs={6}>
              <TokenAmountInputField
                lockMaxAmount={Number(0)}
                onChangeAmount={this.onChangeAmount}
                disabled={false}
              />
            </Col>
            {/* <Col xs={3}>0.00</Col> */}
          </Row>
          <Row>
            <Col xs={3}>
              <span className={styles.symbolText}>
                <small>USDT</small>
              </span>
            </Col>
            <Col xs={3}>0.00</Col>
            <Col xs={6}>
              <TokenAmountInputField
                lockMaxAmount={Number(0)}
                onChangeAmount={this.onChangeAmount}
                disabled={false}
              />
            </Col>
            {/* <Col xs={3}>0.00</Col> */}
          </Row>
          <div className={styles.buttonsLock}>
            <Row>
              <Col xs={6}>
                <ButtonLock buttonAction={'lock'} />
              </Col>
              <Col xs={6}>
                <ButtonLock buttonAction={'unlock'} />
              </Col>
            </Row>
          </div>
        </Col>
      </Row>
    )
  }
}

export default LockedTokensInfo
