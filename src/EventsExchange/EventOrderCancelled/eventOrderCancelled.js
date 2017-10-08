// Copyright 2016-2017 Gabriele Rigo

import Event from '../Event';

import React, { Component, PropTypes } from 'react';

export default class EventOrderCancelled extends Component {
  static propTypes = {
    event: PropTypes.object
  }

  render () {
    const { event } = this.props;
    const { id, who, stake } = event.params;

    return (
      <Event
        event={ event }
        fromAddress={ who }
        dragoAddress={ id }
        dragoname={ stake } />
    );
  }
}
