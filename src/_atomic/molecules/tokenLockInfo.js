import { Actions } from '../../_redux/actions'
import { Col, Row } from 'react-flexbox-grid'
import { connect } from 'react-redux'
import { formatEth } from '../../_utils/format'
import { toBaseUnitAmount } from '../../_utils/format'
import BigNumber from 'bignumber.js'
import ButtonLock from '../atoms/buttonLock'
import Checkbox from 'material-ui/Checkbox'
import LockErrorMessage from '../atoms/lockErrorMessage'
import PoolApi from '../../PoolsApi/src'
import PropTypes from 'prop-types'
import React, { PureComponent } from 'react'
import SectionTitleExchange from '../atoms/sectionTitleExchange'
import TokenAmountInputField from '../atoms/tokenLockAmountField'
import TokenLockBalance from '../atoms/tokenLockBalance'
import TokenLockTimeField from '../atoms/tokenLockTimeField'

import styles from './tokenLockInfo.module.css'
import utils from '../../_utils/utils'

class TokenLockInfo extends PureComponent {
  static propTypes = {
    selectedFund: PropTypes.object.isRequired,
    selectedExchange: PropTypes.object.isRequired,
    selectedTokensPair: PropTypes.object.isRequired,
    selectedRelay: PropTypes.object.isRequired,
    dispatch: PropTypes.func.isRequired
  }

  static defaultProps = {}

  static contextTypes = {
    api: PropTypes.object.isRequired
  }

  state = {
    baseTokenLockAmount: '0.01',
    quoteTokenLockAmount: '0',
    baseTokenLockTime: '1',
    quoteTokenLockTime: '1',
    baseTokenSelected: true,
    quoteTokenSelected: false,
    errorText: ''
  }

  isBalanceSufficient = (amount, liquidity) => {
    return new BigNumber(liquidity).gte(new BigNumber(amount))
  }

  componentDidMount = async () => {}

  onLockTocken = async action => {
    const {
      selectedFund,
      selectedTokensPair,
      selectedRelay,
      selectedExchange
    } = this.props
    const {
      baseTokenSelected,
      baseTokenLockTime,
      baseTokenLockAmount,
      quoteTokenLockAmount
    } = this.state
    console.log(this.props)
    console.log(selectedRelay)
    let tokenAddress, tokenWrapperAddress, amount, time, decimals
    if (baseTokenSelected) {
      tokenAddress = selectedTokensPair.baseToken.address
      tokenWrapperAddress =
        selectedTokensPair.baseToken.wrappers[selectedRelay.name].address
      decimals = selectedTokensPair.baseToken.decimals
      amount = baseTokenLockAmount
      time = baseTokenLockTime
    } else {
      tokenAddress = selectedTokensPair.quoteToken.address
      tokenWrapperAddress =
        selectedTokensPair.quoteToken.wrappers[selectedRelay.name].address
      decimals = selectedTokensPair.baseToken.decimals
      amount = quoteTokenLockAmount
      time = quoteTokenLockAmount
    }
    console.log(action)
    switch (action) {
      case 'lock':
        break
      case 'unlock':
        // // Unloking
        if (
          !this.isBalanceSufficient(
            toBaseUnitAmount(new BigNumber(amount), decimals),
            selectedFund.liquidity.baseToken.balanceWrapper
          )
        ) {
          console.log(amount, selectedFund.liquidity.baseToken.balanceWrapper)
          this.setState({
            errorText: 'You cannot unlock more than locked amount'
          })
          return
        }
        console.log(
          selectedFund.managerAccount,
          selectedFund.details.address,
          selectedExchange.exchangeContractAddress,
          tokenAddress,
          tokenWrapperAddress,
          toBaseUnitAmount(new BigNumber(amount), decimals)
        )
        const poolApi = await new PoolApi(window.web3)
        await poolApi.contract.drago.init(selectedFund.details.address)
        await poolApi.contract.drago.operateOnExchangeEFXUnlock(
          selectedFund.managerAccount,
          selectedFund.details.address,
          selectedExchange.exchangeContractAddress,
          tokenAddress,
          tokenWrapperAddress,
          toBaseUnitAmount(new BigNumber(amount), decimals)
        )
        break
      default:
        return
    }
  }

  onChangeAmount = (amount, baseToken, errorText) => {
    console.log(amount, baseToken, errorText)
    baseToken === true
      ? this.setState({ baseTokenLockAmount: amount, errorText })
      : this.setState({ quoteTokenLockAmount: amount, errorText })
  }

  onChangeTime = (amount, baseToken, errorText) => {
    console.log(amount, baseToken, errorText)
    baseToken === true
      ? this.setState({ baseTokenLockTime: amount, errorText })
      : this.setState({ quoteTokenLockTime: amount, errorText })
  }

  onCheckToken = token => {
    console.log(token)
    switch (token) {
      case 'baseTokenSelected':
        this.setState({
          baseTokenSelected: true
        })
        break
      case 'quoteTokenSelected':
        this.setState({
          baseTokenSelected: false
        })
        break
    }
  }

  render() {
    const { api } = this.context
    const { selectedFund, selectedTokensPair } = this.props

    const baseTokenWrappedBalance = formatEth(
      selectedFund.liquidity.baseToken.balanceWrapper,
      4,
      api
    )
    const quoteTokenWrappedBalance = formatEth(
      selectedFund.liquidity.quoteToken.balanceWrapper,
      4,
      api
    )
    // console.log(selectedFund)
    console.log(selectedTokensPair.baseTokenLockWrapExpire)
    console.log(selectedTokensPair.quoteTokenLockWrapExpire)
    return (
      <div key="lockedTokenInfo">
        <Row>
          <Col xs={12}>
            <SectionTitleExchange titleText="TOKEN LOCK" />
          </Col>

          <Col xs={12}>
            <Row className={styles.lockHeader}>
              <Col xs={1} />
              <Col xs={2} />
              <Col xs={3}>Locked</Col>
              <Col xs={4}>Amount</Col>
              <Col xs={2}>Hr</Col>
            </Row>
            <Row>
              <Col xs={1}>
                <Checkbox
                  checked={this.state.baseTokenSelected}
                  onCheck={() => this.onCheckToken('baseTokenSelected')}
                  id="baseTokenSelected"
                  key="baseTokenSelected"
                  iconStyle={{
                    width: '18px',
                    height: '18px',
                    marginTop: '1px'
                  }}
                />
              </Col>
              <Col xs={2}>
                <span className={styles.symbolText}>
                  <small>{selectedTokensPair.baseToken.symbol}</small>
                </span>
              </Col>
              <Col xs={3}>
                <TokenLockBalance
                  balance={baseTokenWrappedBalance}
                  lockTime={selectedTokensPair.baseTokenLockWrapExpire}
                />
              </Col>
              <Col xs={4}>
                <TokenAmountInputField
                  key="baseTokenField"
                  lockMaxAmount={selectedFund.liquidity.baseToken.balance}
                  isBaseToken={true}
                  onChangeAmount={this.onChangeAmount}
                  disabled={false}
                  amount={this.state.baseTokenLockAmount}
                />
              </Col>
              <Col xs={2}>
                <TokenLockTimeField
                  key="baseTokenTimeField"
                  isBaseToken={true}
                  onChangeTime={this.onChangeTime}
                  disabled={false}
                  amount={this.state.baseTokenLockTime}
                />
              </Col>
            </Row>

            <Row>
              <Col xs={1}>
                <Checkbox
                  checked={!this.state.baseTokenSelected}
                  onCheck={() => this.onCheckToken('quoteTokenSelected')}
                  id="quoteTokenSelected"
                  key="quoteTokenSelected"
                  iconStyle={{
                    width: '18px',
                    height: '18px',
                    marginTop: '1px'
                  }}
                />
              </Col>
              <Col xs={2}>
                <span className={styles.symbolText}>
                  <small>{selectedTokensPair.quoteToken.symbol}</small>
                </span>
              </Col>
              <Col xs={3}>
                <TokenLockBalance
                  balance={quoteTokenWrappedBalance}
                  lockTime={selectedTokensPair.quoteTokenLockWrapExpire}
                />
              </Col>
              <Col xs={4}>
                <TokenAmountInputField
                  key="quoteTokenField"
                  lockMaxAmount={selectedFund.liquidity.baseToken.balance}
                  isBaseToken={false}
                  onChangeAmount={this.onChangeAmount}
                  disabled={false}
                  amount={this.state.quoteTokenLockAmount}
                />
              </Col>
              <Col xs={2}>
                <TokenLockTimeField
                  key="quoteTokenTimeField"
                  isBaseToken={true}
                  onChangeTime={this.onChangeTime}
                  disabled={false}
                  amount={this.state.quoteTokenLockTime}
                />
              </Col>
            </Row>
            <div className={styles.buttonsLock}>
              <Row>
                <Col xs={6}>
                  <ButtonLock
                    buttonAction={'unlock'}
                    onLockTocken={this.onLockTocken}
                    disabled={this.state.errorText !== ''}
                  />
                </Col>
                <Col xs={6}>
                  <ButtonLock
                    buttonAction={'lock'}
                    onLockTocken={this.onLockTocken}
                    disabled={this.state.errorText !== ''}
                  />
                </Col>
              </Row>
            </div>
          </Col>
          <Col xs={12}>
            <LockErrorMessage message={this.state.errorText} />
          </Col>
        </Row>
      </div>
    )
  }
}

export default connect()(TokenLockInfo)
