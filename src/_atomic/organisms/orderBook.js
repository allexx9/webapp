import PropTypes from 'prop-types';
import React, { Component } from 'react';
import { Row, Col } from 'react-flexbox-grid';
import TableOrderBook from '../molecules/tableOrderBook';
import styles from './orderBook.module.css'
import AppBar from 'material-ui/AppBar'
import Paper from 'material-ui/Paper'

const paperStyle = {
  paddingLeft: "12px"
}

class OrderBook extends Component {

  static propTypes = {
    bidsOrders: PropTypes.array.isRequired,
    asksOrders: PropTypes.array.isRequired,
  };

  static defaultProps = {
    bidsOrders: [],
    asksOrders: [],
  };

  render() {
    var ordersAsksSorted = [].concat(this.props.asksOrders)
    var ordersBidsSorted = [].concat(this.props.bidsOrders).reverse()
    return (
      <Row>
        <Col xs={12}>
          <Row className={styles.sectionTitle}>
            <Col xs={12}>
            
              <AppBar
                title='ORDER BOOK'
                showMenuIconButton={false}
                className={styles.appBar}
                titleStyle={{ fontSize: 14 }}
              />
              <Paper style={paperStyle} zDepth={1} >
              <Row className={styles.orderBookContainer}>
                <Col xs={12}>
                  <Row className={styles.sectionHeaderOrderTable}>
                    <Col xs={6} className={styles.quantityText}>
                      QUANTITY
                    </Col>
                    <Col xs={6} className={styles.priceText}>
                      PRICE
                    </Col>
                  </Row>
                </Col>
                <Row bottom="xs" className={styles.ordersContainer}>
                    <Col xs={12}>
                    {ordersAsksSorted.length !== 0
                    ? <TableOrderBook
                    key="asksBook"
                    orders={ordersAsksSorted}
                    orderType="asks"
                    />
                    : null}
                    </Col>
                </Row>
               
                  <Col xs={12}>
                    <div className={styles.spread}>SPREAD</div>
                  </Col>
                
                  <Row className={styles.ordersContainer}>
                  <Col xs={12}>
                  {ordersBidsSorted.length !== 0
                   ? <TableOrderBook 
                        key="bidsBook"
                        orders={ordersBidsSorted}
                        orderType="bids"
                        />
                    : null
                    }
                  </Col>
                  </Row>
              </Row>
              </Paper>
            </Col>
          </Row>
        </Col>
      </Row>
    )
  }
}

export default OrderBook