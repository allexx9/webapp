import  * as Colors from 'material-ui/styles/colors'
import { Grid, Row, Col } from 'react-flexbox-grid'
import BigNumber from 'bignumber.js'
import Paper from 'material-ui/Paper';
import PropTypes from 'prop-types';
import React, { Component, PureComponent } from 'react'
import ReactDOM from 'react-dom'

import IdentityIcon from '../IdentityIcon';
import Loading from '../Loading'
import utils from '../utils/utils'

import styles from './pageNetworkConfig.module.css'
import Toggle from 'material-ui/Toggle';
import ElementBoxHeadTitle from '../Elements/elementBoxHeadTitle'
import RaisedButton from 'material-ui/RaisedButton';
import FlatButton from 'material-ui/FlatButton';
import checkAuth from '../Elements/checkAuth'



class PageNetworkConfig extends Component {

  constructor(props) {
    super(props);
    const endpoint = localStorage.getItem('endpoint')
    this.state = {
      network: {
        infura: (endpoint === 'infura') ? true : false,
        rigoblock: (endpoint === 'rigoblock' || endpoint === null) ? true : false,
        local: false,
      },
      save: true,
      snackBar: false,
      snackBarMsg: '',
    }
  }


  // Checking the type of the context variable that we receive by the parent
  static contextTypes = {
    api: PropTypes.object.isRequired,
  };

  static propTypes = {
      location: PropTypes.object.isRequired,
      ethBalance: PropTypes.object.isRequired,
      accounts: PropTypes.array.isRequired,
      accountsInfo: PropTypes.object.isRequired, 
      ethBalance: PropTypes.object.isRequired,
    };

    componentDidMount() {
    }

    componentWillUnmount() {
    }

    snackBar = (msg) =>{
      this.setState({
        snackBar: true,
        snackBarMsg: msg
      })
    }

    handlesnackBarRequestClose = () => {
      this.setState({
        snackBar: false,
        snackBarMsg: ''
      })
    }

    handleSetActive = (to) => {
    }


    componentDidUpdate(nextProps) {
    }

    onToggle = (event) =>{
      console.log(event)
      console.log(event.target.getAttribute('data-network'))
      const network = event.target.getAttribute('data-network')
      switch(network) {
        case "infura":
          localStorage.setItem('endpoint', 'infura')
          this.setState ({
            network: {
              infura: true,
              rigoblock: false,
              local: false
            },
            save: false
          }   
          )
          break;
        case "rigoblock":
          localStorage.setItem('endpoint', 'rigoblock')
          this.setState ({
            network: {
              infura: false,
              rigoblock: true,
              local: false
            },
            save: false
          }   
          )
          break;
        default:
            null
      } 
    }

    handleRefresh = () =>{
      window.location.reload(false)
    }

    render() {
      const { location, accounts, accountsInfo, allEvents } = this.props
      const { loading, network } = this.state 

      const stylesToggle = {
        block: {
          maxWidth: 250,
        },
        toggle: {
          marginBottom: 16,
        },
        thumbOff: {
          backgroundColor: '#ffcccc',
        },
        trackOff: {
          backgroundColor: '#ff9d9d',
        },
        thumbSwitched: {
          backgroundColor: 'red',
        },
        trackSwitched: {
          backgroundColor: '#ff9d9d',
        },
        labelStyle: {
          color: 'red',
        },
      };

      return (
      <div className={styles.boxContainer}>
        <Row>
          <Col xs={12}>
            <ElementBoxHeadTitle primaryText="Endpoint" />
          </Col>
          <Col xs={12}>
            <Paper className={styles.paperContainer} zDepth={1}>
              <p>Please select your preferred access point to the blockchain.</p>
              <p>RigoBlock and Infura provide secure, reliable, and scalable access to Ethereum.</p>
              <p>RigoBlock protocol is currently deployed on <b>Kovan</b> network only.</p>
              <p>&nbsp;</p>
              <div style={stylesToggle.block}>
                <Toggle
                  label="Infura"
                  style={stylesToggle.toggle}
                  onToggle={this.onToggle}
                  data-network="infura"
                  toggled={network.infura}
                />
                <Toggle
                  label="RigoBlock"
                  onToggle={this.onToggle}
                  data-network="rigoblock"
                  style={stylesToggle.toggle}
                  toggled={network.rigoblock}
                />
                <Toggle
                  label="Local"
                  style={stylesToggle.toggle}
                  toggled={network.local}
                  disabled={true}
                />
                {/* <Toggle
                  label="Styling"
                  thumbStyle={stylesToggle.thumbOff}
                  trackStyle={stylesToggle.trackOff}
                  thumbSwitchedStyle={stylesToggle.thumbSwitched}
                  trackSwitchedStyle={stylesToggle.trackSwitched}
                  labelStyle={stylesToggle.labelStyle}
                /> */}
              </div>
              <Row>
                <Col xs={12}>
                <p>You need to refresh you browser to save and make this setting active. Please proceed:</p>
                </Col>
                <Col xs={12}>
                  <RaisedButton label="Refresh" 
                  primary={true} 
                  disabled={this.state.save} 
                  onClick={this.handleRefresh}/>
                </Col>
              </Row>
            </Paper>
          </Col>
        </Row>  
      </div> 
      )
    }
  }

  export default PageNetworkConfig