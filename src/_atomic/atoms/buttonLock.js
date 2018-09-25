import * as Colors from 'material-ui/styles/colors'
import { height } from 'window-size'
import FlatButton from 'material-ui/FlatButton'
import PropTypes from 'prop-types'
import React, { Component } from 'react'

class ButtonLock extends Component {
  static propTypes = {
    onBuySell: PropTypes.func.isRequired,
    selected: PropTypes.bool,
    buttonAction: PropTypes.string.isRequired
  }

  static defaultProps = {
    selected: false
  }

  buttonBuyClick = () => {
    this.props.onBuySell('bids')
  }

  render() {
    const buttonBuyStyle = {
      border: '1px solid',
      borderColor: this.props.selected ? Colors.green400 : Colors.grey400,
      // backgroundColor: this.props.selected ? Colors.green400 : 'white',
      width: '100%',
      height: '24px',
      lineHeight: '24px'
    }

    const labelStyle = {
      fontWeight: 700,
      fontSize: '12px'
      // color: this.props.selected ? 'white' : Colors.grey400
    }

    return (
      <div>
        <FlatButton
          primary={true}
          label={this.props.buttonAction}
          labelStyle={labelStyle}
          onClick={this.buttonBuyClick}
          style={buttonBuyStyle}
          hoverColor={Colors.lightGreen50}
        />
      </div>
    )
  }
}

export default ButtonLock
