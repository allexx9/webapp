// Copyright 2016-2017 Gabriele Rigo

import Event from '../Event';

import React, { Component, PropTypes } from 'react';

export default class EventOrderPlaced extends Component {
  static propTypes = {
    event: PropTypes.object
  }

  render () {
    const { event } = this.props;
    const { cfd, id, who, is_stable, adjustment, stake } = event.params;

    return (
      <Event
        event={ event }
        //dragoAddress={ who }
        fromAddress={ who }
        cfd={ cfd }
        dragoname={ is_stable } />
    );
  }
}

//the event has been removed from exchange and placed into derivative contract
