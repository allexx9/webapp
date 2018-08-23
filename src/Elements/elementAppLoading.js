import React, { Component } from 'react'
import { Row, Col } from 'react-flexbox-grid';
import * as Colors from 'material-ui/styles/colors';
import styles from './elementAppLoading.module.css'
import PropTypes from 'prop-types';
import getMuiTheme from 'material-ui/styles/getMuiTheme';
import MuiThemeProvider from 'material-ui/styles/MuiThemeProvider';
import LinearProgress from 'material-ui/LinearProgress';

const muiTheme = getMuiTheme({
  palette: {
    "primary1Color": '#054186',

  },
  appBar: {
    height: 45,
    fontSize: "20px !important"
  },
});

class AppLoading extends Component {

  renderNotConnected = () => {
    return (
      <div className={styles.divFullHeight}>
        <Row className={styles.loadingDiv}>
          <Col xs={12}>
            <Row>
              <Col xs={12} style={{ textAlign: "center" }}>
                <img src="/img/rb-logo-final.png" className={styles.logoImg} />
                <LinearProgress mode="indeterminate" color={Colors.blueGrey900} />
                
              </Col>
            </Row>
          </Col>
        </Row>
      </div>
    )

  }

  render() {
    return (
      <MuiThemeProvider muiTheme={muiTheme}>
        {this.renderNotConnected()}
      </MuiThemeProvider>
    )
  }

}

export default AppLoading