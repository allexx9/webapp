import PropTypes from 'prop-types';
import React, { Component } from 'react';
import { Row, Col } from 'react-flexbox-grid';
import BigNumber from 'bignumber.js'
import  * as Colors from 'material-ui/styles/colors'

import styles from './tableOrderBook.module.css'
import { connect } from 'react-redux';
import {
  UPDATE_SELECTED_ORDER
} from '../../_utils/const'
import { detect } from 'detect-browser'

function mapStateToProps(state) {
  return state
}

class TableOrderBook extends Component {

  static propTypes = {
    orders: PropTypes.array.isRequired,
    orderType: PropTypes.string.isRequired,
    dispatch: PropTypes.func.isRequired
  };

  static contextTypes = {
    api: PropTypes.object.isRequired,
  };

  updateSelectedOrder = (order, orderType) => {
    const payload = {
      details: {...order}, 
      type: orderType
    }
    return {
      type: UPDATE_SELECTED_ORDER,
      payload: payload
    }
  };

  onClickOrder = (id, orderType) =>{
    console.log(id, orderType)
    var order = this.props.orders[id]
    this.props.dispatch(this.updateSelectedOrder(order, orderType))
  }

  renderRows = (ordersSorted) =>{
    const { orderType } = this.props
    var price, amount
    const orderStylePrice = {
      asks: {
        color: Colors.red400,
      },
      bids: {
        color: Colors.green400
      },
    } 
    
    const orderStyleAmount = {
      asks: {
        color: Colors.red400,
      },
      bids: {
        color: Colors.green400
      },
    }

    const progressBarAmountColor = {
      asks: Colors.red50,
      bids: Colors.green50,
    }

    // var arr = [1,2,3];
    // var max1 = arr.reduce(function(a, b) {
    //   console.log(a, b)
    //     return Math.max(a, b);
    // });

    var max = ordersSorted.reduce(function (prev, current) {
      return (Number(prev.orderAmount) > Number(current.orderAmount) ? prev : current)
    })
    return ordersSorted.map((order, key) => {
      var amountGradient
      price = order.orderPrice
      amount = order.orderAmount

      const relativeToTotal = new BigNumber(amount).dividedBy(new BigNumber(max.orderAmount)).mul(100.).toFixed(0)

      const browser = detect();
      switch (browser && browser.name) {
        case 'chrome':
          amountGradient = `-webkit-linear-gradient(left, ${progressBarAmountColor[orderType]} ${relativeToTotal}%, ${progressBarAmountColor[orderType]} ${relativeToTotal}%, rgba(255,255,255,1) ${relativeToTotal}%, rgba(255,255,255,1) 100%)`
          break;
        case 'firefox':
          amountGradient = `-moz-linear-gradient(left, ${progressBarAmountColor[orderType]} ${relativeToTotal}%, ${progressBarAmountColor[orderType]} ${relativeToTotal}%, rgba(255,255,255,1) ${relativeToTotal}%, rgba(255,255,255,1) 100%)`
          break;
        case 'edge':
          amountGradient = `-ms-linear-gradient(left, ${progressBarAmountColor[orderType]} ${relativeToTotal}%, ${progressBarAmountColor[orderType]} ${relativeToTotal}%, rgba(255,255,255,1) ${relativeToTotal}%, rgba(255,255,255,1) 100%)`
          break;
        default:
          amountGradient = `linear-gradient(left, ${progressBarAmountColor[orderType]} ${relativeToTotal}%, ${progressBarAmountColor[orderType]} ${relativeToTotal}%, rgba(255,255,255,1) ${relativeToTotal}%, rgba(255,255,255,1) 100%)`
      }
      return (
        <Row key={"order" + key} >

          <Col xs={12} className={styles.sectionOrder} id={key} onClick={() => this.onClickOrder(key, orderType)}>
            <Row className={styles.cellOrder}>
              <Col xs={2} style={{ ...orderStyleAmount[orderType], backgroundImage: amountGradient }}>
              </Col>
              <Col xs={5} style={orderStylePrice[orderType]}>
                {amount}
              </Col>
              <Col xs={5} style={orderStylePrice[orderType]}>
                {price}
              </Col>
            </Row>
          </Col>

        </Row>
      )
    })
  }

  render() {
    const { orders } = this.props
    // console.log(orders)

    return (
      <Row className={styles.containerOrders}>
        <Col xs={12} style={{marginRight: "-4px"}}>
          {this.renderRows(orders)}
        </Col>
      </Row>
    )
  }
}

export default connect(mapStateToProps)(TableOrderBook)