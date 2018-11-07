import { Col, Row } from 'react-flexbox-grid'
import Checkbox from 'material-ui/Checkbox'
import PropTypes from 'prop-types'
import React, { Component } from 'react'
import ReactTooltip from 'react-tooltip'
import styles from './checkBoxQuickOrder.module.css'

class CheckBoxQuickOrder extends Component {
  static propTypes = {
    checked: PropTypes.bool.isRequired,
    onCheck: PropTypes.func.isRequired
  }

  static defaultProps = {}

  onCheck = (event, checked) => {
    console.log(checked)
    this.props.onCheck({ quickOrder: checked })
  }

  render() {
    return (
      <Row>
        <Col xs={6}>
          <div data-tip={'Sign and send without further confirmation'}>
            <Checkbox
              checked={this.props.checked}
              onCheck={this.onCheck}
              key="checkBoxQuickOrder"
              label="Quick order"
              iconStyle={{
                width: '18px',
                height: '18px',
                marginTop: '1px'
              }}
            />
            <ReactTooltip effect="solid" place="top" />
          </div>
        </Col>
      </Row>
    )
  }
}

export default CheckBoxQuickOrder
