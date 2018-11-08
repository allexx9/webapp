import PropTypes from 'prop-types'
import React, { Component } from 'react'
import classNames from 'classnames'
import styles from './showStatusMsg.module.css'

class ShowStatusMsg extends Component {
  static propTypes = {
    msg: PropTypes.string.isRequired,
    status: PropTypes.string.isRequired
  }

  render() {
    switch (this.props.status) {
      case 'warning':
        return (
          <div className={classNames([styles.authMsg, styles.warning])}>
            {this.props.msg}
          </div>
        )
      default:
        return <div />
    }
  }
}
export default ShowStatusMsg
