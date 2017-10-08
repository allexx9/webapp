// Copyright 2016-2017 Gabriele Rigo

import Event from '../Event';

import React, { Component, PropTypes } from 'react';

export default class EventSellDrago extends Component {
  static propTypes = {
    event: PropTypes.object
  }

  render () {
    const { event } = this.props;
    const { drago, from, to, amount, revenue } = event.params;

    return (
      <Event
        event={ event }
        fromAddress={ to }
        ethvalue={ revenue }
        value={ amount }
        dragoAddress={ drago } />
    );
  }
}
