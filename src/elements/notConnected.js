import AlertWarning from 'material-ui/svg-icons/alert/warning'
import React, { Component } from 'react'
import  * as Colors from 'material-ui/styles/colors'
import { Row, Col } from 'react-flexbox-grid';
import {Card, CardHeader, CardTitle, CardText} from 'material-ui/Card';

import styles from './notConnected.module.css'
import PropTypes from 'prop-types';

var td = null

class NotConnected extends Component {

    constructor(props) {
        super(props);

      }

    state = {
      counter: 15
    }

    static propTypes = {
      isConnected: PropTypes.bool,
    };

    componentDidMount () {
      this.counter()
    }

    componentWillUnmount () {
      clearTimeout(td)
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
    
    render() {
      // console.log(this.props)
      return (
        <Row>
          <Col xs={12}>
            <Card>
              <CardTitle title={[<AlertWarning key={'notConnected'} color={Colors.red500} />,' Connection error.']} />
              <CardText>
                <p>Unable to connect to the network. Trying to establish a new connection in {this.state.counter} seconds... </p>
                <p>Please contact our support.</p>
              </CardText>
            </Card>
          </Col>
        </Row>
      )
    }
  }

  export default NotConnected