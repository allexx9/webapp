import PropTypes from 'prop-types';
import React, { Component } from 'react';
import { Row, Col } from 'react-flexbox-grid';
import styles from './orderBox.module.css'
import AppBar from 'material-ui/AppBar'
import Paper from 'material-ui/Paper'
import ButtonBuy from '../atoms/buttonBuy'
import ButtonSell from '../atoms/buttonSell'
import TokenQuantity from '../atoms/tokenQuantity'
import ButtonOrderSubmit from '../atoms/buttonOrderSubmit'
import OrderSummary from '../molecules/orderSummary'

const paperStyle = {
  padding: "10px"
}

class OrderBox extends Component {

  static propTypes = {
    order: PropTypes.object.isRequired,
  };

  static defaultProps = {
  };

  
  render() {
    console.log(this.props.order)
    const { order } = this.props
    return (
      <Row>
        <Col xs={12}>
          <Row className={styles.sectionTitle}>
            <Col xs={12}>
              <AppBar
                title='ORDER BOX'
                showMenuIconButton={false}
                className={styles.appBar}
                titleStyle={{ fontSize: 14 }}
              />
              <Paper style={paperStyle} zDepth={1} >
                <Row className={styles.orderBookContainer}>
                  <Col xs={12}>
                    <Row className={styles.sectionHeaderOrderTable}>
                      <Col xs={6} className={styles.buyButton}>
                        <ButtonBuy />
                      </Col>
                      <Col xs={6} className={styles.sellButton}>
                        <ButtonSell />
                      </Col>
                    </Row>
                  </Col>
                  <Col xs={12}>
                    <TokenQuantity order={order} />
                  </Col>
                  <Col xs={12}>
                    <Row center="xs">
                      <ButtonOrderSubmit />
                    </Row>
                  </Col>
                  <Col xs={12}>
                    {
                      (Object.keys(order.details).length !== 0)
                        ? <OrderSummary order={order} />
                        : null
                    } 
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

export default OrderBox