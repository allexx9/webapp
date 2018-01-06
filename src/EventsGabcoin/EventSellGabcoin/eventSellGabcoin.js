// Copyright 2016-2017 Rigo Investment Sarl.

import Event from '../Event';

import React, { Component } from 'react';

// React.PropTypes is deprecated since React 15.5.0, use the npm module prop-types instead
import PropTypes from 'prop-types';

export default class EventSellGabcoin extends Component {
  static propTypes = {
    event: PropTypes.object
  }

  render () {
    const { event } = this.props;
    const { gabcoin, from, to, amount, revenue } = event.params;

    return (
      <Event
        event={ event }
        fromAddress={ to }
        ethvalue={ revenue }
        value={ amount }
        gabcoinAddress={ gabcoin } />
    );
  }
}
