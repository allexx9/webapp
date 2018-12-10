import PropTypes from 'prop-types'
import React from 'react'

class JoyrideContent extends React.Component {
  static propTypes = {
    content: PropTypes.string.isRequired
  }

  static defaultProps = {
    content: ''
  }

  render() {
    return (
      <div>
        <b>{this.props.content}</b>
      </div>
    )
  }
}

export default JoyrideContent
