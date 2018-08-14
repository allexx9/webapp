import Paper from 'material-ui/Paper';
import PropTypes from 'prop-types';
import React, { Component } from 'react';
import { Col, Row } from 'react-flexbox-grid';
import { connect } from 'react-redux';
import BoxTitle from '../atoms/boxTitle';
import ExchangeSelector from '../molecules/exchangeSelector';
import styles from './exchangeBox.module.css';
import { Actions } from '../../_redux/actions';
import utils from '../../_utils/utils';
import BigNumber from 'bignumber.js';
import { getTokenAllowance } from '../../_utils/exchange';
import ButtonAuthenticate from '../atoms/buttonAuthenticate'
import Web3 from 'web3';
import rp from 'request-promise';

import {
  RELAYS,
  TRADE_TOKENS_PAIRS,
  ERC20_TOKENS,
  CANCEL_SELECTED_ORDER
} from '../../_utils/const'

const paperStyle = {
  padding: "10px"
}

function mapStateToProps(state) {
  return state
}

class ExchangeBox extends Component {

  static contextTypes = {
    api: PropTypes.object.isRequired,
  };

  static propTypes = {
    exchange: PropTypes.object.isRequired,
    dispatch: PropTypes.func.isRequired,
    notifications: PropTypes.object.isRequired,
  };

  onSelectExchange = async (relay) => {
    const { api } = this.context
    const { selectedExchange, selectedFund } = this.props.exchange
    const selectedRelay = RELAYS[relay]
    const availableTradeTokensPair = utils.availableTradeTokensPair(TRADE_TOKENS_PAIRS, RELAYS[relay].name)
    const baseToken = ERC20_TOKENS[api._rb.network.name][selectedRelay.defaultTokensPair.baseTokenSymbol]
    const quoteToken = ERC20_TOKENS[api._rb.network.name][selectedRelay.defaultTokensPair.quoteTokenSymbol]
    const allowanceBaseToken = await getTokenAllowance(baseToken, selectedFund.details.address, selectedExchange)
    const allowanceQuoteToken = await getTokenAllowance(quoteToken, selectedFund.details.address, selectedExchange)
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
      type: CANCEL_SELECTED_ORDER,
    })

    // Updating selected relay
    this.props.dispatch(
      Actions.exchange.updateSelectedRelayAction(selectedRelay))

    // Updating available tokens pair
    this.props.dispatch(
      Actions.exchange.updateAvailableTradeTokensPairs(availableTradeTokensPair)
    )
    // Updating selected tokens pair
    this.props.dispatch(
      Actions.exchange.updateSelectedTradeTokensPair(tradeTokensPair)
    )

  }

  onAuthEF = async  () => {
    const { api } = this.context
    // metamask will take care of the 3rd parameter, "password"
  //   if (web3.currentProvider.isMetaMask) {
  //     return web3.eth.personal.sign(toSign, efx.get('account'))
  //   } else {
  //     return web3.eth.sign(toSign, efx.get('account'))
  //   }
  // const token = ((Date.now() / 1000) + 30) + ''

  // web3.eth.sign(token, address, (err, res) => {
  //       if (err) { reject(err) }
  //       signature = res.signature
  //     })
  console.log('auth')
  try {
    // var provider = account.source === 'MetaMask' ? window.web3 : api
    const token = ((Date.now() / 1000) + 3600) + ''
    let web3 = new Web3(window.web3)
    console.log(token)
    let result = await web3.eth.personal.sign(token, "0xc8dcd42e846466f2d2b89f3c54eba37bf738019b")
    // .then((result) => {
    //   console.log(result)
    // })
    console.log(result)
    const account = {
      signature: result,
      nonce: token,
    }
    // Fetch active orders
    this.props.dispatch(Actions.exchange.getAccountOrders(
      this.props.exchange.selectedRelay,
      api._rb.network.id,
      account,
      this.props.exchange.selectedTokensPair.baseToken,
      this.props.exchange.selectedTokensPair.quoteToken,
    )
    )
    
    // rp(
    //   {
    //     method: 'POST',
    //     url: `https://test.ethfinex.com/trustless/v1/r/orders`,
    //     body: {
    //       signature: result,
    //       nonce: token,
    //       protocol: '0x'
    //     },
    //     json: true
    //   }
    // )
    // .then(results => {
    //   console.log(results)
    //   // console.log(formatFunction)
    //   // console.log(formatFunction(results))
    //   // console.log('formatting')
    // })
    // .catch(err => {
    //   return err
    // })

    // let signature = web3.eth.sign("Hello world", '0xc8dcd42e846466f2d2b89f3c54eba37bf738019b', (err, res) => {
    //   if (err) return console.error(err)
    //   console.log(res)
    //   return res.signature
    // })
    // console.log(signature)
    // web3.eth.sign("Hello world", "0xc8dcd42e846466f2d2b89f3c54eba37bf738019b")
    // .then((result) => {
    //   console.log(result)
    // })
//     web3.eth.sign("Hello world", "0xc8dcd42e846466f2d2b89f3c54eba37bf738019b")
// .then(console.log);
    // .catch((error) =>{
    //   console.log(error)
    // })
    // this.props.dispatch(this.updateSelectedTradeTokensPair('base', true))
  } catch (error) {
    console.log(error)
  }
}

  render() {
    // console.log(this.props.fundOrders)
    // console.log(this.props.exchange)

    return (
      <Row>
        <Col xs={12}>
          <Row className={styles.sectionTitle}>
            <Col xs={12}>
              <BoxTitle titleText={'EXCHANGES'} />
              <Paper style={paperStyle} zDepth={1} >
                <Row>
                  <Col xs={12}>
                    <p className={styles.titleSection}>Exchanges</p>
                    <ExchangeSelector
                      availableRelays={this.props.exchange.availableRelays}
                      selectedRelay={this.props.exchange.selectedRelay.name}
                      onSelectExchange={this.onSelectExchange} />
                  </Col>
                  <Col xs={12}>
                    <ButtonAuthenticate 
                    onAuthEF={this.onAuthEF}
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