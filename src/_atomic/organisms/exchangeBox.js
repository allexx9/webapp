import Paper from 'material-ui/Paper';
import PropTypes from 'prop-types';
import React, { Component } from 'react';
import { Col, Row } from 'react-flexbox-grid';
import { connect } from 'react-redux';
import BoxTitle from '../atoms/boxTitle';
import ExchangeSelector from '../molecules/exchangeSelector';
import styles from './exchangeBox.module.css';
import exchange  from './../../_redux/actions/exchange'
import { 
  ERCdEX,
  RELAYS
 } from '../../_utils/const'

const paperStyle = {
  padding: "10px"
}

function mapStateToProps(state) {
  return state
}

class ExchangeBox extends Component {

  static propTypes = {
    exchange: PropTypes.object.isRequired,
    dispatch: PropTypes.func.isRequired,
    notifications: PropTypes.object.isRequired,
  };

  static defaultProps = {
  };

  onSelectExchange = (relay) => {
    const payload = RELAYS[relay]
    console.log(payload)
    this.props.dispatch(exchange.updateSelectedRelayAction(payload))
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
                    <ExchangeSelector selectedRelayer={this.props.exchange.selectedRelay.name} onSelectExchange={this.onSelectExchange}/>
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