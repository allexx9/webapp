import FlatButton from 'material-ui/FlatButton'
import PropTypes from 'prop-types'
import React, { Component } from 'react'
import styles from './buttonOrder.module.css'

class ButtonOrderCancel extends Component {
  static propTypes = {
    onClick: PropTypes.func,
    disabled: PropTypes.bool.isRequired,
    label: PropTypes.string
  }

  static defaultProps = {
    onClick: () => {},
    label: 'Cancel'
  }

  render() {
    const buttonOrderSubmitStyle = {
      width: '100%'
    }

    return this.props.disabled ? (
      <div className={styles.buttonContainer}>
        <FlatButton
          label={this.props.label}
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
          label={this.props.label}
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

export default ButtonOrderCancel
