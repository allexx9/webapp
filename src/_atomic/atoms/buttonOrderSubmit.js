import React, { Component } from 'react';
import  * as Colors from 'material-ui/styles/colors'
import styles from './buttonOrderSubmit.module.css'
import FlatButton from 'material-ui/FlatButton'
import PropTypes from 'prop-types';

class ButtonOrderSubmit extends Component {

  static propTypes = {
    onSubmit: PropTypes.func,
  }

  render() {

    const buttonOrderSubmitStyle = {
      // border: "1px solid",
      // borderColor: Colors.blue500,
      // color: '#ffffff',
      // backgroundColor: Colors.blue500
      width: "200px"
    }

    return (
      <div className={styles.buttonContainer}>
        <FlatButton primary={true} label="Submit"
      labelStyle={{ fontWeight: 700, fontSize: '18px', color: '#ffffff' }}
      onClick={this.onSubmit}
      style={buttonOrderSubmitStyle}
      hoverColor={Colors.blue400}
      backgroundColor={Colors.blue500}
    />
    </div>
    )
  }
}

export default ButtonOrderSubmit