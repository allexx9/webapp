import React, { Component } from 'react';
import  * as Colors from 'material-ui/styles/colors'
import styles from './buyButton.module.css'
import FlatButton from 'material-ui/FlatButton'

class ButtonBuy extends Component {

  render() {

    const buttonBuyStyle = {
      border: "1px solid",
      borderColor: Colors.green200,
      // width: "140px"
    }

    return (
      <div><FlatButton primary={true} label="Buy"
      labelStyle={{ fontWeight: 700, fontSize: '18px', color: Colors.green500 }}
      onClick={this.buttonBuyClick}
      style={buttonBuyStyle}
      hoverColor={Colors.lightGreen50}
    /></div>
    )
  }
}

export default ButtonBuy