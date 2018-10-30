import PropTypes from 'prop-types'
import React, { Component } from 'react'
// import { Row, Col } from 'react-flexbox-grid';
import { Col, Row } from 'react-flexbox-grid'
import BoxTitle from '../atoms/boxTitle'
import ButtonOrderCancel from '../atoms/buttonOrderCancel'
import ButtonOrderSubmit from '../atoms/buttonOrderSubmit'
import Dialog from 'material-ui/Dialog'
import OrderJsonView from './orderJsonView'
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
    open: PropTypes.bool.isRequired
  }

  shouldComponentUpdate(nextProps, nextState) {
    let propsUpdate = utils.shallowEqual(this.props, nextProps)
    return propsUpdate
  }

  handleClose = () => {
    this.props.onClose(false)
  }

  render() {
    const { order } = this.props
    return (
      <div>
        {/* <RaisedButton label="Alert" onClick={this.handleOpen} /> */}
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

          <div className={styles.orderContainer}>
            <OrderJsonView orderJson={this.props.efxOrder} />
          </div>
          <Row center="xs">
            <Col xs={6}>
              <ButtonOrderCancel
                onCancelOrder={this.handleClose}
                disabled={false}
              />
            </Col>
            <Col xs={6}>
              <ButtonOrderSubmit
                onClick={this.props.onSubmitOrder}
                disabled={false}
              />
            </Col>
          </Row>
          {/* <div>{JSON.stringify(this.props.order, null, 4)}</div> */}
        </Dialog>
      </div>
    )
  }
}

export default OrderRawDialog
