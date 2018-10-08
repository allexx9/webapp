import { Card, CardHeader, CardText } from 'material-ui/Card'
import JsonView from '../atoms/jsonView'
import PropTypes from 'prop-types'
import React, { PureComponent } from 'react'
import utils from '../../_utils/utils'

class OrderJsonView extends PureComponent {
  static propTypes = {
    orderJson: PropTypes.object.isRequired
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
          <JsonView orderJson={this.props.orderJson} />
        </CardText>
      </Card>
    )
  }
}

export default OrderJsonView
