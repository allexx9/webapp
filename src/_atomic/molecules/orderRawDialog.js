import PropTypes from 'prop-types'
import React, { Component } from 'react'
// import { Row, Col } from 'react-flexbox-grid';
import { Col, Row } from 'react-flexbox-grid'
import BoxTitle from '../atoms/boxTitle'
import ButtonOrderCancel from '../atoms/buttonOrderCancel'
import ButtonOrderNext from '../atoms/buttonOrderNext'
import ButtonOrderSubmit from '../atoms/buttonOrderSubmit'
import Dialog from 'material-ui/Dialog'
import OrderStepper from './orderStepper'
import OrderSummary from '../molecules/orderSummary'
import utils from '../../_utils/utils'

import styles from './orderRawDialog.module.css'

const customContentStyle = {
  height: '400px',
  width: '600px',
  wordWrap: 'break-word'
}

class OrderRawDialog extends Component {
  static propTypes = {
    order: PropTypes.object.isRequired,
    efxOrder: PropTypes.object,
    onClose: PropTypes.func.isRequired,
    onSubmitOrder: PropTypes.func.isRequired,
    onCheckOrder: PropTypes.func.isRequired,
    open: PropTypes.bool.isRequired,
    orderSubmitStep: PropTypes.number.isRequired
  }

  static defaultProps = {
    efxOrder: {}
  }

  shouldComponentUpdate(nextProps) {
    let propsUpdate = utils.shallowEqual(this.props, nextProps)
    return propsUpdate
  }

  handleClose = () => {
    this.props.onClose(false, true)
  }

  renderStepActions(step) {
    const { orderSubmitStep } = this.props
    // const buttonDisable = () => {
    //   switch (step) {
    //     case 0:
    //       return !orderSubmitStep === 1 ? true : false
    //     default:
    //       return false
    //   }
    // }

    return (
      <Row center="xs">
        <Col xs={6}>
          {orderSubmitStep !== 3 && (
            <ButtonOrderCancel onClick={this.handleClose} disabled={false} />
          )}
          {orderSubmitStep === 3 && <ButtonOrderCancel disabled={true} />}
        </Col>
        <Col xs={6}>
          {orderSubmitStep === 0 && <ButtonOrderNext disabled={true} />}
          {orderSubmitStep === 1 && (
            <ButtonOrderNext
              onClick={this.props.onCheckOrder}
              disabled={false}
            />
          )}
          {orderSubmitStep === 2 && (
            <ButtonOrderSubmit
              onClick={this.props.onSubmitOrder}
              disabled={false}
            />
          )}
          {orderSubmitStep === 3 && (
            <ButtonOrderCancel
              onClick={this.handleClose}
              disabled={false}
              label="Close"
            />
          )}
        </Col>
      </Row>
    )
  }

  render() {
    const { order, orderSubmitStep } = this.props
    return (
      <div>
        {' '}
        <Dialog
          title={<BoxTitle titleText={'CONFIRM ORDER'} />}
          modal={true}
          open={this.props.open}
          onRequestClose={this.handleClose}
          contentStyle={customContentStyle}
          autoDetectWindowHeight={false}
        >
          <div className={styles.summaryContainer}>
            <OrderSummary order={order} />
          </div>
          <div>
            <OrderStepper
              stepIndex={this.props.orderSubmitStep}
              orderJson={this.props.order}
            />
          </div>
          {/* <Row center="xs">
            <Col xs={6}>
              <ButtonOrderCancel onClick={this.handleClose} disabled={false} />
            </Col>
            <Col xs={6}>
              <ButtonOrderSubmit
                onClick={this.props.onSubmitOrder}
                disabled={false}
              />
            </Col>
          </Row> */}
          {this.renderStepActions(orderSubmitStep)}
        </Dialog>
      </div>
    )
  }
}

export default OrderRawDialog
