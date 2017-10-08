// Copyright 2016-2017 Gabriele Rigo

import Event from '../Event';

import React, { Component, PropTypes } from 'react';

export default class EventDeposit extends Component {
  static propTypes = {
    event: PropTypes.object
  }

  render () {
    const { event } = this.props;
    const { exchange, token, user, amount, balance } = event.params;

    return (
      <Event
        event={ event }
        dragoAddress={ token }
        fromAddress={ user }
        ethvalue={ amount } />
    );
  }
}
