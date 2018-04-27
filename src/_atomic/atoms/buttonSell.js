import React, { Component } from 'react';
import  * as Colors from 'material-ui/styles/colors'
import styles from './buyButton.module.css'
import FlatButton from 'material-ui/FlatButton'

class ButtonSell extends Component {

  render() {

    const buttonSellStyle = {
      border: "1px solid",
      borderColor: Colors.red200,
      // width: "140px"
    }

    return (
      <div className={styles.actionButton}><FlatButton primary={true} label="Sell"
      labelStyle={{ fontWeight: 700, fontSize: '18px', color: Colors.red500 }}
      onClick={this.buttonSellClick}
      style={buttonSellStyle}
      hoverColor={Colors.red50}
    /></div>
    )
  }
}

export default ButtonSell