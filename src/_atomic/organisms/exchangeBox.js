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