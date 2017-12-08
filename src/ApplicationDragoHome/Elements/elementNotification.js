import React, { Component } from 'react';

import {List, ListItem} from 'material-ui/List';
import Subheader from 'material-ui/Subheader';
import Avatar from 'material-ui/Avatar';
import styles from './elementNotification.module.css';

import PropTypes from 'prop-types';


export default class ElementNotification extends Component {

  static propTypes = {
    // accountName: PropTypes.string.isRequired,
    primaryText: PropTypes.string.isRequired,
    secondaryText: PropTypes.string.isRequired,
    eventType: PropTypes.string.isRequired
  };


  render () {
    const { primaryText, secondaryText, eventType } = this.props
    return (
      <List>
        <ListItem
          disabled={true}
          primaryText={primaryText}
          secondaryText={secondaryText}
          leftAvatar={<Avatar src="img/ETH.svg" />}
        />
      </List>
    );
  }
}