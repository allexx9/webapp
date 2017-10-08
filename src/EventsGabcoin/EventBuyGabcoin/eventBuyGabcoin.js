// Copyright 2016-2017 Gabriele Rigo

import Event from '../Event';

import React, { Component, PropTypes } from 'react';

export default class EventBuyGabcoin extends Component {
  static propTypes = {
    event: PropTypes.object
  }

  render () {
    const { event } = this.props;
    const { gabcoin, from, to, amount, revenue } = event.params;

    return (
      <Event
        event={ event }
        fromAddress={ from }
        gabcoinAddress={ gabcoin }
        ethvalue={ amount }
        //price={ revenue }
        value={ revenue } />
    );
  }
}
