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
    const orderJson = {
      maker: '0x22e8c59b5855aed91411d17ba7092e17effc5340',
      taker: '0x9faf5515f177f3a8a845d48c19032b33cc54c09c',
      feeRecipient: '0x9faf5515f177f3a8a845d48c19032b33cc54c09c',
      makerTokenAddress: '0x83e42e6d1ac009285376340ef64bac1c7d106c89',
      takerTokenAddress: '0x965808e7f815cfffd4c018ef2ba4c5a65eba087e',
      exchangeContractAddress: '0x67799a5e640bc64ca24d3e6813842754e546d7b1',
      salt:
        '8805889578606483001086219065149877915227047613753919788777666024611101142575',
      makerFee: '0',
      takerFee: '0',
      makerTokenAmount: '280000000',
      takerTokenAmount: '1000000000000000000',
      expirationUnixTimestampSec: '1538692489',
      ecSignature: {
        v: 27,
        r: '0x10a8e8262e970ef19b4218022dea655d5b550d640f3ccd41997ed3fde35715cc',
        s: '0x1ef3676736b71bfd4e43991299d5891faf8cea2888e1c5fc6797b66d00db2337'
      }
    }

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
