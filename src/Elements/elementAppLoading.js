import React, { Component } from 'react'
import { Row, Col } from 'react-flexbox-grid';
import BigNumber from 'bignumber.js';
import Dialog from 'material-ui/Dialog';
import { Link } from 'react-router-dom'

import styles from './elementAppLoading.module.css'
import PropTypes from 'prop-types';
import {APP, DS} from '../_utils/const.js'
import getMuiTheme from 'material-ui/styles/getMuiTheme';
import MuiThemeProvider from 'material-ui/styles/MuiThemeProvider';
import Loading from '../_atomic/atoms/loading';

var td = null

const muiTheme = getMuiTheme({
  palette: {
    "primary1Color": "#3F51B5",

  },
  appBar: {
    height: 45,
    fontSize: "20px !important"
  },
});

class AppLoading extends Component {

    state = {
      counter: 15
    }

    static contextTypes = {
      isSyncing: PropTypes.bool.isRequired,
      syncStatus: PropTypes.object.isRequired,
    };

    componentDidMount () {
      this.counter()
    }
   
    componentWillUnmount () {
      clearTimeout(td)
    }

    
    buildUrlPath = () => {
      var path = window.location.hash.split( '/' );
      // path.splice(-1,1);
      // var url = path.join('/');
      return path[2]
      }

    counter = () => {
      var x = this
      var { counter } = this.state;
      td = setTimeout(function() {
        if (counter > 0) {
          x.setState({ counter: counter - 1 })
          // console.log('timeout')
          x.counter()
        } else {
          x.setState({ counter: 15 })
          // console.log('reset')
          x.counter()
        }
      }, 1000);      
    }

    renderNotConnected = () => {
      return (
        <Dialog
          open={true}
          modal={true}
          title={this.renderTitle()}
        >
        
          <Row>
            <Col xs={12}>
              <Row>
                <Col xs={12}>
                  <h4 className={styles.warningText}>Loading</h4>
                  {/* <p>Unable to connect to the network.</p>
                  <p>Trying to establish a new connection in {this.state.counter} seconds... </p>
                  <p>Please contact our support or {<Link to={DS + APP + DS + this.buildUrlPath() + DS + "config"}>select</Link>} a different network.</p> */}
                <Loading />
                </Col>
              </Row>
            </Col>
          </Row>
          </Dialog>
      )
      
    }

    renderTitle = () =>{
      return (
      <Row className={styles.modalHeader}>
        <Col xs={12}>
          <Row className={styles.modalHeaderActions} middle="xs" center="xs">
            <Col xs>
            <img src="/img/rb_black.png" alt="logo" />
            
            </Col>
          </Row>
        </Col>
      </Row>
      )
    }
    
    render() {
      // console.log(this.props)
      // const { isSyncing, syncStatus} = this.context
      // console.log('Sync Status: ', syncStatus)
      // console.log('Syncing: ', isSyncing)
      // return isSyncing ? this.renderSyncing() : this.renderNotConnected()
      return (
        <MuiThemeProvider muiTheme={muiTheme}>
        {this.renderNotConnected()}
        </MuiThemeProvider>
      )
    }
  
  }

  export default AppLoading