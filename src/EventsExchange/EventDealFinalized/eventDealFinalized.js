// Copyright 2016-2017 Gabriele Rigo

import Event from '../Event';

import React, { Component, PropTypes } from 'react';

export default class EventDealFinalized extends Component {
  static propTypes = {
    event: PropTypes.object
  }

  render () {
    const { event } = this.props;
    const { id, stable, leveraged, price } = event.params;

    return (
      <Event
        event={ event }
        //dealId = { id }
        //fromAddress={ leveraged }
        //dragoAddress={ stable }
        price={ price } />
    );
  }
}

//fromAddress hidden since stable and lev address 0x0000000 for some reason
