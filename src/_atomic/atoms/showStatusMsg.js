import Close from 'material-ui/svg-icons/navigation/close'
import PropTypes from 'prop-types'
import React, { PureComponent } from 'react'
import classNames from 'classnames'
import styles from './showStatusMsg.module.css'

class ShowStatusMsg extends PureComponent {
  static propTypes = {
    msg: PropTypes.string.isRequired,
    status: PropTypes.string.isRequired,
    onClose: PropTypes.func.isRequired
  }

  render() {
    switch (this.props.status) {
      case 'warning':
        return (
          <div className={classNames([styles.authMsg, styles.warning])}>
            <div>{this.props.msg}</div>
            <div className={styles.closeButton}>
              <Close
                style={{ height: 20, width: 20 }}
                onClick={this.props.onClose}
              />
            </div>
          </div>
        )
      default:
        return <div />
    }
  }
}
export default ShowStatusMsg
