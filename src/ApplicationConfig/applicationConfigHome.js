import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { Route, withRouter, Switch, Redirect } from 'react-router-dom'
import PageNetworkConfig from './pageNetworkConfig'
import { Row, Col } from 'react-flexbox-grid';
import LeftSideDrawerConfig from '../Elements/leftSideDrawerConfig';

class ApplicationConfigHome extends Component {

    static propTypes = {
      location: PropTypes.object.isRequired,
      match: PropTypes.object.isRequired,
      isManager: PropTypes.bool.isRequired
    };


    render() {
      const { match} = this.props;
      return (
        <Row>
        <Col xs={2}>
        <LeftSideDrawerConfig location={this.props.location}/>
        </Col>
        <Col xs={10}>
        <Switch>
          <Route path={match.path+"/network"} 
              render={(props) => <PageNetworkConfig {...props} />
              } 
          />
          <Redirect from={match.path} to={match.path+"/network"}  />
        </Switch>
        </Col>
      </Row>

      );
    }
  }

  export default withRouter(ApplicationConfigHome)

