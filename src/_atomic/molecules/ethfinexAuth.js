import { Actions } from '../../_redux/actions'
import { Col, Row } from 'react-flexbox-grid'
import { connect } from 'react-redux'
import ButtonAuthenticate from '../atoms/buttonAuthenticate'
import PropTypes from 'prop-types'
import React, { Component } from 'react'
import TokensLockBox from '../organisms/tockensLockBox'
import Web3 from 'web3'
import moment from 'moment'
import styles from './ethfinexAuth.module.css'

function mapStateToProps(state) {
  return state
}

class EthfinexAuth extends Component {
  static propTypes = {
    exchange: PropTypes.object.isRequired,
    dispatch: PropTypes.func.isRequired
  }

  static contextTypes = {
    api: PropTypes.object.isRequired
  }

  onAuthEF = async () => {
    const { api } = this.context

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
      selectedRelay,
      accountSignature,
      selectedFund,
      selectedTokensPair,
      selectedExchange
    } = this.props.exchange
    // console.log(
    //   `Exp base token: ${moment
    //     .unix(selectedTokensPair.baseTokenLockWrapExpire)
    //     .format('MMMM Do YYYY, h:mm:ss a')}`
    // )
    // console.log(
    //   `Exp quote token: ${moment
    //     .unix(selectedTokensPair.quoteTokenLockWrapExpire)
    //     .format('MMMM Do YYYY, h:mm:ss a')}`
    // )
    return (
      <Row>
        {' '}
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
    )
  }
}
export default connect(mapStateToProps)(EthfinexAuth)
