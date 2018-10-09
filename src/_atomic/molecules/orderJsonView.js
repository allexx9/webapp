import { Card, CardHeader, CardText } from 'material-ui/Card'
import JsonView from '../atoms/jsonView'
import PropTypes from 'prop-types'
import React, { Component } from 'react'

import styles from './orderJsonView.module.css'
import utils from '../../_utils/utils'

class OrderJsonView extends Component {
  static propTypes = {
    orderJson: PropTypes.object
  }

  shouldComponentUpdate(nextProps, nextState) {
    let propsUpdate = utils.shallowEqual(this.props, nextProps)
    return propsUpdate
  }

  render() {
    return (
      <Card>
        <CardHeader
          title="ORDER DETAILS"
          actAsExpander={true}
          showExpandableButton={true}
        />
        <CardText expandable={true}>
          <div className={styles.orderContainer}>
            <JsonView orderJson={this.props.orderJson} />
          </div>
        </CardText>
      </Card>
    )
  }
}

export default OrderJsonView
