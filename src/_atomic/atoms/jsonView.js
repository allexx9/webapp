import PropTypes from 'prop-types'
import React, { PureComponent } from 'react'
import ReactJson from 'react-json-view'

class JsonView extends PureComponent {
  static propTypes = {
    orderJson: PropTypes.object.isRequired
  }

  render() {
    return (
      <div>
        <ReactJson
          src={this.props.orderJson}
          // style={{ padding: '5px' }}
          theme="summerfruit:inverted"
          indentWidth="2"
          collapsed="1"
          collapseStringsAfterLength={42}
          displayObjectSize={false}
          displayDataTypes={false}
        />
      </div>
    )
  }
}

export default JsonView
