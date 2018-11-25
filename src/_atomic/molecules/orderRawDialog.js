import PropTypes from 'prop-types'
import React, { PureComponent } from 'react'
// import { Row, Col } from 'react-flexbox-grid';
import { Col, Row } from 'react-flexbox-grid'
import BoxTitle from '../atoms/boxTitle'
import ButtonOrderCancel from '../atoms/buttonOrderCancel'
import ButtonOrderNext from '../atoms/buttonOrderNext'
import ButtonOrderSubmit from '../atoms/buttonOrderSubmit'
import Dialog from 'material-ui/Dialog'
import OrderStepper from './orderStepper'
import OrderSummary from '../molecules/orderSummary'

import styles from './orderRawDialog.module.css'

const customContentStyle = {
  height: '400px',
  width: '600px',
  wordWrap: 'break-word'
}

class OrderRawDialog extends PureComponent {
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

  handleClose = () => {
    this.props.onClose(false, true)
  }

  renderStepActions() {
    const { orderSubmitStep } = this.props
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
    const { order } = this.props
    return (
      <div>
        <Dialog
          title={<BoxTitle titleText={'CONFIRM ORDER'} />}
          modal={true}
          open={this.props.open}
          onRequestClose={this.handleClose}
          contentStyle={customContentStyle}
          autoDetectWindowHeight={true}
          autoScrollBodyContent={true}
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
          {this.renderStepActions()}
        </Dialog>
      </div>
    )
  }
}

export default OrderRawDialog
