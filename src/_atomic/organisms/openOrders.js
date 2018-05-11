import PropTypes from 'prop-types';
import React, { Component } from 'react';
import { Row, Col } from 'react-flexbox-grid';
import styles from './openOrders.module.css'
import AppBar from 'material-ui/AppBar'
import Paper from 'material-ui/Paper'


const paperStyle = {
  // paddingLeft: "12px"
}

class OpenOrders extends Component {

  static propTypes = {
    bidsOrders: PropTypes.array.isRequired,
    asksOrders: PropTypes.array.isRequired,
  };

  static defaultProps = {
    bidsOrders: [],
    asksOrders: [],
  };

  render() {
    return (
      <Row>
        <Col xs={12}>
          <Row className={styles.sectionTitle}>
            <Col xs={12}>

              <AppBar
                title='OPEN ORDERS'
                showMenuIconButton={false}
                className={styles.appBar}
                titleStyle={{ fontSize: 14 }}
              />
              <Paper style={paperStyle} zDepth={1} >
                <Row className={styles.orderBookContainer}>
                  <Col xs={12}>

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

export default OpenOrders