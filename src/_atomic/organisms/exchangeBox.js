import PropTypes from 'prop-types';
import React, { Component } from 'react';
import { Row, Col } from 'react-flexbox-grid';
import styles from './exchangeBox.module.css'
import Paper from 'material-ui/Paper'
import BoxTitle from '../atoms/boxTitle'
import { connect } from 'react-redux';
import {
  ADD_TRANSACTION,
} from '../../_utils/const'
import serializeError from 'serialize-error';
import utils from '../../_utils/utils'


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


  render() {
    // console.log(this.props.fundOrders)
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