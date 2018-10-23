import { Actions } from '../../_redux/actions'
import { Col, Row } from 'react-flexbox-grid'
import { connect } from 'react-redux'
import { getTokenAllowance } from '../../_utils/exchange'
import BigNumber from 'bignumber.js'
import BoxTitle from '../atoms/boxTitle'
import ButtonAuthenticate from '../atoms/buttonAuthenticate'
import ExchangeSelector from '../molecules/exchangeSelector'
// import FlatButton from 'material-ui/FlatButton'
import Paper from 'material-ui/Paper'
import PoolApi from '../../PoolsApi/src'
import PropTypes from 'prop-types'
import React, { PureComponent } from 'react'
import SectionTitleExchange from '../atoms/sectionTitleExchange'
import TokensLockBox from '../../_atomic/organisms/tockensLockBox'
import Web3 from 'web3'
import styles from './exchangeBox.module.css'
import utils from '../../_utils/utils'

import { ERC20_TOKENS, RELAYS, TRADE_TOKENS_PAIRS } from '../../_utils/const'

import { CANCEL_SELECTED_ORDER } from '../../_redux/actions/const'

const paperStyle = {
  padding: '10px'
}

function mapStateToProps(state) {
  return state
}

class ExchangeBox extends PureComponent {
  static contextTypes = {
    api: PropTypes.object.isRequired
  }

  static propTypes = {
    exchange: PropTypes.object.isRequired,
    dispatch: PropTypes.func.isRequired,
    notifications: PropTypes.object.isRequired
  }

  onSelectExchange = async relay => {
    const { api } = this.context
    const { selectedExchange, selectedFund } = this.props.exchange
    const selectedRelay = RELAYS[relay]
    const availableTradeTokensPair = utils.availableTradeTokensPair(
      TRADE_TOKENS_PAIRS,
      RELAYS[relay].name,
      api._rb.network.id
    )
    const baseToken =
      ERC20_TOKENS[api._rb.network.name][
        selectedRelay.defaultTokensPair.baseTokenSymbol
      ]
    const quoteToken =
      ERC20_TOKENS[api._rb.network.name][
        selectedRelay.defaultTokensPair.quoteTokenSymbol
      ]
    const allowanceBaseToken = await getTokenAllowance(
      baseToken,
      selectedFund.details.address,
      selectedExchange
    )
    const allowanceQuoteToken = await getTokenAllowance(
      quoteToken,
      selectedFund.details.address,
      selectedExchange
    )
    const tradeTokensPair = {
      baseToken: baseToken,
      quoteToken: quoteToken,
      baseTokenAllowance: new BigNumber(allowanceBaseToken).gt(0),
      quoteTokenAllowance: new BigNumber(allowanceQuoteToken).gt(0),
      ticker: {
        current: {
          price: '0'
        },
        previous: {
          price: '0'
        },
        variation: 0
      }
    }

    // Resetting current order
    this.props.dispatch({
      type: CANCEL_SELECTED_ORDER
    })

    // Updating selected relay
    this.props.dispatch(Actions.exchange.updateSelectedRelay(selectedRelay))

    // Updating available tokens pair
    this.props.dispatch(
      Actions.exchange.updateAvailableTradeTokensPairs(availableTradeTokensPair)
    )
    // Updating selected tokens pair
    this.props.dispatch(
      Actions.exchange.updateSelectedTradeTokensPair(tradeTokensPair)
    )
  }

  onAuthEF = async () => {
    const { api } = this.context
    console.log('auth')
    try {
      // var provider = account.source === 'MetaMask' ? window.web3 : api
      const token = Date.now() / 1000 + 3600 + ''
      let web3 = new Web3(window.web3)
      console.log(token)
      let result = await web3.eth.personal.sign(
        token,
        this.props.exchange.walletAddress
      )
      // .then((result) => {
      //   console.log(result)
      // })
      console.log(result)
      const accountSignature = {
        signature: result,
        nonce: token,
        valid: true
      }
      // Fetch active orders
      this.props.dispatch(
        Actions.exchange.updateAccountSignature(accountSignature)
      )
      // Fetch active orders
      this.props.dispatch(
        Actions.exchange.getAccountOrdersStart(
          this.props.exchange.selectedRelay,
          api._rb.network.id,
          accountSignature,
          this.props.exchange.selectedTokensPair.baseToken,
          this.props.exchange.selectedTokensPair.quoteToken
        )
      )
    } catch (error) {
      console.log(error)
    }
  }

  render() {
    const {
      availableRelays,
      selectedRelay,
      accountSignature,
      selectedFund,
      selectedTokensPair,
      selectedExchange
    } = this.props.exchange
    return (
      <Row>
        <Col xs={12}>
          <Row className={styles.sectionTitle}>
            <Col xs={12}>
              <BoxTitle titleText={'RELAY'} />
              <Paper style={paperStyle} zDepth={1}>
                <Row>
                  <Col xs={12}>
                    <SectionTitleExchange titleText="RELAYS" />
                    <ExchangeSelector
                      availableRelays={availableRelays}
                      selectedRelay={selectedRelay.name}
                      onSelectExchange={this.onSelectExchange}
                    />
                  </Col>
                  <Col xs={12}>
                    <div className={styles.section}>
                      <ButtonAuthenticate
                        onAuthEF={this.onAuthEF}
                        disabled={accountSignature.valid}
                      />
                    </div>
                  </Col>
                  <Col xs={12}>
                    <TokensLockBox
                      selectedFund={selectedFund}
                      selectedTokensPair={selectedTokensPair}
                      selectedExchange={selectedExchange}
                      selectedRelay={selectedRelay}
                    />
                  </Col>
                </Row>
              </Paper>
            </Col>
          </Row>
        </Col>
      </Row>
    )
  }
}

export default connect(mapStateToProps)(ExchangeBox)
