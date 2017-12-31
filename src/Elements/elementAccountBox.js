import { Grid, Row, Col } from 'react-flexbox-grid'
import {Card, CardHeader, CardText} from 'material-ui/Card'
import Avatar from 'material-ui/Avatar'
import Chip from 'material-ui/Chip'
import PropTypes from 'prop-types';
import React, { Component } from 'react';
import ReactDOM from 'react-dom'

import IdentityIcon from '../IdentityIcon';

import styles from './elementAccountBox.module.css'

class ElementAccountBox extends Component {

  static propTypes = {
    account: PropTypes.object.isRequired
  };

  render() {
    const {account} = this.props;
    return (    
      <Col xs={6}>
      <Card>
        <Row between="xs">
          <Col xs >
            <CardHeader
              title={account.name}
              subtitle={account.address}
              subtitleStyle={{ fontSize: 12 }}
              avatar={<IdentityIcon address={account.address} />}
            />
            <CardText>
              <Row middle="xs" between="xs">
                <Col xs >
                  <Chip className={styles.accountChip}>
                    <Avatar size={32}>W</Avatar>
                    {account.source}
                  </Chip>
                </Col>
                <Col xs between="xs" className={styles.accountAmount}>
                  ETH {account.ethBalance}
                </Col>
              </Row>
            </CardText>
          </Col>
        </Row>
      </Card>
    </Col>
    )
    
  }
}

export default ElementAccountBox