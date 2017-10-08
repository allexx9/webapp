// Copyright 2016-2017 Gabriele Rigo

import Event from '../Event';

import React, { Component, PropTypes } from 'react';

export default class EventRefund extends Component {
  static propTypes = {
    event: PropTypes.object
  }

  render () {
    const { event } = this.props;
    const { buyer, price, amount } = event.params;

    return (
      <Event
        event={ event }
        fromAddress={ buyer }
        value={ amount }
        price={ price } />
    );
  }
}
