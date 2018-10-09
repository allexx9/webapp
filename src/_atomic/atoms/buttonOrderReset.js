import FlatButton from 'material-ui/FlatButton'
import PropTypes from 'prop-types'
import React, { Component } from 'react'
import styles from './buttonOrder.module.css'

class ButtonOrderReset extends Component {
  static propTypes = {
    onClick: PropTypes.func.isRequired,
    disabled: PropTypes.bool.isRequired
  }

  render() {
    const buttonOrderSubmitStyle = {
      width: '100%'
    }

    return this.props.disabled ? (
      <div className={styles.buttonContainer}>
        <FlatButton
          label="Reset"
          labelStyle={{ fontWeight: 700, fontSize: '18px' }}
          onClick={this.props.onClick}
          style={buttonOrderSubmitStyle}
          disabled={this.props.disabled}
        />
      </div>
    ) : (
      <div className={styles.buttonContainer}>
        <FlatButton
          primary={true}
          label="Reset"
          labelStyle={{ fontWeight: 700, fontSize: '18px' }}
          onClick={this.props.onClick}
          style={buttonOrderSubmitStyle}
          // hoverColor={Colors.blue400}
          // backgroundColor={'#054186'}
        />
      </div>
    )
  }
}

export default ButtonOrderReset
